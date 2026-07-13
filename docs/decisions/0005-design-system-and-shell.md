# ADR 0005: Shared Design System and Platform Shell

Status: Accepted for Phase 2 implementation review.

## Decision

Youtoola will use a small repository-owned CSS-token system and semantic React components. The App Router shell is server-rendered by default. Client JavaScript is allowed only for interaction requiring state, currently the compact disclosure navigation and the isolated review-form demonstration.

The interface uses the approved system font stack and frozen raster brand package. A darker interaction blue is separate from decorative brand blues so text and controls meet contrast requirements.

The Local and Preview-only `/design-system-review` route replaces the need for Storybook. It is noindexed, excluded from the sitemap and is intercepted by a Production-only before-files rewrite so it returns a real HTTP 404 in Production.

## Rationale

This keeps the platform fast, accessible and inexpensive while establishing consistent utility-completion and post-result commercial patterns. It avoids a framework dependency before repeated utility needs justify one.

## Consequences

- Components must preserve semantic HTML, keyboard operation, focus visibility and 44-pixel control targets.
- Utilities reuse the result hierarchy and place inert or active commercial continuation only after free value is complete.
- New components require a demonstrated product need.
- Phase 2 introduces no utility, analytics, consent, registry, database, authentication, CMS or AI system.
