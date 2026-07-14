"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";

import { ErrorSummary, Field, NumberInput } from "@/components/forms";
import { CopyResultButton } from "@/components/tools/copy-result-button";
import { UtilityResultPanel } from "@/components/tools/utility-result-panel";
import { Button } from "@/components/ui";
import { formatNumber } from "@/lib/formatting/numbers";
import { roundToDecimalPlaces } from "@/lib/calculations/rounding";
import type { UtilityInputDefinition, UtilityResult } from "@/lib/utilities/contracts";
import { parseNumberField, sortValidationIssues, type UtilityValidationIssue } from "@/lib/validation/utility-validation";

const quantityInput: UtilityInputDefinition = {
  errorMessages: {
    invalid: "Enter a valid quantity.",
    min: "Enter a quantity greater than zero.",
    required: "Enter a quantity.",
  },
  helpText: "Use any positive fictional quantity for this framework example.",
  id: "framework-quantity",
  inputMode: "decimal",
  label: "Example quantity",
  min: 0.01,
  required: true,
  step: 0.01,
  type: "number",
  unit: "units",
};

function calculateExample(quantity: number): UtilityResult {
  const normalized = roundToDecimalPlaces(quantity * 1.25, 2);
  const formatted = formatNumber(normalized, { locale: "en", maximumFractionDigits: 2 });
  return {
    assumptions: ["The fictional adjustment factor is fixed at 1.25 for this review example."],
    calculationVersion: 1,
    classification: "estimate",
    copyPayload: { text: `Example estimate: ${formatted} units`, title: "Youtoola framework example" },
    futureCapabilities: { export: false, nativeShare: false },
    limitations: ["This neutral example is not a production utility."],
    methodologyReference: { calculationVersion: 1, methodologyVersion: 1 },
    nonSensitiveResultType: "framework-example",
    primary: { displayUnit: "units", formatted: `${formatted} units`, id: "estimate", label: "Example estimate", rawValue: normalized },
    supporting: [{ formatted: `${quantity} units`, id: "entered-quantity", label: "Entered quantity", rawValue: quantity, displayUnit: "units" }],
    warnings: [],
  };
}

export function UtilityFrameworkExample() {
  const [rawQuantity, setRawQuantity] = useState("");
  const [issues, setIssues] = useState<readonly UtilityValidationIssue[]>([]);
  const [result, setResult] = useState<UtilityResult>();
  const [submitted, setSubmitted] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);
  const quantityRef = useRef<HTMLInputElement>(null);

  function validate(value: string) {
    const parsed = parseNumberField(quantityInput, value);
    const nextIssues = parsed.ok ? [] : [parsed.issue];
    setIssues(sortValidationIssues(nextIssues, [quantityInput.id]));
    return parsed;
  }

  function changeQuantity(event: ChangeEvent<HTMLInputElement>) {
    const value = event.currentTarget.value;
    setRawQuantity(value);
    setResult(undefined);
    if (submitted) validate(value);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    const parsed = validate(rawQuantity);
    if (!parsed.ok || parsed.value === undefined) {
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setResult(calculateExample(parsed.value));
  }

  function reset() {
    setRawQuantity("");
    setIssues([]);
    setResult(undefined);
    setSubmitted(false);
    requestAnimationFrame(() => quantityRef.current?.focus());
  }

  return (
    <div className="utility-example">
      <p className="visually-hidden" aria-live="polite" aria-atomic="true">
        {result ? `Result: ${result.primary.formatted}` : ""}
      </p>
      <form noValidate onSubmit={submit}>
        <ErrorSummary issues={issues} summaryRef={summaryRef} />
        <Field id={quantityInput.id} label={quantityInput.label} helpText={quantityInput.helpText} unit={quantityInput.unit} error={issues[0]?.message} required>
          <NumberInput ref={quantityRef} name="quantity" min={quantityInput.min} step={quantityInput.step} value={rawQuantity} onChange={changeQuantity} />
        </Field>
        <div className="result-panel__actions">
          <Button type="submit">Calculate fictional estimate</Button>
          <Button type="button" variant="quiet" onClick={reset}>Reset</Button>
        </div>
      </form>
      {result ? <UtilityResultPanel result={result} actions={result.copyPayload ? <CopyResultButton payload={result.copyPayload} /> : undefined} /> : null}
    </div>
  );
}
