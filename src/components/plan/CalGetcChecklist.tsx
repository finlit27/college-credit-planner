import { Check } from "lucide-react";
import type { Plan } from "@/lib/schema";

type Props = {
  areas: Plan["cal_getc_areas"];
  targetKey: Plan["target"]["key"];
};

export function CalGetcChecklist({ areas, targetKey }: Props) {
  // CSU & transfer paths benefit most from full Cal-GETC; UC requires it.
  const importance =
    targetKey === "uc"
      ? "All seven areas are required for UC transfer."
      : targetKey === "csu" || targetKey === "transfer"
        ? "Complete all seven if you're chasing an ADT — it doubles as Cal-GETC."
        : "Each area you clear in high school is one less course you pay for later.";

  return (
    <section className="bg-white border border-[#E8E4DC] rounded-2xl p-6 sm:p-8">
      <p className="text-xs uppercase tracking-wider text-[#1B4332] font-semibold">
        The Cal-GETC checklist
      </p>

      <h2 className="mt-2 font-serif text-2xl sm:text-3xl text-[#1B4332] font-semibold leading-tight">
        Seven areas that unlock UC + CSU transfer
      </h2>

      <p className="mt-2 text-sm text-[#6B7280] leading-relaxed">
        {importance}
      </p>

      <ul className="mt-6 space-y-3">
        {areas.map((a) => (
          <li
            key={a.code}
            className="flex items-start gap-3 p-3 rounded-lg border border-[#E8E4DC] bg-[#FDFBF7]/60"
          >
            <span
              aria-hidden
              className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-md border-2 border-[#E8E4DC] bg-white flex items-center justify-center"
            >
              <Check className="w-3 h-3 text-[#6B7280]" aria-hidden="true" />
            </span>
            <div className="flex-1">
              <p className="text-sm">
                <span className="font-medium text-[#1B4332]">{a.code}</span>{" "}
                <span className="text-[#4A5568]">— {a.title}</span>
              </p>
              <p className="mt-0.5 text-xs text-[#6B7280]">
                e.g. {a.example}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
