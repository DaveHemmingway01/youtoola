// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { validateUtilityDefinition } from "@/lib/utilities/definition-validation";
import { fuelTripDefinition } from "@/utilities/fuel-trip-calculator/definition";
import { FuelTripCalculatorForm } from "@/utilities/fuel-trip-calculator/form";

afterEach(cleanup);

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("One-way trip distance"), "200");
  await user.type(screen.getByLabelText("Fuel consumption"), "6");
  await user.type(screen.getByLabelText("Fuel price per litre"), "1.5");
  await user.click(screen.getByLabelText("Return"));
  await user.type(screen.getByLabelText("Total toll cost"), "12");
  await user.type(screen.getByLabelText("People sharing the cost"), "3");
}

describe("Fuel Trip Calculator form", () => {
  it("has a valid standard definition while registry publication remains separate", () => {
    expect(validateUtilityDefinition(fuelTripDefinition)).toEqual([]);
    expect(fuelTripDefinition.analyticsEligibility.allowedEvents).toEqual([]);
    expect(fuelTripDefinition.commercialEligibility).toEqual([]);
  });

  it("calculates and announces a complete result once", async () => {
    const user = userEvent.setup();
    render(<FuelTripCalculatorForm />);
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: "Calculate trip cost" }));

    expect(screen.getByText("48.00")).toBeTruthy();
    expect(screen.getByText("24 L")).toBeTruthy();
    expect(screen.getByText("36.00")).toBeTruthy();
    expect(screen.getByText("16.00")).toBeTruthy();
    expect(screen.getByText("Result: 48.00 in your input currency.").getAttribute("aria-live")).toBe("polite");
    expect(document.querySelectorAll("[aria-live='polite']")).toHaveLength(1);
  });

  it("focuses the linked error summary and revalidates edited fields", async () => {
    const user = userEvent.setup();
    render(<FuelTripCalculatorForm />);
    await user.click(screen.getByRole("button", { name: "Calculate trip cost" }));
    await waitFor(() => expect(document.activeElement).toBe(screen.getByText("Check the form").parentElement));
    expect(screen.getByLabelText("One-way trip distance").getAttribute("aria-invalid")).toBe("true");
    expect(screen.getAllByText("Choose one-way or return.")).toHaveLength(2);

    await user.type(screen.getByLabelText("One-way trip distance"), "50");
    expect(screen.getByLabelText("One-way trip distance").getAttribute("aria-invalid")).toBeNull();
  });

  it("rejects fractional passenger counts and resets without persistence", async () => {
    const user = userEvent.setup();
    render(<FuelTripCalculatorForm />);
    await fillValidForm(user);
    await user.clear(screen.getByLabelText("People sharing the cost"));
    await user.type(screen.getByLabelText("People sharing the cost"), "2.5");
    await user.click(screen.getByRole("button", { name: "Calculate trip cost" }));
    expect(screen.getAllByText("Enter a whole number of passengers.")).toHaveLength(2);

    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect((screen.getByLabelText("One-way trip distance") as HTMLInputElement).value).toBe("");
    await waitFor(() => expect(document.activeElement).toBe(screen.getByLabelText("One-way trip distance")));
  });

  it("accepts zero consumption and zero tolls while keeping the result deterministic", async () => {
    const user = userEvent.setup();
    render(<FuelTripCalculatorForm />);
    await user.type(screen.getByLabelText("One-way trip distance"), "50");
    await user.type(screen.getByLabelText("Fuel consumption"), "0");
    await user.type(screen.getByLabelText("Fuel price per litre"), "1.5");
    await user.click(screen.getByLabelText("One-way"));
    await user.type(screen.getByLabelText("Total toll cost"), "0");
    await user.type(screen.getByLabelText("People sharing the cost"), "1");
    await user.click(screen.getByRole("button", { name: "Calculate trip cost" }));

    expect(screen.getByText("0 L")).toBeTruthy();
    expect(screen.getAllByText("0.00")).toHaveLength(3);
  });
});
