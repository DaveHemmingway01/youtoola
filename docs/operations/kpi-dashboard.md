# KPI and Dashboard Specification

Phase 8 defines metrics; Phase 11 activates and verifies measurement.

## Baseline KPIs

- Acquisition: organic landing sessions; Search Console impressions, clicks, search CTR, and average position.
- Utility: views, start rate, validation-failure rate, completion rate, coarse time to result, copy, share, and export rates.
- Continuation: related-tool continuation, directory-to-tool movement, and journey progression once journeys are public.
- Quality: redacted application error rate, Core Web Vitals, methodology freshness, correction frequency, and deployment failure rate.
- Commercial: inactive until providers exist. Clicks per completed use are not click-through rate without a reliable impression denominator.

## Smallest dashboard approach

Use GA4, Google Search Console, and Bing Webmaster Tools native reports plus GitHub and Vercel evidence. Store one version-controlled monthly aggregate snapshot with period, source, metric definition, value, comparison period, release references, interpretation, data-quality note, and owner-reviewed actions. Never store event-level, personal, sensitive, input, or result data in the repository.

Defer Looker Studio until multiple utilities or repeated manual consolidation creates measured value. Use the shortest provider retention compatible with the review cadence; owner and legal approval remain Phase 11 decisions.
