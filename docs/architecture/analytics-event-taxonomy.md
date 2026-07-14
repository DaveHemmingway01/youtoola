# Analytics Event Taxonomy

Status: Phase 8 contract architecture; no provider or transmission.

`analyticsSchemaVersion` is `1`. The only event names are `tool_view`, `tool_start`, `tool_validation_error`, `tool_complete`, `result_copy`, `result_share`, `result_export`, `related_tool_click`, `affiliate_click`, `premium_click`, `lead_start`, and `lead_submit`. Commercial impressions are intentionally absent; commercial clicks per completion must not be described as click-through rate.

Every event uses the shared, bounded context in `lib/analytics/contracts.ts` and its event-specific field allowlist. Unknown fields and event names fail closed. Allowed dimensions are categorical: page type, environment, locale, consent state, canonical registry identifiers, approved interaction source, exact-or-estimate classification, approved non-sensitive result type, approved error code and field ID, public-safe relationship type, released target utility ID, approved commercial capability and placement identifiers, approved destination category, coarse time-to-result bucket, and trusted release reference. Each provider-bound field has an explicit `public` or `operational` classification; `sensitive` and `prohibited` fields cannot enter the safe envelope.

Utility ID, slug and category are not caller parameters. A server-side resolver derives them from the released-only public discovery source and supplies the released target allowlist. The trusted release reference also enters through this canonical context. Review fixtures may use a fixed non-public context only on the protected review route.

Exact inputs or results, formatted answers, messages, free text, names, contact details, addresses, files, precise locations, persistent or advertising identifiers, fingerprints, and sensitive financial, health or legal scenarios are prohibited. Validation creates a new safe envelope; it never spreads, forwards, or mutates the caller payload. Envelopes are limited to 2 KB, scalar bounded values, fixed depth, plain prototypes, and explicit keys.

Schema-version changes are breaking when they remove fields, change semantics or classification, change requiredness, or invalidate provider mappings or dashboards. New optional allowlisted fields and compatible enum values may remain version 1 after review. No migration framework is required yet.
