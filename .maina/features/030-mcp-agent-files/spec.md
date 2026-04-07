# Feature 030: Auto-Configure MCP + Agent Instruction Files During Init

GitHub Issue: mainahq/maina#60

## Problem

Claude Code (and other AI agents) don't remember the maina workflow between sessions. CLAUDE.md references constitution but has no MCP setup. No `.mcp.json` exists. Skills README claims auto-detection but no mechanism exists.

## Why Now

Users must manually configure MCP every time. Agent instruction files are missing or generic. This breaks the dogfooding loop.

## Success Criteria

- **SC-1:** `maina init` writes `.mcp.json` with maina server config to project root
- **SC-2:** IDE detected via env vars (CLAUDECODE, CURSOR_SESSION, TERM_PROGRAM)
- **SC-3:** Agent instruction files generated: CLAUDE.md, GEMINI.md, AGENTS.md, .cursorrules, COPILOT.md
- **SC-4:** Each file tailored to that agent's format with workflow order + constitution ref + MCP tools
- **SC-5:** AI-generated content when AI available, enhanced templates when not
- **SC-6:** If file already exists, merge maina section rather than overwrite
- **SC-7:** All generated files reference `.maina/constitution.md` and MCP tools

## Dependencies

- Feature 029 (AI-driven init) must be complete

## Out of Scope

- Hooks configuration for Claude Code
- Skills auto-installation
