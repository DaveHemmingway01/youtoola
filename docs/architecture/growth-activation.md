# Growth Activation Architecture

Status: Phase 11 Unit 3 legally approved; Search Console, Bing, sitemap and GA4 account, property, stream and governance evidence recorded; exact-head REVIEW, DebugView and Production activation remain pending.

## State and evidence boundary

`data/growth/foundation.json` is the frozen Unit 2 baseline. `data/growth/activation.json` is the only machine-readable Unit 3 state record. It begins at `dormant` and may progress through `legally-approved`, `externally-configured`, `activation-ready` and `active`; `disabled` and `incident-disabled` are owner-controlled containment states. Unknown states and missing or contradictory evidence fail validation. Automation never advances the record to `active`.

Qualified review reference `YT-PRIV-2026-07-15-01 / PT99T0-1300-BG` covers Portugal and the EU/EEA. The owner accepts the supplied review record as the legal gate evidence. The activation pull request remains Draft until factual external configuration evidence also exists. No login, personal account, credential, token, recovery material or privileged legal reasoning enters Git. The candidate release record keeps Production evidence null until a separately approved merge and automatic Production deployment occur.

## Page-view delivery

The consent provider observes App Router transitions with `usePathname`. It derives only an allowlisted authored route, canonical Production URL and authored title. Queries, fragments and referrers remain excluded. The provider adapter must be ready and report a successful synchronous send before the location is stored as delivered. Failed, offline, loading and timed-out attempts are not marked as sent, buffered, retried or replayed. Repeated renders of the same delivered route are deduplicated; a different recognized route may be sent once after consent.

## Environment and provider boundary

Only `YOUTOOLA_ANALYTICS_ENABLED=true` plus a valid server-owned `YOUTOOLA_GA4_MEASUREMENT_ID` in Production may expose the client configuration and exact report-only CSP origins. Local and Preview reject either value and remain provider-free and noindexed. A fingerprint of the public GA4 Measurement ID is recorded as factual configuration evidence; the identifier is not wired into application source or any environment. Vercel variables remain unset during BUILD and REVIEW and require owner authorization immediately before exact-head SHIP.

Direct `gtag.js` remains the sole provider integration. GA4's interface keeps its Page views category visibly locked on and does not permit the Page loads checkbox to be cleared. That interface state does not activate Production collection: Youtoola configures `send_page_view: false`, disables browser-history page views and every optional Enhanced Measurement event, and may send only its separately approved sanitized provider-level page view after consent and provider readiness. Google Signals, advertising features, data sharing, Ads links, cross-domain measurement, User ID, Measurement Protocol, GTM and Clarity remain disabled or absent. `tool_complete` remains the only planned initial key event and is not yet configured in GA4. No custom dimension or utility event is configured in Unit 3.

## External gates

Activation requires the recorded qualified legal/privacy approval, approved consent wording and lifetime, an operational privacy contact, owner-controlled GA4 property and stream, Search Console Domain ownership, Bing ownership, sitemap submission authorization, dashboard and monitoring owners, rollback authority and factual evidence for each state transition. Search Console Domain property `youtoola.com` and Bing site `youtoola.com` are verified; both report the five-URL sitemap successfully processed, but no route is claimed indexed until its provider confirms that state. Owner-supplied GA4 Admin evidence establishes account `Youtoola`, property `Youtoola Production` with Property ID `545783566`, stream `Youtoola`, canonical URL `https://www.youtoola.com`, Stream ID `15263953983`, Europe/Lisbon reporting, EUR currency, two-month event and user-data retention with reset disabled, and a verified Measurement ID fingerprint. The exact Measurement ID remains outside Git and all application environments until owner-authorised Production configuration. Vercel Production variables, custom dimensions, the planned `tool_complete` key event and DebugView evidence remain absent or pending, so the activation state stays `legally-approved` and external configuration evidence stays pending. The accepted review requires withdrawal to expire host-only and canonical-domain `_ga` and `_ga_*` cookies while blocking future provider delivery; this behavior is implemented and tested before external activation.

The smallest controlled DebugView evidence is one consented sanitized homepage `page_view`. It contains no utility, personal, commercial, input or result data. Search submission is not represented as acceptance or indexing. Core Web Vitals may truthfully remain `insufficient-data`.

## Release and containment

The free platform must remain usable without consent and during provider failure. Analytics-before-consent, a wrong identifier, Preview traffic, sensitive payloads, duplicate views, broken withdrawal or privacy/runtime mismatch block SHIP. Immediate containment is to disable the two Production analytics variables, verify provider silence, and then align source through protected `main`. Provider-cookie handling follows only the qualified reviewed policy.
