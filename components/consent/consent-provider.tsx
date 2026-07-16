"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

import type { AnalyticsConsentState } from "@/lib/analytics/contracts";
import {
  analyticsSchemaVersion,
  type CanonicalAnalyticsContext,
  type UtilityAnalyticsEligibility,
  type UtilityAnalyticsEventInput,
} from "@/lib/analytics/contracts";
import type { Ga4Adapter } from "@/lib/analytics/ga4-adapter";
import type { ClientGrowthConfiguration } from "@/lib/analytics/ga4-configuration";
import {
  createSanitizedPageView,
  PageViewDeduplicator,
  sendDeduplicatedPageView,
} from "@/lib/analytics/page-view";
import { parseConsentCookie, serializeConsentCookie } from "@/lib/consent/cookie";
import {
  deleteGoogleAnalyticsCookies,
  withdrawAnalyticsConsent,
} from "@/lib/consent/runtime";
import {
  createAnalyticsDispatcher,
  EphemeralAnalyticsDeduplicator,
  type AnalyticsDeduplicationToken,
  type AnalyticsDispatchResult,
} from "@/lib/analytics/runtime";

export interface UtilityAnalyticsTrackingRequest {
  canonicalContext: CanonicalAnalyticsContext;
  deduplicationToken: AnalyticsDeduplicationToken;
  eligibility: UtilityAnalyticsEligibility;
  event: UtilityAnalyticsEventInput;
  lifecycleEligible: boolean;
}

interface ConsentContextValue {
  analyticsAvailable: boolean;
  analyticsReady: boolean;
  openPreferences(trigger: HTMLButtonElement): void;
  state: AnalyticsConsentState;
  trackUtilityEvent(request: UtilityAnalyticsTrackingRequest): AnalyticsDispatchResult;
}

const ConsentContext = createContext<ConsentContextValue | null>(null);

function describeConsentState(state: AnalyticsConsentState) {
  if (state === "analytics-granted") return "Optional analytics is accepted.";
  if (state === "denied") return "Optional analytics is rejected.";
  if (state === "marketing-granted") {
    return "Marketing consent is unavailable; optional analytics is off.";
  }
  return "No analytics choice has been saved.";
}

export function useConsentPreferences() {
  const value = useContext(ConsentContext);
  if (!value) throw new Error("Consent preferences must be used inside ConsentProvider.");
  return value;
}

