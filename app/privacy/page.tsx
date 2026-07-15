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
        This page describes Youtoola’s current data practices and the dormant
        analytics controls prepared for a possible future launch. Qualified legal and
        privacy review is still required before optional analytics can be activated.
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
        <h2 id="current-measurement">Optional analytics</h2>
        <p>
          Optional Google Analytics 4 (GA4) is currently off. No analytics script or
          provider cookie is loaded while the service is dormant. If it is approved in
          future, it will load only after an explicit Accept analytics choice and only
          in Production. Rejecting or withdrawing consent must keep analytics disabled.
        </p>
        <p>
          A first-party <code>youtoola_consent</code> preference cookie may then record
          either rejection or analytics permission for up to 180 days. It contains no
          user ID, timestamp, utility input, result, or arbitrary JSON. No preference
          cookie is written automatically while analytics is off.
        </p>
      </section>

      <section aria-labelledby="measurement-data">
        <h2 id="measurement-data">What future measurement may include</h2>
        <p>
          Approved event categories cover tool views, starts, validation categories,
          completions, result actions, related-tool movement, and separately approved
          commercial actions. Youtoola’s adapter excludes raw inputs, exact results,
          free text, names, contact details, uploads, filenames, precise locations, and
          sensitive scenarios. GA4 may still process approximate location, device and
          request information under Google’s service terms; this is not described as
          fully anonymous analytics.
        </p>
        <p>
          Provider retention, provider-cookie treatment, international transfers, and
          the final withdrawal wording require qualified review before activation. The
          shortest retention compatible with the approved reporting cadence is the
          current direction. Youtoola does not promise that withdrawing consent deletes
          every provider cookie until that review is complete.
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

      <section aria-labelledby="commercial-status">
        <h2 id="commercial-status">Advertising and other tracking</h2>
        <p>
          Youtoola has no advertising tracker, marketing tracker, Microsoft Clarity,
          affiliate tracker, lead provider, or personalised advertising active. The
          reserved marketing consent state is unavailable in the current interface and
          marketing storage remains denied.
        </p>
      </section>

      <section aria-labelledby="future-changes">
        <h2 id="future-changes">Future material changes</h2>
        <p>
          Analytics, advertising, accounts, uploads, saved data, or other persistence
          cannot be introduced without an immediate privacy review before release. This
          page must be updated before those practices become active, with appropriate
          consent handling and qualified legal/privacy review completed before analytics
          activation. A contact route must also be approved before activation.
        </p>
      </section>

      <footer className="trust-page__review">
        <p><strong>Content owner:</strong> {definition.owner}</p>
        <p><strong>Policy version:</strong> 1</p>
        <p><strong>Reviewed:</strong> <time dateTime="2026-07-15">15 July 2026</time></p>
        <p><strong>Review status:</strong> Qualified legal and privacy review required before analytics activation.</p>
      </footer>
    </article>
  );
}
