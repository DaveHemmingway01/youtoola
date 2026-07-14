import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumbs } from "@/components/site-shell";
import { PLATFORM_SEO } from "@/data/seo/platform";
import { getTrustPageDefinition } from "@/data/seo/trust-pages";
import { createPageMetadata } from "@/lib/seo/metadata";
import {
  createBreadcrumbItems,
  createBreadcrumbStructuredData,
} from "@/lib/seo/structured-data";

const definition = getTrustPageDefinition("about");
const breadcrumbs = createBreadcrumbItems(
  definition.breadcrumbLabel,
  definition.canonicalPath,
);

export const metadata: Metadata = createPageMetadata(definition);

export default function AboutPage() {
  return (
    <article className="trust-page">
      <JsonLd
        data={createBreadcrumbStructuredData(breadcrumbs)}
        id="about-breadcrumbs"
      />
      <Breadcrumbs items={breadcrumbs} />
      <p className="eyebrow">About Youtoola</p>
      <h1>{definition.title}</h1>
      <p className="lede">{PLATFORM_SEO.extendedDescription}</p>

      <section aria-labelledby="one-platform">
        <h2 id="one-platform">One dependable platform</h2>
        <p>
          Youtoola brings focused utilities into one consistent place. Each public
          tool is intended to help with a practical calculation, decision, or task
          without forcing an account for the core experience.
        </p>
        <p>
          Tools share the same standards for clarity, accessibility, privacy,
          performance, and review. A tool is not made public simply because it exists
          in the product backlog.
        </p>
      </section>

      <section aria-labelledby="user-value-first">
        <h2 id="user-value-first">User value comes first</h2>
        <p>
          The useful result comes before supporting explanations or any future
          commercial option. Methods, assumptions, limitations, and sources are shown
          where they help people understand and use a result responsibly.
        </p>
      </section>

      <section aria-labelledby="publication-standard">
        <h2 id="publication-standard">How tools become public</h2>
        <p>
          Each utility follows separate planning, building, review, and release gates.
          Calculation logic is tested independently of the interface, and public pages
          must meet Youtoola standards for responsive use, accessibility, crawlability,
          and source transparency.
        </p>
      </section>

      <footer className="trust-page__review">
        <p><strong>Content owner:</strong> {definition.owner}</p>
        <p><strong>Reviewed:</strong> <time dateTime={definition.reviewedDate}>14 July 2026</time></p>
      </footer>
    </article>
  );
}
