/**
 * Feature tools — test stub generation and cross-artifact analysis for MCP clients.
 */

import { join } from "node:path";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

/**
 * Resolve the path to the CLI spec module at runtime.
 * Uses a computed string so TypeScript does not try to include it
 * in the rootDir check at compile time.
 */
function specModulePath(): string {
	return join(
		import.meta.dir,
		"..",
		"..",
		"..",
		"cli",
		"src",
		"commands",
		"spec",
	);
}

export function registerFeatureTools(server: McpServer): void {
	server.tool(
		"suggestTests",
		"Generate TDD test stubs from a plan.md file",
		{ planPath: z.string() },
		async ({ planPath }) => {
			try {
				const content = await Bun.file(planPath).text();
				const mod = await import(specModulePath());
				const stubs = mod.generateTestStubs(content, "feature");
				return { content: [{ type: "text" as const, text: stubs }] };
			} catch (e) {
				return {
					content: [
						{
							type: "text" as const,
							text: `Error: ${e instanceof Error ? e.message : String(e)}`,
						},
					],
					isError: true,
				};
			}
		},
	);

	server.tool(
		"analyzeFeature",
		"Check spec/plan/tasks consistency for a feature",
		{ featureDir: z.string() },
		async ({ featureDir }) => {
			try {
				const { analyze } = await import("@maina/core");
				const result = analyze(featureDir);
				if (!result.ok) {
					return {
						content: [
							{ type: "text" as const, text: `Error: ${result.error}` },
						],
						isError: true,
					};
				}
				return {
					content: [
						{
							type: "text" as const,
							text: JSON.stringify(result.value, null, 2),
						},
					],
				};
			} catch (e) {
				return {
					content: [
						{
							type: "text" as const,
							text: `Error: ${e instanceof Error ? e.message : String(e)}`,
						},
					],
					isError: true,
				};
			}
		},
	);
}
