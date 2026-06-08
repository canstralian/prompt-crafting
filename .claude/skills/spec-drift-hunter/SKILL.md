---
name: spec-drift-hunter
description: Hunt architectural entropy by detecting divergence between what a repository CLAIMS (README, contracts, workflows, tests, issue intent, PR description) and what the code ACTUALLY does (implementation, configuration, CI gates, type coverage). Use when reviewing a PR, auditing a branch before release, triaging stale issues, or whenever you need to answer "do the docs/specs/tests still match the code?" Examples: a PR titled "Semgrep pipeline added" where the workflow exists but no branch protection enforces it; a README that promises "strict typed validation" while new files opt out of mypy; a contract that documents `POST /api/foo` while the route handler returns 404; an issue closed as "fixed" with no corresponding test. Output: a structured drift report grouped by severity with file:line citations and a recommended remediation per finding.
---

# Spec Drift Hunter

A loop that compares **stated intent** against **realized behavior** across seven artifact classes and emits a drift report.

## When to invoke

Run this skill when ANY of these are true:

- You are reviewing a PR and want to verify the description matches the diff.
- A release is being cut and you need to know which README/contract claims are no longer true.
- An issue is being closed and you want to confirm the fix is actually shipped, gated, and tested.
- The user asks: "are the docs still accurate?", "is X actually enforced?", "does the workflow gate what it says it does?", "audit for spec drift", "find architectural entropy", "hunt drift".

Do NOT invoke for: pure code review (use `/review`), pure security review (use `/security-review`), or generic refactoring requests.

## The seven artifacts

Always pull evidence from all seven. Missing artifacts are themselves a finding (record as `missing-artifact` severity `info`).

| # | Artifact | Where it lives | Encodes |
|---|---|---|---|
| 1 | README / docs | `README.md`, `docs/`, `replit.md`, `CLAUDE.md` | Project promises, supported features, configuration claims |
| 2 | Contracts | `shared/schema.ts`, `schemas/`, OpenAPI/JSON-schema files, Zod schemas, Drizzle tables | API shape, data shape, validation rules |
| 3 | Workflows | `.github/workflows/*.yml`, `.pre-commit-config.yaml`, branch protection (via `mcp__github__*`) | What CI actually enforces, what gates merges |
| 4 | Tests | `**/*.test.*`, `**/*.spec.*`, `vitest.config.ts`, `pytest.ini` | What behavior is exercised and asserted |
| 5 | Implementation | `client/src/**`, `server/**`, `src/**`, route handlers, middleware | What the code actually does at runtime |
| 6 | Issue intent | GitHub issues referenced by the PR (`Closes #N`, `Fixes #N`) — fetch via `mcp__github__issue_read` | What the user/maintainer asked for |
| 7 | PR description | The PR body itself — fetch via `mcp__github__pull_request_read` | What the author claims this change does |

## Loop

1. **Collect.** Read all seven artifacts for the scope under review (whole repo, single PR, single subsystem). Use parallel tool calls. For PR reviews, diff `HEAD` against the merge base.
2. **Extract claims.** From artifacts 1, 2, 6, 7 — pull every concrete assertion: "X is enforced", "POST /api/foo returns Y", "field Z is required", "this PR adds W". One claim per row. Keep file:line provenance.
3. **Verify each claim** against artifacts 3, 4, 5:
   - **Workflow claim?** Open the YAML. Confirm the step exists, the job is required, the check is in branch protection, and the failure mode is `exit 1` not `continue-on-error: true`.
   - **Type/lint claim?** `grep` for `# type: ignore`, `// @ts-ignore`, `// eslint-disable`, `any`, `mypy: ignore`, `strict: false`, `skipLibCheck` in the changed files.
   - **Contract claim?** Grep the implementation for a matching route/handler/field. Confirm the Zod/Drizzle schema is actually imported and validated at the boundary.
   - **Test claim?** Confirm a test file exists, asserts the claimed behavior, and is included in the test runner's globs.
   - **Issue intent?** Confirm the change set actually addresses the linked issue's acceptance criteria.
