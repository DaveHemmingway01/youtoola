// @ts-expect-error Node's strip-types validation requires the runtime extension.
import { resolveRuntimeEnvironment, type RuntimeEnvironment } from "../environment.ts";

export const ANALYTICS_ENABLED_VARIABLE = "YOUTOOLA_ANALYTICS_ENABLED" as const;
export const ANALYTICS_IDENTIFIER_VARIABLE = "YOUTOOLA_GA4_MEASUREMENT_ID" as const;

type EnvironmentSource = Readonly<Record<string, string | undefined>>;

export interface Ga4Configuration {
  enabled: boolean;
  environment: RuntimeEnvironment;
  measurementId?: string;
  warnings: readonly string[];
}

const measurementIdPattern = /^G-[A-Z0-9]{4,20}$/;

export function isValidGa4MeasurementId(value: string) {
  return measurementIdPattern.test(value);
}

export function resolveGa4Configuration(
  source: EnvironmentSource = process.env,
): Ga4Configuration {
  const environment = resolveRuntimeEnvironment(source);
  const rawEnabled = source[ANALYTICS_ENABLED_VARIABLE]?.trim() ?? "";
  const measurementId = source[ANALYTICS_IDENTIFIER_VARIABLE]?.trim() ?? "";

  if (!["", "false", "true"].includes(rawEnabled)) {
    throw new Error(`${ANALYTICS_ENABLED_VARIABLE} must be true, false, or absent.`);
  }

  const enabled = rawEnabled === "true";
  if (environment !== "production" && (enabled || measurementId.length > 0)) {
    throw new Error("Analytics configuration is prohibited outside Production.");
  }
  if (environment === "production" && enabled && !isValidGa4MeasurementId(measurementId)) {
    throw new Error("Enabled Production analytics requires a valid bounded uppercase G- identifier.");
  }

  const warnings =
    environment === "production" && !enabled && measurementId.length > 0
      ? Object.freeze(["Analytics remains disabled; remove the residual provider identifier."])
      : Object.freeze([] as string[]);

  return Object.freeze({
    enabled,
    environment,
    ...(enabled ? { measurementId } : {}),
    warnings,
  });
}

export type ClientGrowthConfiguration =
  | Readonly<{ analyticsAvailable: false; secureCookie: boolean }>
  | Readonly<{ analyticsAvailable: true; measurementId: string; secureCookie: true }>;

export function createClientGrowthConfiguration(
  configuration: Ga4Configuration,
): ClientGrowthConfiguration {
  if (
    configuration.environment === "production" &&
    configuration.enabled &&
    configuration.measurementId
  ) {
    return Object.freeze({
      analyticsAvailable: true,
      measurementId: configuration.measurementId,
      secureCookie: true,
    });
  }
  return Object.freeze({
    analyticsAvailable: false,
    secureCookie: configuration.environment === "production",
  });
}
