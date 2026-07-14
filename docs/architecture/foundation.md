# Platform Foundation Architecture

## Scope

This document describes roadmap Phases 0 and 1 only. Phase 2 design-system work and all production utilities remain excluded.

## Application model

- One Next.js App Router application
- Strict TypeScript
- Server Components by default
- Static-first public rendering
- Small Client Component boundaries only when interaction requires them
- npm with a committed lockfile
- GitHub as source-control and approval authority
- One Vercel project for Preview and Production delivery

## Environment model

| Environment | Source | Indexing | Production analytics | Production secrets |
| --- | --- | --- | --- | --- |
| Local | Default outside Vercel, or `YOUTOOLA_ENV=local` | Blocked | Disabled | Unavailable |
| Preview | `VERCEL_ENV=preview`, or explicit preview override | Blocked | Disabled | Unavailable unless separately approved |
| Production | `VERCEL_ENV=production`, or explicit production override | Allowed for approved public routes | Eligible when an analytics provider is approved | Scoped in Vercel Production only |

`NODE_ENV=production` does not imply Youtoola Production. This prevents local production builds from accidentally enabling indexing or production integrations.

## Canonical-host policy

The canonical origin is `https://www.youtoola.com`. Both `www.youtoola.com` and `youtoola.com` are attached to the Youtoola Vercel project. Vercel permanently redirects the apex host to `www` with HTTP 308. Preview hosts never become canonical.

Canonical metadata is intentionally not environment-configurable. Local and Preview pages use the future Production URL while remaining protected by `noindex, nofollow`.

## Security baseline

The application removes the framework signature and sends baseline referrer, content-type, frame, and permissions headers. Local and Preview responses also send `X-Robots-Tag: noindex, nofollow`.

A content security policy will be introduced only after the script, asset, analytics, and monetisation requirements are known well enough to avoid a misleading or broken policy.

## Crawler foundation

Production `robots.txt` allows ordinary crawlers and `OAI-SearchBot`, explicitly disallows `GPTBot`, and references `https://www.youtoola.com/sitemap.xml`. Local and Preview `robots.txt` disallow every crawler in addition to the response-level `noindex, nofollow` protection.

The Phase 1 sitemap initially contained only the canonical homepage. Later approved phases own registry-driven sitemap composition, structured data and the wider SEO system without changing this crawler foundation.

## Merge checks

GitHub Actions runs a `Quality` check covering install, lint, type-check, unit tests, and Production build, plus an `End-to-end` browser check. Protected `main` also requires the connected Vercel check, pull requests, and resolved conversations. While the repository has one maintainer, zero independent approvals are required. Force-pushes and branch deletion are disabled.

## Deferred systems

The foundation contains no database, authentication, CMS, analytics provider, UI framework, graph database, AI service, public API, or production utility.
