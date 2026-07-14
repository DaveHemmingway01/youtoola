// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { UtilityFrameworkExample } from "@/app/design-system-review/utility-framework-example";
import { UtilityPageShell } from "@/components/tools/utility-page-shell";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("utility framework interaction", () => {
  it("focuses errors, revalidates after editing, calculates, and resets", async () => {
    const user = userEvent.setup();
    render(<UtilityFrameworkExample />);

    await user.click(screen.getByRole("button", { name: "Calculate fictional estimate" }));
    await waitFor(() => expect(document.activeElement).toBe(screen.getByText("Check the form").parentElement));
    expect(screen.getByLabelText("Example quantity").getAttribute("aria-invalid")).toBe("true");

    await user.type(screen.getByLabelText("Example quantity"), "8");
    expect(screen.getByLabelText("Example quantity").getAttribute("aria-invalid")).toBeNull();
    await user.click(screen.getByRole("button", { name: "Calculate fictional estimate" }));
    expect(screen.getByText("Result: 10 units").getAttribute("aria-live")).toBe("polite");

    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect((screen.getByLabelText("Example quantity") as HTMLInputElement).value).toBe("");
    expect(screen.queryByText("10 units")).toBeNull();
    await waitFor(() => expect(document.activeElement).toBe(screen.getByLabelText("Example quantity")));
  });

  it("reports copy success and failure accessibly", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    render(<UtilityFrameworkExample />);
    await user.type(screen.getByLabelText("Example quantity"), "4");
    await user.click(screen.getByRole("button", { name: "Calculate fictional estimate" }));
    await user.click(screen.getByRole("button", { name: "Copy result" }));
    expect(await screen.findByText("Result copied.")).toBeTruthy();
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining("Example estimate: 5 units"));

    writeText.mockRejectedValueOnce(new Error("denied"));
    await user.click(screen.getByRole("button", { name: "Copy result" }));
    expect(await screen.findByText(/Could not copy the result/)).toBeTruthy();
  });

  it("keeps server-rendered utility sections in the approved order and hides empty continuation", () => {
    const { container } = render(
      <UtilityPageShell
        title="Neutral utility"
        introduction={<p>Introduction</p>}
        interactive={<div>Interactive slot</div>}
        workedExample={<p>Example content</p>}
        methodology={<p>Method content</p>}
        privacyNote={<p>Privacy content</p>}
      />,
    );
    const text = container.textContent ?? "";
    expect(text.indexOf("Interactive slot")).toBeLessThan(text.indexOf("Worked example"));
    expect(text.indexOf("Worked example")).toBeLessThan(text.indexOf("Methodology and sources"));
    expect(text.indexOf("Methodology and sources")).toBeLessThan(text.indexOf("Privacy"));
    expect(container.querySelector(".utility-page__commercial")).toBeNull();
    expect(screen.queryByRole("heading", { name: "Related tools" })).toBeNull();
  });
});
