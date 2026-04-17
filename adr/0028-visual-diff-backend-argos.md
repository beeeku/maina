# 0028. Visual diff backend — Argos

Date: 2026-04-17

## Status

Accepted

## Context

Maina's verify engine needs visual regression testing — compare before/after screenshots on PRs. Two options evaluated:

| Option | License | Hosting | Cost |
|--------|---------|---------|------|
| Argos | OSS (free for OSS) | Managed + self-hosted | Free for open source |
| Lost Pixel | OSS | Self-hosted only | Free (infra cost) |

## Decision

Use **Argos** for visual diff:

- Free managed plan for open-source projects
- GitHub Check integration built-in
- Baseline storage + per-branch comparison out of the box
- Self-hosted option available if needed later
- Less ops burden than Lost Pixel (no self-hosting required to start)

## Implementation

1. `@argos-ci/cli` for screenshot upload from CI
2. Baselines stored per-branch in Argos
3. PR gets Argos Check Run with visual diff report
4. Links from Maina's sticky PR comment point to Argos report

## Consequences

### Positive
- Zero infra to maintain (managed plan)
- GitHub Check integration for merge gating
- Per-branch baselines handle feature branch divergence

### Negative
- External dependency for visual diffs (mitigated: can self-host later)
- Free plan may have limits at scale (mitigated: self-hosted fallback)
