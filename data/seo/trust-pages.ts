import type { TrustPageDefinition } from "@/lib/seo/types";

export const TRUST_PAGE_DEFINITIONS = Object.freeze([
  Object.freeze({
    breadcrumbLabel: "About",
    canonicalPath: "/about",
    description:
      "Learn what Youtoola is, how its practical online tools are reviewed, and the principles that guide the platform.",
    key: "about",
    owner: "Youtoola owner",
    reviewedDate: "2026-07-14",
    title: "About Youtoola",
  }),
  Object.freeze({
    breadcrumbLabel: "Methodology",
    canonicalPath: "/methodology",
    description:
      "Read Youtoola's methodology and editorial policy for research, calculations, sources, testing, corrections, and review.",
    key: "methodology",
    owner: "Youtoola owner",
    reviewedDate: "2026-07-14",
    title: "Methodology and editorial policy",
  }),
  Object.freeze({
    breadcrumbLabel: "Privacy",
    canonicalPath: "/privacy",
    description:
      "Understand Youtoola's current privacy approach, including browser-local calculations, account-free use, and data-practice reviews.",
    key: "privacy",
    owner: "Youtoola owner",
    reviewedDate: "2026-07-14",
    title: "Privacy",
  }),
] satisfies readonly TrustPageDefinition[]);

export function getTrustPageDefinition(key: TrustPageDefinition["key"]) {
  const definition = TRUST_PAGE_DEFINITIONS.find((page) => page.key === key);
  if (!definition) throw new Error(`Unknown trust page: ${key}.`);
  return definition;
}
