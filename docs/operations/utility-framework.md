# Utility Framework Operations

## Validate Phase 6

```bash
npm run lint
npm run typecheck
npm run registry:validate
npm run knowledge:validate
npm run test
npm run test:e2e
npm run build
npm audit
```

Also run all brand validators, secret scanning and `git diff --check` before review.

## Add a future utility

1. Complete the exact live Sheet retrieval, commercial scorecard and search research.
2. Obtain approval for the utility specification, risk, formulas, sources and versions.
3. Create the explicit four-file utility contract only after `APPROVE PLAN`.
4. Keep canonical identity and release status in the registry; do not duplicate them in the definition.
5. Keep content and methodology server-rendered and calculation browser-local unless the approved plan requires otherwise.
6. Add authoritative or independently derived calculation vectors.
7. Verify validation order, summary focus, field links, result announcement, reset and privacy.
8. Use only released public selectors for related tools and discovery.
9. Keep commercial output hidden when unconfigured and place approved continuation after free value.
10. Confirm the utility is absent from Production until `APPROVE SHIP` and the Growth Infrastructure gate passes.

## Version and risk changes

Automation may validate but cannot approve. The Youtoola owner approves calculation, methodology and content versions, assumptions, warnings, risk and release. Regulated or high-consequence utilities require an identified independent reviewer.

An unclassified utility cannot release. Data-dependent utilities require source freshness and unavailable-data handling. Do not treat the opportunity Sheet as calculation authority.

## Privacy checks

Ordinary utilities must make no calculation request and write no input to URLs, cookies, local storage, session storage, logs or analytics. Copy payloads require utility-level privacy review and exclude private values by default.

## Review surface

The neutral framework example remains inside `/design-system-review`, which is Local/Preview-only, noindexed and Production-disabled. Fuel Trip fixture code must remain under `tests/fixtures/` and absent from application imports and client chunks.

## Rollback

Phase 6 has no database, external configuration or public utility route. Roll back through a protected-main revert or the previous ready Vercel Production deployment. Never use a manual Production deployment by default.
