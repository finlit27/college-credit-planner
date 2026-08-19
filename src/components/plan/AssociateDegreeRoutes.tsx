import { GraduationCap, CheckCircle2 } from "lucide-react";
import {
  getAdtRoutes,
  routesByAccessibility,
  openUnits,
  ADT_REQUIREMENTS,
  type AdtAccess,
  type AdtRoute,
  type AdtGroup,
} from "@/lib/adt-routes";

type Props = {
  collegeName: string;
  targetKey: string;
};

const ACCESS_LABEL: Record<AdtAccess, string> = {
  open: "Open now",
  "math-gated": "Needs HS math",
  sequenced: "Needs a course first",
  "english-gated": "Grade 12",
};

function accessClasses(access: AdtAccess): string {
  switch (access) {
    case "open":
      return "bg-[#1B4332]/10 text-[#1B4332] border-[#1B4332]/25";
    case "english-gated":
      return "bg-[#B68D40]/20 text-[#1B4332] border-[#B68D40]/50";
    default:
      return "bg-[#B68D40]/10 text-[#1B4332] border-[#B68D40]/35";
  }
}

/**
 * Renders the researched Associate Degree for Transfer routes for a college.
 * Renders nothing at all for colleges whose catalogs have not been read.
 */
export function AssociateDegreeRoutes({ collegeName, targetKey }: Props) {
  const data = getAdtRoutes(collegeName);
  if (!data) return null;

  const ranked = routesByAccessibility(data.routes);
  const csuBound = targetKey === "csu" || targetKey === "transfer";

  return (
    <section className="bg-white border border-[#E8E4DC] rounded-2xl p-6 sm:p-8">
      <p className="text-xs uppercase tracking-wider text-[#1B4332] font-semibold">
        Beyond credits
      </p>

      <h2 className="mt-2 font-serif text-2xl sm:text-3xl text-[#1B4332] font-semibold leading-tight">
        Three degrees you could walk out of high school holding.
      </h2>

      <p className="mt-2 text-sm text-[#6B7280] leading-relaxed">
        Banking units is good. Banking a finished{" "}
        <strong className="font-medium text-[#1B4332]">
          Associate Degree for Transfer
        </strong>{" "}
        is better.{" "}
        {csuBound
          ? "60 transferable units plus an ADT guarantees you CSU admission as a junior, with priority consideration."
          : "It guarantees CSU admission as a junior with priority consideration, and the coursework still counts if you choose UC instead."}{" "}
        These three at {collegeName} are the ones a high schooler can realistically
        make progress on, because most of their courses have no prerequisite.
      </p>

      <div className="mt-5 rounded-xl bg-[#1B4332]/[0.04] border border-[#1B4332]/10 p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-[#1B4332]">
          Every ADT requires all four of these
        </h3>
        <ul className="mt-2 space-y-1.5">
          {ADT_REQUIREMENTS.map((req) => (
            <li
              key={req}
              className="flex items-start gap-2 text-sm text-[#4A5568] leading-relaxed"
            >
              <CheckCircle2
                className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#1B4332]"
                aria-hidden
              />
              <span>{req}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-[#6B7280] leading-relaxed">
          The major units below are the part you can start now. The Cal-GETC
          part is the course sequence further up this plan, and many of these
          courses count for both.
        </p>
      </div>

      <div className="mt-6 space-y-5">
        {ranked.map((route, i) => (
          <RouteCard key={route.id} route={route} rank={i + 1} />
        ))}
      </div>

      <p className="mt-6 text-xs text-[#9CA3AF] leading-relaxed">
        Requirements read from the {collegeName} catalog on {data.verifiedOn}.
        Degree requirements change between catalog years, and the catalog year
        you enter under is the one that binds. Confirm with a counselor before
        committing to a route.
      </p>
    </section>
  );
}

function RouteCard({ route, rank }: { route: AdtRoute; rank: number }) {
  return (
    <article className="rounded-xl border border-[#E8E4DC] p-5 sm:p-6">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <h3 className="flex items-center gap-2 font-serif text-xl text-[#1B4332] font-semibold">
          <GraduationCap className="w-5 h-5 text-[#B68D40]" aria-hidden />
          {route.name}
        </h3>
        <span className="text-xs text-[#6B7280] tabular-nums whitespace-nowrap">
          {route.totalMajorUnits} in the major
        </span>
      </div>

      <p className="mt-2 text-sm text-[#4A5568] leading-relaxed">
        {route.summary}
      </p>

      <dl className="mt-3 space-y-2 text-sm leading-relaxed">
        <div>
          <dt className="inline font-medium text-[#1B4332]">
            {rank === 1 ? "Why this one first: " : "Fit for a high schooler: "}
          </dt>
          <dd className="inline text-[#4A5568]">{route.dualEnrollmentFit}</dd>
        </div>
        <div>
          <dt className="inline font-medium text-[#1B4332]">Watch out: </dt>
          <dd className="inline text-[#4A5568]">{route.watchOut}</dd>
        </div>
      </dl>

      <p className="mt-3 text-xs text-[#6B7280]">
        <span className="tabular-nums font-medium text-[#1B4332]">
          {openUnits(route)} units
        </span>{" "}
        of this major are registerable today with no prerequisite. The required
        core spans{" "}
        <span className="tabular-nums font-medium text-[#1B4332]">
          {route.minCoreTerms}
        </span>{" "}
        {route.minCoreTerms === 1 ? "term" : "terms"} at minimum.
      </p>

      <div className="mt-4 space-y-4">
        {route.groups.map((group) => (
          <GroupBlock key={group.label} group={group} />
        ))}
      </div>
    </article>
  );
}

function GroupBlock({ group }: { group: AdtGroup }) {
  const isCore = group.takeAll;
  return (
    <div>
      <h4 className="flex items-baseline gap-2 text-sm font-semibold text-[#1B4332]">
        {group.label}
        <span className="font-normal text-xs text-[#6B7280] tabular-nums">
          {group.units} · {isCore ? "take all" : "choose from"}
        </span>
      </h4>
      {group.note ? (
        <p className="mt-1 text-xs text-[#6B7280] leading-relaxed">
          {group.note}
        </p>
      ) : null}
      <ul className="mt-2 space-y-1.5">
        {group.courses.map((c) => (
          <li key={c.code} className="text-sm leading-snug">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="font-medium text-[#1B4332] whitespace-nowrap">
                {c.code}
              </span>
              <span className="flex-1 text-[#4A5568] min-w-[8rem]">
                {c.title}
              </span>
              <span className="text-xs text-[#6B7280] tabular-nums whitespace-nowrap">
                {c.units}u
              </span>
              <span
                className={`text-[10px] font-semibold uppercase tracking-wider rounded-full px-2 py-0.5 border whitespace-nowrap ${accessClasses(c.access)}`}
              >
                {ACCESS_LABEL[c.access]}
              </span>
            </div>
            {c.calGetcArea || c.orAlso || c.prereq ? (
              <p className="mt-0.5 text-xs text-[#6B7280] leading-relaxed">
                {c.calGetcArea ? (
                  <span className="text-[#1B4332]">
                    Also counts for Cal-GETC {c.calGetcArea}.
                  </span>
                ) : null}
                {c.orAlso ? ` Or ${c.orAlso.join(", ")}.` : ""}
                {c.prereq ? ` Prerequisite: ${c.prereq}` : ""}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
