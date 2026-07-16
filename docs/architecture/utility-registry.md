# Live Opportunity Retrieval and Canonical Utility Registry

Status: Phase 3 implementation candidate.

## Boundary

The live Sheet is the opportunity backlog and planning trigger. The TypeScript registry and approved utility specifications in Git are Production truth. Sheet changes never mutate a registry record, route, formula, metadata, sitemap or released utility automatically.

Phase 3 adds no public utility route, homepage discovery, public category, analytics, consent, Growth Infrastructure or monetisation activation.

## Live retrieval

The developer command reads the public spreadsheet through GViz using an exact tab and literal 1-based visible row. It retrieves public workbook metadata first, rejects unknown tabs, finds required headers by normalized names rather than positions, and queries the requested row through an exact A1 range.

GViz is primary. Public CSV export is attempted only after a GViz transport failure or when explicitly selected with `--transport csv-export`. The approved `Travel & Mobility` worksheet `gid` is `818425885`.

The normalized source record retains original fields, recognized fields, unknown fields, missing fields, warnings, transport and retrieval time. It remains distinct from the registry entry.

GViz and CSV expose displayed values and formula errors but cannot reliably identify merged cells. Credentialed API access is deferred. This limitation is explicit in every retrieval result.

## Source hashing and change control

The source hash is SHA-256 over canonical JSON containing schema version, spreadsheet ID, exact tab, visible row, raw fields, normalized fields and unknown fields. Keys are recursively sorted. Retrieval time, URLs, warnings and transport are excluded.

Before release, a changed hash creates a warning for the next approved planning task. After release, a changed hash requires owner impact review. The registry never self-updates.

## Registry

Registry records are hand-reviewed TypeScript objects using `satisfies`. Stable IDs, canonical slugs, sources, status, categories and relationships are validated without a database. Unknown idea-stage research fields remain absent rather than invented.

The `fuel-trip-calculator` entry is the first released registry record. It retains its original source coordinates and hash, records standard risk, calculation and methodology version 1, its specification path, and the factual release date. The `Travel & Mobility` tab maps to category `travel-mobility` by explicit owner decision, not by an explicit row field.

Internal selectors may inspect all records. Future public consumers must use `getReleasedTools()` or apply the released-only boundary. Unreleased records are prohibited from navigation, search, sitemap and public category output.

## Status authority

Automation may validate but never transition status. Only the owner may approve movement into or out of `approved`, `building`, `preview`, `released`, `paused` or `retired`.
