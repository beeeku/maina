# Implementation Plan

> HOW only — see spec.md for WHAT and WHY.

## Architecture

New module `packages/core/src/telemetry/usage.ts`. Pure functions with consent gating. Events are plain objects — no external SDK. Reads `telemetry: true` from `~/.maina/config.yml` (separate key from `errors`).

## Files

| File | Purpose | New/Modified |
|------|---------|-------------|
| `packages/core/src/telemetry/usage.ts` | Usage event tracking | New |
| `packages/core/src/telemetry/__tests__/usage.test.ts` | Tests | New |

## Tasks

- [x] T1: Implement `isTelemetryEnabled()` — reads config
- [x] T2: Implement `buildUsageEvent()` — formats usage event
- [x] T3: Implement `trackUsageEvent()` — consent-gated
- [x] T4: Define event schema types
- [x] T5: Write tests
