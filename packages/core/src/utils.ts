/**
 * Shared utility functions used across core modules.
 */

/**
 * Convert a string to kebab-case.
 * Handles: spaces, camelCase, PascalCase, underscores.
 */
export function toKebabCase(input: string): string {
	return (
		input
			// Insert hyphen before uppercase letters in camelCase/PascalCase
			.replace(/([a-z0-9])([A-Z])/g, "$1-$2")
			// Replace spaces, underscores, and multiple hyphens with single hyphen
			.replace(/[\s_]+/g, "-")
			// Remove non-alphanumeric characters except hyphens
			.replace(/[^a-z0-9-]/gi, "")
			// Collapse multiple hyphens
			.replace(/-+/g, "-")
			// Trim leading/trailing hyphens
			.replace(/^-|-$/g, "")
			.toLowerCase()
	);
}

/**
 * Common stop words filtered out during keyword matching.
 */
export const STOP_WORDS = new Set([
	"the",
	"and",
	"for",
	"are",
	"but",
	"not",
	"you",
	"all",
	"can",
	"has",
	"her",
	"was",
	"one",
	"our",
	"out",
	"with",
	"that",
	"this",
	"from",
	"have",
	"will",
	"should",
]);

/**
 * Extract the content under `## Acceptance criteria` from a spec file.
 * Returns individual criterion lines (trimmed, without leading `- ` or `- [ ] `).
 */
export function extractAcceptanceCriteria(specContent: string): string[] {
	const lines = specContent.split("\n");
	const criteria: string[] = [];
	let inSection = false;

	for (const line of lines) {
		const trimmed = line.trim();

		// Detect start of acceptance criteria section (case-insensitive)
		if (/^##\s+acceptance\s+criteria/i.test(trimmed)) {
			inSection = true;
			continue;
		}

		// Stop at next heading
		if (inSection && /^##\s/.test(trimmed)) {
			break;
		}

		if (inSection && trimmed.startsWith("-")) {
			// Strip leading `- `, `- [ ] `, `- [x] `
			const content = trimmed.replace(/^-\s*(\[.\]\s*)?/, "").trim();
			if (content.length > 0) {
				criteria.push(content);
			}
		}
	}

	return criteria;
}
