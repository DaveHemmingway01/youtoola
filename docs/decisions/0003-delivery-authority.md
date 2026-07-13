# ADR 0003: Delivery and release authority

- Status: Accepted
- Date: 2026-07-13

## Decision

GitHub owns source control, review, and merge authority. Vercel owns Preview and Production deployment execution through the connected repository.

- Feature branches and pull requests create Preview deployments.
- The protected `main` branch is the only automatic Production source.
- Pull requests must pass the repository `Quality`, `End-to-end`, and Vercel checks.
- Pull requests and resolved conversations are required.
- Zero independent approvals are required while the repository has one maintainer.
- Force-pushes and branch deletion are disabled for `main`.
- Production requires the repository's PLAN, BUILD, REVIEW, and SHIP approvals.
- Manual `vercel --prod` delivery is prohibited without explicit owner approval.

## Rationale

The split provides an auditable path from approved intent to a verified deployment while preventing unreviewed or environment-specific changes from reaching Production.

## Consequences

- This foundation branch opens a pull request and is not merged by Codex.
- The approving-review count must be reconsidered when a second maintainer is available.
- Vercel project linking and Production configuration remain owner-controlled.
- A documented rollback target is required before a Production release.
