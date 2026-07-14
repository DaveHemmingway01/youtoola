import Link from "next/link";
import type { ReactNode } from "react";

interface ResultPanelProps {
  actions?: ReactNode;
  announce?: boolean;
  answer: string;
  assumptions?: ReactNode;
  label: string;
  limitations?: ReactNode;
  methodology?: ReactNode;
  relatedTool?: ReactNode;
  supportingValues?: ReactNode;
  warnings?: ReactNode;
}

export function ResultPanel({
  actions,
  announce = true,
  answer,
  assumptions,
  label,
  limitations,
  methodology,
  relatedTool,
  supportingValues,
  warnings,
}: ResultPanelProps) {
  return (
    <section className="result-panel" aria-label={`${label} result`}>
      <p className="result-panel__label">
        {label}
      </p>
      <p className="result-panel__answer" aria-live={announce ? "polite" : undefined} aria-atomic={announce ? "true" : undefined}>
        {answer}
      </p>
      {supportingValues ? <div>{supportingValues}</div> : null}
      {assumptions ? <div className="result-panel__section"><strong>Assumptions</strong>{assumptions}</div> : null}
      {warnings ? <div className="result-panel__section"><strong>Warnings</strong>{warnings}</div> : null}
      {limitations ? <div className="result-panel__section"><strong>Limitations</strong>{limitations}</div> : null}
      {methodology ? <div className="result-panel__section"><strong>Methodology</strong>{methodology}</div> : null}
      {actions ? <div className="result-panel__actions">{actions}</div> : null}
      {relatedTool ? <div className="result-panel__related">{relatedTool}</div> : null}
    </section>
  );
}

interface RelatedToolCardProps {
  description: string;
  href: string;
  linkLabel?: string;
  rationale?: string;
  title: string;
}

export function RelatedToolCard({
  description,
  href,
  linkLabel = "Use this tool",
  rationale,
  title,
}: RelatedToolCardProps) {
  return (
    <article className="related-tool-card">
      <h3>{title}</h3>
      <p>{description}</p>
      {rationale ? <p className="related-tool-card__rationale">Why this helps: {rationale}</p> : null}
      <Link href={href}>{linkLabel}</Link>
    </article>
  );
}

export function CommercialPlaceholder({
  kind,
}: {
  kind: "advertising" | "affiliate" | "premium" | "lead";
}) {
  const labels = {
    advertising: "Reserved advertising area",
    affiliate: "Reserved affiliate area",
    lead: "Reserved lead area",
    premium: "Reserved premium area",
  } as const;
  const label = labels[kind];
  return (
    <aside className="commercial-placeholder" aria-label={label}>
      <span>{label}</span>
      <small>Inactive in this phase</small>
    </aside>
  );
}