export function ConsentProvider({
  children,
  configuration,
}: {
  children: ReactNode;
  configuration: ClientGrowthConfiguration;
}) {
  const [state, setState] = useState<AnalyticsConsentState>("unknown");
  const [hydrated, setHydrated] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [analyticsReady, setAnalyticsReady] = useState(false);
  const pathname = usePathname();
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const adapterRef = useRef<Ga4Adapter | null>(null);
  const pageViews = useRef(new PageViewDeduplicator());
  const utilityEvents = useRef(new EphemeralAnalyticsDeduplicator());

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setState(parseConsentCookie(document.cookie).state);
      setHydrated(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const emitCurrentPage = useCallback(() => {
    const pageView = createSanitizedPageView(window.location.href);
    const adapter = adapterRef.current;
    if (!pageView || !adapter) return;
    sendDeduplicatedPageView(
      pageViews.current,
      pageView,
      (value) => adapter.trackPageView(value),
    );
  }, []);

  useEffect(() => {
    if (
      !configuration.analyticsAvailable ||
      state !== "analytics-granted" ||
      adapterRef.current
    ) return;
    let active = true;
    void import("@/lib/analytics/ga4-adapter").then(async ({ createGa4Adapter }) => {
      if (!active || !configuration.analyticsAvailable) return;
      const adapter = createGa4Adapter({ measurementId: configuration.measurementId });
      adapterRef.current = adapter;
      const lifecycle = await adapter.load();
      if (active && lifecycle === "ready") {
        setAnalyticsReady(true);
        emitCurrentPage();
      }
    });
    return () => {
      active = false;
    };
  }, [configuration, emitCurrentPage, state]);

  useEffect(() => {
    if (state === "analytics-granted") emitCurrentPage();
  }, [emitCurrentPage, pathname, state]);

  const save = useCallback((next: "denied" | "analytics-granted") => {
    if (!configuration.analyticsAvailable) return;
    if (next === "denied") {
      const adapter = adapterRef.current;
      withdrawAnalyticsConsent({
        clearAnalyticsDeduplication: () => utilityEvents.current.clear(),
        clearPageViewState: () => pageViews.current.clear(),
        clearProviderLifecycle: () => {
          setAnalyticsReady(false);
          adapter?.clear();
          adapterRef.current = null;
        },
        deleteProviderCookies: () => {
          deleteGoogleAnalyticsCookies({
            cookieHeader: document.cookie,
            secure: configuration.secureCookie,
            writeCookie: (value) => {
              document.cookie = value;
            },
          });
        },
        disableAdapter: () => adapter?.disable(),
        providerLoaded: adapter?.lifecycle === "ready",
        updateProviderDenied: () => adapter?.updateDenied(),
        writeDeniedCookie: () => {
          document.cookie = serializeConsentCookie("denied", { secure: configuration.secureCookie });
        },
      });
    } else {
      document.cookie = serializeConsentCookie(next, { secure: configuration.secureCookie });
    }
    setState(next);
    setAnnouncement(next === "analytics-granted" ? "Analytics preference saved." : "Optional analytics rejected.");
  }, [configuration]);

  const trackUtilityEvent = useCallback((request: UtilityAnalyticsTrackingRequest) => {
    const adapter = adapterRef.current;
    if (!analyticsReady || !adapter) {
      return {
        reason: configuration.environment === "production" ? "provider-missing" : "environment-blocked",
        status: "dropped",
      } as const;
    }
    const { eventName, ...properties } = request.event;
    return createAnalyticsDispatcher({
      consentState: state,
      deduplicator: utilityEvents.current,
      environment: configuration.environment,
      provider: adapter,
    }).track({
      canonicalContext: request.canonicalContext,
      deduplicationToken: request.deduplicationToken,
      eligibility: request.eligibility,
      lifecycleEligible: request.lifecycleEligible,
      payload: {
        analyticsSchemaVersion,
        consentState: state,
        environment: configuration.environment,
        eventName,
        locale: document.documentElement.lang || "en",
        pageType: "utility",
        ...properties,
      },
    });
  }, [analyticsReady, configuration.environment, state]);

  const closePreferences = useCallback(() => {
    setPreferencesOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  const openPreferences = useCallback((trigger: HTMLButtonElement) => {
    triggerRef.current = trigger;
    setPreferencesOpen(true);
  }, []);

  useEffect(() => {
    if (!preferencesOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePreferences();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [closePreferences, preferencesOpen]);

  const contextValue = useMemo(() => ({
    analyticsAvailable: configuration.analyticsAvailable,
    analyticsReady,
    openPreferences,
    state,
    trackUtilityEvent,
  }), [analyticsReady, configuration.analyticsAvailable, openPreferences, state, trackUtilityEvent]);

  const showNotice =
    hydrated && configuration.analyticsAvailable && state === "unknown";

  return (
    <ConsentContext.Provider value={contextValue}>
      {children}
      {showNotice ? (
        <aside className="consent-notice" aria-labelledby="consent-notice-title">
          <div>
            <h2 id="consent-notice-title">Optional analytics</h2>
            <p>
              Help Youtoola understand how its tools are used. Optional analytics stays
              off unless you accept. <a href="/privacy">Read Privacy</a>.
            </p>
          </div>
          <ConsentChoices onAccept={() => save("analytics-granted")} onReject={() => save("denied")} />
        </aside>
      ) : null}
      {preferencesOpen ? (
        <section
          className="consent-preferences"
          aria-labelledby="privacy-preferences-title"
        >
          <div>
            <h2 id="privacy-preferences-title">Privacy preferences</h2>
            <p>
              {configuration.analyticsAvailable
                ? "Optional analytics is available and only runs after you accept."
                : "Optional analytics is currently off. No analytics provider is active."}
            </p>
            {configuration.analyticsAvailable ? (
              <p><strong>Current choice:</strong> {describeConsentState(state)}</p>
            ) : null}
            {!configuration.analyticsAvailable ? (
              <p>No preference cookie is needed while analytics is unavailable.</p>
            ) : null}
          </div>
          {configuration.analyticsAvailable ? (
            <ConsentChoices onAccept={() => save("analytics-granted")} onReject={() => save("denied")} />
          ) : null}
          <button className="button button--quiet" type="button" onClick={closePreferences}>
            Close preferences
          </button>
        </section>
      ) : null}
      <p className="visually-hidden" aria-live="polite" aria-atomic="true">{announcement}</p>
    </ConsentContext.Provider>
  );
}

export function ConsentChoices({ onAccept, onReject }: { onAccept(): void; onReject(): void }) {
  return (
    <div className="consent-actions">
      <button className="button button--secondary" type="button" onClick={onAccept}>
        Accept analytics
      </button>
      <button className="button button--secondary" type="button" onClick={onReject}>
        Reject
      </button>
    </div>
  );
}
