/**
 * Review tools — two-stage PR review for MCP clients.
 */

import { join } from "node:path";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerReviewTools(server: McpServer): void {
	server.tool(
		"reviewCode",
		"Run two-stage review (spec compliance + code quality) on a diff",
		{ diff: z.string(), planContent: z.string().optional() },
		async ({ diff, planContent }) => {
			try {
				const { runTwoStageReview } = await import("@maina/core");
				const result = await runTwoStageReview({
					diff,
					planContent,
					mainaDir: join(process.cwd(), ".maina"),
				});
				return {
					content: [
						{
							type: "text" as const,
							text: JSON.stringify(result, null, 2),
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
