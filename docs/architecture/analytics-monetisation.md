# Analytics, Experimentation and Monetisation Architecture

Phase 8 establishes contracts only. It adds no provider, measurement ID, network request, cookie, storage, database, active commercial output, experiment assignment, or public-route JavaScript.

## Analytics boundary

Utility code supplies a candidate event and canonical utility eligibility. A released-only resolver supplies utility ID, slug, category, trusted release reference and released target IDs from public discovery truth; callers cannot put those values in the candidate payload. Registry lifecycle and public Knowledge Layer truth remain authoritative for identity and release status. The dispatcher applies lifecycle, environment, consent, payload, eligibility, deduplication, and provider gates. Local and Preview always stop at the environment gate. Production stops at `provider-missing` in Phase 8. Rejections expose only stable, non-sensitive reason codes.

Consent defaults to `unknown`. Events before consent or after denial are dropped, never buffered or replayed. `analytics-granted` is the only Phase 8 state eligible for analytics; `marketing-granted` is reserved for separately approved marketing behavior. Withdrawal must disable an adapter and clear ephemeral queues and deduplication state. Phase 8 stores no consent.

Deduplication uses in-memory numeric route, interaction-cycle, attempt, and action counters with an event-to-scope allowlist. Keys contain no input or result data and disappear on reset or reload. Dispatch returns immediately; the provider boundary is non-blocking and reports only `accepted`, `offline`, `provider-failure`, or `timeout`. There is no synchronous retry. Provider errors are isolated and never block calculation, result display, validation, navigation, copy, share, export, destination access, or lead submission.

## Commercial boundary

The only capability types are advertising, affiliate, premium, and lead. A record cannot activate itself. Rendering requires a complete free result, utility eligibility, owner and placement approval, configured provider, consent and jurisdiction permission, disclosure, and Production activation. Failure of any condition renders nothing. Capability contracts contain no live offers, prices, providers, or destinations.

Future advertising is non-personalized by default, labelled, dimension-reserved, after value delivery, and not auto-refreshed. Affiliate recommendations require direct relevance and the working disclosure: “Youtoola may earn a commission if you use this link, at no extra cost to you.” Premium cannot hide the free result or methodology. Lead participation is optional and must use minimum necessary data with an approved provider and retention policy.

## Experiment boundary

Definitions are server-side governance records only. No assignment, randomization, traffic allocation, flag provider, or persistence exists. Allowed subjects are `copy`, `layout`, `related-tool-ordering`, `discovery-wording`, `commercial-placement-wording`, and `non-critical-default-presentation`. Formulas, calculation truth, validation, methodology, factual claims, disclosures, consent, privacy, accessibility, canonicals, indexing, structured data, security, entitlements, and high-consequence warnings are never experimental.

Future assignment preference is server-side with a short-lived first-party cookie only after consent and legal review; users without permission receive control. Fingerprinting, device hashing, repeated random reassignment, and unreviewed provider-managed testing are prohibited.
