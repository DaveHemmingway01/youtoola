# Growth Infrastructure Runbook

## Current Unit 3 BUILD state

- Analytics: disabled; no provider identifier configured.
- Consent: no automatic notice or cookie while analytics is dormant; footer preferences remain available.
- Search Console and Bing: not configured.
- Sitemap provider-console submission: not submitted.
- Dashboard and monitoring: definition-only.
- Legal/privacy approval: pending.
- Clarity, advertising, affiliate, premium, lead and experiment delivery: disabled.
- Activation record: `dormant`; legal approval, public contact, GA4, Search Console, Bing, sitemap-console and Vercel evidence are pending.
- Unit 2 baseline: frozen at `data/growth/foundation.json`; later machine-readable Growth state remains under `data/growth/`.

Run offline validation with `npm run validate:growth`. Run the read-only live baseline with `npm run smoke:growth`. The scheduled Growth monitor runs Monday at 07:00 UTC and is informational, not a required merge check.

## Activation boundary

The Unit 3 plan is approved for BUILD only. Before any provider configuration changes, record launch jurisdictions, qualified legal/privacy approval reference, approved consent wording and lifetime, an operational privacy contact, GA4 property and stream ownership, retention, final dimensions, Search Console and Bing ownership, sitemap submission authorization, dashboard access, monitoring owners, failure thresholds and rollback. Keep the PR Draft until the legal reference and factual external configuration evidence exist.

Never add an identifier to Local or Preview. Never use `NEXT_PUBLIC_*`. Never activate enhanced measurement, automatic page views, Google Signals, advertising consent, cross-domain measurement, Measurement Protocol, GTM, Clarity or commercial providers under this runbook.

## Failure and withdrawal

Analytics or consent defects require immediate provider disablement. Preserve the free platform, restore the previous Ready Vercel deployment when needed, then realign source through protected `main`. Withdrawal records denial, disables provider delivery, clears ephemeral state and performs no retry or replay. Provider-cookie deletion or expiry logic remains conditional on qualified review and must not be inferred from silence.

## Dashboard and review cadence

Definitions live in `data/growth/dashboard.json`; zero denominators are reported as not available. Initial evidence sources are native GA4, Search Console, Bing, Vercel and repository records. Do not store event-level or personal data in Git. Once activated, reviews are immediate, 24-hour, 7-day, 28-day, monthly and quarterly using factual evidence only.
