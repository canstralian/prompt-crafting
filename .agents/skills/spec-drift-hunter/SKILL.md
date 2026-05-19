---
name: spec-drift-hunter
description: Hunt architectural entropy by detecting divergence between what a repository CLAIMS (README, contracts, workflows, tests, issue intent, PR description) and what the code ACTUALLY does (implementation, configuration, CI gates, type coverage). Use when reviewing a PR, auditing a branch before release, triaging stale issues, or whenever you need to answer "do the docs/specs/tests still match the code?" Output: a structured drift report grouped by severity with file:line citations and a recommended remediation per finding.
---

# Spec Drift Hunter (agent edition)

This is the agent-facing variant of the `spec-drift-hunter` skill. The full operating spec lives at `.claude/skills/spec-drift-hunter/SKILL.md` — read it first. The notes below cover how to run the loop from an autonomous agent context.

## Delegation

For non-trivial scope (multi-subsystem audit, full-repo sweep), delegate evidence collection in parallel:

- `agents/claim-extractor.md` — pulls every assertion out of README, contracts, issue, PR body.
- `agents/reality-prober.md` — verifies each claim against implementation, workflows, tests.
- `agents/drift-reporter.md` — merges the two streams into a single severity-sorted report.

For a single-PR review, you can run the loop inline without delegation.

## Tool budget

- Prefer `Read` and `grep`-via-`Bash` for citations. Use `Explore` only when the file/line is unknown.
- Use `mcp__github__pull_request_read`, `mcp__github__issue_read`, and `mcp__github__list_pull_requests` for PR/issue artifacts.
- Use `mcp__github__get_file_contents` for branch-protection-adjacent inspection (workflows on `main` vs. PR branch).
- Do NOT call `Edit` or `Write` from this skill. It is read-only by design — diagnose, don't patch.

## Stop conditions

- All seven artifact classes inspected (or marked `missing-artifact / info`).
- Every extracted claim has a verdict: aligned, drifted, or unverified.
- Report rendered in the format specified in the main SKILL.md.

Exit silently if the user later asks for fixes; the report is the deliverable.
