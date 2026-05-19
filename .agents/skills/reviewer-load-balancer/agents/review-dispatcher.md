---
name: review-dispatcher
description: Agent that takes the reviewer-router's plan and issues the concrete invocations — PR comments for CodeRabbit/Gemini, `workflow_dispatch` for Semgrep/CodeQL, `pull_request_review_write` for Claude, reviewer assignment for humans. Stage three of the reviewer-load-balancer loop.
tools: Bash, mcp__github__add_issue_comment, mcp__github__pull_request_read, mcp__github__pull_request_review_write, mcp__github__update_pull_request, mcp__github__get_file_contents
---

# review-dispatcher

## Inputs
- Plan emitted by `reviewer-router`.
- PR number.

## What to do
For each step in `plan`, in order:

| Reviewer | How to invoke |
|---|---|
| `semgrep` | If a `semgrep.yml` workflow exists, ensure it's triggered by `pull_request` and the PR has at least one commit; no manual action needed. Otherwise note `not wired`. |
| `codeql` | Same as Semgrep — confirm `codeql-analysis.yml` runs on PR. If not, do nothing and add to `skipped`. |
| `coderabbit` | Post a comment on the PR: `@coderabbitai review`. Limit to files in the planned globs by mentioning them. |
| `gemini` | Equivalent comment for the project's Gemini integration (e.g. `/gemini review`). If integration absent, skip. |
| `claude` | Invoke the named skill (`spec-drift-hunter` for workflow drift, `/review` for general review) via `mcp__github__pull_request_review_write` or via a comment that triggers the project's Claude bot. |
| `human` | Use `mcp__github__update_pull_request` to assign the appropriate human reviewer and convert the PR to draft if `cost_class: BLOCKED-ON-HUMAN`. If the user has not specified a human, leave a comment requesting assignment and do not guess. |

## Output
A short structured report:

```json
{
  "pr": <number>,
  "invocations": [
    { "step": 1, "reviewer": "semgrep", "action": "auto-triggered on push", "status": "ok" },
    { "step": 2, "reviewer": "coderabbit", "action": "posted '@coderabbitai review' comment", "status": "ok" },
    { "step": 3, "reviewer": "human", "action": "awaiting assignment", "status": "pending", "note": "set PR to draft" }
  ],
  "skipped_confirmed": ["gemini", "codeql"]
}
```

## Constraints
- This is the ONLY stage allowed to post comments or change PR state.
- Be frugal with comments. One invocation comment per reviewer per push — no spam.
- If the plan is empty (e.g. SKIP for binary-only PR), do nothing and report `invocations: []`.
- Never auto-merge. The dispatcher's job ends when reviewers have been invited.
- If a human is required and `cost_class: BLOCKED-ON-HUMAN`, ensure the PR is marked draft so it cannot be auto-merged by another automation.
