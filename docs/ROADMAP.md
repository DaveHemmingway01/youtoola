# Youtoola Platform Implementation Roadmap

Status: Proposed architecture for owner approval  
Repository state at preparation: Greenfield; root `AGENTS.md` plus no application code  
Canonical production host: `https://www.youtoola.com`  
Product promise: **Useful tools. No account. No nonsense.**  
Commercial model: **The utility attracts the user. The traffic is monetised.**

Binding release principle: **No public utility launches without measurement, indexing controls and conversion tracking.**

## 1. Purpose and decision framework

This roadmap defines the implementation order for building Youtoola as one fast, trustworthy and compounding utility platform containing many practical utilities at canonical root paths such as `/fuel-trip-calculator`.

Youtoola is not a directory of isolated tools. Each released utility adds reusable product knowledge, search evidence, relationship data, calculation patterns, audience insight and commercial learning that should improve the platform, the utility factory and future utility selection.

Every phase must improve or protect at least one of these outcomes without materially damaging the others:

1. organic search and AI-search acquisition
2. fast time to first useful result
3. utility start and completion rates
4. calculation or processing accuracy
5. user trust, accessibility and privacy
6. repeat use, sharing and related-tool navigation
7. relevant advertising, affiliate, lead or premium revenue
8. low operating cost and maintainable portfolio growth

Technical sophistication is not an outcome. Youtoola will remain one repository, one product, one visual system and one primary deployment unless measured requirements justify expansion.

### Mandatory milestone sequence

1. Brand Foundation v1 merged
2. Phase 2, Design System
3. Registry and Google Sheet integration
4. Homepage, categories and search
5. Utility framework
6. Growth Infrastructure
7. Utility #1 plan, build, review and ship

The repository knowledge graph, SEO and AI-discoverability architecture, analytics contracts, testing gates and delivery controls remain required supporting work within this sequence. They are not optional phases and are not removed by this milestone summary.

## 2. Architectural principles

- **Static-first:** Pre-render public pages and core explanatory content. Add client JavaScript only for interaction.
- **One platform:** Utilities share navigation, design tokens, page structure, analytics, SEO, monetisation and release controls.
- **Isolated logic:** Each calculator or processor owns a pure, independently testable engine separated from presentation.
- **Registry-driven:** Homepage, directory, categories, search, related tools, sitemap and metadata derive from one canonical production registry.
- **Sheet-informed, repository-released:** The Google Sheet supplies live product opportunities. Approved specifications and code in Git are the production truth for released utilities.
- **Connected by meaning:** Utilities are related through user decisions, formulas, inputs, outputs, intent and commercial journeys, not category membership alone.
- **Learning by release:** Search, completion, retention, freshness, support and monetisation evidence is reviewed and stored so every release can improve later decisions.
- **Progressive infrastructure:** No database, authentication, queue, CMS, public API or separate service until a validated utility requires it.
- **Privacy by default:** Prefer local browser processing, anonymous events and no collection of sensitive input values.
- **Commercial relevance:** Deliver the free result first; monetisation must be contextual, labelled and non-destructive.
- **Evidence over scale:** Do not mass-publish weak pages. Every utility passes commercial, search, quality and release gates.

### Repository as production intelligence

Youtoola uses simple systems with distinct responsibilities:

| System | Authoritative role | Explicit boundary |
| --- | --- | --- |
| Google Sheet | Opportunity backlog and planning trigger | It does not automatically change released products. |
| Approved specifications in Git | Product truth for what an approved utility must do | They change only through review and approval. |
| Production registry | Discovery truth for released and scheduled utilities, relationships, journeys and canonical URLs | It is validated and version-controlled, not fetched live at runtime. |
| Application code and fixtures | Calculation, processing and interface truth | Numerical results do not come from analytics or AI generation. |
| Analytics, Search Console and Bing data | Evidence about acquisition, completion, continuation and commercial performance | Evidence informs decisions but does not mutate production automatically. |
| Repository findings and decision records | Durable lessons that improve prioritisation and the utility factory | Raw personal input is never stored as product intelligence. |

This separation makes the repository a production-intelligence system without requiring a database, warehouse or complex data platform in V1.

## 3. Target technology stack

| Layer | V1 choice | Reason |
| --- | --- | --- |
| Application | Next.js App Router | Supports static generation, server rendering, metadata routes and Vercel deployment in one application. |
| Language | TypeScript in strict mode | Protects shared contracts and calculation inputs as the utility portfolio grows. |
| Rendering | Server Components by default; small Client Component islands | Produces crawlable HTML and limits client JavaScript. |
| Styling | CSS custom properties plus CSS Modules | Provides a shared design system without a UI framework or runtime styling cost. |
| Data validation | Typed schemas; evaluate Zod during foundation setup | One shared validation contract is valuable, but a dependency should be accepted only after bundle and maintenance review. |
| Registry and relationship model | Version-controlled TypeScript or JSON generated from validated records | Enables deterministic builds, meaningful utility connections and fast reads without a database or graph database. |
| Unit tests | Vitest | Fast pure-function and component-level testing. |
| Component tests | Testing Library | Tests accessible user behaviour instead of implementation details. |
| End-to-end tests | Playwright | Covers mobile, desktop, metadata and critical user journeys in real browsers. |
| Accessibility | axe integrated with Playwright plus manual checks | Automates common violations while retaining keyboard and screen-reader review. |
| Quality | ESLint, TypeScript, formatting and production build checks | Creates repeatable merge gates. |
| Hosting | One Vercel project connected to GitHub | Provides Preview and Production environments with minimal operational burden. |
| Analytics | GA4 as the initial Production provider behind a provider-neutral event adapter; Local and Preview disabled | Measures acquisition, completion and conversion without hard vendor coupling or non-production data pollution. Microsoft Clarity remains optional and disabled unless separately approved after privacy review. |
| Error reporting | Structured, redacted application errors first | Avoids a paid observability service until traffic or failure cost justifies one. |

Vercel's commercial plan becomes a justified operating cost when production monetisation begins. No other paid service is assumed by this roadmap.

## 4. Target repository structure

