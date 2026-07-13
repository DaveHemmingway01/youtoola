import type { Metadata } from "next";
import type { ReactNode } from "react";

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
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
