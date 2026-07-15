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

import type { AnalyticsConsentState } from "@/lib/analytics/contracts";
import type { Ga4Adapter } from "@/lib/analytics/ga4-adapter";
import type { ClientGrowthConfiguration } from "@/lib/analytics/ga4-configuration";
import { createSanitizedPageView, PageViewDeduplicator } from "@/lib/analytics/page-view";
import { parseConsentCookie, serializeConsentCookie } from "@/lib/consent/cookie";
import { withdrawAnalyticsConsent } from "@/lib/consent/runtime";

interface ConsentContextValue {
  analyticsAvailable: boolean;
  openPreferences(trigger: HTMLButtonElement): void;
  state: AnalyticsConsentState;
}

const ConsentContext = createContext<ConsentContextValue | null>(null);

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
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const adapterRef = useRef<Ga4Adapter | null>(null);
  const pageViews = useRef(new PageViewDeduplicator());

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
    if (!pageView || !pageViews.current.accept(pageView)) return;
    adapterRef.current?.trackPageView(pageView);
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
      if (active && lifecycle === "ready") emitCurrentPage();
    });
    return () => {
      active = false;
    };
  }, [configuration, emitCurrentPage, state]);

  useEffect(() => {
    if (state === "analytics-granted") emitCurrentPage();
  }, [emitCurrentPage, state]);

  const save = useCallback((next: "denied" | "analytics-granted") => {
    if (!configuration.analyticsAvailable) return;
    if (next === "denied") {
      const adapter = adapterRef.current;
      withdrawAnalyticsConsent({
        clearAnalyticsDeduplication: () => undefined,
        clearPageViewState: () => pageViews.current.clear(),
        clearProviderLifecycle: () => {
          adapter?.clear();
          adapterRef.current = null;
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
    openPreferences,
    state,
  }), [configuration.analyticsAvailable, openPreferences, state]);

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
