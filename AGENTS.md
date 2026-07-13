# Youtoola Repository Instructions

## 1. Product identity

Youtoola is one unified web platform containing many free practical online utilities.

Primary domain:

https://www.youtoola.com

Every utility lives inside the same product and repository.

Examples:

- `/fuel-trip-calculator`
- `/mortgage-calculator`
- `/marriage-calculator`
- `/unit-price-calculator`

Do not create a separate standalone website, repository or visual identity for each utility unless the user explicitly instructs otherwise.

Brand promise:

**Useful tools. No account. No nonsense.**

Business model:

**Utility-led traffic monetisation**

The utility creates the value and attracts the user. Traffic is later monetised through advertising, relevant affiliates, qualified leads, premium services, subscriptions, white-label access or APIs.

Utility quality, speed and trust always come before monetisation.


## 2. Commercial North Star

Every product, design and technical decision must serve this operating principle:

**The utility attracts the user. The traffic is monetised.**

This is not a slogan added after development. It is the decision framework for the platform and every utility.

The order is mandatory:

1. solve a real user problem exceptionally well
2. make the solution easy to discover
3. make the utility fast and easy to complete
4. earn trust through accuracy and transparency
5. create a reason to return, share or use another Youtoola utility
6. monetise relevant intent without reducing usefulness or trust

Technical sophistication has no independent value. Prefer the option that produces the strongest combination of:

- organic discovery
- AI search discovery
- fast time to first useful result
- high completion rate
- repeat use
- internal navigation to other tools
- commercial intent
- monetisation yield
- low operating cost
- low maintenance burden
- reliability
- privacy
- defensibility

Do not overengineer.

Do not select a technology because it is fashionable.

Do not add a paid dependency unless its expected commercial or operational value clearly exceeds its cost.

When two implementation options are technically valid, choose the option that best supports acquisition, user success, trust, conversion and maintainable growth.

SEO, AI discoverability, analytics and monetisation are release requirements. They are not post-launch enhancements.

Commercial success never justifies:

- low-value mass pages
- copied content
- misleading claims
- dark patterns
- intrusive advertising
- hidden commercial relationships
- inaccurate calculators
- unnecessary collection of personal data
- sacrificing page speed or accessibility

## 3. Commercial viability gate

Before approving a utility for BUILD, Codex must create a concise commercial scorecard.

Score each factor from 1 to 5 and explain the score:

- search demand potential
- clarity of search intent
- commercial value of the intent
- competition difficulty
- ability to provide meaningfully better utility
- repeat-use potential
- shareability
- internal-link potential
- advertising suitability
- affiliate or lead potential
- premium-service potential
- build effort
- ongoing data-maintenance burden
- legal, financial, medical or regulatory risk
- defensibility

The plan must state one of these decisions:

- `BUILD NOW`
- `BUILD AFTER VALIDATION`
- `DO NOT BUILD YET`

A high Google Sheet priority does not remove the need for this assessment.

The plan must define the commercial hypothesis:

- who arrives
- what query or AI question brings them
- what job they need completed
- what makes Youtoola better than existing results
- what action indicates successful utility use
- what relevant monetisation opportunity exists after value is delivered
- what related Youtoola tool should be offered next

## 4. Search and AI discovery doctrine

Youtoola must be designed to rank as highly as realistically possible in conventional search and to be easily understood, cited and surfaced by AI search and LLM-based discovery tools.

There is no guaranteed ranking position. Never claim that a technical implementation guarantees first place.

The strategy is:

- genuinely superior utility
- clear search-intent alignment
- strong technical SEO
- crawlable server-rendered content
- original supporting content
- transparent methodology
- authoritative sources
- strong internal linking
- fast page experience
- stable entity identity
- measurable iteration after launch

Every utility plan must include live search research before BUILD when internet access is available:

1. identify the primary query
2. identify important query variations
3. inspect the current search-result landscape
4. inspect leading utility competitors
5. identify missing features, unclear assumptions or poor experiences
6. identify featured-snippet, calculator, comparison and FAQ opportunities
7. identify relevant AI-style natural-language questions
8. define how Youtoola will provide greater practical value
9. select the canonical slug only after this research
10. document findings and the date researched

Do not copy competitor wording, design or calculations.

### Search requirements

Every indexable utility must have:

