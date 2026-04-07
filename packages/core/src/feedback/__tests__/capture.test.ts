import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { createCacheManager } from "../../cache/manager";
import { buildToolCacheKey, captureResult, getCachedResult } from "../capture";

let tmpDir: string;

beforeEach(() => {
	tmpDir = join(
		import.meta.dir,
		`tmp-capture-${Date.now()}-${Math.random().toString(36).slice(2)}`,
	);
	mkdirSync(tmpDir, { recursive: true });
});

afterEach(() => {
	try {
		rmSync(tmpDir, { recursive: true, force: true });
	} catch {
		/* ignore */
	}
});

describe("buildToolCacheKey", () => {
	test("returns consistent hash for same inputs", () => {
		const key1 = buildToolCacheKey("reviewCode", { diff: "hello" });
		const key2 = buildToolCacheKey("reviewCode", { diff: "hello" });
		expect(key1).toBe(key2);
	});

	test("returns different hash for different tool names", () => {
		const key1 = buildToolCacheKey("reviewCode", { diff: "hello" });
		const key2 = buildToolCacheKey("verify", { diff: "hello" });
		expect(key1).not.toBe(key2);
	});

	test("returns different hash for different inputs", () => {
		const key1 = buildToolCacheKey("reviewCode", { diff: "hello" });
		const key2 = buildToolCacheKey("reviewCode", { diff: "world" });
		expect(key1).not.toBe(key2);
	});
});

describe("getCachedResult", () => {
	test("returns null on cache miss", () => {
		const result = getCachedResult("reviewCode", { diff: "test" }, tmpDir);
		expect(result).toBeNull();
	});

	test("returns cached value after captureResult stores it", () => {
		captureResult({
			tool: "reviewCode",
			input: { diff: "test-diff" },
			output: '{"passed": true}',
			durationMs: 100,
			mainaDir: tmpDir,
		});
		const cached = getCachedResult("reviewCode", { diff: "test-diff" }, tmpDir);
		expect(cached).toBe('{"passed": true}');
	});

	test("returns null for different input", () => {
		captureResult({
			tool: "reviewCode",
			input: { diff: "original" },
			output: '{"passed": true}',
			durationMs: 100,
			mainaDir: tmpDir,
		});
		const cached = getCachedResult("reviewCode", { diff: "modified" }, tmpDir);
		expect(cached).toBeNull();
	});
});

describe("captureResult", () => {
	test("stores result in cache", () => {
		captureResult({
			tool: "verify",
			input: { files: ["a.ts"] },
			output: '{"passed": true, "findings": []}',
			durationMs: 50,
			mainaDir: tmpDir,
		});
		const cache = createCacheManager(tmpDir);
		const key = buildToolCacheKey("verify", { files: ["a.ts"] });
		const entry = cache.get(key);
		expect(entry).not.toBeNull();
		expect(entry?.value).toBe('{"passed": true, "findings": []}');
	});

	test("records tool usage in stats", () => {
		const { getStatsDb } = require("../../db/index");
		captureResult({
			tool: "reviewCode",
			input: { diff: "test" },
			output: "result",
			durationMs: 250,
			mainaDir: tmpDir,
		});
		const dbResult = getStatsDb(tmpDir);
		expect(dbResult.ok).toBe(true);
		if (!dbResult.ok) return;
		const { db } = dbResult.value;
		const rows = db.query("SELECT * FROM tool_usage").all() as Array<{
			tool: string;
			duration_ms: number;
			cache_hit: number;
		}>;
		expect(rows).toHaveLength(1);
		expect(rows[0]?.tool).toBe("reviewCode");
		expect(rows[0]?.duration_ms).toBe(250);
		expect(rows[0]?.cache_hit).toBe(0);
	});

	test("rejects previous result on re-run with workflowId", () => {
		const { getFeedbackDb } = require("../../db/index");
		const { recordFeedback } = require("../collector");

		// Simulate a prior tool call with workflow context
		recordFeedback(tmpDir, {
			promptHash: "reviewCode-mcp",
			task: "reviewCode",
			accepted: true,
			timestamp: new Date().toISOString(),
		});
		// Set workflow_id on the row
		const dbResult = getFeedbackDb(tmpDir);
		if (!dbResult.ok) return;
		const { db } = dbResult.value;
		db.prepare(
			"UPDATE feedback SET workflow_id = ? WHERE id = (SELECT id FROM feedback ORDER BY rowid DESC LIMIT 1)",
		).run("wf-test");

		// Re-run the tool (different input) — should reject previous
		captureResult({
			tool: "reviewCode",
			input: { diff: "new-diff" },
			output: "new-result",
			durationMs: 100,
			mainaDir: tmpDir,
			workflowId: "wf-test",
		});

		const rows = db
			.query(
				"SELECT accepted FROM feedback WHERE command = ? AND workflow_id = ? ORDER BY created_at ASC",
			)
			.all("reviewCode", "wf-test") as Array<{ accepted: number }>;

		// First entry should be rejected (0), new entry recorded via microtask
		expect(rows[0]?.accepted).toBe(0);
	});

	test("does not throw on any failure", () => {
		expect(() => {
			captureResult({
				tool: "reviewCode",
				input: { diff: "test" },
				output: "result",
				durationMs: 100,
				mainaDir: "/nonexistent/path/that/should/not/exist",
			});
		}).not.toThrow();
	});
});
