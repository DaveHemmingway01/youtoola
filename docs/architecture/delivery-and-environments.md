# Delivery and Environment Architecture

Phase 10 standardises the path from an approved plan to Production without adding a deployment service, runtime package or public behaviour.

## Authority and topology

- GitHub owns branches, pull requests, required checks, review conversations and the squash merge to protected `main`.
- Vercel owns Git-connected Preview and Production builds. Only a merge to `main` may initiate the normal Production deployment.
- The Youtoola owner alone approves PLAN, REVIEW and SHIP, emergency rollback and hotfix use. Codex may build, validate and report evidence but cannot approve its own work.
- One repository maps to one Vercel project. Local, Preview and Production are the only environments; staging remains deferred.

Approved branch families are `platform/`, `utility/`, `docs/` and owner-authorised `hotfix/`. Branches start from current `origin/main`, contain one approved scope, and are retained after merge as provenance. Stacking is prohibited: a feature branch cannot use another unmerged feature branch as its source.

After the first push, do not force-push or rebase. Review inactive unmerged branches after 30 days; retention does not mean abandoned work stays indefinitely. Merged source branches remain throughout V1.

## Required checks and merge policy

Protected `main` requires a pull request, resolved conversations and the `Quality`, `End-to-end` and `Vercel` checks. `Vercel Preview Comments` is informational. Zero independent approvals remains appropriate while there is one maintainer, and administrator enforcement, force-push prohibition and deletion prohibition remain enabled.

Squash is the only normal merge method. Merge commits and rebase merges are disabled at repository level. A release record separately preserves the source branch, source commit, reviewed branch head and resulting durable squash commit.

GitHub Actions are pinned to full commit SHAs and reviewed quarterly. Pull-request runs may cancel superseded runs; `main` runs do not cancel so deployment evidence remains complete.

## Environment contract

Vercel's `VERCEL_ENV` is authoritative when present:

| Environment | Source | Indexing | Analytics/provider activation | Secrets |
| --- | --- | --- | --- | --- |
| Local | no `VERCEL_ENV`; optional `YOUTOOLA_ENV=local` | `noindex, nofollow`; robots disallow all | disabled | local-only, gitignored, least privilege |
| Preview | `VERCEL_ENV=preview` | authentication-protected and `noindex, nofollow`; robots disallow all | disabled | Preview-scoped only when approved |
| Production | `VERCEL_ENV=production` | canonical `www`, crawlable under crawler policy | only after Phase 11 approval | Production-scoped, least privilege |

An explicit `YOUTOOLA_ENV` that conflicts with `VERCEL_ENV` fails. Environment variables are classified as public configuration, server-only configuration or secrets. Secret names never use `NEXT_PUBLIC_`, and secret values never enter source, logs, evidence files, browser output or PR text.

## Delivery lifecycle

| Stage | Owner role | Durable evidence | Permitted actions | Prohibited actions | Failure response | Next boundary |
| --- | --- | --- | --- | --- | --- | --- |
| Local | Codex/operator | validation output and diff | implement approved scope | Production credentials or provider activation | fix locally | BUILD complete |
| Pull request | GitHub + owner | PR, source branch/commit, checks | review diff and resolve findings | direct `main` push or scope expansion | return to BUILD/PLAN | APPROVE REVIEW |
| Preview | Vercel + reviewer | deployment ID/commit/URL and protection checks | realistic review | indexing or Production integrations | block REVIEW | APPROVE SHIP |
| Merge | GitHub + owner | squash commit and retained branch | squash after explicit SHIP | force push or manual Production deploy | stop and contain | automatic Production deployment |
| Production | Vercel + operator | deployment ID/commit, smoke JSON, rollback target | verify only | `vercel --prod` or silent changes | contain/rollback | completed release record |
| Follow-up | owner | immediate, 24-hour, 7-day, 28-day, monthly and quarterly reviews | append factual results or correction records | mutate historic facts | correction PR or rollback | next approved phase |

Narrow `docs/<release-record-scope>` completion branches may update factual release evidence without opening a new application-release candidate. All other branches require a candidate record.

## Deployment and recovery

Preview deployments are reduced only through Vercel's existing changed-file behaviour; required checks still run and no custom deployment queue is introduced. Production smoke validation is package-free, origin-allowlisted and read-only. It verifies public and unavailable routes, redirects, canonicals, robots, sitemap, indexability, security headers and frozen brand bytes in human or JSON output.

The previous Ready Production deployment is the immediate rollback target. Restoration contains impact; a protected-main revert restores durable repository alignment. Backups are Git history, retained branches, GitHub release evidence, Vercel deployment history, the live Sheet plus reviewed registry fixture, and owner-controlled provider exports where applicable. Restore evidence is reviewed quarterly.

The current hosting baseline is one GitHub repository connected to one Vercel Hobby project, `main` as Production, automatic branch Previews, Next.js auto-detection, Node.js 22 and lockfile-controlled `npm ci`. GitHub Actions contain no Vercel credentials. The owner audits repository binding, Production branch, runtime, build/install commands, variable scopes, Preview protection, aliases, the deployment retention available on the current plan, access and billing quarterly.

Security patches receive prompt review. Routine dependency posture is reviewed quarterly. Major Next.js, React, Node, Playwright or Vitest changes use their own `platform/` branch with before/after build and bundle evidence, full regression, Preview, lockfile review and rollback plan.

## Deferred complexity

CODEOWNERS, non-owner approval counts, staging, custom deployment queues, workflow sharding, paid monitoring, deployment orchestration and provider activation wait for staffing or measured operational need.
