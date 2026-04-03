# Feature: MCP Server

## Problem Statement

Developers using Claude Code, Cursor, or Continue.dev don't get maina's context, verification, or memory when working in their IDE. The CLI works but requires terminal context-switching. MCP (Model Context Protocol) lets IDEs call maina's engines directly — the host agent gets enriched context, the AI output is better, and maina tracks everything.

## Target User

- Primary: Developer using Claude Code who wants maina's context engine feeding their AI assistant
- Secondary: Cursor/Continue.dev users who want verification-aware code suggestions

## User Stories

- As a Claude Code user, I want maina's context engine to provide focused codebase context to my AI assistant
- As an IDE user, I want to run maina verify from my editor without switching to terminal
- As a developer, I want maina's semantic index and episodic memory to improve AI suggestions

## Success Criteria

- [ ] MCP server starts via `maina --mcp` using stdio transport
- [ ] `getContext` tool returns assembled context for a given command
- [ ] `verify` tool runs the verification pipeline and returns findings
- [ ] `getConventions` tool returns constitution + team conventions
- [ ] `suggestTests` tool generates test stubs from a plan
- [ ] `checkSlop` tool runs slop detection on provided code
- [ ] `explainModule` tool returns dependency diagram for a scope
- [ ] `analyzeFeature` tool runs cross-artifact consistency check
- [ ] All tools use the cache — repeated calls are instant
- [ ] Claude Code config: `{ "mcpServers": { "maina": { "command": "maina", "args": ["--mcp"] } } }`
- [ ] Host delegation works: when AI is needed, returns structured prompt for the host to process

## Scope

### In Scope

- stdio MCP server with @modelcontextprotocol/sdk
- 8 tools delegating to existing engines
- Cache-aware responses
- `maina --mcp` flag on CLI entrypoint

### Out of Scope

- HTTP/SSE transport (stdio only for v1)
- MCP resources/prompts (tools only for v1)
- Auto-installation into IDE configs

## Design Decisions

- stdio transport (simplest, works everywhere, no port conflicts)
- Each MCP tool maps 1:1 to an existing engine function — no new logic needed
- Tools return structured JSON so the host agent can parse results
- Host delegation: when tool needs AI, it returns the prompt + context for the host to process
