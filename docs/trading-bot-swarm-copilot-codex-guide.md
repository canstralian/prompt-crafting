# Trading Bot Swarm: GitHub Copilot + Codex Configuration Guide

## Purpose and scope
This guide defines how GitHub Copilot and Codex should be configured and operated across the Trading Bot Swarm ecosystem (strategy services, execution engines, risk controls, data pipelines, APIs, and platform tooling).

Scope includes:
- Local development behavior (prompting, suggestions, and edit constraints).
- Repository-level quality controls (linting, tests, type checks, and code style).
- Delivery controls (CI/CD gates, semantic release, and protected version tagging).
- Operational safety (secrets handling, observability, and incident-aware automation).

Copilot is treated as a **pair programmer** with strict behavioral rules: it should assist implementation while respecting repository conventions, safety boundaries, and validation requirements. Codex follows the same standards with stronger automation guardrails, including scope control and explicit evidence of checks performed.

> Policy baseline: generated code is a draft until validated by project checks and human review.

## Configuration overview

### Promptcrafting MCP topology inside Trading Bot Swarm
Treat prompt engineering as an execution engine rather than ad hoc writing. In practice, Copilot and Codex should interact with a structured MCP topology that enforces deterministic quality loops:

1. **Lint prompts** for structure and policy violations.
2. **Generate controlled prompt variants**.
3. **Route variants across multiple model backends**.
4. **Evaluate outputs against a test harness**.
5. **Analyze token/latency/cost tradeoffs**.
6. **Rank by quality and economic efficiency**.
7. **Persist best variants with metadata**.
8. **Log telemetry and feed adaptive mutations**.

Conceptually, this is a control loop:
`input -> mutation -> evaluation -> scoring -> versioning -> telemetry -> iteration`.

The architecture objective is not to "author prompts" manually, but to **train prompts** through repeatable feedback cycles.

### Testing and linting
- **Required for code changes**: run linting, type checks, and relevant tests when runtime behavior can change.
- **Docs-only exception**: skip lint/test workflows for documentation-only changes unless documentation references executable examples that were modified.
- Align local validation with CI quality gates to reduce drift.
- Fail fast on broken checks; do not merge with unresolved quality issues.

### 2) Code style and maintainability
- Use formatter + lint tooling consistently (e.g., Prettier + ESLint).
- Follow existing repository patterns before introducing new abstractions.
- Keep functions cohesive and side effects isolated.
- Use domain-consistent naming (orders, fills, positions, risk limits, strategies).

### Async patterns and resilience
- Standardize on `async/await`; avoid mixed paradigms.
- Require timeouts and cancellation for external calls.
- Retry only idempotent operations, with exponential backoff + jitter.
- Add circuit-breaker and rate-limit handling on exchange-facing integrations.
- For model orchestration pipelines, enforce bounded concurrency to avoid burst failures.

### Security defaults
- No hardcoded credentials or tokens.
- Validate/sanitize all external inputs (webhooks, APIs, file imports).
- Apply least-privilege access for CI, bots, and service identities.
- Redact secrets/PII in logs and error messages.

### Logging and observability
- Emit structured logs with request/correlation IDs.
- Track key metrics: order latency, fill ratio, reject/error rate, risk-trigger frequency.
- Instrument traces across API gateway, strategy orchestration, and exchange adapters.
- Define and tune alert thresholds for reliability and trading safety events.

### CI/CD integration
- Quality gates: lint, type check, tests, and security scanning.
- Require all mandatory checks before merge.
- Keep pipelines deterministic with pinned versions and lockfiles.
- Rotate secrets and minimize workflow permissions.

### Version control
- Use conventional commits and semantic versioning.
- Require PR reviews and protected branches.
- Prefer signed commits/tags for provenance.
- Ensure release tags are generated from CI after successful gates.
- Keep PRs focused and small enough for risk-aware review (especially for order routing and risk modules).

## Custom instruction behavior for Codex and Copilot

