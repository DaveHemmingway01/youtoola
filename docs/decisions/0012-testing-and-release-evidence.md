# ADR 0012: Testing and Release Evidence

Status: Accepted for Phase 9 implementation review.

## Decision

Adopt six owner-controlled release gates, additive risk tags, fail-closed evidence selection, data-only golden vectors, bounded tolerances, explicit performance and severity policies, and validated JSON release records. Retain the existing Vitest, Playwright, axe, GitHub and Vercel architecture.

Chromium remains the normal CI browser. Cross-browser review is targeted by risk. Playwright uses one CI retry with `failOnFlakyTests`; a retry success is a failure requiring investigation. Documentation-only changes receive reduced manual review but normal CI.

The canonical release record is `docs/releases/<date>-<phase-or-slug>.json`. A candidate record exists before merge. A small documentation-only follow-up PR completes Production deployment and scheduled-review fields after release. Automation validates and reports but cannot approve or advance gates.

## Rationale

The repository already has strong tests. The missing control is consistent selection and durable evidence. Risk unions prevent a cross-cutting change from escaping a specialist gate, while proportional review avoids imposing a utility launch checklist on internal prose.

## Consequences

- Hard calculation, accessibility, indexing, privacy, security and performance failures block release.
- Regulated and high-consequence utilities require qualified independent review.
- Critical and material High Production failures invoke immediate containment or rollback.
- Release records add a small post-deployment documentation PR.
- No test-management, visual-regression, security-scanning or release-management service is added.
- Phase 9 changes no public route, provider, utility, analytics behavior, registry, crawler, sitemap or brand asset.
