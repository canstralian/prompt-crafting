---
name: reviewer-load-balancer
description: Decide which code reviewers (CodeRabbit, Gemini, Semgrep, CodeQL, Claude/Codex agents, human) should run on a PR, in what order, and on which files — so cheap PRs get cheap reviews and expensive reviewers are reserved for changes that warrant them. Output: a routing plan listing each reviewer to invoke, the file globs they should look at, the order, the skip rationale for reviewers that were excluded, and an estimated cost class.
---

# Reviewer Load Balancer (agent edition)

Agent-facing variant. Full spec lives at `.claude/skills/reviewer-load-balancer/SKILL.md` — read it first.

## Delegation

For a single PR you can run the loop inline. For backlog sweeps (10+ PRs), delegate:

- `agents/file-classifier.md` — bucket every changed file into one class from the routing table.
- `agents/reviewer-router.md` — apply the routing rules to the classifications and emit the per-PR plan.
- `agents/review-dispatcher.md` — turn the plan into concrete invocations (workflow_dispatch payload, CodeRabbit `@coderabbitai review` comment, `mcp__github__pull_request_review_write` for Claude, human-reviewer assignment).

For a single PR, all three can run inline.

## Tool budget

- `mcp__github__pull_request_read`, `mcp__github__get_file_contents`, `mcp__github__list_branches` for diff inspection.
- `Bash` + `git diff --name-only` when running locally.
- `mcp__github__add_issue_comment` is dispatcher-only. The dispatcher stage may use it to ping CodeRabbit / Gemini (typically invoked via PR comment) and to request explicit human-reviewer assignment when none is specified. Planner stages (`file-classifier`, `reviewer-router`) must never post commentary.

## Stop conditions

- Every changed file has exactly one classification.
- Every reviewer in the roster is either scheduled or has a one-line skip reason.
- Plan rendered in the format specified in the main SKILL.md.
- Cost class assigned.

## Coordination with sibling skills

- If `workflow/CI` files are touched, the plan MUST include `spec-drift-hunter` (workflow claims drift constantly).
- If the PR is doc-only and tiny, this skill's plan is the entire review — no further skills needed.
- If the plan ends up `BLOCKED-ON-HUMAN`, mark the PR as draft and assign a human reviewer; do not auto-merge.
