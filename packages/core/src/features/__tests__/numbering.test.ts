import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
	createFeatureDir,
	getNextFeatureNumber,
	scaffoldFeature,
} from "../numbering";

function makeTmpDir(): string {
	const dir = join(
		tmpdir(),
		`maina-features-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
	);
	mkdirSync(dir, { recursive: true });
	return dir;
}

describe("getNextFeatureNumber", () => {
	let tmpDir: string;

	beforeEach(() => {
		tmpDir = makeTmpDir();
	});

	afterEach(() => {
		rmSync(tmpDir, { recursive: true, force: true });
	});

	test("empty dir returns '001'", async () => {
		const featuresDir = join(tmpDir, ".maina", "features");
		mkdirSync(featuresDir, { recursive: true });
		const result = await getNextFeatureNumber(tmpDir);
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value).toBe("001");
		}
	});

	test("existing 001, 002 returns '003'", async () => {
		const featuresDir = join(tmpDir, ".maina", "features");
		mkdirSync(join(featuresDir, "001-first-feature"), { recursive: true });
		mkdirSync(join(featuresDir, "002-second-feature"), { recursive: true });
		const result = await getNextFeatureNumber(tmpDir);
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value).toBe("003");
		}
	});

	test("non-sequential (001, 003) returns '004'", async () => {
		const featuresDir = join(tmpDir, ".maina", "features");
		mkdirSync(join(featuresDir, "001-first"), { recursive: true });
		mkdirSync(join(featuresDir, "003-third"), { recursive: true });
		const result = await getNextFeatureNumber(tmpDir);
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value).toBe("004");
		}
	});

	test("no .maina/features dir yet creates it and returns '001'", async () => {
		// tmpDir exists but has no .maina/features
		const result = await getNextFeatureNumber(tmpDir);
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value).toBe("001");
		}
		expect(existsSync(join(tmpDir, ".maina", "features"))).toBe(true);
	});

	test("ignores non-directory entries", async () => {
		const featuresDir = join(tmpDir, ".maina", "features");
		mkdirSync(featuresDir, { recursive: true });
		mkdirSync(join(featuresDir, "001-first"), { recursive: true });
		// Create a file that looks like a feature but isn't a directory
		Bun.write(join(featuresDir, "002-not-a-dir.md"), "just a file");
		const result = await getNextFeatureNumber(tmpDir);
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value).toBe("002");
		}
	});

	test("ignores directories without numeric prefix", async () => {
		const featuresDir = join(tmpDir, ".maina", "features");
		mkdirSync(featuresDir, { recursive: true });
		mkdirSync(join(featuresDir, "001-first"), { recursive: true });
		mkdirSync(join(featuresDir, "not-numbered"), { recursive: true });
		const result = await getNextFeatureNumber(tmpDir);
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value).toBe("002");
		}
	});
});

describe("createFeatureDir", () => {
	let tmpDir: string;

	beforeEach(() => {
		tmpDir = makeTmpDir();
		mkdirSync(join(tmpDir, ".maina", "features"), { recursive: true });
	});

	afterEach(() => {
		rmSync(tmpDir, { recursive: true, force: true });
	});

	test("creates correct directory structure", async () => {
		const result = await createFeatureDir(tmpDir, "001", "my-feature");
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(existsSync(result.value)).toBe(true);
		}
	});

	test("returns full path", async () => {
		const result = await createFeatureDir(tmpDir, "001", "my-feature");
		expect(result.ok).toBe(true);
		if (result.ok) {
			const expected = join(tmpDir, ".maina", "features", "001-my-feature");
			expect(result.value).toBe(expected);
		}
	});

	test("handles kebab-case conversion from spaces", async () => {
		const result = await createFeatureDir(tmpDir, "002", "My Cool Feature");
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value).toContain("002-my-cool-feature");
			expect(existsSync(result.value)).toBe(true);
		}
	});

	test("handles kebab-case conversion from camelCase", async () => {
		const result = await createFeatureDir(tmpDir, "003", "myCoolFeature");
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value).toContain("003-my-cool-feature");
			expect(existsSync(result.value)).toBe(true);
		}
	});

	test("handles kebab-case conversion from PascalCase", async () => {
		const result = await createFeatureDir(tmpDir, "004", "MyCoolFeature");
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value).toContain("004-my-cool-feature");
			expect(existsSync(result.value)).toBe(true);
		}
	});

	test("returns error if directory already exists", async () => {
		const dir = join(tmpDir, ".maina", "features", "001-my-feature");
		mkdirSync(dir, { recursive: true });
		const result = await createFeatureDir(tmpDir, "001", "my-feature");
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error).toContain("already exists");
		}
	});
});

describe("scaffoldFeature", () => {
	let tmpDir: string;
	let featureDir: string;

	beforeEach(() => {
		tmpDir = makeTmpDir();
		featureDir = join(tmpDir, ".maina", "features", "001-test-feature");
		mkdirSync(featureDir, { recursive: true });
	});

	afterEach(() => {
		rmSync(tmpDir, { recursive: true, force: true });
	});

	test("creates spec.md, plan.md, tasks.md", async () => {
		const result = await scaffoldFeature(featureDir);
		expect(result.ok).toBe(true);
		expect(existsSync(join(featureDir, "spec.md"))).toBe(true);
		expect(existsSync(join(featureDir, "plan.md"))).toBe(true);
		expect(existsSync(join(featureDir, "tasks.md"))).toBe(true);
	});

	test("spec.md contains WHAT/WHY sections only (no HOW)", async () => {
		await scaffoldFeature(featureDir);
		const content = readFileSync(join(featureDir, "spec.md"), "utf-8");
		// WHAT/WHY sections
		expect(content).toContain("Feature Name");
		expect(content).toContain("User Stories");
		expect(content).toContain("Acceptance Criteria");
		// Must NOT contain HOW sections
		expect(content).not.toContain("Architecture");
		expect(content).not.toContain("## Tasks");
	});

	test("plan.md contains HOW sections only", async () => {
		await scaffoldFeature(featureDir);
		const content = readFileSync(join(featureDir, "plan.md"), "utf-8");
		// HOW sections
		expect(content).toContain("Architecture");
		expect(content).toContain("Tasks");
		// Must NOT contain WHAT/WHY sections
		expect(content).not.toContain("User Stories");
		expect(content).not.toContain("Acceptance Criteria");
	});

	test("all files contain [NEEDS CLARIFICATION] marker", async () => {
		await scaffoldFeature(featureDir);
		const spec = readFileSync(join(featureDir, "spec.md"), "utf-8");
		const plan = readFileSync(join(featureDir, "plan.md"), "utf-8");
		const tasks = readFileSync(join(featureDir, "tasks.md"), "utf-8");
		expect(spec).toContain("[NEEDS CLARIFICATION]");
		expect(plan).toContain("[NEEDS CLARIFICATION]");
		expect(tasks).toContain("[NEEDS CLARIFICATION]");
	});

	test("returns error if featureDir does not exist", async () => {
		const badDir = join(tmpDir, "nonexistent");
		const result = await scaffoldFeature(badDir);
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error).toContain("does not exist");
		}
	});
});
