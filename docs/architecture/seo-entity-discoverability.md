# SEO, Entity, Trust and AI Discoverability Architecture

Status: Phase 7 implementation candidate.

## Purpose and authority

Phase 7 creates a native, static-first SEO composition layer. It does not create a second utility registry or make internal records public.

| Concern | Authority |
| --- | --- |
| Utility identity, slug and lifecycle | Phase 3 registry |
| Categories, journeys, concepts and sources | Phase 4 Repository Knowledge Layer |
| Public eligibility | Phase 5 discovery selectors |
| Methodology, versions and reviewed dates | Phase 6 utility definition |
| Authored metadata and structured-data projection | Phase 7 SEO contracts |

An SEO definition cannot release a utility. Future utility metadata is eligible only when the registry record is released, the discovery model admits it and its visible content passes Phase 7 validation. Phase 7 contains no utility SEO record.

## Canonical and metadata policy

The only canonical origin is `https://www.youtoola.com`. Root is represented by the origin; every other canonical uses a lowercase public path without a trailing slash, query or fragment. Preview and Vercel deployment hosts never become canonical. Published slug changes require owner approval and a redirect plan.

The root layout owns `metadataBase`, site name, application name, title template, icons, language, theme colours and environment-aware robots defaults. It intentionally owns no inherited description or canonical. Every indexable page owns a unique authored description and self-canonical.

Homepage and page social metadata are text-only. No Open Graph image is declared until a separate owner-approved 1200×630 asset exists. That asset remains mandatory before Phase 11 may exit.

## Trust and entity identity

Phase 7 publishes `/about`, `/methodology` and `/privacy`. Each is substantive, server-rendered, indexable, canonical, sitemap-eligible, visibly reviewed and owned by the `Youtoola owner` role.

Editorial policy is combined with methodology to avoid overlapping thin pages. `/accessibility`, `/contact` and `/editorial-policy` remain reserved and unavailable. Accessibility publication is explicitly blocked until a stable public feedback method exists; its absence is not completion of the future accessibility-statement requirement.

The approved concise description is:

> Youtoola is a collection of free, practical online tools for everyday calculations, decisions and tasks, without requiring an account.

The extended description explains one dependable platform, focused tasks, methodology and account-free core use. Public trust content does not expose the internal monetisation strategy or make unsupported scale, popularity, ranking, accuracy, partnership or award claims.

## Structured-data boundaries

The homepage emits one JSON-LD graph containing:

- `Organization` with stable ID, name, URL, approved description and the unchanged approved full logo at `https://www.youtoola.com/brand/youtoola-logo.png`;
- `WebSite` with stable ID, name, URL, approved description, publisher reference and `inLanguage: en`.

No SearchAction, legal name, address, telephone, email, founder, employee, founding date, tax data, social profile, rating, review, offer or price is approved.

`BreadcrumbList` is emitted for `/tools` and each trust page from the same items rendered visibly. Phase 7 emits no WebApplication, SoftwareApplication, FAQPage, HowTo, Dataset, Article or ItemList. Future schema requires matching visible content and the relevant release threshold.

JSON-LD is server-rendered through a serializer that escapes raw `<`, U+2028 and U+2029 characters before insertion into a script element. Structured data adds no client hydration.

## Sitemap and crawler governance

The sitemap composes stable discovery URLs and approved trust-page definitions. At the Phase 7 zero-utility state it contains exactly:

1. `https://www.youtoola.com`
2. `https://www.youtoola.com/tools`
3. `https://www.youtoola.com/about`
4. `https://www.youtoola.com/methodology`
5. `https://www.youtoola.com/privacy`

It omits `lastModified`, `changeFrequency` and `priority`. Unreleased utilities, future slots, search states, review routes and deferred trust routes are excluded.

The existing crawler policy remains authoritative: Production allows ordinary crawlers and `OAI-SearchBot`, disallows `GPTBot` and references the Production sitemap. Local and Preview disallow all crawlers and retain response-level `noindex, nofollow`. AI-search and model-training rules remain separate owner decisions.

## Source transparency and AI discoverability

Future utility content must expose definitions, inputs, outputs, units, assumptions, limitations, worked examples, methodology, versions, reviewed dates and sources as logical server-rendered HTML. Source authority classes remain distinct: provenance records origin, authoritative sources support facts and calculations, and commercial sources may support labelled offers but never calculation authority.

AI may assist research preparation, drafting, engineering, test creation and review support. It does not replace deterministic calculations, authoritative sources, independent verification where required, human review or owner approval. There is no hidden AI-only content, automated content generation or page-level AI badge.

`/llms.txt`, alternate AI sitemaps and crawler-only summaries are deferred until released utility inventory provides enough stable public content to justify maintenance. They are not ranking or citation guarantees.

## Performance and internationalization

Phase 7 adds zero client JavaScript, images, external fonts or third-party scripts. Platform and trust JSON-LD stays below 8 KB uncompressed per page; combined metadata and JSON-LD below 20 KB; trust-page HTML below 50 KB gzip.

English is the only supported language. No `hreflang`, translations, locale switcher or country variants exist. Future localization requires approved content and material differentiated value.
