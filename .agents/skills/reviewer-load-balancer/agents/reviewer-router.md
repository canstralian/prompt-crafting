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
4. Compute file-glob assignments per reviewer — third-party reviewers (CodeRabbit, Gemini) MUST NOT receive `secrets-adjacent` files even if other classes route them in.
5. Assign cost class: `MINIMAL` (≤1 cheap reviewer), `LIGHT` (Claude lightweight only), `STANDARD` (2-3 reviewers, no human), `DEEP` (security/workflow involved or human added), `BLOCKED-ON-HUMAN` (secret-adjacent or breaking-API change).

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
