import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumbs } from "@/components/site-shell";
import { getTrustPageDefinition } from "@/data/seo/trust-pages";
import { createPageMetadata } from "@/lib/seo/metadata";
import {
  createBreadcrumbItems,
  createBreadcrumbStructuredData,
} from "@/lib/seo/structured-data";

const definition = getTrustPageDefinition("methodology");
const breadcrumbs = createBreadcrumbItems(
  definition.breadcrumbLabel,
  definition.canonicalPath,
);

export const metadata: Metadata = createPageMetadata(definition);

export default function MethodologyPage() {
  return (
    <article className="trust-page">
      <JsonLd
        data={createBreadcrumbStructuredData(breadcrumbs)}
        id="methodology-breadcrumbs"
      />
      <Breadcrumbs items={breadcrumbs} />
      <p className="eyebrow">Trust and review</p>
      <h1>{definition.title}</h1>
      <p className="lede">
        Youtoola documents how each public utility is researched, calculated, tested,
        sourced, reviewed, corrected, and kept current.
      </p>

      <section aria-labelledby="research-before-build">
        <h2 id="research-before-build">Research before build</h2>
        <p>
          A utility begins with a specific user problem and a reviewed product source.
          Before implementation, Youtoola checks current search intent, existing tools,
          calculation requirements, material risks, and the evidence needed to provide a
          meaningfully useful result. Research findings do not make a utility public;
          owner approval is required at every release gate.
        </p>
      </section>

      <section aria-labelledby="calculation-design">
        <h2 id="calculation-design">Calculation design and testing</h2>
        <p>
          Calculation engines are deterministic and kept separate from page presentation.
          Inputs, outputs, units, conversions, assumptions, validation rules, and rounding
          boundaries are explicit. Tests cover normal, boundary, malformed, and regression
          cases. Higher-consequence work requires independently derived verification and an
          appropriately qualified reviewer where the risk demands it.
        </p>
      </section>

      <section aria-labelledby="source-selection">
        <h2 id="source-selection">Source selection and authority</h2>
        <p>Sources have distinct roles:</p>
        <ul>
          <li><strong>Provenance</strong> records where an opportunity or internal decision originated.</li>
          <li><strong>Authoritative</strong> supports facts, standards, regulations, or calculations.</li>
          <li><strong>Commercial</strong> may support a clearly labelled offer but cannot substantiate a calculation.</li>
        </ul>
        <p>
          The Youtoola Utility Opportunity Map is provenance only. It is not a calculation
          authority. A future utility must show the source title, publisher, URL, authority
          class, reviewed date, and freshness expectation when factual inputs affect results.
        </p>
      </section>

      <section aria-labelledby="explanation-standard">
        <h2 id="explanation-standard">Assumptions, limitations, and examples</h2>
        <p>
          Public utilities explain material assumptions and limitations in readable language.
          Units are named, rounding is documented, estimates are distinguished from exact
          values, and worked examples show how representative inputs reach a result. These
          explanations remain available as server-rendered content.
        </p>
      </section>

      <section aria-labelledby="versions-freshness">
        <h2 id="versions-freshness">Versions, reviewed dates, and freshness</h2>
        <p>
          Calculation logic and methodology use separate version numbers. Reviewed dates and
          source freshness expectations are recorded so a material formula, source, policy, or
          explanatory change can be traced. Time-sensitive inputs require an assigned update
          owner and unavailable or stale-data handling before release.
        </p>
      </section>

      <section aria-labelledby="corrections">
        <h2 id="corrections">Corrections and change records</h2>
        <p>
          Suspected defects are investigated against the calculation contract, test vectors,
          sources, and published explanation. Material corrections use the normal approval
          process, add regression coverage, update reviewed dates and versions where needed,
          and are recorded in the changelog. Automation may identify a problem but cannot
          approve a correction or publication.
        </p>
      </section>

      <section aria-labelledby="high-consequence">
        <h2 id="high-consequence">Regulated and high-consequence topics</h2>
        <p>
          Financial, medical, legal, tax, immigration, safety, or other high-consequence
          utilities require current jurisdiction-specific authority, clear limitations,
          stronger test evidence, and independent human review where appropriate. A utility
          must not present an estimate as a guarantee or generated text as professional advice.
        </p>
      </section>

      <section aria-labelledby="ai-assistance">
        <h2 id="ai-assistance">Use of AI assistance</h2>
        <p>
          AI may assist research preparation, drafting, engineering, test creation, and review
          support. It does not replace deterministic calculation logic, authoritative sources,
          independent verification where required, human review, or final approval by the
          Youtoola owner. Youtoola does not imply that every page or calculation is produced
          autonomously by AI.
        </p>
      </section>

      <footer className="trust-page__review">
        <p><strong>Content owner:</strong> {definition.owner}</p>
        <p><strong>Reviewed:</strong> <time dateTime={definition.reviewedDate}>14 July 2026</time></p>
      </footer>
    </article>
  );
}
