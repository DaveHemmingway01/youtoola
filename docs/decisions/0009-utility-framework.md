# ADR 0009: Explicit utility forms and browser-local calculation framework

Status: Accepted for Phase 6 implementation review.

## Decision

- Use explicit per-utility React forms rather than a dynamic form renderer.
- Use handwritten typed parsing and validation; native attributes remain browser hints.
- Run ordinary calculations locally in a small Client Component with no transmission or persistence.
- Keep calculation engines pure and independent from React, DOM, locale, network, registry URLs, analytics and commercial providers.
- Use native `Number` for ordinary bounded estimates and safe integer minor units for exact currency where practical.
- Add no schema, form, decimal, date, sharing, export or analytics package.
- Keep the page shell, methodology and discovery composition server-rendered.
- Keep related-tool selection released-only and commercial output absent when unconfigured.
- Define analytics eligibility without dispatch or provider integration.
- Keep Fuel Trip Calculator unclassified and test-only; use a neutral fictional review example.
- Defer utility scaffolding, native sharing, export, persistence and automatic calculation.

## Rationale

The explicit model preserves utility-specific completion and accessibility while standardising correctness boundaries. Browser-local work produces an immediate result without exposing input. Avoiding dependencies and premature generators keeps the factory inexpensive and changeable until a real utility proves its contract.

## Consequences

Each utility owns a small amount of intentional form code. Shared validators and result contracts require tests, but utility truth remains visible rather than hidden in a general engine. A future dependency or persistence feature requires a utility-specific plan and owner approval.
