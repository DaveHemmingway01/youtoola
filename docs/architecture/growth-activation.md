# Growth Activation Architecture

Status: Phase 11 Unit 3 BUILD-ready; activation and external evidence remain pending.

## State and evidence boundary

`data/growth/foundation.json` is the frozen Unit 2 baseline. `data/growth/activation.json` is the only machine-readable Unit 3 state record. It begins at `dormant` and may progress through `legally-approved`, `externally-configured`, `activation-ready` and `active`; `disabled` and `incident-disabled` are owner-controlled containment states. Unknown states and missing or contradictory evidence fail validation. Automation never advances the record to `active`.

The activation pull request remains Draft until a qualified legal/privacy approval reference and factual external configuration evidence exist. No login, personal account, credential, token, recovery material or privileged legal content enters Git. The candidate release record keeps Production evidence null until a separately approved merge and automatic Production deployment occur.

## Page-view delivery

The consent provider observes App Router transitions with `usePathname`. It derives only an allowlisted authored route, canonical Production URL and authored title. Queries, fragments and referrers remain excluded. The provider adapter must be ready and report a successful synchronous send before the location is stored as delivered. Failed, offline, loading and timed-out attempts are not marked as sent, buffered, retried or replayed. Repeated renders of the same delivered route are deduplicated; a different recognized route may be sent once after consent.

## Environment and provider boundary

Only `YOUTOOLA_ANALYTICS_ENABLED=true` plus a valid server-owned `YOUTOOLA_GA4_MEASUREMENT_ID` in Production may expose the client configuration and exact report-only CSP origins. Local and Preview reject either value and remain provider-free and noindexed. The identifier is not committed to Growth records or application source. Vercel variables remain unset during BUILD and REVIEW and require owner authorization immediately before exact-head SHIP.

Direct `gtag.js` remains the sole provider integration. Automatic page views, enhanced measurement, Google Signals, advertising features, cross-domain measurement, User ID, Measurement Protocol, GTM and Clarity remain disabled. `tool_complete` remains the only planned initial key event. No utility event is generated in Unit 3.

## External gates

Activation requires qualified legal/privacy approval, approved consent wording and lifetime, an operational privacy contact, owner-controlled GA4 property and stream, Search Console Domain ownership, Bing ownership, sitemap submission authorization, dashboard and monitoring owners, rollback authority and factual evidence for each state transition. Provider-cookie deletion or expiry logic is conditional on the qualified review and is not part of this BUILD.

The smallest controlled DebugView evidence is one consented sanitized homepage `page_view`. It contains no utility, personal, commercial, input or result data. Search submission is not represented as acceptance or indexing. Core Web Vitals may truthfully remain `insufficient-data`.

## Release and containment

The free platform must remain usable without consent and during provider failure. Analytics-before-consent, a wrong identifier, Preview traffic, sensitive payloads, duplicate views, broken withdrawal or privacy/runtime mismatch block SHIP. Immediate containment is to disable the two Production analytics variables, verify provider silence, and then align source through protected `main`. Provider-cookie handling follows only the qualified reviewed policy.
