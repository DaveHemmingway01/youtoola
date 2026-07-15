# Youtoola Brand Asset Factory

## Authority

Production assets reproduce owner-approved references. The initial logo and symbol use pixel-faithful transparent PNG processing from the approved JPGs. Codex must not trace, redraw, reinterpret, simplify, recolour, or modernise the identity without explicit approval.

The standalone symbol reference controls symbol geometry. The primary lockup reference controls the relationship between symbol and wordmark.

## Asset gate

Each asset is handled separately:

1. verify the authoritative reference
2. generate an uncommitted candidate
3. validate dimensions, sRGB appearance, RGBA transparency, edges, and rendering
4. render review-only comparisons and intended sizes
5. report measurements and uncertainty
6. wait for explicit owner approval
7. remove rejected versions or commit only the approved result

Temporary review renders live under the ignored `docs/brand/reviews/` directory. They are never production assets and never belong in `public/brand/`.

Approval evaluates the production candidates in `public/brand/` at their intended real-world sizes and contexts. Diagnostic overlays, contour percentages, pixel reconstruction scores and extreme zooms may help find defects but are not approval criteria. The visually superior production asset wins. After approval, preserve the file byte-for-byte and do not run regeneration without explicit owner instruction.

## Commands

```bash
npm run brand:generate
npm run brand:validate
npm run brand:preview
npm run brand:favicon:generate
npm run brand:favicon:validate
npm run brand:favicon:preview
npm run brand:application-icons:generate
npm run brand:application-icons:validate
npm run brand:application-icons:preview
npm run brand:og:generate
npm run brand:og:validate
npm run brand:og:preview
```

`brand:generate` can rebuild the Asset 01 logo PNG family and Asset 03 symbol PNG family from the approved JPGs. It creates the largest transparent master first and derives smaller sizes from that master. It does not generate later asset groups.

The current Asset 01 and Asset 03 PNGs are approved. Do not run `brand:generate` against them unless the owner explicitly reopens those assets for replacement.

Asset Group 05 derives the approved 16, 32, 48 and 64-pixel favicon PNGs independently from the complete approved 2048×2048 symbol master. It preserves the existing canvas, optical centring, transparent padding, geometry, gradient and dot relationship. The four PNGs are embedded byte-for-byte in deterministic size order inside `favicon.ico`. No micro-symbol, cascade resizing, sharpening, recolouring, background or outline is permitted.

Favicon review material remains under the ignored `docs/brand/reviews/favicon/` directory. Native-size browser-tab, bookmark, shortcut and compact-navigation presentation controls visual approval; magnified output is diagnostic only. The five approved favicon files are immutable until the owner explicitly authorises replacement. Do not run `brand:favicon:generate` against them for routine validation; use `brand:favicon:validate`.

Asset Group 06 derives the Apple touch icon and 192/512-pixel application-icon candidates independently from the complete approved symbol master. Each candidate places the unchanged gradient symbol on an opaque `#000A3F` canvas: 75% scale for Apple and 71.875% for Android/PWA. The square files contain no baked platform mask; manifest, metadata, maskable, adaptive and monochrome integration is deferred.

Application-icon review material remains under the ignored `docs/brand/reviews/application-icons/` directory. Home-screen, install-prompt, bookmark, launcher and common-mask previews control visual approval. Safe-area overlays are diagnostic only. The three approved application-icon files are immutable until the owner explicitly authorises replacement. Do not run `brand:application-icons:generate` against them for routine validation; use `brand:application-icons:validate`.

The approved Phase 11 default Open Graph asset derives only from the frozen full logo and the approved brand promise. It uses the approved navy canvas and places the unchanged dark wordmark on a soft-white panel for legibility. Review material remains under ignored `docs/brand/reviews/og-default/`. Preserve `public/brand/og-default.png` byte-for-byte and use `brand:og:validate` for routine checks; metadata integration remains deferred to Phase 11 Unit 2.

## Asset 01 and Asset 03 references

- `references/youtoola-logo.jpg`
- `references/youtoola-symbol.jpg`

These JPG files supersede the earlier PNG references for all initial logo and symbol production decisions. The full logo controls the lockup and wordmark; the standalone symbol controls the symbol. SVG tracing is cancelled.

Youtoola owns or has permission to use and faithfully reproduce these references.
