# Public Discovery Layer

Status: Phase 5 implementation candidate.

## Purpose

The public discovery layer turns reviewed registry and Repository Knowledge Layer records into safe, indexable navigation. It is fail closed: an internal record is absent from pages, links and the sitemap unless every applicable release and publication condition passes.

The homepage is Youtoola's canonical entity page. `/tools` is a permanent canonical directory and returns useful server-rendered content even when no utility is released. Category and journey routes do not exist until real records satisfy their publication policies.

## Data boundary

Public pages import only `lib/discovery` selectors. They do not import registry arrays, Knowledge Layer fixtures, future slots, commercial fields or internal relationships.

The production model starts with Phase 4 public-eligible utilities and journeys, then applies Phase 5 requirements:

- a utility must be `released`, have a valid release date, canonical slug and description, belong to an active category and reference active entities;
- a category must be active, contain at least two eligible released utilities and have owner-approved original introduction copy;
- a journey must be active and public, contain at least two released utilities across at least two useful stages, have no future slots and have owner-approved original guidance;
- category and journey ordering is explicit display order followed by approved name;
- directory ordering is alphabetical by approved tool name;
- homepage ordering uses one tool as `Available tool`; from two tools, `Recently added` uses release date descending then approved name.

The returned model is immutable and exposes only the fields needed for public discovery. Search-index construction is deferred.

## Route model

| Route | Phase 5 state | Sitemap |
| --- | --- | --- |
| `/` | Always 200 and indexable in Production | Always |
| `/tools` | Always 200 and indexable in Production | Always |
| `/<utility-slug>` | Owned by the approved utility workflow | Only for eligible released records |
| `/categories/<category-id>` | No route until its threshold and content approval pass | Only when public |
| `/journeys/<journey-id>` | No route until its threshold and content approval pass | Only when public |
| `/search` | Prohibited; future search stays inside `/tools` | Never |

At the Phase 5 zero-inventory state, the discovery model contributes exactly `https://www.youtoola.com` and `https://www.youtoola.com/tools`. Later SEO phases may compose approved trust pages without weakening released-only discovery.

## Rendering and performance

The homepage and directory are static Server Components. Phase 5 adds no client component, search code, image, font, third-party script or runtime dependency. The existing mobile navigation remains the only client boundary used by these pages.

All meaningful copy is present in initial HTML. Local and Preview remain protected by the existing `X-Robots-Tag: noindex, nofollow` policy; Production remains indexable.

## Phase boundaries

Phase 5 does not create utility routes, calculations, analytics, consent, monetisation, a database, a CMS or an AI service. Phase 6 may consume the public discovery contracts when building the reusable utility framework, but it cannot bypass release status or publication thresholds.
