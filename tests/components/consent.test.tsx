// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { ConsentProvider } from "@/components/consent/consent-provider";
import { PrivacyPreferencesButton } from "@/components/consent/privacy-preferences-button";

afterEach(() => {
  cleanup();
  document.cookie = "youtoola_consent=; Max-Age=0; Path=/";
});

describe("consent interface", () => {
  it("keeps dormant analytics quiet and exposes footer preferences", async () => {
    const user = userEvent.setup();
    render(
      <ConsentProvider configuration={{ analyticsAvailable: false, secureCookie: false }}>
        <PrivacyPreferencesButton />
      </ConsentProvider>,
    );
    expect(screen.queryByRole("heading", { name: "Optional analytics" })).toBeNull();
    const trigger = screen.getByRole("button", { name: "Privacy preferences" });
    await user.click(trigger);
    expect(screen.getByText("Optional analytics is currently off. No analytics provider is active.")).toBeTruthy();
    expect(document.cookie).toBe("");

    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(document.activeElement).toBe(trigger));
    expect(screen.queryByRole("heading", { name: "Privacy preferences" })).toBeNull();
  });

  it("shows equal active choices only for an available unknown configuration", async () => {
    const user = userEvent.setup();
    render(
      <ConsentProvider configuration={{ analyticsAvailable: true, measurementId: "provider-id", secureCookie: true }}>
        <PrivacyPreferencesButton />
      </ConsentProvider>,
    );
    const accept = await screen.findByRole("button", { name: "Accept analytics" });
    const reject = screen.getByRole("button", { name: "Reject" });
    expect(accept.className).toBe(reject.className);
    expect(screen.getByRole("link", { name: "Read Privacy" }).getAttribute("href")).toBe("/privacy");
    await user.click(reject);
    expect(screen.getByText("Optional analytics rejected.")).toBeTruthy();
  });

  it("does not trap Tab inside preferences", async () => {
    const user = userEvent.setup();
    render(
      <ConsentProvider configuration={{ analyticsAvailable: false, secureCookie: false }}>
        <PrivacyPreferencesButton />
        <a href="/outside">Outside control</a>
      </ConsentProvider>,
    );
    await user.click(screen.getByRole("button", { name: "Privacy preferences" }));
    const close = screen.getByRole("button", { name: "Close preferences" });
    close.focus();
    await user.tab();
    expect(document.activeElement).not.toBe(close);
  });
});
