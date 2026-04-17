# Feature: Opt-in usage telemetry (distinct from error reporting)

## Problem Statement

We have no data on how people use Maina — which commands, how often, what fails. Usage telemetry (separate from crash reporting) enables data-driven onboarding improvements and feature prioritization.

## Success Criteria

- [x] `trackUsageEvent(name, properties)` function with consent gating
- [x] `isTelemetryEnabled()` reads from config (separate from error reporting consent)
- [x] Events are plain objects — no PostHog SDK dependency yet
- [x] Event schema: maina.install, maina.verify.started/.completed, maina.learn.ran, maina.commit
- [x] Zero PII in any event

## Scope

### In Scope
- Usage event tracking functions
- Separate consent check from error reporting
- Event schema definition

### Out of Scope
- PostHog SDK integration (future)
- `maina telemetry off` command (future)
- Consent prompt UI (future)
