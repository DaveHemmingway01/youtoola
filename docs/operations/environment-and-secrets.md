# Environment and Secrets Runbook

## Classification

- Public configuration may be exposed deliberately and may use `NEXT_PUBLIC_` only after review.
- Server-only configuration contains non-secret operational values and must not enter client modules.
- Secrets are credentials, tokens, private keys and sensitive provider values. They are server-only, scoped to the minimum environment and never committed.

Vercel's `VERCEL_ENV` decides Preview versus Production. `YOUTOOLA_ENV` is a local override only; a conflict fails explicitly. Local defaults to Local.

## Handling rules

1. Document names and purpose only in `.env.example`.
2. Store local values in ignored files and hosted values in Vercel environment settings.
3. Give Preview no Production credentials. Keep analytics and commercial providers disabled until Phase 11 and their own approvals.
4. Never expose secret names through `NEXT_PUBLIC_`, client components, browser bundles, logs, test snapshots, release records, PRs or screenshots.
5. Run `npm run security:scan` and the client-boundary tests before review.
6. Rotate immediately after suspected exposure, revoke the old value, inspect history/logs/deployments and record a non-sensitive incident summary.
7. Review GitHub, Vercel and domain administrative access quarterly and rotate routine secrets annually.
8. Rotate immediately after exposure, maintainer role change, device loss or provider instruction. Avoid duplicating the same secret between GitHub and Vercel without a demonstrated requirement.

## Changes and ownership

The Youtoola owner holds GitHub, Vercel, environment, domain/DNS, deployment, rollback, hotfix and incident authority and owns secure credential storage, MFA and recovery. Codex may document an inventory by name, owner and environment scope and validate absence of leakage, but does not reveal or copy secret values. Environment-setting changes require their own factual release evidence and rollback plan.

Configuration is build-time unless a documented server runtime consumer requires otherwise. Missing optional provider configuration disables that provider; malformed or partially supplied configuration fails rather than silently changing environment or privacy behaviour.

For Growth Activation, `YOUTOOLA_ANALYTICS_ENABLED` and `YOUTOOLA_GA4_MEASUREMENT_ID` are Production-only build configuration. They remain absent in Local and Preview and unset throughout BUILD and REVIEW. The owner may add both immediately before separately approved exact-head SHIP; setting either earlier is an uncontrolled activation race. Disabling or removing both is the first analytics-containment action.
