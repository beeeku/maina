/**
 * Backfill script — subprocess-based CLI tests.
 *
 * Each test spawns the script as a child process and asserts on stdout,
 * stderr, and exit code. The main flow is tightly coupled to git + the gh
 * CLI + the receipt action, so we exercise the parser + arg-validation
 * paths here and leave the end-to-end smoke for a future integration
 * harness.
 */

import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const SCRIPT = join(import.meta.dir, "..", "backfill-receipts.ts");

// The script imports `@mainahq/core` (a workspace package) at module load,
// so the test must run from the workspace root for Bun's resolver to find
// it. Args still parse before any of the heavy deps run.
const REPO_ROOT = join(import.meta.dir, "..", "..");

function runScript(args: string[]): {
	exitCode: number | null;
	stdout: string;
	stderr: string;
} {
	const result = spawnSync("bun", ["run", SCRIPT, ...args], {
		encoding: "utf-8",
		cwd: REPO_ROOT,
	});
	return {
		exitCode: result.status,
		stdout: result.stdout ?? "",
		stderr: result.stderr ?? "",
	};
}

describe("backfill-receipts CLI", () => {
	test("--help prints usage and exits 0", () => {
		const result = runScript(["--help"]);
		expect(result.exitCode).toBe(0);
		expect(result.stdout).toContain("backfill-receipts");
		expect(result.stdout).toContain("--limit");
		expect(result.stdout).toContain("--dry-run");
	});

	test("rejects --limit with non-integer value", () => {
		const result = runScript(["--limit", "abc"]);
		expect(result.exitCode).not.toBe(0);
		expect(result.stderr.toLowerCase()).toContain("limit");
	});

	test("rejects --limit out of range (zero)", () => {
		const result = runScript(["--limit", "0"]);
		expect(result.exitCode).not.toBe(0);
		expect(result.stderr.toLowerCase()).toContain("limit");
	});

	test("rejects --limit out of range (too large)", () => {
		const result = runScript(["--limit", "201"]);
		expect(result.exitCode).not.toBe(0);
		expect(result.stderr.toLowerCase()).toContain("limit");
	});

	test("rejects unknown arg", () => {
		const result = runScript(["--bogus"]);
		expect(result.exitCode).not.toBe(0);
		expect(result.stderr.toLowerCase()).toContain("unknown arg");
	});

	test("rejects --repo with no value", () => {
		const result = runScript(["--repo"]);
		expect(result.exitCode).not.toBe(0);
		expect(result.stderr.toLowerCase()).toMatch(/--repo/);
	});

	test("rejects --repo followed by a flag", () => {
		const result = runScript(["--repo", "--dry-run"]);
		expect(result.exitCode).not.toBe(0);
		expect(result.stderr.toLowerCase()).toMatch(/--repo/);
	});

	test("rejects --repo with malformed slug", () => {
		const result = runScript(["--repo", "no-slash"]);
		expect(result.exitCode).not.toBe(0);
		expect(result.stderr.toLowerCase()).toMatch(/owner\/repo/);
	});
});
