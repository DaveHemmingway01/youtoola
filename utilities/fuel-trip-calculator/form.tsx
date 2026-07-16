"use client";

import { useCallback, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";

import { useConsentPreferences } from "@/components/consent/consent-provider";
import { CurrencyInput, ErrorMessage, ErrorSummary, Field, NumberInput } from "@/components/forms";
import { UtilityResultPanel } from "@/components/tools/utility-result-panel";
import { Button } from "@/components/ui";
import { formatNumber } from "@/lib/formatting/numbers";
import { roundToDecimalPlaces } from "@/lib/calculations/rounding";
import { resolveCanonicalAnalyticsContext } from "@/lib/analytics/canonical-context";
import type { UtilityAnalyticsEventInput } from "@/lib/analytics/contracts";
import type { AnalyticsDeduplicationToken } from "@/lib/analytics/runtime";
import type { UtilityResult } from "@/lib/utilities/contracts";
import {
  parseNumberField,
  sortValidationIssues,
  type UtilityValidationIssue,
} from "@/lib/validation/utility-validation";

import { calculateFuelTrip, type FuelTripType } from "./calculation";
import { fuelTripDefinition, fuelTripInputOrder, fuelTripInputs } from "./definition";

interface RawFuelTripForm {
  consumption: string;
  distance: string;
  passengers: string;
  price: string;
  tolls: string;
  tripType: "" | FuelTripType;
}

const emptyForm: RawFuelTripForm = {
  consumption: "",
  distance: "",
  passengers: "",
  price: "",
  tolls: "",
  tripType: "",
};

const canonicalAnalyticsContext = resolveCanonicalAnalyticsContext("fuel-trip-calculator");

function errorCountBucket(count: number) {
  if (count === 1) return "one" as const;
  if (count <= 3) return "two-to-three" as const;
  return "four-or-more" as const;
}

function timeToResultBucket(milliseconds: number) {
  if (milliseconds < 10_000) return "under-10-seconds" as const;
  if (milliseconds < 31_000) return "10-to-30-seconds" as const;
  if (milliseconds < 61_000) return "31-to-60-seconds" as const;
  if (milliseconds < 181_000) return "one-to-three-minutes" as const;
  return "over-three-minutes" as const;
}

function issueFor(issues: readonly UtilityValidationIssue[], fieldId: string) {
  return issues.find((issue) => issue.fieldId === fieldId)?.message;
}

function displayNumber(value: number, minimumFractionDigits = 0) {
  return formatNumber(roundToDecimalPlaces(value, 2), {
    locale: "en",
    maximumFractionDigits: 2,
    minimumFractionDigits,
  });
}

function createResult(calculation: {
  costPerPassenger: number;
  fuelCost: number;
  fuelRequiredLitres: number;
  journeyDistanceKm: number;
  totalTripCost: number;
}): UtilityResult {
  return {
    assumptions: fuelTripDefinition.assumptions,
    calculationVersion: fuelTripDefinition.calculationVersion,
    classification: "estimate",
    futureCapabilities: { export: false, nativeShare: false },
    limitations: fuelTripDefinition.methodology.limitations,
    methodologyReference: {
      calculationVersion: fuelTripDefinition.calculationVersion,
      methodologyVersion: fuelTripDefinition.methodologyVersion,
    },
    nonSensitiveResultType: "trip-cost-estimate",
    primary: {
      formatted: displayNumber(calculation.totalTripCost, 2),
      id: "total-trip-cost",
      label: "Total trip cost (input currency)",
      rawValue: calculation.totalTripCost,
    },
    supporting: [
      {
        displayUnit: "km",
        formatted: `${displayNumber(calculation.journeyDistanceKm)} km`,
        id: "journey-distance",
        label: "Total journey distance",
        rawValue: calculation.journeyDistanceKm,
      },
      {
        displayUnit: "L",
        formatted: `${displayNumber(calculation.fuelRequiredLitres)} L`,
        id: "fuel-required",
        label: "Fuel required",
        rawValue: calculation.fuelRequiredLitres,
      },
      {
        formatted: displayNumber(calculation.fuelCost, 2),
        id: "fuel-cost",
        label: "Fuel cost (input currency)",
        rawValue: calculation.fuelCost,
      },
      {
        formatted: displayNumber(calculation.costPerPassenger, 2),
        id: "cost-per-passenger",
        label: "Cost per passenger (input currency)",
        rawValue: calculation.costPerPassenger,
      },
    ],
    warnings: fuelTripDefinition.warnings,
  };
}

function parseForm(raw: RawFuelTripForm) {
  const distance = parseNumberField(fuelTripInputs.distance, raw.distance);
  const consumption = parseNumberField(fuelTripInputs.consumption, raw.consumption);
  const price = parseNumberField(fuelTripInputs.price, raw.price);
  const tolls = parseNumberField(fuelTripInputs.tolls, raw.tolls);
  const passengers = parseNumberField(fuelTripInputs.passengers, raw.passengers);
  const issues: UtilityValidationIssue[] = [];

  for (const parsed of [distance, consumption, price, tolls, passengers]) {
    if (!parsed.ok) issues.push(parsed.issue);
  }
  if (raw.tripType === "") {
    issues.push({
      code: "required",
      fieldId: fuelTripInputs.tripType.id,
      message: fuelTripInputs.tripType.errorMessages.required ?? "Choose a journey type.",
    });
  }
  if (passengers.ok && passengers.value !== undefined && !Number.isSafeInteger(passengers.value)) {
    issues.push({
      code: "whole-number",
      fieldId: fuelTripInputs.passengers.id,
      message: fuelTripInputs.passengers.errorMessages.invalid,
    });
  }

  const sortedIssues = sortValidationIssues(issues, fuelTripInputOrder);
  if (
    sortedIssues.length > 0 ||
    !distance.ok || distance.value === undefined ||
    !consumption.ok || consumption.value === undefined ||
    !price.ok || price.value === undefined ||
    !tolls.ok ||
    !passengers.ok || passengers.value === undefined ||
    raw.tripType === ""
  ) {
    return { issues: sortedIssues, ok: false as const };
  }

  return {
    issues: sortedIssues,
    ok: true as const,
    value: {
      distanceKm: distance.value,
      fuelConsumptionLitresPer100Km: consumption.value,
      fuelPricePerLitre: price.value,
      passengerCount: passengers.value,
      tollCost: tolls.value ?? 0,
      tripType: raw.tripType,
    },
  };
}

export function FuelTripCalculatorForm() {
  const { analyticsReady, trackUtilityEvent } = useConsentPreferences();
  const [raw, setRaw] = useState<RawFuelTripForm>(emptyForm);
  const [issues, setIssues] = useState<readonly UtilityValidationIssue[]>([]);
  const [result, setResult] = useState<UtilityResult>();
  const [submitted, setSubmitted] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);
  const distanceRef = useRef<HTMLInputElement>(null);
  const attemptCycle = useRef(0);
  const interactionCycle = useRef(0);
  const interactionStarted = useRef(false);
  const interactionStartedAt = useRef<number | undefined>(undefined);

  const track = useCallback((
    event: UtilityAnalyticsEventInput,
    deduplicationToken: AnalyticsDeduplicationToken,
  ) => {
    if (!canonicalAnalyticsContext) return;
    trackUtilityEvent({
      canonicalContext: canonicalAnalyticsContext,
      deduplicationToken,
      eligibility: fuelTripDefinition.analyticsEligibility,
      event,
      lifecycleEligible: true,
    });
  }, [trackUtilityEvent]);

  useEffect(() => {
    if (!analyticsReady) return;
    track(
      { eventName: "tool_view" },
      { action: 0, cycle: 0, eventName: "tool_view", scope: "route" },
    );
  }, [analyticsReady, track]);

  function startInteraction(source: "input-change" | "primary-action", timestamp: number) {
    if (interactionStarted.current) return;
    interactionStarted.current = true;
    interactionStartedAt.current = timestamp;
    track(
      { eventName: "tool_start", interactionSource: source },
      {
        action: 0,
        cycle: interactionCycle.current,
        eventName: "tool_start",
        scope: "interaction",
      },
    );
  }

  function update(next: RawFuelTripForm) {
    setRaw(next);
    setResult(undefined);
    if (submitted) setIssues(parseForm(next).issues);
  }

  function changeNumber(event: ChangeEvent<HTMLInputElement>) {
    const field = event.currentTarget.name as Exclude<keyof RawFuelTripForm, "tripType">;
    startInteraction("input-change", event.timeStamp);
    update({ ...raw, [field]: event.currentTarget.value });
  }

  function changeTripType(event: ChangeEvent<HTMLInputElement>) {
    startInteraction("input-change", event.timeStamp);
    update({ ...raw, tripType: event.currentTarget.value as FuelTripType });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startInteraction("primary-action", event.timeStamp);
    const currentAttempt = attemptCycle.current;
    attemptCycle.current += 1;
    setSubmitted(true);
    const parsed = parseForm(raw);
    setIssues(parsed.issues);
    if (!parsed.ok) {
      const firstIssue = parsed.issues[0];
      if (firstIssue?.fieldId) {
        track(
          {
            errorCode: firstIssue.code,
            errorCountBucket: errorCountBucket(parsed.issues.length),
            eventName: "tool_validation_error",
            fieldId: firstIssue.fieldId,
          },
          {
            action: 0,
            cycle: currentAttempt,
            eventName: "tool_validation_error",
            scope: "attempt",
          },
        );
      }
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    const outcome = calculateFuelTrip(parsed.value);
    if (!outcome.ok) {
      setIssues([{ code: outcome.code, message: outcome.message }]);
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setResult(createResult(outcome.value));
    track(
      {
        eventName: "tool_complete",
        nonSensitiveResultType: "trip-cost-estimate",
        resultClassification: "estimate",
        timeToResultBucket: timeToResultBucket(
          Math.max(0, event.timeStamp - (interactionStartedAt.current ?? event.timeStamp)),
        ),
      },
      {
        action: 0,
        cycle: currentAttempt,
        eventName: "tool_complete",
        scope: "attempt",
      },
    );
  }

  function reset() {
    setRaw(emptyForm);
    setIssues([]);
    setResult(undefined);
    setSubmitted(false);
    interactionCycle.current += 1;
    interactionStarted.current = false;
    interactionStartedAt.current = undefined;
    requestAnimationFrame(() => distanceRef.current?.focus());
  }

  const tripTypeError = issueFor(issues, fuelTripInputs.tripType.id);
  const tripTypeErrorId = tripTypeError ? `${fuelTripInputs.tripType.id}-error` : undefined;

  return (
    <div className="utility-example fuel-trip-calculator">
      <p className="visually-hidden" aria-atomic="true" aria-live="polite">
        {result ? `Result: ${result.primary.formatted} in your input currency.` : ""}
      </p>
      <form noValidate onSubmit={submit}>
        <ErrorSummary issues={issues} summaryRef={summaryRef} />
        <Field
          error={issueFor(issues, fuelTripInputs.distance.id)}
          helpText={fuelTripInputs.distance.helpText}
          id={fuelTripInputs.distance.id}
          label={fuelTripInputs.distance.label}
          required
          unit={fuelTripInputs.distance.unit}
        >
          <NumberInput
            min={fuelTripInputs.distance.min}
            name="distance"
            onChange={changeNumber}
            ref={distanceRef}
            step={fuelTripInputs.distance.step}
            value={raw.distance}
          />
        </Field>
        <Field
          error={issueFor(issues, fuelTripInputs.consumption.id)}
          helpText={fuelTripInputs.consumption.helpText}
          id={fuelTripInputs.consumption.id}
          label={fuelTripInputs.consumption.label}
          required
          unit={fuelTripInputs.consumption.unit}
        >
          <NumberInput
            min={fuelTripInputs.consumption.min}
            name="consumption"
            onChange={changeNumber}
            step={fuelTripInputs.consumption.step}
            value={raw.consumption}
          />
        </Field>
        <Field
          error={issueFor(issues, fuelTripInputs.price.id)}
          helpText={fuelTripInputs.price.helpText}
          id={fuelTripInputs.price.id}
          label={fuelTripInputs.price.label}
          required
          unit={fuelTripInputs.price.unit}
        >
          <CurrencyInput
            min={fuelTripInputs.price.min}
            name="price"
            onChange={changeNumber}
            step={fuelTripInputs.price.step}
            value={raw.price}
          />
        </Field>
        <fieldset
          aria-describedby={tripTypeErrorId}
          aria-invalid={tripTypeError ? true : undefined}
          className="field choice-group"
          id={fuelTripInputs.tripType.id}
          tabIndex={-1}
        >
          <legend>{fuelTripInputs.tripType.label}</legend>
          <label className="choice">
            <input
              checked={raw.tripType === "one-way"}
              name="trip-type"
              onChange={changeTripType}
              type="radio"
              value="one-way"
            />
            <span>One-way</span>
          </label>
          <label className="choice">
            <input
              checked={raw.tripType === "return"}
              name="trip-type"
              onChange={changeTripType}
              type="radio"
              value="return"
            />
            <span>Return</span>
          </label>
          {tripTypeError && tripTypeErrorId ? <ErrorMessage id={tripTypeErrorId}>{tripTypeError}</ErrorMessage> : null}
        </fieldset>
        <Field
          error={issueFor(issues, fuelTripInputs.tolls.id)}
          helpText={fuelTripInputs.tolls.helpText}
          id={fuelTripInputs.tolls.id}
          label={fuelTripInputs.tolls.label}
          unit={fuelTripInputs.tolls.unit}
        >
          <CurrencyInput
            min={fuelTripInputs.tolls.min}
            name="tolls"
            onChange={changeNumber}
            step={fuelTripInputs.tolls.step}
            value={raw.tolls}
          />
        </Field>
        <Field
          error={issueFor(issues, fuelTripInputs.passengers.id)}
          helpText={fuelTripInputs.passengers.helpText}
          id={fuelTripInputs.passengers.id}
          label={fuelTripInputs.passengers.label}
          required
          unit={fuelTripInputs.passengers.unit}
        >
          <NumberInput
            min={fuelTripInputs.passengers.min}
            name="passengers"
            onChange={changeNumber}
            step={fuelTripInputs.passengers.step}
            value={raw.passengers}
          />
        </Field>
        <div className="result-panel__actions">
          <Button type="submit">Calculate trip cost</Button>
          <Button onClick={reset} type="button" variant="quiet">Reset</Button>
        </div>
      </form>
      {result ? <UtilityResultPanel result={result} /> : null}
    </div>
  );
}