```text
/
├── AGENTS.md
├── CHANGELOG.md
├── README.md
├── package.json
├── next.config.ts
├── tsconfig.json
├── .env.example
├── .github/
│   ├── workflows/
│   ├── CODEOWNERS
│   └── pull_request_template.md
├── app/
│   ├── (platform)/
│   │   ├── page.tsx
│   │   ├── about/
│   │   ├── methodology/
│   │   ├── privacy/
│   │   ├── categories/[category]/
│   │   └── search/
│   ├── (utilities)/
│   │   └── <canonical-slug>/page.tsx
│   ├── layout.tsx
│   ├── robots.ts
│   └── sitemap.ts
├── components/
│   ├── design-system/
│   ├── forms/
│   ├── navigation/
│   ├── monetisation/
│   ├── seo/
│   └── tools/
├── data/
│   ├── categories.ts
│   ├── concepts.ts
│   ├── entities.ts
│   ├── journeys.ts
│   ├── relationships.ts
│   └── tools/
│       ├── registry.ts
│       └── generated/
├── lib/
│   ├── analytics/
│   ├── calculations/
│   ├── environment/
│   ├── formatting/
│   ├── monetisation/
│   ├── search/
│   ├── seo/
│   ├── units/
│   └── validation/
├── utilities/
│   └── <canonical-slug>/
│       ├── definition.ts
│       ├── calculation.ts
│       ├── schema.ts
│       ├── content.ts
│       └── calculation.test.ts
├── docs/
│   ├── ROADMAP.md
│   ├── VISION.md
│   ├── architecture/
│   ├── decisions/
│   ├── intelligence/
│   ├── operations/
│   ├── research/
│   └── utilities/
├── scripts/
│   ├── read-youtoola-utility.ts
│   ├── validate-registry.ts
│   └── scaffold-utility.ts
├── public/
│   └── brand/
└── tests/
    ├── accessibility/
    ├── e2e/
    ├── fixtures/
    ├── performance/
    └── seo/
```

Route groups must not alter public URLs. Every utility remains at `/<canonical-slug>`.

## 5. Implementation phases

Complexity uses `Low`, `Medium`, `High` and `Very High`. It describes implementation and coordination difficulty, not elapsed time.

### Phase 0 — Governance, architecture decisions and baseline

**Objective**

Convert the operating rules in `AGENTS.md` into a small set of approved architectural decisions, quality gates and ownership rules before application setup.

**Why it matters**

Early decisions about canonical URLs, environments, registry ownership and release authority affect every page. Resolving them once prevents fragmented implementations, SEO migrations and commercial rework.

**Dependencies**

- Owner approval of this roadmap
- Access to the GitHub repository and intended Vercel account
- Authoritative owner-approved Youtoola visual references, reproduction rights, and an approved asset-factory plan

**Estimated complexity:** Low

**Expected business value:** High — prevents expensive rework and establishes consistent acquisition and monetisation standards.

**Implementation work**

1. Create `docs/VISION.md` as an owner-reviewed doctrine covering utility-led traffic monetisation, **Useful tools. No account. No nonsense.**, the Swiss Army knife platform concept, user value before monetisation, organic and AI-search acquisition, one connected platform, knowledge relationships, commercial journeys, continuous learning, privacy, trust, speed, accuracy and low-cost global scale.
2. Record decisions for the canonical `www` host, Next.js stack, package manager, GA4 as the initial Production analytics provider behind the provider-neutral adapter, GPTBot policy and Vercel plan. Require Local and Preview analytics to remain disabled, and prohibit sensitive inputs or personal data from analytics payloads.
3. Define PLAN, BUILD, REVIEW and SHIP checklists as repository documentation and PR controls.
4. Establish definitions for utility start, completion, share, related-tool click and revenue events.
5. Define commercial scorecard ownership and minimum evidence for `BUILD NOW`.
6. Produce and owner-approve the minimum production logo package from authoritative references before interface work.
7. Plan removal of the empty root `ROADMAP.md` after owner approval, leaving `docs/ROADMAP.md` as the sole roadmap. Do not delete it as part of this revision.

**Exit criteria**

- Required decisions are approved and recorded.
- `docs/VISION.md` is owner-approved and consistent with `AGENTS.md` and this roadmap.
- No unresolved decision blocks application scaffolding.
- Product and technical success metrics have unambiguous definitions.
- The empty duplicate roadmap has an approved cleanup action before application scaffolding.

### Phase 1 — Application foundation and development standards

**Objective**

Create the smallest production-capable Next.js and TypeScript foundation with deterministic local builds and quality commands.

**Why it matters**

A reliable foundation shortens every later utility build. Static-first rendering and strict typing directly support crawlability, page speed, accuracy and maintainability.

**Dependencies**

- Phase 0 decisions
- Approved package additions

**Estimated complexity:** Medium

**Expected business value:** High — creates the reusable delivery base for the entire portfolio.

**Implementation work**

1. Scaffold one Next.js App Router application with strict TypeScript.
2. Add lint, type-check, unit-test, end-to-end-test and production-build commands.
3. Add Local, Preview and Production environment helpers with safe defaults.
4. Define server-only and public variable conventions in `.env.example`.
5. Add baseline security headers, error boundaries, not-found handling and minimal logging.
6. Establish dependency review rules covering bundle size, licence, security and maintenance.
7. Add README setup instructions and architecture overview.

**Exit criteria**

- A clean checkout installs and builds deterministically.
- Empty platform routes render with minimal client JavaScript.
- Lint, type-check and baseline tests pass locally.
- No secret or production-only behaviour is required for local development.

### Phase 2 — Shared design system and platform shell

**Objective**

Build one accessible Youtoola visual language and responsive application shell before creating utility-specific interfaces.

**Why it matters**

Consistent controls and page structure improve trust and completion while avoiding separate visual systems. Reusable primitives reduce implementation and accessibility defects across every utility.

**Dependencies**

- Phase 1 foundation
- Completed and owner-approved minimum production brand package

**Estimated complexity:** Medium

**Expected business value:** High — improves trust, conversion and production speed for all pages.

**Implementation work**

1. Define tokens for colour, typography, spacing, radii, shadows, focus, motion and responsive breakpoints.
2. Build semantic primitives: button, link, card, field, label, input, select, checkbox, radio, alert, disclosure and dialog only where needed.
3. Build Youtoola header, footer, breadcrumbs and skip navigation.
4. Establish 44-by-44-pixel tap targets, visible focus, reduced motion and large-text behaviour.
5. Document component states and usage rules in a lightweight in-repository reference page; do not add a separate design-system application in V1.
6. Test contrast and keyboard behaviour at the required mobile, tablet and desktop sizes.

**Exit criteria**

- Platform shell meets WCAG 2.2 AA expectations for implemented components.
- Components support error, disabled, loading and success states.
- No utility-specific colour or typography system is needed.

### Phase 3 — Google Sheet retrieval and canonical utility registry

**Objective**

Create deterministic retrieval of an exact live Sheet tab and visible row, then maintain one validated production registry for approved and released utilities.

**Why it matters**

The Sheet controls opportunity selection; the registry controls production discovery. Separating those responsibilities prevents accidental live changes while enabling the homepage, categories, search, SEO and internal links to share one source.

**Dependencies**

- Phase 1 scripts and environment conventions
- Read access to spreadsheet `1BJtHQKH6MxAySfQ0C-mGrCgXdAD1efM2vIf5iDwqzpU`

**Estimated complexity:** Medium

**Expected business value:** Very High — turns the opportunity backlog into a repeatable, low-error utility factory.

**Implementation work**

