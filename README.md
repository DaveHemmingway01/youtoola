# Youtoola

Youtoola is one connected platform for practical online utilities.

> Useful tools. No account. No nonsense.

The repository contains the approved platform foundation and shared design system. Phase 3 adds a Git-controlled utility registry and developer-only live opportunity retrieval; it does not contain a production utility.

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
| `npm run utility:read -- --tab "Travel & Mobility" --row 5` | Read one literal visible Google Sheets row through the public V1 workflow. |
| `npm run utility:read:live` | Manually verify the approved Fuel Trip Calculator source fixture. |
| `npm run registry:validate` | Validate registry identities, sources, relationships and release rules. |
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
- A small CSS-token design system with Server Components by default
- One focused Client Component boundary for the compact mobile navigation
- Local, Preview, and Production policies resolved through `lib/environment.ts`
- Canonical production host: `https://www.youtoola.com`
- Canonical metadata is fixed to the approved `www` origin in every environment
- Preview and local responses receive `X-Robots-Tag: noindex, nofollow`
- No database, authentication, CMS, analytics provider, UI framework, graph database, or AI service
- Public Google GViz retrieval is developer tooling only; Production uses reviewed TypeScript registry records from Git

See [`docs/architecture/foundation.md`](docs/architecture/foundation.md) and [`docs/decisions/`](docs/decisions/) for the approved decisions.

The component and brand-usage rules are documented in [`docs/architecture/design-system.md`](docs/architecture/design-system.md) and [`docs/brand/USAGE.md`](docs/brand/USAGE.md). The `/design-system-review` route is available only in Local and Preview, is explicitly `noindex, nofollow`, and returns 404 in Production.

Sheet retrieval and registry governance are documented in [`docs/architecture/utility-registry.md`](docs/architecture/utility-registry.md) and [`docs/operations/utility-registry.md`](docs/operations/utility-registry.md). An `idea` registry record is not a route and cannot appear in public discovery.

## Delivery

Feature work uses an isolated branch and pull request. GitHub controls review and merge authority; the connected Vercel project creates Preview deployments for non-production branches and Production deployments only from approved `main` commits.

Pull requests run the `Quality` and `End-to-end` GitHub Actions checks. Protected `main` also requires the Vercel deployment check. The owner must still review and approve the SHIP gate before merge.

Never place secrets in tracked files. `.env.example` documents names and purposes only.
