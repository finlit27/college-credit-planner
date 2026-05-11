import type { Plan } from "@/lib/schema";

type Props = {
  track: Plan["major_track"];
};

export function CourseSequence({ track }: Props) {
  return (
    <section className="bg-white border border-[#E8E4DC] rounded-2xl p-6 sm:p-8">
      <p className="text-xs uppercase tracking-wider text-[#B68D40] font-medium">
        Your course sequence
      </p>

      <h2 className="mt-2 font-serif text-2xl sm:text-3xl text-[#1B4332] font-semibold leading-tight">
        {track.label}
      </h2>

      <p className="mt-2 text-sm text-[#6B7280]">
        Take them in this order. Each course is on the standard transfer list
        (UC + CSU) and shows up on ASSIST.org.
      </p>

      <ol className="mt-6 space-y-4">
        {track.sequence.map((c) => (
          <li
            key={c.priority}
            className="flex items-start gap-4 sm:gap-5"
          >
            <span
              aria-hidden
              className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1B4332]/5 border border-[#1B4332]/15 text-[#1B4332] flex items-center justify-center font-serif font-semibold tabular-nums"
            >
              {c.priority}
            </span>
            <div className="flex-1">
              <h3 className="font-medium text-[#1B4332] text-base sm:text-lg leading-snug">
                {c.course}
              </h3>
              <p className="mt-1 text-sm text-[#6B7280] leading-relaxed">
                {c.reason}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
