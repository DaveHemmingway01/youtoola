import type { RuntimeEnvironment } from "@/lib/environment";

import type {
  AnalyticsConsentState,
  AnalyticsEventEnvelope,
  AnalyticsEventName,
  AnalyticsValidationReason,
  CanonicalAnalyticsContext,
  UtilityAnalyticsEligibility,
} from "./contracts";
import { isAnalyticsConsentGranted, isAnalyticsEnvironmentEligible } from "./policy";
import { validateAnalyticsEvent } from "./validation";

export type AnalyticsDropReason =
  | Exclude<AnalyticsValidationReason, "accepted">
  | "consent-blocked"
  | "duplicate"
  | "environment-blocked"
  | "ineligible-lifecycle"
  | "offline"
  | "provider-failure"
  | "provider-missing"
  | "timeout";

export type AnalyticsDispatchResult =
  | Readonly<{ status: "accepted" }>
  | Readonly<{ reason: AnalyticsDropReason; status: "dropped" }>;

export type AnalyticsProviderDeliveryResult =
  | "accepted"
  | "offline"
  | "provider-failure"
  | "timeout";

export interface AnalyticsProvider {
  readonly configured: boolean;
  track(event: Readonly<AnalyticsEventEnvelope>): AnalyticsProviderDeliveryResult;
}

export const NOOP_ANALYTICS_PROVIDER: AnalyticsProvider = Object.freeze({
  configured: false,
  track: () => "provider-failure",
});

export interface AnalyticsDeduplicationToken {
  action: number;
  cycle: number;
  eventName: AnalyticsEventName;
  scope: "action" | "attempt" | "interaction" | "route";
}

function serializeToken(token: AnalyticsDeduplicationToken) {
  if (!Number.isSafeInteger(token.action) || token.action < 0) throw new Error("Invalid analytics action sequence.");
  if (!Number.isSafeInteger(token.cycle) || token.cycle < 0) throw new Error("Invalid analytics cycle sequence.");
  return `${token.eventName}:${token.scope}:${token.cycle}:${token.action}`;
}

export const ANALYTICS_DEDUPLICATION_SCOPES = Object.freeze({
  affiliate_click: "action",
  lead_start: "interaction",
  lead_submit: "action",
  premium_click: "action",
  related_tool_click: "action",
  result_copy: "action",
  result_export: "action",
  result_share: "action",
  tool_complete: "attempt",
  tool_start: "interaction",
  tool_validation_error: "attempt",
  tool_view: "route",
} satisfies Readonly<Record<AnalyticsEventName, AnalyticsDeduplicationToken["scope"]>>);

export class EphemeralAnalyticsDeduplicator {
  readonly #seen = new Set<string>();

  accept(token: AnalyticsDeduplicationToken) {
    const key = serializeToken(token);
    if (this.#seen.has(key)) return false;
    this.#seen.add(key);
    return true;
  }

  clear() {
    this.#seen.clear();
  }
}

export interface AnalyticsDispatchRequest {
  canonicalContext: CanonicalAnalyticsContext;
  deduplicationToken: AnalyticsDeduplicationToken;
  eligibility: UtilityAnalyticsEligibility;
  lifecycleEligible: boolean;
  payload: unknown;
}

export function createAnalyticsDispatcher({
  consentState = "unknown",
  deduplicator = new EphemeralAnalyticsDeduplicator(),
  environment,
  provider = NOOP_ANALYTICS_PROVIDER,
}: {
  consentState?: AnalyticsConsentState;
  deduplicator?: EphemeralAnalyticsDeduplicator;
  environment: RuntimeEnvironment;
  provider?: AnalyticsProvider;
}) {
  return Object.freeze({
    clear() {
      deduplicator.clear();
    },
    track(request: AnalyticsDispatchRequest): AnalyticsDispatchResult {
      if (!request.lifecycleEligible) return Object.freeze({ reason: "ineligible-lifecycle", status: "dropped" });
      if (!isAnalyticsEnvironmentEligible(environment)) {
        return Object.freeze({ reason: "environment-blocked", status: "dropped" });
      }
      if (!isAnalyticsConsentGranted(consentState)) {
        return Object.freeze({ reason: "consent-blocked", status: "dropped" });
      }
      const validation = validateAnalyticsEvent(
        request.payload,
        request.eligibility,
        request.canonicalContext,
      );
      if (!validation.ok) return Object.freeze({ reason: validation.reason, status: "dropped" });
      if (validation.event.environment !== environment || validation.event.consentState !== consentState) {
        return Object.freeze({ reason: "invalid-value", status: "dropped" });
      }
      if (request.deduplicationToken.eventName !== validation.event.eventName ||
        request.deduplicationToken.scope !== ANALYTICS_DEDUPLICATION_SCOPES[validation.event.eventName] ||
        (request.deduplicationToken.scope !== "action" && request.deduplicationToken.action !== 0)) {
        return Object.freeze({ reason: "invalid-field", status: "dropped" });
      }
      if (!deduplicator.accept(request.deduplicationToken)) {
        return Object.freeze({ reason: "duplicate", status: "dropped" });
      }
      if (!provider.configured) return Object.freeze({ reason: "provider-missing", status: "dropped" });
      try {
        const delivery = provider.track(validation.event);
        if (delivery === "accepted") return Object.freeze({ status: "accepted" });
        if (delivery === "offline" || delivery === "provider-failure" || delivery === "timeout") {
          return Object.freeze({ reason: delivery, status: "dropped" });
        }
        return Object.freeze({ reason: "provider-failure", status: "dropped" });
      } catch {
        return Object.freeze({ reason: "provider-failure", status: "dropped" });
      }
    },
  });
}
