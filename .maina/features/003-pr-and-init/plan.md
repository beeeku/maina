# Implementation Plan

> HOW only — see spec.md for WHAT and WHY.

## Architecture

- Pattern: thin CLI wrappers over gh CLI + Context Engine + Prompt Engine
- Integration points: assembleContext for PR review context, buildSystemPrompt for review prompts, working.json for status

## Key Technical Decisions

- gh CLI for PR creation (same pattern as maina ticket)
- Two-stage review as pure functions in packages/core/src/review/ — deterministic structure check + optional AI review
- Init uses file templates written with Bun.write — no external dependencies

## Files

| File | Purpose | New/Modified |
|------|---------|-------------|
| packages/core/src/review/index.ts | Two-stage review: spec compliance + code quality | New |
| packages/core/src/init/index.ts | Bootstrap .maina/ with all scaffolded files | New |
| packages/cli/src/commands/pr.ts | maina pr CLI command | New |
| packages/cli/src/commands/init.ts | maina init CLI command | New |
| packages/cli/src/commands/status.ts | maina status CLI command | New |

## Tasks

TDD: every implementation task must have a preceding test task.

- [ ] T001: Write tests and implement two-stage PR review in packages/core/src/review/index.ts
- [ ] T002: Write tests and implement maina pr CLI command with gh CLI integration
- [ ] T003: Write tests and implement maina init bootstrapping in packages/core/src/init/index.ts
- [ ] T004: Write tests and implement maina init CLI command
- [ ] T005: Write tests and implement maina status CLI command reading working.json

## Failure Modes

- gh CLI not installed → helpful error message, no crash
- Not a git repo → error on pr and init
- .maina/ already exists on init → skip existing files, don't overwrite
- No PLAN.md for spec compliance review → skip stage 1, run stage 2 only
- No working.json for status → show "no data yet" message

## Testing Strategy

- Core modules: unit tests with temp dirs and real files
- CLI commands: dependency injection (NOT mock.module)
- PR creation: mock gh CLI spawn
- Init: verify file creation in temp dir
- Review: test with real spec/plan content
