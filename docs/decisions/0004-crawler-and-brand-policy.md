# ADR 0004: AI crawler and brand-asset policy

- Status: Accepted and implemented; Youtoola Brand Foundation v1 frozen
- Date: 2026-07-13

## Decision

- Production `robots.txt` explicitly allows ordinary crawlers and `OAI-SearchBot`.
- Production `robots.txt` explicitly disallows `GPTBot`.
- `OAI-SearchBot` and `GPTBot` remain separate rules; allowing search discovery does not grant model-training access.
- Local and Preview `robots.txt` disallow all crawlers and retain response-level `noindex, nofollow` protection.
- The initial Production sitemap contains only the canonical homepage; registry-driven generation remains deferred.
- Youtoola will use only owner-approved logo and brand assets.
- The owner-approved JPG references are the visual production source of truth for the initial logo and symbol assets.
- Initial production candidates use pixel-faithful transparent PNG processing. SVG tracing, font substitution, recolouring, generative processing, and artwork reconstruction are prohibited.
- Every processed asset requires technical validation, rendered comparison, and explicit owner approval before commit.
- Production-context visual quality takes precedence over reconstruction metrics. Review overlays, contour similarity and extreme-zoom inspections are diagnostic only.
- Once approved, a production brand asset is preserved byte-for-byte until the owner explicitly authorises its replacement or regeneration.
- Missing authoritative references or an incomplete approved minimum package block logo-dependent Phase 2 work, but not the Phase 1 foundation.
- The approved raster logo, symbol, favicon and application-icon package is frozen as Youtoola Brand Foundation v1 and satisfies the Phase 2 brand dependency when PR #3 merges.
- SVG masters, wordmark-only and monochrome variants, Open Graph artwork, expanded brand guides, manifest declarations and application metadata integration are deferred and do not block Phase 2.
- Any redesign, regeneration or replacement requires a separate owner-approved brand-change process.

## Rationale

Search discovery and model-training access are separate decisions. Official assets protect brand consistency and avoid accidental logo recreation.

## Remaining release action

Merge approved PR #3 before Phase 2 consumes the frozen production package.
