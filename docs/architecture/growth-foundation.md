# Growth Foundation Architecture

Status: Phase 11 Unit 2 candidate; provider activation is disabled.

## Boundary

Unit 2 supplies consent, configuration, provider, metadata, privacy, security-header, dashboard and monitoring contracts without configuring an external service. Production, Preview and Local resolve to provider-disabled unless a later owner-approved Unit 3 supplies valid Production configuration. Local and Preview reject any analytics activation or identifier.

The shared consent states remain `unknown`, `denied`, `analytics-granted` and reserved `marketing-granted`. V1 exposes only equally prominent Reject and Accept analytics choices. Marketing remains unavailable and denied. Before consent, events are dropped rather than queued; rejected, failed, offline and timed-out delivery is never retried or replayed.

## Consent and storage

The only permitted preference is the host-only `youtoola_consent` cookie. V1 accepts `v1:denied` and `v1:analytics-granted`; malformed, duplicate, unknown-version and marketing values resolve to `unknown` without logging raw values. Serialization uses `Max-Age=15552000`, `Path=/`, `SameSite=Lax`, and `Secure` in Production. There is no Domain, HttpOnly, timestamp, identifier, JSON, localStorage, sessionStorage, IndexedDB or consent database.

The non-modal notice appears only when valid Production analytics configuration is enabled and consent is unknown. Dormant Production shows no notice and writes no cookie. The footer control is always available and explains the dormant state. Withdrawal writes denial, disables the adapter, updates a loaded provider to denied, clears analytics/page-view/provider ephemeral state and blocks later events.

## Provider boundary

`YOUTOOLA_ANALYTICS_ENABLED` and `YOUTOOLA_GA4_MEASUREMENT_ID` are server-owned, non-secret build/deployment values. No `NEXT_PUBLIC_*` value is used. Enabled Production requires a bounded uppercase `G-` identifier. Disabled Production with a residual identifier warns and remains disabled. Current records contain no identifier.

The first-party adapter is the only runtime module permitted to reference the provider bootstrap, browser queue or provider domains. It loads after Production activation and explicit analytics consent, disables automatic page views and advertising features, denies advertising consent, drops events during loading, and isolates offline, failure and timeout states. The 12 domain-event mappings build fresh allowlisted payloads. `tool_complete` is the sole initial key-event recommendation. Provider-level `page_view` is separate, known-route-only, canonical, query/fragment-free and has no referrer.

## Metadata and CSP

All five public routes use the frozen absolute default Open Graph image and Twitter `summary_large_image`; titles, descriptions, canonicals, sitemap membership and crawler policy are unchanged. Preview remains noindexed while using Production social asset URLs.

Every route receives `Content-Security-Policy-Report-Only`. It is intentionally non-enforcing, includes no reporting endpoint and contains no provider origins while analytics is dormant. `unsafe-inline` is required by the current framework output and limits the policy's protective value. Enforced CSP remains deferred. Local and Preview may never add provider origins.

## Operating state

The version-controlled growth records are secret-free definitions. Analytics, Search Console, Bing and sitemap console submission are not configured; legal/privacy approval is pending; dashboard and weekly monitoring are definition-only. The non-required Monday 07:00 UTC workflow runs direct, read-only, package-free Production checks from current `main` and does not call provider or hosting APIs.
