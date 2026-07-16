# ADR 0014: Dormant Growth Foundation

- Status: Accepted and shipped in Phase 11 Unit 2
- Date: 2026-07-15
- Decision owner: Youtoola owner

## Decision

Prepare a fail-closed, first-party Growth Foundation before provider activation. Preserve the four-state Phase 8 consent contract, expose only denied and analytics-granted in V1, store only the exact versioned preference cookie, and keep marketing unavailable. Use server-owned Production-only configuration, a direct provider adapter behind the existing analytics boundary, 12 explicit domain mappings, a separate sanitized page view, and no buffering, retry, replay or persistence.

Integrate the frozen default social image and a report-only CSP now. Keep analytics, Search Console, Bing, sitemap console submission, dashboards, legal approval, Clarity and commercial providers disabled or definition-only until separately approved Unit 3 work.

## Consequences

Youtoola gains reviewable consent, metadata, validation and monitoring behavior without transmitting user data or adding a dependency. The global client wrapper adds a small JavaScript cost for the always-available privacy control. Report-only CSP has no reporting endpoint and does not enforce restrictions. Exact provider-cookie treatment, jurisdictions, retention, property/stream ownership and activation remain owner and qualified-review decisions.
