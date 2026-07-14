# SEO, Trust and URL Governance

## Ownership and publication

The Youtoola owner approves metadata, canonicals, structured data, trust content, methodology policy, privacy content before legal review, category introductions, journey guidance, utility SEO copy, source presentation, social metadata and URL retirement decisions. Automation validates and reports but cannot approve publication.

Trust pages are reviewed annually and immediately after material changes to calculations, methodology, sources, corrections, accessibility approach, privacy, analytics, consent, advertising, accounts, persistence or AI-assistance policy. Store reviewed dates as ISO dates and render them readably.

`/accessibility` remains reserved and must return 404 until a separately approved change includes a functioning public feedback method. Do not describe the accessibility-statement requirement as complete before that release.

## Add or change indexable metadata

1. Confirm the page is public and meets its release threshold.
2. Use the canonical `www` host and a non-root path without a trailing slash, query or fragment.
3. Author a unique title, description and matching visible purpose.
4. Add text-only social metadata unless an approved page image exists.
5. Add only structured data supported by visible facts.
6. Confirm breadcrumbs, canonical, structured data, sitemap and visible navigation agree.
7. Run SEO validation and the complete repository suite.
8. Obtain owner approval before merge.

Title and description length reports are editorial advisories, not arbitrary ranking rules. Missing, duplicated or conflicting metadata is a release error.

## Structured-data review

Local tests verify JSON parsing, safe serialization, stable IDs, prohibited fields, breadcrumb agreement and payload budgets. During Preview review, inspect the rendered JSON-LD and use external validators manually where useful. Normal CI must not depend on an external validation API.

Never add ratings, reviews, offers, prices, legal details, social profiles, FAQ schema or application schema without visible approved evidence. Commercial sources cannot be calculation authorities.

## URL retirement

Every published URL decision requires owner approval:

- temporary technical interruption: retain the route or use an appropriate temporary service response;
- temporary accuracy, legal or source withdrawal: remove it from discovery and sitemap, then use an explanatory noindex page or HTTP 503 based on expected duration;
- permanent retirement without replacement: HTTP 410;
- genuine successor or approved slug migration: HTTP 308 to the closest equivalent replacement;
- ordinary missing content: genuine HTTP 404.

Do not redirect unrelated retired pages to the homepage and do not create soft 404s. Phase 7 documents these contracts but implements no utility retirement route because no utility is released.

## Privacy and AI policy triggers

Legal review of `/privacy` is required before Phase 11 analytics and consent activation. Analytics, advertising, accounts, uploads or persistence trigger immediate privacy review before release.

AI may support preparation and review but cannot replace deterministic calculation truth, authoritative evidence, required independent verification, human review or owner approval. Do not add AI-only content or autonomous publishing.

## Preview and release review

Verify:

- Preview returns `X-Robots-Tag: noindex, nofollow` and disallows all robots;
- Preview canonicals use `https://www.youtoola.com`;
- Production-mode robots keep wildcard and OAI-SearchBot allowed and GPTBot disallowed;
- sitemap output contains only approved indexable routes;
- deferred and missing routes return genuine 404 responses with no homepage canonical;
- no Fuel Trip Calculator content or metadata appears publicly;
- trust content is server-rendered with no new client JavaScript;
- metadata and structured data stay within budgets;
- no external SEO, font, analytics or content-generation script exists.

Roll back through a protected-main revert or the previous Ready Vercel Production deployment. Do not deploy Production manually by default.
