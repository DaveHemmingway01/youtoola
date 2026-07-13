import type { Metadata } from "next";
import type { ReactNode } from "react";

import { MainContent, SiteFooter, SiteHeader, SkipLink } from "@/components/site-shell";
import { getCanonicalOrigin } from "@/lib/environment";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: getCanonicalOrigin(),
  title: {
    default: "Youtoola — Useful tools. No account. No nonsense.",
    template: "%s | Youtoola",
  },
  description:
    "Youtoola is one platform for fast, practical online utilities without mandatory accounts.",
  alternates: {
    canonical: "/",
  },
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
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SkipLink />
        <SiteHeader />
        <MainContent>{children}</MainContent>
        <SiteFooter />
      </body>
    </html>
  );
}
