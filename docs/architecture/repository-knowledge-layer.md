# Repository Knowledge Layer

Status: Phase 4 implementation candidate.

## Purpose and boundary

The Repository Knowledge Layer is a repository-controlled semantic layer built from typed TypeScript records, selectors and deterministic validation. It connects the canonical utility registry to categories, journeys, intent clusters, concepts, formula-family classifications, units and sources without a database, graph platform or runtime service.

Phase 4 creates no public page, API, search index, sitemap entry or utility. Phase 5 may consume public-safe selectors only after its own approval.

## Schema version

`knowledgeSchemaVersion: 1` identifies the structure of the complete model. It is not a content revision and does not replace record review dates or utility source hashes.

A future schema change requires an approved repository migration that updates the schema constant, every fixture, validation, tests and documentation in one reviewed pull request. There is no migration framework or runtime compatibility layer.

## Entity identities and lifecycle

The canonical internal reference is `<entity-type>:<lowercase-kebab-case-key>`. IDs remain stable when display names change, remain reserved after retirement and are globally unique.

Supported prefixes are `platform`, `utility`, `category`, `journey`, `intent`, `concept`, `formula-family`, `unit`, `source` and future-compatible `jurisdiction`. Phase 4 contains no jurisdiction data.

Non-utility entities use `provisional`, `active`, `inactive` or `retired`. Utilities retain the Phase 3 lifecycle. Automation and contributors may propose or validate records; only the owner may activate, approve public eligibility or relationships, retire records, change utility lifecycle, approve new public relationship types or change released identities.

## Storage

- `data/registry/tools.ts` remains canonical utility truth.
- `data/registry/categories.ts` and `data/registry/journeys.ts` hold reviewed discovery classifications.
- `data/entities/` holds the remaining semantic entity types.
- `data/relationships/utility-relationships.ts` is the single store for human-reviewed utility-to-utility edges.
- Derived inverse and shared-reference views are computed by selectors and never duplicated in data.

Categories remain flat. Hierarchy is prohibited until portfolio evidence justifies it.

## Taxonomy ownership

- A category owns broad browse classification.
- A journey owns an ordered user objective and its stages.
- An intent cluster owns closely related user questions or jobs.
- A concept owns a reusable definition of an input, output or domain idea.
- A formula family classifies related calculation purposes without defining an equation.
- A unit identifies measurement semantics; Phase 4 defines no conversions.

Records reference stable IDs instead of copying definitions.

## Relationships and rationale

Stored types are `related`, `next-step`, `alternative`, `comparison`, `prerequisite` and internal `input-provider`. `previous-step` and `output-consumer` are inverse views. `same-journey`, `same-formula-family` and `same-intent-cluster` are derived internal views.

Every stored edge requires a specific human-written rationale, approval status, reviewed date and valid endpoints. Generic rationales such as “similar tool” fail validation. Symmetric edges use one canonical endpoint order; inverse and reciprocal duplicates are prohibited.

Future public candidates are limited to `related`, `next-step`, derived `previous-step`, `alternative`, `comparison` and `prerequisite`. Public selection additionally requires an approved relationship, human rationale, permitted visibility, two released utilities, active referenced entities and no retired record.

## Journey governance and future slots

`journey:road-trip-planning` is provisional, inactive and internal. It proves ordered stages and references the Fuel Trip Calculator idea without releasing it.

Future journey slots contain only a working label, purpose, stage position, rationale, optional expected capability and `future` or `unapproved` status. They have no entity ID, utility ID, slug, URL, registry record or relationship endpoint and are always removed from public selectors. A slot is replaced only through an approved process after a real utility registry record exists.

Public journeys require an active public record, at least two released utilities, no future slots and complete reviewed stages.

## Formula-family classification

`formula-family:trip-cost` is provisional classification only. It records purpose, related concepts and compatible unit families. It contains no equation, constant, rounding rule, calculation step, default, assumption, rate or jurisdiction logic. Utility #1 research and approval own the eventual calculation contract.

## Source authority

Sources are classified as:

- `provenance`: origin of an opportunity, decision or internal record;
- `authoritative`: official or technically reliable support for facts, standards, regulations or calculations;
- `commercial`: a provider or marketplace that may support offers but is not calculation authority.

`source:google-sheet-youtoola-map` is provenance only. It is neither authoritative nor commercial.

## Selector boundary

Internal selectors may inspect all records. Public-safe selectors never accept a bypass flag. They filter for released utilities, active referenced entities, approved human-reviewed relationships, complete active journeys and permitted visibility. With the Phase 4 fixture, every public selector involving Fuel Trip Calculator returns an empty result.

No Phase 4 module is imported by `app/` or a client component.
