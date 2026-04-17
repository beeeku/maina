# Implementation Plan

> HOW only — see spec.md for WHAT and WHY.

## Architecture

Documentation-only change. Write an ADR in `adr/` following the standard format. The ADR formalizes the existing Cloudflare R2 choice and specifies that maina-cloud uses `@workkit/r2` for all storage operations.

- Pattern: ADR (Architecture Decision Record)
- Integration points: Referenced by #131 (report viewer) and #130 (PR comment v2)
- **Storage layer: `@workkit/r2`** — typed R2 client with presigned URLs, streaming, multipart upload. Already used in maina-cloud. Zero custom R2 code needed.

## Key Technical Decisions

- Use `@workkit/r2` (MIT, `@workkit/r2@0.1.1`) for all R2 operations in maina-cloud
  - `createPresignedUrl()` for CI upload flow (no server-side proxy needed)
  - `r2.put()` / `r2.get()` for server-side report reads
  - `streamToJson()` / `streamToBuffer()` for report and screenshot serving
  - `multipartUpload()` for large reports if needed
- Bucket layout: `r/<run-id>/report.json`, `r/<run-id>/report.html`, `r/<run-id>/shot/<id>.png`
- CDN via Cloudflare Cache API (R2 is already in the Cloudflare ecosystem)

## Files

| File | Purpose | New/Modified |
|------|---------|-------------|
| `adr/0013-report-storage-backend-cloudflare-r2.md` | ADR document | Modified (fill in scaffolded template) |

## Tasks

- [ ] T1: Write ADR with all sections using @workkit/r2 as the storage layer
- [ ] T2: Verify ADR passes maina verify (no slop, no placeholders)

## Failure Modes

- N/A — documentation only, no runtime changes

## Testing Strategy

- maina verify (slop check, no TODO/FIXME markers)
- Manual review for completeness against acceptance criteria
