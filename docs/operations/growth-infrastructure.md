# Growth Infrastructure Runbook

## Current Unit 3 legal-approval state

- Analytics: disabled; the GA4 Stream and a fingerprint of the public Measurement ID are recorded, but no provider identifier is configured in an application environment.
- Consent: no automatic notice or cookie while analytics is dormant; footer preferences remain available.
- Search Console: Domain property `youtoola.com` verified by DNS TXT.
- Bing: site `youtoola.com` verified through the Search Console import.
- Sitemap provider-console submission: submitted and successfully processed by both providers; five URLs discovered by each.
- Dashboard and monitoring: definition-only.
- Legal/privacy approval: accepted for Portugal and the EU/EEA under `YT-PRIV-2026-07-15-01 / PT99T0-1300-BG`.
- Clarity, advertising, affiliate, premium, lead and experiment delivery: disabled.
- Activation record: `legally-approved`; GA4 account, property, stream and governance evidence is recorded, while custom dimensions, key-event configuration, DebugView, Vercel variables and Production activation remain pending.
- Unit 2 baseline: frozen at `data/growth/foundation.json`; later machine-readable Growth state remains under `data/growth/`.

Run offline validation with `npm run validate:growth`. Run the read-only live baseline with `npm run smoke:growth`. The scheduled Growth monitor runs Monday at 07:00 UTC and is informational, not a required merge check.

## Search ownership and inspection evidence

Google Search Console and Bing Webmaster Tools each report successful live inspection and technical indexability for `/`, `/tools`, `/about`, `/methodology` and `/privacy`. Indexing requests were submitted where needed. Current index membership remains `pending` for every route because neither provider supplied explicit indexed-state evidence. The sitemap URL is `https://www.youtoola.com/sitemap.xml`; each provider reports successful processing and five discovered URLs. No DNS token, OAuth material, account identity, recovery material or IndexNow key is stored.

The live Production `/privacy` response was rechecked on 15 July 2026: HTTP 200, HTML UTF-8, report-only CSP without Google provider origins, no `Set-Cookie`, required security headers present and Vercel cache HIT.

## GA4 configuration evidence

Owner-supplied GA4 Admin evidence dated 15 July 2026 verifies account `Youtoola`, property `Youtoola Production`, Property ID `545783566`, stream `Youtoola`, stream URL `https://www.youtoola.com`, Stream ID `15263953983`, Europe/Lisbon reporting and EUR currency. Event and user-data retention are each two months and reset on new user activity is off. Google Signals, granular location/device collection, user-provided data, advertising features, data sharing and Ads personalisation are off; no Google Ads link, cross-domain condition or Measurement Protocol secret exists.

GA4 keeps the Page views category and Page loads checkbox visibly locked on. Browser-history page views and every optional Enhanced Measurement event are off. Youtoola independently sets `send_page_view: false`, so the locked interface category is not evidence of automatic Production page-view delivery. Only the separately approved sanitized provider-level page view may be sent after consent and provider readiness. The minimum initial event-scoped custom dimensions are `utility_id`, `error_code` and `time_to_result_bucket`; `tool_complete` is the sole initial key event. These external settings are not yet configured and DebugView remains pending.

The original Stream details evidence SHA-256 is `7a684274b68f8bf0b56d74ce47791e7a369bb0e400627a328ffac04628743ee4`. Additional uncommitted diagnostic evidence hashes are `8fa8f0f6fdd5a6adaaa0d1d99db840de3fe4e5394ac432a049270fc9db3254f9`, `72a256e2aaee9164d60e8eca35780b264ab6972b675a6b6cf2549202c8cb97dd`, `206a37cd50b85a57871f048f4b038a690f9adb7e66a1568d71abc424471a5023`, `015254f6be16d37fd1e735bd9915c5aedc1ae565cd7d87e8b51f530c4e417eb9`, `8115cede9429cc3584737ca3538df800b2dd57ac6066764e6e598a0ddb306f75`, `8a700c58e206881c9750c44c239cec7e04ccc7a1c930d35ceebc24609f52016e`, `9db6173e5c6c34fe89eb0f425c84605bb90f53d34a7b6228424d2ae04cf3610b` and `9654eff5b002cb805a646b5e83dce0b81bbd117b5225e08535ab0d7b0b77fb68`. Screenshots are not committed. The activation record stores a SHA-256 fingerprint of the public Measurement ID; its exact value remains outside Git until owner-authorised Production configuration. Both Production analytics variables remain unset and analytics remains dormant.

## Activation boundary

The Unit 3 plan is approved for BUILD only. Before any provider configuration changes, record launch jurisdictions, qualified legal/privacy approval reference, approved consent wording and lifetime, an operational privacy contact, GA4 property and stream ownership, retention, final dimensions, Search Console and Bing ownership, sitemap submission authorization, dashboard access, monitoring owners, failure thresholds and rollback. Keep the PR Draft until the legal reference and factual external configuration evidence exist.

Never add an identifier to Local or Preview. Never use `NEXT_PUBLIC_*`. Never activate optional Enhanced Measurement events, automatic page views, Google Signals, advertising consent, cross-domain measurement, Measurement Protocol, GTM, Clarity or commercial providers under this runbook. GA4's locked Page views category is an interface constraint and does not override Youtoola's `send_page_view: false` runtime configuration.

## Failure and withdrawal

Analytics or consent defects require immediate provider disablement. Preserve the free platform, restore the previous Ready Vercel deployment when needed, then realign source through protected `main`. Withdrawal records denial, disables provider delivery, expires host-only and canonical-domain `_ga` and `_ga_*` cookies, clears ephemeral state and performs no retry or replay. The reviewed cookie behavior is covered by deterministic tests before provider activation.

## Dashboard and review cadence

Definitions live in `data/growth/dashboard.json`; zero denominators are reported as not available. Initial evidence sources are native GA4, Search Console, Bing, Vercel and repository records. Do not store event-level or personal data in Git. Once activated, reviews are immediate, 24-hour, 7-day, 28-day, monthly and quarterly using factual evidence only.
