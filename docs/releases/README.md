# Release Records

Release records are canonical JSON files named `docs/releases/<date>-<phase-or-slug>.json`. `CHANGELOG.md` remains the concise narrative summary.

Records use schema version `1` and are validated by `npm run validate:release`. Risk tags are additive; evidence is the union of every selected tag. Evidence entries require an ID, `passed` or `approved` status, a durable reference and a fresh review date.

Candidate records contain all evidence known before merge and use `production: null`. They may use `pending` for the PR before it exists and `pending-review` for the final reviewed commit. PLAN approval and a usable rollback plan are never pending.

Completed records require:

- matching merge and Production deployment commits;
- Production deployment ID;
- live HTTPS URLs;
- smoke results;
- previous Ready rollback deployment;
- release date;
- immediate follow-up date.

Complete Production fields through a documentation-only follow-up PR. The SHIP report is temporary operational evidence until that PR merges.

Never store secrets, event-level analytics, personal data, utility inputs, exact private results, provider payloads or legal-compliance claims in a release record. Approved exceptions are limited, owner-approved, expiring and paired with remediation. Critical, High, rollback, qualified-review and sensitive-data requirements are not casually exceptionable.
