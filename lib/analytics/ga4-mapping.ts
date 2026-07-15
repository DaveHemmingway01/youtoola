import {
  ANALYTICS_EVENT_NAMES,
  EVENT_FIELD_ALLOWLISTS,
  type AnalyticsEventEnvelope,
  type AnalyticsEventName,
} from "./contracts";

export interface Ga4EventMapping {
  eventName: AnalyticsEventName;
  keyEventRecommended: boolean;
  parameters: Readonly<Record<string, boolean | number | string>>;
}

export function mapAnalyticsEventToGa4(
  event: Readonly<AnalyticsEventEnvelope>,
): Ga4EventMapping {
  const parameters: Record<string, boolean | number | string> = {
    category_id: event.categoryId,
    locale: event.locale,
    page_type: event.pageType,
    utility_id: event.utilityId,
    utility_slug: event.utilitySlug,
  };
  const source = event as unknown as Record<string, unknown>;
  for (const key of EVENT_FIELD_ALLOWLISTS[event.eventName]) {
    const value = source[key];
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      parameters[key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)] = value;
    }
  }
  if (event.releaseReference) parameters.release_reference = event.releaseReference;

  return Object.freeze({
    eventName: event.eventName,
    keyEventRecommended: event.eventName === "tool_complete",
    parameters: Object.freeze(parameters),
  });
}

export const GA4_MAPPED_EVENTS = Object.freeze([...ANALYTICS_EVENT_NAMES]);
