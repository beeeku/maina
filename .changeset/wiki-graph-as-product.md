---
"@mainahq/cli": minor
"@mainahq/core": minor
"@mainahq/mcp": minor
"@mainahq/skills": minor
---

**Wiki graph as product**

Ships the four wiki-graph improvements from PRs [#199](https://github.com/mainahq/maina/pull/199)–[#204](https://github.com/mainahq/maina/pull/204) in one release.

**New in `@mainahq/core`**

- **Leiden-connected community detection** replaces vanilla Louvain for module boundaries. Same `detectCommunities()` signature, new default `algorithm: "leiden-connected"`. Pass `algorithm: "louvain"` to opt back into the legacy path. Guarantees every community is internally connected and modularity ≥ Louvain on the same graph. Louvain stayed exported as `detectCommunitiesLouvain` for direct access.
- **`wiki/GRAPH_REPORT.md` + `wiki/.graph-report.json`** emitted on every `compile()`. One-page audit with summary counts, top-20 PageRank, stalest articles, orphan entities, dangling wikilinks, duplicate-name disambiguations. Machine-readable companion for CI.
- **Self-contained `wiki/graph.html`** — force-directed graph explorer, deterministic layout (seeded PRNG), inline SVG, vanilla-JS controls (search, type filter, click-to-open). Under 300 KB for a 500-node graph. Nodes are `tabindex="0"` with `role="link"` and Enter/Space handlers so keyboard users can navigate.
- **`exportGraph(graph, articles, format)`** — pure serializer over `KnowledgeGraph` with `"cypher" | "graphml" | "obsidian"`. Cypher is Neo4j 5.x-compatible; GraphML opens in Gephi and yEd; Obsidian returns a directory map with per-node markdown, an index, and a `.obsidian/workspace.json`.
- **Module article path collisions** are deduped — leiden-connected splitting can derive the same `moduleName` for two distinct communities, and `compile()` now suffixes with the community id on collision so last-write-wins can't silently drop an article.
- **Obsidian wikilinks** now resolve correctly. Outgoing/Incoming sections and the vault index build their `[[…|label]]` targets via `obsidianFilenameForNode(node)` (minus `.md`) instead of raw `node.id`. Any id that gets sanitised or carries the new 6-char hash suffix — which is _every_ id with a `:` in it, i.e. the common case — now points to a file that actually exists.

**New in `@mainahq/cli`**

- **`maina wiki export <format> [--out <path>] [--json]`** — the CLI wrapper. Defaults to `./maina-export-<format>(.<ext>)`. Returns a structured `{ ok, error }` result. Obsidian writes go through a path-traversal guard (absolute paths and `..` rejected) so a malicious future exporter can't escape `outPath`.