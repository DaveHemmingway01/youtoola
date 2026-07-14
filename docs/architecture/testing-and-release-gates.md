# Testing and Release-Gate Architecture

Status: Phase 9 implementation candidate. This architecture governs evidence; automation never grants approval.

## Gate model

Youtoola uses six sequential gates: PLAN, BUILD, REVIEW, SHIP, POST-DEPLOYMENT and POST-LAUNCH REVIEW. `lib/release/validation.ts` is the machine-readable authority for their evidence, automated and manual checks, approver, failure behavior, permitted fixes, scope-change handling and report requirements. The Youtoola owner is the final approver. Material scope expansion returns to PLAN.

PLAN defines scope, additive risk tags, methods, sources, evidence and rollback. BUILD produces the smallest approved implementation, tests and candidate release record. REVIEW inspects the complete diff and risk-selected Preview evidence. SHIP verifies the exact approved head, checks and rollback before merge. POST-DEPLOYMENT verifies the Git-integrated Production deployment. POST-LAUNCH REVIEW evaluates the scheduled evidence and assigns owner-reviewed actions.

## Additive risk and evidence

A change carries one or more approved tags. Evidence requirements are the union of every tag, plus the platform baseline. Unknown or duplicate tags fail closed. `documentation-only` cannot be combined with a runtime or public-behavior tag. `high-consequence` requires `calculation-change`.

| Tag | Principal evidence |
| --- | --- |
| `documentation-only` | Diff, formatting, links, documentation validation and normal CI |
| `public-content` | Content, accessibility, SEO and Preview review |
| `visual-interface` | Components, browser flow, axe, responsive, keyboard and visual review |
| `platform-architecture` | Contracts, negative cases, public-boundary regressions and dependencies |
| `utility-logic` | Registry, methodology, sources, versions, pure logic, boundaries, invalid inputs, privacy, SEO and Production smoke plan |
| `calculation-change` | Formula, golden vectors, independent expected results, versions and owner approval |
| `metadata-indexing` | Metadata, crawler, structured data, Preview and Production smoke plan |
| `analytics-consent` | Payload, sensitive-data, environment, consent, storage, privacy and provider boundaries |
| `commercial-activation` | Free result, approvals, disclosure, legal/jurisdiction/consent, layout, claims, privacy, events, failure and deactivation |
| `security-privacy` | Audit, secrets, review, limits, serialization, prototype protection, environments, headers and redirects |
| `high-consequence` | Qualified independent review, scope, evidence and current authoritative sources |

Documentation-only work receives a reduced manual path only when it changes no runtime, rendered content, policy or public behavior. Normal CI still runs; Youtoola does not use fragile changed-file skipping while the repository is small.

## Test-layer ownership

- Static analysis owns types, lint and framework rules, not runtime behavior.
- Unit tests own pure calculations, conversions, rounding and validation, not layout.
- Contract tests own registries, relationships, SEO, analytics and release records, not full journeys.
- Component tests own labels, errors, focus and result announcements, not routing.
- Integration tests own important module boundaries, not every unit permutation.
- End-to-end tests own critical successful and invalid browser flows, not exhaustive calculation vectors.
- Browser accessibility owns axe, keyboard, focus, targets, zoom and motion; manual review owns screen-reader-sensitive judgment.
- Visual review owns hierarchy, clipping and trust; it does not demand pixel-identical rendering.
- Preview checks own deployment and non-indexing behavior; Production smoke owns the live release.
- Post-launch review owns field evidence, indexing, errors, freshness and, after Phase 11, product metrics.

## Utility and calculation integrity

Every utility requires approved registry status, risk, methodology, sources and calculation version; independently testable logic; boundary, invalid, negative, unit and rounding tests; accessible successful and invalid browser flows; privacy and analytics tests; SEO, sitemap and released-relationship checks; fixture isolation; Preview evidence; and Production smoke.

Calculation changes additionally require a written formula, assumptions, canonical units, rounding policy, independently derived expectations, boundary and regression vectors, calculation and methodology versions, source review and owner approval. A release remains blocked when the formula and methodology disagree, a source is stale or ambiguous, a tolerance hides a visible defect, expectations come only from the implementation under test, or required independent review is absent.

Data-dependent utilities define source dates, freshness and failure behavior. Financial, legal, health, regulated and other high-consequence utilities require current authoritative sources. Regulated and high-consequence utilities require a qualified independent reviewer; automation and owner approval alone are insufficient.

## Golden vectors and tolerances

Reviewed vectors live as data-only JSON at `tests/fixtures/utilities/<slug>/golden-vectors.json`. The contract records vector identity and purpose, raw and normalized scalar inputs, expected outputs, comparison mode, any tolerance, visible rounding, independent derivation, reviewer, review date, calculation version and jurisdiction where relevant.

