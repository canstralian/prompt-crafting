# ADR-001: Repository Boundaries

**Status**: Accepted
**Date**: 2026-02-03

## Context

The `prompt-crafting` repository was created as a React/TypeScript SaaS application
for prompt-engineering workflows. Over time, related projects (security MCP servers,
automation tooling, deployment infrastructure) have been proposed for inclusion via
pull requests that would add entire standalone applications as subdirectories.

Merging standalone services into this repository creates several problems:

- **Cognitive overload** — contributors working on the SaaS frontend must navigate
  unrelated server code, deployment scripts, and backend-specific dependencies.
- **CI slowdown** — the test and build pipeline runs against all code in the repo.
  Adding independent services multiplies build time without benefit.
- **Ownership confusion** — a single repository with multiple products blurs who
  reviews what, making security and quality review harder.
- **Deployment coupling** — independent services need their own release cycles.
  Sharing a repository creates accidental coupling between unrelated deployments.

## Decision

This repository contains **only** the PromptCrafting SaaS product and its direct
supporting assets:

| Belongs here | Does NOT belong here |
|---|---|
| React frontend (`src/`) | Standalone API servers |
| Supabase migrations and functions (`supabase/`) | MCP server implementations |
| CI/CD for this application (`.github/`) | Infrastructure-as-code for other services |
| Prompt testing scripts (`scripts/`, `data/`) | Libraries with independent audiences |
| Product documentation (`docs/`) | Full-stack applications for other products |

External projects should be:

1. Maintained in their own repositories.
2. Referenced via npm package dependency when code reuse is needed.
3. Documented via links or minimal extracted examples under `docs/examples/`.

## Consequences

- Pull requests that introduce standalone applications as subdirectories will be
  rejected and redirected to separate repositories.
- The PR template includes a scope checklist to catch boundary violations early.
- Integration patterns from external projects can still be documented here as
  examples, keeping the educational value without the structural cost.
- This decision can be revisited if the product scope formally expands (documented
  via a new ADR).
