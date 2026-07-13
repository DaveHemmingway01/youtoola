# ADR 0001: Platform stack

- Status: Accepted
- Date: 2026-07-13

## Decision

Use one Next.js App Router application with strict TypeScript, React Server Components by default, static-first rendering, npm, and one committed `package-lock.json`.

CSS remains minimal in Phase 1. No UI framework or component library is introduced before Phase 2.

## Rationale

This combination provides crawlable HTML, low client-side JavaScript, strong type contracts, direct Vercel support, and a small operational surface.

## Consequences

- Node.js 22 is the initial development runtime.
- Dependencies require explicit review.
- Interactivity must be isolated in small Client Components.
- Database, authentication, CMS, analytics, graph, and AI dependencies remain deferred.