1. Implement `scripts/read-youtoola-utility.ts --tab "<TAB>" --row <ROW>` using literal 1-based visible rows.
2. Retrieve spreadsheet metadata first and reject unknown or ambiguous tabs.
3. Return normalized JSON containing spreadsheet title, tab, sheet ID, row, utility ID, name, core use, monetisation, priority and every available source field.
4. Reject empty, malformed or conflicting rows; never substitute nearby records.
5. Define a typed registry record containing ID, stable entity ID, name, aliases, slug, canonical URL, category, commercial journeys, intent clusters, description, definitions, keywords, icon, status, priority, source coordinates, relationship edges, formula family, concepts, units, locations or jurisdictions, authoritative sources, related tools, monetisation type, risk, source freshness, reviewed date and release date.
6. Validate unique IDs, slugs, canonical paths and related-tool references at build time.
7. Treat Sheet changes to released utilities as proposed changes requiring impact review, never automatic production mutations.
8. Add a registry validation report to CI.

**Exit criteria**

- An exact tab and row can be read reproducibly.
- Invalid coordinates and source conflicts stop the workflow clearly.
- Registry records are typed, unique and reviewable in Git.
- No production page depends on a live runtime Sheet request.

### Phase 4 — Repository knowledge graph, entities, relationships and commercial journeys

**Objective**

Create the V1 Youtoola knowledge graph as a simple repository-driven model that connects utilities, concepts and user journeys through explicit, reviewable relationships.

**Why it matters**

Categories alone cannot represent how users make decisions. Meaningful relationships help users continue a real task, strengthen topical coverage, clarify Youtoola's entities for search and AI systems, and create relevant commercial paths without arbitrary recommendations.

**Dependencies**

- Phase 3 registry contracts
- Approved terminology and canonical URL rules

**Estimated complexity:** Medium

**Expected business value:** Very High — compounds the value of every utility through internal linking, journey completion, topical authority and future machine-readable discovery.

**Implementation work**

1. Define stable entity types for Youtoola, categories, commercial journeys, utilities, concepts, formulas, units, locations or jurisdictions and authoritative sources.
2. Give each entity a stable ID, preferred name, optional aliases, concise definition, canonical URL where public, source references and reviewed date.
3. Define typed utility relationships: `related_tool`, `previous_decision_step`, `next_decision_step`, `alternative`, `comparison`, `prerequisite`, `input_provider`, `output_consumer`, `same_commercial_journey`, `same_formula_family` and `same_user_intent_cluster`.
4. Store relationships as validated IDs in repository data. Require direction, relevance reason and optional display order where the relationship is directional.
5. Reject missing entities, circular prerequisite chains, self-links, duplicate edges and relationships to unreleased tools in public navigation.
6. Define initial commercial journey records such as buying a home, moving home, household budgeting, travelling by car, starting a business, managing freelance income, planning a wedding, improving fitness and studying for exams.
7. Require each journey to define its user objective, audience, entry queries, ordered decision stages, eligible utilities, selection rationale, relevant commercial opportunities, original supporting content and review owner.
8. Admit a utility to a journey only when its relationship and contribution to the complete user objective are documented; utility count alone is not sufficient.
9. Keep category membership, journey membership and relationship edges distinct so one utility can participate in several legitimate contexts.
10. Expose the model to page generation, internal-link selection and structured content through typed repository modules; do not add a graph database in V1.
11. Reserve a stable serializable representation for future documented machine-readable interfaces without publishing an API by default.

**Exit criteria**

- Every relationship type has clear semantics and validation.
- Entities use stable names and definitions consistently across content, metadata and structured data.
- At least one journey can be generated from reviewed registry relationships without a database.
- Related-tool recommendations can explain why each link is useful.
- Thin, circular or commercially artificial journeys fail review.

### Phase 5 — Information architecture, homepage, categories, journeys and search

**Objective**

Create the platform discovery layer that helps users and crawlers find the right utility quickly.

**Why it matters**

Utilities acquire landing traffic, but the platform compounds value through navigation, internal authority and additional completed tools. Strong discovery increases repeat use and total monetisable sessions.

**Dependencies**

- Phase 2 shell and design system
- Phase 3 registry
- Phase 4 entity, relationship and journey model

**Estimated complexity:** Medium

**Expected business value:** Very High — supports acquisition, internal navigation and portfolio monetisation.

**Implementation work**

1. Build an answer-first homepage with brand promise, prominent utility search, category navigation, popular tools and trust signals.
2. Build stable indexable category pages under `/categories/<category>` with original introductions and registry-derived tool cards.
3. Build indexable journey landing pages only for reviewed journeys with a complete objective, useful stage sequence, sufficient participating utilities and original guidance. Do not publish empty templates or keyword-only clusters.
4. Order journey utilities by the user's decision sequence, with alternatives and comparisons clearly separated from prerequisites and next steps.
5. Keep commercial recommendations relevant to the current journey stage and place them only after useful value.
6. Build an accessible tool directory derived from the same registry.
7. Implement lightweight client-side search over names, aliases, concepts, category, journey and user intent; avoid a search service or database in V1.
8. Normalize queries, support keyboard navigation and show useful zero-result recovery.
9. Mark internal search result URLs `noindex` and keep query URLs out of sitemaps.
10. Track search usage and result selection only in Production. Local and Preview analytics remain disabled, and raw sensitive queries must not be sent; use only approved normalized or categorized query representations where measurement is justified.
11. Define featured and popular ordering as explicit registry data or measured rules, not opaque personalisation.

**Exit criteria**

- Every released utility is reachable from the directory and one category page.
- Search works without a network request after page load.
- Search, homepage, categories and journeys contain no duplicated manual tool lists.
- Journey pages present a real end-to-end user objective rather than a thin collection of links.
- Empty, sparse and populated states remain useful and index-safe.

### Phase 6 — Utility page template and shared calculator framework

**Objective**

Build the reusable page shell, form system, result model and pure calculation framework needed to ship accurate utilities quickly.

**Why it matters**

The utility interaction is the product. A fast, accessible and predictable flow improves completion and trust, while reusable logic prevents inconsistent validation and monetisation placement.

**Dependencies**

- Phase 2 design system
- Phase 3 registry contracts
- Phase 5 navigation components

**Estimated complexity:** High

**Expected business value:** Very High — directly drives successful use and makes each subsequent utility cheaper to build.

**Implementation work**

1. Build a `UtilityPageShell` containing breadcrumbs, H1, answer-first introduction, above-fold utility, result, methodology, examples, FAQ, related tools, monetisation zone and privacy note.
2. Build shared number, currency, percentage, unit, date, select, toggle and repeatable-row inputs only as real utilities require them.
3. Define validation contracts with field-level errors, a summary for failed submission and correct mobile keyboards.
4. Define a result model supporting primary answer, supporting values, assumptions, warnings, confidence and share/export actions.
5. Announce results accessibly and place them close to the action without unexpected focus movement.
6. Create central unit conversion, decimal handling, rounding and formatting utilities.
7. Require each calculation engine to be a pure function with explicit inputs, outputs, units and error cases.
8. Define utility risk profiles: standard, data-dependent and regulated/high-consequence.
9. Add reusable methodology, source, disclaimer, FAQ and related-tool components.
10. Define provider-neutral instrumentation contracts for `tool_view`, `tool_start`, `tool_validation_error`, `tool_complete`, `result_share`, `result_export`, `related_tool_click`, `affiliate_click`, `premium_click`, `lead_start` and `lead_submit` without coupling the utility framework to GA4.
11. Add scaffold generation only after the reference implementation proves the file contract.