- one canonical URL on `https://www.youtoola.com`
- a descriptive lowercase kebab-case slug
- server-rendered or statically generated core text
- a unique title
- a useful meta description
- one clear H1
- concise answer-first introductory copy
- the working utility above the fold
- crawlable methodology and assumptions
- worked examples
- genuine FAQs
- relevant internal links
- breadcrumbs
- Open Graph metadata
- valid structured data that matches visible content
- sitemap inclusion
- crawl permission in production
- no indexing in previews or non-production environments
- a visible last-reviewed date when inputs, laws, prices or rates can change
- authoritative source links when factual inputs affect the result

Structured data must be selected based on the actual page. Typical candidates include:

- `Organization`
- `WebSite`
- `SoftwareApplication`
- `WebApplication`
- `BreadcrumbList`
- `FAQPage`, only when compliant and genuinely useful
- `HowTo`, only when the page is actually instructional and eligible
- `Dataset`, when Youtoola publishes a real reusable dataset

Never add unsupported or misleading schema.

### AI and LLM discoverability requirements

AI discoverability must be based on the same high-quality fundamentals as search, not on invented tricks.

Make important information available as clean textual HTML, including:

- what the utility does
- who it is for
- inputs
- outputs
- formula or processing method
- assumptions
- limitations
- worked examples
- source dates
- sources
- definitions
- concise answers to common natural-language questions

Use stable terminology for Youtoola, each utility and each concept.

Maintain:

- a clear About Youtoola page
- an editorial and methodology policy
- a privacy policy
- an authorship or review model where expertise matters
- an accessible tool directory
- stable category pages
- strong internal links
- consistent Organization and WebSite structured data
- accurate `sameAs` references when official profiles exist

Production `robots.txt` must allow ordinary search crawling and must allow `OAI-SearchBot` so eligible Youtoola pages can surface in ChatGPT search.

Treat `OAI-SearchBot` and `GPTBot` as separate decisions:

- `OAI-SearchBot` concerns visibility in ChatGPT search and should be allowed
- `GPTBot` concerns possible model-training use and requires an explicit owner policy
- do not assume that allowing or blocking one controls the other

Do not block important HTML, JavaScript, CSS, images or API responses required to render indexable content.

Do not rely on `llms.txt`, special AI markup or a proprietary file as a ranking mechanism. An experimental `llms.txt` may be added as a convenience only after owner approval, but it never replaces crawlable pages, robots rules, sitemaps, structured data or strong content.

Where commercially justified, expose stable machine-readable facts or a documented public calculation interface, but do not create an expensive public API by default.

### Search launch procedure

For every production launch:

1. validate canonical URL
2. validate indexability
3. validate robots rules
4. validate sitemap entry
5. validate structured data
6. validate metadata
7. validate internal links
8. confirm preview URLs are `noindex`
9. submit or refresh the sitemap in Google Search Console
10. submit or refresh the sitemap in Bing Webmaster Tools
11. inspect the production URL
12. record baseline rankings and impressions when data becomes available

### Search and AI performance metrics

Track, when available:

- indexed status
- impressions
- clicks
- click-through rate
- average search position
- primary-query position
- non-brand versus brand traffic
- AI-search referral traffic
- landing-page engagement
- tool-start rate
- completion rate
- result-share rate
- related-tool click rate
- returning-user rate
- advertising revenue per thousand sessions
- affiliate click-through rate
- lead conversion rate
- premium conversion rate
- revenue per session
- operating cost per completed use

Do not optimize revenue per session in isolation. A monetisation change that damages rankings, completion, trust or repeat use is commercially negative.


## 5. Source of truth

The live Youtoola utility backlog is stored in this Google Sheet:

https://docs.google.com/spreadsheets/d/1BJtHQKH6MxAySfQ0C-mGrCgXdAD1efM2vIf5iDwqzpU/edit?usp=drivesdk

Spreadsheet ID:

`1BJtHQKH6MxAySfQ0C-mGrCgXdAD1efM2vIf5iDwqzpU`

The user will normally identify a utility using:

- the exact tab name
- the visible Google Sheet row number

Example command:

`YOUTOOLA PLAN, tab "Travel & Mobility", row 5`

Treat the visible Google Sheet row number as the literal spreadsheet row number, not the zero-based array position and not the utility ID.

