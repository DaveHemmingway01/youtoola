import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: "Page not found",
};

export default function NotFound() {
  return (
    <section className="foundation-shell">
      <p className="eyebrow">404</p>
      <h1>That page does not exist.</h1>
      <p className="lede">Return to Youtoola to continue.</p>
      <Link className="text-link" href="/">Go to the homepage</Link>
    </section>
  );
}
