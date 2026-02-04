# Trading Bot Swarm: GitHub Copilot + Codex Configuration Guide

## 1. Purpose and Scope
This guide standardizes how GitHub Copilot and Codex operate within the Trading Bot Swarm ecosystem. It positions Copilot as a **pair programmer with strict behavioral rules**, and Codex as a **policy-driven automation agent** that enforces code quality, safety, and maintainability. The goal is consistent engineering practices across contributors, automated tooling, and CI/CD workflows.

---

## 2. Configuration Overview
Below is the baseline configuration that every repo in the Trading Bot Swarm should adopt.

### Testing
- **Always run unit tests** when production code changes.
- **Skip tests** only for pure documentation updates.
- Use fast test suites by default; full integration tests run in CI.

### Linting
- Run linters locally before pushing.
- Lint failures block merges.
- Use language-specific linters (e.g., `eslint`, `flake8`, `golangci-lint`).

### Code Style
- Enforce formatter rules (e.g., Prettier, Black, gofmt).
- Prefer explicit typing and small, composable functions.
- Avoid ambiguous or implicit behavior.

### Async Patterns
- Favor **structured concurrency** and explicit cancellation tokens.
- Enforce timeouts on external calls.
- Protect shared resources with locks or transactional primitives.

### Security Defaults
- Secrets **never** logged or printed.
- Use least-privilege API keys and scopes.
- Enforce input validation and output encoding.

### Logging & Observability
- Structured logging (JSON) with correlation IDs.
- Metrics for latency, error rate, and throughput.
- Distributed tracing enabled in production.

### CI/CD Integration
- Lint + test pipelines run on every PR.
- Security scans run nightly and on release tags.
- Release workflows require green checks.

### Version Control
- Trunk-based workflow with short-lived branches.
- PRs must include tests and lint status.
- Semantic versioning for all tagged releases.

---

## 3. Custom Instruction Behavior (Codex + Copilot)

### Example Behavioral Rules
- **Copilot**: “Only suggest code that passes linting and respects project conventions.”
- **Codex**: “Run tests for code changes; skip for docs-only changes.”
- **Both**: “Prefer explicit error handling and secure defaults.”

### Conceptual YAML (Full Custom Instructions)
```yaml
copilot:
  role: "pair_programmer"
  principles:
    - "follow project code style"
    - "avoid implicit behavior"
    - "respect security defaults"
  testing:
    run_on:
      - code_changes
    skip_on:
      - documentation_only
  linting:
    required: true

codex:
  role: "automation_agent"
  behavior:
    - "enforce lint and tests"
    - "highlight security risks"
    - "refuse unsafe code paths"
  testing:
    run_on:
      - code_changes
    skip_on:
      - documentation_only
  documentation:
    enforce_updates:
      - "if public API changes"
```

---

## 4. GitHub Workflow Example: Lint + Test Automation

### Trigger Conditions
- Run on every **pull request** to `main`.
- Run on every **push** to `main`.

### Example Workflow
```yaml
name: quality-gate

on:
  pull_request:
    branches: ["main"]
  push:
    branches: ["main"]

jobs:
  quality-gate:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Test
        run: npm run test
```

---

## 5. Semantic Release & Version Tagging

### Best Practice Workflow
- Use conventional commits (`feat`, `fix`, `chore`).
- Release automation calculates version based on commit messages.
- Tags are immutable and signed.

### Example Semantic Release Workflow
```yaml
name: semantic-release

on:
  push:
    branches: ["main"]

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: npx semantic-release
```

---

## 6. Security & Dependency Scanning

### Dependency Scanning Example
```yaml
name: dependency-scan

on:
  schedule:
    - cron: "0 3 * * 1"
  workflow_dispatch:

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Run Snyk
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high
```

---

## 7. Contributor Guidelines

### Proposing Changes
- Open an issue or draft PR describing the change.
- Include tests for any logic or behavior updates.
- Document API changes in release notes.

### Review Criteria
- Code passes lint + tests.
- Security defaults preserved.
- Clear readability and maintainability.

### Validation Process
- CI must be green.
- At least one senior reviewer approval.
- No unresolved security flags.

---

## 8. Troubleshooting & Optimization

### Common Issues
- **Lint failures**: Run `npm run lint -- --fix` before pushing.
- **Test flakiness**: Isolate async tests and enforce timeouts.
- **Security scan alerts**: Verify severity and patch dependencies.

### Optimization Tips
- Cache dependencies in CI to reduce build time.
- Use smaller, focused tests for critical paths.
- Automate dependency updates with Renovate or Dependabot.

---

## 9. Maintenance Schedule
- **Monthly**: Review lint + test rules for relevance.
- **Quarterly**: Validate Copilot + Codex instructions against new tooling.
- **Release cycle**: Update workflows for new CI/CD policies.

---

## 10. Final Note
This guide ensures standardized excellence across the Trading Bot Swarm ecosystem, strengthening reliability, performance, and safety while enabling rapid, secure automation.

---

## Appendix A: Iterative Quality Improvement (Example Format)

### 1. Code Snippet/Project Description
The Trading Bot Swarm configuration guide defines how Copilot and Codex should enforce standards for quality, security, and automation across repositories.

### 2. Initial Code Analysis
Potential risks include missing lint/test enforcement, inconsistent release tagging, and lack of security scanning guidelines.

### 3. Iteration 1: Linting Errors and Corrections
**Identified issues:** Missing lint gate in CI, unclear local lint usage.

**Resolution steps:**
1. Add a lint step in the quality-gate workflow.
2. Require lint to pass before merges.

**Example fix:**
```yaml
- name: Lint
  run: npm run lint
```

### 4. Iteration 2: Code Readability and Style Improvements
**Identified issues:** Dense CI description, ambiguous rules.

**Resolution steps:**
1. Break configuration into sections (testing, linting, security).
2. Add bullet lists and consistent headings.

### 5. Iteration 3: Code Quality and Best Practices
**Identified issues:** No semantic release workflow or dependency scans.

**Resolution steps:**
1. Add semantic release example.
2. Add dependency scanning workflow.

### 6. Final Code Review
The guide now enforces linting, testing, release discipline, and security scanning with clear, readable structure.

### 7. Revised Code Snippet/Project
See sections 1–10 for the complete, updated guide and configuration examples.
