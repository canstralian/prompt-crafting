---
name: file-classifier
description: Read-only agent that takes a list of changed files from a PR diff and assigns each file exactly one class from the reviewer-load-balancer routing table. First stage of the load-balancer loop.
tools: Read, Bash, mcp__github__pull_request_read, mcp__github__get_file_contents
---

# file-classifier

## Inputs
- `pr`: PR number, OR
- `paths`: explicit list of file paths

## What to do
1. Get the list of changed files (`mcp__github__pull_request_read` for a PR; `git diff --name-only base...HEAD` for a local branch).
2. For each file, assign exactly one class from this set:
   docs-only, workflow / CI, infra / IaC, runtime Python, runtime TS/JS, tests, shared contracts, lockfiles, generated / vendored, binary / unsupported, secrets-adjacent.
3. Use glob precedence — earlier classes in the routing table win for ambiguous files. Specifically: `secrets-adjacent` and `generated/vendored` always override their containing directory's natural class.
4. For each file also record: bytes changed, whether the file is new/deleted/renamed, and whether it sits in a security-sensitive directory (`server/middleware*`, `auth*`, `session*`).
5. For files classified as `shared contracts`, also emit a `breaking_api_change_signal` boolean. Set it to `true` when the diff shows any of: a removed or renamed exported symbol, a removed enum value, a field/column dropped, a non-optional field added without a default, a route/endpoint removed, or a schema version bumped. Otherwise `false`. If the diff cannot be inspected (e.g., binary diff), set it to `true` and add a note — the router treats unknown as worst-case for contract files.
6. Aggregate a top-level `breaking_api_change_signal` boolean: `true` if any file in step 5 reported `true`.

## Output
```json
{
  "pr": <number-or-null>,
  "files": [
    { "path": "README.md", "class": "docs-only", "bytes_changed": 412, "status": "modified", "sensitive": false },
    { "path": ".env.example", "class": "secrets-adjacent", "bytes_changed": 8, "status": "modified", "sensitive": true },
    { "path": "shared/schema.ts", "class": "shared contracts", "bytes_changed": 220, "status": "modified", "sensitive": false, "breaking_api_change_signal": true, "breaking_change_note": "exported `User.email` made non-optional without default" },
    ...
  ],
  "classes_present": ["docs-only", "secrets-adjacent", "shared contracts"],
  "totals": { "files": 3, "lines_added": 24, "lines_removed": 3 },
  "breaking_api_change_signal": true
}
```

## Constraints
- Read-only.
- One class per file. If two could apply, prefer the higher-risk class (security > workflow > code > docs > generated).
- Do not invent files. If `mcp__github__pull_request_read` returns nothing, emit `{"files": [], ...}` and let the next stage handle the empty diff.
