# Project-Aware Tool Detection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `maina init --install` project-aware by detecting project language(s) and only recommending/installing relevant tools.

**Architecture:** Expand `detectStack()` to recognize multiple languages via marker files. Add `languages` and `tier` metadata to `TOOL_REGISTRY`. Filter `detectTools()` by detected languages. Update init CLI to use filtered results.

**Tech Stack:** Bun, TypeScript, bun:test, @clack/prompts

---

## File Structure

| File | Responsibility |
|------|----------------|
| `packages/core/src/init/index.ts` | Modify `detectStack()` — add multi-language detection |
| `packages/core/src/verify/detect.ts` | Modify `TOOL_REGISTRY` — add language/tier metadata, filter `detectTools()` |
| `packages/cli/src/commands/init.ts` | Modify init action — use filtered tools |
| `packages/core/src/init/__tests__/detect-stack.test.ts` | **NEW** — tests for expanded stack detection |
| `packages/core/src/verify/__tests__/detect-filter.test.ts` | **NEW** — tests for language-filtered tool detection |

---

### Task 1: Expand detectStack() for Multi-Language Detection

**Files:**
- Modify: `packages/core/src/init/index.ts:39-124`
- Create: `packages/core/src/init/__tests__/detect-stack.test.ts`

- [ ] **Step 1: Write failing tests for new language detection**

```typescript
// packages/core/src/init/__tests__/detect-stack.test.ts
import { describe, test, expect } from "bun:test";
import { detectStack } from "../index";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

describe("detectStack multi-language", () => {
  let dir: string;

  test("detects Go project from go.mod", async () => {
    dir = await mkdtemp(join(tmpdir(), "maina-test-"));
    await writeFile(join(dir, "go.mod"), "module example.com/app\ngo 1.22\n");
    const stack = detectStack(dir);
    expect(stack.languages).toContain("go");
  });

  test("detects Rust project from Cargo.toml", async () => {
    dir = await mkdtemp(join(tmpdir(), "maina-test-"));
    await writeFile(join(dir, "Cargo.toml"), '[package]\nname = "app"\n');
    const stack = detectStack(dir);
    expect(stack.languages).toContain("rust");
  });

  test("detects Python project from pyproject.toml", async () => {
    dir = await mkdtemp(join(tmpdir(), "maina-test-"));
    await writeFile(join(dir, "pyproject.toml"), "[project]\nname = 'app'\n");
    const stack = detectStack(dir);
    expect(stack.languages).toContain("python");
  });

  test("detects Python project from requirements.txt", async () => {
    dir = await mkdtemp(join(tmpdir(), "maina-test-"));
    await writeFile(join(dir, "requirements.txt"), "flask==3.0\n");
    const stack = detectStack(dir);
    expect(stack.languages).toContain("python");
  });

  test("detects Java project from pom.xml", async () => {
    dir = await mkdtemp(join(tmpdir(), "maina-test-"));
    await writeFile(join(dir, "pom.xml"), "<project></project>");
    const stack = detectStack(dir);
    expect(stack.languages).toContain("java");
  });

  test("detects Java project from build.gradle", async () => {
    dir = await mkdtemp(join(tmpdir(), "maina-test-"));
    await writeFile(join(dir, "build.gradle"), "plugins { id 'java' }");
    const stack = detectStack(dir);
    expect(stack.languages).toContain("java");
  });

  test("detects .NET project from .csproj", async () => {
    dir = await mkdtemp(join(tmpdir(), "maina-test-"));
    await writeFile(join(dir, "App.csproj"), "<Project></Project>");
    const stack = detectStack(dir);
    expect(stack.languages).toContain("dotnet");
  });

  test("detects multi-language project", async () => {
    dir = await mkdtemp(join(tmpdir(), "maina-test-"));
    await writeFile(join(dir, "package.json"), '{"name":"app"}');
    await writeFile(join(dir, "go.mod"), "module app\ngo 1.22\n");
    const stack = detectStack(dir);
    expect(stack.languages).toContain("typescript");
    expect(stack.languages).toContain("go");
  });

  test("existing TS detection still works", async () => {
    dir = await mkdtemp(join(tmpdir(), "maina-test-"));
    await writeFile(join(dir, "package.json"), JSON.stringify({
      name: "app",
      devDependencies: { typescript: "^5.0" },
    }));
    const stack = detectStack(dir);
    expect(stack.language).toBe("typescript");
    expect(stack.languages).toContain("typescript");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test packages/core/src/init/__tests__/detect-stack.test.ts`
