# Feature: maina ticket

## User Stories

- As a developer, I want to create a GitHub Issue from the terminal with automatic module tagging so I don't need to context-switch to the browser.

## Acceptance Criteria

- [ ] `maina ticket` creates a GitHub Issue via the gh CLI
- [ ] Ticket includes a title and body provided by the user via interactive prompts
- [ ] Context Engine semantic layer auto-detects relevant modules and adds them as labels
- [ ] Supports `--title` and `--body` flags for non-interactive use
- [ ] Supports `--label` flag to add custom labels
- [ ] Gracefully handles missing gh CLI with helpful error message
- [ ] Works without AI — module tagging uses tree-sitter entity index, not LLM

## Design Decisions

- Use gh CLI instead of @octokit/rest to avoid OAuth token management complexity
- Module tagging derives from Context Engine's semantic entity index (already built)
