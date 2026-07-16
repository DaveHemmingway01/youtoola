// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

const navigation = vi.hoisted(() => ({ pathname: "/" }));
const provider = vi.hoisted(() => ({
  adapter: {
    clear: vi.fn(),
    configured: true,
    disable: vi.fn(),
    lifecycle: "ready" as const,
    load: vi.fn(async () => "ready" as const),
    track: vi.fn(() => "accepted" as const),
    trackPageView: vi.fn(() => true),
    updateDenied: vi.fn(),
  },
}));

vi.mock("next/navigation", () => ({ usePathname: () => navigation.pathname }));
vi.mock("@/lib/analytics/ga4-adapter", () => ({ createGa4Adapter: () => provider.adapter }));

import { ConsentProvider } from "@/components/consent/consent-provider";
import { PrivacyPreferencesButton } from "@/components/consent/privacy-preferences-button";

afterEach(() => {
  cleanup();
  document.cookie = "youtoola_consent=; Max-Age=0; Path=/";
  navigation.pathname = "/";
  window.history.replaceState({}, "", "/");
  vi.clearAllMocks();
});

describe("consent interface", () => {
  it("keeps dormant analytics quiet and exposes footer preferences", async () => {
    const user = userEvent.setup();
    render(
      <ConsentProvider configuration={{ analyticsAvailable: false, environment: "local", secureCookie: false }}>
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
      <ConsentProvider configuration={{ analyticsAvailable: true, environment: "production", measurementId: "provider-id", secureCookie: true }}>
        <PrivacyPreferencesButton />
      </ConsentProvider>,
    );
    const accept = await screen.findByRole("button", { name: "Accept analytics" });
    const reject = screen.getByRole("button", { name: "Reject" });
    expect(accept.className).toBe(reject.className);
    expect(screen.getByText("We don’t collect your calculator inputs or results.", { exact: false })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Read Privacy" }).getAttribute("href")).toBe("/privacy");
    await user.click(reject);
    expect(screen.getByText("Optional analytics rejected.")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Privacy preferences" }));
    expect(screen.getByText("Optional analytics is rejected.")).toBeTruthy();
  });

  it("does not trap Tab inside preferences", async () => {
    const user = userEvent.setup();
    render(
      <ConsentProvider configuration={{ analyticsAvailable: false, environment: "local", secureCookie: false }}>
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

  it("tracks recognized App Router transitions once after provider readiness", async () => {
    document.cookie = "youtoola_consent=v1:analytics-granted; Path=/";
    const view = render(
      <ConsentProvider configuration={{ analyticsAvailable: true, environment: "production", measurementId: "provider-id", secureCookie: true }}>
        <p>Content</p>
      </ConsentProvider>,
    );

    await waitFor(() => expect(provider.adapter.trackPageView).toHaveBeenCalledTimes(1));
    expect(provider.adapter.trackPageView).toHaveBeenLastCalledWith({
      page_location: "https://www.youtoola.com",
      page_title: "Youtoola — Useful tools. No account. No nonsense.",
    });

    navigation.pathname = "/tools";
    window.history.pushState({}, "", "/tools?private=value#result");
    view.rerender(
      <ConsentProvider configuration={{ analyticsAvailable: true, environment: "production", measurementId: "provider-id", secureCookie: true }}>
        <p>Content</p>
      </ConsentProvider>,
    );
    await waitFor(() => expect(provider.adapter.trackPageView).toHaveBeenCalledTimes(2));
    expect(provider.adapter.trackPageView).toHaveBeenLastCalledWith({
      page_location: "https://www.youtoola.com/tools",
      page_title: "Practical Online Tools",
    });

    view.rerender(
      <ConsentProvider configuration={{ analyticsAvailable: true, environment: "production", measurementId: "provider-id", secureCookie: true }}>
        <p>Content</p>
      </ConsentProvider>,
    );
    expect(provider.adapter.trackPageView).toHaveBeenCalledTimes(2);
  });
});
