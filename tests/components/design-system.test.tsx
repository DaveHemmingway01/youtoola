// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { Field, NumberInput, RadioGroup, Toggle } from "@/components/forms";
import { MobileNavigation } from "@/components/mobile-navigation";
import { ResultPanel } from "@/components/tool-patterns";
import { IconButton } from "@/components/ui";
import { AnalyticsMonetisationReview } from "@/app/design-system-review/analytics-monetisation-review";
import { InertAdvertisingReview, InertAffiliateReview, InertLeadReview, InertPremiumReview } from "@/components/monetisation/review-components";
import {
  DISABLED_DESIGN_SYSTEM_REVIEW_PATH,
  getDesignSystemReviewRewrites,
  isDesignSystemReviewAvailable,
} from "@/lib/design-system-review";

afterEach(cleanup);

describe("design system accessibility contracts", () => {
  it("associates field help and errors with the control", () => {
    render(
      <Field
        id="distance"
        label="Distance"
        helpText="Use the full route distance."
        error="Enter a positive distance."
      >
        <NumberInput />
      </Field>,
    );

    const input = screen.getByLabelText("Distance");
    expect(input.getAttribute("aria-describedby")).toBe("distance-help distance-error");
    expect(input.getAttribute("aria-invalid")).toBe("true");
  });

  it("uses native group and switch semantics", () => {
    render(
      <>
        <RadioGroup
          legend="Result detail"
          name="detail"
          options={[{ label: "Summary", value: "summary" }]}
        />
        <Toggle>Round result</Toggle>
      </>,
    );

    expect(screen.getByRole("group", { name: "Result detail" })).toBeTruthy();
    expect(screen.getByRole("switch", { name: "Round result" })).toBeTruthy();
  });

  it("requires an accessible name for icon buttons", () => {
    render(<IconButton label="Save result">☆</IconButton>);
    expect(screen.getByRole("button", { name: "Save result" })).toBeTruthy();
  });

  it("announces the primary result politely", () => {
    render(<ResultPanel label="Total" answer="€42.80" />);
    expect(screen.getByText("€42.80").getAttribute("aria-live")).toBe("polite");
  });
});

describe("mobile navigation", () => {
  it("closes on Escape and restores focus to its trigger", async () => {
    const user = userEvent.setup();
    render(<MobileNavigation items={[{ href: "/", label: "Home" }]} />);

    const trigger = screen.getByRole("button", { name: "Menu" });
    await user.click(trigger);
    expect(screen.getByRole("navigation", { name: "Mobile navigation" })).toBeTruthy();

    fireEvent.keyDown(screen.getByRole("navigation"), { key: "Escape" });
    expect(document.activeElement).toBe(trigger);
    expect(screen.queryByRole("navigation", { name: "Mobile navigation" })).toBeNull();
  });
});

describe("review route policy", () => {
  it("is available only outside Production", () => {
    expect(isDesignSystemReviewAvailable("local")).toBe(true);
    expect(isDesignSystemReviewAvailable("preview")).toBe(true);
    expect(isDesignSystemReviewAvailable("production")).toBe(false);
    expect(getDesignSystemReviewRewrites("local")).toEqual([]);
    expect(getDesignSystemReviewRewrites("preview")).toEqual([]);
    expect(getDesignSystemReviewRewrites("production")).toEqual([
      {
        source: "/design-system-review",
        destination: DISABLED_DESIGN_SYSTEM_REVIEW_PATH,
      },
    ]);
  });
});

describe("Phase 8 review-only surfaces", () => {
  it("shows accepted and rejected fixed analytics cases and clears ephemeral results", async () => {
    const user = userEvent.setup();
    render(<AnalyticsMonetisationReview />);
    await user.click(screen.getByRole("button", { name: "Valid event" }));
    await user.click(screen.getByRole("button", { name: "Sensitive" }));
    await user.click(screen.getByRole("button", { name: "Unknown field" }));
    expect(screen.getByText(/Valid:/).parentElement?.textContent).toContain("accepted");
    expect(screen.getByText(/Sensitive:/).parentElement?.textContent).toContain("prohibited-field");
    expect(screen.getByText(/Unknown:/).parentElement?.textContent).toContain("unknown-field");
    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(screen.getByText("No results.")).toBeTruthy();
  });

  it("renders commercial examples as inert disclosure-only content", () => {
    render(<><InertAdvertisingReview /><InertAffiliateReview /><InertPremiumReview /><InertLeadReview /></>);
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.queryByRole("form")).toBeNull();
    expect(screen.getAllByText("Review-only · inactive")).toHaveLength(4);
  });
});
