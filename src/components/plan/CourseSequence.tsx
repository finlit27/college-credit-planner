import type { Plan } from "@/lib/schema";
import { getCourseKind, badgeClasses } from "@/lib/course-kinds";

type Props = {
  track: Plan["major_track"];
};

export function CourseSequence({ track }: Props) {
  return (
    <section className="bg-white border border-[#E8E4DC] rounded-2xl p-6 sm:p-8">
      <p className="text-xs uppercase tracking-wider text-[#1B4332] font-semibold">
        Your course sequence
      </p>

      <h2 className="mt-2 font-serif text-2xl sm:text-3xl text-[#1B4332] font-semibold leading-tight">
        {track.label}
      </h2>

      <p className="mt-2 text-sm text-[#6B7280] leading-relaxed">
        Take them in this order. Each course is on the standard UC and CSU
        transfer list. The badges show which ones double as major prereqs.
        Those count twice: they clear a Cal-GETC requirement AND a
        prerequisite you would otherwise take freshman year of college.
      </p>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <Legend label="GE + Major Prep" />
        <Legend label="Major Prep" />
        <Legend label="GE" />
      </div>

      <ol className="mt-6 space-y-4">
        {track.sequence.map((c) => {
          const kind = getCourseKind(track.key, c.priority);
          return (
            <li key={c.priority} className="flex items-start gap-4 sm:gap-5">
              <span
                aria-hidden
                className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1B4332]/5 border border-[#1B4332]/15 text-[#1B4332] flex items-center justify-center font-serif font-semibold tabular-nums"
              >
                {c.priority}
              </span>
              <div className="flex-1">
                <div className="flex items-baseline justify-between gap-2 flex-wrap">
                  <h3 className="font-medium text-[#1B4332] text-base sm:text-lg leading-snug">
                    {c.course}
                  </h3>
                  <span
                    className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider rounded-full px-2.5 py-0.5 border whitespace-nowrap ${badgeClasses(kind)}`}
                    aria-label={`Course kind: ${kind}`}
                  >
                    {kind}
                  </span>
                </div>
                <p className="mt-1 text-sm text-[#6B7280] leading-relaxed">
                  {c.reason}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function Legend({ label }: { label: "GE" | "Major Prep" | "GE + Major Prep" }) {
  return (
    <span
      className={`inline-block font-semibold uppercase tracking-wider rounded-full px-2.5 py-0.5 border text-[10px] ${badgeClasses(label)}`}
    >
      {label}
    </span>
  );
}
