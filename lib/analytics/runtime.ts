import type { RuntimeEnvironment } from "@/lib/environment";

import type {
  AnalyticsConsentState,
  AnalyticsEventEnvelope,
  AnalyticsEventName,
  AnalyticsValidationReason,
  UtilityAnalyticsEligibility,
} from "./contracts";
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

export interface AnalyticsProvider {
  readonly configured: boolean;
  track(event: Readonly<AnalyticsEventEnvelope>): Promise<void> | void;
}

export const NOOP_ANALYTICS_PROVIDER: AnalyticsProvider = Object.freeze({
  configured: false,
  track() {},
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

export function isAnalyticsConsentGranted(consentState: AnalyticsConsentState) {
  return consentState === "analytics-granted";
}

export function isAnalyticsEnvironmentEligible(environment: RuntimeEnvironment) {
  return environment === "production";
}

export interface AnalyticsDispatchRequest {
  deduplicationToken: AnalyticsDeduplicationToken;
  eligibility: UtilityAnalyticsEligibility;
  lifecycleEligible: boolean;
  payload: unknown;
}

export function createAnalyticsDispatcher({
  consentState,
  deduplicator = new EphemeralAnalyticsDeduplicator(),
  environment,
  provider = NOOP_ANALYTICS_PROVIDER,
}: {
  consentState: AnalyticsConsentState;
  deduplicator?: EphemeralAnalyticsDeduplicator;
  environment: RuntimeEnvironment;
  provider?: AnalyticsProvider;
}) {
  return Object.freeze({
    clear() {
      deduplicator.clear();
    },
    async track(request: AnalyticsDispatchRequest): Promise<AnalyticsDispatchResult> {
      if (!request.lifecycleEligible) return Object.freeze({ reason: "ineligible-lifecycle", status: "dropped" });
      if (!isAnalyticsEnvironmentEligible(environment)) {
        return Object.freeze({ reason: "environment-blocked", status: "dropped" });
      }
      if (!isAnalyticsConsentGranted(consentState)) {
        return Object.freeze({ reason: "consent-blocked", status: "dropped" });
      }
      const validation = validateAnalyticsEvent(request.payload, request.eligibility);
      if (!validation.ok) return Object.freeze({ reason: validation.reason, status: "dropped" });
      if (validation.event.environment !== environment || validation.event.consentState !== consentState) {
        return Object.freeze({ reason: "invalid-value", status: "dropped" });
      }
      if (!deduplicator.accept(request.deduplicationToken)) {
        return Object.freeze({ reason: "duplicate", status: "dropped" });
      }
      if (!provider.configured) return Object.freeze({ reason: "provider-missing", status: "dropped" });
      try {
        await provider.track(validation.event);
        return Object.freeze({ status: "accepted" });
      } catch {
        return Object.freeze({ reason: "provider-failure", status: "dropped" });
      }
    },
  });
}
