# Implementation Plan

> HOW only — see spec.md for WHAT and WHY.

## Architecture

- Pattern: thin CLI wrapper over gh CLI + Context Engine
- `packages/core/src/ticket/index.ts` — detectModules from semantic entities, buildIssueBody, createTicket via gh CLI
- `packages/cli/src/commands/ticket.ts` — Commander command with @clack/prompts

## Tasks

- [ ] T001: Write tests for core ticket module — detectModules, buildIssueBody, createTicket
- [ ] T002: Implement packages/core/src/ticket/index.ts with gh CLI integration
- [ ] T003: Write tests for maina ticket CLI command — interactive and non-interactive modes
- [ ] T004: Implement packages/cli/src/commands/ticket.ts and register in program.ts