Expected: FAIL — `languages` property doesn't exist on DetectedStack

- [ ] **Step 3: Add `languages` field to DetectedStack and expand detection**

In `packages/core/src/init/index.ts`, add `languages: string[]` to the `DetectedStack` interface and expand `detectStack()`:

```typescript
// Add to DetectedStack interface
export interface DetectedStack {
  runtime: string;
  language: string;
  testRunner: string;
  linter: string;
  framework: string;
  languages: string[]; // NEW: all detected languages
}

// Add language marker detection after existing package.json logic
const LANGUAGE_MARKERS: Record<string, string[]> = {
  go: ["go.mod"],
  rust: ["Cargo.toml"],
  python: ["pyproject.toml", "requirements.txt", "setup.py"],
  java: ["pom.xml", "build.gradle", "build.gradle.kts"],
  dotnet: ["*.csproj", "*.sln", "*.fsproj"],
};

// In detectStack(), after existing detection:
const languages: string[] = [];
if (stack.language !== "unknown") {
  languages.push(stack.language);
}
for (const [lang, markers] of Object.entries(LANGUAGE_MARKERS)) {
  for (const marker of markers) {
    if (marker.includes("*")) {
      // Glob pattern — use readdirSync
      const files = readdirSync(repoRoot);
      if (files.some(f => f.endsWith(marker.replace("*", "")))) {
        languages.push(lang);
        break;
      }
    } else if (existsSync(join(repoRoot, marker))) {
      languages.push(lang);
      break;
    }
  }
}
stack.languages = languages.length > 0 ? languages : ["unknown"];
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test packages/core/src/init/__tests__/detect-stack.test.ts`
Expected: All PASS

- [ ] **Step 5: Commit**

```bash
maina commit -m "feat(core): expand detectStack for multi-language detection"
```

---

### Task 2: Add Language and Tier Metadata to TOOL_REGISTRY

**Files:**
- Modify: `packages/core/src/verify/detect.ts:40-62`
- Create: `packages/core/src/verify/__tests__/detect-filter.test.ts`

- [ ] **Step 1: Write failing tests for filtered tool detection**

```typescript
// packages/core/src/verify/__tests__/detect-filter.test.ts
import { describe, test, expect } from "bun:test";
import { getToolsForLanguages, TOOL_REGISTRY } from "../detect";

describe("getToolsForLanguages", () => {
  test("returns only JS/TS tools for typescript project", () => {
    const tools = getToolsForLanguages(["typescript"]);
    const names = tools.map(t => t.name);
    expect(names).toContain("biome");
    expect(names).toContain("secretlint");
    expect(names).not.toContain("ruff");
    expect(names).not.toContain("golangci-lint");
    expect(names).not.toContain("cargo-clippy");
  });

  test("returns Go tools for go project", () => {
    const tools = getToolsForLanguages(["go"]);
    const names = tools.map(t => t.name);
    expect(names).toContain("golangci-lint");
    expect(names).not.toContain("biome");
    expect(names).not.toContain("ruff");
  });

  test("returns universal tools for any language", () => {
    const tools = getToolsForLanguages(["typescript"]);
    const names = tools.map(t => t.name);
    expect(names).toContain("semgrep");
    expect(names).toContain("trivy");
  });

  test("returns combined tools for multi-language", () => {
    const tools = getToolsForLanguages(["typescript", "python"]);
    const names = tools.map(t => t.name);
    expect(names).toContain("biome");
    expect(names).toContain("ruff");
  });

  test("returns all tools for unknown language", () => {
    const tools = getToolsForLanguages(["unknown"]);
    expect(tools.length).toBe(Object.keys(TOOL_REGISTRY).length);
  });

  test("tools have tier metadata", () => {
    const tools = getToolsForLanguages(["typescript"]);
    const biome = tools.find(t => t.name === "biome");
    expect(biome?.tier).toBe("essential");
    const semgrep = tools.find(t => t.name === "semgrep");
    expect(semgrep?.tier).toBe("recommended");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test packages/core/src/verify/__tests__/detect-filter.test.ts`
