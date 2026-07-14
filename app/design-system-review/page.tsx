import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  Checkbox,
  RadioGroup,
  Toggle,
} from "@/components/forms";
import { Breadcrumbs } from "@/components/site-shell";
import {
  CommercialPlaceholder,
  RelatedToolCard,
  ResultPanel,
} from "@/components/tool-patterns";
import {
  Alert,
  Button,
  Card,
  Disclosure,
  EmptyState,
  IconButton,
  LoadingState,
  TextLink,
} from "@/components/ui";
import { isDesignSystemReviewAvailable } from "@/lib/design-system-review";

import { ReviewForm } from "./review-form";
import { UtilityFrameworkExample } from "./utility-framework-example";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Design system review",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://www.youtoola.com" },
};

export default function DesignSystemReviewPage() {
  if (!isDesignSystemReviewAvailable()) notFound();

  return (
    <div className="review-page">
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Design system review" }]} />
      <p className="eyebrow">Local and Preview review</p>
      <h1>Youtoola design system</h1>
      <p className="lede">
        A compact review surface for the shared platform shell, utility controls,
        result hierarchy, and reserved commercial positions.
      </p>

      <h2>Actions and feedback</h2>
      <div className="control-row">
        <Button>Primary action</Button>
        <Button variant="secondary">Secondary action</Button>
        <Button variant="quiet">Quiet action</Button>
        <TextLink href="/">Text link</TextLink>
        <IconButton label="Save example" type="button">☆</IconButton>
      </div>
      <div className="review-grid">
        <Alert title="Useful information">The utility remains the priority.</Alert>
        <Alert title="Check this value" tone="error">Errors use text and colour.</Alert>
      </div>

      <h2>Forms</h2>
      <Card aria-labelledby="review-form-title">
        <h3 id="review-form-title">Accessible calculation form</h3>
        <ReviewForm />
        <Checkbox name="remember">Remember this preference on this device</Checkbox>
        <RadioGroup
          legend="Result detail"
          name="detail"
          options={[{ label: "Summary", value: "summary" }, { label: "Detailed", value: "detailed" }]}
        />
        <Toggle name="rounding">Round the result</Toggle>
      </Card>

      <h2>Results and continuation</h2>
      <ResultPanel
        label="Estimated total"
        answer="€42.80"
        supportingValues={<p>Distance: 320 km · Consumption: 6.2 L/100 km</p>}
        assumptions={<p>Fuel price and consumption remain constant.</p>}
        warnings={<p>This is an illustrative result, not a live utility.</p>}
        methodology={<p>Inputs are multiplied using the displayed units.</p>}
        actions={<Button variant="secondary" disabled>Copy action position</Button>}
        relatedTool={<RelatedToolCard href="/" linkLabel="Go to Youtoola home" title="Youtoola home" description="Return to the current live platform route." />}
      />
      <CommercialPlaceholder kind="advertising" />
      <CommercialPlaceholder kind="affiliate" />

      <h2>Utility framework</h2>
      <Card aria-labelledby="utility-framework-title">
        <h3 id="utility-framework-title">Neutral browser-local calculation</h3>
        <p>This fictional example demonstrates validation, calculation, reset, result announcement, and privacy-safe copy feedback without a Production utility.</p>
        <UtilityFrameworkExample />
        <CommercialPlaceholder kind="premium" />
      </Card>

      <h2>Supporting states</h2>
      <div className="review-grid">
        <EmptyState><strong>No saved results</strong><span>Results will appear after a calculation.</span></EmptyState>
        <LoadingState label="Preparing result…" />
      </div>
      <Disclosure summary="How this pattern works">
        Clear assumptions and methodology support trust without delaying the primary result.
      </Disclosure>
    </div>
  );
}
