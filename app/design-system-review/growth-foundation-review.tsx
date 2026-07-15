"use client";

import { useState } from "react";

import { ConsentChoices } from "@/components/consent/consent-provider";

export function GrowthFoundationReview() {
  const [state, setState] = useState<"unknown" | "denied" | "analytics-granted">("unknown");
  const announcement = state === "unknown"
    ? ""
    : state === "analytics-granted"
      ? "Analytics preference saved."
      : "Optional analytics rejected.";

  return (
    <section aria-labelledby="growth-review-title">
      <h2 id="growth-review-title">Growth Foundation consent states</h2>
      <p>
        Controlled Preview fixture only. It loads no provider, writes no cookie and
        does not alter the dormant runtime configuration.
      </p>
      <div className="review-grid">
        <article className="consent-review-card">
          <h3>Automatic notice when analytics is available</h3>
          <p>Optional analytics stays off unless the person explicitly accepts.</p>
          <ConsentChoices
            onAccept={() => setState("analytics-granted")}
            onReject={() => setState("denied")}
          />
        </article>
        <article className="consent-review-card">
          <h3>Preferences and withdrawal</h3>
          <p>Current controlled state: <strong>{state}</strong></p>
          <ConsentChoices
            onAccept={() => setState("analytics-granted")}
            onReject={() => setState("denied")}
          />
        </article>
      </div>
      <p className="visually-hidden" aria-live="polite" aria-atomic="true">{announcement}</p>
    </section>
  );
}
