# Repository Knowledge Layer Operations

## Validate

```bash
npm run registry:validate
npm run knowledge:validate
```

Normal CI uses repository fixtures only and performs no network request.

## Add or change a record

1. Confirm that an existing entity cannot be reused.
2. Choose the approved namespaced ID and never derive identity from a mutable display name.
3. Add only source-supported fields and stable references.
4. Record `knowledgeSchemaVersion: 1`, lifecycle status, reviewed date and provenance.
5. Keep new records provisional or internal unless the owner explicitly approves activation or public eligibility.
6. Run registry, knowledge-layer and full project validation.
7. Review the complete diff and selector output.

Automation may report or derive internal views but may not approve or activate data.

## Add a utility relationship

1. Confirm both utilities exist in the canonical registry.
2. Use a stored relationship type; do not store inverse or `same-*` views.
3. Write a specific human rationale explaining user continuation value.
4. Add journey context for `next-step`.
5. Keep `input-provider` internal.
6. Use canonical endpoint order for symmetric types.
7. Obtain owner approval before using `approved` or `public-candidate`.

An empty relationship store is valid while only one approved utility exists.

## Future slots

Future slots remain inside one journey. They must not receive identity, URLs or release fields. When an approved utility replaces a slot, add the real utility through the normal utility workflow, update the journey in a reviewed change, remove the slot, and add only evidence-supported relationships.

## Retirement

Retired IDs remain reserved. Before retirement, inspect inbound and outbound references, journeys and public selectors. Owner approval is required. Do not delete a released identity merely to reuse its key.

## Schema migration

A future schema version requires an approved plan and one repository migration covering the schema constant, all records, validators, tests and documents. Do not add runtime migration machinery or accept mixed schema versions.

## Phase 5 boundary

Phase 5 may consume only public-safe selectors for public pages and search. It must not read raw entity arrays in client components or bypass released-only filters. Phase 4 itself does not create routes, sitemap entries, navigation entries or search data.
