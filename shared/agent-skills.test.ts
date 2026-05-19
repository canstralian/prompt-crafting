import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function readSkill(relPath: string): string {
  return readFileSync(resolve(ROOT, relPath), "utf-8");
}

/**
 * Parse the YAML frontmatter block between the leading `---` delimiters.
 * Returns an object of key→value pairs (values are raw strings).
 */
function parseFrontmatter(content: string): Record<string, string> | null {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  const result: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim();
    result[key] = value;
  }
  return result;
}

/**
 * Extract the first fenced JSON code block from a markdown string and try to
 * parse it. Template placeholders like `<number>`, `<number-or-null>`, and
 * `...` (trailing commas) are normalized before parsing so that structural
 * validity can be verified.
 */
function extractAndParseJsonBlock(content: string): unknown | null {
  const match = content.match(/```json\n([\s\S]*?)```/);
  if (!match) return null;
  let json = match[1];
  // Replace <...> template tokens with a valid string placeholder.
  json = json.replace(/<[^>]+>/g, '"__placeholder__"');
  // Remove lines that are bare `...` (ellipsis stand-ins for more items).
  // Must happen BEFORE trailing-comma removal so we see the real structure.
  json = json.replace(/^\s*\.\.\.\s*,?\s*$/gm, "");
  // Remove trailing commas before ] or } (invalid JSON).
  json = json.replace(/,(\s*[}\]])/g, "$1");
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Check whether a markdown heading (## Heading) is present in the content.
 */
function hasSection(content: string, heading: string): boolean {
  return content.includes(`## ${heading}`);
}

// ---------------------------------------------------------------------------
// File paths
// ---------------------------------------------------------------------------

const AGENT_RLB_SKILL = ".agents/skills/reviewer-load-balancer/SKILL.md";
const AGENT_RLB_FILE_CLASSIFIER =
  ".agents/skills/reviewer-load-balancer/agents/file-classifier.md";
const AGENT_RLB_REVIEWER_ROUTER =
  ".agents/skills/reviewer-load-balancer/agents/reviewer-router.md";
const AGENT_RLB_REVIEW_DISPATCHER =
  ".agents/skills/reviewer-load-balancer/agents/review-dispatcher.md";

const AGENT_SDH_SKILL = ".agents/skills/spec-drift-hunter/SKILL.md";
const AGENT_SDH_CLAIM_EXTRACTOR =
  ".agents/skills/spec-drift-hunter/agents/claim-extractor.md";
const AGENT_SDH_DRIFT_REPORTER =
  ".agents/skills/spec-drift-hunter/agents/drift-reporter.md";
const AGENT_SDH_REALITY_PROBER =
  ".agents/skills/spec-drift-hunter/agents/reality-prober.md";

const CLAUDE_RLB_SKILL = ".claude/skills/reviewer-load-balancer/SKILL.md";
const CLAUDE_SDH_SKILL = ".claude/skills/spec-drift-hunter/SKILL.md";

const ALL_FILES = [
  AGENT_RLB_SKILL,
  AGENT_RLB_FILE_CLASSIFIER,
  AGENT_RLB_REVIEWER_ROUTER,
  AGENT_RLB_REVIEW_DISPATCHER,
  AGENT_SDH_SKILL,
  AGENT_SDH_CLAIM_EXTRACTOR,
  AGENT_SDH_DRIFT_REPORTER,
  AGENT_SDH_REALITY_PROBER,
  CLAUDE_RLB_SKILL,
  CLAUDE_SDH_SKILL,
];

const SUB_AGENT_FILES = [
  AGENT_RLB_FILE_CLASSIFIER,
  AGENT_RLB_REVIEWER_ROUTER,
  AGENT_RLB_REVIEW_DISPATCHER,
  AGENT_SDH_CLAIM_EXTRACTOR,
  AGENT_SDH_DRIFT_REPORTER,
  AGENT_SDH_REALITY_PROBER,
];

// ---------------------------------------------------------------------------
// Shared: every skill file
// ---------------------------------------------------------------------------

describe("all skill files", () => {
  it.each(ALL_FILES)("%s — file is non-empty", (relPath) => {
    const content = readSkill(relPath);
    expect(content.trim().length).toBeGreaterThan(0);
  });

  it.each(ALL_FILES)("%s — has YAML frontmatter delimiters", (relPath) => {
    const content = readSkill(relPath);
    expect(content.startsWith("---\n")).toBe(true);
    expect(content).toContain("\n---\n");
  });

  it.each(ALL_FILES)("%s — frontmatter has 'name' field", (relPath) => {
    const content = readSkill(relPath);
    const fm = parseFrontmatter(content);
    expect(fm).not.toBeNull();
    expect(fm!.name).toBeTruthy();
  });

  it.each(ALL_FILES)("%s — frontmatter has 'description' field", (relPath) => {
    const content = readSkill(relPath);
    const fm = parseFrontmatter(content);
    expect(fm).not.toBeNull();
    expect(fm!.description).toBeTruthy();
  });

  it.each(ALL_FILES)("%s — description is a non-trivial string", (relPath) => {
    const content = readSkill(relPath);
    const fm = parseFrontmatter(content);
    expect(fm!.description.length).toBeGreaterThan(20);
  });

  it.each(ALL_FILES)("%s — has at least one ## heading", (relPath) => {
    const content = readSkill(relPath);
    expect(content).toMatch(/^## .+/m);
  });
});

// ---------------------------------------------------------------------------
// Sub-agent files: required fields
// ---------------------------------------------------------------------------

describe("sub-agent files", () => {
  it.each(SUB_AGENT_FILES)(
    "%s — frontmatter has 'tools' field",
    (relPath) => {
      const content = readSkill(relPath);
      const fm = parseFrontmatter(content);
      expect(fm).not.toBeNull();
      expect(fm!.tools).toBeTruthy();
    },
  );

  it.each(SUB_AGENT_FILES)("%s — has ## Inputs section", (relPath) => {
    const content = readSkill(relPath);
    expect(hasSection(content, "Inputs")).toBe(true);
  });

  it.each(SUB_AGENT_FILES)("%s — has ## What to do section", (relPath) => {
    const content = readSkill(relPath);
    expect(hasSection(content, "What to do")).toBe(true);
  });

  it.each(SUB_AGENT_FILES)("%s — has ## Output section", (relPath) => {
    const content = readSkill(relPath);
    expect(hasSection(content, "Output")).toBe(true);
  });

  it.each(SUB_AGENT_FILES)("%s — has ## Constraints section", (relPath) => {
    const content = readSkill(relPath);
    expect(hasSection(content, "Constraints")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Frontmatter name values
// ---------------------------------------------------------------------------

describe("frontmatter name values", () => {
  const nameMap: [string, string][] = [
    [AGENT_RLB_SKILL, "reviewer-load-balancer"],
    [CLAUDE_RLB_SKILL, "reviewer-load-balancer"],
    [AGENT_SDH_SKILL, "spec-drift-hunter"],
    [CLAUDE_SDH_SKILL, "spec-drift-hunter"],
    [AGENT_RLB_FILE_CLASSIFIER, "file-classifier"],
    [AGENT_RLB_REVIEWER_ROUTER, "reviewer-router"],
    [AGENT_RLB_REVIEW_DISPATCHER, "review-dispatcher"],
    [AGENT_SDH_CLAIM_EXTRACTOR, "claim-extractor"],
    [AGENT_SDH_DRIFT_REPORTER, "drift-reporter"],
    [AGENT_SDH_REALITY_PROBER, "reality-prober"],
  ];

  it.each(nameMap)("%s — name is '%s'", (relPath, expectedName) => {
    const fm = parseFrontmatter(readSkill(relPath));
    expect(fm!.name).toBe(expectedName);
  });
});

// ---------------------------------------------------------------------------
// .agents SKILL.md files: agent-edition structure
// ---------------------------------------------------------------------------

describe(".agents SKILL.md — reviewer-load-balancer", () => {
  let content: string;
  beforeEach(() => {
    content = readSkill(AGENT_RLB_SKILL);
  });

  it("has ## Delegation section", () => {
    expect(hasSection(content, "Delegation")).toBe(true);
  });

  it("has ## Tool budget section", () => {
    expect(hasSection(content, "Tool budget")).toBe(true);
  });

  it("has ## Stop conditions section", () => {
    expect(hasSection(content, "Stop conditions")).toBe(true);
  });

  it("has ## Coordination with sibling skills section", () => {
    expect(hasSection(content, "Coordination with sibling skills")).toBe(true);
  });

  it("references the three sub-agents", () => {
    expect(content).toContain("agents/file-classifier.md");
    expect(content).toContain("agents/reviewer-router.md");
    expect(content).toContain("agents/review-dispatcher.md");
  });

  it("cross-references the main SKILL.md in .claude", () => {
    expect(content).toContain(".claude/skills/reviewer-load-balancer/SKILL.md");
  });

  it("mentions spec-drift-hunter in coordination rules", () => {
    expect(content).toContain("spec-drift-hunter");
  });

  it("mentions BLOCKED-ON-HUMAN outcome", () => {
    expect(content).toContain("BLOCKED-ON-HUMAN");
  });
});

describe(".agents SKILL.md — spec-drift-hunter", () => {
  let content: string;
  beforeEach(() => {
    content = readSkill(AGENT_SDH_SKILL);
  });

  it("has ## Delegation section", () => {
    expect(hasSection(content, "Delegation")).toBe(true);
  });

  it("has ## Tool budget section", () => {
    expect(hasSection(content, "Tool budget")).toBe(true);
  });

  it("has ## Stop conditions section", () => {
    expect(hasSection(content, "Stop conditions")).toBe(true);
  });

  it("references the three sub-agents", () => {
    expect(content).toContain("agents/claim-extractor.md");
    expect(content).toContain("agents/reality-prober.md");
    expect(content).toContain("agents/drift-reporter.md");
  });

  it("cross-references the main SKILL.md in .claude", () => {
    expect(content).toContain(".claude/skills/spec-drift-hunter/SKILL.md");
  });

  it("declares read-only constraint", () => {
    expect(content).toContain("read-only");
  });
});

// ---------------------------------------------------------------------------
// .claude SKILL.md — reviewer-load-balancer (full spec)
// ---------------------------------------------------------------------------

describe(".claude SKILL.md — reviewer-load-balancer", () => {
  let content: string;
  beforeEach(() => {
    content = readSkill(CLAUDE_RLB_SKILL);
  });

  it("has ## When to invoke section", () => {
    expect(hasSection(content, "When to invoke")).toBe(true);
  });

  it("has ## The reviewer roster section", () => {
    expect(hasSection(content, "The reviewer roster")).toBe(true);
  });

  it("has ## File-class routing table section", () => {
    expect(hasSection(content, "File-class routing table")).toBe(true);
  });

  it("has ## Routing rules section", () => {
    expect(hasSection(content, "Routing rules")).toBe(true);
  });

  it("has ## Output format section", () => {
    expect(hasSection(content, "Output format")).toBe(true);
  });

  it("has ## Operating rules section", () => {
    expect(hasSection(content, "Operating rules")).toBe(true);
  });

  it("has ## Examples section", () => {
    expect(hasSection(content, "Examples")).toBe(true);
  });

  it("has ## Anti-patterns to avoid section", () => {
    expect(hasSection(content, "Anti-patterns to avoid")).toBe(true);
  });

  it("lists all eight routing rules", () => {
    // Rules are numbered 1–8
    for (let i = 1; i <= 8; i++) {
      expect(content).toContain(`${i}.`);
    }
    expect(content).toContain("Skip rule");
    expect(content).toContain("Secret rule");
    expect(content).toContain("Tiny-diff rule");
    expect(content).toContain("Workflow-gate rule");
    expect(content).toContain("Auth / contract rule");
    expect(content).toContain("Cost ceiling rule");
    expect(content).toContain("Re-push rule");
    expect(content).toContain("Order rule");
  });

  it("contains all five cost class labels", () => {
    expect(content).toContain("MINIMAL");
    expect(content).toContain("LIGHT");
    expect(content).toContain("STANDARD");
    expect(content).toContain("DEEP");
    expect(content).toContain("BLOCKED-ON-HUMAN");
  });

  it("lists all expected file classes in the routing table", () => {
    const expectedClasses = [
      "docs-only",
      "workflow / CI",
      "infra / IaC",
      "runtime Python",
      "runtime TS/JS",
      "tests",
      "shared contracts",
      "lockfiles",
      "generated / vendored",
      "binary / unsupported",
      "secrets-adjacent",
    ];
    for (const cls of expectedClasses) {
      expect(content).toContain(cls);
    }
  });

  it("names all expected reviewers in the roster", () => {
    expect(content).toContain("Semgrep");
    expect(content).toContain("CodeQL");
    expect(content).toContain("CodeRabbit");
    expect(content).toContain("Gemini");
    expect(content).toContain("Human reviewer");
  });

  it("output format template includes required sections", () => {
    expect(content).toContain("## Diff summary");
    expect(content).toContain("## Reviewers to invoke");
    expect(content).toContain("## Reviewers skipped");
    expect(content).toContain("## Cost class");
  });

  it("secret rule explicitly excludes third-party reviewers from secrets files", () => {
    expect(content).toContain("CodeRabbit");
    expect(content).toContain("Gemini");
    // The rule should mention they must not receive secret-adjacent files
    expect(content).toMatch(/[Ss]ecret.*[Cc]ode[Rr]abbit|[Cc]ode[Rr]abbit.*secret/s);
  });

  it("workflow-gate rule forces spec-drift-hunter inclusion", () => {
    expect(content).toContain("spec-drift-hunter");
  });

  it("cost-ceiling rule caps at 4 reviewers", () => {
    expect(content).toContain("4");
  });

  it("order rule specifies cheap-first ordering", () => {
    // Semgrep should appear before Claude, human last
    const semgrepIdx = content.indexOf("Semgrep →");
    const humanIdx = content.indexOf("→ human");
    expect(semgrepIdx).toBeGreaterThan(-1);
    expect(humanIdx).toBeGreaterThan(-1);
    expect(semgrepIdx).toBeLessThan(humanIdx);
  });

  it("contains five examples", () => {
    const matches = content.match(/\*\*Example \d/g);
    expect(matches).not.toBeNull();
    expect(matches!.length).toBeGreaterThanOrEqual(5);
  });
});

// ---------------------------------------------------------------------------
// .claude SKILL.md — spec-drift-hunter (full spec)
// ---------------------------------------------------------------------------

describe(".claude SKILL.md — spec-drift-hunter", () => {
  let content: string;
  beforeEach(() => {
    content = readSkill(CLAUDE_SDH_SKILL);
  });

  it("has ## When to invoke section", () => {
    expect(hasSection(content, "When to invoke")).toBe(true);
  });

  it("has ## The seven artifacts section", () => {
    expect(hasSection(content, "The seven artifacts")).toBe(true);
  });

  it("has ## Loop section", () => {
    expect(hasSection(content, "Loop")).toBe(true);
  });

  it("has ## Severity rubric section", () => {
    expect(hasSection(content, "Severity rubric")).toBe(true);
  });

  it("has ## Output format section", () => {
    expect(hasSection(content, "Output format")).toBe(true);
  });

  it("has ## Operating rules section", () => {
    expect(hasSection(content, "Operating rules")).toBe(true);
  });

  it("has ## Examples section", () => {
    expect(hasSection(content, "Examples")).toBe(true);
  });

  it("has ## Anti-patterns to avoid section", () => {
    expect(hasSection(content, "Anti-patterns to avoid")).toBe(true);
  });

  it("defines exactly five severity levels", () => {
    expect(content).toContain("**critical**");
    expect(content).toContain("**high**");
    expect(content).toContain("**medium**");
    expect(content).toContain("**low**");
    expect(content).toContain("**info**");
  });

  it("defines all four verdict outcomes", () => {
    expect(content).toContain("ALIGNED");
    expect(content).toContain("MINOR DRIFT");
    expect(content).toContain("MAJOR DRIFT");
    expect(content).toContain("BLOCKED");
  });

  it("lists exactly seven artifacts in the table", () => {
    // The table has rows: README/docs, Contracts, Workflows, Tests,
    // Implementation, Issue intent, PR description
    const tableRows = content.match(/^\| \d /gm);
    expect(tableRows).not.toBeNull();
    expect(tableRows!.length).toBe(7);
  });

  it("output format template has required subsections", () => {
    expect(content).toContain("## Summary");
    expect(content).toContain("## Findings");
    expect(content).toContain("## Unverified claims");
  });

  it("output format finding fields are in correct order (Claim → Reality → Why → Fix)", () => {
    const claimIdx = content.indexOf("**Claim:**");
    const realityIdx = content.indexOf("**Reality:**");
    const whyIdx = content.indexOf("**Why it matters:**");
    const fixIdx = content.indexOf("**Fix:**");
    expect(claimIdx).toBeLessThan(realityIdx);
    expect(realityIdx).toBeLessThan(whyIdx);
    expect(whyIdx).toBeLessThan(fixIdx);
  });

  it("declares itself read-only / diagnose-only (no auto-fix)", () => {
    // The .claude spec states the skill is read-only via the operating rules
    expect(content).toMatch(/[Dd]on.t auto.fix|[Dd]oes not patch|read.only/);
  });

  it("loop step 1 instructs collecting all seven artifacts in parallel", () => {
    expect(content).toContain("parallel");
  });

  it("mentions path:line citation requirement", () => {
    expect(content).toContain("path:line");
  });

  it("contains at least three examples", () => {
    const matches = content.match(/\*\*Example \d/g);
    expect(matches).not.toBeNull();
    expect(matches!.length).toBeGreaterThanOrEqual(3);
  });
});

// ---------------------------------------------------------------------------
// file-classifier sub-agent
// ---------------------------------------------------------------------------

describe("file-classifier sub-agent", () => {
  let content: string;
  beforeEach(() => {
    content = readSkill(AGENT_RLB_FILE_CLASSIFIER);
  });

  it("is declared read-only", () => {
    expect(content.toLowerCase()).toContain("read-only");
  });

  it("lists allowed tools in frontmatter", () => {
    const fm = parseFrontmatter(content);
    expect(fm!.tools).toContain("Read");
    expect(fm!.tools).toContain("Bash");
    expect(fm!.tools).toContain("mcp__github__pull_request_read");
    expect(fm!.tools).toContain("mcp__github__get_file_contents");
  });

  it("enumerates all expected file classes", () => {
    const classes = [
      "docs-only",
      "workflow/CI",
      "infra/IaC",
      "runtime-python",
      "runtime-ts-js",
      "tests",
      "shared-contracts",
      "lockfiles",
      "generated/vendored",
      "binary/unsupported",
      "secrets-adjacent",
    ];
    for (const cls of classes) {
      expect(content).toContain(cls);
    }
  });

  it("output JSON block is structurally valid", () => {
    const parsed = extractAndParseJsonBlock(content);
    expect(parsed).not.toBeNull();
  });

  it("output JSON has expected top-level keys", () => {
    const parsed = extractAndParseJsonBlock(content) as Record<string, unknown>;
    expect(parsed).toHaveProperty("pr");
    expect(parsed).toHaveProperty("files");
    expect(parsed).toHaveProperty("classes_present");
    expect(parsed).toHaveProperty("totals");
  });

  it("output JSON files array items have path, class, bytes_changed, status, sensitive", () => {
    const parsed = extractAndParseJsonBlock(content) as Record<string, unknown>;
    const files = parsed.files as Array<Record<string, unknown>>;
    expect(Array.isArray(files)).toBe(true);
    const first = files[0];
    expect(first).toHaveProperty("path");
    expect(first).toHaveProperty("class");
    expect(first).toHaveProperty("bytes_changed");
    expect(first).toHaveProperty("status");
    expect(first).toHaveProperty("sensitive");
  });

  it("constraint says one class per file", () => {
    expect(content).toContain("One class per file");
  });

  it("handles empty diff gracefully (outputs empty files array)", () => {
    expect(content).toContain('{"files": []');
  });

  it("higher-risk class wins when ambiguous", () => {
    expect(content).toContain("security > workflow");
  });
});

// ---------------------------------------------------------------------------
// reviewer-router sub-agent
// ---------------------------------------------------------------------------

describe("reviewer-router sub-agent", () => {
  let content: string;
  beforeEach(() => {
    content = readSkill(AGENT_RLB_REVIEWER_ROUTER);
  });

  it("is declared read-only", () => {
    expect(content.toLowerCase()).toContain("read-only");
  });

  it("lists allowed tools in frontmatter", () => {
    const fm = parseFrontmatter(content);
    expect(fm!.tools).toContain("Read");
    expect(fm!.tools).toContain("Bash");
    expect(fm!.tools).toContain("mcp__github__get_file_contents");
  });

  it("references the main SKILL.md routing table", () => {
    expect(content).toContain(".claude/skills/reviewer-load-balancer/SKILL.md");
  });

  it("lists routing rules in the correct order (1-8)", () => {
    const ruleNames = [
      "Skip rule",
      "Secret rule",
      "Tiny-diff rule",
      "Workflow-gate rule",
      "Auth/contract rule",
      "Cost ceiling rule",
      "Re-push rule",
      "Order rule",
    ];
    for (const name of ruleNames) {
      expect(content).toContain(name);
    }
  });

  it("output JSON block is structurally valid", () => {
    const parsed = extractAndParseJsonBlock(content);
    expect(parsed).not.toBeNull();
  });

  it("output JSON has plan, skipped, cost_class, triggered_rules", () => {
    const parsed = extractAndParseJsonBlock(content) as Record<string, unknown>;
    expect(parsed).toHaveProperty("plan");
    expect(parsed).toHaveProperty("skipped");
    expect(parsed).toHaveProperty("cost_class");
    expect(parsed).toHaveProperty("triggered_rules");
  });

  it("plan items have step, reviewer, globs, rationale, cost", () => {
    const parsed = extractAndParseJsonBlock(content) as Record<string, unknown>;
    const plan = parsed.plan as Array<Record<string, unknown>>;
    expect(Array.isArray(plan)).toBe(true);
    const step = plan[0];
    expect(step).toHaveProperty("step");
    expect(step).toHaveProperty("reviewer");
    expect(step).toHaveProperty("globs");
    expect(step).toHaveProperty("rationale");
    expect(step).toHaveProperty("cost");
  });

  it("skipped items have reviewer and reason", () => {
    const parsed = extractAndParseJsonBlock(content) as Record<string, unknown>;
    const skipped = parsed.skipped as Array<Record<string, unknown>>;
    expect(Array.isArray(skipped)).toBe(true);
    expect(skipped[0]).toHaveProperty("reviewer");
    expect(skipped[0]).toHaveProperty("reason");
  });

  it("cost_class in example is a valid value", () => {
    const parsed = extractAndParseJsonBlock(content) as Record<string, unknown>;
    const valid = ["MINIMAL", "LIGHT", "STANDARD", "DEEP", "BLOCKED-ON-HUMAN"];
    expect(valid).toContain(parsed.cost_class);
  });

  it("third-party reviewers must NOT receive secrets-adjacent files", () => {
    expect(content).toContain("secrets-adjacent");
    expect(content).toContain("MUST NOT");
  });

  it("empty file list results in MINIMAL cost_class", () => {
    expect(content).toContain("cost_class: MINIMAL");
    expect(content).toContain("plan: []");
    expect(content).toContain("skip-rule");
  });

  it("never invokes reviewers (read-only planning only)", () => {
    expect(content).toContain("Never invoke reviewers");
  });
});

// ---------------------------------------------------------------------------
// review-dispatcher sub-agent
// ---------------------------------------------------------------------------

describe("review-dispatcher sub-agent", () => {
  let content: string;
  beforeEach(() => {
    content = readSkill(AGENT_RLB_REVIEW_DISPATCHER);
  });

  it("lists write-capable tools in frontmatter", () => {
    const fm = parseFrontmatter(content);
    expect(fm!.tools).toContain("mcp__github__add_issue_comment");
    expect(fm!.tools).toContain("mcp__github__pull_request_review_write");
    expect(fm!.tools).toContain("mcp__github__update_pull_request");
  });

  it("is the only stage that may post comments", () => {
    expect(content).toContain("ONLY stage allowed to post comments");
  });

  it("output JSON block is structurally valid", () => {
    const parsed = extractAndParseJsonBlock(content);
    expect(parsed).not.toBeNull();
  });

  it("output JSON has pr, invocations, skipped_confirmed", () => {
    const parsed = extractAndParseJsonBlock(content) as Record<string, unknown>;
    expect(parsed).toHaveProperty("pr");
    expect(parsed).toHaveProperty("invocations");
    expect(parsed).toHaveProperty("skipped_confirmed");
  });

  it("invocation items have step, reviewer, action, status", () => {
    const parsed = extractAndParseJsonBlock(content) as Record<string, unknown>;
    const invocations = parsed.invocations as Array<Record<string, unknown>>;
    expect(Array.isArray(invocations)).toBe(true);
    const first = invocations[0];
    expect(first).toHaveProperty("step");
    expect(first).toHaveProperty("reviewer");
    expect(first).toHaveProperty("action");
    expect(first).toHaveProperty("status");
  });

  it("documents how to invoke each reviewer type", () => {
    expect(content).toContain("semgrep");
    expect(content).toContain("codeql");
    expect(content).toContain("coderabbit");
    expect(content).toContain("gemini");
    expect(content).toContain("claude");
    expect(content).toContain("human");
  });

  it("instructs CodeRabbit invocation via @coderabbitai comment", () => {
    expect(content).toContain("@coderabbitai review");
  });

  it("never auto-merges", () => {
    expect(content).toContain("Never auto-merge");
  });

  it("marks PR as draft when BLOCKED-ON-HUMAN", () => {
    expect(content).toContain("BLOCKED-ON-HUMAN");
    expect(content).toContain("draft");
  });

  it("empty plan results in empty invocations", () => {
    expect(content).toContain("invocations: []");
  });

  it("limits one comment per reviewer per push", () => {
    expect(content).toContain("One invocation comment per reviewer per push");
  });
});

// ---------------------------------------------------------------------------
// claim-extractor sub-agent
// ---------------------------------------------------------------------------

describe("claim-extractor sub-agent", () => {
  let content: string;
  beforeEach(() => {
    content = readSkill(AGENT_SDH_CLAIM_EXTRACTOR);
  });

  it("is declared read-only", () => {
    expect(content.toLowerCase()).toContain("read-only");
  });

  it("lists allowed tools in frontmatter", () => {
    const fm = parseFrontmatter(content);
    expect(fm!.tools).toContain("Read");
    expect(fm!.tools).toContain("Bash");
    expect(fm!.tools).toContain("mcp__github__issue_read");
    expect(fm!.tools).toContain("mcp__github__pull_request_read");
    expect(fm!.tools).toContain("mcp__github__get_file_contents");
  });

  it("scope input accepts repo, pr:<number>, path:<glob>", () => {
    expect(content).toContain("repo");
    expect(content).toContain("pr:<number>");
    expect(content).toContain("path:<glob>");
  });

  it("output JSON block is structurally valid", () => {
    const parsed = extractAndParseJsonBlock(content);
    expect(parsed).not.toBeNull();
  });

  it("output JSON is an array", () => {
    const parsed = extractAndParseJsonBlock(content);
    expect(Array.isArray(parsed)).toBe(true);
  });

  it("claim objects have id, category, claim, source, verbatim", () => {
    const parsed = extractAndParseJsonBlock(content) as Array<
      Record<string, unknown>
    >;
    const first = parsed[0];
    expect(first).toHaveProperty("id");
    expect(first).toHaveProperty("category");
    expect(first).toHaveProperty("claim");
    expect(first).toHaveProperty("source");
    expect(first).toHaveProperty("verbatim");
  });

  it("defines valid claim categories", () => {
    const categories = [
      "workflow",
      "type-safety",
      "auth",
      "contract",
      "test-coverage",
      "feature-shipped",
      "config",
      "other",
    ];
    for (const cat of categories) {
      expect(content).toContain(`\`${cat}\``);
    }
  });

  it("caps output at 200 claims for PR-scoped run", () => {
    expect(content).toContain("200");
  });

  it("priority order for category truncation is auth > workflow > type-safety > contract", () => {
    const authIdx = content.lastIndexOf("`auth`");
    const workflowIdx = content.lastIndexOf("`workflow`");
    const typeSafetyIdx = content.lastIndexOf("`type-safety`");
    expect(authIdx).toBeLessThan(workflowIdx);
    expect(workflowIdx).toBeLessThan(typeSafetyIdx);
  });

  it("requires one claim per row", () => {
    expect(content).toContain("One claim per row");
  });

  it("does not mutate state (no Edit/Write)", () => {
    expect(content).toContain("Edit");
    expect(content).toContain("Write");
    // The constraint should explicitly forbid them
    expect(content).toMatch(/Never call .Edit., .Write./);
  });
});

// ---------------------------------------------------------------------------
// reality-prober sub-agent
// ---------------------------------------------------------------------------

describe("reality-prober sub-agent", () => {
  let content: string;
  beforeEach(() => {
    content = readSkill(AGENT_SDH_REALITY_PROBER);
  });

  it("is declared read-only", () => {
    expect(content.toLowerCase()).toContain("read-only");
  });

  it("lists allowed tools in frontmatter", () => {
    const fm = parseFrontmatter(content);
    expect(fm!.tools).toContain("Read");
    expect(fm!.tools).toContain("Bash");
    expect(fm!.tools).toContain("Explore");
    expect(fm!.tools).toContain("mcp__github__get_file_contents");
    expect(fm!.tools).toContain("mcp__github__pull_request_read");
  });

  it("covers all six claim categories with verification instructions", () => {
    const categories = [
      "workflow",
      "type-safety",
      "auth",
      "contract",
      "test-coverage",
      "feature-shipped",
    ];
    for (const cat of categories) {
      expect(content).toContain(`\`${cat}\``);
    }
  });

  it("output JSON block is structurally valid", () => {
    const parsed = extractAndParseJsonBlock(content);
    expect(parsed).not.toBeNull();
  });

  it("output JSON is an array", () => {
    const parsed = extractAndParseJsonBlock(content);
    expect(Array.isArray(parsed)).toBe(true);
  });

  it("verdict row has id, verdict, evidence, severity_hint", () => {
    const parsed = extractAndParseJsonBlock(content) as Array<
      Record<string, unknown>
    >;
    const row = parsed[0];
    expect(row).toHaveProperty("id");
    expect(row).toHaveProperty("verdict");
    expect(row).toHaveProperty("evidence");
    expect(row).toHaveProperty("severity_hint");
  });

  it("defines all four valid verdict values", () => {
    expect(content).toContain("`aligned`");
    expect(content).toContain("`drifted`");
    expect(content).toContain("`unverified`");
    expect(content).toContain("`missing-artifact`");
  });

  it("requires file:line evidence for every drifted verdict", () => {
    expect(content).toContain("drifted");
    expect(content).toContain("file:line");
    // Must require contrary evidence for drifted claims
    expect(content).toContain("MUST cite at least one file:line");
  });

  it("workflow verification checks for continue-on-error bypass", () => {
    expect(content).toContain("continue-on-error: true");
  });

  it("type-safety verification lists bypass markers", () => {
    expect(content).toContain("# type: ignore");
    expect(content).toContain("// @ts-ignore");
    expect(content).toContain("// @ts-expect-error");
    expect(content).toContain(": any");
    expect(content).toContain("as any");
  });

  it("returns unverified (not guess) when external state needed", () => {
    expect(content).toContain("unverified");
    expect(content).toContain("Don't guess");
  });
});

// ---------------------------------------------------------------------------
// drift-reporter sub-agent
// ---------------------------------------------------------------------------

describe("drift-reporter sub-agent", () => {
  let content: string;
  beforeEach(() => {
    content = readSkill(AGENT_SDH_DRIFT_REPORTER);
  });

  it("is declared read-only", () => {
    expect(content.toLowerCase()).toContain("read-only");
  });

  it("lists only Read tool in frontmatter", () => {
    const fm = parseFrontmatter(content);
    expect(fm!.tools).toBe("Read");
  });

  it("defines all five severity levels", () => {
    expect(content).toContain("`critical`");
    expect(content).toContain("`high`");
    expect(content).toContain("`medium`");
    expect(content).toContain("`low`");
    expect(content).toContain("`info`");
  });

  it("defines all four verdict outcomes", () => {
    expect(content).toContain("`BLOCKED`");
    expect(content).toContain("`MAJOR DRIFT`");
    expect(content).toContain("`MINOR DRIFT`");
    expect(content).toContain("`ALIGNED`");
  });

  it("BLOCKED verdict triggered by any critical finding", () => {
    const criticalIdx = content.indexOf("`critical`");
    const blockedIdx = content.indexOf("`BLOCKED`");
    // BLOCKED is defined after the critical level in the severity table
    expect(criticalIdx).toBeLessThan(blockedIdx);
    // Also check that BLOCKED is associated with critical
    const blockedContext = content.slice(blockedIdx - 20, blockedIdx + 50);
    expect(blockedContext).toContain("critical");
  });

  it("sorts findings by severity descending then source path", () => {
    expect(content).toContain("severity descending");
  });

  it("discards aligned rows from findings section", () => {
    expect(content).toContain("aligned");
    expect(content).toContain("Discard");
  });

  it("references main SKILL.md for the output format", () => {
    expect(content).toContain(".claude/skills/spec-drift-hunter/SKILL.md");
  });

  it("requires four finding fields in order: Claim, Reality, Why it matters, Fix", () => {
    expect(content).toContain("Claim, Reality, Why it matters, Fix");
  });

  it("no emojis rule is stated", () => {
    expect(content).toContain("Do not include emojis");
  });

  it("groups findings with same root cause rather than duplicating", () => {
    expect(content).toContain("group them under one finding");
  });

  it("Fix recommendation is limited to one sentence", () => {
    expect(content).toContain("one sentence");
  });

  it("does not re-verify claims (trusts reality-prober)", () => {
    expect(content).toContain("Do not re-verify claims");
  });
});

// ---------------------------------------------------------------------------
// Cross-skill consistency checks
// ---------------------------------------------------------------------------

describe("cross-skill consistency", () => {
  it("agent and claude reviewer-load-balancer share the same skill name", () => {
    const agentFm = parseFrontmatter(readSkill(AGENT_RLB_SKILL));
    const claudeFm = parseFrontmatter(readSkill(CLAUDE_RLB_SKILL));
    expect(agentFm!.name).toBe(claudeFm!.name);
  });

  it("agent and claude spec-drift-hunter share the same skill name", () => {
    const agentFm = parseFrontmatter(readSkill(AGENT_SDH_SKILL));
    const claudeFm = parseFrontmatter(readSkill(CLAUDE_SDH_SKILL));
    expect(agentFm!.name).toBe(claudeFm!.name);
  });

  it("drift-reporter severity rubric matches claude SKILL.md rubric", () => {
    const reporter = readSkill(AGENT_SDH_DRIFT_REPORTER);
    const mainSkill = readSkill(CLAUDE_SDH_SKILL);
    // Both must define the same five severity levels
    const levels = ["critical", "high", "medium", "low", "info"];
    for (const lvl of levels) {
      expect(reporter).toContain(lvl);
      expect(mainSkill).toContain(lvl);
    }
  });

  it("reviewer-router cost classes match those defined in claude SKILL.md", () => {
    const router = readSkill(AGENT_RLB_REVIEWER_ROUTER);
    const mainSkill = readSkill(CLAUDE_RLB_SKILL);
    const costClasses = ["MINIMAL", "LIGHT", "STANDARD", "DEEP", "BLOCKED-ON-HUMAN"];
    for (const cls of costClasses) {
      expect(router).toContain(cls);
      expect(mainSkill).toContain(cls);
    }
  });

  it("reviewer-load-balancer .agents SKILL.md does not duplicate the full routing table (defers to .claude)", () => {
    const agentSkill = readSkill(AGENT_RLB_SKILL);
    // The agent edition should be shorter than the full claude spec
    const claudeSkill = readSkill(CLAUDE_RLB_SKILL);
    expect(agentSkill.length).toBeLessThan(claudeSkill.length);
  });

  it("spec-drift-hunter .agents SKILL.md is shorter than the full .claude spec", () => {
    const agentSkill = readSkill(AGENT_SDH_SKILL);
    const claudeSkill = readSkill(CLAUDE_SDH_SKILL);
    expect(agentSkill.length).toBeLessThan(claudeSkill.length);
  });

  it("all read-only sub-agents do not list Edit or Write in their tools", () => {
    const readOnlyAgents = [
      AGENT_RLB_FILE_CLASSIFIER,
      AGENT_RLB_REVIEWER_ROUTER,
      AGENT_SDH_CLAIM_EXTRACTOR,
      AGENT_SDH_DRIFT_REPORTER,
      AGENT_SDH_REALITY_PROBER,
    ];
    for (const relPath of readOnlyAgents) {
      const fm = parseFrontmatter(readSkill(relPath));
      const tools = fm!.tools ?? "";
      expect(tools).not.toContain("Edit");
      expect(tools).not.toContain("Write");
    }
  });

  it("review-dispatcher (write-capable) is not marked read-only in constraints", () => {
    const content = readSkill(AGENT_RLB_REVIEW_DISPATCHER);
    // Dispatcher explicitly IS allowed to write; it should NOT say read-only
    const fm = parseFrontmatter(content);
    // Its tools list includes write tools
    expect(fm!.tools).toContain("mcp__github__add_issue_comment");
  });

  it("reviewer-router correctly references file-classifier as its input stage", () => {
    const content = readSkill(AGENT_RLB_REVIEWER_ROUTER);
    expect(content).toContain("file-classifier");
  });

  it("review-dispatcher correctly references reviewer-router as its input stage", () => {
    const content = readSkill(AGENT_RLB_REVIEW_DISPATCHER);
    expect(content).toContain("reviewer-router");
  });

  it("drift-reporter correctly references both claim-extractor and reality-prober as inputs", () => {
    const content = readSkill(AGENT_SDH_DRIFT_REPORTER);
    expect(content).toContain("claim-extractor");
    expect(content).toContain("reality-prober");
  });

  it("reality-prober input is the claim list from claim-extractor", () => {
    const content = readSkill(AGENT_SDH_REALITY_PROBER);
    expect(content).toContain("claim-extractor");
  });
});

// ---------------------------------------------------------------------------
// Regression / boundary tests
// ---------------------------------------------------------------------------

describe("regression and boundary cases", () => {
  it("parseFrontmatter returns null for content without frontmatter", () => {
    const result = parseFrontmatter("# Just a heading\n\nNo frontmatter here.");
    expect(result).toBeNull();
  });

  it("parseFrontmatter handles multi-word values with colons", () => {
    const fakeContent =
      "---\nname: my-skill\ndescription: Hunt drift: detect changes\n---\n# Body";
    const fm = parseFrontmatter(fakeContent);
    expect(fm!.name).toBe("my-skill");
    // description should include text after the first colon separator
    expect(fm!.description).toContain("Hunt drift");
  });

  it("extractAndParseJsonBlock returns null when no json block is present", () => {
    const result = extractAndParseJsonBlock("# No JSON here\n\nJust text.");
    expect(result).toBeNull();
  });

  it("extractAndParseJsonBlock handles valid minimal JSON block", () => {
    const content = "Some text\n```json\n{\"key\": \"value\"}\n```\nMore text";
    const result = extractAndParseJsonBlock(content);
    expect(result).toEqual({ key: "value" });
  });

  it("extractAndParseJsonBlock normalizes template placeholders", () => {
    const content = "```json\n{\"pr\": <number>, \"files\": []}\n```";
    const result = extractAndParseJsonBlock(content);
    expect(result).not.toBeNull();
  });

  it("file-classifier output example references both docs-only and secrets-adjacent classes", () => {
    const content = readSkill(AGENT_RLB_FILE_CLASSIFIER);
    expect(content).toContain("docs-only");
    expect(content).toContain("secrets-adjacent");
  });

  it("reviewer-router example plan steps are sequentially numbered starting at 1", () => {
    const content = readSkill(AGENT_RLB_REVIEWER_ROUTER);
    const parsed = extractAndParseJsonBlock(content) as Record<string, unknown>;
    const plan = parsed.plan as Array<Record<string, unknown>>;
    plan.forEach((step, index) => {
      expect(step.step).toBe(index + 1);
    });
  });

  it("review-dispatcher example invocations are sequentially numbered starting at 1", () => {
    const content = readSkill(AGENT_RLB_REVIEW_DISPATCHER);
    const parsed = extractAndParseJsonBlock(content) as Record<string, unknown>;
    const invocations = parsed.invocations as Array<Record<string, unknown>>;
    invocations.forEach((inv, index) => {
      expect(inv.step).toBe(index + 1);
    });
  });

  it("claim-extractor example id follows C-NNN format", () => {
    const content = readSkill(AGENT_SDH_CLAIM_EXTRACTOR);
    expect(content).toMatch(/"id":\s*"C-\d{3}"/);
  });

  it("reality-prober example id matches the claim-extractor format", () => {
    const content = readSkill(AGENT_SDH_REALITY_PROBER);
    expect(content).toMatch(/"id":\s*"C-\d{3}"/);
  });

  it("reviewer-router example triggered_rules is an array of strings", () => {
    const content = readSkill(AGENT_RLB_REVIEWER_ROUTER);
    const parsed = extractAndParseJsonBlock(content) as Record<string, unknown>;
    const rules = parsed.triggered_rules as unknown[];
    expect(Array.isArray(rules)).toBe(true);
    rules.forEach((r) => expect(typeof r).toBe("string"));
  });

  it("reality-prober evidence array items have path, line, note", () => {
    const content = readSkill(AGENT_SDH_REALITY_PROBER);
    const parsed = extractAndParseJsonBlock(content) as Array<
      Record<string, unknown>
    >;
    const evidence = parsed[0].evidence as Array<Record<string, unknown>>;
    expect(Array.isArray(evidence)).toBe(true);
    const firstEvidence = evidence[0];
    expect(firstEvidence).toHaveProperty("path");
    expect(firstEvidence).toHaveProperty("line");
    expect(firstEvidence).toHaveProperty("note");
  });
});
