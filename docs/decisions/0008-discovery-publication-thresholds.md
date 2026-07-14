# ADR 0008: Public discovery routes and publication thresholds

Status: Accepted for Phase 5 implementation review.

## Decision

- Keep the homepage permanently indexable as the canonical Youtoola entity page.
- Keep `/tools` permanently available, canonical and indexable, including at zero released utilities.
- Show an honest status and empty state instead of unreleased tools, fake inventory, search teasers or popularity claims.
- Require `released` status, a valid release date and canonical route, an active category, active referenced entities and complete public copy before a utility enters discovery.
- Publish a category only with at least two eligible released utilities and owner-approved original introduction copy.
- Publish a journey only with at least two released utilities across two useful stages, active public status, complete owner-approved guidance and no future slot.
- Keep search hidden until three released utilities exist. Later search stays client-side inside `/tools`, uses a static released-only index and does not persist raw queries.
- Allow `Recently added` at two utilities using release date descending then approved name.
- Keep `Featured` hidden until three utilities and an owner-approved ordering field exist.
- Keep `Popular` hidden until three utilities and comparable Production evidence exists after Growth Infrastructure.
- Add no pagination before a separate review at more than 50 released utilities.
- Generate navigation eligibility and sitemap URLs from the same immutable public discovery model.

## Rationale

A stable `/tools` URL establishes an understandable platform directory without inventing inventory. Thresholds prevent thin category and journey pages, keep internal product planning private and protect search trust. Static Server Components preserve crawlable HTML and add no Phase 5 client JavaScript or operating cost.

## Consequences

The first released utility can appear on `/tools` and link from the homepage without forcing a one-tool category page. Category and journey routes require later owner approval and route implementation after their data thresholds pass. This is an approved Phase 5 exception to any roadmap wording that would otherwise require a category page for Utility #1.
