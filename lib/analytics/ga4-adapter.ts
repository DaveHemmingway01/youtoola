import type { AnalyticsEventEnvelope } from "./contracts";
import { mapAnalyticsEventToGa4 } from "./ga4-mapping";

type GtagCommand = ["consent" | "config" | "event" | "js", ...unknown[]];

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...command: GtagCommand) => void;
  }
}

export type Ga4ProviderLifecycle =
  | "disabled"
  | "loading"
  | "ready"
  | "offline"
  | "failed"
  | "timed-out";

export interface Ga4Adapter {
  readonly configured: boolean;
  readonly lifecycle: Ga4ProviderLifecycle;
  clear(): void;
  disable(): void;
  load(): Promise<Ga4ProviderLifecycle>;
  track(event: Readonly<AnalyticsEventEnvelope>): "accepted" | "offline" | "provider-failure" | "timeout";
  trackPageView(pageView: Readonly<{ page_location: string; page_title: string }>): boolean;
  updateDenied(): void;
}

const SCRIPT_ID = "youtoola-ga4";
export const GA4_CSP_ORIGINS = Object.freeze({
  connect: Object.freeze(["https://www.google-analytics.com"]),
  script: Object.freeze(["https://www.googletagmanager.com"]),
});
const SCRIPT_ORIGIN = GA4_CSP_ORIGINS.script[0];

export function createGa4Adapter({
  measurementId,
  timeoutMilliseconds = 4_000,
}: {
  measurementId: string;
  timeoutMilliseconds?: number;
}): Ga4Adapter {
  let lifecycle: Ga4ProviderLifecycle = "disabled";
  let timeout: ReturnType<typeof setTimeout> | undefined;
  let providerLoaded = false;

  const command = (...args: GtagCommand) => window.gtag?.(...args);
  const clearTimer = () => {
    if (timeout) clearTimeout(timeout);
    timeout = undefined;
  };
  const clear = () => {
    clearTimer();
    document.getElementById(SCRIPT_ID)?.remove();
    delete window.gtag;
    delete window.dataLayer;
    providerLoaded = false;
  };
  const disable = () => {
    clearTimer();
    lifecycle = "disabled";
  };

  return {
    get configured() {
      return lifecycle === "ready";
    },
    get lifecycle() {
      return lifecycle;
    },
    clear,
    disable,
    async load() {
      if (lifecycle !== "disabled") return lifecycle;
      if (!navigator.onLine) {
        lifecycle = "offline";
        return lifecycle;
      }

      lifecycle = "loading";
      window.dataLayer = window.dataLayer ?? [];
      window.gtag = window.gtag ?? function gtag() {
        // gtag.js consumes each queued command as the wrapper's Arguments object.
        // eslint-disable-next-line prefer-rest-params
        window.dataLayer?.push(arguments);
      };
      command("consent", "default", {
        ad_personalization: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        analytics_storage: "denied",
      });
      command("js", new Date());

      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.async = true;
      script.src = `${SCRIPT_ORIGIN}/gtag/js?id=${encodeURIComponent(measurementId)}`;

      return await new Promise<Ga4ProviderLifecycle>((resolve) => {
        const finish = (next: Ga4ProviderLifecycle) => {
          if (lifecycle !== "loading") return resolve(lifecycle);
          clearTimer();
          lifecycle = next;
          if (next === "ready") {
            providerLoaded = true;
            command("consent", "update", {
              ad_personalization: "denied",
              ad_storage: "denied",
              ad_user_data: "denied",
              analytics_storage: "granted",
            });
            command("config", measurementId, {
              allow_ad_personalization_signals: false,
              allow_google_signals: false,
              send_page_view: false,
            });
          }
          resolve(lifecycle);
        };
        script.addEventListener("load", () => finish("ready"), { once: true });
        script.addEventListener("error", () => finish("failed"), { once: true });
        timeout = setTimeout(() => finish("timed-out"), timeoutMilliseconds);
        document.head.append(script);
      });
    },
    track(event) {
      if (!navigator.onLine) return "offline";
      if (lifecycle === "timed-out") return "timeout";
      if (lifecycle !== "ready") return "provider-failure";
      const mapped = mapAnalyticsEventToGa4(event);
      command("event", mapped.eventName, { ...mapped.parameters });
      return "accepted";
    },
    trackPageView(pageView) {
      if (lifecycle !== "ready" || !navigator.onLine) return false;
      command("event", "page_view", {
        page_location: pageView.page_location,
        page_title: pageView.page_title,
      });
      return true;
    },
    updateDenied() {
      if (!providerLoaded) return;
      command("consent", "update", {
        ad_personalization: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        analytics_storage: "denied",
      });
    },
  };
}
