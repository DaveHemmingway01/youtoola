import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumbs } from "@/components/site-shell";
import { getTrustPageDefinition } from "@/data/seo/trust-pages";
import { createPageMetadata } from "@/lib/seo/metadata";
import {
  createBreadcrumbItems,
  createBreadcrumbStructuredData,
} from "@/lib/seo/structured-data";

const definition = getTrustPageDefinition("privacy");
const breadcrumbs = createBreadcrumbItems(
  definition.breadcrumbLabel,
  definition.canonicalPath,
);

export const metadata: Metadata = createPageMetadata(definition);

export default function PrivacyPage() {
  return (
    <article className="trust-page">
      <JsonLd
        data={createBreadcrumbStructuredData(breadcrumbs)}
        id="privacy-breadcrumbs"
      />
      <Breadcrumbs items={breadcrumbs} />
      <p className="eyebrow">Current platform practices</p>
      <h1>{definition.title}</h1>
      <p className="lede">
        This page describes Youtoola’s current data practices. It will be reviewed
        before any material change to analytics, advertising, accounts, uploads,
        persistence, or consent handling.
      </p>

      <section aria-labelledby="core-experience">
        <h2 id="core-experience">Core experience</h2>
        <p>
          Youtoola does not currently require an account for the core platform
          experience. Ordinary calculators are intended to process inputs locally in
          the browser. Utility inputs are not persisted by default in URLs, cookies,
          local storage, session storage, or Youtoola application data stores.
        </p>
      </section>

      <section aria-labelledby="current-measurement">
        <h2 id="current-measurement">Analytics and commercial tracking</h2>
        <p>
          Youtoola currently has no Production analytics provider, advertising tracker,
          or affiliate tracker active. Any future measurement or commercial tracking
          must be separately approved, avoid sensitive utility inputs, and receive the
          consent and policy review appropriate to the launch jurisdictions.
        </p>
      </section>

      <section aria-labelledby="infrastructure">
        <h2 id="infrastructure">Hosting and operational information</h2>
        <p>
          Hosting, network, and security infrastructure may process standard request and
          diagnostic information needed to deliver and protect the website. This policy
          does not claim that infrastructure logs never exist, and Youtoola does not
          describe those operational records as calculator input storage.
        </p>
      </section>

      <section aria-labelledby="future-changes">
        <h2 id="future-changes">Future material changes</h2>
        <p>
          Analytics, advertising, accounts, uploads, saved data, or other persistence
          cannot be introduced without an immediate privacy review before release. This
          page must be updated before those practices become active, with appropriate
          consent handling and legal review completed before Phase 11 analytics begins.
        </p>
      </section>

      <footer className="trust-page__review">
        <p><strong>Content owner:</strong> {definition.owner}</p>
        <p><strong>Reviewed:</strong> <time dateTime={definition.reviewedDate}>14 July 2026</time></p>
        <p><strong>Review status:</strong> Legal review required before analytics and consent activation.</p>
      </footer>
    </article>
  );
}
