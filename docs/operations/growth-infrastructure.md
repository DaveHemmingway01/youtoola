# Growth Infrastructure Runbook

## Current Unit 3 legal-approval state

- Analytics: disabled; the GA4 Stream and public Measurement ID are recorded, but no provider identifier is configured in an application environment.
- Consent: no automatic notice or cookie while analytics is dormant; footer preferences remain available.
- Search Console: Domain property `youtoola.com` verified by DNS TXT.
- Bing: site `youtoola.com` verified through the Search Console import.
- Sitemap provider-console submission: submitted and successfully processed by both providers; five URLs discovered by each.
- Dashboard and monitoring: definition-only.
- Legal/privacy approval: accepted for Portugal and the EU/EEA under `YT-PRIV-2026-07-15-01 / PT99T0-1300-BG`.
- Clarity, advertising, affiliate, premium, lead and experiment delivery: disabled.
- Activation record: `legally-approved`; partial GA4 Stream evidence is recorded, while account/property identity, governance settings and Vercel evidence remain pending.
- Unit 2 baseline: frozen at `data/growth/foundation.json`; later machine-readable Growth state remains under `data/growth/`.

Run offline validation with `npm run validate:growth`. Run the read-only live baseline with `npm run smoke:growth`. The scheduled Growth monitor runs Monday at 07:00 UTC and is informational, not a required merge check.

## Search ownership and inspection evidence

Google Search Console and Bing Webmaster Tools each report successful live inspection and technical indexability for `/`, `/tools`, `/about`, `/methodology` and `/privacy`. Indexing requests were submitted where needed. Current index membership remains `pending` for every route because neither provider supplied explicit indexed-state evidence. The sitemap URL is `https://www.youtoola.com/sitemap.xml`; each provider reports successful processing and five discovered URLs. No DNS token, OAuth material, account identity, recovery material or IndexNow key is stored.

The live Production `/privacy` response was rechecked on 15 July 2026: HTTP 200, HTML UTF-8, report-only CSP without Google provider origins, no `Set-Cookie`, required security headers present and Vercel cache HIT.

## GA4 configuration evidence

The owner supplied a GA4 Stream details screenshot on 15 July 2026 showing stream name `Youtoola`, stream URL `https://www.youtoola.com`, Stream ID `15263953983` and a valid Measurement ID. The evidence image SHA-256 is `7a684274b68f8bf0b56d74ce47791e7a369bb0e400627a328ffac04628743ee4`; the diagnostic image is not committed. The activation record stores a SHA-256 fingerprint of the supplied Measurement ID so the value remains outside Git until owner-authorised Production configuration. This proves the stream identifiers only. Account display name, property display name, property ID, two-month retention, Google Signals, Enhanced Measurement, advertising features and data-sharing configuration still require factual evidence. Both Production analytics variables remain unset and analytics remains dormant.

## Activation boundary

The Unit 3 plan is approved for BUILD only. Before any provider configuration changes, record launch jurisdictions, qualified legal/privacy approval reference, approved consent wording and lifetime, an operational privacy contact, GA4 property and stream ownership, retention, final dimensions, Search Console and Bing ownership, sitemap submission authorization, dashboard access, monitoring owners, failure thresholds and rollback. Keep the PR Draft until the legal reference and factual external configuration evidence exist.

Never add an identifier to Local or Preview. Never use `NEXT_PUBLIC_*`. Never activate enhanced measurement, automatic page views, Google Signals, advertising consent, cross-domain measurement, Measurement Protocol, GTM, Clarity or commercial providers under this runbook.

## Failure and withdrawal

Analytics or consent defects require immediate provider disablement. Preserve the free platform, restore the previous Ready Vercel deployment when needed, then realign source through protected `main`. Withdrawal records denial, disables provider delivery, expires host-only and canonical-domain `_ga` and `_ga_*` cookies, clears ephemeral state and performs no retry or replay. The reviewed cookie behavior is covered by deterministic tests before provider activation.

## Dashboard and review cadence

Definitions live in `data/growth/dashboard.json`; zero denominators are reported as not available. Initial evidence sources are native GA4, Search Console, Bing, Vercel and repository records. Do not store event-level or personal data in Git. Once activated, reviews are immediate, 24-hour, 7-day, 28-day, monthly and quarterly using factual evidence only.
