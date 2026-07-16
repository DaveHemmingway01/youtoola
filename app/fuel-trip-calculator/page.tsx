import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { UtilityPageShell } from "@/components/tools/utility-page-shell";
import { UTILITY_SEO_DEFINITIONS } from "@/data/seo/utilities";
import { getPublicRelatedToolsForUtility } from "@/lib/discovery";
import { createPageMetadata } from "@/lib/seo/metadata";
import { createBreadcrumbStructuredData } from "@/lib/seo/structured-data";
import type { SeoBreadcrumbItem } from "@/lib/seo/types";
import { fuelTripDefinition } from "@/utilities/fuel-trip-calculator/definition";
import { FuelTripCalculatorForm } from "@/utilities/fuel-trip-calculator/form";

const seo = UTILITY_SEO_DEFINITIONS[0];
const breadcrumbs = Object.freeze([
  Object.freeze({ href: "/", label: "Home" }),
  Object.freeze({ href: "/tools", label: "Tools" }),
  Object.freeze({ href: "/fuel-trip-calculator", label: "Fuel Trip Calculator" }),
] satisfies readonly SeoBreadcrumbItem[]);

export const metadata: Metadata = createPageMetadata(seo);

export default function FuelTripCalculatorPage() {
  const relatedTools = getPublicRelatedToolsForUtility("fuel-trip-calculator");

  return (
    <>
      <JsonLd
        data={createBreadcrumbStructuredData(breadcrumbs)}
        id="fuel-trip-calculator-breadcrumbs"
      />
      <UtilityPageShell
        title="Fuel Trip Calculator"
        introduction={
          <p>
            Estimate fuel required, fuel cost, total trip cost including tolls, and
            cost per passenger using your own current values.
          </p>
        }
        interactive={<FuelTripCalculatorForm />}
        workedExample={
          <p>
            For a 200 km one-way distance selected as a return trip, the total
            distance is 400 km. At 6 L/100 km, the journey uses 24 L. At 1.50 per
            litre plus 12 in total tolls, the trip costs 48 in the same currency;
            split between three people, that is 16 each.
          </p>
        }
        methodology={
          <>
            <p>{fuelTripDefinition.methodology.summary}</p>
            <ol>
              {fuelTripDefinition.methodology.formulaSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <h3>Assumptions and limitations</h3>
            <ul>
              {fuelTripDefinition.assumptions.map((assumption) => (
                <li key={assumption}>{assumption}</li>
              ))}
              {fuelTripDefinition.methodology.limitations.map((limitation) => (
                <li key={limitation}>{limitation}</li>
              ))}
            </ul>
            <p>
              The consumption input uses the litres-per-100-kilometres convention
              described in the{" "}
              <a href={fuelTripDefinition.methodology.citations[0].url}>
                EU fuel-consumption information rules
              </a>.
            </p>
            <p>
              <strong>Reviewed:</strong> {fuelTripDefinition.reviewedDate}.{" "}
              <strong>Calculation version:</strong>{" "}
              {fuelTripDefinition.calculationVersion}.{" "}
              <strong>Methodology version:</strong>{" "}
              {fuelTripDefinition.methodologyVersion}.
            </p>
          </>
        }
        faqs={
          <div>
            <h3>Does a return trip double the toll cost?</h3>
            <p>
              No. The distance is doubled, but toll systems can charge differently
              by direction. Enter the total toll amount for the whole journey.
            </p>
            <h3>Who should be included in the passenger count?</h3>
            <p>Include everyone sharing the cost, including the driver.</p>
            <h3>Does Youtoola supply fuel or toll prices?</h3>
            <p>
              No. Enter current values for your location and route; the calculator
              stores no price feed or regional default.
            </p>
          </div>
        }
        privacyNote={
          <p>
            Your inputs and calculation stay in this browser tab. They are not saved
            in an account, URL, cookie, or browser storage. Optional analytics, when
            operational and accepted, receives only approved non-sensitive event
            classifications—never your entered values or exact result.
          </p>
        }
        relatedTools={relatedTools}
      />
    </>
  );
}