4. **Classify each finding** by severity (see rubric below).
5. **Emit the report** in the format below. Cite `path:line` for every claim and every piece of contrary evidence.

## Severity rubric

- **critical** — Security or correctness claim is false (e.g., "auth required" but route is open; "validated input" but no schema is called; "secrets scanning enabled" but the job has `continue-on-error: true`).
- **high** — Workflow/gate claim is false (CI step exists but is not required; lint/type promise made but bypasses are merged).
- **medium** — Contract drift (README/schema documents a field or endpoint that no longer exists, or vice versa).
- **low** — Documentation lag (description is stale but no runtime impact).
- **info** — Missing artifact, undocumented behavior, or a claim that cannot be verified from the repo alone.

## Output format

```markdown
# Spec Drift Report — <scope>

## Summary
- Artifacts inspected: <count>
- Claims extracted: <count>
- Drift findings: <critical> critical, <high> high, <medium> medium, <low> low
- Verdict: <ALIGNED | MINOR DRIFT | MAJOR DRIFT | BLOCKED>

## Findings

### [SEVERITY] <one-line title>
- **Claim:** <verbatim, with file:line>
- **Reality:** <what the code/config actually does, with file:line>
- **Why it matters:** <one sentence>
- **Fix:** <smallest change that re-aligns claim and reality — either update the claim or update the code>

(repeat per finding, sorted by severity desc)

## Unverified claims
<list claims that need external context (production config, secrets, third-party state) to verify>
```

## Operating rules

- **Cite or it didn't happen.** Every claim and every piece of contrary evidence MUST carry a `path:line` reference. No vague "the workflow doesn't enforce this" — point at the YAML line.
- **Drift is symmetric.** Either the claim is wrong or the code is wrong. Recommend whichever fix is smaller. Don't default to "update the code."
- **Do not fabricate findings.** If the seven artifacts agree, say so explicitly (`verdict: ALIGNED`). A clean report is a valid result.
- **Don't auto-fix.** This skill diagnoses; it does not patch. If the user wants fixes applied, they'll ask after seeing the report.
- **Respect scope.** A PR-scoped run only flags drift introduced or worsened by that PR. A repo-wide audit flags everything.
- **Branch protection is invisible without GitHub.** When the PR/branch-protection state matters, use `mcp__github__*` tools; if unavailable, mark those claims `info / unverified` rather than guessing.

## Examples

**Example 1 — Workflow gate claim is false (high)**
- Claim: PR title says "Semgrep pipeline added" (`PR #123 body`)
- Reality: `.github/workflows/semgrep.yml:18` defines the job, but `mcp__github__pull_request_read` shows the `semgrep` check is not in required status checks for `main`.
- Fix: Add `semgrep` to required checks, OR change the PR title/description to "Semgrep workflow added (not yet enforced)".

**Example 2 — Type-safety claim is false (high)**
- Claim: `README.md:42` — "strict typed validation throughout"
- Reality: `server/routes.ts:88` uses `req.body as any`; `CLAUDE.md:128` documents `strictNullChecks: false` and `noImplicitAny: false` as standing technical debt.
- Fix: Update README to match the documented technical debt, OR file an issue to actually enable strict mode and remove the `as any` casts.

**Example 3 — Contract drift (medium)**
- Claim: `README.md:88` documents `PATCH /api/test-runs/:id/notes`
- Reality: `server/routes.ts` exposes `PATCH /api/test-runs/:id/ratings` (per `CLAUDE.md:80`); no `/notes` handler exists.
- Fix: Update README to reflect the actual route, OR add the missing handler if the documented endpoint was the intended design.

## Anti-patterns to avoid

- Reporting "the README is out of date" without naming the specific stale claim and the contradicting code.
- Treating absence of evidence as evidence of absence (e.g., "I didn't find a test, therefore none exists"). Search broadly first.
- Inflating severity. A typo in a docstring is `low`, not `critical`. Reserve `critical` for security/correctness lies.
- Recommending large refactors. The remediation is always the smallest change that makes claim and reality agree.
