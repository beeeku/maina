import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export interface RulePreference {
	ruleId: string;
	dismissCount: number;
	totalCount: number;
	falsePositiveRate: number;
}

export interface Preferences {
	rules: Record<string, RulePreference>;
	updatedAt: string;
}

const MIN_RULE_SAMPLES = 5;

const PREFS_FILE = "preferences.json";

function prefsPath(mainaDir: string): string {
	return join(mainaDir, PREFS_FILE);
}

/**
 * Load preferences from .maina/preferences.json.
 * Returns defaults when no file exists.
 */
export function loadPreferences(mainaDir: string): Preferences {
	const path = prefsPath(mainaDir);
	if (!existsSync(path)) {
		return {
			rules: {},
			updatedAt: new Date().toISOString(),
		};
	}

	try {
		const raw = readFileSync(path, "utf-8");
		return JSON.parse(raw) as Preferences;
	} catch {
		return {
			rules: {},
			updatedAt: new Date().toISOString(),
		};
	}
}

/**
 * Save preferences to .maina/preferences.json.
 */
export function savePreferences(mainaDir: string, prefs: Preferences): void {
	const path = prefsPath(mainaDir);
	writeFileSync(path, JSON.stringify(prefs, null, 2), "utf-8");
}

function ensureRule(prefs: Preferences, ruleId: string): RulePreference {
	if (!prefs.rules[ruleId]) {
		prefs.rules[ruleId] = {
			ruleId,
			dismissCount: 0,
			totalCount: 0,
			falsePositiveRate: 0,
		};
	}
	return prefs.rules[ruleId];
}

function updateRate(rule: RulePreference): void {
	rule.falsePositiveRate =
		rule.totalCount > 0 ? rule.dismissCount / rule.totalCount : 0;
}

/**
 * Record a finding dismissal (user saw it and chose to ignore it).
 */
export function dismissFinding(mainaDir: string, ruleId: string): void {
	const prefs = loadPreferences(mainaDir);
	const rule = ensureRule(prefs, ruleId);
	rule.dismissCount += 1;
	rule.totalCount += 1;
	updateRate(rule);
	prefs.updatedAt = new Date().toISOString();
	savePreferences(mainaDir, prefs);
}

/**
 * Record a finding acknowledgment (user saw it and it was valid).
 */
export function acknowledgeFinding(mainaDir: string, ruleId: string): void {
	const prefs = loadPreferences(mainaDir);
	const rule = ensureRule(prefs, ruleId);
	rule.totalCount += 1;
	updateRate(rule);
	prefs.updatedAt = new Date().toISOString();
	savePreferences(mainaDir, prefs);
}

/**
 * Get rules with high false positive rates (>50% dismissed).
 * These should be downgraded in severity or suppressed.
 */
export function getNoisyRules(mainaDir: string): RulePreference[] {
	const prefs = loadPreferences(mainaDir);
	return Object.values(prefs.rules).filter(
		(rule) =>
			rule.falsePositiveRate > 0.5 && rule.totalCount >= MIN_RULE_SAMPLES,
	);
}
