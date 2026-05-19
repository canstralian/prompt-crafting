---
name: reviewer-load-balancer
description: Decide which code reviewers (CodeRabbit, Gemini, Semgrep, CodeQL, Claude/Codex agents, human) should run on a PR, in what order, and on which files — so cheap PRs get cheap reviews and expensive reviewers are reserved for changes that warrant them. Use when opening a PR, when reviewer cost is showing up in budget, when a PR keeps re-triggering full review on trivial doc edits, or when the user asks "who should review this?", "skip AI review on this PR", "route this to the right reviewer", "is this PR worth a full review?". Output: a routing plan listing each reviewer to invoke, the file globs they should look at, the order, the skip rationale for reviewers that were excluded, and an estimated cost class.
---

# Reviewer Load Balancer

A decision layer that sits in front of a multi-agent review ecosystem and routes review work to the cheapest reviewer that can answer the question at hand. The goal is to stop paying for full AI review on docs-only changes and to stop missing real risk on workflow/auth changes that got rubber-stamped.

## When to invoke

- A PR has just been opened and you need a review plan.
- You're sweeping a backlog of stale PRs and need to triage which deserve attention.
- The user says: "route reviewers for this PR", "who should look at this?", "is this PR worth a full review?", "balance review load", "skip review on this".
- You're inside the `babysit-prs` / `loop` flow and want to avoid re-running expensive reviewers on every push.

Do NOT invoke for: the actual review (use `/review` or the routed reviewer). This skill only PLANS the routing; the routed reviewers do the work.

## The reviewer roster

Treat each reviewer as having a fixed cost, latency, and competence profile. Update the table as new reviewers come online.

| Reviewer | Cost | Latency | Best at | Bad at |
|---|---|---|---|---|
| **Semgrep** | low | seconds | Pattern-based code smells, known anti-patterns, security rules with high precision | Semantic / cross-file reasoning |
| **CodeQL** | medium | minutes | Data-flow & taint analysis, deeper security findings | Style, formatting, intent |
| **CodeRabbit** | medium | seconds-minutes | Line-by-line review comments, style/clarity, minor bugs | Architectural drift, security depth |
| **Gemini** | medium | seconds | Broad PR summary, alternate-perspective review | Project-specific conventions |
| **Claude/Codex agent** | high | seconds-minutes | Repo-aware review, project conventions, design-level critique, drift hunting | Bulk pattern-matching (Semgrep is cheaper) |
| **Human reviewer** | very high | hours-days | Judgement calls, business context, irreversible decisions | Scale |

## File-class routing table

Classify every changed file into ONE class. Then union the reviewers for all classes present in the PR.

