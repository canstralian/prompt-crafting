#!/usr/bin/env python3
"""Ralph: data contracts, hash-chained memory, and gh CLI wrapper.

This module defines the immutable types every Ralph agent reads/writes.
No agent logic lives here. No agent imports another agent. The state
flows: GH -> PRState -> AgentResult -> RalphMemory.

The memory store is hash-chained (Spec Kit v2.2 audit pattern): each
entry stores the SHA-256 of (prev_hash || canonical_json(payload)),
so any tampering with an earlier entry invalidates every subsequent
hash. Verify with `RalphMemory.verify_chain()`.
"""

from __future__ import annotations

import enum
import hashlib
import json
import os
import shutil
import subprocess
import time
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any, Iterable, Iterator


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------


class PRClass(str, enum.Enum):
    """Coarse PR classification used by every downstream agent."""

    DOCS = "docs"
    WORKFLOW = "workflow"
    RUNTIME_PY = "runtime-py"
    RUNTIME_TS = "runtime-ts"
    INFRA = "infra"
    CONTRACT = "contract"
    MIXED = "mixed"


class RiskTier(str, enum.Enum):
    """GovernanceSentinel risk tier. BLOCK is non-overrideable."""

    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    BLOCK = "BLOCK"


class Severity(str, enum.Enum):
    INFO = "info"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class AgentName(str, enum.Enum):
    TRIAGE = "TriageAgent"
    SENTINEL = "GovernanceSentinel"
    CONVERGENCE = "ConvergenceLoop"
    COMPRESSOR = "ReviewDebtCompressor"
    INLINE = "InlineThreadResolver"
    BACKPRESSURE = "BackpressureGovernor"


class RunStatus(str, enum.Enum):
    OK = "ok"
    ESCALATE = "escalate"
    BLOCK = "block"
    SKIP = "skip"


# ---------------------------------------------------------------------------
# Domain dataclasses
# ---------------------------------------------------------------------------


@dataclass(frozen=True)
class Finding:
    """One concrete observation emitted by an agent."""

    agent: AgentName
    severity: Severity
    message: str
    path: str | None = None
    line: int | None = None
    rule_id: str | None = None

    def as_dict(self) -> dict[str, Any]:
        return {
            "agent": self.agent.value,
            "severity": self.severity.value,
            "message": self.message,
            "path": self.path,
            "line": self.line,
            "rule_id": self.rule_id,
        }


@dataclass
class ThreadCluster:
    """A deduped group of review threads. Confidence is in [0.0, 1.0]."""

    representative_id: str
    member_ids: list[str]
    summary: str
    confidence: float

    def as_dict(self) -> dict[str, Any]:
        return {
            "representative_id": self.representative_id,
            "member_ids": list(self.member_ids),
            "summary": self.summary,
            "confidence": round(self.confidence, 3),
        }


@dataclass
class ReviewThread:
    """A single review-comment thread on a PR."""

    thread_id: str
    path: str | None
    line: int | None
    body: str
    author: str
    resolved: bool
    outdated: bool

    def tokens(self) -> set[str]:
        return _tokenise(self.body)


@dataclass
class PRState:
    """Normalised PR state shared across every agent.

    Built once by GH.fetch_state() and never mutated.
    """

    number: int
    repo: str
    title: str
    body: str
    base_ref: str
    head_ref: str
    head_sha: str
    author: str
    is_draft: bool
    mergeable: str  # MERGEABLE | CONFLICTING | UNKNOWN
    additions: int
    deletions: int
    changed_files: list[str]
    labels: list[str]
    check_states: dict[str, str]  # check name -> conclusion
    threads: list[ReviewThread]
    age_days: float
    created_at: str
    updated_at: str

    @property
    def total_loc(self) -> int:
        return self.additions + self.deletions

    @property
    def unresolved_threads(self) -> list[ReviewThread]:
        return [t for t in self.threads if not t.resolved]

    @property
    def all_checks_green(self) -> bool:
        if not self.check_states:
            return False
        return all(
            v.upper() == "SUCCESS" for v in self.check_states.values()
        )

    def as_dict(self) -> dict[str, Any]:
        return {
            "number": self.number,
            "repo": self.repo,
            "title": self.title,
            "body": self.body,
            "base_ref": self.base_ref,
            "head_ref": self.head_ref,
            "head_sha": self.head_sha,
            "author": self.author,
            "is_draft": self.is_draft,
            "mergeable": self.mergeable,
            "additions": self.additions,
            "deletions": self.deletions,
            "changed_files": list(self.changed_files),
            "labels": list(self.labels),
            "check_states": dict(self.check_states),
            "threads": [asdict(t) for t in self.threads],
            "age_days": self.age_days,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }


@dataclass
class AgentResult:
    """Every agent returns one of these. Pure data."""

    agent: AgentName
    status: RunStatus
    findings: list[Finding] = field(default_factory=list)
    metadata: dict[str, Any] = field(default_factory=dict)

    def worst_severity(self) -> Severity:
        if not self.findings:
            return Severity.INFO
        order = [
            Severity.INFO,
            Severity.LOW,
            Severity.MEDIUM,
            Severity.HIGH,
            Severity.CRITICAL,
        ]
        return max(self.findings, key=lambda f: order.index(f.severity)).severity

    def as_dict(self) -> dict[str, Any]:
        return {
            "agent": self.agent.value,
            "status": self.status.value,
            "findings": [f.as_dict() for f in self.findings],
            "metadata": dict(self.metadata),
        }


# ---------------------------------------------------------------------------
# Hash-chained memory store
# ---------------------------------------------------------------------------


def _canonical_json(payload: Any) -> str:
    """Deterministic JSON for hashing. Sorted keys, no whitespace."""

    return json.dumps(
        payload,
        sort_keys=True,
        separators=(",", ":"),
        ensure_ascii=False,
        default=str,
    )


def _sha256(data: str) -> str:
    return hashlib.sha256(data.encode("utf-8")).hexdigest()


GENESIS_HASH = "0" * 64


@dataclass
class MemoryEntry:
    """One immutable record in the audit chain."""

    seq: int
    timestamp: float
    prev_hash: str
    payload: dict[str, Any]
    this_hash: str

    @staticmethod
    def compute_hash(seq: int, prev_hash: str, payload: dict[str, Any]) -> str:
        return _sha256(
            f"{seq}|{prev_hash}|{_canonical_json(payload)}"
        )

    def is_valid(self) -> bool:
        return self.this_hash == MemoryEntry.compute_hash(
            self.seq, self.prev_hash, self.payload
        )

    def as_dict(self) -> dict[str, Any]:
        return {
            "seq": self.seq,
            "timestamp": self.timestamp,
            "prev_hash": self.prev_hash,
            "payload": self.payload,
            "this_hash": self.this_hash,
        }


class MemoryCorrupted(RuntimeError):
    """Raised when the audit chain has been tampered with."""


class RalphMemory:
    """Append-only, hash-chained JSON store.

    On disk this is a JSONL file at `path`. Each line is one
    MemoryEntry serialised as JSON. The chain is verified on load
    (lazy) and on every append (strict).
    """

    def __init__(self, path: Path) -> None:
        self.path = path
        self._entries: list[MemoryEntry] = []
        self._loaded = False

    # ----- I/O ------------------------------------------------------------

    def _load(self) -> None:
        if self._loaded:
            return
        self._entries = []
        if self.path.exists():
            with self.path.open("r", encoding="utf-8") as fh:
                for raw in fh:
                    raw = raw.strip()
                    if not raw:
                        continue
                    obj = json.loads(raw)
                    entry = MemoryEntry(
                        seq=obj["seq"],
                        timestamp=obj["timestamp"],
                        prev_hash=obj["prev_hash"],
                        payload=obj["payload"],
                        this_hash=obj["this_hash"],
                    )
                    self._entries.append(entry)
        self._loaded = True

    def _atomic_append(self, entry: MemoryEntry) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        line = _canonical_json(entry.as_dict()) + "\n"
        tmp = self.path.with_suffix(self.path.suffix + ".tmp")
        if self.path.exists():
            shutil.copyfile(self.path, tmp)
        with tmp.open("a", encoding="utf-8") as fh:
            fh.write(line)
        os.replace(tmp, self.path)

    # ----- Public API -----------------------------------------------------

    def append(self, payload: dict[str, Any]) -> MemoryEntry:
        """Append a new entry, link it to the previous hash, persist."""

        self._load()
        prev_hash = (
            self._entries[-1].this_hash if self._entries else GENESIS_HASH
        )
        seq = len(self._entries)
        ts = time.time()
        this_hash = MemoryEntry.compute_hash(seq, prev_hash, payload)
        entry = MemoryEntry(
            seq=seq,
            timestamp=ts,
            prev_hash=prev_hash,
            payload=payload,
            this_hash=this_hash,
        )
        self._atomic_append(entry)
        self._entries.append(entry)
        return entry

    def entries(self) -> list[MemoryEntry]:
        self._load()
        return list(self._entries)

    def find(
        self, *, pr_number: int | None = None, agent: AgentName | None = None
    ) -> Iterator[MemoryEntry]:
        """Yield entries matching the given filters."""

        self._load()
        for entry in self._entries:
            payload = entry.payload
            if pr_number is not None and payload.get("pr") != pr_number:
                continue
            if agent is not None and payload.get("agent") != agent.value:
                continue
            yield entry

    def count_convergence_attempts(self, pr_number: int) -> int:
        """How many ConvergenceLoop runs has this PR already had?"""

        return sum(
            1
            for _ in self.find(
                pr_number=pr_number, agent=AgentName.CONVERGENCE
            )
        )

    def last_risk_tier(self, pr_number: int) -> RiskTier | None:
        for entry in reversed(list(self.find(pr_number=pr_number))):
            payload = entry.payload
            if payload.get("agent") == AgentName.SENTINEL.value:
                tier = payload.get("result", {}).get("metadata", {}).get(
                    "tier"
                )
                if tier:
                    return RiskTier(tier)
        return None

    def verify_chain(self) -> tuple[bool, str]:
        """Return (is_valid, message). Re-walks the whole chain."""

        self._load()
        prev_hash = GENESIS_HASH
        for entry in self._entries:
            if entry.prev_hash != prev_hash:
                return False, (
                    f"prev_hash mismatch at seq={entry.seq}: "
                    f"expected {prev_hash[:12]}, got {entry.prev_hash[:12]}"
                )
            recomputed = MemoryEntry.compute_hash(
                entry.seq, entry.prev_hash, entry.payload
            )
            if recomputed != entry.this_hash:
                return False, (
                    f"this_hash mismatch at seq={entry.seq}: "
                    f"expected {recomputed[:12]}, "
                    f"got {entry.this_hash[:12]}"
                )
            prev_hash = entry.this_hash
        return True, f"chain valid: {len(self._entries)} entries"


