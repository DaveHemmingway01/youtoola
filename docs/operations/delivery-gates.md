# Delivery Gates

The six gates are sequential and cannot be collapsed. Automation validates and reports evidence but never approves or advances a gate. The Youtoola owner is the final approval authority. Additive risk tags select the union of required evidence through `lib/release/validation.ts`.

## PLAN

Verify the live Sheet source, commercial scorecard, search landscape, product definition, calculation or processing logic, UX, SEO and AI strategy, monetisation, analytics, implementation, tests, and meaningful risks. No implementation begins before `APPROVE PLAN`.

Record scope, risk tags, required evidence, source and methodology obligations, performance budgets and rollback. Material expansion returns to PLAN.

## BUILD

Implement the approved specification on an isolated branch, add tests and shared registry updates, run validation, and prepare a Preview. Do not deploy Production. End by awaiting `APPROVE REVIEW`.

Create a validated candidate release record before merge. In-scope blocker fixes remain in BUILD or REVIEW; broader behavior requires a plan amendment.

## REVIEW

Review the complete diff and independently validate calculations, responsive behaviour, accessibility, security, privacy, metadata, indexing, analytics, commercial placement, related tools, and regressions. End by awaiting `APPROVE SHIP`.

Review the risk-selected evidence, exact branch deployment and rollback. Critical and High findings block release.

## SHIP

After explicit `APPROVE SHIP`, verify branch, commit, checks, environments, rollback, canonical URL, indexing, sources, and secrets. Merge through GitHub, allow the connected Vercel project to deploy, then smoke-test the live URL and record the release.

## POST-DEPLOYMENT

Verify the automatic Production deployment ID and commit, live routes, redirect, canonical, robots, sitemap, indexability, headers, assets, relevant console/network/storage behavior and rollback availability. Critical and material High failures require immediate containment or rollback. Complete the release record through a documentation-only follow-up PR.

## POST-LAUNCH REVIEW

Review immediate, 24-hour, 7-day, 28-day, monthly and quarterly evidence. Before Phase 11 this covers technical health, indexing, performance, corrections and methodology. After Phase 11 it also covers approved acquisition, completion, validation, consent, continuation and commercial evidence.

GitHub controls approval and merge. Vercel executes deployments. Codex must never claim success without verifying the resulting state.

See `docs/architecture/testing-and-release-gates.md`, `docs/operations/release-validation.md` and `docs/operations/rollback.md` for the binding Phase 9 evidence and failure rules.
