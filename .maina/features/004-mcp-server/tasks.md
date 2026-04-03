# Task Breakdown

## Tasks

- [ ] T001: Install @modelcontextprotocol/sdk, write tests and implement MCP server scaffold with stdio transport
- [ ] T002: Write tests and implement context tools (getContext, getConventions) delegating to Context Engine + Prompt Engine
- [ ] T003: Write tests and implement verify tools (verify, checkSlop) delegating to Verify Engine
- [ ] T004: Write tests and implement feature tools (suggestTests, analyzeFeature) delegating to Features module
- [ ] T005: Write tests and implement explain tool (explainModule) delegating to Explain module
- [ ] T006: Wire --mcp flag into CLI entrypoint and test end-to-end

## Dependencies

- T002-T005 depend on T001 (server scaffold must exist)
- T006 depends on T001-T005 (all tools must be registered)

## Definition of Done

- [ ] All tests pass
- [ ] Biome lint clean
- [ ] TypeScript compiles
- [ ] `maina --mcp` starts server without error
- [ ] Claude Code config works: `{ "mcpServers": { "maina": { "command": "bun", "args": ["run", "--bun", "packages/cli/src/index.ts", "--mcp"] } } }`
