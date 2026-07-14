# KPI and Dashboard Specification

Phase 8 defines metrics; Phase 11 activates and verifies measurement. The Youtoola owner owns definitions and monthly decisions. Source owners own access and data-quality notes. Ratios use the same Production date range, consent population and released-utility scope in numerator and denominator; a zero denominator produces `not available`, never zero percent.

## Phase 11 baseline definitions

| KPI | Exact numerator / value | Exact denominator | Source and cadence | Owner | Known blind spot |
| --- | --- | --- | --- | --- | --- |
| Organic landing sessions | Production sessions whose default channel is Organic Search and whose first page is Youtoola | All Production sessions | GA4; monthly | Youtoola owner | Consent denial and blockers undercount sessions. |
| Search impressions | Google impressions for canonical Youtoola URLs | Not applicable | Search Console; monthly | Search owner | Sampling, privacy thresholds and reporting delay apply. |
| Search clicks | Google clicks for canonical Youtoola URLs | Not applicable | Search Console; monthly | Search owner | Does not include AI answers or Bing. |
| Search click-through rate | Search Console clicks | Search Console impressions | Search Console; monthly | Search owner | Query and page aggregation can hide mix changes. |
| Average search position | Search Console's impression-weighted position value | Search Console impressions, as calculated by Search Console | Search Console; monthly | Search owner | It is not a rank tracker and varies by query, device and location. |
| Tool views | Accepted `tool_view` events | Not applicable | GA4; monthly | Product owner | Consent loss undercounts; route deduplication counts views, not people. |
| Start rate | Accepted `tool_start` events | Accepted `tool_view` events | GA4; monthly | Product owner | Reloads and multiple interaction cycles can distort event ratios. |
| Validation-failure rate | Accepted `tool_validation_error` attempt events | Accepted `tool_validation_error` plus `tool_complete` attempt events | GA4; monthly | Product owner | Abandoned attempts that produce neither event are invisible. |
| Completion rate | Accepted `tool_complete` events | Accepted `tool_start` events | GA4; monthly | Product owner | Recalculation can produce more than one completion per start; report the raw ratio and event counts. |
| Coarse time to result | Distribution of `timeToResultBucket` on accepted `tool_complete` events | Accepted `tool_complete` events carrying the bucket | GA4; monthly | Product owner | Buckets are coarse and omit abandoned uses. |
| Copy, share or export rate | Accepted event count for the named result action | Accepted `tool_complete` events for utilities eligible for that action | GA4; monthly | Product owner | Repeated intentional actions count; provider/browser failure can suppress actions. |
| Related-tool continuation | Accepted `related_tool_click` events | Accepted `tool_complete` events for utilities with a released related target | GA4; monthly | Product owner | It measures clicks, not completion of the next tool. |
| Directory-to-tool movement | `/tools` navigation sequences whose next Youtoola page is a released utility | `/tools` page views | GA4 path report; monthly | Discovery owner | Consent loss, new tabs and direct navigation can break sequence attribution. |
| Journey progression | Consecutive released utility views matching an approved public journey stage order | Eligible journey-entry sequences | GA4 path report; only after journeys publish | Discovery owner | Unavailable until public journeys and sufficient consented traffic exist. |
| Redacted application error rate | Redacted application errors on Production requests | Production requests | Vercel logs; monthly | Engineering owner | Client errors not reaching logs may be absent. |
| Core Web Vitals | Good/needs-improvement/poor distributions for LCP, INP and CLS | Eligible field observations | Search Console and CrUX; 28-day rolling | Engineering owner | Low traffic can delay or suppress field data. |
| Methodology freshness | Released utility methodologies reviewed within their approved freshness window | Released utilities requiring methodology review | Repository records; monthly | Editorial owner | A current review date does not prove source correctness. |
| Correction frequency | Owner-approved calculation or methodology correction releases | Released utilities | Git and changelog; monthly | Editorial owner | Minor defects fixed without formal classification may be missed. |
| Deployment failure rate | Failed Production deployments | All Production deployment attempts | Vercel and GitHub; monthly | Engineering owner | Provider status does not prove the deployed product worked for users. |

Bing impressions, clicks, click-through rate and position use the equivalent Bing Webmaster Tools definitions and remain separate from Google values. GitHub and Vercel evidence supports quality and release metrics; it is not joined to user-level analytics.

## Later commercial definitions

Commercial metrics remain inactive until a provider and capability are approved. Affiliate, premium and lead clicks per completed eligible use equal accepted named click or submit events divided by accepted `tool_complete` events for utilities eligible for that capability. These are continuation or conversion ratios, not click-through rates. Advertising click-through rate is unavailable until a separately approved, reliable impression denominator exists. Revenue per session and per completed use require approved provider revenue totals divided by consented Production sessions or accepted completions, with coverage limitations shown.

## Smallest dashboard approach

Use GA4, Google Search Console, and Bing Webmaster Tools native reports plus GitHub and Vercel evidence. Store one version-controlled monthly aggregate snapshot with period, source, numerator, denominator, metric definition, value, comparison period, release references, interpretation, data-quality note, blind spots, owner and owner-reviewed actions. Never store event-level, personal, sensitive, input or result data in the repository.

Defer Looker Studio until multiple utilities or repeated manual consolidation creates measured value. Use the shortest provider retention compatible with the review cadence; owner and legal approval remain Phase 11 decisions.
