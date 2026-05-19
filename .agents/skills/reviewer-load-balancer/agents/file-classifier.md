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
   `docs-only`, `workflow/CI`, `infra/IaC`, `runtime-python`, `runtime-ts-js`, `tests`, `shared-contracts`, `lockfiles`, `generated/vendored`, `binary/unsupported`, `secrets-adjacent`.
3. Use glob precedence — earlier classes in the routing table win for ambiguous files. Specifically: `secrets-adjacent` and `generated/vendored` always override their containing directory's natural class.
4. For each file also record: bytes changed, whether the file is new/deleted/renamed, and whether it sits in a security-sensitive directory (`server/middleware*`, `auth*`, `session*`).

## Output
```json
{
  "pr": <number-or-null>,
  "files": [
    { "path": "README.md", "class": "docs-only", "bytes_changed": 412, "status": "modified", "sensitive": false },
    { "path": ".env.example", "class": "secrets-adjacent", "bytes_changed": 8, "status": "modified", "sensitive": true },
    ...
  ],
  "classes_present": ["docs-only", "secrets-adjacent"],
  "totals": { "files": 2, "lines_added": 14, "lines_removed": 3 }
}
```

## Constraints
- Read-only.
- One class per file. If two could apply, prefer the higher-risk class (security > workflow > code > docs > generated).
- Do not invent files. If `mcp__github__pull_request_read` returns nothing, emit `{"files": [], ...}` and let the next stage handle the empty diff.
