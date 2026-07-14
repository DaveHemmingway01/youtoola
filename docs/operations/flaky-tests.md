# Flaky-Test Policy

CI uses zero Playwright retries locally and one retry in CI. `failOnFlakyTests` is enabled, so a first failure followed by retry success still fails the job. The first retry retains a trace. CI uploads `test-results/` only when the End-to-end job fails.

A test is flaky only after evidence distinguishes environment instability from a product defect. Record the failing command, commit, browser, trace, error, repetition rate and attempted reproduction. Product defects, timing-dependent UI defects and race conditions are not quarantined as environment flakes.

Quarantine requires:

- GitHub issue reference;
- named owner;
- trace or equivalent evidence;
- smallest possible scope;
- explicit reason;
- expiry no later than 14 days;
- restoration criteria.

Quarantined tests remain visible. Do not permanently skip them, add repeated retries, remove assertions or weaken production behavior. Expired quarantine blocks release until the test is restored, replaced with equivalent coverage or removed through an approved architecture decision.
