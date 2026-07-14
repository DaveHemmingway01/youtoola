# Analytics and Monetisation Operations

## Phase 8 operating state

- Local: provider absent, transmission blocked, protected in-memory inspector allowed.
- Preview: Production provider and measurement ID absent, transmission blocked, protected noindexed inspector allowed.
- Production: provider absent, transmission blocked, inspector absent, commercial output absent.
- Consent: defaults to `unknown`; no banner, storage, queue, buffer, or replay.
- Experiments: definition validation only; no assignment.

Run `npm run architecture:validate` for the contract suite. It is offline and is required by Quality CI.

## Provider activation boundary

Only Phase 11 may add GA4 after owner approval of the property and stream, jurisdictions and consent policy, final parameters, retention, dashboard, monitoring, failure thresholds, and rollback. Provider activation must preserve the first-party envelope, load only in Production after permission, remain outside calculations, tolerate offline/failure/timeout states, and prove Local and Preview send nothing.

Clarity remains disabled until conventional analytics identifies a specific question that cannot be answered more safely, followed by separate privacy, masking, performance, CSP, cost, and owner review.

## Commercial activation boundary

Before activation, verify owner approval, relevance, disclosure, jurisdiction, consent, provider, free-result completion, placement, accessibility, page speed, failure isolation, and rollback. Do not place advertising before the result or between the final input and calculation action. Do not put user state in destination URLs or cloak destinations. Do not present commercial material as calculation authority.

## Legal-review triggers

Stop for legal and privacy review before enabling any analytics or consent provider, advertising, affiliate tracking, commercial events, lead processing, session replay, or Clarity. Do not claim compliance until the applicable jurisdictions and implementation have been reviewed.
