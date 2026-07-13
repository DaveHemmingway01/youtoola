# Approved Raster Brand Assets

Status: Owner-approved on 2026-07-13.

## Production assets

| Asset | Dimensions | SHA-256 |
| --- | ---: | --- |
| `public/brand/youtoola-logo.png` | 3000×819 | `d2e096a9c186027ecdc576281b7b5c71488dda007f37c122172e471bbd749a05` |
| `public/brand/youtoola-logo-1500.png` | 1500×410 | `45bd10d72acbc15eb7116fbb2916febe001c8c26634edfe6fe47865675885d32` |
| `public/brand/youtoola-logo-750.png` | 750×205 | `15faa5d0f2df34d92b703acd7cbf55dd75719f7b3f0772c94ee2e4e95e26698e` |
| `public/brand/youtoola-symbol.png` | 2048×2048 | `c240dd3396a4d9c766b1d772e5bc4b6d148a89a337b88b8ca69b12daab9e326c` |
| `public/brand/youtoola-symbol-1024.png` | 1024×1024 | `f928cdaa5223ee2c52aee1f03c594c22cc1f5b48c8a6879a118fd43f3a3bf2b2` |
| `public/brand/youtoola-symbol-512.png` | 512×512 | `fa10ce95ca2847c51c381b55262f8e5517570729e4a2542f475e0090f51730ca` |

These hashes are the release integrity record. Do not regenerate, optimise or reprocess an approved file without explicit owner approval.

## Authoritative references

- `docs/brand/references/youtoola-logo.jpg`
- `docs/brand/references/youtoola-symbol.jpg`

The JPGs remain the visual source of truth. The approved PNGs preserve their geometry, typography, spacing, proportions, gradient and colour while replacing the white matte with genuine transparency.

## Processing method

- Decode the approved JPG appearance as sRGB.
- Use controlled colour-distance detection, local edge-aware alpha reconstruction and inverse white-matte colour decontamination.
- Produce the largest transparent master first and derive smaller files from it with deterministic high-quality resampling.
- Export 8-bit RGBA PNGs with an explicit standard sRGB declaration and no unnecessary metadata.
- Never trace, redraw, recolour, sharpen, generate or substitute any part of the artwork.

The implementation is retained under `scripts/brand/` for auditability and future owner-authorised maintenance. It is not an instruction to regenerate approved files.

## Approval and validation policy

Approval is based on visual quality in intended website, navigation, browser-tab, mobile, social-profile and presentation contexts. Production assets in `public/brand/` are authoritative. Diagnostic review output is temporary and ignored by Git.

Run non-mutating validation with:

```bash
npm run brand:validate
```

Validation checks dimensions, PNG structure, 8-bit RGBA encoding, explicit sRGB declaration, transparent corners, genuine alpha, absence of an opaque background rectangle and absence of near-white translucent fringe pixels.

At approval all six assets passed validation, lint, strict type-checking, unit tests, end-to-end tests and the production build. No package dependency was added for raster processing.

## Known usage constraint

The primary wordmark is dark navy and is intended for white, soft off-white and suitable neutral surfaces. Use a future owner-approved light monochrome variant on dark surfaces; do not modify these approved files in place.
