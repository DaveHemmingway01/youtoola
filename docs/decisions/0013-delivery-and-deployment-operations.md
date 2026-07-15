# ADR 0013: Delivery and Deployment Operations

- Status: Accepted
- Date: 2026-07-15
- Decision owner: Youtoola owner

## Context

Phases 1–9 established protected delivery and evidence contracts. Phase 10 must make the operating path explicit without replacing the working GitHub-to-Vercel integration or adding infrastructure.

## Decision

Use GitHub as release authority and Vercel as deployment executor. Require protected `main`, the existing three required checks, resolved conversations and squash-only merges. Retain source branches. Treat Vercel environment identity as authoritative, keep Preview authenticated and noindexed, and permit Production deployment only from merged `main` through the Git integration.

Use schema-version 3 release records with structured Preview, required-check, follow-up-review and correction evidence. Overdue follow-ups warn during ordinary validation and block SHIP validation. Historical evidence is immutable; a factual error is corrected by a separately approved correction record.

Use package-free read-only Production smoke checks and existing GitHub Actions. Pin Actions to full SHAs. Add no staging environment, paid monitor, deployment queue, provider, runtime package or public feature.

## Consequences

Delivery remains low-cost and auditable. A solo maintainer can ship without an artificial approval requirement, while automation still fails closed. Operational evidence takes more discipline, and future staffing will require a separate decision for CODEOWNERS and independent approvals.

## Revisit triggers

Revisit when there are multiple maintainers, concurrent releases cause material queueing, Production recovery evidence proves insufficient, or a regulated/high-consequence utility requires a separate environment.
