"use client";

import { useEffect, useState } from "react";
import { Copy, Check } from "lucide-react";
import { track } from "@/lib/analytics";

/**
 * Copies the current page URL to clipboard. Pure client behavior — no API call.
 * Falls back gracefully on browsers without `navigator.clipboard`.
 */
export function ShareButton() {
  const [copied, setCopied] = useState(false);
  const [href, setHref] = useState("");

  useEffect(() => {
    setHref(window.location.href);
  }, []);

  async function handleCopy() {
    if (!href) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(href);
      } else {
        // Older mobile Safari fallback
        const el = document.createElement("textarea");
        el.value = href;
        el.style.position = "fixed";
        el.style.opacity = "0";
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
      setCopied(true);
      track("plan_shared");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Last resort: do nothing — we don't want to crash the page on a copy failure.
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? "Share link copied to clipboard" : "Copy share link"}
        className="inline-flex items-center gap-2 bg-[#1B4332] hover:bg-[#143526] text-white rounded-full px-6 py-3 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FDFBF7] min-h-[44px]"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4" aria-hidden="true" />
            Link copied
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" aria-hidden="true" />
            Copy share link
          </>
        )}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? "Share link copied to clipboard." : ""}
      </span>
      {href ? (
        <p className="text-xs text-[#6B7280] break-all max-w-md text-center">
          {href}
        </p>
      ) : null}
    </div>
  );
}
