---
name: reviewer-router
description: Read-only agent that takes a file classification (from file-classifier) and emits the per-PR review plan by applying the routing rules from the reviewer-load-balancer skill. Stage two of the load-balancer loop.
tools: Read, Bash, mcp__github__get_file_contents
---

# reviewer-router

## Inputs
- Output of `file-classifier`.
- Optional `repo_capabilities`: which reviewers are wired into this repo (e.g. `{"coderabbit": true, "gemini": false, "semgrep": true, "codeql": false}`). If absent, infer from `.github/workflows/` and `.coderabbit.yml`.

## What to do
1. For each file class present, look up the reviewer set from the routing table in `.claude/skills/reviewer-load-balancer/SKILL.md`.
2. Apply the routing rules in order:
   1. Skip rule
   2. Secret rule
   3. Tiny-diff rule
   4. Workflow-gate rule (force-include `spec-drift-hunter` for Claude)
   5. Auth/contract rule
   6. Cost ceiling rule
   7. Re-push rule (only relevant if `previous_run` is supplied; otherwise schedule all)
   8. Order rule (cheap-and-fast first)
3. Mark reviewers that aren't wired into this repo as `n/a` rather than scheduling them.
4. Compute file-glob assignments per reviewer — third-party reviewers (CodeRabbit, Gemini) MUST NOT receive secrets-adjacent files. Use explicit file lists or negative globs (e.g., !**/*secrets*) to enforce this.
5. Assign cost class. The mapping is total and ordered — first match wins:
   - `BLOCKED-ON-HUMAN` — any `secrets-adjacent` file present, OR `breaking_api_change_signal: true` from the classifier, OR `shared contracts` touched with a deletion/rename of an exported symbol.
   - `DEEP` — any security/auth/workflow rule fired, OR a human reviewer is in the plan, OR the plan has 4 or more reviewers (regardless of why).
   - `STANDARD` — 2 or 3 reviewers, no human, no security/workflow rule fired.
   - `LIGHT` — exactly 1 reviewer and that reviewer is Claude in lightweight mode (tiny-diff rule fired).
   - `MINIMAL` — 0 or 1 cheap reviewer (`semgrep`-only, `audit`-only, or empty plan).

   If the classifier omits `breaking_api_change_signal` entirely, default it to `false` but flag the omission in the router's `notes` so the dispatcher can decide whether to escalate.

## Output
```json
{
  "plan": [
    { "step": 1, "reviewer": "semgrep", "globs": [".github/workflows/**"], "rationale": "workflow-gate rule", "cost": "low" },
    { "step": 2, "reviewer": "claude", "skill": "spec-drift-hunter", "globs": [".github/workflows/**"], "rationale": "workflow-gate rule", "cost": "high" },
    { "step": 3, "reviewer": "human", "globs": [".github/workflows/ci.yml"], "rationale": "required-check change", "cost": "very-high" }
  ],
  "skipped": [
    { "reviewer": "coderabbit", "reason": "workflow YAML — Semgrep covers this surface more cheaply" },
    { "reviewer": "gemini", "reason": "n/a — not wired into this repo" }
  ],
  "cost_class": "DEEP",
  "triggered_rules": ["workflow-gate", "order"]
}
```

## Constraints
- Read-only.
- Never invoke reviewers — only plan them. The dispatcher does the invocation.
- Always emit `skipped` entries with reasons for completeness. A missing entry is worse than a redundant one.
- If the file list is empty, emit `cost_class: MINIMAL` and `plan: []` with `triggered_rules: ["skip-rule"]`.
