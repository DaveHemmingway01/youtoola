"use client";

import { useRef, useState, type FormEvent } from "react";

import { Field, NumberInput, Select, TextInput } from "@/components/forms";
import { Button } from "@/components/ui";

export function ReviewForm() {
  const [error, setError] = useState("");
  const [result, setResult] = useState("No result yet");
  const summaryRef = useRef<HTMLDivElement>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const distance = Number(data.get("distance"));

    if (!Number.isFinite(distance) || distance <= 0) {
      setError("Enter a distance greater than zero.");
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }

    setError("");
    setResult(`${distance.toLocaleString()} km ready for calculation`);
  }

  return (
    <form noValidate onSubmit={submit}>
      {error ? (
        <div ref={summaryRef} className="error-summary" role="alert" tabIndex={-1}>
          <strong>Check the form</strong>
          <p>{error}</p>
        </div>
      ) : null}
      <Field
        id="review-name"
        label="Trip name"
        helpText="Optional label for this example."
      >
        <TextInput name="name" autoComplete="off" />
      </Field>
      <Field
        id="review-distance"
        label="Distance"
        unit="km"
        error={error || undefined}
        required
      >
        <NumberInput name="distance" min="0.1" step="0.1" />
      </Field>
      <Field id="review-unit" label="Display unit">
        <Select name="unit" defaultValue="km">
          <option value="km">Kilometres</option>
          <option value="mi">Miles</option>
        </Select>
      </Field>
      <div className="result-panel__actions">
        <Button type="submit">Calculate example</Button>
      </div>
      <p aria-live="polite" aria-atomic="true">
        <strong>Example result:</strong> {result}
      </p>
    </form>
  );
}