Before planning or writing code:

1. Fetch the current live spreadsheet data.
2. Read the exact requested tab and visible row.
3. Extract every available field from that row.
4. Echo the resolved source back to the user:
   - spreadsheet title
   - tab name
   - visible row number
   - utility ID, when present
   - utility name
   - core use
   - search intent, when present
   - monetisation route
   - premium opportunity, when present
   - complexity
   - priority tier
5. Compare the retrieved utility name with any name mentioned by the user.
6. Stop and ask for correction when the tab, row or utility name conflicts.
7. Never silently substitute a nearby row or a similarly named utility.
8. Never rely only on a previously cached copy when live access is available.

If live spreadsheet access fails:

1. report the exact access failure
2. do not invent the row contents
3. identify any cached snapshot and its timestamp
4. use cached data only after the user explicitly approves it

Maintain a reusable spreadsheet retrieval script in the repository, for example:

`scripts/read-youtoola-utility.ts`

The script should accept:

- `--tab`
- `--row`

The script should return normalized JSON and preserve the visible row number.

Prefer the Google Sheets API for exact row addressing. A public CSV or GViz export can be used only when it preserves the requested row reliably. Store credentials only in environment variables. Never commit secrets.

## 6. Mandatory operating gates

Every new utility follows four separate gates:

1. PLAN
2. BUILD
3. REVIEW
4. SHIP

Never collapse these gates.

### Gate 1: PLAN

For every new utility request, begin with planning only.

During PLAN:

- inspect the repository
- fetch and verify the requested Google Sheet row
- study existing shared components and patterns
- inspect relevant existing utilities
- identify whether current packages already solve the requirement
- determine formulas, data sources and legal or safety constraints
- define the user experience
- define the SEO page structure
- define monetisation placements without damaging usability
- define analytics events
- define tests and acceptance criteria
- identify assumptions and blockers

Do not:

- edit application code
- install dependencies
- create migrations
- change environment variables
- deploy
- push
- merge
- publish

The PLAN response must use this structure:

#### A. Source verification
- tab
- visible row
- utility ID
- exact utility name
- source fields retrieved
- proposed canonical URL slug

#### B. Commercial scorecard
- score every commercial viability factor from 1 to 5
- identify the acquisition hypothesis
- identify the monetisation hypothesis
- identify the related-tool continuation path
- issue `BUILD NOW`, `BUILD AFTER VALIDATION` or `DO NOT BUILD YET`

#### C. Search and competitive research
- current primary query and meaningful variations
- current search-result landscape
- strongest direct competitors
- gaps in existing tools
- natural-language AI queries
- Youtoola differentiation
- confirmed canonical slug
- research date

#### D. Product definition
- user problem
- primary job to be done
- target user
- main input
- main output
- reason the user would trust and reuse it

#### E. V1 scope
- included
- excluded
- future extensions

#### F. Calculation or processing logic
- formulas
- units
- assumptions
- rounding
- validation rules
- edge cases
- data dependencies
- source citations required in the interface

#### G. User experience
- page sections
- input flow
- result hierarchy
- empty state
- error state
- mobile behaviour
- desktop behaviour
- accessibility requirements
- sharing or export flow

#### H. Search, AI discovery and content strategy
- primary keyword
- secondary search intents
- natural-language AI questions
- competitor gap
- unique practical value
- title
- meta description
- H1
- answer-first introduction
- explanatory content
- methodology
- worked examples
- FAQ topics
- authoritative sources
- structured data
- canonical URL
- internal links
- related tools
- sitemap and indexing plan
- post-launch measurement plan

#### I. Monetisation strategy
- free value
- ad locations
- affiliate or lead opportunities
- premium opportunity
- what must not interrupt the user

#### J. Technical implementation
- routes
- files to create
- files to modify
- shared components
- calculation engine
- server or client responsibilities
- data storage
- dependencies
- privacy implications

#### K. Analytics
- tool view
- tool start
- validation error
- calculation complete
- result share
- export
- affiliate click
- premium click
- lead submission

Do not collect personal data unless it is necessary and explicitly approved.

#### L. Test plan
- unit tests
- edge-case tests
- integration tests
- end-to-end tests
- accessibility checks
- mobile visual checks
- desktop visual checks
- performance checks
- SEO checks
- security and privacy checks

