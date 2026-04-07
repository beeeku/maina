# Feature 028: Project-Aware Tool Detection and Installation

GitHub Issue: mainahq/maina#63

## Problem

`maina init --install` tries to install all 18 tools in TOOL_REGISTRY regardless of project language. A JavaScript project gets prompted to install golangci-lint, cargo-clippy, ruff, etc. `detectStack()` only recognizes Node.js projects (checks package.json only).

## Why Now

Foundational for the AI-driven init (#59). Tool recommendations need to be project-aware before AI can make intelligent suggestions.

## Success Criteria

- **SC-1:** `detectStack()` recognizes Go (go.mod), Rust (Cargo.toml), Python (pyproject.toml/requirements.txt), Java (pom.xml/build.gradle), .NET (*.csproj/*.sln), and multi-language projects
- **SC-2:** TOOL_REGISTRY includes `languages` and `tier` metadata for each tool
- **SC-3:** `detectTools()` accepts optional `languages` filter and only checks relevant tools
- **SC-4:** `maina init --install` uses project-aware filtering — only installs tools for detected languages
- **SC-5:** Universal tools (semgrep, trivy, secretlint) are always recommended regardless of language
- **SC-6:** Existing TypeScript/JavaScript detection unchanged (backward compatible)

## Out of Scope

- AI-driven recommendations (that's #59)
- Interactive multiselect UI (that's #59)
- New linter parsers (already done in feature 012)
