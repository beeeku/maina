import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import {
	analyseFeedback,
	exportFeedbackForCloud,
	getPromptStats,
	recordOutcome,
} from "@mainahq/core";

let tmpDir: string;

beforeEach(() => {
	tmpDir = join(
		import.meta.dir,
		`tmp-learn-${Date.now()}-${Math.random().toString(36).slice(2)}`,
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

describe("maina learn", () => {
	test("identifies tasks needing improvement after 30 rejections", () => {
		// Simulate 30 rejections for review
		for (let i = 0; i < 30; i++) {
			recordOutcome(tmpDir, "review-v1", {
				accepted: false,
				command: "review",
			});
		}
		// 5 accepts
		for (let i = 0; i < 5; i++) {
			recordOutcome(tmpDir, "review-v1", {
				accepted: true,
				command: "review",
			});
		}

		// Verify the records were written via prompt stats before analysing
		const stats = getPromptStats(tmpDir);
		const reviewStat = stats.find((s) => s.promptHash === "review-v1");
		expect(reviewStat).toBeDefined();
		expect(reviewStat?.totalUsage).toBe(35);

		const analysis = analyseFeedback(tmpDir, "review");
		expect(analysis.totalSamples).toBe(35);
		expect(analysis.needsImprovement).toBe(true);
		expect(analysis.acceptRate).toBeCloseTo(5 / 35, 5);
	});

	test("healthy task does not need improvement", () => {
		for (let i = 0; i < 30; i++) {
			recordOutcome(tmpDir, "commit-v1", {
				accepted: true,
				command: "commit",
			});
		}
		for (let i = 0; i < 3; i++) {
			recordOutcome(tmpDir, "commit-v1", {
				accepted: false,
				command: "commit",
			});
		}

		const analysis = analyseFeedback(tmpDir, "commit");
		expect(analysis.needsImprovement).toBe(false);
	});
});

describe("learn --cloud integration", () => {
	test("exportFeedbackForCloud produces events matching learn analysis", () => {
		// Record mixed feedback
		for (let i = 0; i < 10; i++) {
			recordOutcome(tmpDir, "commit-v1", {
				accepted: true,
				command: "commit",
			});
		}
		for (let i = 0; i < 5; i++) {
			recordOutcome(tmpDir, "commit-v1", {
				accepted: false,
				command: "commit",
			});
		}

		const events = exportFeedbackForCloud(tmpDir);
		const analysis = analyseFeedback(tmpDir, "commit");

		// Event count should match analysis total
		expect(events.length).toBe(analysis.totalSamples);

		// Accept counts should match
		const acceptedEvents = events.filter((e) => e.accepted);
		expect(acceptedEvents.length).toBe(10);

		const rejectedEvents = events.filter((e) => !e.accepted);
		expect(rejectedEvents.length).toBe(5);
	});

	test("exported events have correct shape for cloud upload", () => {
		recordOutcome(tmpDir, "hash-xyz", {
			accepted: true,
			command: "review",
			context: "looks good",
		});

		const events = exportFeedbackForCloud(tmpDir);
		expect(events).toHaveLength(1);

		const event = events[0];
		expect(event).toBeDefined();
		if (!event) return;

		// Required fields
		expect(typeof event.promptHash).toBe("string");
		expect(typeof event.command).toBe("string");
		expect(typeof event.accepted).toBe("boolean");

		// Optional fields
		expect(event.context).toBe("looks good");
		expect(event.timestamp).toBeDefined();

		// Should not have snake_case keys
		expect(
			(event as unknown as Record<string, unknown>).prompt_hash,
		).toBeUndefined();
	});
});
