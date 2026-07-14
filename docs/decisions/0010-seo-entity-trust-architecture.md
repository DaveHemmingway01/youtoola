# ADR 0010: Native SEO, entity and trust architecture

Status: Accepted for Phase 7 implementation review.

## Decision

- Use native Next.js metadata and repository-owned TypeScript contracts; add no SEO or schema package.
- Keep utility identity, knowledge data, public eligibility, methodology and SEO copy under their existing separate authorities.
- Require unique authored metadata and self-canonicals for every indexable page; do not inherit a generic description or homepage canonical.
- Publish substantive `/about`, `/methodology` and `/privacy` pages.
- Keep `/accessibility` reserved and unpublished until a real public feedback channel exists. Keep `/contact` and `/editorial-policy` unpublished.
- Emit minimal homepage Organization and WebSite JSON-LD plus visible-matching BreadcrumbList data for `/tools` and trust pages.
- Use the approved full logo as the Organization logo and add no unverified organization facts.
- Compose the sitemap from released-only discovery data and approved trust definitions.
- Preserve separate wildcard, OAI-SearchBot and GPTBot crawler rules.
- Use text-only social metadata and defer the default Open Graph image to a mandatory pre-Phase-11 asset task.
- Defer `llms.txt`, utility schema, public utility metadata, localized routes and `hreflang`.
- Require owner approval for public metadata, structured data, trust content and every published URL retirement.

## Rationale

This creates consistent acquisition and entity controls without thin pages, invented facts, duplicate registries, client hydration or third-party services. Trust pages give users and crawlers factual information about the platform and its review process. Strict public eligibility prevents an SEO record from leaking an unreleased utility.

## Consequences

Trust content requires annual review and immediate review after material policy or data-practice changes. Privacy requires legal review before Phase 11 analytics and consent activation. The accessibility statement and dedicated social artwork remain explicit blockers for their later approved tasks, not hidden omissions.