Expected: FAIL — `getToolsForLanguages` not found, no tier/languages in registry

- [ ] **Step 3: Add metadata to TOOL_REGISTRY and implement getToolsForLanguages**

In `packages/core/src/verify/detect.ts`:

```typescript
export interface ToolMeta {
  command: string;
  versionFlag: string;
  languages: string[]; // ["*"] = universal
  tier: "essential" | "recommended" | "optional";
}

export const TOOL_REGISTRY: Record<ToolName, ToolMeta> = {
  biome: { command: "biome", versionFlag: "--version", languages: ["typescript", "javascript"], tier: "essential" },
  semgrep: { command: "semgrep", versionFlag: "--version", languages: ["*"], tier: "recommended" },
  trivy: { command: "trivy", versionFlag: "--version", languages: ["*"], tier: "recommended" },
  secretlint: { command: "secretlint", versionFlag: "--version", languages: ["*"], tier: "recommended" },
  sonarqube: { command: "sonar-scanner", versionFlag: "--version", languages: ["*"], tier: "optional" },
  stryker: { command: "stryker", versionFlag: "--version", languages: ["typescript", "javascript"], tier: "optional" },
  "diff-cover": { command: "diff-cover", versionFlag: "--version", languages: ["*"], tier: "optional" },
  ruff: { command: "ruff", versionFlag: "--version", languages: ["python"], tier: "essential" },
  "golangci-lint": { command: "golangci-lint", versionFlag: "--version", languages: ["go"], tier: "essential" },
  "cargo-clippy": { command: "cargo-clippy", versionFlag: "--version", languages: ["rust"], tier: "essential" },
  "cargo-audit": { command: "cargo-audit", versionFlag: "--version", languages: ["rust"], tier: "recommended" },
  playwright: { command: "playwright", versionFlag: "--version", languages: ["typescript", "javascript"], tier: "optional" },
  "dotnet-format": { command: "dotnet-format", versionFlag: "--version", languages: ["dotnet"], tier: "essential" },
  checkstyle: { command: "checkstyle", versionFlag: "--version", languages: ["java"], tier: "essential" },
  spotbugs: { command: "spotbugs", versionFlag: "-version", languages: ["java"], tier: "recommended" },
  pmd: { command: "pmd", versionFlag: "--version", languages: ["java"], tier: "recommended" },
  zap: { command: "zap-cli", versionFlag: "--version", languages: ["*"], tier: "optional" },
  lighthouse: { command: "lighthouse", versionFlag: "--version", languages: ["typescript", "javascript"], tier: "optional" },
};

export interface FilteredTool {
  name: ToolName;
  tier: "essential" | "recommended" | "optional";
  command: string;
  versionFlag: string;
}

export function getToolsForLanguages(languages: string[]): FilteredTool[] {
  if (languages.includes("unknown")) {
    return Object.entries(TOOL_REGISTRY).map(([name, meta]) => ({
      name: name as ToolName,
      tier: meta.tier,
      command: meta.command,
      versionFlag: meta.versionFlag,
    }));
  }

  return Object.entries(TOOL_REGISTRY)
    .filter(([_, meta]) => {
      if (meta.languages.includes("*")) return true;
      return meta.languages.some(lang => languages.includes(lang));
    })
    .map(([name, meta]) => ({
      name: name as ToolName,
      tier: meta.tier,
      command: meta.command,
      versionFlag: meta.versionFlag,
    }));
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test packages/core/src/verify/__tests__/detect-filter.test.ts`
Expected: All PASS

