"""Drift scorer for stale pull requests.

Computes a composite drift score in [0.0, 1.0] across seven signals.
Higher score = more drift = stronger case to close/archive.

Signal weights (sum to 1.0):
    file_relevance      0.25  files in PR no longer exist on main
    logic_absorption    0.20  PR diff vs. post-open commits on main (TF-IDF cosine)
    conflict_density    0.20  mergeable state + touched-file count
    semantic_distance   0.15  vocabulary drift PR <-> recent main commits
    package_delta       0.10  added/removed packages now divergent
    ruleset_staleness   0.05  security/config files in PR since updated on main
    age_penalty         0.05  exponential decay; sharp at 30d, plateau at 120d
"""

from __future__ import annotations

import math
import re
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Iterable, Optional

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity

    _HAS_SKLEARN = True
except ImportError:  # pragma: no cover
    _HAS_SKLEARN = False


SIGNAL_WEIGHTS: dict[str, float] = {
    "file_relevance": 0.25,
    "logic_absorption": 0.20,
    "conflict_density": 0.20,
    "semantic_distance": 0.15,
    "package_delta": 0.10,
    "ruleset_staleness": 0.05,
    "age_penalty": 0.05,
}

SECURITY_PATHS = (
    ".github/workflows/",
    "security/",
    "auth/",
    "SECURITY.md",
    "dependabot.yml",
    "CODEOWNERS",
)

PACKAGE_FILES = (
    "requirements.txt",
    "requirements.in",
    "pyproject.toml",
    "Pipfile",
    "package.json",
    "Cargo.toml",
    "go.mod",
)


@dataclass
class PRSnapshot:
    """Everything needed to score a PR. Caller assembles via the GitHub API."""

    number: int
    title: str
    body: str
    labels: list[str]
    created_at: datetime
    mergeable: Optional[bool]
    mergeable_state: str  # "clean" | "dirty" | "blocked" | "behind" | "unknown" | ...
    ci_passing: Optional[bool]
    changed_files: list[str]
    diff_text: str
    added_packages: list[str]
    removed_packages: list[str]
    main_files: set[str]
    post_open_commit_messages: list[str]
    post_open_commit_diff: str
    recent_main_commit_messages: list[str]
    current_requirements_packages: set[str]
    main_security_paths_changed_since: set[str]


@dataclass
class DriftReport:
    pr_number: int
    score: float
    disposition: str
    signals: dict[str, float] = field(default_factory=dict)
    reasons: list[str] = field(default_factory=list)
    override: Optional[str] = None


def _clamp(x: float) -> float:
    if x < 0.0:
        return 0.0
    if x > 1.0:
        return 1.0
    return x


def _tokenize(text: str) -> list[str]:
    return re.findall(r"[A-Za-z_][A-Za-z0-9_]{2,}", text.lower())


def _jaccard(a: Iterable[str], b: Iterable[str]) -> float:
    sa, sb = set(a), set(b)
    if not sa and not sb:
        return 0.0
    union = sa | sb
    if not union:
        return 0.0
    return len(sa & sb) / len(union)


def _tfidf_cosine(a: str, b: str) -> float:
    """TF-IDF cosine between two texts. Falls back to Jaccard if sklearn missing."""
    if not a.strip() or not b.strip():
        return 0.0
    if _HAS_SKLEARN:
        vec = TfidfVectorizer(stop_words="english", max_features=2000)
        try:
            matrix = vec.fit_transform([a, b])
        except ValueError:
            return 0.0
        sim = cosine_similarity(matrix[0:1], matrix[1:2])[0][0]
        return float(sim)
    return _jaccard(_tokenize(a), _tokenize(b))


def score_file_relevance(snap: PRSnapshot) -> float:
    if not snap.changed_files:
        return 0.0
    missing = sum(1 for f in snap.changed_files if f not in snap.main_files)
    return _clamp(missing / len(snap.changed_files))


def score_logic_absorption(snap: PRSnapshot) -> float:
    return _clamp(_tfidf_cosine(snap.diff_text, snap.post_open_commit_diff))