#### M. Risks, assumptions and decisions required
List only meaningful items.

End every PLAN response with exactly:

`PLAN READY. Awaiting APPROVE PLAN.`

Do not continue into BUILD until the user sends:

`APPROVE PLAN`

The user may approve with amendments. Apply the amendments to the plan before building.

### Gate 2: BUILD

After `APPROVE PLAN`:

1. create or use an isolated Git worktree or feature branch
2. use the naming pattern `utility/<canonical-slug>`
3. save the approved specification to `docs/utilities/<canonical-slug>.md`
4. implement the smallest production-quality V1
5. reuse the shared Youtoola design system
6. keep formulas or transformation logic separate from presentation
7. add tests while building
8. update the central tool registry
9. update search, category and related-tool indexes
10. update sitemap and metadata generation
11. add analytics events
12. add monetisation placeholders only where approved
13. run the complete required validation suite
14. prepare a preview build

Do not deploy to production during BUILD.

End BUILD with:

- files changed
- key implementation decisions
- commercial hypothesis implemented
- search and AI-discovery elements implemented
- monetisation path implemented or reserved
- tests run
- test results
- known limitations
- GitHub branch and pull-request status
- Vercel preview status
- unresolved blockers

Then end with exactly:

`BUILD READY. Awaiting APPROVE REVIEW.`

### Gate 3: REVIEW

After `APPROVE REVIEW`:

1. review the full diff
2. run the repository review workflow
3. inspect the page at mobile and desktop sizes
4. test all calculations independently
5. test invalid and extreme inputs
6. check accessibility
7. check privacy
8. check security
9. check metadata and structured data
10. check internal links
11. check analytics
12. check ad and premium placements
13. check that the utility remains usable without an account
14. check search-intent alignment and answer-first content
15. check production crawlability and preview `noindex`
16. check AI-search crawler policy, including `OAI-SearchBot`
17. check the commercial continuation path to a related tool, affiliate, lead or premium service
18. check that no existing utility or shared component regressed
19. fix all release-blocking findings
20. rerun tests after fixes

Default visual verification sizes:

- mobile: 430 x 932
- compact mobile: 390 x 844
- tablet: 768 x 1024
- desktop: 1440 x 900

End REVIEW with:

- prioritized findings
- fixes applied
- final validation results
- remaining non-blocking issues
- production readiness decision

Then end with exactly:

`REVIEW READY. Awaiting APPROVE SHIP.`

### Gate 4: SHIP

Only ship after the user sends:

`APPROVE SHIP`

Before production deployment:

1. verify the correct branch and commit
2. verify clean tests
3. verify required environment variables
4. verify database migrations, when applicable
5. verify rollback path
6. verify analytics and error monitoring
7. verify canonical URL
8. verify sitemap inclusion
9. verify robots and indexing rules
10. verify legal or safety disclaimers
11. verify production data sources
12. verify no secrets are exposed

After production deployment:

1. open the production URL
2. run a production smoke test
3. confirm the utility appears in Youtoola search and category navigation
4. confirm related-tool links
5. confirm analytics events
6. record the release in the changelog
7. report the live URL, GitHub pull request, commit and release notes
8. record the baseline acquisition, completion and monetisation metrics that can be measured immediately
9. define the first post-launch review date and the metrics to inspect

Never claim a deployment succeeded without verifying the live URL.

## 7. Product architecture

First inspect and preserve the existing repository architecture.

Do not replace the stack or restructure the repository without a clear reason and user approval.

When the repository is empty, propose a practical zero-cost-first architecture using:

- Next.js with App Router
- TypeScript
- reusable components
- server rendering or static generation where appropriate
- Vercel-compatible deployment
- a lightweight test setup
- no paid dependency for core utility functionality
- local browser processing where practical

Keep the platform modular.

Recommended conceptual structure:

- `app/`
- `components/`
- `components/tools/`
- `lib/calculations/`
- `lib/validation/`
- `lib/analytics/`
- `data/tools/`
- `docs/utilities/`
- `scripts/`
- `public/brand/`
- `tests/`

Maintain one canonical tool registry containing at least:

- ID
- name
- slug
- category
- short description
- keywords
- priority
- icon
- status
- release date
- related tools
- monetisation type
- source tab
- source row

