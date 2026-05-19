"""PR Necromancer — score stale PRs and dispose of them.

Usage:
    python pr_necromancer.py --repo owner/name [--pr 42 67] [--execute] [--dry-run]

Environment:
    GITHUB_TOKEN     required, repo + workflow scopes
    GITHUB_REPOSITORY optional fallback for --repo

Dispositions:
    merge        leave alone, ready to land
    revive       rebase onto main, re-trigger CI
    cherry-pick  comment with commit list to extract, then close
    archive      close + create archive tag `archive/pr-<n>`
    close        close as obsolete
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from dataclasses import asdict
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

import requests

from drift_scorer import SECURITY_PATHS, PRSnapshot, score_pr

GITHUB_API = "https://api.github.com"
RECENT_MAIN_WINDOW_DAYS = 30
USER_AGENT = "pr-necromancer/1.0"


class GitHubClient:
    def __init__(self, token: str, repo: str) -> None:
        if "/" not in repo:
            raise ValueError(f"repo must be 'owner/name', got: {repo}")
        self.repo = repo
        self.session = requests.Session()
        self.session.headers.update(
            {
                "Authorization": f"Bearer {token}",
                "Accept": "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28",
                "User-Agent": USER_AGENT,
            }
        )

    def _get(self, path: str, **params: Any) -> Any:
        r = self.session.get(f"{GITHUB_API}{path}", params=params, timeout=30)
        r.raise_for_status()
        return r.json()

    def _get_text(self, path: str, accept: str) -> str:
        r = self.session.get(
            f"{GITHUB_API}{path}",
            headers={"Accept": accept},
            timeout=30,
        )
        r.raise_for_status()
        return r.text

    def list_open_prs(self) -> list[dict[str, Any]]:
        prs: list[dict[str, Any]] = []
        page = 1
        while True:
            batch = self._get(
                f"/repos/{self.repo}/pulls",
                state="open",
                per_page=100,
                page=page,
            )
            if not batch:
                break
            prs.extend(batch)
            if len(batch) < 100:
                break
            page += 1
        return prs

    def get_pr(self, number: int) -> dict[str, Any]:
        return self._get(f"/repos/{self.repo}/pulls/{number}")

    def get_pr_files(self, number: int) -> list[dict[str, Any]]:
        files: list[dict[str, Any]] = []
        page = 1
        while True:
            batch = self._get(
                f"/repos/{self.repo}/pulls/{number}/files",
                per_page=100,
                page=page,
            )
            if not batch:
                break
            files.extend(batch)
            if len(batch) < 100:
                break
            page += 1
        return files

    def get_pr_diff(self, number: int) -> str:
        return self._get_text(
            f"/repos/{self.repo}/pulls/{number}",
            accept="application/vnd.github.v3.diff",
        )

    def get_pr_checks(self, sha: str) -> Optional[bool]:
        data = self._get(f"/repos/{self.repo}/commits/{sha}/check-runs")
        runs = data.get("check_runs") or []
        if not runs:
            return None
        for run in runs:
            if run.get("status") != "completed":
                return None
            if run.get("conclusion") not in {"success", "skipped", "neutral"}:
                return False
        return True

    def list_main_files(self, branch: str = "main") -> set[str]:
        try:
            tree = self._get(
                f"/repos/{self.repo}/git/trees/{branch}",
                recursive=1,
            )
        except requests.HTTPError:
            tree = self._get(
                f"/repos/{self.repo}/git/trees/master",
                recursive=1,
            )
        return {item["path"] for item in tree.get("tree", []) if item.get("type") == "blob"}

    def list_commits_since(self, since: datetime, branch: str = "main") -> list[dict[str, Any]]:
        commits: list[dict[str, Any]] = []
        page = 1
        params = {"sha": branch, "since": since.isoformat(), "per_page": 100}
        while True:
            try:
                batch = self._get(f"/repos/{self.repo}/commits", page=page, **params)
            except requests.HTTPError:
                params["sha"] = "master"
                batch = self._get(f"/repos/{self.repo}/commits", page=page, **params)
            if not batch:
                break
            commits.extend(batch)
            if len(batch) < 100:
                break
            page += 1
        return commits

    def get_commit_files(self, sha: str) -> list[str]:
        data = self._get(f"/repos/{self.repo}/commits/{sha}")
        return [f["filename"] for f in data.get("files", [])]

    def get_file_at_main(self, path: str, branch: str = "main") -> Optional[str]:
        try:
            data = self._get(f"/repos/{self.repo}/contents/{path}", ref=branch)
        except requests.HTTPError:
            try:
                data = self._get(f"/repos/{self.repo}/contents/{path}", ref="master")
            except requests.HTTPError:
                return None
        import base64

        if isinstance(data, list):
            return None
        content = data.get("content", "")
        encoding = data.get("encoding", "base64")
        if encoding == "base64":
            try:
                return base64.b64decode(content).decode("utf-8", errors="replace")
            except Exception:
                return None
        return content

    def comment(self, number: int, body: str) -> None:
        r = self.session.post(
            f"{GITHUB_API}/repos/{self.repo}/issues/{number}/comments",
            json={"body": body},
            timeout=30,
        )
        r.raise_for_status()

    def close_pr(self, number: int) -> None:
        r = self.session.patch(
            f"{GITHUB_API}/repos/{self.repo}/pulls/{number}",
            json={"state": "closed"},
            timeout=30,
        )
        r.raise_for_status()

    def create_tag(self, name: str, sha: str) -> None:
        r = self.session.post(
            f"{GITHUB_API}/repos/{self.repo}/git/refs",
            json={"ref": f"refs/tags/{name}", "sha": sha},
            timeout=30,
        )
        if r.status_code == 422:
            return
        r.raise_for_status()


def parse_packages(content: Optional[str], path: str) -> set[str]:
    if not content:
        return set()
    pkgs: set[str] = set()
    if path.endswith(("requirements.txt", "requirements.in")):
        for line in content.splitlines():
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            name = line.split("==")[0].split(">=")[0].split("<=")[0].split("~=")[0]
            name = name.split(";")[0].split("[")[0].strip()
            if name:
                pkgs.add(name.lower())
    elif path == "package.json":
        try:
            data = json.loads(content)
        except json.JSONDecodeError:
            return pkgs
        for section in ("dependencies", "devDependencies", "peerDependencies"):
            for name in (data.get(section) or {}):
                pkgs.add(name.lower())
    return pkgs


def diff_packages(pr_file: dict[str, Any]) -> tuple[list[str], list[str]]:
    """Parse a unified patch for added/removed package lines."""
    added: list[str] = []
    removed: list[str] = []
    patch = pr_file.get("patch") or ""
    for line in patch.splitlines():
        if line.startswith("+") and not line.startswith("+++"):
            name = _pkg_name_from_line(line[1:])
            if name:
                added.append(name)
        elif line.startswith("-") and not line.startswith("---"):
            name = _pkg_name_from_line(line[1:])
            if name:
                removed.append(name)
    return added, removed


def _pkg_name_from_line(line: str) -> Optional[str]:
    line = line.strip()
    if not line or line.startswith("#"):
        return None
    name = line.split("==")[0].split(">=")[0].split("<=")[0].split("~=")[0]
    name = name.split(":")[0].split('"')[0].split("'")[0]
    name = name.strip().strip(",").strip()
    if not name or any(c in name for c in (" ", "{", "}", "[", "]")):
        return None
    return name.lower()


def build_snapshot(gh: GitHubClient, number: int, main_files: set[str],
                   recent_commit_messages: list[str], post_open_diff: str,
                   security_paths_changed: set[str]) -> PRSnapshot:
    pr = gh.get_pr(number)
    files = gh.get_pr_files(number)
    diff_text = gh.get_pr_diff(number)
    head_sha = pr["head"]["sha"]
    ci = gh.get_pr_checks(head_sha)

    added_pkgs: list[str] = []
    removed_pkgs: list[str] = []
    for f in files:
        if f["filename"].endswith(PACKAGE_FILES_SUFFIX) or f["filename"] in PACKAGE_FILE_NAMES:
            a, r = diff_packages(f)
            added_pkgs.extend(a)
            removed_pkgs.extend(r)

    current_pkgs: set[str] = set()
    for pkg_path in PACKAGE_FILE_NAMES:
        content = gh.get_file_at_main(pkg_path)
        current_pkgs |= parse_packages(content, pkg_path)

    created_at = datetime.fromisoformat(pr["created_at"].replace("Z", "+00:00"))

    return PRSnapshot(
        number=number,
        title=pr.get("title") or "",
        body=pr.get("body") or "",
        labels=[lbl["name"] for lbl in pr.get("labels", [])],
        created_at=created_at,
        mergeable=pr.get("mergeable"),
        mergeable_state=pr.get("mergeable_state") or "unknown",
        ci_passing=ci,
        changed_files=[f["filename"] for f in files],
        diff_text=diff_text,
        added_packages=added_pkgs,
        removed_packages=removed_pkgs,
        main_files=main_files,
        post_open_commit_messages=[],
        post_open_commit_diff=post_open_diff,
        recent_main_commit_messages=recent_commit_messages,
        current_requirements_packages=current_pkgs,
        main_security_paths_changed_since=security_paths_changed,
    )


PACKAGE_FILE_NAMES = (
    "requirements.txt",
    "requirements.in",
    "pyproject.toml",
    "Pipfile",
    "package.json",
    "Cargo.toml",
    "go.mod",
)
PACKAGE_FILES_SUFFIX = tuple(f"/{n}" for n in PACKAGE_FILE_NAMES)


def collect_main_context(gh: GitHubClient, oldest_pr_created: datetime) -> tuple[
    set[str], list[str], str, set[str]
]:
    main_files = gh.list_main_files()
    recent_cut = datetime.now(timezone.utc) - timedelta(days=RECENT_MAIN_WINDOW_DAYS)
    recent_commits = gh.list_commits_since(recent_cut)
    recent_msgs = [c["commit"]["message"] for c in recent_commits]

    post_open_commits = gh.list_commits_since(oldest_pr_created)
    post_open_diff_parts: list[str] = []
    security_paths: set[str] = set()
    for c in post_open_commits[:50]:
        post_open_diff_parts.append(c["commit"]["message"])
        try:
            for f in gh.get_commit_files(c["sha"]):
                if any(f.startswith(p) or f == p for p in SECURITY_PATHS):
                    security_paths.add(f)
        except requests.HTTPError:
            continue

    return main_files, recent_msgs, "\n".join(post_open_diff_parts), security_paths


def render_comment(report: Any) -> str:
    lines = [
        "## PR Necromancer report",
        "",
        f"**Drift score:** `{report.score:.3f}`",
        f"**Disposition:** `{report.disposition}`",
    ]
    if report.override:
        lines.append(f"**Override applied:** {report.override}")
    lines.append("")
    lines.append("### Signals")
    lines.append("")
    lines.append("| Signal | Value |")
    lines.append("|---|---|")
    for k, v in report.signals.items():
        lines.append(f"| {k} | {v:.3f} |")
    if report.reasons:
        lines.append("")
        lines.append("### Reasons")
        for r in report.reasons:
            lines.append(f"- {r}")
    return "\n".join(lines)


def execute_disposition(gh: GitHubClient, pr: dict[str, Any], report: Any) -> None:
    number = pr["number"]
    sha = pr["head"]["sha"]
    body = render_comment(report)
    gh.comment(number, body)

    if report.disposition == "merge":
        return
    if report.disposition == "revive":
        gh.comment(number, "@necromancer-revive: rebase + re-run CI")
        return
    if report.disposition == "cherry-pick":
        gh.comment(
            number,
            "Closing in favour of cherry-picking specific commits. "
            "List the SHAs you want kept in a follow-up issue.",
        )
        gh.close_pr(number)
        return
    if report.disposition == "archive":
        gh.create_tag(f"archive/pr-{number}", sha)
        gh.close_pr(number)
        return
    if report.disposition == "close":
        gh.close_pr(number)
        return


def main() -> int:
    parser = argparse.ArgumentParser(description="PR Necromancer")
    parser.add_argument("--repo", default=os.environ.get("GITHUB_REPOSITORY", ""))
    parser.add_argument("--pr", nargs="*", type=int, default=None,
                        help="Specific PR numbers; default = all open PRs")
    parser.add_argument("--execute", action="store_true",
                        help="Apply the disposition (comment / close / tag)")
    parser.add_argument("--dry-run", action="store_true",
                        help="Print plan only, no API writes")
    parser.add_argument("--json-out", default=None, help="Write report JSON to path")
    args = parser.parse_args()

    if not args.repo:
        print("error: --repo or GITHUB_REPOSITORY required", file=sys.stderr)
        return 2
    token = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")
    if not token:
        print("error: GITHUB_TOKEN required", file=sys.stderr)
        return 2

    gh = GitHubClient(token, args.repo)

    if args.pr:
        prs = [gh.get_pr(n) for n in args.pr]
    else:
        prs = gh.list_open_prs()

    if not prs:
        print("No open PRs to evaluate.")
        return 0

    oldest = min(datetime.fromisoformat(p["created_at"].replace("Z", "+00:00")) for p in prs)
    main_files, recent_msgs, post_open_diff, security_changed = collect_main_context(gh, oldest)

    reports = []
    for pr in prs:
        snap = build_snapshot(
            gh,
            pr["number"],
            main_files,
            recent_msgs,
            post_open_diff,
            security_changed,
        )
        report = score_pr(snap)
        reports.append({"pr": pr["number"], **asdict(report)})

        line = f"PR #{pr['number']}: drift={report.score:.3f} → {report.disposition}"
        if report.override:
            line += f"  [override: {report.override}]"
        print(line)

        if args.execute and not args.dry_run:
            execute_disposition(gh, pr, report)

    if args.json_out:
        with open(args.json_out, "w", encoding="utf-8") as f:
            json.dump(reports, f, indent=2, default=str)

    return 0


if __name__ == "__main__":
    sys.exit(main())
