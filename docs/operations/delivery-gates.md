# Delivery Gates

The four gates are sequential and cannot be collapsed.

## PLAN

Verify the live Sheet source, commercial scorecard, search landscape, product definition, calculation or processing logic, UX, SEO and AI strategy, monetisation, analytics, implementation, tests, and meaningful risks. No implementation begins before `APPROVE PLAN`.

## BUILD

Implement the approved specification on an isolated branch, add tests and shared registry updates, run validation, and prepare a Preview. Do not deploy Production. End by awaiting `APPROVE REVIEW`.

## REVIEW

Review the complete diff and independently validate calculations, responsive behaviour, accessibility, security, privacy, metadata, indexing, analytics, commercial placement, related tools, and regressions. End by awaiting `APPROVE SHIP`.

## SHIP

After explicit `APPROVE SHIP`, verify branch, commit, checks, environments, rollback, canonical URL, indexing, sources, and secrets. Merge through GitHub, allow the connected Vercel project to deploy, then smoke-test the live URL and record the release.

GitHub controls approval and merge. Vercel executes deployments. Codex must never claim success without verifying the resulting state.
