import { AlertTriangle } from "lucide-react";
import type { Plan } from "@/lib/schema";

type Props = {
  mistakes: Plan["common_mistakes"];
};

export function CommonMistakes({ mistakes }: Props) {
  return (
    <section className="bg-white border border-[#E8E4DC] rounded-2xl p-6 sm:p-8">
      <p className="text-xs uppercase tracking-wider text-[#1B4332] font-semibold">
        Don&apos;t trip on these
      </p>

      <h2 className="mt-2 font-serif text-2xl sm:text-3xl text-[#1B4332] font-semibold leading-tight">
        Five mistakes we see every year
      </h2>

      <p className="mt-2 text-sm text-[#6B7280] leading-relaxed">
        Most of these cost a semester. A few cost a whole year of credit.
      </p>

      <ol className="mt-6 space-y-5">
        {mistakes.map((m) => (
          <li key={m.number} className="flex items-start gap-4">
            <span
              aria-hidden
              className="flex-shrink-0 mt-1 w-7 h-7 rounded-full bg-[#B68D40]/15 border border-[#B68D40]/40 text-[#1B4332] flex items-center justify-center font-serif font-semibold text-sm tabular-nums"
            >
              {m.number}
            </span>
            <div className="flex-1">
              <h3 className="font-medium text-[#1B4332] text-base leading-snug flex items-center gap-2">
                <AlertTriangle
                  className="w-4 h-4 text-[#B68D40]"
                  aria-hidden
                />
                {m.title}
              </h3>
              <p className="mt-1 text-sm text-[#4A5568] leading-relaxed">
                {m.detail}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
