import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { recordOutcome } from "../../prompts/engine";
import { exportFeedbackForCloud } from "../sync";

let tmpDir: string;

beforeEach(() => {
	tmpDir = join(
		import.meta.dir,
		`tmp-sync-${Date.now()}-${Math.random().toString(36).slice(2)}`,
	);
	mkdirSync(tmpDir, { recursive: true });
});

afterEach(() => {
	try {
		const { rmSync } = require("node:fs");
		rmSync(tmpDir, { recursive: true, force: true });
	} catch {
		// ignore
	}
});

describe("exportFeedbackForCloud", () => {
	test("returns empty array when no feedback exists", () => {
		const events = exportFeedbackForCloud(tmpDir);
		expect(events).toEqual([]);
	});

	test("exports accepted feedback events", () => {
		recordOutcome(tmpDir, "hash-abc", {
			accepted: true,
			command: "commit",
		});

		const events = exportFeedbackForCloud(tmpDir);

		expect(events).toHaveLength(1);
		expect(events[0]?.promptHash).toBe("hash-abc");
		expect(events[0]?.command).toBe("commit");
		expect(events[0]?.accepted).toBe(true);
		expect(events[0]?.timestamp).toBeDefined();
	});

	test("exports rejected feedback events", () => {
		recordOutcome(tmpDir, "hash-def", {
			accepted: false,
			command: "review",
		});

		const events = exportFeedbackForCloud(tmpDir);

		expect(events).toHaveLength(1);
		expect(events[0]?.accepted).toBe(false);
		expect(events[0]?.command).toBe("review");
	});

	test("exports context when present", () => {
		recordOutcome(tmpDir, "hash-ctx", {
			accepted: true,
			command: "commit",
			context: "user edited the message",
		});

		const events = exportFeedbackForCloud(tmpDir);

		expect(events).toHaveLength(1);
		expect(events[0]?.context).toBe("user edited the message");
	});

	test("omits context when not present", () => {
		recordOutcome(tmpDir, "hash-no-ctx", {
			accepted: true,
			command: "commit",
		});

		const events = exportFeedbackForCloud(tmpDir);

		expect(events).toHaveLength(1);
		expect(events[0]?.context).toBeUndefined();
	});

	test("exports multiple events in chronological order", () => {
		recordOutcome(tmpDir, "hash-1", { accepted: true, command: "commit" });
		recordOutcome(tmpDir, "hash-2", { accepted: false, command: "review" });
		recordOutcome(tmpDir, "hash-3", { accepted: true, command: "fix" });

		const events = exportFeedbackForCloud(tmpDir);

		expect(events).toHaveLength(3);
		expect(events[0]?.promptHash).toBe("hash-1");
		expect(events[1]?.promptHash).toBe("hash-2");
		expect(events[2]?.promptHash).toBe("hash-3");
	});

	test("returns empty array on invalid db path", () => {
		const events = exportFeedbackForCloud(
			"/nonexistent/path/that/does/not/exist",
		);
		expect(events).toEqual([]);
	});
});