**Exit criteria**

- A representative calculator can be assembled without changing shared contracts.
- Core calculation logic can run independently of React and the browser.
- The main result remains available without registration or monetisation interruption.
- Mobile and keyboard completion paths are documented and tested.

### Phase 7 — SEO, entity and AI-discoverability architecture

**Objective**

Make every approved utility technically crawlable, semantically clear and easy for search engines and AI systems to understand and cite.

**Why it matters**

Organic and AI-search discovery are Youtoola's primary acquisition engines. Correct architecture prevents duplicate URLs and creates reusable quality controls without producing thin content.

**Dependencies**

- Phase 3 registry
- Phase 4 entity and relationship model
- Phase 5 information architecture
- Phase 6 utility template

**Estimated complexity:** High

**Expected business value:** Very High — establishes the principal traffic acquisition system.

**Implementation work**

1. Own generation of unique titles, descriptions, canonical URLs, default Open Graph and social metadata and breadcrumbs from reviewed utility definitions.
2. Own generation of the production sitemap exclusively from indexable registry entries and stable platform routes.
3. Own environment-aware crawl and indexing controls: Production crawlable; Local and Preview `noindex, nofollow`.
4. Allow `OAI-SearchBot`; record the separate owner decision for `GPTBot`.
5. Render core text, methodology, assumptions, definitions, worked examples, source dates and genuine FAQs as semantic HTML.
6. Provide Organization and WebSite structured data globally; select WebApplication, SoftwareApplication, BreadcrumbList, FAQPage, HowTo or Dataset only when visible content supports it.
7. Use the entity model's preferred names, definitions, canonical URLs and relationships consistently in headings, explanatory copy, metadata, breadcrumbs and structured data.
8. Represent categories, journeys, concepts, formulas, units, jurisdictions and authoritative sources only through truthful visible content and supported schema properties.
9. Validate that schema, entity IDs, metadata, canonical URLs, relationship links, sitemap entries and page content agree.
10. Create About Youtoola, methodology, editorial/review and privacy pages that establish stable entity identity and trust.
11. Define required live SERP and competitor research artifacts before a utility can enter BUILD.
12. Treat `llms.txt` as an optional owner-approved experiment, not a ranking mechanism or V1 dependency.
13. Keep canonical, structured-data, sitemap, social-metadata and crawl-control generation in this phase; operational Production verification belongs to Growth Infrastructure.

**Exit criteria**

- Automated checks catch missing, duplicated or conflicting metadata.
- Preview deployments cannot be indexed.
- Important utility facts are present in crawlable HTML.
- Stable entity terminology and relationships are consistent across public surfaces.
- Structured data validates and matches visible content.
- No keyword-variant page generation exists.
- No ranking guarantee is attributed to entity modelling or structured data.

### Phase 8 — Analytics, experimentation and monetisation architecture

**Objective**

Define the provider-neutral contracts for measuring the complete acquisition-to-value-to-revenue journey and for controlled commercial placements that never block core utility use.

**Why it matters**

Youtoola cannot improve or monetise responsibly without knowing where users arrive, abandon, complete, continue and convert. A shared architecture prevents each utility leaking data or placing intrusive offers differently.

**Dependencies**

- Phase 1 environment controls
- Phase 6 utility lifecycle
- Phase 7 consent and privacy requirements

**Estimated complexity:** High

**Expected business value:** Very High — enables evidence-led growth and revenue while protecting trust.

**Implementation work**

1. Create a typed provider-neutral analytics adapter with a GA4 provider contract, while deferring external provider configuration and Production verification to Growth Infrastructure.
2. Support standard events: `tool_view`, `tool_start`, `tool_validation_error`, `tool_complete`, result actions, related-tool clicks, affiliate clicks, premium clicks and lead lifecycle.
3. Permit only non-sensitive dimensions such as utility slug, category, locale, device class and non-sensitive result type.
4. Block names, emails, file contents and exact financial, medical or personal inputs from analytics payloads.
5. Require analytics to operate only in Production and remain disabled in Local and Preview environments.
6. Build labelled, feature-flagged `AdSlot`, `AffiliateRecommendation`, `LeadOpportunity` and `PremiumUpsell` contracts.
7. Reserve ad dimensions to avoid layout shift and prohibit ads between final input and primary action.
8. Define commercial eligibility per utility in the registry instead of activating global offers blindly.
9. Define experiment guardrails: no test may degrade calculation accuracy, accessibility, Core Web Vitals or privacy.
10. Establish a baseline dashboard specification covering acquisition, search, completion, continuation, revenue and operating cost; operational dashboard setup belongs to Growth Infrastructure.
11. Define privacy-safe evidence exports or manual reporting inputs for Search Console, Bing, affiliate, lead and premium performance; do not build a warehouse in V1.
12. Keep Microsoft Clarity optional and disabled unless a separate privacy review and owner approval authorise it.

**Exit criteria**

- Event payload tests prove sensitive values cannot be sent.
- Contract and integration tests prove utility completion can be measured from start to result when a Production provider is configured.
- Commercial components remain hidden when unconfigured.
- The free result precedes every monetisation action.

### Phase 9 — Testing, accessibility, performance and security gates

**Objective**

Turn quality requirements into automated and manual release gates proportionate to utility risk.

**Why it matters**

Incorrect results, inaccessible controls, slow pages or exposed data destroy trust and acquisition. Shared gates reduce regression risk as portfolio velocity increases.

**Dependencies**

- Phases 1 through 8

**Estimated complexity:** High

**Expected business value:** Very High — protects rankings, completion, reputation and commercial continuity.

**Implementation work**

1. Unit-test pure calculation, unit conversion, rounding and validation functions.
2. Use authoritative and independently derived test vectors for high-consequence utilities.
3. Add component tests for labels, errors, input state and result announcements.
4. Add Playwright flows for successful use, invalid input, navigation, sharing and environment indexing.
5. Run axe scans plus manual keyboard, zoom, contrast and reduced-motion checks.
6. Verify layouts at 390×844, 430×932, 768×1024 and 1440×900.
7. Enforce Lighthouse targets: Performance 90+, Accessibility 95+, Best Practices 95+ and SEO 95+, with documented exceptions.
8. Set budgets for client JavaScript, images, fonts, third-party scripts and layout shift.
9. Test metadata, canonical URL, structured data, sitemap membership and robots headers.
10. Add dependency auditing, input sanitisation, safe headers, secret scanning and file-tool threat controls.
11. Prefer local file processing; when upload is unavoidable, document retention, size, type, deletion and logging rules.
12. Test environment-specific analytics behaviour, including Production enablement, Local and Preview disablement and the absence of analytics requests from Preview.
13. Test consent states, event-payload allowlists and rejection of sensitive or personal values.
14. Test canonical, structured-data, sitemap, Open Graph, robots and visible-content consistency.
15. Test representative 404 responses and permanent and temporary redirect behaviour.

