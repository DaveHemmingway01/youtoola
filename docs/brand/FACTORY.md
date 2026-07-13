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
```

`brand:generate` can rebuild the Asset 01 logo PNG family and Asset 03 symbol PNG family from the approved JPGs. It creates the largest transparent master first and derives smaller sizes from that master. It does not generate later asset groups.

The current Asset 01 and Asset 03 PNGs are approved. Do not run `brand:generate` against them unless the owner explicitly reopens those assets for replacement.

## Asset 01 and Asset 03 references

- `references/youtoola-logo.jpg`
- `references/youtoola-symbol.jpg`

These JPG files supersede the earlier PNG references for all initial logo and symbol production decisions. The full logo controls the lockup and wordmark; the standalone symbol controls the symbol. SVG tracing is cancelled.

Youtoola owns or has permission to use and faithfully reproduce these references.
