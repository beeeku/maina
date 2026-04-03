# Implementation Plan

> HOW only — see spec.md for WHAT and WHY.

## Architecture

- Pattern: MCP server with stdio transport, tools delegate to existing engines
- Integration points: Context Engine (assembleContext), Verify Engine (runPipeline, detectSlop), Prompt Engine (buildSystemPrompt), Features (analyze, verifyPlan), Explain (generateDependencyDiagram)
- Entry: `maina --mcp` flag adds MCP mode to existing CLI entrypoint

## Key Technical Decisions

- @modelcontextprotocol/sdk for MCP protocol handling
- Each tool is a thin wrapper — calls existing core function, formats response as JSON
- Cache-aware: tools that call assembleContext or generate() benefit from existing 3-layer cache
- Host delegation: tools that need AI return { delegation: true, systemPrompt, userPrompt } so the host IDE processes it

## Files

| File | Purpose | New/Modified |
|------|---------|-------------|
| packages/mcp/src/server.ts | MCP server setup with stdio transport | New |
| packages/mcp/src/tools/context.ts | getContext + getConventions tools | New |
| packages/mcp/src/tools/verify.ts | verify + checkSlop tools | New |
| packages/mcp/src/tools/features.ts | suggestTests + analyzeFeature tools | New |
| packages/mcp/src/tools/explain.ts | explainModule tool | New |
| packages/mcp/src/index.ts | Server entrypoint | Modified |
| packages/cli/src/index.ts | Add --mcp flag | Modified |

## Tasks

- [ ] T001: Install @modelcontextprotocol/sdk, write tests and implement MCP server scaffold with stdio transport
- [ ] T002: Write tests and implement context tools (getContext, getConventions) delegating to Context Engine + Prompt Engine
- [ ] T003: Write tests and implement verify tools (verify, checkSlop) delegating to Verify Engine
- [ ] T004: Write tests and implement feature tools (suggestTests, analyzeFeature) delegating to Features module
- [ ] T005: Write tests and implement explain tool (explainModule) delegating to Explain module
- [ ] T006: Wire --mcp flag into CLI entrypoint and test end-to-end

## Failure Modes

- MCP SDK not installed → helpful error on `maina --mcp`
- Tool throws → MCP server returns error response, doesn't crash
- No .maina/ directory → tools return empty/default responses
- Host agent sends malformed input → validate with zod schemas

## Testing Strategy

- Unit tests per tool: mock core functions, verify JSON output shape
- Server test: verify tool registration and listing
- Integration: test actual MCP message flow with stdin/stdout mocking
