"use client";

import { useState } from "react";

import { Button } from "@/components/ui";
import { analyticsSchemaVersion, type AnalyticsEventName, type UtilityAnalyticsEligibility } from "@/lib/analytics/contracts";
import { isAnalyticsConsentGranted, isAnalyticsEnvironmentEligible } from "@/lib/analytics/runtime";
import { validateAnalyticsEvent } from "@/lib/analytics/validation";

const eligibility = Object.freeze({
  allowResultClassification: true,
  allowedCommercialCapabilityIds: [],
  allowedErrorCodes: ["required"],
  allowedEvents: ["tool_complete"],
  allowedFieldIds: ["distance"],
  allowedInteractionSources: [],
  allowedResultTypes: ["illustrative-total"],
  ownerApprovalReference: "phase-8-review-inspector",
  reviewedDate: "2026-07-14",
} satisfies UtilityAnalyticsEligibility);

const baseEvent = Object.freeze({
  analyticsSchemaVersion,
  categoryId: "review",
  consentState: "analytics-granted",
  environment: "production",
  eventName: "tool_complete" as AnalyticsEventName,
  locale: "en",
  nonSensitiveResultType: "illustrative-total",
  pageType: "review",
  resultClassification: "estimate",
  utilityId: "review-fixture",
  utilitySlug: "review-fixture",
});

type InspectorItem = Readonly<{ id: number; label: string; outcome: string }>;

export function AnalyticsMonetisationReview() {
  const [items, setItems] = useState<readonly InspectorItem[]>([]);

  function inspect(label: string, payload: unknown) {
    const result = validateAnalyticsEvent(payload, eligibility);
    setItems((current) => [
      ...current,
      { id: current.length + 1, label, outcome: result.ok ? "accepted" : `dropped: ${result.reason}` },
    ]);
  }

  return (
    <section className="analytics-review" aria-labelledby="analytics-review-title">
      <h2 id="analytics-review-title">Analytics contract inspector</h2>
      <p>
        Fixed, in-memory contract examples only. This inspector has no provider, network transport,
        storage, arbitrary input, or Production route.
      </p>
      <div className="control-row">
        <Button onClick={() => inspect("Valid event", baseEvent)}>Inspect valid event</Button>
        <Button
          variant="secondary"
          onClick={() => inspect("Sensitive payload", { ...baseEvent, rawInput: "redacted-by-contract" })}
        >
          Inspect sensitive payload
        </Button>
        <Button
          variant="secondary"
          onClick={() => inspect("Unknown parameter", { ...baseEvent, callerParameter: "not-allowed" })}
        >
          Inspect unknown parameter
        </Button>
        <Button variant="quiet" onClick={() => setItems([])}>Clear in-memory list</Button>
      </div>
      <p className="analytics-review__decision">
        Preview environment: {isAnalyticsEnvironmentEligible("preview") ? "allowed" : "environment-blocked"}. Unknown consent: {isAnalyticsConsentGranted("unknown") ? "allowed" : "consent-blocked"}.
      </p>
      <div aria-live="polite" aria-atomic="false">
        {items.length === 0 ? <p>No inspection results.</p> : (
          <ol className="analytics-review__list">
            {items.map((item) => <li key={item.id}><strong>{item.label}:</strong> {item.outcome}</li>)}
          </ol>
        )}
      </div>
    </section>
  );
}
