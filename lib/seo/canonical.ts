import { CANONICAL_ORIGIN } from "@/lib/environment";

const CANONICAL_HOST = new URL(CANONICAL_ORIGIN).host;
const TRACKING_PARAMETER_PREFIXES = ["utm_"];
const TRACKING_PARAMETERS = new Set(["fbclid", "gclid", "msclkid"]);

export function assertCanonicalPath(path: string): asserts path is `/${string}` | "/" {
  if (!path.startsWith("/")) throw new Error("Canonical paths must start with a slash.");
  if (path.includes("?") || path.includes("#")) {
    throw new Error("Canonical paths must not contain query parameters or fragments.");
  }
  if (path !== "/" && path.endsWith("/")) {
    throw new Error("Non-root canonical paths must not end with a slash.");
  }
  if (path.includes("//")) throw new Error("Canonical paths must not contain duplicate slashes.");
}

export function createCanonicalUrl(path: string) {
  assertCanonicalPath(path);
  return path === "/" ? CANONICAL_ORIGIN : `${CANONICAL_ORIGIN}${path}`;
}

export function assertCanonicalUrl(url: string) {
  const parsed = new URL(url);
  if (parsed.protocol !== "https:" || parsed.host !== CANONICAL_HOST) {
    throw new Error(`Canonical URLs must use ${CANONICAL_ORIGIN}.`);
  }
  assertCanonicalPath(parsed.pathname);
  if (parsed.search || parsed.hash) {
    throw new Error("Canonical URLs must not contain query parameters or fragments.");
  }
}

export function canonicalizePublicUrl(input: string) {
  const url = new URL(input, CANONICAL_ORIGIN);
  for (const key of [...url.searchParams.keys()]) {
    if (
      TRACKING_PARAMETERS.has(key.toLowerCase()) ||
      TRACKING_PARAMETER_PREFIXES.some((prefix) => key.toLowerCase().startsWith(prefix))
    ) {
      url.searchParams.delete(key);
    }
  }
  url.search = "";
  url.hash = "";
  const path = url.pathname === "/" ? "/" : url.pathname.replace(/\/+$/, "");
  return createCanonicalUrl(path);
}