Comparison modes are exact, integer, decimal tolerance, relative tolerance, categorical and formatted-output equality. Exact, integer, categorical and formatted comparisons cannot carry tolerance. Decimal and relative tolerances require a reason, displayed decimal precision, maximum error and distance to the nearest visible rounding boundary. Maximum error cannot exceed half the smallest displayed unit or reach a visible rounding boundary. Broad unspecific closeness checks are prohibited.

## Accessibility and browser coverage

WCAG 2.2 AA is the practical target. Inability to complete the primary task, serious or critical axe findings, missing accessible names, inaccessible errors, focus traps, broken focus restoration, missing or duplicate result announcements, contrast failures, clipping, overflow, 200-percent text failure, undersized targets and reduced-motion failures block release.

Chromium remains the normal CI browser. Automated viewports are 320 minimum width, 390×844, 430×932, 768×1024 and 1440×900. Targeted Firefox and Playwright WebKit review is required for public utilities, shared controls, clipboard/share changes, file APIs, major shell changes and browser-sensitive input behavior. iPhone Safari and Android Chrome receive manual smoke review before the first utility and when platform-specific behavior changes.

Temporary screenshots and diagnostics stay in ignored `test-results/`. Failed Playwright traces and screenshots may be retained briefly as GitHub artifacts. Visual evidence is committed only through a separate owner-approved exception. Pixel-perfect snapshots remain deferred because they create renderer noise and cannot replace visual judgment.

## SEO, privacy and commercial gates

Missing or duplicate titles/descriptions, missing H1, wrong canonical host, incorrect sitemap membership, Preview indexability, Production noindex, crawler regressions, soft 404s, unreleased metadata, unsupported or inconsistent structured data, breadcrumb mismatch, Vercel-host leakage and redirect defects block release.

Analytics evidence must prove unknown and sensitive fields fail closed, canonical identity is caller-inaccessible, Local and Preview transmit nothing, Production remains provider-disabled until approval, consent defaults unknown, no buffering or replay exists, no unapproved storage or sensitive URL state exists and privacy content matches behavior. Providers, consent, event fields, storage, retention, personal data and jurisdiction changes trigger re-review.

Commercial activation remains absent. Future activation requires the complete useful free result, approved capability/provider/placement, disclosure, legal/jurisdiction/consent review, no layout shift or sensitive targeting, truthful claims, privacy update, valid events, provider failure isolation, immediate deactivation and owner approval.

## Performance budgets

`PERFORMANCE_BUDGETS` is the code authority. Hard breaches block release unless the owner approves the supported `performance-hard-budget` exception with expiry and remediation. Next.js and React framework chunks are tracked as baseline rather than charged to utility code.

| Measure | Warning | Hard |
| --- | ---: | ---: |
| Public route-owned JS | any avoidable JS | 6 KB gzip |
| Utility island JS | 12 KB gzip | 16 KB gzip |
| Review route JS | 6 KB gzip | 6 KB / 6,144 bytes gzip |
| Global CSS | 10 KB gzip | 20 KB gzip |
| Route CSS | 10 KB gzip | 30 KB gzip |
| HTML | 75 KB raw | 125 KB raw |
| JSON-LD | 8 KB raw | 16 KB raw |
| Initial images | 250 KB transferred | 500 KB transferred |
| Event validation | 1 ms average | 2 ms average |
| Ordinary synchronous calculation | 16 ms | 50 ms |
| CLS | 0.05 | 0.10 |
| LCP | 2.0 s | 2.5 s |
| INP | 150 ms | 200 ms |

Unapproved third-party requests are always a hard failure. Measurement records the command, build or Preview commit, ownership (`framework`, `route` or `utility`), environment and reproducible value. Field evidence is separate from local or Preview lab evidence. A single noisy Lighthouse run warns; when Lighthouse is required, the median of three controlled Preview runs is compared with the existing 90 Performance and 95 Accessibility, Best Practices and SEO targets.

## Security and dependencies

Release evidence covers dependency audit, tracked-secret scan, bounded payloads and depth, safe serialization, prototype-pollution protection, environment validation, security headers, private debug routes, client-secret leakage, provider-response leakage and allowlisted redirects. Specialist security review is mandatory for authentication, payments, uploads, server file processing, webhooks, secret-bearing APIs, personal or sensitive data, executable formats, material integrations and new CSP exceptions.

Every dependency review records purpose, alternatives, runtime or development classification, bundle effect, licence, maintenance, transitive risk, update policy, necessity and removal path. Phase 9 adds no dependency.

## Severity and exceptions

Critical and High findings block merge and ship. Critical live failures require immediate containment or rollback and immediate owner notification. Material High live failures require containment or rollback and same-day notification. Medium exceptions require owner approval, expiry and normally seven-day remediation. Low findings use the next maintenance cycle. Informational findings do not block.

Qualified review, owner approvals, rollback, sensitive-data controls and Critical/High failures are not casually exceptionable. Supported exceptions are allowlisted, time-bounded and validated.
