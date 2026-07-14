"use client";

import { useState } from "react";

import { Button } from "@/components/ui";
import type { UtilityCopyPayload } from "@/lib/utilities/contracts";

interface CopyResultButtonProps {
  payload: UtilityCopyPayload;
}

export function CopyResultButton({ payload }: CopyResultButtonProps) {
  const [status, setStatus] = useState("");

  async function copyResult() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(`${payload.title}\n${payload.text}`);
      setStatus("Result copied.");
    } catch {
      setStatus("Could not copy the result. Select the result text and copy it manually.");
    }
  }

  return (
    <>
      <Button type="button" variant="secondary" onClick={copyResult}>Copy result</Button>
      <span className="copy-status" aria-live="polite" aria-atomic="true">{status}</span>
    </>
  );
}