### Example behavioral rules
1. Never bypass failing lint/tests for code changes.
2. Keep changes tightly scoped to the requested outcome.
3. Request clarification when requirements are ambiguous or contradictory.
4. Avoid introducing new dependencies without explicit approval and rationale.
5. Include a concise change summary plus validation evidence.
6. Apply docs-only optimization: skip heavy checks when only documentation changed.
7. Prefer secure defaults over convenience when suggesting API/client code.

### Conceptual YAML: Copilot custom instructions
```yaml
copilot_instructions:
  role: pair_programmer
  mission:
    - accelerate implementation
    - preserve repository consistency
    - avoid risky speculative edits
  coding_behavior:
    prefer_existing_patterns: true
    suggest_small_reviewable_diffs: true
    avoid_unscoped_refactors: true
    no_hidden_side_effects: true
  quality_rules:
    for_code_changes:
      run_lint: true
      run_typecheck: true
      run_tests: true
      block_if_any_fail: true
      require_ci_green_before_merge: true
    for_docs_only_changes:
      run_lint: optional
      run_typecheck: optional
      run_tests: optional
  security_rules:
    no_hardcoded_secrets: true
    validate_external_inputs: true
    sanitize_logs: true
```

### Conceptual YAML: Codex custom instructions
```yaml
codex_instructions:
  role: automation_agent
  execution_behavior:
    complete_requested_task_end_to_end: true
    keep_changes_scoped: true
    report_commands_and_results: true
    include_validation_evidence: true
  gating:
    code_changes_require:
      - lint
      - typecheck
      - tests
    docs_only_changes:
      allow_skip_heavy_checks: true
  async_resilience:
    use_async_await: true
    require_timeout_and_abort_signal: true
    retry_policy:
      idempotent_only: true
      strategy: exponential_backoff_with_jitter

  security:
    no_hardcoded_secrets: true
    validate_all_external_input: true
    least_privilege_credentials: true
    redact_sensitive_logs: true

  observability:
    structured_logging: true
    include_correlation_ids: true
    emit_metrics_for_critical_paths: true
    trace_external_calls: true

  promptcrafting_control_loop:
    lint_before_generation: true
    generate_variants:
      strategy: controlled_mutation
      default_count: 5
    evaluate_across_models: true
    multi_objective_ranking:
      optimize:
        - quality
        - robustness
        - cost
    persist_best_variant: true
    telemetry_feedback:
      adapt_mutation_strategy: true
      examples:
        underspecified_output: increase_constraints
        too_verbose: compress_and_clarify
        cost_too_high: token_optimization
```

---

## GitHub workflow example: lint + test automation

### Trigger conditions
- Run on pushes to `main`.
- Run on pull requests targeting `main`.
- Ignore docs-only paths for this workflow to reduce unnecessary CI load.

### Quality gate job steps
1. Checkout repository.
2. Setup Node runtime.
3. Install dependencies with lockfile fidelity.
4. Run lint.
5. Run typecheck.
6. Run tests.

```yaml
name: quality-gate
on:
  push: &quality_trigger
    branches: [main]
    paths-ignore:
      - "docs/**"
      - "**/*.md"
  pull_request: *quality_trigger

jobs:
  quality-gate:
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npm run typecheck

      - name: Test
        run: npm test
```

---

## Best-practice workflow: semantic release and version tagging
- Enforce conventional commits for clean changelog generation.
- Run release automation only on protected mainline branches.
- Publish tags/releases only after successful quality gates.
- Require signed, immutable tags for auditable rollbacks.

```yaml
name: release
on:
  push:
    branches: [main]

jobs:
  semantic-release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      issues: write
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - name: Semantic release
        run: npx semantic-release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## Best-practice workflow: security and dependency scanning
- Use Dependabot/Renovate for routine dependency updates.
- Schedule security scans and allow manual runs.
- Fail on high/critical vulnerabilities and triage with SLA targets.
- Include secret scanning and supply-chain visibility (SBOM/provenance) where possible.

```yaml
name: security-and-dependency-scan
on:
  schedule:
    - cron: "0 3 * * 1"
  workflow_dispatch:

