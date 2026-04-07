# Feature 029: AI-Driven Interactive maina init

GitHub Issue: mainahq/maina#59

## Problem

`maina init` generates a static template constitution, doesn't set up API keys, and doesn't configure IDE integration. Commands like `maina brainstorm` and `maina design` fail silently without API key. No guidance for first-time users.

## Why Now

First-time user experience is broken. Users init, try AI commands, get nothing. This is the #1 barrier to adoption.

## Success Criteria

- **SC-1:** `maina init` interactively prompts for API key when none found
- **SC-2:** Constitution generated using AI (not static template) when AI available
- **SC-3:** If no API key and inside host (Claude Code/Cursor), use host delegation
- **SC-4:** If no API key and no host, prompt user to run inside AI agent or enter key
- **SC-5:** API key saved to `.maina/.env` (gitignored)
- **SC-6:** Tool recommendations use AI when available, fall back to language-based filtering
- **SC-7:** Interactive multiselect for tool installation using @clack/prompts
- **SC-8:** Summary shows what was configured and next steps

## Dependencies

- Feature 028 (project-aware tool detection) must be complete

## Out of Scope

- MCP/agent file generation (that's #60)
- Cloud onboarding (that's maina-cloud #7/#8)