The homepage, search, categories, sitemap and related-tool navigation should derive from this registry rather than duplicated lists.

## 8. Route and URL rules

Each utility gets one short, descriptive canonical path.

Use lowercase kebab case.

Prefer:

`/<clear-tool-name>`

Examples:

- `/fuel-trip-calculator`
- `/unit-price-calculator`
- `/mortgage-affordability-calculator`

Avoid:

- unnecessary nesting
- dates
- version numbers
- internal IDs
- vague slugs
- keyword stuffing

Once a utility is published, do not change its canonical slug without a redirect and user approval.

## 9. Utility page standard

Every utility page should normally contain:

1. Youtoola header
2. breadcrumbs
3. clear H1
4. one-sentence value proposition
5. the interactive utility above the fold
6. clear input labels and units
7. primary action
8. immediate result
9. result explanation
10. share, copy, print or export action when useful
11. assumptions and methodology
12. examples
13. FAQ
14. related Youtoola tools
15. monetisation area
16. privacy note when files or personal data are involved
17. footer

The tool itself must be usable before the user reaches explanatory SEO content.

Do not force registration for the main utility.

Do not use artificial countdowns, dark patterns or misleading urgency.

## 10. Brand and interface direction

Use owner-approved Youtoola logo assets only.

Use the owner-approved JPG references as the visual production source of truth. Production logo and symbol assets use pixel-faithful transparent PNG processing; SVG tracing and artwork reconstruction are prohibited unless the owner later reverses this decision. Do not redraw, reinterpret, simplify, modernise or invent missing geometry.

Before processing a logo or symbol, inspect `docs/brand/references/`. If the exact approved reference is missing or insufficient, stop and request it. Every processed asset requires rendered comparison, technical validation and explicit owner approval before commit.

Assets under `public/brand/` are judged as production assets in their intended contexts: website, navigation, browser tab, mobile, social profiles and presentations. Review renders and reconstruction measurements are diagnostic only. Visual quality at actual use sizes takes precedence over mathematical similarity to a source JPG. Never regenerate an approved asset without explicit owner instruction.

Visual direction:

- clean white or soft off-white background
- strong royal blue and cobalt as primary colours
- restrained blue-to-cyan gradients
- dark navy text
- rounded cards and controls
- soft depth and subtle shadows
- simple colour-coded utility icons
- calm, practical and premium
- generous spacing
- strong typography hierarchy
- excellent mobile readability

The Swiss Army knife is the umbrella brand metaphor: many useful tools in one place.

Do not turn every utility page into a literal Swiss Army knife illustration. Utility pages should prioritize clarity and speed.

Core copy:

- `Useful tools. No account. No nonsense.`
- `All the tools you need. In one place.`

Maintain accessible contrast. Do not use pale text that becomes unreadable.

## 11. Mobile-first requirements

Design mobile first, then expand to desktop.

Requirements:

- no horizontal scrolling
- tap targets at least 44 by 44 CSS pixels
- visible labels, not placeholder-only labels
- correct mobile keyboard types
- sensible numeric input controls
- units next to values
- results visible without unnecessary scrolling
- sticky action controls only when they improve the experience
- no intrusive interstitial advertising
- no layout shift caused by ad loading
- works with zoom and large text
- respects reduced motion

## 12. Calculation and processing integrity

For calculators and estimators:

- keep the core engine in a pure, independently testable module
- define units explicitly
- convert units centrally
- avoid floating-point surprises
- document rounding
- test minimum, maximum, zero, negative, decimal and malformed inputs
- distinguish exact values from estimates
- show assumptions
- identify country, tax-year, jurisdiction or source-date dependencies
- add a visible last-updated date when data changes over time
- never present an estimate as a guarantee

For financial, medical, legal, tax, immigration or safety-related utilities:

- research current authoritative sources
- cite the source in the interface
- include an appropriate limitation notice
- avoid personalised professional advice
- require human verification when consequences are significant

For file tools:

- process locally in the browser when feasible
- clearly disclose when a file leaves the device
- minimise retention
- delete temporary files promptly
- do not log file contents
- set file-size and format limits
- protect against malicious uploads

## 13. Search and discoverability

Every utility must be built for both humans and search engines.

Required:

