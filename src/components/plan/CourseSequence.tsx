import { Lock, Info } from "lucide-react";
import type { Plan } from "@/lib/schema";
import { getCourseKind, badgeClasses } from "@/lib/course-kinds";
import {
  getCollegeGates,
  partitionSequence,
  openCoursesForGrade,
  type GatedCourse,
} from "@/lib/course-gates";

type Props = {
  track: Plan["major_track"];
  /** Used to look up that college's published prerequisite rules. */
  collegeName: string;
  grade: number;
};

export function CourseSequence({ track, collegeName, grade }: Props) {
  const gates = getCollegeGates(collegeName);
  const { available, blocked } = partitionSequence(track.sequence, gates, grade);
  const openNow = blocked.length > 0 ? openCoursesForGrade(gates, grade) : [];

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
        {available.map((g) => (
          <CourseRow key={g.course.priority} gated={g} trackKey={track.key} />
        ))}
      </ol>

      {blocked.length > 0 ? (
        <div className="mt-8 rounded-xl border border-[#B68D40]/40 bg-[#B68D40]/5 p-5 sm:p-6">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-[#1B4332]">
            <Lock className="w-4 h-4 text-[#B68D40]" aria-hidden />
            Not yet available to you at {collegeName}
          </h3>
          <p className="mt-1.5 text-sm text-[#4A5568] leading-relaxed">
            {blocked.length === 1 ? "This course is" : "These courses are"} still
            on your plan. You just cannot register for{" "}
            {blocked.length === 1 ? "it" : "them"} in grade {grade}.
          </p>

          <ul className="mt-4 space-y-4">
            {blocked.map(({ course, gate }) => (
              <li key={course.priority}>
                <div className="flex items-baseline justify-between gap-2 flex-wrap">
                  <h4 className="font-medium text-[#1B4332] text-base leading-snug">
                    {course.course}
                    {gate ? (
                      <span className="ml-2 font-normal text-sm text-[#6B7280]">
                        {gate.courseCode}
                      </span>
                    ) : null}
                  </h4>
                  <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider rounded-full px-2.5 py-0.5 border whitespace-nowrap bg-[#B68D40]/15 text-[#1B4332] border-[#B68D40]/40">
                    {gate?.opensAtGrade
                      ? `Opens grade ${gate.opensAtGrade}`
                      : "Not yet"}
                  </span>
                </div>
                {gate ? (
                  <>
                    <p className="mt-1 text-sm text-[#4A5568] leading-relaxed">
                      <span className="font-medium">Requires:</span>{" "}
                      {gate.requirement}
                    </p>
                    <p className="mt-1 text-sm text-[#6B7280] leading-relaxed">
                      {gate.guidance}
                    </p>
                  </>
                ) : null}
              </li>
            ))}
          </ul>

          {openNow.length > 0 ? (
            <div className="mt-5 pt-5 border-t border-[#B68D40]/25">
              <h4 className="text-sm font-semibold text-[#1B4332]">
                Open to you right now instead
              </h4>
              <p className="mt-1 text-sm text-[#6B7280] leading-relaxed">
                {collegeName} lists these for grade {grade} with no
                prerequisite. Each one clears a Cal-GETC area.
              </p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {openNow.map((c) => (
                  <li
                    key={c.code}
                    className="flex items-baseline gap-2 text-sm text-[#4A5568]"
                  >
                    <span className="font-medium text-[#1B4332] whitespace-nowrap">
                      {c.code}
                    </span>
                    <span className="flex-1 leading-snug">{c.title}</span>
                    <span className="text-xs text-[#6B7280] whitespace-nowrap tabular-nums">
                      {c.units}u · Area {c.areas.join("/")}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      {gates ? (
        <p className="mt-6 text-xs text-[#9CA3AF] leading-relaxed">
          Prerequisites and grade bands read from {collegeName}&apos;s published
          dual-enrollment pages on {gates.verifiedOn}. Confirm with a counselor
          before you register. Every college sets its own rules.
        </p>
      ) : null}
    </section>
  );
}

function CourseRow({
  gated,
  trackKey,
}: {
  gated: GatedCourse;
  trackKey: Plan["major_track"]["key"];
}) {
  const { course, gate } = gated;
  const kind = getCourseKind(trackKey, course.priority);
  const advisory = gate && (gate.severity === "check" || gate.severity === "note");

  return (
    <li className="flex items-start gap-4 sm:gap-5">
      <span
        aria-hidden
        className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1B4332]/5 border border-[#1B4332]/15 text-[#1B4332] flex items-center justify-center font-serif font-semibold tabular-nums"
      >
        {course.priority}
      </span>
      <div className="flex-1">
        <div className="flex items-baseline justify-between gap-2 flex-wrap">
          <h3 className="font-medium text-[#1B4332] text-base sm:text-lg leading-snug">
            {course.course}
          </h3>
          <span
            className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider rounded-full px-2.5 py-0.5 border whitespace-nowrap ${badgeClasses(kind)}`}
            aria-label={`Course kind: ${kind}`}
          >
            {kind}
          </span>
        </div>
        <p className="mt-1 text-sm text-[#6B7280] leading-relaxed">
          {course.reason}
        </p>
        {advisory ? (
          <p className="mt-2 flex items-start gap-1.5 text-sm text-[#4A5568] bg-[#1B4332]/[0.04] border border-[#1B4332]/10 rounded-lg px-3 py-2 leading-relaxed">
            <Info
              className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#1B4332]"
              aria-hidden
            />
            <span>
              <span className="font-medium">{gate.courseCode}:</span>{" "}
              {gate.requirement} {gate.guidance}
            </span>
          </p>
        ) : null}
      </div>
    </li>
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
