import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { Card, TextLink } from "@/components/ui";
import { PLATFORM_SEO } from "@/data/seo/platform";
import { PUBLIC_DISCOVERY_ROUTES } from "@/lib/discovery";
import { createPageMetadata } from "@/lib/seo/metadata";
import { createHomeStructuredData } from "@/lib/seo/structured-data";

import styles from "./discovery.module.css";

export const metadata: Metadata = createPageMetadata(
  {
    canonicalPath: "/",
    description: PLATFORM_SEO.conciseDescription,
    title: PLATFORM_SEO.homeTitle,
  },
  { absoluteTitle: true },
);

const workingPrinciples = [
  {
    title: "Start with the task",
    description: "Each tool is focused on helping you complete one practical job clearly.",
  },
  {
    title: "Get a useful result",
    description: "Core results come before explanations, extras, or commercial options.",
  },
  {
    title: "Understand the answer",
    description: "Methods, assumptions, limitations, and sources are made clear where they matter.",
  },
];

const trustPrinciples = [
  "No account is required for the core utility experience.",
  "Tools are reviewed before they become publicly available.",
  "Accessible, fast interfaces are part of the release standard.",
  "Personal and sensitive inputs are not collected without a clear, approved need.",
];

export default function HomePage() {
  return (
    <div className={styles.page}>
      <JsonLd data={createHomeStructuredData()} id="youtoola-entities" />
      <section className={styles.hero} aria-labelledby="home-heading">
        <p className="eyebrow">Practical online utilities</p>
        <h1 id="home-heading">Useful tools. No account. No nonsense.</h1>
        <p className="lede">
          {PLATFORM_SEO.extendedDescription}
        </p>
        <TextLink href={PUBLIC_DISCOVERY_ROUTES.tools}>Browse the tool directory</TextLink>
      </section>

      <section aria-labelledby="what-is-youtoola">
        <h2 id="what-is-youtoola">One dependable place for focused tools</h2>
        <p className={styles.readableText}>
          Youtoola brings useful tools into one consistent platform. Every public
          tool is designed to solve a specific problem quickly, explain its result,
          and work without forcing you to create an account.
        </p>
      </section>

      <section aria-labelledby="how-tools-work">
        <h2 id="how-tools-work">How Youtoola tools work</h2>
        <div className={styles.cardGrid}>
          {workingPrinciples.map((principle, index) => (
            <Card key={principle.title}>
              <p className={styles.stepLabel}>Step {index + 1}</p>
              <h3>{principle.title}</h3>
              <p>{principle.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="built-on-trust">
        <h2 id="built-on-trust">Built for trust and repeat use</h2>
        <ul className={styles.principleList}>
          {trustPrinciples.map((principle) => (
            <li key={principle}>{principle}</li>
          ))}
        </ul>
      </section>

      <section className={styles.statusPanel} aria-labelledby="platform-status">
        <p className="eyebrow">Platform status</p>
        <h2 id="platform-status">The first tools are on the way</h2>
        <p>
          Our first tools are being prepared and reviewed. We’ll publish them here
          when they’re ready.
        </p>
        <TextLink href={PUBLIC_DISCOVERY_ROUTES.tools}>Visit the tool directory</TextLink>
      </section>
    </div>
  );
}
