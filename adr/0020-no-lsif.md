# 0020. No LSIF usage — SCIP is the target format

Date: 2026-04-17

## Status

Accepted (N/A — no migration needed)

## Context

Sourcegraph migrated off LSIF in v4.6, replacing it with SCIP. Audit: does Maina use LSIF anywhere?

`rg -i "lsif"` across the codebase: **zero hits** (one false positive in bun.lock package hash).

## Decision

No LSIF migration needed. SCIP is the target format for the code intelligence epic (#133).

## Consequences

- SCIP ingest (#124) proceeds without migration overhead
- This ADR closes the audit cleanly