- unique title and meta description
- one clear H1
- canonical URL
- Open Graph metadata
- relevant structured data
- crawlable explanatory content
- useful examples
- FAQ based on genuine questions
- internal links to related tools
- category listing
- sitemap inclusion
- fast first load
- stable layout
- semantic HTML

Do not generate thin, duplicated or filler content.

Do not create many near-identical pages solely for keyword variants.

Country-specific pages are allowed only when calculations, rules, data or user value genuinely differ.

## 14. Performance standard

Default targets for production utility pages:

- Lighthouse Performance: 90 or higher
- Accessibility: 95 or higher
- Best Practices: 95 or higher
- SEO: 95 or higher
- Core Web Vitals within good thresholds
- minimal client JavaScript
- lazy-load nonessential assets
- reserve ad dimensions to prevent layout shift
- optimise fonts and images
- no unnecessary third-party scripts

When a target cannot be met, report the reason and impact.

## 15. Accessibility standard

Meet WCAG 2.2 AA where practical.

Required:

- semantic HTML
- keyboard access
- visible focus
- labels and instructions
- error identification
- screen-reader-friendly result updates
- sufficient contrast
- colour is not the only signal
- reduced-motion support
- logical heading order
- appropriate ARIA only where native HTML is insufficient

## 16. Monetisation rules

Monetisation must be contextual and non-destructive.

Allowed patterns:

- reserved ad area after the main result
- secondary ad area between useful content sections
- relevant affiliate recommendation after the result
- optional professional quote or lead form
- premium export or saved scenarios
- ad-free upgrade
- advanced comparison
- white-label or API access

Do not:

- place an ad between the final input and the primary action
- hide the result behind registration
- obscure the result with an ad
- make an advertisement look like a tool control
- preselect paid products
- sell or expose personal data
- add irrelevant commercial offers

Clearly distinguish advertising and recommendations from Youtoola functionality.

## 17. Analytics and experimentation

Use privacy-conscious analytics.

Track meaningful product events, not sensitive input values.

Standard event names:

- `tool_view`
- `tool_start`
- `tool_validation_error`
- `tool_complete`
- `result_copy`
- `result_share`
- `result_export`
- `related_tool_click`
- `affiliate_click`
- `premium_click`
- `lead_start`
- `lead_submit`

Include:

- utility slug
- category
- device class
- locale
- result type when non-sensitive

Do not include names, email addresses, uploaded text, exact financial values, health values or other personal input in analytics payloads.

## 18. Testing standard

Every utility requires tests appropriate to its risk.

Minimum:

- unit tests for calculation or transformation logic
- input validation tests
- edge-case tests
- one successful end-to-end flow
- one invalid-input end-to-end flow
- accessibility scan
- responsive visual inspection
- metadata check
- sitemap check
- production build

Higher-risk utilities require:

- authoritative test vectors
- jurisdiction-specific fixtures
- date-sensitive fixtures
- independent formula verification
- regression cases for known failures

Never delete or weaken a meaningful test merely to make the suite pass.

## 19. Dependency discipline

Before installing a package:

1. check whether the repository already provides the capability
2. check whether the browser or platform API is sufficient
3. evaluate bundle size
4. evaluate maintenance and security
5. evaluate licence
6. explain why the dependency is justified

Ask for approval before adding a paid service or a major production dependency.

## 20. Security and secrets

Never:

- commit secrets
- print secrets in logs
- expose server credentials to the client
- trust user input
- execute uploaded content
- use `dangerouslySetInnerHTML` without sanitisation
- disable security checks to ship faster

Use environment variables and provide `.env.example` entries without real values.


## 21. GitHub and Vercel delivery architecture

GitHub is the source-control and collaboration system.

Vercel is the preview and production hosting system.

The Youtoola GitHub repository must be connected directly to the Youtoola Vercel project.

Use this default environment model:

- Local for development
- Vercel Preview for every feature branch and pull request
- Vercel Production for the protected production branch

Default production branch:

`main`

Default canonical production host:

`https://www.youtoola.com`

Configure the apex domain to redirect permanently to the canonical `www` host, unless the owner explicitly changes the canonical-host decision.

### GitHub workflow

For every utility:

