"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { track } from "@/lib/analytics";

type Props = {
  /** Share ID for fetching the narrative from /api/narrative. */
  shareId?: string;
  /**
   * Pre-rendered narrative (used in dev preview routes and in tests).
   * When provided, the component skips the fetch and renders the text directly.
   */
  initial?: string;
};

type State =
  | { status: "loading" }
  | { status: "loaded"; text: string }
  | { status: "hidden" };

const TIMEOUT_MS = 5_000;

export function NarrativeBlock({ shareId, initial }: Props) {
  const [state, setState] = useState<State>(
    initial ? { status: "loaded", text: initial } : { status: "loading" },
  );

  useEffect(() => {
    if (initial) return;
    if (!shareId) {
      setState({ status: "hidden" });
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    fetch(`/api/narrative?shareId=${encodeURIComponent(shareId)}`, {
      signal: controller.signal,
    })
      .then(async (res) => {
        clearTimeout(timer);
        const data = (await res.json().catch(() => ({}))) as {
          paragraph?: string | null;
          error?: string;
        };
        if (typeof data.paragraph === "string" && data.paragraph.length > 0) {
          setState({ status: "loaded", text: data.paragraph });
          track("narrative_loaded");
        } else {
          setState({ status: "hidden" });
          track("narrative_failed", {
            reason: data.error ?? "empty",
          });
        }
      })
      .catch((err: Error) => {
        clearTimeout(timer);
        setState({ status: "hidden" });
        track("narrative_failed", {
          reason: err.name === "AbortError" ? "timeout" : err.message.slice(0, 64),
        });
      });

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [shareId, initial]);

  if (state.status === "hidden") return null;

  return (
    <section
      aria-live="polite"
      className="bg-[#1B4332]/5 border border-[#1B4332]/15 rounded-2xl p-6 sm:p-8"
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-[#B68D40]" aria-hidden="true" />
        <p className="text-xs uppercase tracking-wider text-[#1B4332] font-semibold">
          A Quick Note
        </p>
      </div>
      {state.status === "loading" ? (
        <div className="space-y-2.5" aria-label="Loading your personalized note">
          <div className="h-3.5 bg-[#1B4332]/10 rounded animate-pulse" />
          <div className="h-3.5 bg-[#1B4332]/10 rounded animate-pulse w-5/6" />
        </div>
      ) : (
        <p className="text-[#4A5568] leading-relaxed">{state.text}</p>
      )}
    </section>
  );
}
