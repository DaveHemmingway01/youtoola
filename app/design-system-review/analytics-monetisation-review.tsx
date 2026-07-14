"use client";

import { useState } from "react";

import { Button } from "@/components/ui";
import { analyticsSchemaVersion, type UtilityAnalyticsEligibility } from "@/lib/analytics/contracts";
import { validateAnalyticsEvent } from "@/lib/analytics/validation";

const eligibility = Object.freeze({
  allowResultClassification: false,
  allowedCommercialCapabilityIds: [],
  allowedErrorCodes: [],
  allowedEvents: ["tool_complete"],
  allowedFieldIds: [],
  allowedInteractionSources: [],
  allowedResultTypes: [],
  ownerApprovalReference: "r",
  reviewedDate: "2026-07-14",
} satisfies UtilityAnalyticsEligibility);

const baseEvent = Object.freeze({
  analyticsSchemaVersion,
  consentState: "analytics-granted",
  environment: "production",
  eventName: "tool_complete",
  locale: "en",
  pageType: "review",
});

const canonicalContext = Object.freeze({
  categoryId: "r",
  releasedTargetUtilityIds: [],
  utilityId: "r",
  utilitySlug: "r",
});

type InspectorItem = readonly [label: string, outcome: string];

export function AnalyticsMonetisationReview() {
  const [items, setItems] = useState<readonly InspectorItem[]>([]);

  function inspect(label: string, payload: unknown) {
    const result = validateAnalyticsEvent(payload, eligibility, canonicalContext);
    setItems((current) => [
      ...current,
      [label, result.ok ? "accepted" : `dropped: ${result.reason}`],
    ]);
  }

  return (
    <section className="analytics-review" aria-labelledby="analytics-review-title">
      <h2 id="analytics-review-title">Event inspector</h2>
      <div className="control-row">
        <Button onClick={() => inspect("Valid", baseEvent)}>Valid event</Button>
        <Button
          variant="secondary"
          onClick={() => inspect("Sensitive", { ...baseEvent, rawInput: "blocked" })}
        >
          Sensitive
        </Button>
        <Button
          variant="secondary"
          onClick={() => inspect("Unknown", { ...baseEvent, callerParameter: "blocked" })}
        >
          Unknown field
        </Button>
        <Button variant="quiet" onClick={() => setItems([])}>Clear</Button>
      </div>
      <p>
        Preview blocked. Consent blocked.
      </p>
      <div aria-live="polite">
        {items.length === 0 ? <p>No results.</p> : (
          <ol className="analytics-review__list">
            {items.map(([label, outcome], index) => <li key={index}>{label}: {outcome}</li>)}
          </ol>
        )}
      </div>
    </section>
  );
}