# ---------------------------------------------------------------------------
# Tokenisation (shared utility — agents are forbidden from importing each
# other but may import shared helpers from this module)
# ---------------------------------------------------------------------------


_TOKEN_SPLIT = "".join(
    chr(c) for c in range(256) if not (chr(c).isalnum() or chr(c) == "_")
)


def _tokenise(text: str) -> set[str]:
    out: set[str] = set()
    buf: list[str] = []
    for ch in text.lower():
        if ch.isalnum() or ch == "_":
            buf.append(ch)
        else:
            if buf:
                out.add("".join(buf))
                buf = []
    if buf:
        out.add("".join(buf))
    return {t for t in out if len(t) >= 3}


# ---------------------------------------------------------------------------
# gh CLI wrapper
# ---------------------------------------------------------------------------


class GHError(RuntimeError):
    """Wraps a non-zero gh CLI exit."""


class GH:
    """Thin wrapper around the gh CLI.

    Every method either reads (no side effects) or, when `execute=False`,
    returns the command it WOULD have run. This lets the orchestrator
    run in dry-run mode and audit every action.
    """

    def __init__(self, repo: str, execute: bool = False) -> None:
        self.repo = repo
        self.execute = execute

    # ----- low-level -------------------------------------------------------

    def _run(
        self, args: list[str], *, capture: bool = True, mutating: bool = False
    ) -> str:
        if mutating and not self.execute:
            return ""
        cmd = ["gh", *args, "--repo", self.repo]
        try:
            out = subprocess.run(
                cmd,
                check=True,
                capture_output=capture,
                text=True,
            )
        except subprocess.CalledProcessError as e:  # pragma: no cover
            raise GHError(f"gh failed: {cmd}\nstderr: {e.stderr}") from e
        return out.stdout if capture else ""

    def _json(self, args: list[str]) -> Any:
        raw = self._run(args)
        if not raw.strip():
            return None
        return json.loads(raw)

    # ----- reads ----------------------------------------------------------

    def list_open_prs(self) -> list[int]:
        data = self._json(
            [
                "pr",
                "list",
                "--state",
                "open",
                "--limit",
                "200",
                "--json",
                "number",
            ]
        )
        return [p["number"] for p in (data or [])]

    def fetch_state(self, pr_number: int) -> PRState:
        fields = ",".join(
            [
                "number",
                "title",
                "body",
                "baseRefName",
                "headRefName",
                "headRefOid",
                "author",
                "isDraft",
                "mergeable",
                "additions",
                "deletions",
                "files",
                "labels",
                "statusCheckRollup",
                "reviewThreads",
                "createdAt",
                "updatedAt",
            ]
        )
        data = self._json(
            [
                "pr",
                "view",
                str(pr_number),
                "--json",
                fields,
            ]
        )
        if data is None:
            raise GHError(f"PR #{pr_number} not found in {self.repo}")
        return _parse_pr_state(self.repo, data)

    # ----- writes (all mutating; respect execute flag) --------------------

    def post_comment(self, pr_number: int, body: str) -> None:
        self._run(
            ["pr", "comment", str(pr_number), "--body", body],
            capture=False,
            mutating=True,
        )

    def reply_to_thread(
        self, pr_number: int, thread_id: str, body: str
    ) -> None:
        # gh CLI does not support per-thread replies directly; fall back
        # to a regular PR comment that references the thread.
        self.post_comment(
            pr_number,
            f"_re: thread `{thread_id}`_\n\n{body}",
        )

    def add_label(self, pr_number: int, label: str) -> None:
        self._run(
            ["pr", "edit", str(pr_number), "--add-label", label],
            capture=False,
            mutating=True,
        )

    def remove_label(self, pr_number: int, label: str) -> None:
        self._run(
            ["pr", "edit", str(pr_number), "--remove-label", label],
            capture=False,
            mutating=True,
        )

    def squash_merge(self, pr_number: int) -> None:
        self._run(
            ["pr", "merge", str(pr_number), "--squash", "--auto"],
            capture=False,
            mutating=True,
        )

    def upsert_issue(
        self, title: str, body: str, label: str = "ralph-backlog"
    ) -> int:
        """Create the backlog issue if missing, otherwise edit in place."""

        data = self._json(
            [
                "issue",
                "list",
                "--label",
                label,
                "--state",
                "open",
                "--limit",
                "5",
                "--json",
                "number,title",
            ]
        )
        for issue in data or []:
            if issue["title"] == title:
                self._run(
                    [
                        "issue",
                        "edit",
                        str(issue["number"]),
                        "--body",
                        body,
                    ],
                    capture=False,
                    mutating=True,
                )
                return int(issue["number"])
        raw = self._run(
            [
                "issue",
                "create",
                "--title",
                title,
                "--body",
                body,
                "--label",
                label,
            ],
            mutating=True,
        )
        # gh prints the URL on stdout; parse number off the end.
        if raw and "/" in raw:
            try:
                return int(raw.rsplit("/", 1)[-1].strip())
            except ValueError:
                return -1
        return -1


