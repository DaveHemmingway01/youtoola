# Brand Asset Foundation

Status: **Youtoola Brand Foundation v1, Frozen**

Youtoola uses a reference-controlled brand asset factory before Phase 2 begins. The owner supplies authoritative visual references and reproduction rights; Codex produces deterministic production assets, technical validation, and review previews one asset at a time.

The approved JPG references are the visual production source of truth. Codex removes only their white background using controlled alpha reconstruction and colour decontamination. It must not trace, redraw, redesign, reinterpret, simplify, recolour, or modernise the artwork.

Production logo and symbol candidates are 8-bit RGBA sRGB PNGs with genuine transparency. The largest candidate in each family is produced first; smaller sizes are deterministically derived from that master. Temporary review previews remain outside `public/brand/`.

No candidate becomes an approved brand asset until the owner explicitly approves that asset. The brand branch remains unmerged until the minimum package and final package review are complete.

Approval is based on the production files in `public/brand/` as they appear in intended website, navigation, mobile, browser-tab, social and presentation contexts. Diagnostic overlays, contour scores and extreme-zoom inspections do not override real-world visual quality. Approved assets are immutable until the owner explicitly authorises replacement or regeneration.

The frozen v1 package contains the approved primary logo family, standalone symbol family, browser favicon family, Apple touch icon and Android/PWA application icons. It is sufficient for the website header and footer, mobile navigation, browser tabs and bookmarks, mobile shortcuts, basic social use and documents.

The Phase 2 brand dependency is satisfied when PR #3 merges. SVG masters, a wordmark-only asset, monochrome variants, a default Open Graph image, expanded colour and typography documentation, the final brand guide, manifest declarations and application metadata integration are deferred. They do not block the design system or platform shell.

Approved production files must not be redesigned, regenerated, optimised or replaced without a separate owner-approved brand-change process.
