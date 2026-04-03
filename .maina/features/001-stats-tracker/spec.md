# Feature: Internal Stats Tracker

## User Stories

- As a maina developer, I want to see how verification time trends across commits so I can catch performance regressions.
- As a maina developer, I want to track cache hit rates so I can verify the cache is saving tokens and cost.
- As a maina developer, I want to see findings-per-commit trends so I can measure code quality improvement.

## Acceptance Criteria

- [ ] Record a commit snapshot with timing, token, cache, and quality stats after every successful maina commit via recordSnapshot in commitAction
- [ ] Implement maina stats command showing last commit stats, rolling averages, and trend arrows
- [ ] Support maina stats --json to output raw commit snapshots as JSON
- [ ] Support maina stats --last N to limit displayed commits
- [ ] Compute trends comparing recent N vs previous N commits with directional indicators via getTrends
- [ ] Add commit_snapshots Drizzle schema to the database
- [ ] Stats recording wrapped in try/catch so it never blocks a commit
- [ ] Implement tracker with recordSnapshot, getStats, getLatest, getTrends functions

## Design Decisions

- Chose SQLite over flat files for queryable aggregation
- Chose post-commit integration in commitAction over a separate hook for reliability
- Chose terminal text over charts for internal use
