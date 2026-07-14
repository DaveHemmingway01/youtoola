import type { ReactNode } from "react";

import { Breadcrumbs } from "@/components/site-shell";
import { RelatedToolCard } from "@/components/tool-patterns";
import type { PublicRelatedTool } from "@/lib/discovery";

interface UtilityPageShellProps {
  commercialContinuation?: ReactNode;
  faqs?: ReactNode;
  introduction: ReactNode;
  interactive: ReactNode;
  methodology: ReactNode;
  privacyNote: ReactNode;
  relatedTools?: readonly PublicRelatedTool[];
  title: string;
  workedExample: ReactNode;
}

export function UtilityPageShell({
  commercialContinuation,
  faqs,
  introduction,
  interactive,
  methodology,
  privacyNote,
  relatedTools = [],
  title,
  workedExample,
}: UtilityPageShellProps) {
  return (
    <article className="utility-page">
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { href: "/tools", label: "Tools" }, { label: title }]} />
      <h1>{title}</h1>
      <div className="lede">{introduction}</div>
      <section className="utility-page__interactive" aria-label={`${title} form and result`}>
        {interactive}
        <noscript>
          <p className="alert alert--warning">JavaScript is required to calculate an interactive result. The methodology and supporting information remain available below.</p>
        </noscript>
      </section>
      <section aria-labelledby="worked-example-heading">
        <h2 id="worked-example-heading">Worked example</h2>
        {workedExample}
      </section>
      <section aria-labelledby="methodology-heading">
        <h2 id="methodology-heading">Methodology and sources</h2>
        {methodology}
      </section>
      {faqs ? <section aria-labelledby="faq-heading"><h2 id="faq-heading">Frequently asked questions</h2>{faqs}</section> : null}
      {relatedTools.length > 0 ? (
        <section aria-labelledby="related-tools-heading">
          <h2 id="related-tools-heading">Related tools</h2>
          <div className="review-grid">
            {relatedTools.map((tool) => (
              <RelatedToolCard key={tool.utilityId} href={tool.href} title={tool.name} description={tool.description} rationale={tool.rationale} />
            ))}
          </div>
        </section>
      ) : null}
      <section className="utility-page__privacy" aria-labelledby="privacy-heading">
        <h2 id="privacy-heading">Privacy</h2>
        {privacyNote}
      </section>
      {commercialContinuation ? <div className="utility-page__commercial">{commercialContinuation}</div> : null}
    </article>
  );
}
