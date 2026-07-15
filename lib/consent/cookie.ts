import {
  CONSENT_COOKIE_MAX_AGE_SECONDS,
  CONSENT_COOKIE_NAME,
  CONSENT_POLICY_VERSION,
  type ConsentCookieParseResult,
  type SerializableConsentState,
} from "./contracts";

const acceptedValues = new Map<string, SerializableConsentState>([
  [`${CONSENT_POLICY_VERSION}:denied`, "denied"],
  [`${CONSENT_POLICY_VERSION}:analytics-granted`, "analytics-granted"],
]);

export function parseConsentCookie(cookieHeader: string): ConsentCookieParseResult {
  const matches = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter((part) => part.startsWith(`${CONSENT_COOKIE_NAME}=`));

  if (matches.length !== 1) return Object.freeze({ state: "unknown", valid: false });

  const value = matches[0]?.slice(CONSENT_COOKIE_NAME.length + 1) ?? "";
  const state = acceptedValues.get(value);
  return state
    ? Object.freeze({ state, valid: true })
    : Object.freeze({ state: "unknown", valid: false });
}

export function serializeConsentCookie(
  state: SerializableConsentState,
  { secure }: { secure: boolean },
) {
  if (state !== "denied" && state !== "analytics-granted") {
    throw new Error("Only denied or analytics-granted consent may be serialized.");
  }
  const attributes = [
    `${CONSENT_COOKIE_NAME}=${CONSENT_POLICY_VERSION}:${state}`,
    `Max-Age=${CONSENT_COOKIE_MAX_AGE_SECONDS}`,
    "Path=/",
    "SameSite=Lax",
  ];
  if (secure) attributes.push("Secure");
  return attributes.join("; ");
}
