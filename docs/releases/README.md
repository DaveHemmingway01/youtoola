# Release Records

Release records are canonical JSON files named `docs/releases/<date>-<phase-or-slug>.json`. `CHANGELOG.md` remains the concise narrative summary.

Records use schema version `3` and are validated by `npm run validate:release` and `npm run validate:delivery`. Risk tags are additive; evidence is the union of every selected tag. Evidence entries require an ID, a `pending`, `passed` or `approved` status, a durable reference when known and a fresh review date when complete.

Candidate records contain all evidence known before merge and use `production: null`. They may use `pending` for the PR before it exists and `pending-review` for the reviewed head before it is known. PLAN approval and a usable rollback plan are never pending.

Provenance records the source branch and source commit, pull request, reviewed branch head, retained source ref and review date independently from the later merge method, merge commit, durable release commit and merge timestamp. Squash merges intentionally do not require the reviewed head to be an ancestor of `main`. Completed records instead prove that the reviewed head belongs to the retained source history and that the durable commit belongs to `main`, matches the merge result and matches the Production deployment.

Schema v3 also records release kind, structured Preview evidence, the required-check set, environment policy and structured immediate, 24-hour, 7-day, 28-day, monthly and quarterly follow-ups. Overdue follow-ups are visible during normal validation and block `npm run validate:delivery -- --ship`.

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

Release evidence is append-only in meaning. If a completed record contains a factual error, add a separately owner-approved `correction` record that references the original record and durable evidence. Do not overwrite history. A documentation-only record-completion PR may finish an existing release without creating another application candidate; it still requires protected checks and owner SHIP approval.
