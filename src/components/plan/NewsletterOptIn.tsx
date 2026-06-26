"use client";

import { useState } from "react";

// Soft, post-payoff opt-in. The plan is already on screen and free; this just
// offers to email it and send occasional college-cost guidance. No wall.

type Status = "idle" | "submitting" | "done" | "error";

export function NewsletterOptIn({ studentName }: { studentName: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 sm:p-8 text-center">
        <p className="font-serif text-xl text-[#1B4332] font-semibold">Check your inbox.</p>
        <p className="mt-2 text-sm text-[#6B7280]">
          {studentName}&apos;s plan is on its way, plus a few college-cost moves worth knowing.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 sm:p-8">
      <p className="text-xs uppercase tracking-wider text-[#1B4332] font-semibold">Keep This Plan</p>
      <h2 className="mt-2 font-serif text-2xl text-[#1B4332] font-semibold">Want this plan emailed to you?</h2>
      <p className="mt-2 text-sm text-[#6B7280] leading-relaxed">
        We&apos;ll send {studentName}&apos;s plan and occasional, practical guidance on cutting
        college costs in California. Unsubscribe anytime.
      </p>
      <form onSubmit={onSubmit} className="mt-4 flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className="flex-1 rounded-lg border border-[#E8E4DC] px-4 py-2 text-[#1B4332]"
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="rounded-lg bg-[#1B4332] text-white font-semibold px-5 py-2 disabled:opacity-60"
        >
          {status === "submitting" ? "Sending..." : "Email me my plan"}
        </button>
      </form>
      {status === "error" ? (
        <p className="mt-2 text-sm text-[#B91C1C]">Something went wrong. Please try again.</p>
      ) : null}
    </div>
  );
}
