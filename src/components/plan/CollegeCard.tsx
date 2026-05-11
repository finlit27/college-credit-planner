import { ExternalLink, MapPin, Sun } from "lucide-react";
import type { Plan } from "@/lib/schema";

type Props = {
  college: Plan["college"];
  onlineOnly: boolean;
};

export function CollegeCard({ college, onlineOnly }: Props) {
  return (
    <section className="bg-white border border-[#E8E4DC] rounded-2xl p-6 sm:p-8">
      <p className="text-xs uppercase tracking-wider text-[#1B4332] font-semibold">
        Your recommended college
      </p>

      <h2 className="mt-2 font-serif text-2xl sm:text-3xl text-[#1B4332] font-semibold leading-tight">
        {college.name}
      </h2>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#6B7280]">
        {college.region_label ? (
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#B68D40]" aria-hidden />
            {college.region_label}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#B68D40]" aria-hidden />
            Fully online
          </span>
        )}
        <span className="inline-flex items-center gap-1.5 tabular-nums">
          <Sun className="w-4 h-4 text-[#B68D40]" aria-hidden />
          Summer cap: {college.summer_cap} units
        </span>
      </div>

      {college.why ? (
        <blockquote className="mt-5 border-l-2 border-[#B68D40] pl-4 text-[#4A5568] italic leading-relaxed">
          {college.why}
        </blockquote>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <a
          href={college.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#1B4332] hover:bg-[#143526] text-white rounded-full px-5 py-2.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          Visit dual-enrollment page
          <ExternalLink className="w-4 h-4" aria-hidden />
        </a>
        {!onlineOnly && college.backup ? (
          <p className="text-sm text-[#6B7280]">
            Backup option:{" "}
            <span className="font-medium text-[#4A5568]">{college.backup}</span>
          </p>
        ) : null}
      </div>
    </section>
  );
}
