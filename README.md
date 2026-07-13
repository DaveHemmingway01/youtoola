# Youtoola

Youtoola is one connected platform for practical online utilities.

> Useful tools. No account. No nonsense.

This branch implements only the approved platform governance and application foundation from Phases 0 and 1 of [`docs/ROADMAP.md`](docs/ROADMAP.md). It does not contain a production utility or the Phase 2 design system.

## Requirements

- Node.js 22
- npm 10 or newer

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

The environment file contains no required secrets. Leave `YOUTOOLA_ENV` empty for ordinary local development.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local Next.js development server. |
| `npm run lint` | Run ESLint across the repository. |
| `npm run typecheck` | Run strict TypeScript checks without emitting files. |
| `npm run test` | Run deterministic Vitest unit tests once. |
| `npm run test:watch` | Run Vitest in watch mode. |
| `npm run test:e2e` | Start the app and run Playwright browser tests. |
| `npm run build` | Create a production Next.js build. |
| `npm run start` | Serve the production build locally. |
| `npm run check` | Run lint, type-check, unit tests, and production build. |

Install the Playwright Chromium browser before the first end-to-end run:

```bash
npx playwright install chromium
```

## Architecture

- Next.js App Router with Server Components by default
- Strict TypeScript
- Static-first public pages
- CSS only for the Phase 1 foundation; the shared design system begins in Phase 2
- Local, Preview, and Production policies resolved through `lib/environment.ts`
- Canonical production host: `https://www.youtoola.com`
- Canonical metadata is fixed to the approved `www` origin in every environment
- Preview and local responses receive `X-Robots-Tag: noindex, nofollow`
- No database, authentication, CMS, analytics provider, UI framework, graph database, or AI service

See [`docs/architecture/foundation.md`](docs/architecture/foundation.md) and [`docs/decisions/`](docs/decisions/) for the approved decisions.

## Delivery

Feature work uses an isolated branch and pull request. GitHub controls review and merge authority; the connected Vercel project creates Preview deployments for non-production branches and Production deployments only from approved `main` commits.

Pull requests run the `Quality` and `End-to-end` GitHub Actions checks. Protected `main` also requires the Vercel deployment check. The owner must still review and approve the SHIP gate before merge.

Never place secrets in tracked files. `.env.example` documents names and purposes only.
