import { Trophy } from "lucide-react";
import type { Plan } from "@/lib/schema";

type Props = {
  target: Plan["target"];
  unitTarget: string;
};

/**
 * Translates the deterministic credit total into "what you actually skip at
 * the four-year." The plan answers "what to take." This component answers
 * "what does that get me." Without it the savings story is implicit.
 *
 * Per-target punchlines lean on Christopher's voice rules: no em dashes,
 * period-split clauses, CFO-confident.
 */
export function WhatYouSkip({ target, unitTarget }: Props) {
  const punchline = PUNCHLINES[target.key];

  return (
    <section className="bg-[#1B4332] text-white rounded-2xl p-6 sm:p-8">
      <div className="flex items-center gap-2 mb-3">
        <Trophy className="w-4 h-4 text-[#B68D40]" aria-hidden="true" />
        <p className="text-xs uppercase tracking-wider text-[#B68D40] font-semibold">
          What This Gets You at {shortTargetLabel(target.label)}
        </p>
      </div>

      <h2 className="font-serif text-2xl sm:text-3xl text-white font-semibold leading-tight">
        {punchline}
      </h2>

      <p className="mt-4 text-[#E8E4DC] leading-relaxed text-sm sm:text-base">
        {target.note}
      </p>

      <div className="mt-5 inline-flex items-baseline gap-2 bg-[#B68D40]/15 border border-[#B68D40]/40 rounded-full px-4 py-2">
        <span className="text-[#B68D40] font-serif text-xl sm:text-2xl font-bold tabular-nums">
          {unitTarget}
        </span>
        <span className="text-xs uppercase tracking-wider text-[#FDFBF7]">
          of transferable credit before you graduate high school
        </span>
      </div>
    </section>
  );
}

const PUNCHLINES: Record<Plan["target"]["key"], string> = {
  uc: "You walk into UC with the intro grind already behind you.",
  csu: "Junior standing on day one. Two-year graduation is the play.",
  private:
    "More flexibility at every private school. Verify the credit policy at each one.",
  undecided: "Doors stay open. UC, CSU, and private all accept this work.",
  transfer: "A head start on your ADT before high school ends.",
};

function shortTargetLabel(full: string): string {
  // "UC (University of California)" → "UC", "Private university (USC, ...)" → "Private",
  // "Undecided between UC and CSU" → "UC or CSU", etc.
  if (full.startsWith("UC ")) return "UC";
  if (full.startsWith("CSU ")) return "CSU";
  if (full.startsWith("Private")) return "Private";
  if (full.startsWith("Undecided")) return "UC or CSU";
  if (full.startsWith("Planning to transfer")) return "Transfer";
  return full;
}
