# ADR 0004: AI crawler and brand-asset policy

- Status: Accepted; brand-asset blocker remains
- Date: 2026-07-13

## Decision

- Production will explicitly allow `OAI-SearchBot` when robots rules are implemented.
- Production will explicitly disallow `GPTBot` when robots rules are implemented.
- `OAI-SearchBot` and `GPTBot` remain separate rules; allowing search discovery does not grant model-training access.
- Youtoola will use only official logo and brand assets.
- Missing official assets block logo-dependent Phase 2 design work, but not the Phase 1 technical foundation.

## Rationale

Search discovery and model-training access are separate decisions. Official assets protect brand consistency and avoid accidental logo recreation.

## Remaining owner input

Supply and approve official logo formats, colour variants, usage rules, and ownership confirmation before Phase 2.
