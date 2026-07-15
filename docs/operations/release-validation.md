# Release Validation Operations

## Commands

- `npm run validate`: complete offline pre-review validation, including lint, types, architecture, unit tests, release records, secrets and build.
- `npm run validate:architecture`: registry, Knowledge Layer, SEO, analytics/experiment/monetisation and release contracts.
- `npm run validate:delivery`: branch, environment, schema-v3 release, provenance, correction and follow-up policy. Add `-- --ship` to make overdue follow-ups release-blocking.
- `npm run validate:utility -- --slug=<slug>`: require a utility definition, specification and valid golden-vector JSON.
- `npm run validate:release -- --record=<path>`: validate one candidate or completed release record. Without `--record`, validate every JSON record under `docs/releases/`.
- `npm run test`: all Vitest tests.
- `npm run test:e2e`: Chromium end-to-end suite.
- `npm run security:scan`: scan tracked files for committed environment files and high-confidence credential signatures.
- `npm run security:audit`: offline high/critical lockfile audit for normal CI. SHIP also runs a current online `npm audit`.

## Release-record lifecycle

BUILD creates a schema-v3 `candidate` record containing everything known before deployment. Candidate records have `production: null`; Production fields cannot be fabricated or marked complete. PLAN is owner-approved; later gates remain pending until their approval occurs. The record also names its source branch/commit, release kind, required checks, environment policy and structured Preview state.

Before merge, REVIEW records the reviewed branch head, retained source ref and evidence references. SHIP verifies that exact head, checks and rollback plan. After automatic deployment, the immediate ship report is temporary operational evidence. A documentation-only follow-up PR changes the record to `completed` and supplies the merge method, resulting merge commit, durable `main` release commit, matching deployment commit, deployment ID, timestamps, live URLs, smoke results, rollback deployment, release date and immediate follow-up date.

For a candidate record, the source commit must belong to `main` and the reviewed head must exist in the candidate history. For a completed squash merge, the reviewed head must exist in the retained source ref but is not required to be an ancestor of `main`. The durable release commit must exist in `main` history and match the merge and Production deployment commits. Completed records fail when the pull request, source, reviewed head, retained ref, merge commit, durable commit, chronology, Production or rollback evidence is missing or inconsistent; live URLs are invalid; or immediate smoke evidence is absent. A source branch based on another unmerged feature branch is invalid.

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

After Phase 11, add acquisition, completion, validation, consent, continuation and approved commercial evidence. Until then, do not invent unavailable measurements. Pending scheduled reviews remain `pending`; once their due date passes, ordinary validation reports them and SHIP validation blocks until factual evidence or an approved correction is recorded.

## Corrections and record-completion branches

Completed history is not silently rewritten. Add a schema-v3 `correction` record with the original record ID, owner approval, reason, evidence and valid provenance. Missing targets, correction-to-correction chains, fabricated deployment facts and incomplete completed records fail closed.

A narrowly scoped `docs/release-record/<scope>` branch may complete an already approved release without creating a second application candidate. Any runtime, configuration or unrelated documentation change removes that exemption.

## Failure behavior

The validator reports stable non-sensitive issue codes and exits nonzero. Do not edit or weaken a requirement merely to obtain a pass. Correct the evidence or implementation; request an allowlisted owner exception only when the policy permits it. Material scope expansion returns to PLAN.
