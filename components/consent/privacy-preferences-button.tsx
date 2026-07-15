"use client";

import { useRef } from "react";

import { useConsentPreferences } from "./consent-provider";

export function PrivacyPreferencesButton() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { openPreferences } = useConsentPreferences();
  return (
    <button
      className="site-footer__preference"
      type="button"
      ref={buttonRef}
      onClick={() => {
        if (buttonRef.current) openPreferences(buttonRef.current);
      }}
    >
      Privacy preferences
    </button>
  );
}
