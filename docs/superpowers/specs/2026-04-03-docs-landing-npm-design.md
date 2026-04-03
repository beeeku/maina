# Sprint 10: Docs, Landing Page & npm Publish

## Overview

Docs-first site with a polished AI-startup-style landing page as homepage. Built with Astro Starlight, deployed to GitHub Pages. Alongside: npm publish for all packages so `bunx maina` works globally.

## Decisions

- **Framework:** Astro Starlight (docs) + custom Astro page (landing)
- **Deploy:** GitHub Actions → GitHub Pages at `https://beeeku.github.io/maina/`
- **Logo:** Golden spiral mynah bird — abstract low-poly SVG (~5 shapes), concentric forms where the bird IS the golden ratio. Orange (#f97316) core, dark body (#1a1a1a).
- **Visual style:** Light & Bold — warm white (#fafaf9) background, bold typography, orange accent, system font stack. Developer-focused but premium.
- **npm:** Publish `@maina/cli`, `@maina/core`, `@maina/mcp`, `@maina/skills` via changesets.

## Site Architecture

```
packages/docs/                  # New Astro + Starlight package
├── astro.config.mjs            # Starlight config, GitHub Pages base
├── package.json
├── tsconfig.json
├── src/
│   ├── pages/
│   │   └── index.astro         # Custom landing page (NOT Starlight)
│   ├── content/docs/           # Starlight MDX content
│   │   ├── getting-started.mdx
│   │   ├── commands.mdx
│   │   ├── configuration.mdx
│   │   ├── mcp/
│   │   │   └── index.mdx
│   │   ├── skills.mdx
│   │   ├── engines/
│   │   │   ├── context.mdx
│   │   │   ├── prompt.mdx
│   │   │   └── verify.mdx
│   │   └── roadmap.mdx
│   ├── components/
│   │   ├── Hero.astro          # Golden spiral mynah + headline + metrics
│   │   ├── Engines.astro       # Three engines cards
│   │   ├── Terminal.astro      # Terminal demo section
│   │   └── Footer.astro
│   └── assets/
│       └── mynah.svg           # Golden spiral bird, standalone
├── public/
│   └── favicon.svg
```

## Landing Page

### Hero

- Golden spiral mynah SVG centered, large (~120px)
- Headline: "Prove AI code is correct before it merges."
- Subtitle: CLI + MCP server + skills package. Three engines that observe, learn, and verify.
- Two CTAs: `$ bunx maina init` (dark, monospace) + "Read the docs" (outline)
- Metrics strip: 802 tests | 8.8s verify | 742 entities | 20 commands

### Three Engines

- Section label: "Three Engines" in orange uppercase
- "Observe. Learn. Verify." heading
- Three cards: Context (observes), Prompt (learns), Verify (verifies)
- Light gray background (#f5f5f4)

### How It Works

- Three-step flow: `maina init` → `maina commit` → verified
- Static terminal mockup showing a `maina commit` session

### Features Grid

Six cards linking to docs:
- MCP Server — 8 tools, any MCP-compatible IDE
- Cross-platform Skills — Claude Code, Cursor, Codex, Gemini CLI
- Slop Detection — Catch AI-generated filler patterns
- PageRank Context — Tree-sitter AST + dependency graph scoring
- Prompt Evolution — A/B tested prompts that improve from feedback
- Zero Config — Works with nothing beyond Git and Bun

### Footer

GitHub link, npm badge, Apache 2.0, "Built with Maina"

## Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| Background | #fafaf9 | Page background |
| Text primary | #1a1a1a | Headlines, body |
| Text secondary | #78716c | Subtitles, descriptions |
| Text muted | #a8a29e | Labels, captions |
| Accent | #f97316 | Orange — CTAs, bird core, section labels |
| Card bg | #ffffff | Card backgrounds |
| Card border | #e7e5e4 | Card borders |
| Section bg | #f5f5f4 | Alternating sections |
| Font | System stack | -apple-system, sans-serif, monospace for code |

## Docs Content

### Sidebar Structure

```
Start Here
  ├── Getting Started
  └── Commands

Reference
  ├── Configuration
  ├── MCP Server
  └── Skills

Engines
  ├── Context Engine
  ├── Prompt Engine
  └── Verify Engine

Roadmap
  └── What's Next
```

### Content Sources

| Page | Source | Key content |
|------|--------|-------------|
| Getting Started | README | Install, init, first commit, zero-friction layers |
| Commands | README | All 20 commands with usage examples |
| Configuration | README | maina.config.ts, model tiers, budget config |
| MCP Server | README | Setup JSON, 8 tools with descriptions |
| Skills | README | 5 skills, cross-platform setup |
| Context Engine | PRODUCT_SPEC | 4 layers, PageRank, dynamic budget, diagrams |
| Prompt Engine | PRODUCT_SPEC | Constitution, versioning, A/B evolution loop |
| Verify Engine | PRODUCT_SPEC | Pipeline diagram, tool auto-detection, diff-only |
| Roadmap | Research notes | Browser extension, DAST via MCP, Pi-inspired patterns |

### Starlight Config

- Search: Pagefind (built-in)
- Dark/light toggle: enabled
- GitHub edit links: enabled, pointing to `beeeku/maina`
- Base path: `/maina/`
- Social links: GitHub

## npm Publish

### Package Changes

- Remove `"private": true` from root `package.json`
- All four packages already have correct names, `files`, `main`, `bin` fields:
  - `@maina/cli` — bin entry `maina` → `dist/index.js`
  - `@maina/core` — library
  - `@maina/mcp` — library
  - `@maina/skills` — library
- Changesets already configured (`@changesets/cli`, `@changesets/changelog-github`)
- `bun run release` = `bun run build && changeset publish`

### GitHub Actions

Two workflows:

**1. Docs deploy** (`.github/workflows/docs.yml`):
- Trigger: push to master (paths: `packages/docs/**`)
- Steps: checkout → bun install → build Astro → deploy to GitHub Pages
- Uses `actions/deploy-pages@v4`

**2. npm publish** (`.github/workflows/release.yml`):
- Trigger: push to master
- Steps: checkout → bun install → build → changeset version → changeset publish
- Uses `NPM_TOKEN` secret
- Changesets bot creates version PRs automatically

## Roadmap Page Content (from research)

The roadmap page incorporates learnings from the Pi/browser ecosystem research:

### v1.1 — CLI Enhancements
- `--json` output mode for all commands (CI integration, inspired by Pi's print mode)
- Structured tool results: separate AI-facing `content` from terminal-facing `details`

### v1.5 — Browser Verification
- `maina verify --dast` wrapping ZAP REST API for header/cookie/CSP checks
- `maina verify --lighthouse` for accessibility/performance gates
- Playwright MCP as optional E2E verification (accessibility tree over screenshots)

### v2.0 — Extension System & Browser
- Chrome MV3 extension with WebSocket bridge to MCP server
- DevTools panel showing verification results inline
- `transformContext` hooks for extensions (inspired by Pi's extension API)
- `maina extend` command for scaffolding new hooks/extensions

### Future
- Cumulative file tracking across context compaction sessions
- Branch summarization for episodic context (abandoned plan → summary → episodic entry)
- Self-extending agent: Maina builds its own extensions at runtime
