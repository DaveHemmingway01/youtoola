# ADR 0002: Canonical host and environments

- Status: Accepted
- Date: 2026-07-13

## Decision

Use `https://www.youtoola.com` as the canonical production origin. Configure the apex domain to redirect permanently to `www` when domain delivery is implemented.

Maintain three environments: Local, Vercel Preview, and Vercel Production. Only Production may enable public indexing or approved production integrations.

## Rationale

One canonical host consolidates search signals. Explicit environments prevent test traffic, preview URLs, and local production builds from being mistaken for Production.

## Consequences

- Preview and Local responses send `noindex, nofollow`.
- Preview URLs are excluded from production sitemaps.
- Production secrets are never required locally or exposed through public variables.
- `NODE_ENV` is not used to grant Production authority.
