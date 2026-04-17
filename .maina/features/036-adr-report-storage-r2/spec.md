# Feature: ADR — Report Storage Backend (R2)

## Problem Statement

Maina Cloud verification generates proof artifacts (JSON reports, screenshots, HTML views) that need durable storage with public read access. The team chose Cloudflare R2 early on, but the decision isn't documented. Future contributors have no written record of why R2, what the bucket layout is, or what retention/GDPR policies apply.

- Without a written ADR, contributors may duplicate the decision or pick a conflicting backend.
- Blocks the self-hosted report viewer (#131) and PR comment v2 (#130).

## Target User

- Primary: Maina contributors extending cloud verification infrastructure
- Secondary: Cloud customers who need to understand data retention and GDPR compliance

## Success Criteria

- [ ] `docs/decisions/0001-report-storage-backend.md` exists and is comprehensive
- [ ] Covers cost model at 10k runs/month and 100k runs/month
- [ ] Documents bucket layout: `r/<run-id>/` with sub-paths for JSON, HTML, screenshots
- [ ] Describes signed upload flow from CI
- [ ] Retention policy: 90 days default, extensible per plan
- [ ] GDPR delete path documented
- [ ] CDN cache strategy documented
- [ ] Disaster recovery approach documented
- [ ] Documents why R2 over S3 / Supabase Storage (zero egress, S3-compatible, cheaper at scale)

## Scope

### In Scope

- Writing the ADR document with all acceptance criteria
- Cost comparison table (R2 vs S3 vs Supabase Storage)
- Bucket layout specification
- Retention and GDPR policies

### Out of Scope

- Implementing any infrastructure changes
- Building the report viewer (that's #131)
- CI upload pipeline (that's part of PR comment v2)

## Design Decisions

- R2 chosen over S3: zero egress fees, S3-compatible API, cheaper at scale
- R2 chosen over Supabase Storage: simpler, no extra auth layer, Cloudflare ecosystem alignment
- Bucket layout uses `r/<run-id>/` prefix for easy per-run cleanup

## Open Questions

- None — this is a documentation-only ADR formalizing existing decisions.