1. create branch `utility/<canonical-slug>`
2. commit the approved specification
3. implement the utility
4. push the branch to GitHub
5. open a pull request
6. allow GitHub and Vercel checks to run
7. inspect the Vercel preview
8. complete REVIEW
9. obtain `APPROVE SHIP`
10. merge the approved pull request to `main`
11. allow the connected Vercel project to create the production deployment
12. verify production

Protect `main`.

At minimum, require before merge:

- pull request
- successful lint
- successful type check
- successful unit tests
- successful production build
- successful end-to-end smoke test
- successful Vercel deployment check
- resolved review comments

Do not push utility work directly to `main`.

Do not bypass failed checks.

Do not merge an unreviewed Codex change.

### Vercel workflow

Every non-production branch must receive a Vercel Preview URL.

Preview deployments must:

- use preview-only environment variables
- never use production secrets unnecessarily
- never send production analytics events
- carry `noindex, nofollow`
- be excluded from production sitemaps
- avoid canonical tags pointing to the preview host
- clearly identify themselves as preview when practical

Production deployments must:

- originate from the approved `main` commit
- use production environment variables
- attach to the canonical Youtoola domain
- expose the correct canonical URL
- be indexable unless the route is intentionally private
- pass a live smoke test
- have a documented rollback target

Prefer the GitHub-to-Vercel deployment path over manual production CLI deployment.

Do not run `vercel --prod` unless the user explicitly approves a manual production deployment.

Record for every release:

- utility slug
- source Google Sheet tab and row
- pull-request URL
- commit SHA
- Vercel preview URL
- production URL
- deployment time
- rollback deployment
- release notes
- known limitations

### Environment and secret separation

Maintain separate Local, Preview and Production values where appropriate.

Never expose server-only secrets through public environment variables.

Never commit `.env` files.

Maintain `.env.example` with names and descriptions but no real credentials.

Before BUILD, identify every required environment variable.

Before SHIP, verify that required Production values exist without printing their values.


## 22. Git and release discipline

Use one isolated branch or worktree per utility.

Branch format:

`utility/<canonical-slug>`

Commit changes in coherent units.

Do not mix unrelated refactors into a utility release.

Before SHIP:

- clean working tree
- reviewed diff
- passing tests
- release note
- rollback route

Never force-push, rewrite shared history, merge to the production branch or deploy production without explicit approval.

## 23. Definition of done

A utility is done only when:

- source row is verified
- commercial scorecard is complete
- search and competitor research is dated and documented
- approved plan exists
- V1 works on mobile and desktop
- calculations or processing are tested
- inputs and errors are accessible
- result is understandable
- methodology and assumptions are visible
- SEO metadata is complete
- canonical host and URL are correct
- production crawling is allowed
- preview indexing is blocked
- sitemap and Search Console steps are complete
- AI-search crawl policy is verified
- structured data is valid and matches visible content
- internal links work
- analytics work without exposing sensitive values
- monetisation does not harm usability
- build passes
- preview is verified
- review is complete
- production is explicitly approved
- GitHub pull request and required checks are complete
- approved commit is merged to `main`
- Vercel production deployment is verified
- live URL is smoke-tested
- rollback target is recorded
- registry, sitemap, search and changelog are updated
- baseline commercial and search metrics are recorded when available
```

---

# PART 2: FIRST-RUN CODEX BOOTSTRAP PROMPT

Use this prompt once after opening the Youtoola repository in the Codex desktop app.

```text
Set up the Youtoola repository operating system.

Work in planning first.

Read the full repository before proposing changes.

Youtoola is one umbrella platform for practical online tools, hosted at https://www.youtoola.com. Each utility must live in this repository at its own canonical root path, for example /fuel-trip-calculator.

The live utility source of truth is:
https://docs.google.com/spreadsheets/d/1BJtHQKH6MxAySfQ0C-mGrCgXdAD1efM2vIf5iDwqzpU/edit?usp=drivesdk

Your first task is not to build a utility.

Your first task is to inspect the current repository and produce a setup plan for the repeatable utility factory.

The plan must cover:

