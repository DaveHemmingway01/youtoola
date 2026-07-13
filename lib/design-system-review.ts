import {
  resolveRuntimeEnvironment,
  type RuntimeEnvironment,
} from "./environment";

export const DESIGN_SYSTEM_REVIEW_PATH = "/design-system-review";
export const DISABLED_DESIGN_SYSTEM_REVIEW_PATH =
  "/__disabled-design-system-review";

export function isDesignSystemReviewAvailable(
  environment: RuntimeEnvironment = resolveRuntimeEnvironment(),
): boolean {
  return environment !== "production";
}

export function getDesignSystemReviewRewrites(
  environment: RuntimeEnvironment = resolveRuntimeEnvironment(),
) {
  return environment === "production"
    ? [
        {
          source: DESIGN_SYSTEM_REVIEW_PATH,
          destination: DISABLED_DESIGN_SYSTEM_REVIEW_PATH,
        },
      ]
    : [];
}
