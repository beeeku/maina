# 0030. Receipt v1 field schema

Date: 2026-04-25

## Status

Accepted

## Context

Per the 2026-04-25 direction doc, Maina's product surface is a per-PR **proof-of-correctness receipt** — signed JSON + HTML, one URL per PR. The receipt is the wire format consumed by the CLI (`maina verify-receipt`), the Layer 3 GitHub App, and the Layer 4 enterprise rollup. Same shape across all three, or the format fragments before it ships.

The schema is hosted externally at `schemas.mainahq.com/v1.json` (public `mainahq/receipt-schema` repo, MIT) so third parties can adopt without a maina dependency — the moat that outlasts any GitHub-native verifier (Risk 2).

This ADR locks the field list for `v1`. Future additions get `v2`; `v1.json` is immutable once published.

## Decision

v1 receipt fields:

| Field | Type | Notes |
|---|---|---|
| `prTitle` | string | From git context |
| `repo` | string | `owner/name` |
| `timestamp` | string (ISO 8601) | Verification completion time |
| `status` | `"passed" \| "failed" \| "partial"` | Surface copy: *"passed N of M checks"* (C2) |
| `hash` | string (sha256) | RFC 8785 canonicalize JSON → sha256. The `hash` field itself is excluded from canonicalization |
| `diff` | `{ additions: number, deletions: number, files: number }` | Already computed in pipeline |
| `agent` | `{ id: string, modelVersion: string }` | From MCP context or git trailer |
| `promptVersion` | `{ constitutionHash: string, promptsHash: string }` | Already versioned |
| `checks[]` | `{ id, name, status, tool, findings[], patch? }[]` | One per tool in the verify pipeline |
| `walkthrough` | string | 3-sentence summary, mechanical-tier model output |
| `feedback[]` | `{ checkId, reason, constitutionHash }[]` | False-positive reports; keyed by constitutionHash so feedback follows the policy, not the repo |
| `retries` | number | Default cap 3, configurable (see adr/0031) |

**Excluded from v1:** no `policyName` field. Receipts enumerate checks by id; naming policies is a v2 decision once we have design-partner feedback on what granularity matters.

### Signing

1. Build the receipt object with `hash: ""`.
2. Canonicalize via RFC 8785 (JSON Canonicalization Scheme).
3. `hash = sha256(canonical)`.
4. Write `hash` into the object.

Verification reverses: strip `hash`, canonicalize, sha256, compare. No asymmetric crypto in v1 — integrity only, not authenticity. Keypair signing is a v2 decision tied to hosted infra.

### Versioning

Per-file immutable. `v1.json` lives forever at `schemas.mainahq.com/v1.json`. `v2.json` will live beside it. Consumers pin the URL.

## Consequences

### Positive

- Third parties can consume the schema without depending on maina or its npm package
- Receipt verification is fully offline-capable (`maina verify-receipt` pins `@mainahq/receipt-schema` as a package dep, not a hosted fetch)
- Canonical-JSON hashing means the receipt format is language-agnostic for verifiers — any RFC 8785 impl + any sha256 impl is enough
- No `policyName` in v1 keeps the schema minimal; Q2 stays open for v2 based on real usage

### Negative

- Integrity-only hashing means a bad actor could republish a maliciously-crafted receipt with a valid sha256; mitigated in v2 by keypair signing once we have hosted infra
- RFC 8785 implementations are thinner than plain JSON — v1 verifiers need a canonicalization library; mitigated by shipping one in `@mainahq/receipt-schema`
- Locking the field list at v1 means new data (spec citations, agent catalogs) must wait for v2 — accepted tradeoff for stability

## References

- Direction doc (private): `mainahq/maina-cloud:strategy/DIRECTION_AND_BUILD_PLAN_2026_04_25.md`
- Tracking issue: [mainahq/maina#226](https://github.com/mainahq/maina/issues/226)
- Retry-policy ADR (sibling): adr/0031-agent-retry-recording-policy.md
- Constitution update (sibling): tracked in [mainahq/maina#231](https://github.com/mainahq/maina/issues/231)
- RFC 8785 JSON Canonicalization Scheme: https://datatracker.ietf.org/doc/html/rfc8785
