# ADR 0007: Repository Knowledge Layer

Status: Accepted for Phase 4 implementation review.

## Decision

- Use `knowledgeSchemaVersion: 1` across the model, fixtures, validation and documentation.
- Keep the canonical utility registry and extend it through a hybrid typed repository model.
- Store human-reviewed utility relationships once in a central TypeScript file.
- Derive inverse and shared-reference relationship views instead of duplicating edges.
- Require specific human-written rationale before any stored edge can become a public candidate.
- Keep categories flat.
- Allow journey-scoped internal future slots with no utility or entity identity.
- Keep formula families as classification only.
- Classify the opportunity Sheet as provenance only.
- Keep public-safe selectors separate from internal selectors.
- Add no database, graph library, schema package or runtime service.

## Rationale

Static TypeScript is sufficient for the current portfolio, makes identity and relationships reviewable in Git, and gives Phase 5 a deterministic discovery foundation. Central edges and derived views prevent drift. Strict public filters prevent idea-stage records and future slots from leaking into navigation, search or indexable pages.

## Consequences

Adding records requires human review and validation. The model intentionally favors explicit, low-volume data over automatic inference. If scale later makes repository selection inadequate, measured evidence and a separate owner decision are required before changing storage technology.
