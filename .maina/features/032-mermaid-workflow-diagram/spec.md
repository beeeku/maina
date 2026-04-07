# Feature 032: Add Mermaid Workflow Diagram to Commands Docs

GitHub Issue: mainahq/maina#62

## Problem

Zero Mermaid diagrams across all docs. 34+ commands documented as text-only tables. Users and AI agents confused about which commands to use and in what order.

## Why Now

The command lifecycle is the core UX of maina. Without a visual diagram, onboarding friction is high.

## Success Criteria

- **SC-1:** Mermaid plugin installed and configured for Starlight
- **SC-2:** Command lifecycle flowchart renders in `commands.mdx`
- **SC-3:** Diagram color-coded by phase (Discovery, Planning, Execution, Ship)
- **SC-4:** Diagram placed at top of page before command tables
- **SC-5:** Renders correctly in both dark and light modes
- **SC-6:** Build succeeds with no errors

## Out of Scope

- Diagrams for verify pipeline, context engine, MCP architecture (future)
- Interactive diagrams
