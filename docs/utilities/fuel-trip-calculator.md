# Fuel Trip Calculator — RAPID specification

Status: owner-authorised PLAN and BUILD candidate; not approved for public release.

## Source verification

- Spreadsheet: Youtoola Utility Opportunity Map
- Tab and row: `Travel & Mobility`, visible row `5`
- Source ID and utility: `21`, Fuel Trip Calculator
- Core use: calculate fuel, tolls, return journeys and cost per passenger
- Monetisation route: fuel, rental-car and travel affiliates
- Priority: Tier 1
- Retrieved: 2026-07-16 through live GViz
- Source hash: `sha256:88b614a6c8ca091012fc4b996389fd6aff3f2f8769d3e2567ec17bf4aba6d0de`
- Canonical slug reserved: `fuel-trip-calculator`

The Sheet is opportunity provenance, not calculation authority.

## Commercial decision

| Factor | Score | Reason |
| --- | ---: | --- |
| Search demand potential | 4 | Trip-fuel and fuel-cost questions have durable practical intent. |
| Clarity of search intent | 5 | Users want an immediate cost and fuel estimate. |
| Commercial value | 4 | The task precedes fuel, route, rental and travel purchases. |
| Competition difficulty | 2 | Many calculators exist, so usefulness and clarity must differentiate. |
| Better-utility potential | 4 | Return travel, total tolls and fair splitting can be presented in one calm flow. |
| Repeat use | 4 | Commuters and trip planners can return whenever distance or prices change. |
| Shareability | 4 | A per-person result is naturally shareable, though sharing is deferred. |
| Internal-link potential | 4 | Future distance, toll, mileage and road-trip tools are natural continuations. |
| Advertising suitability | 3 | Travel intent is relevant, but advertising must follow the result. |
| Affiliate or lead potential | 4 | Fuel, rental-car and travel offers can be relevant after value. |
| Premium-service potential | 2 | Scenario comparison may add value later, but V1 should stay free. |
| Build effort | 5 | The formula is stable and browser-local with existing components. |
| Data-maintenance burden | 5 | Users supply changing prices and tolls; Youtoola maintains no rate feed. |
| Regulatory risk | 5 | This is a transparent planning estimate, not regulated advice. |
| Defensibility | 3 | Trust, performance, transparent formulas and a connected tool portfolio provide modest defensibility. |

Decision: `BUILD NOW` as a private Preview candidate. Public SHIP remains blocked by Growth Infrastructure.

Commercial hypothesis: people arrive through queries such as “fuel trip calculator”, “fuel cost calculator”, “road trip cost calculator” and natural-language questions about splitting petrol and tolls. Their job is to estimate the journey budget quickly using their own current values. Completion is a valid calculation. After value, future released related tools and clearly labelled fuel, rental-car or travel affiliates may provide continuation; no commercial provider is active in this candidate.

## Search and competitor research

Researched 2026-07-16. Leading results commonly calculate distance × L/100 km × price, while stronger examples add round trips, tolls and passenger splitting. Examples inspected include FuelTripCalculator.com, FuelCalc Australia, Numbersmith and TripiCalc. Common weaknesses are invented vehicle or price defaults, region-specific assumptions, crowded extras and unclear treatment of return tolls.

Youtoola's V1 differentiates through no defaults, an explicit whole-journey toll field, a compact breakdown, browser-local privacy and transparent assumptions. Primary intent is `fuel trip calculator`; related intents include `fuel cost calculator`, `road trip cost calculator`, `petrol cost calculator`, `fuel needed for trip` and `split trip cost`. Natural-language questions include “How much fuel will my return trip use?” and “How much should each passenger pay including tolls?”

The public title, metadata, structured data, FAQ eligibility and indexing remain deferred until the route is approved for release. The calculation methodology cites the EU convention that passenger-car consumption is expressed in litres per 100 kilometres: <https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX:31999L0094>.

## V1 product contract

Target user: a driver or passenger who knows the route distance, vehicle consumption, current fuel price and any toll total.

Included:

- one-way distance in kilometres;
- fuel consumption in litres per 100 kilometres;
- fuel price per litre, in the user's chosen currency;
- explicit one-way or return selection;
- optional whole-journey toll cost;
- passenger count including the driver;
- total journey distance, fuel required, fuel cost, total trip cost and equal cost per passenger.

Excluded: maps, live distances, fuel-price feeds, toll lookup, vehicle presets, imperial units, parking, wear, depreciation, route optimisation, saved scenarios, accounts, persistence, URL state, sharing, export and commercial links.

## Formula and units

Let `m = 1` for one-way and `m = 2` for return.

1. `journey distance km = entered one-way distance km × m`
2. `fuel required L = journey distance km × consumption L/100 km ÷ 100`
3. `fuel cost = fuel required L × price per litre`
4. `total trip cost = fuel cost + entered whole-journey toll cost`
5. `cost per passenger = total trip cost ÷ passenger count`

Tolls are never doubled automatically because return tolls can differ. The user enters the total for the complete journey. Passenger count includes the driver. Raw arithmetic is retained internally; displayed fuel, distance and costs round to at most two decimal places. All costs remain in the same unspecified currency unit entered by the user.

Distance and consumption must be greater than zero. Price and tolls must be zero or greater. Passenger count must be a positive whole number. Values and derived results must be finite. Empty optional tolls mean no toll amount is included. Actual consumption can vary with traffic, speed, terrain, weather, load and driving style.

## UX, privacy and acceptance

The private Preview page uses the shared utility shell, visible labels and units, a required trip-type choice, an error summary linked to fields, a Calculate action, Reset, a polite result announcement and an immediate breakdown. It works from 320 px upward, supports keyboard-only completion and keeps controls at least 44 CSS pixels high.

All calculation happens in the browser. The utility creates no account, network calculation request, cookie, local storage, session storage or URL state. It does not send raw inputs or exact results to analytics. Commercial and related-tool output is absent while unconfigured or unreleased.

Required RAPID evidence: calculation and boundary tests, component interaction tests, browser success and invalid flows, accessibility scan, no-overflow checks, strict type-check, build and CI. `/fuel-trip-calculator` must remain 404; the Preview review route must be noindexed and absent from the sitemap.
