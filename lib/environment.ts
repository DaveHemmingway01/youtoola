export const CANONICAL_ORIGIN = "https://www.youtoola.com";

export type RuntimeEnvironment = "local" | "preview" | "production";

type EnvironmentSource = Readonly<Record<string, string | undefined>>;

const runtimeEnvironments = new Set<RuntimeEnvironment>([
  "local",
  "preview",
  "production",
]);

export function resolveRuntimeEnvironment(
  source: EnvironmentSource = process.env,
): RuntimeEnvironment {
  const explicitEnvironment = source.YOUTOOLA_ENV;

  if (explicitEnvironment) {
    if (!runtimeEnvironments.has(explicitEnvironment as RuntimeEnvironment)) {
      throw new Error(
        `Invalid YOUTOOLA_ENV: ${explicitEnvironment}. Expected local, preview, or production.`,
      );
    }

    return explicitEnvironment as RuntimeEnvironment;
  }

  if (source.VERCEL_ENV === "production") {
    return "production";
  }

  if (source.VERCEL_ENV === "preview") {
    return "preview";
  }

  return "local";
}

export function getCanonicalOrigin(
  source: EnvironmentSource = process.env,
): URL {
  const configuredOrigin = source.YOUTOOLA_CANONICAL_URL || CANONICAL_ORIGIN;
  const origin = new URL(configuredOrigin);

  if (origin.protocol !== "https:") {
    throw new Error("YOUTOOLA_CANONICAL_URL must use HTTPS.");
  }

  return origin;
}

export function isIndexingAllowed(
  source: EnvironmentSource = process.env,
): boolean {
  return resolveRuntimeEnvironment(source) === "production";
}
