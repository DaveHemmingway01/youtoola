# ADR 0015: Controlled Growth Activation

- Status: Legal gate accepted; external activation pending
- Date: 2026-07-15
- Decision owner: Youtoola owner

## Decision

Preserve Unit 2 as a frozen dormant baseline and represent Unit 3 in a separate fail-closed activation record under `data/growth/`. Require written legal/privacy approval and factual external configuration evidence before the Draft activation pull request can advance. Production variables remain absent during BUILD and REVIEW and require a separate exact-head SHIP approval.

Track sanitized provider page views across App Router transitions using `usePathname`. Record deduplication only after the ready adapter reports a successful send. Preserve no buffering, retry, replay, raw URL data, referrer or automatic provider page views.

Qualified review `YT-PRIV-2026-07-15-01 / PT99T0-1300-BG` approves Portugal and the EU/EEA as the launch jurisdictions and requires `_ga` and `_ga_*` cookie expiry on withdrawal. Keep Local and Preview provider-free, keep report-only CSP narrowly scoped, and preserve the free platform when analytics is unavailable or disabled.

## Consequences

The repository can validate activation readiness without claiming legal approval, account configuration, indexing, provider delivery or Production behavior that has not occurred. External setup and Production activation remain owner-controlled operational actions. Unit 3 adds no dependency, public route, utility, commercial provider or persistent analytics queue.
