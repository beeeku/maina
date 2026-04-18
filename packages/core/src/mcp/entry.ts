/**
 * The maina MCP server entry. Single source of truth so every client
 * registers the same `command` / `args` shape — and so a future change
 * is one edit.
 *
 * We use `npx` (not `bunx`) on purpose: npm ships with Node which ships
 * with virtually every developer environment, including the AI clients
 * we target (Claude Code, Cursor, Windsurf, etc.). `bunx` would require
 * users to install Bun globally just to run the maina MCP server. The
 * setup wizard, init, and the per-project configs already use `npx
 * @mainahq/cli` for the same reason — switching one surface would
 * fragment the install story.
 */

export const MAINA_MCP_KEY = "maina";

const LAUNCHER_COMMAND = "npx";
const LAUNCHER_ARGS: readonly string[] = ["@mainahq/cli", "--mcp"];

export interface MainaMcpEntry {
	command: string;
	args: string[];
}

export function buildMainaEntry(): MainaMcpEntry {
	return {
		command: LAUNCHER_COMMAND,
		args: [...LAUNCHER_ARGS],
	};
}

/**
 * Same shape as `buildMainaEntry()` but typed for serialisers that want
 * a plain `Record<string, unknown>` (e.g. the TOML emitter for Codex).
 */
export function buildMainaTomlSection(): Record<string, unknown> {
	const entry = buildMainaEntry();
	return { command: entry.command, args: entry.args };
}