**Exit criteria**

- Required checks fail reliably on representative defects.
- Test requirements vary by utility risk without weakening the platform minimum.
- Performance regressions and preview-indexing errors block release.
- Security and privacy review has named evidence, not a checklist-only assertion.

### Phase 10 — GitHub workflow, CI/CD and Vercel environments

**Objective**

Establish an auditable path from approved specification to protected `main`, verified Preview and verified Production.

**Why it matters**

Reliable delivery protects production traffic and revenue while allowing rapid iteration. Preview deployments enable realistic review without creating duplicate indexed pages.

**Dependencies**

- Phase 1 quality commands
- Phase 9 release checks
- GitHub and Vercel administrative access

**Estimated complexity:** Medium

**Expected business value:** High — reduces production incidents and makes releases repeatable.

**Implementation work**

1. Add branch patterns such as `platform/<scope>` and `utility/<canonical-slug>`.
2. Add PR template sections for source row, commercial hypothesis, SEO, analytics, monetisation, tests, preview and rollback.
3. Configure CODEOWNERS where the team structure supports it.
4. Add GitHub Actions for lint, type-check, unit tests, registry validation, build, accessibility smoke and end-to-end smoke.
5. Protect `main` with pull requests, passing checks and resolved review comments; require non-author approval when staffing allows.
6. Connect one GitHub repository to one Vercel project.
7. Separate Local, Preview and Production variables and integrations.
8. Keep analytics provider configuration Production-only. Verify every Preview response has `noindex`, exclude previews from sitemaps and prove Local and Preview cannot emit Production analytics.
9. Deploy Production only from approved `main`; do not use manual production CLI deployment by default.
10. Isolate analytics-provider failures so the utility and its result remain available.
11. Require the Growth Infrastructure Production evidence record before Utility #1 can receive `APPROVE SHIP`.
12. Record PR, commit, preview URL, production URL, deployment, Growth Infrastructure evidence, rollback target and release notes.
13. Document rollback and failure procedures for analytics, consent, indexing and metadata configuration.

**Exit criteria**

- Direct unreviewed utility pushes to `main` are blocked.
- A PR produces a testable, non-indexable Preview.
- A merge to `main` produces the only automatic Production deployment.
- Failed checks cannot be bypassed through the normal workflow.

### Phase 11 — Growth Infrastructure

**Objective**

Establish and verify the minimum measurement, indexing, metadata, consent and monitoring infrastructure required before any public utility launch.

**Why it matters**

Without reliable acquisition, completion and conversion evidence, Youtoola cannot determine whether a utility attracts useful traffic, helps users or creates commercial value. Indexing and metadata controls protect organic acquisition, while privacy controls protect trust.

**Dependencies**

- Brand Foundation v1 merged
- Phases 2 through 10 complete
- Provider-neutral analytics adapter and event contracts
- Production domain and Vercel environment
- Working sitemap, canonical and structured-data systems
- Owner access to GA4, Google Search Console and Bing Webmaster Tools
- Approved consent and privacy policy
- Approved default social image

**Estimated complexity:** High

**Expected business value:** Very High — makes acquisition, completion and monetisation measurable before portfolio investment begins.

**Implementation work**

1. Connect GA4 as the initial Production provider behind the provider-neutral analytics adapter.
2. Enable analytics only in Production and prove Local and Preview generate no analytics traffic.
3. Implement and document the approved event taxonomy: `tool_view`, `tool_start`, `tool_validation_error`, `tool_complete`, `result_share`, `result_export`, `related_tool_click`, `affiliate_click`, `premium_click`, `lead_start` and `lead_submit`.
4. Enforce event-payload allowlists and prohibit sensitive user inputs or personal data from analytics.
5. Configure consent and cookie handling appropriate to the approved launch jurisdictions.
6. Add and verify the canonical domain in Google Search Console.
7. Verify or import the site in Bing Webmaster Tools.
8. Submit the Production sitemap, record acceptance and establish indexing checks for platform routes and later utility URLs.
9. Establish Core Web Vitals monitoring using free first-party sources initially.
10. Validate canonical URLs across Production and Preview.
11. Validate structured data against visible content.
12. Provide approved default Open Graph and social metadata.
13. Establish 404 and redirect monitoring with an assigned response owner.
14. Keep Microsoft Clarity disabled unless privacy review and owner approval permit it.
15. Create a baseline dashboard covering acquisition, views, starts, validation failures, completions, shares, exports, related-tool clicks, affiliate clicks, premium clicks and lead events.
16. Create the Utility #1 launch checklist covering measurement, indexing controls and conversion tracking.
17. Document analytics, consent, indexing and metadata failure handling and rollback.
18. Schedule post-launch reviews at 24 hours, 7 days, 28 days, monthly and quarterly.

**Exit criteria**

- GA4 receives approved, non-sensitive Production events through the provider-neutral adapter.
- Local and Preview analytics are demonstrably disabled.
- Event-payload protections pass positive and negative tests.
- Consent behaviour matches the approved jurisdiction policy.
- Google Search Console and Bing ownership are verified.
- The Production sitemap is submitted and accepted.
- Canonicals, robots, structured data and default social metadata validate.
- Core Web Vitals have a recorded baseline and monitoring owner.
- 404 and redirect checks have an operational procedure.
- The baseline dashboard is accessible to the owner.
- The launch checklist and rollback procedure are approved.
- Post-launch reviews have named owners and dates.
- Growth Infrastructure has a Production evidence record.

**Explicit blockers**

- Missing GA4 property, web stream or required access
- Missing Google Search Console or Bing Webmaster Tools access
- Unresolved consent or launch-jurisdiction policy
- Missing approved default Open Graph asset
- Failed sitemap, canonical, robots or structured-data validation
- Analytics leakage from Local or Preview
- Sensitive or personal values present in analytics payloads
- No dashboard owner, monitoring procedure or rollback path

**Owner decisions required**

1. Confirm GA4 property, web-stream ownership and data-retention settings.
2. Confirm launch jurisdictions and the corresponding consent and default-denial policy.
3. Confirm Google Search Console verification ownership and Bing verification or import method.
4. Approve the default Open Graph asset.
5. Choose native provider dashboards or a free consolidated dashboard such as Looker Studio.
6. Confirm Core Web Vitals sources, monitoring thresholds and owners.
7. Confirm the 404 and redirect monitoring method and response owner.
8. Decide whether Microsoft Clarity remains disabled or receives a separate privacy review.
9. Approve rollback thresholds, final event parameters and the review cadence.

### Phase 12 — Reference utility pilot and factory validation

**Objective**