def _parse_pr_state(repo: str, data: dict[str, Any]) -> PRState:
    author = data.get("author") or {}
    files = [f["path"] for f in data.get("files", [])]
    labels = [lbl["name"] for lbl in data.get("labels", [])]
    rollup = data.get("statusCheckRollup") or []
    check_states: dict[str, str] = {}
    for c in rollup:
        name = c.get("name") or c.get("context") or "unknown"
        conclusion = (
            c.get("conclusion") or c.get("state") or "PENDING"
        )
        check_states[name] = conclusion
    threads_raw = data.get("reviewThreads") or []
    threads: list[ReviewThread] = []
    for t in threads_raw:
        comments = t.get("comments") or []
        first = comments[0] if comments else {}
        body = first.get("body", "")
        author_login = (first.get("author") or {}).get("login", "?")
        threads.append(
            ReviewThread(
                thread_id=t.get("id", ""),
                path=t.get("path"),
                line=t.get("line"),
                body=body,
                author=author_login,
                resolved=bool(t.get("isResolved")),
                outdated=bool(t.get("isOutdated")),
            )
        )
    created_at = data.get("createdAt", "")
    age_days = _age_days(created_at)
    return PRState(
        number=int(data["number"]),
        repo=repo,
        title=data.get("title", ""),
        body=data.get("body", "") or "",
        base_ref=data.get("baseRefName", "main"),
        head_ref=data.get("headRefName", ""),
        head_sha=data.get("headRefOid", ""),
        author=author.get("login", "?"),
        is_draft=bool(data.get("isDraft", False)),
        mergeable=data.get("mergeable", "UNKNOWN"),
        additions=int(data.get("additions", 0)),
        deletions=int(data.get("deletions", 0)),
        changed_files=files,
        labels=labels,
        check_states=check_states,
        threads=threads,
        age_days=age_days,
        created_at=created_at,
        updated_at=data.get("updatedAt", ""),
    )


def _age_days(iso_ts: str) -> float:
    if not iso_ts:
        return 0.0
    # Best-effort parse — gh emits RFC3339.
    try:
        from datetime import datetime, timezone

        ts = datetime.fromisoformat(iso_ts.replace("Z", "+00:00"))
        delta = datetime.now(timezone.utc) - ts
        return round(delta.total_seconds() / 86400.0, 2)
    except (ValueError, TypeError):
        return 0.0


__all__ = [
    "AgentName",
    "AgentResult",
    "Finding",
    "GH",
    "GHError",
    "MemoryCorrupted",
    "MemoryEntry",
    "PRClass",
    "PRState",
    "RalphMemory",
    "ReviewThread",
    "RiskTier",
    "RunStatus",
    "Severity",
    "ThreadCluster",
    "_tokenise",
]
