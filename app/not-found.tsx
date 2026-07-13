import Link from "next/link";

export default function NotFound() {
  return (
    <section className="foundation-shell">
      <p className="eyebrow">404</p>
      <h1>That page does not exist.</h1>
      <p className="lede">Return to Youtoola to continue.</p>
      <Link href="/">Go to the homepage</Link>
    </section>
  );
}