- [ ] **Step 5: Commit**

```bash
maina commit -m "feat(core): add language/tier metadata to TOOL_REGISTRY"
```

---

### Task 3: Update detectTools() to Accept Language Filter

**Files:**
- Modify: `packages/core/src/verify/detect.ts:171-175`

- [ ] **Step 1: Write failing test for filtered detectTools**

```typescript
// Add to packages/core/src/verify/__tests__/detect-filter.test.ts
import { detectTools } from "../detect";

describe("detectTools with filter", () => {
  test("filters by languages when provided", async () => {
    const tools = await detectTools(["go"]);
    const names = tools.map(t => t.name);
    expect(names).toContain("golangci-lint");
    expect(names).not.toContain("biome");
    expect(names).not.toContain("ruff");
    // Universal tools still included
    expect(names).toContain("semgrep");
  });

  test("returns all tools when no filter", async () => {
    const tools = await detectTools();
    expect(tools.length).toBe(Object.keys(TOOL_REGISTRY).length);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test packages/core/src/verify/__tests__/detect-filter.test.ts`
Expected: FAIL — detectTools doesn't accept languages parameter

- [ ] **Step 3: Update detectTools to filter by languages**

```typescript
export async function detectTools(languages?: string[]): Promise<DetectedTool[]> {
  const filteredNames = languages
    ? getToolsForLanguages(languages).map(t => t.name)
    : (Object.keys(TOOL_REGISTRY) as ToolName[]);
  const results = await Promise.all(filteredNames.map((name) => detectTool(name)));
  return results;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test packages/core/src/verify/__tests__/detect-filter.test.ts`
Expected: All PASS

- [ ] **Step 5: Commit**

```bash
maina commit -m "feat(core): filter detectTools by project languages"
```

---

### Task 4: Update Init CLI to Use Project-Aware Filtering

**Files:**
- Modify: `packages/cli/src/commands/init.ts:88-130`

- [ ] **Step 1: Update initAction to pass languages to detectTools**

In `packages/cli/src/commands/init.ts`, change the tool detection to use the detected stack's languages:

```typescript
// Before (line ~88):
// const detectedToolsList = await detectTools();

// After:
const detectedToolsList = await detectTools(report.detectedStack.languages);
```

Also update the install hints to respect filtering — only show hints for tools relevant to the project.

- [ ] **Step 2: Update INSTALL_HINTS to filter by languages**

```typescript
// Replace the hardcoded INSTALL_HINTS loop (lines 106-130) with filtered version:
if (options.install) {
  deps.log.step("Installing missing tools...");
  const relevantTools = getToolsForLanguages(report.detectedStack.languages);
  const relevantNames = new Set(relevantTools.map(t => t.name));
  for (const t of missing) {
    if (!relevantNames.has(t.name as ToolName)) continue;
    const cmd = INSTALL_HINTS[t.name];
    if (!cmd || cmd.startsWith("http")) continue;
    // ... existing install logic
  }
}
```

- [ ] **Step 3: Run full test suite**

Run: `bun run verify`
Expected: All checks pass

- [ ] **Step 4: Manual test with a real project**

```bash
cd /tmp && mkdir test-go-project && cd test-go-project && git init
echo 'module test\ngo 1.22' > go.mod
maina init --install
# Should only suggest Go + universal tools, NOT biome/ruff/cargo-clippy
```

- [ ] **Step 5: Commit**

```bash
maina commit -m "feat(cli): project-aware tool filtering in maina init"
```
