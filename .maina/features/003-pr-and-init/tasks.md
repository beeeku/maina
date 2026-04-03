# Task Breakdown

## Tasks

- [ ] T001: Write tests and implement two-stage PR review in packages/core/src/review/index.ts
- [ ] T002: Write tests and implement maina pr CLI command with gh CLI integration
- [ ] T003: Write tests and implement maina init bootstrapping in packages/core/src/init/index.ts
- [ ] T004: Write tests and implement maina init CLI command
- [ ] T005: Write tests and implement maina status CLI command reading working.json

## Dependencies

- T002 depends on T001 (PR command uses review core)
- T004 depends on T003 (init command uses init core)
- T005 is independent

## Definition of Done

- [ ] All tests pass
- [ ] Biome lint clean
- [ ] TypeScript compiles
- [ ] maina analyze shows no errors
- [ ] maina init works on this repo
- [ ] maina status shows real data from working.json
