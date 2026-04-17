# 0016. Error reporting backend (Sentry / GlitchTip)

Date: 2026-04-17

## Status

Accepted

## Context

Maina needs crash/error reporting for both the open-source CLI and the Cloud service. Without it, bugs ship blind — users file vague "it didn't work" issues and maintainers can't reproduce.

Requirements:
- OSS: opt-in, aggressive PII scrubbing, zero data until consent
- Cloud: opt-out (default on), account-linked for support triage
- Both paths must use the same SDK to avoid maintaining two integrations

## Decision

Use **Sentry managed** for Cloud and **GlitchTip self-hosted** for OSS. Both speak the Sentry SDK protocol — one SDK in code (`@sentry/node`), different DSN per build target, zero lock-in.

### Cost Model

| Scale | Sentry (managed) | GlitchTip (self-hosted) |
|-------|-------------------|-------------------------|
| 10k events/mo | Free tier (5k free + $26/mo for 10k) | ~$10/mo (small VM) |
| 100k events/mo | ~$89/mo (Team plan) | ~$25/mo (medium VM) |

### Why Not Just Sentry Everywhere

- OSS users may distrust sending data to a SaaS service
- GlitchTip is fully open-source, Sentry-SDK-compatible, lightweight
- OSS builds ship with GlitchTip DSN (self-hosted), Cloud builds ship with Sentry DSN
- Same SDK, same API, different backend — zero code divergence

### Why Not Just GlitchTip Everywhere

- Sentry's managed service has superior DX: release tracking, source maps, performance monitoring, Slack/PagerDuty integrations
- For Cloud (paid product), the ops cost of self-hosting GlitchTip exceeds Sentry's managed price
- Sentry's free tier covers early Cloud usage

## Alternatives Considered

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| Sentry (managed only) | Best DX, polyglot SDKs | SaaS dependency for OSS users | Rejected for OSS |
| Sentry (self-hosted only) | Full control | Heavy ops (PostgreSQL, Redis, Kafka, ClickHouse) | Rejected — overengineered |
| GlitchTip (self-hosted only) | Lightweight, free | Smaller ecosystem, no managed option | Rejected for Cloud |
| **Hybrid: Sentry Cloud + GlitchTip OSS** | Best of both, one SDK | Two backends to monitor | **Accepted** |
| Highlight.io | Modern, open-source | Newer, smaller community | Not evaluated in depth |

## Implementation

1. `@sentry/node` SDK in `packages/core/src/errors/`
2. DSN set at build time via environment variable
3. PII scrubbing library runs client-side before any network send (see #120)
4. OSS: consent prompt at first run, stored in `~/.maina/config.yml`
5. Cloud: default on, opt-out via dashboard settings

## Consequences

### Positive

- One SDK, two backends — no code divergence
- OSS users get privacy-first error reporting
- Cloud gets enterprise-grade observability
- Zero vendor lock-in (both backends speak Sentry protocol)

### Negative

- Two backends to monitor (mitigated: GlitchTip is low-maintenance)
- GlitchTip ecosystem is smaller than Sentry (mitigated: SDK is identical)
