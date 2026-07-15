# Analytics and Monetisation Operations

## Phase 11 Unit 2 operating state

- Local: provider absent, transmission blocked, protected in-memory inspector allowed.
- Preview: Production provider and measurement ID absent, transmission blocked, protected noindexed inspector allowed.
- Production: provider adapter is dormant, configuration is disabled, transmission is blocked, inspector is absent and commercial output is absent.
- Consent: defaults to `unknown`; no automatic banner or cookie while analytics is dormant, and no queue, buffer or replay exists. Footer preferences explain the dormant state.
- Experiments: definition validation only; no assignment.

Run `npm run architecture:validate` for the contract suite. It is offline and is required by Quality CI.

## Provider activation boundary

Only Phase 11 may add GA4 after owner approval of the property and stream, jurisdictions and consent policy, final parameters, retention, dashboard, monitoring, failure thresholds, and rollback. Provider activation must preserve the first-party envelope, load only in Production after permission, remain outside calculations, tolerate offline/failure/timeout states, and prove Local and Preview send nothing.

The dispatcher and provider boundary must return immediately. UI code must never await analytics. A provider reports a bounded delivery outcome; offline, failure and timeout outcomes are dropped without synchronous retry, buffering, persistence or later replay.

Clarity remains disabled until conventional analytics identifies a specific question that cannot be answered more safely, followed by separate privacy, masking, performance, CSP, cost, and owner review.

## Commercial activation boundary

Before activation, verify owner approval, relevance, disclosure, jurisdiction, consent, provider, free-result completion, placement, accessibility, page speed, failure isolation, and rollback. Do not place advertising before the result or between the final input and calculation action. Do not put user state in destination URLs or cloak destinations. Do not present commercial material as calculation authority.

### Advertising

Future advertising is non-personalized by default, labelled `Advertising`, dimension-reserved and hidden when unconfigured. It cannot appear before the complete result, between the final input and action, as deceptive native functionality, against sensitive utility context, or as an unapproved Production placeholder. Automatic refresh is disabled by default.

### Affiliate

Future affiliate recommendations require direct relevance, an approved provider and destination category, the working disclosure recorded in the architecture, and a complete free result. Outbound URLs cannot contain user state or hide the destination. Price and availability claims require current evidence. Commercial sources cannot be calculation authorities.

### Premium and lead

A future premium product must state its value, preserve the useful free result and visible methodology, require no account for the free result, and use no false scarcity or silent downgrade. A future lead flow must be optional, purpose-specific and explicitly consented; collect only necessary data; never prefill private scenario values or transmit them invisibly; define an approved provider plus retention and deletion policy; and preserve the free result when submission fails.

## Legal-review triggers

Stop for legal and privacy review before enabling any analytics or consent provider, advertising, affiliate tracking, commercial events, lead processing, session replay, or Clarity. Do not claim compliance until the applicable jurisdictions and implementation have been reviewed.
