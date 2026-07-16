// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";

import { analyticsSchemaVersion, type AnalyticsEventEnvelope } from "@/lib/analytics/contracts";
import { createGa4Adapter } from "@/lib/analytics/ga4-adapter";

const event: AnalyticsEventEnvelope = {
  analyticsSchemaVersion,
  categoryId: "test",
  consentState: "analytics-granted",
  environment: "production",
  eventName: "tool_view",
  locale: "en",
  pageType: "utility",
  utilityId: "test",
  utilitySlug: "test",
};

afterEach(() => {
  document.head.innerHTML = "";
  delete window.gtag;
  delete window.dataLayer;
  vi.restoreAllMocks();
});

describe("first-party provider adapter", () => {
  it("drops domain events while disabled and offline without queuing", async () => {
    const adapter = createGa4Adapter({ measurementId: "provider-id" });
    expect(adapter.track(event)).toBe("provider-failure");
    vi.spyOn(window.navigator, "onLine", "get").mockReturnValue(false);
    expect(await adapter.load()).toBe("offline");
    expect(document.querySelectorAll("script")).toHaveLength(0);
    expect(adapter.track(event)).toBe("offline");
  });

  it("loads once, disables automatic page views and becomes disabled after withdrawal", async () => {
    vi.spyOn(window.navigator, "onLine", "get").mockReturnValue(true);
    const adapter = createGa4Adapter({ measurementId: "provider-id", timeoutMilliseconds: 1000 });
    const loading = adapter.load();
    const script = document.querySelector("script")!;
    expect(script).toBeTruthy();
    script.dispatchEvent(new Event("load"));
    expect(await loading).toBe("ready");
    expect(adapter.track(event)).toBe("accepted");
    adapter.updateDenied();
    adapter.disable();
    expect(adapter.track(event)).toBe("provider-failure");
  });

  it("queues commands with the arguments object required by gtag.js", async () => {
    vi.spyOn(window.navigator, "onLine", "get").mockReturnValue(true);
    const adapter = createGa4Adapter({ measurementId: "provider-id", timeoutMilliseconds: 1000 });
    const loading = adapter.load();

    const firstCommand = window.dataLayer?.[0];
    expect(Array.isArray(firstCommand)).toBe(false);
    expect(Array.from(firstCommand as IArguments)).toEqual([
      "consent",
      "default",
      {
        ad_personalization: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        analytics_storage: "denied",
      },
    ]);

    document.querySelector("script#youtoola-ga4")!.dispatchEvent(new Event("load"));
    expect(await loading).toBe("ready");
  });

  it("deduplicates concurrent and repeated provider loads", async () => {
    vi.spyOn(window.navigator, "onLine", "get").mockReturnValue(true);
    const adapter = createGa4Adapter({ measurementId: "provider-id", timeoutMilliseconds: 1000 });
    const firstLoad = adapter.load();

    expect(await adapter.load()).toBe("loading");
    expect(document.querySelectorAll("script#youtoola-ga4")).toHaveLength(1);

    document.querySelector("script#youtoola-ga4")!.dispatchEvent(new Event("load"));
    expect(await firstLoad).toBe("ready");
    expect(await adapter.load()).toBe("ready");
    expect(document.querySelectorAll("script#youtoola-ga4")).toHaveLength(1);
  });

  it("isolates provider failure and timeout without retry", async () => {
    const failed = createGa4Adapter({ measurementId: "provider-id" });
    const failure = failed.load();
    document.querySelector("script")!.dispatchEvent(new Event("error"));
    expect(await failure).toBe("failed");
    expect(document.querySelectorAll("script")).toHaveLength(1);
    expect(await failed.load()).toBe("failed");
    expect(document.querySelectorAll("script")).toHaveLength(1);

    document.head.innerHTML = "";
    vi.useFakeTimers();
    const timedOut = createGa4Adapter({ measurementId: "provider-id", timeoutMilliseconds: 5 });
    const timeout = timedOut.load();
    await vi.advanceTimersByTimeAsync(5);
    expect(await timeout).toBe("timed-out");
    expect(document.querySelectorAll("script")).toHaveLength(1);
    vi.useRealTimers();
  });
});
