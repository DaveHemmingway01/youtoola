import { CANONICAL_ORIGIN } from "@/lib/environment";
import type { PlatformSeoDefinition } from "@/lib/seo/types";

export const PLATFORM_SEO = Object.freeze({
  applicationName: "Youtoola",
  conciseDescription:
    "Youtoola is a collection of free, practical online tools for everyday calculations, decisions and tasks, without requiring an account.",
  extendedDescription:
    "Youtoola brings free, practical online tools into one dependable platform. Each tool is designed to solve a focused task quickly, explain its method and limitations, and work without requiring an account for the core experience.",
  homeTitle: "Youtoola — Useful tools. No account. No nonsense.",
  language: "en",
  locale: "en",
  organizationId: `${CANONICAL_ORIGIN}/#organization`,
  organizationLogo: Object.freeze({
    height: 819,
    type: "image/png",
    url: `${CANONICAL_ORIGIN}/brand/youtoola-logo.png`,
    width: 3000,
  }),
  siteName: "Youtoola",
  titleTemplate: "%s | Youtoola",
  websiteId: `${CANONICAL_ORIGIN}/#website`,
} satisfies PlatformSeoDefinition);

export const PLATFORM_THEME_COLORS = Object.freeze({
  dark: "#000A3F",
  light: "#F7F9FC",
});