jobs:
  security-scan:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      security-events: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - name: Dependency audit
        run: npm audit --audit-level=high
      - name: Static analysis baseline
        run: npm run lint
      - name: Secret scan (example)
        run: echo "Integrate gitleaks/trufflehog in production workflows"
```

---

## Deployment architecture guardrails (Cloudflare)

To prevent CI instability and deployment confusion, choose a single model intentionally:

### A) Worker deployment model (Wrangler-controlled)
Use this when the application runtime is a Cloudflare Worker.

- Add `wrangler` to devDependencies.
- Ensure `wrangler.toml` includes `main` and `compatibility_date`.
- Deploy with `wrangler deploy` (or `wrangler versions upload <entrypoint>`).
- If multiple environments exist, always provide `--env` explicitly.

Conceptual `wrangler.toml`:

```toml
name = "trading-bot-worker"
main = "src/index.ts"
compatibility_date = "2024-05-15"
```

### B) Pages deployment model (artifact-controlled)
Use this for static SPA/SSR build output hosted on Cloudflare Pages.

- Configure build command and output directory in Pages.
- Do **not** run `wrangler versions upload` for Pages-only deployments.
- Do **not** require Worker `main` entrypoint when only static assets are deployed.

Recommended Pages settings:

- Build command: `bun run build` (or `npm run build`)
- Output directory: `dist`

### Common failure pattern and fix
If CI runs `npx wrangler versions upload` and fails with:
- `Missing entry-point to Worker script or to assets directory`

Then either:
1. switch to Worker model and set `main`, then deploy Worker code, or
2. switch to Pages model and remove Wrangler Worker deploy commands from deploy step.

This rule should be encoded in repository docs and CI templates to avoid model mixing.

---

## Contributor guidelines

### Proposing changes
- Branch from `main` with focused, minimal scope.
- Use conventional commits.
- Include tests for behavior changes.
- Document risk assumptions for strategy/execution-impacting updates.

### Review criteria
- Functional correctness and trading-risk alignment.
- Security posture (validation, secret handling, permissions).
- Observability completeness (logs, metrics, traces).
- Performance impact and failure-mode handling.
- Clarity and maintainability of implementation.
- Prompt-system scoring rationale is explicit: reviewers can see whether change favors performance, robustness, elegance, or a weighted blend.

### Validation process
- Required CI checks must pass.
- At least one approved review from a code owner or designated maintainer.
- Validate risky changes with reproducible evidence (test output, benchmarks, or replay data).
- For trading-critical paths, require evidence of failure-mode behavior (timeouts, retries, and safe fallback).

## Troubleshooting and optimization tips
- **Flaky tests**: remove nondeterministic network/time dependencies, seed data deterministically.
- **Slow CI**: cache dependencies, split independent jobs, parallelize test shards.
- **Lint noise**: ratchet rules incrementally; assign ownership by package.
- **Rate-limit errors**: add adaptive retry/jitter and queue buffering.
- **Dependency drift**: pin runtime/tool versions and verify lockfile integrity in CI.

---

## Maintenance schedule
- Review this guide **quarterly**.
- Update immediately when standards change for:
  - Coding conventions
  - Security baselines
  - CI/CD pipeline behavior
  - Runtime/toolchain versions
  - Release governance

## Scoring-function governance
For trading automation, document scoring priorities per domain:

- **Performance-first**: maximize latency/throughput outcomes for fast decision paths.
- **Robustness-first**: maximize stable behavior under noisy data, API failures, and degraded dependencies.
- **Elegance-first**: prefer concise prompts/code only after quality and safety thresholds pass.

Require every major prompt-orchestration update to state which objective dominates and why. This prevents silent drift in optimization goals between teams.

---

## Closing note
The goal of this guide is to standardize excellence across the Trading Bot Swarm so every contribution strengthens ecosystem reliability, performance, and safety.
