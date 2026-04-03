# Task Breakdown

## Tasks

### Part B: Interactive Spec Questions

- [ ] Task 1: Create spec-questions.md prompt template
- [ ] Task 2: Write failing tests for generateSpecQuestions()
- [ ] Task 3: Implement generateSpecQuestions()
- [ ] Task 4: Write failing tests for interactive spec flow
- [ ] Task 5: Add question phase to specAction()
- [ ] Task 6: Add --no-interactive flag to spec command
- [ ] Task 7: Update MCP suggestTests to include questions

### Part C: Multi-Approach Design

- [ ] Task 8: Create design-approaches.md prompt template
- [ ] Task 9: Write failing tests for generateDesignApproaches()
- [ ] Task 10: Implement generateDesignApproaches()
- [ ] Task 11: Write failing tests for interactive design flow
- [ ] Task 12: Add approach phase to designAction()
- [ ] Task 13: Add --no-interactive flag to design command

### Integration

- [ ] Task 14: Export new functions from core/index.ts
- [ ] Task 15: Run maina verify --all, fix findings
- [ ] Task 16: Run maina analyze, verify consistency

## Dependencies

- Tasks 2-3 depend on Task 1 (prompt template needed for AI generation)
- Tasks 4-6 depend on Task 3 (question generation needed for interactive flow)
- Task 7 depends on Task 3
- Tasks 9-10 depend on Task 8
- Tasks 11-13 depend on Task 10
- Task 14 depends on Tasks 3, 10
- Tasks 15-16 depend on all others

## Definition of Done

- [ ] All tests pass (803+ tests)
- [ ] Biome lint clean
- [ ] TypeScript compiles
- [ ] maina analyze shows no errors
- [ ] `maina spec` asks 3-5 questions from plan.md before generating stubs
- [ ] `maina spec --no-interactive` preserves current behavior
- [ ] `maina design` proposes 2-3 approaches before writing ADR
- [ ] `maina design --no-interactive` preserves current behavior
- [ ] Answers recorded in spec.md under ## Clarifications
- [ ] Approach selection recorded in ADR under ## Alternatives Considered
