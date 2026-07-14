# Release Validation Operations

## Commands

- `npm run validate`: complete offline pre-review validation, including lint, types, architecture, unit tests, release records, secrets and build.
- `npm run validate:architecture`: registry, Knowledge Layer, SEO, analytics/experiment/monetisation and release contracts.
- `npm run validate:utility -- --slug=<slug>`: require a utility definition, specification and valid golden-vector JSON.
- `npm run validate:release -- --record=<path>`: validate one candidate or completed release record. Without `--record`, validate every JSON record under `docs/releases/`.
- `npm run test`: all Vitest tests.
- `npm run test:e2e`: Chromium end-to-end suite.
- `npm run security:scan`: scan tracked files for committed environment files and high-confidence credential signatures.
- `npm run security:audit`: offline high/critical lockfile audit for normal CI. SHIP also runs a current online `npm audit`.

## Release-record lifecycle

BUILD creates a `candidate` record containing everything known before deployment. Candidate records have `production: null`; Production fields cannot be fabricated or marked complete. PLAN is owner-approved; later gates remain pending until their approval occurs.

Before merge, REVIEW updates the evidence references and candidate commit. SHIP verifies the exact head, checks and rollback plan. After automatic deployment, the immediate ship report is temporary operational evidence. A documentation-only follow-up PR changes the record to `completed` and supplies matching merge/deployment commits, deployment ID, live URLs, smoke results, rollback deployment, release date and immediate follow-up date.

Completed records fail when Production or rollback evidence is missing, deployment and merge commits differ, live URLs are invalid or immediate smoke evidence is absent.

## Preview evidence

Runtime changes record deployment ID and branch commit, Ready state, authentication, `noindex, nofollow`, Production canonicals, expected and unavailable routes, headers, secret scan, absence of Production analytics and confirmation that no manual Production deployment occurred. Pure internal documentation changes still require CI and Vercel but not a manual visual inspection.

## Production smoke evidence

Record deployment ID and commit, critical and unavailable route statuses, apex redirect, canonical, robots, sitemap, indexability, security headers, brand hashes, console errors, relevant network/cookie/storage behavior and rollback readiness. A smoke report cannot replace the full pre-merge suite.

## Scheduled evidence

- Immediate: live smoke and rollback readiness.
- 24 hours: deployment errors, route availability and correction reports.
- 7 days: indexing evidence where available.
- 28 days: Core Web Vitals, methodology freshness and regressions.
- Monthly: quality, errors, corrections and maintenance.
- Quarterly: sources, dependency posture and risk classification.

After Phase 11, add acquisition, completion, validation, consent, continuation and approved commercial evidence. Until then, do not invent unavailable measurements.

## Failure behavior

The validator reports stable non-sensitive issue codes and exits nonzero. Do not edit or weaken a requirement merely to obtain a pass. Correct the evidence or implementation; request an allowlisted owner exception only when the policy permits it. Material scope expansion returns to PLAN.
