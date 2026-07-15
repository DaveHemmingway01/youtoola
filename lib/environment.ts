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

  if (
    source.VERCEL_ENV !== undefined &&
    source.VERCEL_ENV !== "development" &&
    !runtimeEnvironments.has(source.VERCEL_ENV as RuntimeEnvironment)
  ) {
    throw new Error(
      `Invalid VERCEL_ENV: ${source.VERCEL_ENV}. Expected development, preview, or production.`,
    );
  }

  if (explicitEnvironment) {
    if (!runtimeEnvironments.has(explicitEnvironment as RuntimeEnvironment)) {
      throw new Error(
        `Invalid YOUTOOLA_ENV: ${explicitEnvironment}. Expected local, preview, or production.`,
      );
    }

    const vercelEnvironment =
      source.VERCEL_ENV === "development"
        ? "local"
        : source.VERCEL_ENV;

    if (
      vercelEnvironment &&
      explicitEnvironment !== vercelEnvironment
    ) {
      throw new Error(
        `Conflicting environments: VERCEL_ENV=${source.VERCEL_ENV} is authoritative and YOUTOOLA_ENV=${explicitEnvironment} may not override it.`,
      );
    }
  }

  if (source.VERCEL_ENV === "production") {
    return "production";
  }

  if (source.VERCEL_ENV === "preview") {
    return "preview";
  }

  if (explicitEnvironment) {
    return explicitEnvironment as RuntimeEnvironment;
  }

  return "local";
}

export function getCanonicalOrigin(): URL {
  return new URL(CANONICAL_ORIGIN);
}

export function isIndexingAllowed(
  source: EnvironmentSource = process.env,
): boolean {
  return resolveRuntimeEnvironment(source) === "production";
}
