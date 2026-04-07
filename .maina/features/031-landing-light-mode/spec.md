# Feature 031: Landing Page Full Light Mode

GitHub Issue: mainahq/maina#61

## Problem

Landing page CSS hardcodes dark colors (`--bg: #0a0a0a`). Starlight docs pages have dark/light toggle but landing page is dark-only. Inconsistent UX.

## Why Now

Users who prefer light mode see a jarring switch between landing page and docs.

## Success Criteria

- **SC-1:** Landing page has full light theme with all custom properties overridden
- **SC-2:** Theme toggle visible on landing page, synced with Starlight's toggle
- **SC-3:** Terminal demo component stays dark in light mode (authentic terminal look)
- **SC-4:** All landing components render correctly in both modes
- **SC-5:** `prefers-color-scheme: light` respected on first visit
- **SC-6:** No FOUC (flash of unstyled content) on theme switch

## Out of Scope

- Redesigning landing page layout
- Adding new components
