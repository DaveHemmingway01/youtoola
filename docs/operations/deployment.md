# Deployment Runbook

## Normal release

1. Update `origin/main`; create an approved branch family from it and confirm no unmerged feature ancestry.
2. Create a schema-v3 candidate release record with owner-approved PLAN evidence and current Ready rollback deployment.
3. Run `npm run validate`, the risk-selected browser checks, current `npm audit`, and `git diff --check`.
4. Push and open a draft pull request. Required checks are `Quality`, `End-to-end` and `Vercel`; Preview Comments is informational.
5. Verify the exact branch Preview is Ready, authentication-protected, noindexed, uses Production canonicals, and contains no Production-only provider activity.
6. After owner REVIEW approval, record the reviewed branch head and resolve all conversations.
7. After explicit `APPROVE SHIP`, verify checks, source, rollback and secrets; squash merge through GitHub.
8. Let Vercel deploy from `main`. Never use `vercel --prod` in the normal path.
9. Run `npm run smoke:production` and retain its JSON output with deployment ID, commit and rollback evidence.
10. Complete factual Production evidence in a small documentation-only PR. Never invent pending review results.

## Preview verification

Record the Vercel deployment ID, commit, unique URL and branch alias. Confirm authentication protection, `X-Robots-Tag: noindex, nofollow`, crawler denial, Production canonical values, expected routes and no Production integrations. A stale or missing alias is a deployment/configuration incident, not automatically an application defect; inspect the active alias target first.

## GitHub Actions pins

| Action | Version | Full commit SHA |
| --- | --- | --- |
| `actions/checkout` | `v7.0.0` | `9c091bb21b7c1c1d1991bb908d89e4e9dddfe3e0` |
| `actions/setup-node` | `v6.5.0` | `249970729cb0ef3589644e2896645e5dc5ba9c38` |
| `actions/upload-artifact` | `v4.6.2` | `ea165f8d65b6e75b540449e92b4886f43607fa02` |

The Youtoola owner reviews upstream releases and security advisories quarterly. Change a pin only in an approved platform branch, confirm the tag resolves to the recorded SHA, inspect the action diff/release notes and run the complete CI/Preview path. Do not add a third-party Action without a dependency and security justification.

## Smoke commands

```bash
npm run smoke:production
npm run smoke:production -- --json
```

The command is read-only, accepts only the approved canonical and apex origins, uses bounded requests and exits nonzero for route, redirect, canonical, indexing, crawler, sitemap, header or frozen-brand failures.

## Documentation-only release completion

Use a branch such as `docs/phase-10-release-record` from current `origin/main`. Limit the diff to release records, release validation and directly related documentation/tests. It is exempt from a second application candidate record because it completes an existing release; it still requires the normal PR, checks and explicit SHIP approval.

## Emergency boundary

Only the owner may authorise `hotfix/` or rollback. Hotfixes still use a PR, required checks and a release record unless the site is actively unsafe or unavailable. Emergency containment never authorises force-pushes, secret disclosure or unrecorded Production mutation.

An authorised hotfix is reserved for Critical or High impact, starts from current `origin/main`, is the smallest viable correction, retains its branch and preserves exact-head review, required checks, owner SHIP, Production smoke and release evidence. Record a root-cause follow-up.

## Non-code Production changes

Environment variables, provider activation, domains, Preview protection, redirects, analytics, consent and commercial providers follow the same control path: approved plan; named owner; exact proposed change; candidate record; rollback method; owner SHIP; controlled external change; verification; factual completion record; scheduled reviews. Phase 10 performs none of these changes.

## Failed delivery

- Failed local build or required check: do not review or merge; correct on the source branch.
- Failed Vercel deployment: keep Production unchanged; identify the build/configuration cause and produce a new exact-head Preview.
- Ready deployment with failed Preview verification: block REVIEW and correct the application or Vercel setting through approved scope.
- Production deployment/commit mismatch: block completion, restore the previous Ready deployment if exposed, and investigate Git integration before another SHIP.
- Ready Production with failed smoke: classify severity and use the two-layer rollback in `rollback.md`.