| File class | Globs | Reviewers to invoke | Skip |
|---|---|---|---|
| **docs-only** | `**/*.md`, `docs/**`, `README*`, `CHANGELOG*`, `LICENSE*` | Claude (lightweight: typos, broken links, drift vs. code) | Semgrep, CodeQL, Gemini |
| **workflow / CI** | `.github/workflows/**`, `.pre-commit-config.yaml`, `.circleci/**`, `Dockerfile*`, `docker-compose*.yml` | Semgrep (workflow rules), CodeQL (if available), Claude (drift hunter), **human if changes branch protection or required checks** | CodeRabbit |
| **infra / IaC** | `*.tf`, `wrangler.toml`, `supabase/**`, `alembic.ini`, `migrations/**`, `cargo.toml` | Semgrep, Claude (review skill), human if production schema | CodeRabbit, Gemini |
| **runtime Python** | `**/*.py` (non-test) | Ruff/mypy (lint+type), Semgrep, CodeQL, Claude | Gemini |
| **runtime TS/JS** | `**/*.{ts,tsx,js,jsx}` (non-test) | ESLint, tsc, Semgrep, CodeRabbit, Claude | Gemini |
| **tests** | `**/*.test.*`, `**/*.spec.*`, `tests/**` | Claude (assert the assertion is meaningful), test runner in CI | Semgrep, CodeQL |
| **shared contracts** | `shared/schema.ts`, `schemas/**`, `openapi*.{yaml,json}`, Zod/Drizzle definitions | Claude (drift hunter), Semgrep, **human if API breaking** | Gemini |
| **lockfiles** | `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, `Cargo.lock`, `poetry.lock`, `uv.lock` | npm audit / cargo audit / equivalent | All AI reviewers (diff is unreadable; trust the audit) |
| **generated / vendored** | `dist/**`, `build/**`, `coverage/**`, `node_modules/**`, `*.min.js`, `vendor/**` | nothing | Everything (these should not be in a PR — flag the inclusion as a finding) |
| **binary / unsupported** | `*.png`, `*.jpg`, `*.pdf`, `*.zip`, `*.wasm`, `*.bin` | nothing | All AI reviewers |
| **secrets-adjacent** | `.env*`, `*.pem`, `*.key`, `credentials*`, `*secrets*` | Secret scanner (e.g., `mcp__github__run_secret_scanning`), human | All other AI reviewers (do not echo content) |

## Routing rules

Apply in order. First match wins per rule; rules accumulate per PR.

1. **Skip rule.** If 100% of files are in `binary/unsupported` or `generated/vendored`, emit `review: SKIP` and stop. Cost: zero.
2. **Secret rule.** If any file is `secrets-adjacent`, force a secret scan and a human review. Never send secret-adjacent content to a third-party reviewer (CodeRabbit, Gemini) — the file is excluded from their globs even if the PR also touches other classes.
3. **Tiny-diff rule.** If the diff is ≤ 20 lines AND no file class above `docs-only` is touched AND no security-sensitive area is touched → lightweight Claude review only.
4. **Workflow-gate rule.** If any `.github/workflows/**` or branch-protection-adjacent file is touched, ALWAYS include the spec-drift-hunter skill in the plan (workflow claims commonly drift from reality).
5. **Auth / contract rule.** If any file under `server/middleware*`, `server/routes*`, `shared/schema*`, or anything matching `auth|session|csrf|rate.?limit` is touched → escalate Claude to "deep review" mode and add human reviewer.
6. **Cost ceiling rule.** Do not invoke more than 4 distinct reviewers on a single PR unless one of the security/auth/workflow rules forced it. If the union exceeds 4, drop in this order: Gemini, CodeRabbit, CodeQL — keep Semgrep, Claude, and any human-required reviewer.
7. **Re-push rule.** On a re-push to an open PR, only re-invoke reviewers whose covered files changed since the previous run. Doc-typo fixes don't re-trigger CodeQL.
8. **Order rule.** Run cheap-and-fast first so they can short-circuit: Semgrep → CodeRabbit → Gemini → CodeQL → Claude → human. Human gets the AI findings as input.

## Output format

```
# Reviewer Routing Plan — <PR ref or scope>

## Diff summary
- Files changed: <count>
- Lines added/removed: +<a> / -<r>
- File classes detected: <list>
- Triggered rules: <list of rule names>

## Reviewers to invoke (in order)
1. <reviewer> — globs: <list>; rationale: <one line>; cost: <low|med|high>
2. ...

## Reviewers skipped
- <reviewer> — reason: <one line>

## Cost class
<MINIMAL | LIGHT | STANDARD | DEEP | BLOCKED-ON-HUMAN>

## Notes
- <any heuristic overrides, e.g. "diff includes generated file dist/foo.js — flag this in PR description">
```

## Operating rules

- **Plan only.** This skill does not run reviewers. It emits the plan. A separate step (or the user) invokes each reviewer.
- **One classification per file.** A `.py` test file is `tests`, not `runtime Python`. Otherwise budgets double-count.
- **Be explicit about skips.** Every excluded reviewer needs a one-line reason. Silent skips erode trust in the router.
- **Don't route what you don't have.** If CodeQL or Gemini aren't configured in this repo, mark them `n/a` instead of pretending to schedule them. Check `.github/workflows/` for what's actually wired up.
- **Re-classify on each push.** A PR that started doc-only and grew a workflow change crosses into `workflow/CI` and must re-route.
- **Respect repo conventions.** This repo's `CLAUDE.md` documents `strictNullChecks: false` and `noImplicitAny: false` as known technical debt — don't waste a reviewer flagging those.

## Examples

**Example 1 — docs-only PR**
- Files: `README.md`, `docs/foo.md`
- Class union: `{docs-only}`
- Triggered: tiny-diff rule (8 lines), rule 3
- Plan: Claude (lightweight) only. Skip Semgrep, CodeQL, CodeRabbit, Gemini, human.
- Cost class: MINIMAL

**Example 2 — workflow YAML**
- Files: `.github/workflows/ci.yml`, `.github/workflows/semgrep.yml`
- Class union: `{workflow/CI}`
- Triggered: workflow-gate rule (4)
- Plan: Semgrep → CodeQL → Claude (with spec-drift-hunter skill) → human (because required checks may be affected).
- Cost class: DEEP

**Example 3 — runtime Python**
- Files: `prompt_crafting/foo.py`, `prompt_crafting/bar.py`, `tests/test_foo.py`
- Class union: `{runtime Python, tests}`
- Triggered: none of the security/auth rules
- Plan: Ruff + mypy → Semgrep → CodeQL → Claude. Skip Gemini (cost ceiling), skip CodeRabbit (Claude+CodeQL+Semgrep cover the same surface here).
- Cost class: STANDARD

**Example 4 — binary asset**
- Files: `public/logo.png`, `attached_assets/diagram.pdf`
- Class union: `{binary/unsupported}`
- Triggered: skip rule (1)
- Plan: SKIP. Optionally: verify files are tracked in LFS / not bloating the repo.
- Cost class: MINIMAL

**Example 5 — secret-adjacent leak risk**
- Files: `.env.example`, `server/routes.ts`
- Class union: `{secrets-adjacent, runtime TS/JS}`
- Triggered: secret rule (2), then runtime TS rules
- Plan: secret scanner → human (mandatory) → Semgrep → Claude. CodeRabbit and Gemini get the `runtime TS/JS` files only — `.env.example` is excluded from their input.
- Cost class: BLOCKED-ON-HUMAN

## Anti-patterns to avoid

- Invoking every reviewer on every PR "to be safe" — that is the problem this skill exists to solve.
- Skipping a reviewer silently. If you skip, say which reviewer and why.
- Routing CodeRabbit/Gemini to `.env*` or secret-adjacent files. Even if the file is a placeholder, the precedent is bad.
- Treating a re-push as a brand-new PR. Use the re-push rule (7) and only re-run reviewers whose files changed.
- Forgetting that human review is also a reviewer to be scheduled — it has the highest cost and must be reserved for changes that justify it.
