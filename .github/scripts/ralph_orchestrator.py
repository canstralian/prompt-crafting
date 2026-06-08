#!/usr/bin/env python3
"""Ralph: pipeline orchestrator.

Composes the six agents into one deterministic pass per PR:

    Triage → Sentinel → Convergence → Compressor → Inline → Backpressure

Then builds the SITREP markdown, upserts a singleton backlog issue,
and (if --execute and all gates pass) squash-merges PRs that meet the
auto-merge criteria. Returns exit code 1 if any BLOCK-tier finding
appears, so CI fails closed on policy violations.

Usage:
    python ralph_orchestrator.py --repo OWNER/REPO
    python ralph_orchestrator.py --repo OWNER/REPO --pr 42 67 --execute
    python ralph_orchestrator.py --repo OWNER/REPO --verify-chain
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

from ralph_agents import (
    BackpressureGovernor,
    ConvergenceLoop,
    GovernanceSentinel,
    InlineThreadResolver,
    ReviewDebtCompressor,
    TriageAgent,
)
from ralph_models import (
    GH,
    AgentName,
    AgentResult,
    Finding,
    GHError,
    PRState,
    RalphMemory,
    RiskTier,
    RunStatus,
    Severity,
)


DEFAULT_MEMORY_PATH = Path(".github/ralph-memory/memory.jsonl")
BACKLOG_LABEL = "ralph-backlog"
RALPH_LABEL_LOW = "ralph/low-risk"
RALPH_LABEL_BLOCK = "ralph/blocked"


# ---------------------------------------------------------------------------
# Pipeline
# ---------------------------------------------------------------------------


@dataclass
class PipelineOutcome:
    pr: int
    state: PRState
    results: list[AgentResult]
    risk_tier: RiskTier
    risk: float
    auto_merged: bool
    blocked: bool
    sitrep: str


def run_pipeline(
    state: PRState, memory: RalphMemory
) -> list[AgentResult]:
    agents = [
        TriageAgent(),
        GovernanceSentinel(),
        ConvergenceLoop(),
        ReviewDebtCompressor(),
        InlineThreadResolver(),
        BackpressureGovernor(),
    ]
    results: list[AgentResult] = []
    for agent in agents:
        result = agent.run(state, memory)
        memory.append(
            {
                "pr": state.number,
                "head_sha": state.head_sha,
                "agent": result.agent.value,
                "result": result.as_dict(),
            }
        )
        results.append(result)
    return results


def _risk_from_results(
    results: list[AgentResult],
) -> tuple[RiskTier, float]:
    for r in results:
        if r.agent is AgentName.SENTINEL:
            tier_raw = r.metadata.get("tier")
            risk_raw = r.metadata.get("risk", 0.0)
            tier = (
                RiskTier(tier_raw) if tier_raw else RiskTier.LOW
            )
            return tier, float(risk_raw)
    return RiskTier.LOW, 0.0


def _has_block(results: list[AgentResult]) -> bool:
    for r in results:
        if r.status is RunStatus.BLOCK:
            return True
        for f in r.findings:
            if f.severity is Severity.CRITICAL:
                return True
    return False


# ---------------------------------------------------------------------------
# Auto-merge gate
# ---------------------------------------------------------------------------


def _can_auto_merge(
    state: PRState, results: list[AgentResult], tier: RiskTier
) -> tuple[bool, str]:
    if state.is_draft:
        return False, "PR is draft"
    if state.mergeable.upper() != "MERGEABLE":
        return False, f"mergeable={state.mergeable}"
    if not state.all_checks_green:
        return False, "not all checks are green"
    if tier is not RiskTier.LOW:
        return False, f"risk tier is {tier.value}"
    if state.unresolved_threads:
        return False, (
            f"{len(state.unresolved_threads)} unresolved review threads"
        )
    if _has_block(results):
        return False, "block-tier finding present"
    # Any high-severity finding from any agent disqualifies.
    for r in results:
        for f in r.findings:
            if f.severity in (Severity.HIGH, Severity.CRITICAL):
                return False, (
                    f"{r.agent.value} raised {f.severity.value} finding"
                )
    return True, "all gates passed"


# ---------------------------------------------------------------------------
# SITREP
# ---------------------------------------------------------------------------


def build_sitrep(
    state: PRState,
    results: list[AgentResult],
    tier: RiskTier,
    risk: float,
    auto_merged: bool,
    merge_reason: str,
) -> str:
    lines: list[str] = []
    lines.append(f"# Ralph SITREP — PR #{state.number}")
    lines.append("")
    lines.append(
        f"**{state.repo}** · head `{state.head_sha[:8]}` · "
        f"age `{state.age_days:.1f}d` · LOC `+{state.additions}/"
        f"-{state.deletions}` · threads `{len(state.unresolved_threads)}` "
        f"unresolved"
    )
    lines.append("")
    lines.append(
        f"**Risk:** `{risk:.2f}` → tier **{tier.value}**"
    )
    lines.append("")

    lines.append("## Pipeline")
    lines.append("")
    lines.append("| Stage | Status | Worst finding |")
    lines.append("|---|---|---|")
    for r in results:
        worst = r.worst_severity().value if r.findings else "—"
        lines.append(
            f"| {r.agent.value} | {r.status.value} | {worst} |"
        )
    lines.append("")

    findings = [f for r in results for f in r.findings]
    if findings:
        lines.append("## Findings")
        lines.append("")
        # Sort: CRITICAL > HIGH > MEDIUM > LOW > INFO
        order = {
            Severity.CRITICAL: 0,
            Severity.HIGH: 1,
            Severity.MEDIUM: 2,
            Severity.LOW: 3,
            Severity.INFO: 4,
        }
        for f in sorted(findings, key=lambda x: order[x.severity]):
            loc = ""
            if f.path:
                loc = f" — `{f.path}`"
                if f.line:
                    loc = f" — `{f.path}:{f.line}`"
            rule = f" `[{f.rule_id}]`" if f.rule_id else ""
            lines.append(
                f"- **{f.severity.value.upper()}** "
                f"({f.agent.value}){rule}{loc}: {f.message}"
            )
        lines.append("")

    lines.append("## Action")
    lines.append("")
    if auto_merged:
        lines.append(
            f"✅ Auto-merge dispatched (squash). Reason: {merge_reason}."
        )
    else:
        lines.append(f"⏸ Held. Reason: {merge_reason}.")
    lines.append("")
    lines.append(
        f"_Pipeline: Triage → Sentinel → Convergence → Compressor → "
        f"Inline → Backpressure_"
    )
    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Backlog issue
# ---------------------------------------------------------------------------


BACKLOG_TITLE = "Ralph: open PR backlog"


def build_backlog_body(outcomes: list[PipelineOutcome]) -> str:
    rows: list[str] = []
    rows.append("# Open PR backlog")
    rows.append("")
    rows.append(
        "Auto-managed by Ralph. Updated on every workflow run; "
        "do not edit manually — edits will be overwritten."
    )
    rows.append("")
    rows.append(
        "| PR | Title | Tier | LOC | Threads | Age | Status |"
    )
    rows.append("|---:|---|---|---:|---:|---:|---|")
    for o in sorted(outcomes, key=lambda x: x.pr):
        status = (
            "✅ merged"
            if o.auto_merged
            else ("🛑 BLOCKED" if o.blocked else "⏸ held")
        )
        title = o.state.title.replace("|", "\\|")[:60]
        rows.append(
            f"| #{o.pr} | {title} | {o.risk_tier.value} | "
            f"{o.state.total_loc} | "
            f"{len(o.state.unresolved_threads)} | "
            f"{o.state.age_days:.1f}d | {status} |"
        )
    rows.append("")
    rows.append("_Singleton issue; safe to close — Ralph will re-open._")
    return "\n".join(rows)


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------


def _parse_args(argv: list[str]) -> argparse.Namespace:
    p = argparse.ArgumentParser(
        prog="ralph_orchestrator",
        description="Ralph PR-intelligence pipeline.",
    )
    p.add_argument(
        "--repo",
        required=True,
        help="GitHub repo, e.g. owner/name.",
    )
    p.add_argument(
        "--pr",
        type=int,
        nargs="*",
        default=None,
        help=(
            "Specific PR number(s) to process. "
            "Default: every open PR."
        ),
    )
    p.add_argument(
        "--execute",
        action="store_true",
        help="Actually invoke mutating gh commands. Default: dry-run.",
    )
    p.add_argument(
        "--memory",
        type=Path,
        default=DEFAULT_MEMORY_PATH,
        help=f"Memory file path. Default: {DEFAULT_MEMORY_PATH}",
    )
    p.add_argument(
        "--verify-chain",
        action="store_true",
        help="Verify the audit chain and exit.",
    )
    p.add_argument(
        "--sitrep-out",
        type=Path,
        default=None,
        help=(
            "If set, write the concatenated SITREPs to this file "
            "(useful for CI step summaries)."
        ),
    )
    return p.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = _parse_args(argv or sys.argv[1:])
    memory = RalphMemory(args.memory)

    if args.verify_chain:
        ok, msg = memory.verify_chain()
        sys.stdout.write(msg + "\n")
        return 0 if ok else 2

    gh = GH(args.repo, execute=args.execute)
    pr_numbers = args.pr if args.pr is not None else gh.list_open_prs()
    if not pr_numbers:
        sys.stdout.write("No open PRs.\n")
        return 0

    outcomes: list[PipelineOutcome] = []
    any_block = False
    sitreps: list[str] = []

    for pr in pr_numbers:
        try:
            state = gh.fetch_state(pr)
        except GHError as e:
            sys.stderr.write(f"skip #{pr}: {e}\n")
            continue
        results = run_pipeline(state, memory)
        tier, risk = _risk_from_results(results)
        blocked = _has_block(results)
        can_merge, reason = _can_auto_merge(state, results, tier)
        auto_merged = False
        if can_merge:
            try:
                gh.squash_merge(state.number)
                if args.execute:
                    gh.add_label(state.number, RALPH_LABEL_LOW)
                auto_merged = True
                memory.append(
                    {
                        "pr": state.number,
                        "head_sha": state.head_sha,
                        "agent": "Orchestrator",
                        "result": {
                            "status": "auto-merged",
                            "reason": reason,
                        },
                    }
                )
            except GHError as e:
                reason = f"merge failed: {e}"
        elif blocked and args.execute:
            try:
                gh.add_label(state.number, RALPH_LABEL_BLOCK)
            except GHError:
                pass
        sitrep = build_sitrep(
            state,
            results,
            tier,
            risk,
            auto_merged=auto_merged,
            merge_reason=reason,
        )
        sitreps.append(sitrep)
        sys.stdout.write(sitrep + "\n\n")
        outcomes.append(
            PipelineOutcome(
                pr=state.number,
                state=state,
                results=results,
                risk_tier=tier,
                risk=risk,
                auto_merged=auto_merged,
                blocked=blocked,
                sitrep=sitrep,
            )
        )
        any_block = any_block or blocked

    if outcomes:
        body = build_backlog_body(outcomes)
        try:
            gh.upsert_issue(BACKLOG_TITLE, body, label=BACKLOG_LABEL)
        except GHError as e:
            sys.stderr.write(f"backlog upsert failed: {e}\n")

    if args.sitrep_out:
        args.sitrep_out.parent.mkdir(parents=True, exist_ok=True)
        args.sitrep_out.write_text(
            "\n\n---\n\n".join(sitreps), encoding="utf-8"
        )

    ok, msg = memory.verify_chain()
    if not ok:
        sys.stderr.write(f"AUDIT CHAIN BROKEN: {msg}\n")
        return 2

    return 1 if any_block else 0


if __name__ == "__main__":
    raise SystemExit(main())
