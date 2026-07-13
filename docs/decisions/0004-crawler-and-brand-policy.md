# ADR 0004: AI crawler and brand-asset policy

- Status: Accepted and implemented; brand-asset blocker remains
- Date: 2026-07-13

## Decision

- Production `robots.txt` explicitly allows ordinary crawlers and `OAI-SearchBot`.
- Production `robots.txt` explicitly disallows `GPTBot`.
- `OAI-SearchBot` and `GPTBot` remain separate rules; allowing search discovery does not grant model-training access.
- Local and Preview `robots.txt` disallow all crawlers and retain response-level `noindex, nofollow` protection.
- The initial Production sitemap contains only the canonical homepage; registry-driven generation remains deferred.
- Youtoola will use only official logo and brand assets.
- Missing official assets block logo-dependent Phase 2 design work, but not the Phase 1 technical foundation.

## Rationale

Search discovery and model-training access are separate decisions. Official assets protect brand consistency and avoid accidental logo recreation.

## Remaining owner input

Supply and approve official logo formats, colour variants, usage rules, and ownership confirmation before Phase 2.
