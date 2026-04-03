# Feature: maina pr + maina init + maina status

## Problem Statement

Teams using maina can verify and commit locally, but have no way to create PRs with automated review, bootstrap maina in new repos, or check current branch health. The workflow is incomplete — you can verify code but can't ship it through the standard PR process without leaving the terminal.

## Target User

- Primary: Developer who's been using maina commit and wants to create PRs with two-stage AI review
- Secondary: Team lead who wants to bootstrap maina in a new repo with one command

## User Stories

- As a developer, I want to create a PR from the terminal with auto-generated description so I don't context-switch to GitHub
- As a developer, I want my PR reviewed in two stages — spec compliance first, then code quality — so I catch both types of issues
- As a team lead, I want to run one command to set up maina in any repo with constitution, prompts, and CI
- As a developer, I want to see my current branch health at a glance

## Success Criteria

- [ ] `maina pr` creates a GitHub PR via gh CLI with auto-generated title and body from commits
- [ ] PR review runs two stages: spec compliance against PLAN.md, then code quality against conventions
- [ ] `maina init` bootstraps .maina/ directory with constitution.md, default prompts, hooks, and AGENTS.md
- [ ] `maina init` generates a CI workflow file for GitHub Actions
- [ ] `maina status` shows current branch, verification state, and context summary from working.json
- [ ] All commands work without AI — deterministic parts function with no API key
- [ ] `maina init` completes in under 5 seconds

## Scope

### In Scope

- PR creation via gh CLI, two-stage review core logic, init bootstrapping, status display

### Out of Scope

- GitLab/Bitbucket support (GitHub only for v1)
- PR merge automation (review only, human merges)
- CI workflow for non-GitHub platforms

## Design Decisions

- Use gh CLI for PR creation (consistent with maina ticket approach, avoids OAuth)
- Two-stage review as separate functions — can run independently or in sequence
- Init generates files but never overwrites existing ones (safe to re-run)
- Status reads from working.json — no git calls needed (fast)
