# Youtoola Default Open Graph Asset

Status: **Approved and frozen on 2026-07-15.**

## Production candidate

- Path: `public/brand/og-default.png`
- Dimensions: 1200×630
- Format: 8-bit RGBA PNG with explicit standard sRGB
- Background: approved navy `#000A3F`
- Copy: approved brand promise, “Useful tools. No account. No nonsense.”
- Safe margin: at least 80 pixels horizontally and 60 pixels vertically
- Compression target: below 250 KB
- Candidate SHA-256: `9a6c7ac46773ff6d8a6d2fe0de7aeaa5f0fc6c5ff272bc848d9da171d8aedcbc`
- Frozen source-logo SHA-256: `d2e096a9c186027ecdc576281b7b5c71488dda007f37c122172e471bbd749a05`

The frozen `public/brand/youtoola-logo.png` is the only artwork source. Its bytes, geometry, gradient, wordmark, spacing and colours are not modified. Because its approved wordmark is dark navy, the unchanged logo is presented on a soft-white panel inside the navy social canvas rather than being recoloured or placed illegibly on navy.

## Deterministic production

Run:

```bash
npm run brand:og:generate
npm run brand:og:preview
npm run brand:og:validate
```

Generation uses the pinned Playwright Chromium/Skia toolchain already present in the repository. It verifies the frozen logo SHA-256 before rendering, creates the complete canvas in one pass, normalizes PNG chunks to `IHDR`, `sRGB`, `IDAT` and `IEND`, and verifies the source hash again afterward. No external font, remote asset, generative image, tracing, sharpening, recolouring or new package is used.

Review-only files are written to the ignored `docs/brand/reviews/og-default/` directory. They include light and dark social contexts, native and thumbnail sizes, and crop/safe-area diagnostics. These files are not production assets and must not be committed.

## Approval and freeze

The owner approved the production asset at SHA-256 `9a6c7ac46773ff6d8a6d2fe0de7aeaa5f0fc6c5ff272bc848d9da171d8aedcbc`. Preserve it byte-for-byte. Do not redesign, recolour, resize, crop or regenerate it differently without a separate approved brand-change process.

Visual approval was based on normal social-card and thumbnail presentation. Diagnostic overlays identify clipping or unsafe placement; they do not override real-world visual judgment. Metadata integration remains deferred to Phase 11 Unit 2.