1. root AGENTS.md installation
2. current stack and repository assessment
3. live Google Sheet retrieval by exact tab and visible row
4. normalized tool registry
5. reusable utility page shell
6. shared design system
7. shared form, result, FAQ and related-tool components
8. SEO metadata, structured data and sitemap generation
9. privacy-conscious analytics
10. ad and premium placeholders
11. unit, integration, end-to-end and accessibility testing
12. preview and production deployment gates
13. documentation and changelog
14. commercial viability scoring
15. live search and competitor research workflow
16. AI and LLM discoverability controls
17. Google Search Console and Bing Webmaster Tools launch workflow
18. GitHub pull-request and protected-main workflow
19. Vercel Preview and Production environment workflow
20. preview `noindex` protection
21. exact recurring command syntax

Do not modify files during this planning turn.

End with exactly:

PLAN READY. Awaiting APPROVE PLAN.
```

---

# PART 3: RECURRING UTILITY COMMAND

Use this compact command for each new tool.

```text
YOUTOOLA PLAN

Tab: "<EXACT GOOGLE SHEET TAB NAME>"
Visible row: <ROW NUMBER>

Build the smallest production-quality V1 described by that live row.

First fetch and verify the exact row, research the live search landscape, complete the commercial scorecard, then produce the mandatory Youtoola plan.

All technical recommendations must serve user acquisition, successful utility completion, trust, search and AI discoverability, relevant monetisation and maintainable growth.

The delivery target is the connected GitHub repository and Vercel project.

Do not write code, install packages, push, open a pull request or deploy during this turn.

End with:

PLAN READY. Awaiting APPROVE PLAN.
```

Example:

```text
YOUTOOLA PLAN

Tab: "Travel & Mobility"
Visible row: 5

Build the smallest production-quality V1 described by that live row.

First fetch and verify the exact row, research the live search landscape, complete the commercial scorecard, then produce the mandatory Youtoola plan.

All technical recommendations must serve user acquisition, successful utility completion, trust, search and AI discoverability, relevant monetisation and maintainable growth.

The delivery target is the connected GitHub repository and Vercel project.

Do not write code, install packages, push, open a pull request or deploy during this turn.

End with:

PLAN READY. Awaiting APPROVE PLAN.
```

After reviewing the plan:

```text
APPROVE PLAN
```

After reviewing the completed build:

```text
APPROVE REVIEW
```

After reviewing the final release candidate:

```text
APPROVE SHIP
```

---

# PART 4: OPTIONAL COMPACT COMMAND GRAMMAR

Codex should also understand this shorter form:

```text
YOUTOOLA PLAN | tab="<TAB>" | row=<VISIBLE_ROW>
```

Examples:

```text
YOUTOOLA PLAN | tab="Property & Construction" | row=5
```

```text
YOUTOOLA PLAN | tab="Business & Freelance" | row=8
```

```text
YOUTOOLA PLAN | tab="Viral & Shareable" | row=9
```

Codex must always resolve the command to the exact live row and echo the utility name before planning.

---

# PART 5: OPTIONAL COMMANDS

## Plan a utility without building

```text
YOUTOOLA PLAN | tab="<TAB>" | row=<ROW>
```

## Reopen an existing utility plan

```text
YOUTOOLA REPLAN | slug="<SLUG>" | change="<REQUIRED CHANGE>"
```

## Fix a released utility

```text
YOUTOOLA FIX | slug="<SLUG>" | issue="<ISSUE>"
```

A FIX still requires a focused plan before code changes.

## Improve an existing utility

```text
YOUTOOLA IMPROVE | slug="<SLUG>" | objective="<OBJECTIVE>"
```

An IMPROVE request must protect existing URLs, calculations, analytics and SEO.

## Audit a utility

```text
YOUTOOLA AUDIT | slug="<SLUG>"
```

Audit:

- calculation integrity
- UX
- mobile behaviour
- accessibility
- performance
- SEO
- analytics
- privacy
- security
- monetisation
- regression risk

Do not change code during the first audit turn.

## Audit the full platform

```text
YOUTOOLA PLATFORM AUDIT
```

Return a prioritized backlog. Do not silently refactor the entire product.

---

# PART 6: IMPORTANT IMPLEMENTATION DECISION

Do not depend on a single long prompt being remembered forever.

The persistent instructions belong in the repository root `AGENTS.md`.

The recurring user command should remain short.

The Google Sheet contains product ideas. The repository contains the production truth for already released utilities.

When the sheet changes after a utility is released:

- do not silently change the live utility
- compare the new row with the saved utility specification
- produce a change impact plan
- require approval before modifying
