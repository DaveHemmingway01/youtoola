# ADR 0011: Analytics, Experiment and Commercial Boundaries

Status: Accepted for Phase 8

## Decision

Adopt first-party typed contracts, fail-closed validation, provider-neutral dispatch, ephemeral deduplication, strict commercial composition gates, and definition-only experiment governance. Keep all provider, consent UI, assignment, storage, and activation work deferred.

GA4 remains the initial future Production analytics provider, but only Phase 11 Growth Infrastructure may configure and verify it. Microsoft Clarity remains disabled. Legal and privacy review is mandatory before analytics, consent, advertising, affiliate tracking, lead processing, commercial tracking, session replay, or Clarity activation.

## Consequences

Phase 8 emits nothing in every environment. Local and Preview may inspect fixed examples only on `/design-system-review`; Production has no inspector or commercial UI. No CSP, environment variable, lockfile, SEO route, crawler, sitemap, registry, Knowledge Layer, or frozen brand change is needed.

The architecture adds maintenance cost only for small first-party TypeScript contracts and tests. It avoids provider lock-in and prevents sensitive utility scenarios from crossing the provider boundary.
