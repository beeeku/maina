/**
 * Autofix patch validation + application.
 *
 * Each receipt check can carry a `patch: { diff, rationale }` — a unified diff
 * the AI proposed to fix the finding. `maina apply-fix <hash> <check-id>`
 * loads the receipt, locates the check, and (after safety checks) lands the
 * patch as a follow-up commit.
 *
 * Safety rails:
 *  1. The diff must be valid + apply-able (git apply --check).
 *  2. Every file the patch touches must be within the PR's diff scope —
 *     i.e., files the receipt's underlying change already modified. Patches
 *     that try to edit out-of-scope files are rejected; this stops a stale
 *     or adversarial patch from sneaking in unrelated changes.
 *  3. Working tree must be clean (no unstaged changes) — the user's WIP
 *     should not be silently merged with the autofix.
 */

import type { Patch } from "./types";

export type ValidatePatchResult =
	| { ok: true; touchedFiles: string[] }
	| {
			ok: false;
			code: "empty-diff" | "malformed-diff" | "out-of-scope";
			message: string;
			details?: { offending?: string[] };
	  };

/**
 * Parse the `diff --git a/<file> b/<file>` headers in a unified diff and
 * return the set of repo-relative paths the patch will touch.
 *
 * Supports the standard `a/` `b/` prefixes git emits. Other formats
 * (mercurial, fossil, raw `--- ` / `+++ `) are out of scope for v1.
 */
export function extractPatchFiles(diff: string): string[] {
	const files = new Set<string>();
	const lines = diff.split("\n");
	for (const line of lines) {
		const m = line.match(/^diff --git a\/(\S+) b\/(\S+)/);
		if (!m?.[1] || !m?.[2]) continue;
		files.add(stripPrefix(m[1]));
		files.add(stripPrefix(m[2]));
	}
	return Array.from(files);
}

function stripPrefix(p: string): string {
	if (p.startsWith("./")) return p.slice(2);
	return p;
}

/**
 * Validate a patch's scope: every file it touches must appear in
 * `allowedFiles`. Empty patches and malformed diffs are rejected.
 */
export function validatePatchScope(
	patch: Patch | undefined | null,
	allowedFiles: ReadonlyArray<string>,
): ValidatePatchResult {
	if (!patch || !patch.diff || patch.diff.trim().length === 0) {
		return {
			ok: false,
			code: "empty-diff",
			message: "Patch is empty.",
		};
	}

	const files = extractPatchFiles(patch.diff);
	if (files.length === 0) {
		return {
			ok: false,
			code: "malformed-diff",
			message:
				"No `diff --git a/<file> b/<file>` headers found. Patch is not a valid git unified diff.",
		};
	}

	const allowed = new Set(allowedFiles.map(stripPrefix));
	const offending = files.filter((f) => !allowed.has(f));
	if (offending.length > 0) {
		return {
			ok: false,
			code: "out-of-scope",
			message: `Patch touches files outside the receipt's diff scope: ${offending.join(", ")}`,
			details: { offending },
		};
	}

	return { ok: true, touchedFiles: files };
}
