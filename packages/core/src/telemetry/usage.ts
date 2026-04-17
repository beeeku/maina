/**
 * Usage Telemetry — opt-in anonymous usage tracking.
 *
 * Separate from error reporting (#121). Reads `telemetry: true` from
 * `~/.maina/config.yml`. Events are plain objects — no PostHog SDK dependency.
 * Zero PII in any event.
 */

import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

// ── Event Types ────────────────────────────────────────────────────────

export type UsageEventName =
	| "maina.install"
	| "maina.verify.started"
	| "maina.verify.completed"
	| "maina.learn.ran"
	| "maina.commit"
	| "maina.plan"
	| "maina.wiki.init"
	| "maina.wiki.query";

export interface UsageEvent {
	event: UsageEventName;
	properties: Record<string, string | number | boolean>;
	timestamp: string;
	os: string;
	runtime: string;
	version: string;
}

// ── Config ─────────────────────────────────────────────────────────────

const CONFIG_PATH = join(homedir(), ".maina", "config.yml");

/**
 * Check if usage telemetry is enabled.
 * Reads `telemetry: true` from `~/.maina/config.yml`.
 * Separate from error reporting consent (`errors: true`).
 */
export function isTelemetryEnabled(): boolean {
	try {
		if (!existsSync(CONFIG_PATH)) return false;
		const content = readFileSync(CONFIG_PATH, "utf-8");
		return /^telemetry:\s*true$/m.test(content);
	} catch {
		return false;
	}
}

// ── Event Building ─────────────────────────────────────────────────────

/**
 * Build a usage event. Always safe to call — no PII, no side effects.
 */
export function buildUsageEvent(
	name: UsageEventName,
	properties: Record<string, string | number | boolean> = {},
	version = "unknown",
): UsageEvent {
	return {
		event: name,
		properties,
		timestamp: new Date().toISOString(),
		os: process.platform,
		runtime: typeof Bun !== "undefined" ? "bun" : "node",
		version,
	};
}

/**
 * Build and return a usage event, respecting consent.
 * Returns null if telemetry is disabled.
 */
export function trackUsageEvent(
	name: UsageEventName,
	properties: Record<string, string | number | boolean> = {},
	version = "unknown",
): UsageEvent | null {
	if (!isTelemetryEnabled()) return null;
	return buildUsageEvent(name, properties, version);
}