Build one approved, low-to-medium-risk utility through PLAN, BUILD and REVIEW, obtain `APPROVE SHIP`, and hand the approved release candidate to the Production launch phase before scaling the portfolio.

**Why it matters**

The first real utility will expose missing contracts and unnecessary abstractions. Validating the factory with one complete product avoids multiplying design and architecture mistakes.

**Dependencies**

- Phases 0 through 11, including Growth Infrastructure complete and verified in Production
- Approved utility selected from an exact live Sheet row
- Completed search research and commercial scorecard

**Estimated complexity:** High

**Expected business value:** Very High — proves the acquisition, completion, internal-link and monetisation operating model.

**Implementation work**

1. Select a utility with clear intent, stable logic and limited regulatory exposure.
2. Confirm the Growth Infrastructure Production evidence record before beginning the mandatory utility plan and owner approval.
3. Save the specification at `docs/utilities/<canonical-slug>.md`.
4. Implement the smallest superior V1 using only shared platform contracts.
5. Add calculation, validation, integration, end-to-end, accessibility, performance and SEO tests.
6. Validate the complete approved event taxonomy, consent behaviour and inactive monetisation placements without sensitive payloads.
7. Complete Preview review at all required viewports.
8. Obtain `APPROVE SHIP` only after the Growth Infrastructure gate and all utility review criteria pass; perform the Production merge, deployment and live verification in Phase 13.
9. Hold a factory retrospective and modify shared abstractions only where the real implementation proves a need.

**Exit criteria**

- The utility is accurate, accessible, fast, crawlable and measurable.
- The registry drives every discovery surface correctly.
- The approved release candidate, release record and rollback plan are ready for Phase 13.
- Factory lessons are recorded before selecting the next utility.

### Phase 13 — Utility #1 Production launch and post-launch verification

**Objective**

Launch the platform and first utility with verified indexability, ownership, analytics and baseline measurement.

**Why it matters**

Publishing code is not acquisition. Search systems need valid signals, and the business needs a baseline to determine whether the utility attracts and monetises useful traffic.

**Dependencies**

- Phase 12 approved release candidate
- Phase 11 Growth Infrastructure complete and verified in Production
- Production domain and Vercel environment
- Owner access to Google Search Console and Bing Webmaster Tools

**Estimated complexity:** Medium

**Expected business value:** Very High — begins acquisition and establishes the first measurable commercial funnel.

**Implementation work**

1. Reconfirm the canonical `www` host and permanent apex redirect after deployment.
2. Verify the live Utility #1 canonical tag, robots eligibility, sitemap membership, schema, default social metadata and internal links.
3. Verify Preview remains `noindex` and Production is crawlable.
4. Confirm the previously verified Google Search Console property accepts the updated sitemap and inspect the Utility #1 URL.
5. Confirm the previously verified Bing property accepts the updated sitemap and can inspect the Utility #1 URL.
6. Confirm `OAI-SearchBot` access and the approved GPTBot policy.
7. Smoke-test Utility #1 Production analytics and conversion events without sensitive payloads; invoke the approved failure or rollback procedure if measurement is broken.
8. Record initial performance, Core Web Vitals, page size, indexability, event integrity and release evidence.
9. Begin the approved 24-hour, 7-day, 28-day, monthly and quarterly review cadence.

**Exit criteria**

- Production is accessible, indexable and verified on the canonical host.
- Search platforms retain verified ownership and accept the updated sitemap submission.
- Baseline product and commercial metrics are recorded.
- A rollback deployment is identified and tested operationally.

### Phase 14 — Commercial intelligence feedback loop

**Objective**

Create a permanent, lightweight learning loop that turns every utility's launch evidence into improvements to that utility, the factory and future portfolio priorities.

**Why it matters**

Youtoola becomes progressively smarter only when product, search and commercial evidence is reviewed and retained. A repository-driven loop captures this value without requiring a V1 warehouse, customer profile system or complex data platform.

**Dependencies**

- Phase 8 analytics contracts
- Phase 13 verified Production launch and search-platform access
- Approved privacy and evidence-retention rules

**Estimated complexity:** Medium

**Expected business value:** Very High — compounds learning across acquisition, completion, retention, monetisation and operating efficiency.

**Permanent learning loop**

```text
Google Sheet opportunity
→ product definition
→ search and competitor research
→ commercial scoring
→ approved specification
→ build
→ launch
→ analytics
→ Search Console and Bing data
→ completion and retention data
→ monetisation data
→ lessons learned
→ improvements to the utility factory and future utilities
```

**Implementation work**

1. Create `docs/intelligence/<utility-slug>/` records containing dated launch baselines, review snapshots, decisions, lessons and approved follow-up actions.
2. Store aggregated evidence: indexation, impressions, rankings, clicks, click-through rate, acquisition source, AI-search referrals, tool views, starts, validation-failure categories, completions, result actions, related-tool clicks, return visits, affiliate performance, lead performance, premium conversion, revenue per session, operating cost per completed use, support burden and source/calculation freshness.
3. Never store names, email addresses, uploaded content, exact financial or health values, raw calculator inputs, persistent cross-site identities or any personal value unnecessary for an approved lead workflow.
4. Use privacy-safe provider reports, dated manual exports or concise summaries in Git. Do not commit secret keys, unrestricted raw exports or personal records.
5. Review each launch at 24 hours for availability, errors, indexability and event integrity; 7 days for early use and crawl signals; 28 days for first meaningful funnel evidence; monthly for optimisation and commercial performance; and quarterly for portfolio priority, freshness, support burden and retirement decisions.
6. Compare results with the approved acquisition, completion, continuation and monetisation hypotheses rather than treating traffic alone as success.
7. Convert findings into assigned, evidence-linked actions: bug fixes, UX improvements, content improvements, relationship/internal-link changes, monetisation changes, authoritative-source updates, utility retirement reviews or new Google Sheet opportunities.
8. Feed repeated validation problems, successful patterns, source-maintenance needs and reusable calculation components back into design-system, registry, utility-template, testing and planning standards.
9. Update commercial score assumptions and future prioritisation with observed evidence while preserving the original scorecard and decision history.
10. Require human review and the normal approval gates before findings change a released utility, registry relationship, journey or factory standard.
11. Start with repository documents and provider dashboards. Consider automated aggregation only when manual review is a measured bottleneck or evidence volume becomes unreliable.

**Exit criteria**

- Every released utility has an owner, review dates, baseline and durable findings location.
- Metrics are defined consistently and exclude prohibited personal input.
- Findings produce traceable decisions and prioritized actions.
- Lessons can change future commercial scoring and factory standards without automatically changing Production.
- V1 operates without a database, warehouse or customer-level tracking system.

### Phase 15 — Controlled portfolio rollout and internal-link network

**Objective**

Expand from one reference utility to a coherent set of commercially viable tools without lowering quality.

**Why it matters**

Portfolio value compounds when utilities address adjacent user journeys and pass authority and users between one another. Uncontrolled volume would instead create thin content, maintenance burden and weak trust.

