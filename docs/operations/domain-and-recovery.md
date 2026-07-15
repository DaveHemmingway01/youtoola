# Domain, Backup and Recovery Runbook

## Domain baseline

- Canonical Production origin: `https://www.youtoola.com`.
- `https://youtoola.com` permanently redirects with HTTP 308 to the canonical `www` URL.
- Preview aliases remain authentication-protected and noindexed.
- Domain/DNS changes require owner approval and factual before/after evidence.
- The Youtoola owner controls registrar account, Vercel domain/DNS administration, MFA, recovery contacts, renewal and billing. Vercel currently serves attached-domain routing and certificates.
- Verify certificate status and export DNS quarterly. Treat an unauthorised change as a Critical security incident; preserve provider evidence, restore approved records and rotate access.
- Future subdomains require a separate plan, ownership and indexing decision.

Permanent canonical or route migrations use HTTP 308; temporary operational moves use 307 unless separately justified. Redirects require an approved destination host, owner-approved record, effective date and retirement decision. Never propagate sensitive query data, accept an open destination, create a loop, or retain avoidable chains.

Preserve HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy and Permissions-Policy. CSP is deferred until Phase 11 establishes the external-script architecture. A later exception requires least privilege, tests, security review, owner approval and an expiry when temporary.

## Recovery order

1. Identify impact, active deployment ID/commit and last Ready rollback deployment.
2. For a Critical incident, notify the owner and restore the previous Ready Vercel deployment when that is the fastest safe containment.
3. Verify canonical and apex routing, indexing headers, robots, sitemap, security headers, public routes and frozen assets.
4. Revert the offending squash commit through protected `main` so source and Production realign.
5. Record timestamps, decisions, deployments, commits, smoke evidence and follow-up owner.

Do not change DNS during an application rollback unless domain evidence identifies DNS as the fault. Do not create a redirect loop or redirect `www` to apex.

## Backup inventory

| Asset | Primary recovery source | Check |
| --- | --- | --- |
| Source and documentation | GitHub `main` plus retained source branches | branch/ref and commit availability |
| Production build | Vercel deployment history | prior Ready deployment can be identified |
| Utility source truth | live Google Sheet and reviewed Git fixture/hash | literal tab/row retrieval and registry validation |
| Brand assets | Git and documented immutable hashes | all brand validators |
| Provider configuration/evidence | owner-controlled provider export where applicable | quarterly access and restore review |

Create an encrypted Git bundle, DNS export and configuration inventory quarterly; export the live Google Sheet periodically and before material source changes. Take fresh backups before material domain or provider changes. Conduct an annual recovery review. There is no database and therefore no database-backup system.

Quarterly review proves access and identifies recovery sources; it does not perform a destructive Production restore. Any real restore exercise requires owner approval and a safe test scope.
