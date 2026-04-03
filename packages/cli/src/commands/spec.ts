import { existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { intro, log, outro } from "@clack/prompts";
import { generateTestStubs, getCurrentBranch } from "@maina/core";
import { Command } from "commander";

// ── Types ────────────────────────────────────────────────────────────────────

export interface SpecActionOptions {
	featureDir?: string; // Explicit feature dir, or auto-detect from branch
	output?: string; // Output file path (default: feature dir / spec-tests.ts)
	cwd?: string;
}

export interface SpecActionResult {
	generated: boolean;
	reason?: string;
	outputPath?: string;
	taskCount?: number;
}

export interface SpecDeps {
	getCurrentBranch: (cwd: string) => Promise<string>;
}

// ── Default Dependencies ─────────────────────────────────────────────────────

const defaultDeps: SpecDeps = { getCurrentBranch };

// ── Feature Directory Resolution ─────────────────────────────────────────────

/**
 * Extract feature name from branch (e.g. "feature/001-user-auth" → "001-user-auth").
 * Returns null if the branch doesn't match the feature pattern.
 */
function extractFeatureFromBranch(branch: string): string | null {
	const match = branch.match(/^feature\/(.+)$/);
	return match?.[1] ?? null;
}

/**
 * Find a matching feature directory in .maina/features/ given a feature name.
 */
function findFeatureDir(cwd: string, featureName: string): string | null {
	const featuresDir = join(cwd, ".maina", "features");

	if (!existsSync(featuresDir)) {
		return null;
	}

	const entries = readdirSync(featuresDir);
	for (const entry of entries) {
		if (entry === featureName) {
			const fullPath = join(featuresDir, entry);
			return fullPath;
		}
	}

	return null;
}

// ── Core Action (testable) ───────────────────────────────────────────────────

/**
 * The core spec logic, extracted so tests can call it directly
 * without going through Commander parsing.
 */
export async function specAction(
	options: SpecActionOptions,
	deps: SpecDeps = defaultDeps,
): Promise<SpecActionResult> {
	const cwd = options.cwd ?? process.cwd();

	// ── Step 1: Determine feature directory ──────────────────────────────
	let featureDir: string;

	if (options.featureDir) {
		featureDir = options.featureDir;
	} else {
		const branch = await deps.getCurrentBranch(cwd);
		const featureName = extractFeatureFromBranch(branch);

		if (!featureName) {
			return {
				generated: false,
				reason: `Not on a feature branch (current: "${branch}"). Use --feature-dir to specify explicitly.`,
			};
		}

		const detected = findFeatureDir(cwd, featureName);
		if (!detected) {
			return {
				generated: false,
				reason: `Feature directory not found for "${featureName}" in .maina/features/`,
			};
		}

		featureDir = detected;
	}

	// ── Step 2: Read plan.md ─────────────────────────────────────────────
	const planPath = join(featureDir, "plan.md");

	if (!existsSync(planPath)) {
		return {
			generated: false,
			reason: `plan.md not found at ${planPath}`,
		};
	}

	const planContent = readFileSync(planPath, "utf-8");

	// ── Step 3: Extract feature name for describe block ──────────────────
	// Try to get feature name from dir name (e.g. "001-user-auth" → "user-auth")
	const dirBasename = featureDir.split("/").pop() ?? "unknown";
	const featureName = dirBasename.replace(/^\d+-/, "");

	// ── Step 4: Generate test stubs ──────────────────────────────────────
	const testContent = generateTestStubs(planContent, featureName);
	const taskCount = (testContent.match(/\bit\(/g) ?? []).length;

	// ── Step 5: Write output file ────────────────────────────────────────
	const outputPath = options.output ?? join(featureDir, "spec-tests.ts");

	// Ensure parent directory exists
	const outputDir = outputPath.substring(0, outputPath.lastIndexOf("/"));
	if (outputDir && !existsSync(outputDir)) {
		mkdirSync(outputDir, { recursive: true });
	}

	await Bun.write(outputPath, testContent);

	return {
		generated: true,
		outputPath,
		taskCount,
	};
}

// ── Commander Command ────────────────────────────────────────────────────────

export function specCommand(): Command {
	return new Command("spec")
		.description("Generate TDD test stubs from plan")
		.option("--feature-dir <dir>", "Feature directory path")
		.option("-o, --output <path>", "Output file path")
		.action(async (options) => {
			intro("maina spec");

			const result = await specAction({
				featureDir: options.featureDir,
				output: options.output,
			});

			if (result.generated) {
				log.success(`Generated ${result.taskCount} test stub(s)`);
				log.info(`Output: ${result.outputPath}`);
				outro("Test stubs ready — run tests to see red phase");
			} else {
				log.error(result.reason ?? "Unknown error");
				outro("Aborted");
			}
		});
}