**Dependencies**

- Phase 13 measurement baseline
- Phase 14 commercial intelligence loop
- Proven factory and release process
- Approved utility plans and scorecards

**Estimated complexity:** Very High across the portfolio

**Expected business value:** Very High — grows organic surface area, repeat use and relevant monetisation inventory.

**Implementation work**

1. Rank candidates using the mandatory 1-to-5 commercial scorecard plus evidence confidence.
2. Build clusters around shared intent and continuation paths rather than isolated keyword volume.
3. Use the typed relationship model to name previous steps, next steps, alternatives, comparisons, prerequisites, input providers, output consumers, formula families and intent clusters where relevant.
4. Select 3–5 related tools using explicit relationship evidence, not random rotation or category membership alone.
5. Expand reviewed commercial journeys only when they cover a real user objective with enough useful utilities and original guidance.
6. Keep root-path canonicals and stable slugs; use redirects and approval for any published change.
7. Reuse shared engines where formulas genuinely overlap, without creating a generic engine that obscures correctness.
8. Add content and country variants only when calculations or user value materially differ.
9. Measure incremental search traffic, completion, journey progression, related-tool movement, revenue and maintenance cost after each release.
10. Pause categories, journeys or formats that create weak value or disproportionate support burden.

**Exit criteria**

- Each new utility has a validated acquisition and monetisation hypothesis.
- Internal links are useful, reciprocal where appropriate and free of broken references.
- Portfolio growth does not degrade performance budgets or quality gates.
- Releases are prioritized by measured opportunity rather than Sheet tier alone.

### Phase 16 — Continuous optimisation, retention and commercial activation

**Objective**

Use real behaviour and search data to improve completion, repeat use, navigation and revenue after sufficient traffic exists.

**Why it matters**

The highest-value improvements may be better inputs, clearer assumptions, stronger related tools or more relevant offers rather than more utilities. Data-led iteration compounds existing acquisition.

**Dependencies**

- Meaningful production traffic and conversion volume
- Phase 8 measurement architecture
- Phase 14 commercial intelligence records
- Stable platform quality baseline

**Estimated complexity:** Medium per experiment

**Expected business value:** Very High when based on sufficient evidence.

**Implementation work**

1. Review indexation, impressions, rankings, click-through rate, utility starts, validation failures, completion, related-tool clicks, journey progression and return visits.
2. Review affiliate performance, lead performance, premium conversion, revenue per session, operating cost per completed use, support burden and calculation/source freshness.
3. Diagnose drop-off between page view, tool start, validation and completion.
4. Improve answer-first copy and input defaults without changing calculation truth.
5. Test relationship-based tool ordering, journey progression and continuation language.
6. Activate contextual affiliates, ads, leads or premium features only for eligible utilities.
7. Evaluate saved scenarios, local persistence, reminders or exports when they create repeat use without requiring accounts.
8. Run experiments with predeclared success metrics and guardrails for SEO, performance, accessibility and trust.
9. Use Search Console and Bing queries to improve genuine content gaps rather than create near-duplicate pages.
10. Route findings through bug fixes, UX changes, content changes, internal-link changes, monetisation changes, source updates, retirement reviews or new opportunity proposals.
11. Keep the 24-hour, 7-day, 28-day, monthly and quarterly review cadence defined in Phase 14.

**Exit criteria**

- Changes have measurable user or commercial benefit.
- No monetisation experiment materially reduces completion, trust or page speed.
- Losing experiments are removed and findings are documented.
- Stale or commercially negative utilities receive an explicit improve, maintain, consolidate or retire decision.

### Phase 17 — Evidence-triggered capabilities and future scaling

**Objective**

Introduce additional infrastructure only when portfolio scale, product requirements or commercial evidence exceed the static-first architecture.

**Why it matters**

Premature infrastructure raises cost and slows releases. Evidence-triggered scaling preserves maintainability while allowing Youtoola to support higher traffic, dynamic data and premium products later.

**Dependencies**

- Measured bottleneck or validated business requirement
- Architecture decision and owner approval
- Migration and rollback plan

**Estimated complexity:** Variable; potentially Very High

**Expected business value:** Conditional — high only when tied to validated demand or operational savings.

**Potential triggers and responses**

| Trigger | Considered response | Do not introduce before |
| --- | --- | --- |
| Search index becomes slow at large registry size | Prebuilt compact search index, then hosted search only if necessary | Client search is measured as inadequate. |
| Users need saved cross-device scenarios | Minimal account and data model | Repeat-use demand and privacy basis are validated. |
| Live rates or regulations require updates | Versioned data modules and scheduled validation | A utility has authoritative update requirements. |
| File processing exceeds browser limits | Isolated processing service with deletion controls | Local processing is demonstrably insufficient. |
| Country/language expansion is justified | Locale-aware routes, translation workflow and local review | Genuine differentiated demand and maintenance ownership exist. |
| Premium products gain traction | Entitlements, billing and account services | A paid value proposition converts manually or in pilot form. |
| B2B/API demand is validated | Versioned API, quotas, documentation and billing | Customers and service-level expectations are known. |
| Registry editing becomes operationally difficult | Lightweight CMS or administrative interface | Git-and-Sheet workflow is a measured bottleneck. |
| Traffic or functions create material cost | Cache, edge, background work or service extraction | Profiling identifies the actual constraint. |
| Users repeatedly need help interpreting a specific utility | Optional utility-specific AI assistance grounded in that tool's reviewed definitions, inputs, deterministic outputs, assumptions, limitations and relationships | Demand, safe scope, privacy, cost and latency have been validated for that utility. |

**Conditions for optional utility-specific AI assistance**

This is a later-stage, evidence-triggered capability. A generic chatbot is not the centre of Youtoola and no AI assistant is a V1 dependency.

1. The assistant must solve observed utility-specific needs such as explaining a result, comparing deterministic scenarios, answering a bounded follow-up question, suggesting a related Youtoola utility or explaining assumptions and limitations.
2. The deterministic calculation or processing engine remains the only source of numerical truth. Model-generated calculations cannot replace, override or silently modify engine output.
3. The assistant receives only the minimum approved context and must not retain or transmit sensitive inputs without explicit consent and a documented lawful purpose.
4. Responses must distinguish sourced facts, deterministic outputs and generated explanation; unsupported certainty and invented sources are prohibited.
5. Financial, medical, legal, tax, immigration and safety utilities must not present generated text as professional advice.
6. The assistant must work without requiring an account and must never block the core utility or its result.
7. Page speed, accessibility and ordinary crawlable content must not depend on loading an AI service.
8. Usage limits, model choice, caching, failure handling and spend caps must make cost per assisted completion commercially acceptable.
9. A safe non-AI fallback must preserve the utility, methodology, FAQs and related-tool navigation when the service is unavailable.
10. Each implementation requires a separate approved specification, threat/privacy review, evaluation set and measured success criteria.

