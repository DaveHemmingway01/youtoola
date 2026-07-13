# Brand Asset Foundation

Youtoola uses a reference-controlled brand asset factory before Phase 2 begins. The owner supplies authoritative visual references and reproduction rights; Codex produces deterministic production assets, technical validation, and review previews one asset at a time.

The approved JPG references are the visual production source of truth. Codex removes only their white background using controlled alpha reconstruction and colour decontamination. It must not trace, redraw, redesign, reinterpret, simplify, recolour, or modernise the artwork.

Production logo and symbol candidates are 8-bit RGBA sRGB PNGs with genuine transparency. The largest candidate in each family is produced first; smaller sizes are deterministically derived from that master. Temporary review previews remain outside `public/brand/`.

No candidate becomes an approved brand asset until the owner explicitly approves that asset. The brand branch remains unmerged until the minimum package and final package review are complete.

Approval is based on the production files in `public/brand/` as they appear in intended website, navigation, mobile, browser-tab, social and presentation contexts. Diagnostic overlays, contour scores and extreme-zoom inspections do not override real-world visual quality. Approved assets are immutable until the owner explicitly authorises replacement or regeneration.

Phase 2 interface implementation remains blocked until the minimum production brand package is approved and shipped.