def score_conflict_density(snap: PRSnapshot) -> float:
    state_penalty = {
        "clean": 0.0,
        "unstable": 0.25,
        "behind": 0.45,
        "blocked": 0.55,
        "draft": 0.30,
        "dirty": 0.85,
        "unknown": 0.40,
    }.get(snap.mergeable_state, 0.40)

    if snap.mergeable is False:
        state_penalty = max(state_penalty, 0.85)

    file_pressure = _clamp(len(snap.changed_files) / 40.0)
    return _clamp(0.7 * state_penalty + 0.3 * file_pressure)


def score_semantic_distance(snap: PRSnapshot) -> float:
    pr_text = f"{snap.title}\n{snap.body}"
    main_text = "\n".join(snap.recent_main_commit_messages)
    similarity = _tfidf_cosine(pr_text, main_text)
    return _clamp(1.0 - similarity)


def score_package_delta(snap: PRSnapshot) -> float:
    pkgs = set(snap.added_packages) | set(snap.removed_packages)
    if not pkgs:
        return 0.0
    diverged = 0
    for pkg in pkgs:
        in_current = pkg in snap.current_requirements_packages
        if pkg in snap.added_packages and in_current:
            diverged += 1
        if pkg in snap.removed_packages and not in_current:
            diverged += 1
    return _clamp(diverged / len(pkgs))


def score_ruleset_staleness(snap: PRSnapshot) -> float:
    pr_security_files = {
        f for f in snap.changed_files if any(f.startswith(p) or f == p for p in SECURITY_PATHS)
    }
    if not pr_security_files:
        return 0.0
    overlap = pr_security_files & snap.main_security_paths_changed_since
    return _clamp(len(overlap) / len(pr_security_files))


def score_age_penalty(snap: PRSnapshot, now: Optional[datetime] = None) -> float:
    now = now or datetime.now(timezone.utc)
    age_days = max(0.0, (now - snap.created_at).total_seconds() / 86400.0)
    return _clamp(1.0 - math.exp(-age_days / 60.0))


SIGNAL_FUNCS = {
    "file_relevance": score_file_relevance,
    "logic_absorption": score_logic_absorption,
    "conflict_density": score_conflict_density,
    "semantic_distance": score_semantic_distance,
    "package_delta": score_package_delta,
    "ruleset_staleness": score_ruleset_staleness,
    "age_penalty": score_age_penalty,
}


def disposition_for(score: float) -> str:
    if score < 0.20:
        return "merge"
    if score < 0.40:
        return "revive"
    if score < 0.60:
        return "cherry-pick"
    if score < 0.80:
        return "archive"
    return "close"


def score_pr(snap: PRSnapshot, now: Optional[datetime] = None) -> DriftReport:
    signals: dict[str, float] = {}
    for name, fn in SIGNAL_FUNCS.items():
        signals[name] = fn(snap, now) if name == "age_penalty" else fn(snap)

    composite = sum(signals[name] * SIGNAL_WEIGHTS[name] for name in SIGNAL_WEIGHTS)
    composite = _clamp(composite)
    disposition = disposition_for(composite)

    override: Optional[str] = None
    reasons: list[str] = []

    is_security = any(label.lower() in {"security", "auth", "vuln"} for label in snap.labels)
    if is_security and composite > 0.55:
        override = "security PR with drift > 0.55"
        disposition = "close"
        reasons.append("Security-tagged PR past the 0.55 drift bar — close, don't cherry-pick.")

    if (
        override is None
        and snap.ci_passing is True
        and snap.mergeable is True
        and snap.mergeable_state == "clean"
        and composite < 0.35
    ):
        override = "CI green + clean merge + drift < 0.35"
        disposition = "merge"
        reasons.append("Green CI on a clean merge under the 0.35 drift bar — merge.")

    for name, value in signals.items():
        if value >= 0.5:
            reasons.append(f"{name}={value:.2f} (weight {SIGNAL_WEIGHTS[name]:.2f})")

    return DriftReport(
        pr_number=snap.number,
        score=round(composite, 3),
        disposition=disposition,
        signals={k: round(v, 3) for k, v in signals.items()},
        reasons=reasons,
        override=override,
    )
