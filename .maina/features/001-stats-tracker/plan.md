# Implementation Plan

> HOW only — see spec.md for WHAT and WHY.

## Architecture

- New module `packages/core/src/stats/tracker.ts` — data layer with `recordSnapshot()`, `getStats()`, `getLatest()`, `getTrends()`
- New Drizzle table `commit_snapshots` in `packages/core/src/db/schema.ts`
- New CLI command `packages/cli/src/commands/stats.ts` — `maina stats` with `--json` and `--last N`
- Integration point: `packages/cli/src/commands/commit.ts` — call `recordSnapshot()` after successful commit

## Tasks

- [ ] T001: Add `commit_snapshots` Drizzle schema to `packages/core/src/db/schema.ts`
- [ ] T002: Write tests for `tracker.ts` — `recordSnapshot`, `getStats`, `getLatest`, `getTrends`
- [ ] T003: Implement `packages/core/src/stats/tracker.ts` with all four functions
- [ ] T004: Write tests for `maina stats` CLI command — default output, `--json`, `--last N`
- [ ] T005: Implement `packages/cli/src/commands/stats.ts` and register in `program.ts`
- [ ] T006: Integrate `recordSnapshot()` into `commitAction()` in commit.ts — capture timing, pipeline result, cache stats
