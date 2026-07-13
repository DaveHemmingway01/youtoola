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
