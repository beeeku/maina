# AGENTS.md

Instructions for AI agents working in this repository.

## Project

Maina — verification-first developer OS. Three engines: Context (observes), Prompt (learns), Verify (verifies).

## Rules

- **Runtime:** Bun (NOT Node.js)
- **Lint/Format:** Biome 2.x (NOT ESLint/Prettier)
- **Test:** bun:test (NOT Jest/Vitest)
- **Error handling:** Result<T, E> pattern. Never throw.
- **Commits:** Conventional commits. Scopes: cli, core, mcp, skills, docs, ci.
- **TDD:** Write tests first, then implement.
- **Separation:** WHAT/WHY in spec.md, HOW in plan.md.
- **Ambiguity:** Use `[NEEDS CLARIFICATION: question]` markers. Never guess.

## Verification

Before committing, run: `bun run verify` (biome check + tsc --noEmit + bun test).

## Structure

Bun monorepo with workspaces: `packages/cli`, `packages/core`, `packages/mcp`, `packages/skills`.
