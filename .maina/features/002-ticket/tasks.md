# Task Breakdown

## Tasks

- [ ] T001: Write tests for core ticket module — detectModules, buildIssueBody, createTicket
- [ ] T002: Implement packages/core/src/ticket/index.ts with gh CLI integration
- [ ] T003: Write tests for maina ticket CLI command — interactive and non-interactive modes
- [ ] T004: Implement packages/cli/src/commands/ticket.ts and register in program.ts

## Dependencies

- T002 depends on T001 (TDD)
- T004 depends on T003 (TDD)
- T003 depends on T002 (CLI mocks core)

## Notes

- gh CLI must be detected at runtime (like other tools in verify/detect.ts)
- Module tagging uses existing semantic entity index from Context Engine
