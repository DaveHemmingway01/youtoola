import Link from "next/link";
import type { ReactNode } from "react";

interface ResultPanelProps {
  actions?: ReactNode;
  answer: string;
  assumptions?: ReactNode;
  label: string;
  methodology?: ReactNode;
  relatedTool?: ReactNode;
  supportingValues?: ReactNode;
  warnings?: ReactNode;
}

export function ResultPanel({
  actions,
  answer,
  assumptions,
  label,
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
      <p className="result-panel__answer" aria-live="polite" aria-atomic="true">
        {answer}
      </p>
      {supportingValues ? <div>{supportingValues}</div> : null}
      {assumptions ? <div className="result-panel__section"><strong>Assumptions</strong>{assumptions}</div> : null}
      {warnings ? <div className="result-panel__section"><strong>Warnings</strong>{warnings}</div> : null}
      {methodology ? <div className="result-panel__section"><strong>Methodology</strong>{methodology}</div> : null}
      {actions ? <div className="result-panel__actions">{actions}</div> : null}
      <div className="result-panel__future" aria-label="Future export position">
        Export options will appear here when supported.
      </div>
      {relatedTool ? <div className="result-panel__related">{relatedTool}</div> : null}
    </section>
  );
}

interface RelatedToolCardProps {
  description: string;
  href: string;
  linkLabel?: string;
  title: string;
}

export function RelatedToolCard({
  description,
  href,
  linkLabel = "Use this tool",
  title,
}: RelatedToolCardProps) {
  return (
    <article className="related-tool-card">
      <h3>{title}</h3>
      <p>{description}</p>
      <Link href={href}>{linkLabel}</Link>
    </article>
  );
}

export function CommercialPlaceholder({
  kind,
}: {
  kind: "advertising" | "affiliate-or-lead";
}) {
  const label =
    kind === "advertising"
      ? "Reserved advertising area"
      : "Reserved affiliate or lead area";
  return (
    <aside className="commercial-placeholder" aria-label={label}>
      <span>{label}</span>
      <small>Inactive in this phase</small>
    </aside>
  );
}
