/**
 * TDD test stub generation from plan.md task lists.
 *
 * Parses task lines (- T001: or - [ ] T001:) from plan content and
 * generates bun:test stubs with failing expects (red phase).
 */

// ── Ambiguity Detection ──────────────────────────────────────────────────────

const AMBIGUOUS_PATTERNS = [
	/\bmaybe\b/i,
	/\bmight\b/i,
	/\bpossibly\b/i,
	/\bpossible\b/i,
	/\btbd\b/i,
	/\bor\b/i,
];

function isAmbiguous(text: string): boolean {
	return AMBIGUOUS_PATTERNS.some((pattern) => pattern.test(text));
}

// ── Task Parsing ─────────────────────────────────────────────────────────────

interface ParsedTask {
	id: string;
	description: string;
	ambiguous: boolean;
	rawLine: string;
}

/**
 * Parse task lines from plan.md content.
 * Matches patterns like:
 *   - T001: description
 *   - [ ] T001: description
 *   - [x] T001: description
 */
function parseTasks(planContent: string): ParsedTask[] {
	const lines = planContent.split("\n");
	const tasks: ParsedTask[] = [];

	// Match: - T001: ... or - [ ] T001: ... or - [x] T001: ...
	const taskPattern = /^-\s+(?:\[[ x]\]\s+)?T(\d+):\s*(.+)$/;

	for (const line of lines) {
		const trimmed = line.trim();
		const match = trimmed.match(taskPattern);
		if (match?.[1] && match[2]) {
			const id = `T${match[1]}`;
			const description = match[2].trim();
			tasks.push({
				id,
				description,
				ambiguous: isAmbiguous(description),
				rawLine: trimmed,
			});
		}
	}

	return tasks;
}

// ── Test Stub Generation ─────────────────────────────────────────────────────

/**
 * Convert a task description to a test-friendly name.
 * Lowercases the first letter and prepends "should".
 */
function toTestName(description: string): string {
	const lower = description.charAt(0).toLowerCase() + description.slice(1);
	return `should ${lower}`;
}

/**
 * Pure function: parses plan.md content and generates TDD test stubs.
 *
 * - Parses task lines (- T001: or - [ ] T001:)
 * - Creates it() blocks with failing expects (red phase)
 * - Adds [NEEDS CLARIFICATION] for ambiguous tasks
 * - Returns complete TypeScript test file as a string
 */
export function generateTestStubs(
	planContent: string,
	featureName: string,
): string {
	const tasks = parseTasks(planContent);

	const lines: string[] = [];

	lines.push('import { describe, expect, it } from "bun:test";');
	lines.push("");
	lines.push(`describe("Feature: ${featureName}", () => {`);

	for (const task of tasks) {
		const testName = toTestName(task.description);

		if (task.ambiguous) {
			lines.push("");
			lines.push(
				`\t// [NEEDS CLARIFICATION] ${task.id}: task description mentions ambiguous language — clarify requirement`,
			);
			lines.push(`\tit("${task.id}: ${testName}", () => {`);
			lines.push(
				"\t\t// [NEEDS CLARIFICATION] Ambiguous requirement — clarify before implementing",
			);
			lines.push("\t\texpect(true).toBe(false); // Red phase");
			lines.push("\t});");
		} else {
			lines.push("");
			lines.push(`\tit("${task.id}: ${testName}", () => {`);
			lines.push("\t\t// TODO: implement test");
			lines.push("\t\texpect(true).toBe(false); // Red phase");
			lines.push("\t});");
		}
	}

	lines.push("});");
	lines.push("");

	return lines.join("\n");
}
