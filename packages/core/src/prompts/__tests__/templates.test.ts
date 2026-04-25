import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const TEMPLATES_DIR = join(import.meta.dir, "..", "templates");
const AGENTS_DIR = join(import.meta.dir, "..", "agents");

const BANNED_C2_PHRASES = [
	/\b0\s+findings?\b/i,
	/\bno\s+issues?\s+found\b/i,
	/\bno\s+errors?\s+detected\b/i,
];

/**
 * Strip lines that *teach* the C2 rule by quoting the banned phrases as
 * bad examples — those should not trip the regex. A line counts as a
 * teaching line when it contains a "BAD" or "Bad" marker (with optional
 * markdown emphasis), or sits between explicit example fences.
 */
function stripTeachingLines(content: string): string {
	return content
		.split("\n")
		.filter((line) => !/\*?\*?BAD(?:\s*\(.*?\))?\s*[:*]/i.test(line))
		.join("\n");
}

function listMd(dir: string): string[] {
	return readdirSync(dir).filter((f) => f.endsWith(".md") && f !== "README.md");
}

describe("prompt templates", () => {
	const files = listMd(TEMPLATES_DIR);

	test("ships exactly the three locked templates", () => {
		expect(files.sort()).toEqual([
			"plan-template.md",
			"spec-template.md",
			"tasks-template.md",
		]);
	});

	test.each(files)("%s — non-empty + reasonable size", (file) => {
		const content = readFileSync(join(TEMPLATES_DIR, file), "utf-8");
		expect(content.length).toBeGreaterThan(500);
		expect(content.length).toBeLessThan(20_000);
	});

	test.each(
		files,
	)("%s — no banned C2 phrases (outside teaching examples)", (file) => {
		const raw = readFileSync(join(TEMPLATES_DIR, file), "utf-8");
		const content = stripTeachingLines(raw);
		for (const banned of BANNED_C2_PHRASES) {
			expect(content).not.toMatch(banned);
		}
	});

	test.each(files)("%s — contains a NEEDS CLARIFICATION example", (file) => {
		const content = readFileSync(join(TEMPLATES_DIR, file), "utf-8");
		// Spec + plan must teach the marker; tasks template doesn't need to
		// since open questions live earlier in the pipeline.
		if (file === "tasks-template.md") return;
		expect(content).toMatch(/\[NEEDS CLARIFICATION:/);
	});
});

describe("agent prompts", () => {
	const files = listMd(AGENTS_DIR);

	test("ships the locked v0 agent set", () => {
		expect(files.sort()).toEqual(["debug.md", "review.md", "router.md"]);
	});

	test.each(files)("%s — has an Input + persona / process section", (file) => {
		const content = readFileSync(join(AGENTS_DIR, file), "utf-8");
		expect(content).toMatch(/## Input/);
	});

	test.each(
		files,
	)("%s — no banned C2 phrases (outside teaching examples)", (file) => {
		const raw = readFileSync(join(AGENTS_DIR, file), "utf-8");
		const content = stripTeachingLines(raw);
		for (const banned of BANNED_C2_PHRASES) {
			expect(content).not.toMatch(banned);
		}
	});

	test.each(files)("%s — uses verification framing", (file) => {
		const content = readFileSync(join(AGENTS_DIR, file), "utf-8");
		// The agent prompts must use Maina's verification language — the
		// router classifies *into* verify agents, the review/debug prompts
		// explain *why* a check holds or doesn't.
		expect(content).toMatch(/\b(?:verify|verification|receipt|merge)\b/i);
	});
});
