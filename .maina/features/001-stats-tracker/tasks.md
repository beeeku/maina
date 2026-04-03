# Task Breakdown

## Tasks

- [ ] T001: Add `commit_snapshots` Drizzle schema to `packages/core/src/db/schema.ts`
- [ ] T002: Write tests for `tracker.ts` — `recordSnapshot`, `getStats`, `getLatest`, `getTrends`
- [ ] T003: Implement `packages/core/src/stats/tracker.ts` with all four functions
- [ ] T004: Write tests for `maina stats` CLI command — default output, `--json`, `--last N`
- [ ] T005: Implement `packages/cli/src/commands/stats.ts` and register in `program.ts`
- [ ] T006: Integrate `recordSnapshot()` into `commitAction()` in commit.ts — capture timing, pipeline result, cache stats

## Dependencies

- T002 depends on T001 (schema must exist for test fixtures)
- T003 depends on T002 (TDD: tests first)
- T004 depends on T003 (CLI tests mock the tracker)
- T005 depends on T004 (TDD: tests first)
- T006 depends on T003 + T005 (both must exist)

## Notes

- All commits dogfooded through `maina commit`
- Stats recording must be wrapped in try/catch — never block a commit
