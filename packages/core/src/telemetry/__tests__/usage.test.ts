import { describe, expect, test } from "bun:test";
import { buildUsageEvent, trackUsageEvent } from "../usage";

describe("buildUsageEvent", () => {
	test("produces properly structured event", () => {
		const event = buildUsageEvent("maina.verify.started", {
			toolCount: 12,
		});

		expect(event.event).toBe("maina.verify.started");
		expect(event.properties.toolCount).toBe(12);
		expect(event.os).toBe(process.platform);
		expect(event.timestamp).toBeTruthy();
	});

	test("defaults to unknown version", () => {
		const event = buildUsageEvent("maina.install");
		expect(event.version).toBe("unknown");
	});

	test("accepts custom version", () => {
		const event = buildUsageEvent("maina.commit", {}, "1.1.5");
		expect(event.version).toBe("1.1.5");
	});

	test("includes no PII fields", () => {
		const event = buildUsageEvent("maina.verify.completed", {
			passed: true,
			duration: 1234,
			findings: 3,
		});

		const json = JSON.stringify(event);
		expect(json).not.toContain("email");
		expect(json).not.toContain("user");
		expect(json).not.toContain("token");
		expect(json).not.toContain("key");
	});

	test("all event names are valid", () => {
		const validNames = [
			"maina.install",
			"maina.verify.started",
			"maina.verify.completed",
			"maina.learn.ran",
			"maina.commit",
			"maina.plan",
			"maina.wiki.init",
			"maina.wiki.query",
		] as const;

		for (const name of validNames) {
			const event = buildUsageEvent(name);
			expect(event.event).toBe(name);
		}
	});
});

describe("trackUsageEvent", () => {
	test("returns null or event depending on config", () => {
		const result = trackUsageEvent("maina.install");
		// May be null (no config) or event — test it doesn't throw
		expect(result === null || result.event === "maina.install").toBe(true);
	});

	test("buildUsageEvent always works regardless of consent", () => {
		const event = buildUsageEvent("maina.commit", { duration: 500 });
		expect(event.event).toBe("maina.commit");
		expect(event.properties.duration).toBe(500);
	});
});
