# Discovery Publication Operations

## Validate the current public model

```bash
npm run registry:validate
npm run knowledge:validate
npm run test
npm run test:e2e
npm run build
```

Confirm the sitemap, public HTML and client assets contain no unreleased utility, future slot, provisional journey, internal relationship or commercial opportunity data.

## Release or pause a utility

1. Complete the utility's own PLAN, BUILD, REVIEW and SHIP gates.
2. Verify the registry release date, canonical URL, description, category and active referenced entities.
3. Confirm the public utility route exists before its release commit can reach Production.
4. Inspect `getPublicDiscoveryTools()`, homepage selection and `getPublicDiscoveryUrls()`.
5. Confirm every emitted public URL has a matching App Router page; discovery validation rejects unavailable routes.
6. Verify directory ordering, links, sitemap, metadata and Preview noindex behavior.

Changing a released utility to `paused` or `retired` removes it from discovery on the next approved deployment. Before merging, review inbound links, its canonical response and any required redirect or retirement page. Never leave a sitemap or public discovery link pointing to an unavailable route.

## Publish a category

1. Confirm active status and clear user intent.
2. Confirm at least two eligible released utilities.
3. Obtain owner approval for original introduction copy and deterministic ordering.
4. Add the approved content record and the `/categories/<category-id>` route in one reviewed change.
5. Verify category labels remain plain text anywhere the route is unavailable.
6. Verify canonical metadata, sitemap inclusion, no thin content and no internal records.

`travel-mobility` is not approved for publication in Phase 5.

## Publish a journey

1. Confirm active public status, approved objective and audience.
2. Confirm at least two released utilities across at least two useful reviewed stages.
3. Remove every future slot from the public sequence.
4. Obtain owner approval for original guidance and stage order.
5. Add the approved content record and `/journeys/<journey-id>` route together.
6. Keep commercial opportunity data internal unless separately approved for a labelled post-value placement.
7. Verify retirement behavior, canonical metadata and sitemap eligibility.

`journey:road-trip-planning` remains provisional and internal.

## Activate search later

Search remains absent below three released utilities. At activation, use a small client island inside `/tools` over a statically generated released-only index. Do not create `/search`, send queries to a server, persist raw queries in URLs or add a library without separate dependency approval.

## Rollback

Phase 5 is repository-only and statically generated. Roll back through the previous ready Vercel Production deployment or revert the Phase 5 merge through the protected-main workflow. Do not manually deploy Production.
