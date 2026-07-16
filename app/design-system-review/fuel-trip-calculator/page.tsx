import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { UtilityPageShell } from "@/components/tools/utility-page-shell";
import { isDesignSystemReviewAvailable } from "@/lib/design-system-review";
import { fuelTripDefinition } from "@/utilities/fuel-trip-calculator/definition";
import { FuelTripCalculatorForm } from "@/utilities/fuel-trip-calculator/form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: { canonical: "https://www.youtoola.com" },
  robots: { follow: false, index: false },
  title: "Fuel Trip Calculator private preview",
};

export default function FuelTripCalculatorReviewPage() {
  if (!isDesignSystemReviewAvailable()) notFound();

  return (
    <UtilityPageShell
      title="Fuel Trip Calculator"
      introduction={
        <p>Estimate fuel required, fuel cost, toll-inclusive trip cost and an equal cost per passenger using values you supply.</p>
      }
      interactive={<FuelTripCalculatorForm />}
      workedExample={
        <p>
          For a 200 km one-way distance selected as a return trip, the total distance is 400 km. At 6 L/100 km, the journey uses 24 L. At 1.50 per litre plus 12 in total tolls, the trip costs 48 in the same currency; split between three people, that is 16 each.
        </p>
      }
      methodology={
        <>
          <ol>
            {fuelTripDefinition.methodology.formulaSteps.map((step) => <li key={step}>{step}</li>)}
          </ol>
          <p>
            Consumption uses the standard litres-per-100-kilometres convention described in the{" "}
            <a href={fuelTripDefinition.methodology.citations[0].url}>EU fuel-consumption information rules</a>.
          </p>
          <p>This is a planning estimate. Actual consumption can change with traffic, speed, terrain, weather, load and driving style.</p>
        </>
      }
      faqs={
        <div>
          <h3>Does a return trip double the toll cost?</h3>
          <p>No. The distance is doubled, but toll systems can charge differently by direction. Enter the total toll amount for the whole journey.</p>
          <h3>Who should be included in the passenger count?</h3>
          <p>Include everyone sharing the cost, including the driver.</p>
          <h3>Does Youtoola supply fuel or toll prices?</h3>
          <p>No. Enter current values for your location and route; the calculator stores no price feed or regional default.</p>
        </div>
      }
      privacyNote={
        <p>Your inputs and calculation stay in this browser tab. This preview does not save them in an account, URL, cookie or browser storage.</p>
      }
    />
  );
}
