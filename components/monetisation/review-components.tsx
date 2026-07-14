import type { ReactNode } from "react";

function InertCommercialReview({ children, label }: { children: ReactNode; label: string }) {
  return (
    <aside className="commercial-review" aria-label={label}>
      <p className="commercial-review__label">Review-only · inactive</p>
      {children}
    </aside>
  );
}

export function InertAdvertisingReview() {
  return (
    <InertCommercialReview label="Inert advertising placement">
      <strong>Advertising</strong>
      <p>Reserved dimensions are demonstrated without an ad provider or content.</p>
    </InertCommercialReview>
  );
}

export function InertAffiliateReview() {
  return (
    <InertCommercialReview label="Inert affiliate recommendation">
      <strong>Relevant recommendation position</strong>
      <p>Youtoola may earn a commission if you use this link, at no extra cost to you.</p>
      <p>No destination is configured.</p>
    </InertCommercialReview>
  );
}

export function InertPremiumReview() {
  return (
    <InertCommercialReview label="Inert premium continuation">
      <strong>Premium continuation position</strong>
      <p>No product, price, account requirement, or destination is configured.</p>
    </InertCommercialReview>
  );
}

export function InertLeadReview() {
  return (
    <InertCommercialReview label="Inert lead opportunity">
      <strong>Optional lead position</strong>
      <p>No form, data collection, provider, or submission action exists.</p>
    </InertCommercialReview>
  );
}
