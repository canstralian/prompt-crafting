#!/usr/bin/env python3
"""Ralph: the six agents.

Each agent is standalone — no agent imports another. They share only
the data contracts in ralph_models. Every agent exposes:

    class FooAgent:
        name: AgentName
        def run(self, state: PRState, memory: RalphMemory) -> AgentResult

The orchestrator composes them. Hard stops in GovernanceSentinel
cannot be overridden by any downstream agent.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import PurePosixPath
from typing import Iterable

from ralph_models import (
    AgentName,
    AgentResult,
    Finding,
    PRClass,
    PRState,
    RalphMemory,
    ReviewThread,
    RiskTier,
    RunStatus,
    Severity,
    ThreadCluster,
    _tokenise,
)


# ---------------------------------------------------------------------------
# 1. TriageAgent — classify a PR into one PRClass and normalise labels
# ---------------------------------------------------------------------------


_DOCS_GLOBS = (
    "README", "CHANGELOG", "LICENSE", "docs/", ".md",
)
_WORKFLOW_GLOBS = (
    ".github/workflows/", ".pre-commit-config",
    "Dockerfile", "docker-compose",
)
_INFRA_GLOBS = (
    ".tf", "wrangler.toml", "supabase/",
    "alembic.ini", "migrations/", "cargo.toml",
)
_CONTRACT_GLOBS = (
    "shared/schema", "schemas/", "openapi", "schema.prisma",
)
_PY_SUFFIXES = (".py",)
_TS_SUFFIXES = (".ts", ".tsx", ".js", ".jsx")
_TEST_MARKERS = (".test.", ".spec.", "tests/", "/test/")


def _file_class(path: str) -> PRClass:
    p = path.lower()
    pp = PurePosixPath(p)
    if any(m in p for m in _TEST_MARKERS):
        # Tests count as the runtime language they're written in,
        # but the orchestrator treats tests-only PRs separately via
        # metadata; classification stays runtime to keep one class.
        if pp.suffix in _PY_SUFFIXES:
            return PRClass.RUNTIME_PY
        if pp.suffix in _TS_SUFFIXES:
            return PRClass.RUNTIME_TS
    if any(g in p for g in _DOCS_GLOBS) and pp.suffix == ".md":
        return PRClass.DOCS
    if any(g in p for g in _WORKFLOW_GLOBS):
        return PRClass.WORKFLOW
    if any(g in p for g in _CONTRACT_GLOBS):
        return PRClass.CONTRACT
    if any(g in p for g in _INFRA_GLOBS):
        return PRClass.INFRA
    if pp.suffix in _PY_SUFFIXES:
        return PRClass.RUNTIME_PY
    if pp.suffix in _TS_SUFFIXES:
        return PRClass.RUNTIME_TS
    if pp.suffix == ".md":
        return PRClass.DOCS
    return PRClass.MIXED


class TriageAgent:
    name = AgentName.TRIAGE

    def run(self, state: PRState, memory: RalphMemory) -> AgentResult:
        if not state.changed_files:
            return AgentResult(
                agent=self.name,
                status=RunStatus.SKIP,
                metadata={"pr_class": PRClass.DOCS.value, "reason": "empty"},
            )
        classes = [_file_class(f) for f in state.changed_files]
        unique = sorted({c for c in classes})
        if len(unique) == 1:
            pr_class = unique[0]
        elif PRClass.CONTRACT in unique or PRClass.WORKFLOW in unique:
            # Promote to the most risk-sensitive class present.
            pr_class = (
                PRClass.CONTRACT
                if PRClass.CONTRACT in unique
                else PRClass.WORKFLOW
            )
        else:
            pr_class = PRClass.MIXED

        findings: list[Finding] = []
        if state.total_loc > 1000:
            findings.append(
                Finding(
                    agent=self.name,
                    severity=Severity.MEDIUM,
                    message=(
                        f"Large diff ({state.total_loc} LOC). Consider "
                        "splitting before reviewer dispatch."
                    ),
                )
            )

        return AgentResult(
            agent=self.name,
            status=RunStatus.OK,
            findings=findings,
            metadata={
                "pr_class": pr_class.value,
                "file_classes": [c.value for c in classes],
                "unique_classes": [c.value for c in unique],
                "loc": state.total_loc,
            },
        )


# ---------------------------------------------------------------------------
# 2. GovernanceSentinel — risk scoring + non-overrideable hard stops
# ---------------------------------------------------------------------------


# Compiled once. Each pattern is paired with a Severity and a short id.
_SECRET_PATTERNS: tuple[tuple[str, re.Pattern[str], Severity], ...] = (
    (
        "aws-akid",
        re.compile(r"\bAKIA[0-9A-Z]{16}\b"),
        Severity.CRITICAL,
    ),
    (
        "github-pat",
        re.compile(r"\bghp_[A-Za-z0-9]{36}\b"),
        Severity.CRITICAL,
    ),
    (
        "github-oauth",
        re.compile(r"\bgho_[A-Za-z0-9]{36}\b"),
        Severity.CRITICAL,
    ),
    (
        "slack-token",
        re.compile(r"\bxox[abprs]-[A-Za-z0-9-]{10,}\b"),
        Severity.CRITICAL,
    ),
    (
        "openai-key",
        re.compile(r"\bsk-[A-Za-z0-9]{32,}\b"),
        Severity.CRITICAL,
    ),
    (
        "anthropic-key",
        re.compile(r"\bsk-ant-[A-Za-z0-9-]{32,}\b"),
        Severity.CRITICAL,
    ),
    (
        "private-key-block",
        re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"),
        Severity.CRITICAL,
    ),
    (
        "generic-secret-kv",
        re.compile(
            r"(?:password|secret|api[_-]?key|token)\s*[:=]\s*"
            r"[\"'][A-Za-z0-9_\-]{12,}[\"']",
            re.IGNORECASE,
        ),
        Severity.HIGH,
    ),
)


_SECRET_FILE_GLOBS = (
    ".env", ".pem", ".key", "credentials", "secrets",
)


@dataclass
class _RiskInput:
    pr_class: PRClass
    loc: int
    age_days: float
    unresolved_threads: int
    secret_hits: int
    is_draft: bool


class GovernanceSentinel:
    name = AgentName.SENTINEL

    def run(self, state: PRState, memory: RalphMemory) -> AgentResult:
        findings: list[Finding] = []
        secret_hits = 0

        # Hard stop #1: secret-adjacent files in the diff.
        for path in state.changed_files:
            low = path.lower()
            if any(g in low for g in _SECRET_FILE_GLOBS):
                findings.append(
                    Finding(
                        agent=self.name,
                        severity=Severity.HIGH,
                        message=(
                            f"Secret-adjacent path in diff: {path}. "
                            "Human review required."
                        ),
                        path=path,
                        rule_id="secret-adjacent-path",
                    )
                )

        # Hard stop #2: secret patterns in the PR title or body.
        # (We do NOT scan file contents here — that's CI's job. We scan
        # what we can see from the PR metadata, which is what gets
        # echoed in audit logs.)
        for haystack, src in (
            (state.title, "title"),
            (state.body, "body"),
        ):
            for rule_id, pat, sev in _SECRET_PATTERNS:
                if pat.search(haystack):
                    secret_hits += 1
                    findings.append(
                        Finding(
                            agent=self.name,
                            severity=sev,
                            message=(
                                f"Secret-like pattern '{rule_id}' "
                                f"found in PR {src}. Rotate immediately."
                            ),
                            rule_id=rule_id,
                        )
                    )

        # Risk score in [0, 1].
        risk = self._score(
            _RiskInput(
                pr_class=_resolve_pr_class(state, memory),
                loc=state.total_loc,
                age_days=state.age_days,
                unresolved_threads=len(state.unresolved_threads),
                secret_hits=secret_hits,
                is_draft=state.is_draft,
            )
        )
        tier = self._tier(risk, has_hard_stop=secret_hits > 0 or any(
            f.rule_id == "secret-adjacent-path" for f in findings
        ))

        status = (
            RunStatus.BLOCK
            if tier is RiskTier.BLOCK
            else RunStatus.OK
        )
        return AgentResult(
            agent=self.name,
            status=status,
            findings=findings,
            metadata={
                "risk": round(risk, 3),
                "tier": tier.value,
                "secret_hits": secret_hits,
            },
        )

    @staticmethod
    def _score(inp: _RiskInput) -> float:
        score = 0.0
        if inp.pr_class is PRClass.WORKFLOW:
            score += 0.45
        elif inp.pr_class is PRClass.CONTRACT:
            score += 0.4
        elif inp.pr_class is PRClass.INFRA:
            score += 0.3
        elif inp.pr_class is PRClass.RUNTIME_PY:
            score += 0.2
        elif inp.pr_class is PRClass.RUNTIME_TS:
            score += 0.2
        elif inp.pr_class is PRClass.MIXED:
            score += 0.25
        else:  # DOCS
            score += 0.05

        if inp.loc > 2000:
            score += 0.2
        elif inp.loc > 500:
            score += 0.1

        if inp.age_days > 14:
            score += 0.1
        elif inp.age_days > 30:
            score += 0.2

        if inp.unresolved_threads >= 8:
            score += 0.15
        elif inp.unresolved_threads >= 3:
            score += 0.05

        if inp.secret_hits > 0:
            score = 1.0

        if inp.is_draft:
            score *= 0.75

        return max(0.0, min(1.0, score))

    @staticmethod
    def _tier(risk: float, has_hard_stop: bool) -> RiskTier:
        if has_hard_stop or risk >= 0.85:
            return RiskTier.BLOCK
        if risk >= 0.6:
            return RiskTier.HIGH
        if risk >= 0.3:
            return RiskTier.MEDIUM
        return RiskTier.LOW


def _resolve_pr_class(
    state: PRState, memory: RalphMemory
) -> PRClass:
    """Look up the most recent TriageAgent classification, fall back."""

    for entry in reversed(list(memory.find(pr_number=state.number))):
        if entry.payload.get("agent") == AgentName.TRIAGE.value:
            val = (
                entry.payload.get("result", {}).get("metadata", {}).get(
                    "pr_class"
                )
            )
            if val:
                try:
                    return PRClass(val)
                except ValueError:
                    pass
    # Triage runs before sentinel, so this only fires for the very
    # first sentinel run on a brand-new PR. Best effort:
    if not state.changed_files:
        return PRClass.DOCS
    return _file_class(state.changed_files[0])


# ---------------------------------------------------------------------------
# 3. ConvergenceLoop — bounded deterministic repair
# ---------------------------------------------------------------------------


MAX_CONVERGENCE_ATTEMPTS = 3


class ConvergenceLoop:
    name = AgentName.CONVERGENCE

    def run(self, state: PRState, memory: RalphMemory) -> AgentResult:
        prior = memory.count_convergence_attempts(state.number)
        if state.all_checks_green:
            return AgentResult(
                agent=self.name,
                status=RunStatus.OK,
                metadata={
                    "attempt": prior + 1,
                    "checks_green": True,
                    "action": "no-op",
                },
            )

        if prior >= MAX_CONVERGENCE_ATTEMPTS:
            return AgentResult(
                agent=self.name,
                status=RunStatus.ESCALATE,
                findings=[
                    Finding(
                        agent=self.name,
                        severity=Severity.HIGH,
                        message=(
                            f"PR #{state.number} has exhausted "
                            f"{MAX_CONVERGENCE_ATTEMPTS} convergence "
                            "attempts. Escalating to human review."
                        ),
                        rule_id="convergence-exhausted",
                    )
                ],
                metadata={
                    "attempt": prior + 1,
                    "checks_green": False,
                    "action": "escalate",
                },
            )

        failing = sorted(
            [
                name
                for name, conc in state.check_states.items()
                if conc.upper() not in ("SUCCESS", "PENDING", "NEUTRAL", "SKIPPED")
            ]
        )
        plan = _repair_plan(failing)
        return AgentResult(
            agent=self.name,
            status=RunStatus.OK,
            findings=[
                Finding(
                    agent=self.name,
                    severity=Severity.MEDIUM,
                    message=(
                        f"Attempt {prior + 1}/{MAX_CONVERGENCE_ATTEMPTS}: "
                        f"failing checks: {', '.join(failing) or 'unknown'}."
                    ),
                    rule_id="convergence-attempt",
                )
            ],
            metadata={
                "attempt": prior + 1,
                "checks_green": False,
                "failing_checks": failing,
                "repair_plan": plan,
                "action": "retry",
            },
        )


def _repair_plan(failing_checks: list[str]) -> list[str]:
    plan: list[str] = []
    for name in failing_checks:
        n = name.lower()
        if "lint" in n:
            plan.append(f"re-run linter and auto-fix where possible ({name})")
        elif "type" in n or "tsc" in n or "mypy" in n:
            plan.append(f"surface type errors and patch annotations ({name})")
        elif "test" in n:
            plan.append(f"re-run flaky tests; if persistent, file issue ({name})")
        elif "build" in n:
            plan.append(f"rebuild from clean cache ({name})")
        elif "security" in n or "semgrep" in n or "codeql" in n:
            plan.append(f"triage security findings (no auto-fix) ({name})")
        else:
            plan.append(f"manual investigation required ({name})")
    return plan


# ---------------------------------------------------------------------------
# 4. ReviewDebtCompressor — cluster N threads into M deduped clusters
# ---------------------------------------------------------------------------


JACCARD_MERGE_THRESHOLD = 0.55


class ReviewDebtCompressor:
    name = AgentName.COMPRESSOR

    def run(self, state: PRState, memory: RalphMemory) -> AgentResult:
        threads = state.unresolved_threads
        if not threads:
            return AgentResult(
                agent=self.name,
                status=RunStatus.SKIP,
                metadata={"threads_in": 0, "clusters_out": 0},
            )
        clusters = _cluster_threads(threads)
        return AgentResult(
            agent=self.name,
            status=RunStatus.OK,
            metadata={
                "threads_in": len(threads),
                "clusters_out": len(clusters),
                "compression_ratio": round(
                    len(clusters) / max(1, len(threads)), 3
                ),
                "clusters": [c.as_dict() for c in clusters],
            },
        )


def _cluster_threads(threads: list[ReviewThread]) -> list[ThreadCluster]:
    """Greedy Jaccard clustering on tokenised thread bodies."""

    clusters: list[list[ReviewThread]] = []
    sigs: list[set[str]] = []
    for t in threads:
        toks = t.tokens()
        placed = False
        for i, sig in enumerate(sigs):
            j = _jaccard(toks, sig)
            if j >= JACCARD_MERGE_THRESHOLD:
                clusters[i].append(t)
                sigs[i] = sig | toks
                placed = True
                break
        if not placed:
            clusters.append([t])
            sigs.append(toks)
    out: list[ThreadCluster] = []
    for group in clusters:
        rep = group[0]
        summary = _summarise(rep.body)
        # Confidence = average pairwise jaccard within the cluster.
        if len(group) == 1:
            conf = 1.0
        else:
            pairs = []
            for i in range(len(group)):
                for j in range(i + 1, len(group)):
                    pairs.append(
                        _jaccard(group[i].tokens(), group[j].tokens())
                    )
            conf = sum(pairs) / len(pairs) if pairs else 1.0
        out.append(
            ThreadCluster(
                representative_id=rep.thread_id,
                member_ids=[t.thread_id for t in group],
                summary=summary,
                confidence=conf,
            )
        )
    return out


def _jaccard(a: set[str], b: set[str]) -> float:
    if not a and not b:
        return 1.0
    inter = a & b
    union = a | b
    return len(inter) / max(1, len(union))


def _summarise(body: str, max_chars: int = 140) -> str:
    line = " ".join(body.split())
    if len(line) <= max_chars:
        return line
    return line[: max_chars - 1] + "…"


# ---------------------------------------------------------------------------
# 5. InlineThreadResolver — per-thread reply strategy
# ---------------------------------------------------------------------------


@dataclass
class ThreadAction:
    thread_id: str
    strategy: str
    reply: str

    def as_dict(self) -> dict[str, object]:
        return {
            "thread_id": self.thread_id,
            "strategy": self.strategy,
            "reply": self.reply,
        }


_RESOLVED_PHRASES = (
    "lgtm", "approved", "ok thanks", "ack",
)
_QUESTION_MARKERS = ("?",)
_NIT_MARKERS = ("nit:", "nitpick", "style:")


class InlineThreadResolver:
    name = AgentName.INLINE

    def run(self, state: PRState, memory: RalphMemory) -> AgentResult:
        actions: list[ThreadAction] = []
        findings: list[Finding] = []
        for t in state.unresolved_threads:
            body_l = t.body.lower()
            if any(p in body_l for p in _RESOLVED_PHRASES):
                strategy = "resolve-acknowledged"
                reply = (
                    "Marking this thread as acknowledged based on the "
                    "approving language above."
                )
            elif any(m in body_l for m in _NIT_MARKERS):
                strategy = "defer-nit"
                reply = (
                    "Captured as a nit — tracked in the backlog, not "
                    "blocking this PR."
                )
            elif any(q in t.body for q in _QUESTION_MARKERS):
                strategy = "answer-question"
                reply = (
                    "Question received. Will respond with evidence in "
                    "a follow-up commit or comment."
                )
                findings.append(
                    Finding(
                        agent=self.name,
                        severity=Severity.LOW,
                        message=(
                            f"Open question in thread {t.thread_id} "
                            "needs an evidence-backed reply."
                        ),
                        path=t.path,
                        line=t.line,
                        rule_id="open-question",
                    )
                )
            else:
                strategy = "human-escalate"
                reply = (
                    "Routing this comment to a human reviewer — the "
                    "automated resolver cannot infer a confident reply."
                )
                findings.append(
                    Finding(
                        agent=self.name,
                        severity=Severity.MEDIUM,
                        message=(
                            f"Thread {t.thread_id} needs human review."
                        ),
                        path=t.path,
                        line=t.line,
                        rule_id="needs-human",
                    )
                )
            actions.append(
                ThreadAction(
                    thread_id=t.thread_id,
                    strategy=strategy,
                    reply=reply,
                )
            )
        return AgentResult(
            agent=self.name,
            status=RunStatus.OK,
            findings=findings,
            metadata={
                "threads": len(state.unresolved_threads),
                "actions": [a.as_dict() for a in actions],
            },
        )


# ---------------------------------------------------------------------------
# 6. BackpressureGovernor — enforce ceilings
# ---------------------------------------------------------------------------


LOC_CEILING = 2500
AGE_CEILING_DAYS = 30.0
THREAD_CEILING = 25


class BackpressureGovernor:
    name = AgentName.BACKPRESSURE

    def run(self, state: PRState, memory: RalphMemory) -> AgentResult:
        findings: list[Finding] = []
        if state.total_loc > LOC_CEILING:
            findings.append(
                Finding(
                    agent=self.name,
                    severity=Severity.HIGH,
                    message=(
                        f"LOC ceiling exceeded: {state.total_loc} > "
                        f"{LOC_CEILING}. Split this PR."
                    ),
                    rule_id="loc-ceiling",
                )
            )
        if state.age_days > AGE_CEILING_DAYS:
            findings.append(
                Finding(
                    agent=self.name,
                    severity=Severity.MEDIUM,
                    message=(
                        f"Age ceiling exceeded: {state.age_days:.1f}d > "
                        f"{AGE_CEILING_DAYS:.0f}d. Rebase or close."
                    ),
                    rule_id="age-ceiling",
                )
            )
        if len(state.unresolved_threads) > THREAD_CEILING:
            findings.append(
                Finding(
                    agent=self.name,
                    severity=Severity.MEDIUM,
                    message=(
                        f"Thread ceiling exceeded: "
                        f"{len(state.unresolved_threads)} > "
                        f"{THREAD_CEILING}. Compressor will dedupe but "
                        "consider closing & re-opening."
                    ),
                    rule_id="thread-ceiling",
                )
            )
        status = RunStatus.OK if not findings else RunStatus.ESCALATE
        return AgentResult(
            agent=self.name,
            status=status,
            findings=findings,
            metadata={
                "loc": state.total_loc,
                "age_days": state.age_days,
                "unresolved_threads": len(state.unresolved_threads),
                "ceilings": {
                    "loc": LOC_CEILING,
                    "age_days": AGE_CEILING_DAYS,
                    "threads": THREAD_CEILING,
                },
            },
        )


__all__ = [
    "BackpressureGovernor",
    "ConvergenceLoop",
    "GovernanceSentinel",
    "InlineThreadResolver",
    "MAX_CONVERGENCE_ATTEMPTS",
    "ReviewDebtCompressor",
    "TriageAgent",
]
