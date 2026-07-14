import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { MainContent, SiteFooter, SiteHeader, SkipLink } from "@/components/site-shell";
import { PLATFORM_SEO, PLATFORM_THEME_COLORS } from "@/data/seo/platform";
import { getCanonicalOrigin, isIndexingAllowed } from "@/lib/environment";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: getCanonicalOrigin(),
  title: {
    default: PLATFORM_SEO.homeTitle,
    template: PLATFORM_SEO.titleTemplate,
  },
  applicationName: PLATFORM_SEO.applicationName,
  icons: {
    icon: [
      { url: "/brand/favicon.ico" },
      { url: "/brand/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/brand/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/brand/favicon-64x64.png", sizes: "64x64", type: "image/png" },
    ],
    apple: [{ url: "/brand/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  robots: isIndexingAllowed()
    ? { follow: true, index: true }
    : { follow: false, index: false },
};

export const viewport: Viewport = {
  themeColor: [
    { color: PLATFORM_THEME_COLORS.light, media: "(prefers-color-scheme: light)" },
    { color: PLATFORM_THEME_COLORS.dark, media: "(prefers-color-scheme: dark)" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang={PLATFORM_SEO.language}>
      <body>
        <SkipLink />
        <SiteHeader />
        <MainContent>{children}</MainContent>
        <SiteFooter />
      </body>
    </html>
  );
}
