# Utility Page Shell and Calculator Framework

Status: Phase 6 implementation candidate.

## Boundary

Phase 6 provides reusable contracts and presentation patterns without publishing a utility. The canonical registry retains identity, URL, category and lifecycle authority. Every future utility uses an explicit React form and a pure calculation module; there is no dynamic form engine, runtime schema framework, calculation service or catch-all utility route.

The Fuel Trip Calculator remains an `idea`. Its framework fixture is test-only, unclassified, contains no approved formula, limits, defaults, rates, content or methodology, and is never imported by application code.

## Future utility contract

```text
utilities/<slug>/
  definition.ts
  calculation.ts
  form.tsx
  calculation.test.ts
```

- `definition.ts` references the registry utility ID and owns reviewed utility-specific contracts.
- `calculation.ts` owns typed parsing, validation and pure deterministic calculation.
- `form.tsx` is the smallest browser-local Client Component and receives only data required for interaction.
- `calculation.test.ts` owns authoritative, boundary and regression vectors.

Separate schema or content files require evidence from a real utility. Scaffolding remains deferred until Utility #1 proves the contract.

## Server and client boundary

`UtilityPageShell` is a Server Component. It orders breadcrumbs, title, answer-first copy, interactive slot, worked example, methodology, genuine FAQs, released related tools, privacy and configured commercial continuation. Static content remains crawlable when JavaScript is unavailable.

The utility island owns raw input state, parsing, validation, calculation invocation, result state, reset and copy interaction. Ordinary calculations use no network, server state, URL state, cookie or browser storage. Registry records, methodology and long-form content stay outside the client bundle.

## Validation and results

Native input attributes are hints. Typed handwritten validators own deterministic error codes, messages, field order, cross-field checks and summary behavior. Failed submission focuses the summary; summary links focus fields; edited invalid fields revalidate; successful calculation does not move focus.

The result contract is presentation-independent. It distinguishes exact values from estimates and retains raw normalized values, formatted display values, units, assumptions, warnings, limitations, versions and an approved copy payload. It never contains JSX, registry URLs, provider identifiers, analytics dispatch or affiliate links.

## Numeric and formatting policy

Native `Number` is approved for ordinary bounded physical estimates. Exact currency arithmetic should use safe integer minor units where practical. Rounding occurs only at an explicit output boundary. Internal arithmetic is locale-independent; `Intl.NumberFormat` is display-only with an explicit locale.

Distance converts through canonical metres. Fuel-consumption conversion, arbitrary precision and date arithmetic remain deferred to utility-specific approval.

## Risk and source governance

Profiles are `standard`, `data-dependent`, `regulated-high-consequence` and `unclassified`. An unclassified definition cannot be released. The owner approves versions, assumptions, warnings, risk and release. Regulated or high-consequence utilities require an identified independent reviewer.

| Profile | Sources and review | Tests and monitoring |
| --- | --- | --- |
| `standard` | Documented stable inputs and owner review | Boundary, error and regression vectors; normal release monitoring |
| `data-dependent` | Authoritative versioned source, freshness expectation and update owner | Stale/unavailable fixtures plus scheduled source review |
| `regulated-high-consequence` | Current jurisdiction-specific authority, named independent reviewer and owner approval | Independently derived authoritative vectors, date/jurisdiction regressions and stronger post-release monitoring |
| `unclassified` | Internal definition or fixture only | Public release is rejected |

Methodology contracts include formula steps, assumptions, limitations, examples, citations, source authority, reviewed dates and freshness expectations. The opportunity Sheet is provenance only and cannot be calculation authority.

## Related, commercial and analytics boundaries

Related tools are composed through public-safe Phase 4 and Phase 5 selectors. No released relationship means no card, placeholder or unavailable link.

Commercial capabilities are advertising, affiliate, premium and lead. Unconfigured Production output is absent. The review surface may show inert labelled examples after free value.

Analytics contracts define eligibility only. They permit non-sensitive identity and categorical context and explicitly prohibit raw inputs, exact results, names, emails, files and personal or sensitive data. Phase 6 has no dispatcher, provider, consent or network transmission.

## Performance budgets

- utility island target 12 KB gzip; hard limit 20 KB gzip
- Phase 6 CSS contribution at most 10 KB gzip
- total route CSS at most 30 KB gzip
- initial utility HTML at most 50 KB gzip
- synchronous calculation under 50 ms
- visible interaction under 100 ms
- CLS at most 0.05
- zero third-party scripts and calculation requests

Measured exceptions require owner approval.
