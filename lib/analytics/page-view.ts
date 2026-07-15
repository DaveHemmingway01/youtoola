import { PLATFORM_PAGE_DEFINITIONS } from "@/data/seo/platform";
import { TRUST_PAGE_DEFINITIONS } from "@/data/seo/trust-pages";
import { CANONICAL_ORIGIN } from "@/lib/environment";

export interface SanitizedPageView {
  page_location: string;
  page_title: string;
}

const knownPages = new Map(
  [...Object.values(PLATFORM_PAGE_DEFINITIONS), ...TRUST_PAGE_DEFINITIONS].map(
    (page) => [page.canonicalPath, page] as const,
  ),
);

export function createSanitizedPageView(value: string): SanitizedPageView | null {
  let parsed: URL;
  try {
    parsed = new URL(value, CANONICAL_ORIGIN);
  } catch {
    return null;
  }
  const page = knownPages.get(parsed.pathname as never);
  if (!page) return null;
  return Object.freeze({
    page_location:
      page.canonicalPath === "/"
        ? CANONICAL_ORIGIN
        : new URL(page.canonicalPath, CANONICAL_ORIGIN).toString(),
    page_title: page.title,
  });
}

export class PageViewDeduplicator {
  #current: string | null = null;

  accept(pageView: SanitizedPageView) {
    if (this.#current === pageView.page_location) return false;
    this.#current = pageView.page_location;
    return true;
  }

  clear() {
    this.#current = null;
  }
}
