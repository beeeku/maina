# Implementation Plan

> HOW only — see spec.md for WHAT and WHY.

## Architecture

Both features (B: interactive spec, C: multi-approach design) follow the same pattern:

1. AI analyzes existing artifacts (plan.md or context) to generate questions/approaches
2. @clack/prompts presents them interactively in the terminal
3. User answers are recorded back into artifacts (spec.md or ADR)
4. Existing generation continues with enriched context

**Integration points:**
- `specAction()` in `packages/cli/src/commands/spec.ts` — insert question phase before `generateTestStubs()`
- `designAction()` in `packages/cli/src/commands/design.ts` — insert approach phase before ADR write
- `tryAIGenerate()` for question/approach generation (new tasks: `spec-questions`, `design-approaches`)
- MCP `suggestTests` tool — include questions in response
- `--no-interactive` flag on both commands to skip for CI/subagents

## Key Technical Decisions

- **AI generates questions from plan content** — not templates. Uses `tryAIGenerate("spec-questions", ...)` with plan.md as input. Returns structured JSON (array of questions with type: text|select).
- **@clack/prompts for interaction** — consistent with existing CLI UX (maina plan, maina design already use it). `text()` for open questions, `select()` for multiple choice.
- **Answers appended to spec.md** — under a `## Clarifications` section. This enriches future spec runs.
- **Approaches rendered as numbered options** — 2-3 approaches with pros/cons. User selects via `select()`. Decision recorded in ADR under `## Alternatives Considered`.
- **New default prompt files** — `spec-questions.md` and `design-approaches.md` in `packages/core/src/prompts/defaults/`.

## Files

| File | Purpose | New/Modified |
|------|---------|-------------|
| `packages/core/src/prompts/defaults/spec-questions.md` | Prompt for generating clarifying questions from plan | New |
| `packages/core/src/prompts/defaults/design-approaches.md` | Prompt for generating approaches with tradeoffs | New |
| `packages/core/src/ai/spec-questions.ts` | `generateSpecQuestions()` — parse plan, return questions | New |
| `packages/core/src/ai/design-approaches.ts` | `generateDesignApproaches()` — parse context, return approaches | New |
| `packages/core/src/index.ts` | Export new functions | Modified |
| `packages/cli/src/commands/spec.ts` | Add interactive question phase | Modified |
| `packages/cli/src/commands/design.ts` | Add approach proposal phase | Modified |
| `packages/mcp/src/tools/suggest-tests.ts` | Include questions in MCP response | Modified |
| `packages/core/src/ai/__tests__/spec-questions.test.ts` | Tests for question generation | New |
| `packages/core/src/ai/__tests__/design-approaches.test.ts` | Tests for approach generation | New |
| `packages/cli/src/commands/__tests__/spec.test.ts` | Tests for interactive spec flow | Modified |
| `packages/cli/src/commands/__tests__/design.test.ts` | Tests for interactive design flow | Modified |

## Tasks

TDD: every implementation task must have a preceding test task.

### Part B: Interactive Spec Questions

- [ ] Task 1: Create `spec-questions.md` prompt template
- [ ] Task 2: Write failing tests for `generateSpecQuestions()`
- [ ] Task 3: Implement `generateSpecQuestions()` in `core/ai/spec-questions.ts`
- [ ] Task 4: Write failing tests for interactive spec flow in `spec.test.ts`
- [ ] Task 5: Add question phase to `specAction()` — ask questions, append to spec.md
- [ ] Task 6: Add `--no-interactive` flag to spec command
- [ ] Task 7: Update MCP `suggestTests` to include questions

### Part C: Multi-Approach Design

- [ ] Task 8: Create `design-approaches.md` prompt template
- [ ] Task 9: Write failing tests for `generateDesignApproaches()`
- [ ] Task 10: Implement `generateDesignApproaches()` in `core/ai/design-approaches.ts`
- [ ] Task 11: Write failing tests for interactive design flow in `design.test.ts`
- [ ] Task 12: Add approach phase to `designAction()` — propose, select, record in ADR
- [ ] Task 13: Add `--no-interactive` flag to design command

### Integration

- [ ] Task 14: Export new functions from `packages/core/src/index.ts`
- [ ] Task 15: Run `maina verify --all`, fix any findings
- [ ] Task 16: Run `maina analyze` to verify spec-plan consistency

## Failure Modes

- **No API key / host delegation**: `generateSpecQuestions()` returns empty array → skip question phase, generate stubs directly (current behavior). Same for approaches.
- **AI returns malformed JSON**: Parse with try/catch, fall back to empty array. Log warning.
- **User cancels interactive prompt**: @clack/prompts returns `isCancel(value)` → exit gracefully, don't write partial answers.
- **plan.md is empty**: Return 0 questions with info message "Plan is empty — fill in plan.md first."

## Testing Strategy

- **Unit tests** for `generateSpecQuestions()` and `generateDesignApproaches()` — mock AI responses, test JSON parsing, test fallback on empty/error.
- **Integration tests** for `specAction()` and `designAction()` — mock deps including the new AI functions, verify questions are asked and answers written.
- **No interactive tests** — verify `--no-interactive` skips question/approach phase entirely.
- **MCP test** — verify `suggestTests` includes questions array in response.
