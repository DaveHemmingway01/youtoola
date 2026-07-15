# Youtoola

Youtoola is one connected platform for practical online utilities.

> Useful tools. No account. No nonsense.

The repository contains the approved platform foundation, shared design system, canonical registry, Repository Knowledge Layer, released-only public discovery layer, and reusable utility framework. It does not yet contain a production utility.

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
| `npm run test:e2e:cross-browser` | Run the targeted Chromium, Firefox and WebKit review suite when the approved risk policy requires it. |
| `npm run validate` | Run the complete offline pre-review validation suite. |
| `npm run validate:architecture` | Validate registry, Knowledge Layer, SEO, Phase 8 and release architecture. |
| `npm run validate:delivery` | Validate branch, environment, schema-v3 release, correction and follow-up delivery contracts. |
| `npm run validate:growth` | Validate dormant consent, analytics, dashboard and monitoring definitions. |
| `npm run validate:release -- --record=<path>` | Validate one release record, or all records when no path is supplied. |
| `npm run smoke:production` | Run the package-free, read-only Production route, SEO, header and frozen-brand smoke suite. |
| `npm run smoke:growth` | Run the package-free Growth Foundation Production smoke suite. |
| `npm run validate:utility -- --slug=<slug>` | Validate a future utility definition, specification and golden vectors. |
| `npm run security:scan` | Scan tracked files for committed environment files and high-confidence secret signatures. |
| `npm run security:audit` | Run the offline high/critical dependency audit used by normal CI. |
| `npm run utility:read -- --tab "Travel & Mobility" --row 5` | Read one literal visible Google Sheets row through the public V1 workflow. |
| `npm run utility:read:live` | Manually verify the approved Fuel Trip Calculator source fixture. |
| `npm run registry:validate` | Validate utility registry identities, sources and release rules. |
| `npm run knowledge:validate` | Validate Repository Knowledge Layer entities, journeys, relationships and public boundaries. |
| `npm run build` | Create a production Next.js build. |
| `npm run start` | Serve the production build locally. |
| `npm run check` | Run lint, type-check, unit tests, and production build. |

Install the Playwright Chromium browser before the first end-to-end run:

```bash
npx playwright install chromium
```

Install Firefox and WebKit only when a targeted cross-browser review is required:

```bash
npx playwright install firefox webkit
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
- Public pages consume one immutable released-only discovery model; internal registry and Knowledge Layer fields do not enter pages or client bundles
- The homepage and permanent `/tools` directory are static Server Components; category, journey, search and utility routes remain unavailable until their approved release gates pass
- Future utilities use explicit forms, pure calculation modules, typed handwritten validation, browser-local processing and a Server Component page shell
- Inputs are not persisted, transmitted, added to URLs or sent to analytics by the Phase 6 framework
- Phase 8 analytics, experiment, and commercial contracts validate offline; run `npm run architecture:validate`
- No analytics or commercial provider is configured, and Local, Preview, and Production emit no Phase 8 events
- Phase 9 release contracts select evidence through additive risk tags; validated JSON release records and data-only golden vectors fail closed without approving a release

See [`docs/architecture/foundation.md`](docs/architecture/foundation.md) and [`docs/decisions/`](docs/decisions/) for the approved decisions.

The component and brand-usage rules are documented in [`docs/architecture/design-system.md`](docs/architecture/design-system.md) and [`docs/brand/USAGE.md`](docs/brand/USAGE.md). The `/design-system-review` route is available only in Local and Preview, is explicitly `noindex, nofollow`, and returns 404 in Production.

Sheet retrieval and registry governance are documented in [`docs/architecture/utility-registry.md`](docs/architecture/utility-registry.md) and [`docs/operations/utility-registry.md`](docs/operations/utility-registry.md). An `idea` registry record is not a route and cannot appear in public discovery.

The Repository Knowledge Layer is documented in [`docs/architecture/repository-knowledge-layer.md`](docs/architecture/repository-knowledge-layer.md). Phase 4 adds repository data and selectors only; it creates no public discovery surface.

The Phase 5 route and publication policies are documented in [`docs/architecture/discovery-layer.md`](docs/architecture/discovery-layer.md) and [`docs/operations/discovery-publication.md`](docs/operations/discovery-publication.md). `/tools` is permanent, while category and journey routes remain fail-closed until their thresholds and owner-approved content exist.

The Phase 6 calculator boundaries and future four-file utility contract are documented in [`docs/architecture/utility-framework.md`](docs/architecture/utility-framework.md) and [`docs/operations/utility-framework.md`](docs/operations/utility-framework.md). The neutral example extends the existing Local/Preview review route; Fuel Trip Calculator remains an isolated test fixture and `idea` registry record.

Phase 7 SEO, entity, trust, canonical, sitemap and crawler governance is documented in [`docs/architecture/seo-entity-discoverability.md`](docs/architecture/seo-entity-discoverability.md) and [`docs/operations/seo-governance.md`](docs/operations/seo-governance.md). Public trust routes are `/about`, `/methodology` and `/privacy`; `/accessibility` remains reserved until a real public feedback method is approved.

Phase 9 testing, release evidence, severity, flaky-test and rollback governance is documented in [`docs/architecture/testing-and-release-gates.md`](docs/architecture/testing-and-release-gates.md), [`docs/operations/release-validation.md`](docs/operations/release-validation.md) and [`docs/operations/rollback.md`](docs/operations/rollback.md). It adds no public route or Production behavior.

Phase 10 delivery authority, branch rules, environment separation, schema-v3 evidence, deployment, secrets, domain and recovery operations are documented in [`docs/architecture/delivery-and-environments.md`](docs/architecture/delivery-and-environments.md), [`docs/decisions/0013-delivery-and-deployment-operations.md`](docs/decisions/0013-delivery-and-deployment-operations.md) and [`docs/operations/deployment.md`](docs/operations/deployment.md). It adds no public route, dependency or provider.

## Delivery

Feature work uses an isolated branch and pull request. GitHub controls review and merge authority; the connected Vercel project creates Preview deployments for non-production branches and Production deployments only from approved `main` commits.

Pull requests run the `Quality` and `End-to-end` GitHub Actions checks. Protected `main` also requires the Vercel deployment check; Preview Comments is informational. The owner must still review and approve the SHIP gate before the squash-only merge. Retain source branches and never stack approved work on an unmerged feature branch.

Never place secrets in tracked files. `.env.example` documents names and purposes only.
