# ADR 0006: Public Sheet retrieval and Git-controlled utility registry

Status: Accepted for Phase 3 implementation review.

## Decision

- Public GViz is the primary V1 source transport.
- Public CSV export is an explicit fallback using an approved worksheet `gid`.
- No Google API key, OAuth, service account, Preview credential or Production credential is configured.
- Public access removal is a hard failure requiring a separately approved access plan.
- Literal Google Sheets row numbers are 1-based and are never treated as array indexes or utility IDs.
- Headers are normalized and aliased; original and unknown fields remain preserved.
- The live source model and canonical registry model remain separate.
- Registry records are hand-reviewed TypeScript using `satisfies`.
- Fuel Trip Calculator is approved only as an immutable retrieval fixture and `idea` registry entry.
- `Travel & Mobility` maps to `travel-mobility` through approved tab context.
- Source hash changes never alter approved or released behavior automatically.
- Automation cannot advance registry status.

## Rationale

The public workflow has already proven exact tab and row access without a paid service or secret. Git review prevents backlog edits from bypassing product, accuracy, search, commercial and release gates.

## Consequences

GViz cannot reliably report merged cells. The workflow records that limitation and defers credentialed API access until it is necessary. Normal CI uses offline fixtures and never depends on Google availability.
