# Dependency Review Policy

Before adding a runtime, development, or paid dependency:

1. Confirm the browser, Node.js, Next.js, or current repository does not already provide the capability.
2. State the user, acquisition, commercial, quality, or operational benefit.
3. Review install size, client bundle impact, runtime cost, maintenance activity, security history, licence, and replacement difficulty.
4. Prefer a small focused package over a framework when requirements are narrow.
5. Require owner approval for paid services and major production dependencies.
6. Pin intentional versions and commit the npm lockfile.
7. Remove unused dependencies promptly.

## Phase 1 dependency decision

| Dependency | Role | Why required now |
| --- | --- | --- |
| `next`, `react`, `react-dom` | Application runtime | Required for the approved App Router foundation. |
| `typescript`, React/Node type packages | Type safety | Required for strict TypeScript and framework declarations. |
| `eslint`, `eslint-config-next` | Static quality checks | Required for deterministic lint validation. |
| `vitest` | Unit tests | Required for fast deterministic environment-policy tests. |
| `@playwright/test` | Browser tests | Required for the approved end-to-end command and local-start verification. |

No runtime service, UI library, database, authentication, CMS, analytics, graph, or AI dependency is approved in Phase 1.

## Phase 2 testing dependency decision

Verified against the npm registry on 2026-07-13. All four packages are pinned development dependencies and add no Production client code.

| Dependency | Licence | Role | Why required now |
| --- | --- | --- | --- |
| `@testing-library/react@16.3.2` | MIT | Component rendering and semantic queries | Verifies reusable controls through the roles and labels users experience. |
| `@testing-library/user-event@14.6.1` | MIT | Realistic keyboard and pointer interaction | Verifies disclosure focus return and future form interaction without implementation-specific tests. |
| `jsdom@29.1.1` | MIT | DOM environment for Vitest | Runs component accessibility contracts without launching a browser for every unit test. |
| `@axe-core/playwright@4.12.1` | MPL-2.0 | Automated accessibility scanning | Blocks serious and critical accessibility regressions on the rendered review route. |

The browser, framework, and existing test packages do not provide equivalent semantic component testing or automated accessibility rules. These focused packages are replaceable, have no paid or runtime service cost, and passed `npm audit` at installation.

## Phase 3 dependency decision

Phase 3 adds no package. Public Sheet retrieval uses Node 22 `fetch`, CSV parsing is repository-owned, source hashing uses `node:crypto`, registry records use TypeScript, and validation uses the existing Vitest installation. The Google API client, CSV libraries, schema libraries, databases and graph packages are not justified for the approved public GViz V1 workflow.

This adds no browser bundle, Production service, credential, paid cost or runtime dependency. Credentialed Google Sheets API access remains deferred until public access is removed or stronger metadata becomes a demonstrated requirement.

## Phase 4 dependency decision

The Repository Knowledge Layer adds no package. Typed repository records, selectors and validation use TypeScript, Node.js and the existing Vitest installation. A graph library, database, ORM, schema framework, search service or external API would add cost and maintenance without solving a demonstrated V1 constraint.

Phase 4 adds no client dependency, Production service, credential or paid operating cost.

## Phase 5 dependency decision

The public discovery layer adds no package. Static Server Components, typed repository selectors, metadata routes, CSS Modules and the existing Vitest and Playwright setup satisfy the approved homepage, directory, sitemap, accessibility and responsive requirements.

Phase 5 adds no search library, hosted search, client state framework, database, CMS, analytics provider, consent provider, third-party script or paid service. Search remains deferred until three released utilities justify a small native client-side island.

## Phase 6 dependency decision

Phase 6 adds no package. Explicit React forms, handwritten TypeScript validation, native `Number`, integer minor units, `Intl.NumberFormat`, browser Clipboard support and the existing Vitest, Testing Library and Playwright setup satisfy the approved utility framework.

Zod, form libraries, decimal libraries, date libraries, sharing/export libraries and analytics providers are not justified without a specific utility requirement. This adds no runtime service, licence, bundle, lockfile or paid operating cost.