**Exit criteria**

- Every scaling change has a measured trigger, business case and rollback plan.
- The public platform retains stable canonical URLs and shared identity.
- New services do not weaken privacy, accessibility or core utility availability.
- Any AI assistance is bounded, optional, cost-controlled and demonstrably grounded in deterministic utility truth.

**Intentionally excluded from V1**

- database unless a real product requirement proves it necessary
- authentication or mandatory accounts
- graph database
- generic AI assistant
- CMS
- public API without validated demand
- paid service without a clear commercial or operational case
- automatic production changes driven by the Google Sheet, analytics or AI

## 6. Cross-cutting release requirements

No phase or utility is complete unless the relevant controls below are satisfied.

### Growth Infrastructure release gate

**No public utility launches without measurement, indexing controls and conversion tracking.**

**Utility #1 cannot receive `APPROVE SHIP` until Growth Infrastructure is complete and verified in Production.**

- Platform-level GA4 delivery, consent behaviour, search-platform ownership, sitemap acceptance, canonical behaviour, structured data, default social metadata, Core Web Vitals monitoring, 404 and redirect monitoring, dashboard access and rollback procedures must have Production evidence before Utility #1 planning begins.
- Utility-specific analytics, conversion events, metadata and sitemap membership must pass automated tests and Preview review before `APPROVE SHIP`.
- Because a private Preview URL cannot prove live utility indexing or Production event delivery, Utility #1 receives an immediate post-deployment smoke test. A measurement, indexing or conversion-tracking failure invokes the approved containment or rollback procedure.

### Acquisition

- Primary and secondary search intent researched live and dated.
- Canonical slug selected after competitor research.
- Core page content is server-rendered or statically generated.
- Metadata, sitemap, robots and schema agree.
- AI-style natural-language questions receive concise, factual answers in HTML.
- Entity names, definitions, relationships and canonical URLs remain stable and internally consistent.

### Utility completion and trust

- Main utility appears above the fold and requires no account.
- Labels, units, assumptions, rounding and limitations are explicit.
- Results distinguish estimates from exact values.
- High-consequence logic cites current authoritative sources.
- Mobile, keyboard and error flows work independently.

### Monetisation

- The free result is delivered before the commercial continuation.
- Offers are relevant, clearly labelled and registry-controlled.
- Ads reserve space and do not create layout shift.
- Lead collection is optional, consented and data-minimised.
- Revenue is evaluated with completion, trust and retention guardrails.

### Maintainability

- Shared components are reused without hiding utility-specific truth.
- No duplicated registry lists or manual sitemap entries exist.
- Dependencies have a documented reason and owner.
- Released specifications, source rows and reviewed dates remain traceable.
- Registry relationships and journey membership are validated and reviewable in Git.
- Launch evidence and lessons are stored in the relevant `docs/intelligence/` record.
- Rollback paths are known before Production deployment.

### Compounding platform value

- Each utility defines meaningful relationships beyond its category.
- Every public journey page serves a complete user objective and contains original guidance.
- Related-tool links follow decision logic and can state their relevance.
- Launch findings feed prioritisation, utility improvements and factory standards through human review.
- Released utilities never change automatically because the Sheet or a metric changed.

## 7. Documentation system

The repository should maintain:

- `README.md`: local setup, commands and high-level architecture
- `AGENTS.md`: binding operating rules and approval gates
- `docs/ROADMAP.md`: platform implementation sequence and current phase
- `docs/VISION.md`: long-term product doctrine and compounding-platform principles
- `docs/architecture/`: durable system explanations
- `docs/decisions/`: concise approved architecture decisions
- `docs/intelligence/<utility-slug>/`: dated baselines, review snapshots, lessons and approved actions
- `docs/operations/`: deployment, indexing, incident and Growth Infrastructure procedures, including the growth-infrastructure runbook, launch checklist and rollback procedure
- `docs/architecture/analytics-event-taxonomy.md`: approved event names, parameters, payload allowlists, prohibited data and environment behaviour
- Growth Infrastructure evidence: dashboard definition, Production verification record and dated launch evidence stored in the appropriate `docs/operations/` or `docs/intelligence/` record
- `docs/research/`: dated portfolio, search and competitor evidence
- `docs/utilities/<slug>.md`: approved specification and commercial hypothesis for each utility
- `CHANGELOG.md`: platform and utility releases

Documentation changes are part of the same PR as the behaviour they describe. A released utility must retain its original Sheet coordinates and reviewed specification even if the live Sheet later changes.

## 8. Roadmap governance

At the end of each implementation phase:

1. verify exit criteria with evidence
2. record decisions and unresolved risks
3. compare actual complexity with the estimate
4. review impact on acquisition, completion, trust, monetisation and maintenance
5. update this roadmap only through an approved pull request
6. obtain approval before beginning the next phase when it changes production architecture or paid services
7. prohibit Utility #1 `APPROVE SHIP` until the Phase 11 Production evidence record proves measurement, indexing controls and conversion tracking are operational

The roadmap should be revised when evidence changes priorities, but the mandatory utility gates and quality standards remain in force. The currently empty root `ROADMAP.md` should be removed only through an owner-approved cleanup, after which `docs/ROADMAP.md` remains the sole roadmap.

## 9. Owner decisions required for remaining phases

Previously approved foundation, canonical-host, crawler, brand and release-authority decisions remain in force unless the owner changes them through the normal approval process. Growth Infrastructure requires these remaining decisions before Phase 11 can exit:

1. Confirm the GA4 account, property, web stream, responsible owner and data-retention settings.
2. Confirm launch jurisdictions and the corresponding consent, cookie and default-denial policy.
3. Confirm Google Search Console ownership and verification method.
4. Confirm Bing Webmaster Tools verification or Google Search Console import method.
5. Approve the default Open Graph and social asset.
6. Choose native provider dashboards or a free consolidated dashboard such as Looker Studio, and assign its owner.
7. Confirm Core Web Vitals data sources, thresholds and monitoring owner.
8. Confirm the 404 and redirect monitoring method and response owner.
9. Decide whether Microsoft Clarity remains disabled or proceeds to a separate privacy review and owner approval.
10. Approve analytics, consent, indexing and metadata rollback or containment thresholds.
11. Approve final event parameters for tool, result, related-tool, affiliate, premium and lead events.
12. Confirm the 24-hour, 7-day, 28-day, monthly and quarterly review cadence and owners.
13. Confirm the Vercel commercial plan timing when monetised Production traffic justifies it.
14. Preserve the approved crawler policy: allow `OAI-SearchBot` and disallow `GPTBot` until the owner changes it.
15. Preserve the approved single-maintainer GitHub review policy until staffing changes.
16. Confirm that utility-specific AI assistance remains deferred until a separate evidence-based approval satisfies Phase 17 conditions.
17. Approve the first reference utility only through a separate `YOUTOOLA PLAN` request using an exact live tab and visible row after Phase 11 completes.

No utility implementation begins as part of this roadmap.
