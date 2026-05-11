import { AlertTriangle, Sun, BookOpen, Trophy } from "lucide-react";
import type { Plan } from "@/lib/schema";

type Props = {
  roadmap: Plan["grade_roadmap"];
};

const GRADE_LABEL: Record<number, string> = {
  9: "Freshman year",
  10: "Sophomore year",
  11: "Junior year",
  12: "Senior year",
};

export function GradeRoadmap({ roadmap }: Props) {
  return (
    <section className="bg-white border border-[#E8E4DC] rounded-2xl p-6 sm:p-8">
      <p className="text-xs uppercase tracking-wider text-[#1B4332] font-semibold">
        Your grade-by-grade roadmap
      </p>

      <h2 className="mt-2 font-serif text-2xl sm:text-3xl text-[#1B4332] font-semibold leading-tight">
        From now through high school graduation
      </h2>

      <div className="mt-6 space-y-4">
        {roadmap.map((entry) => (
          <article
            key={entry.grade}
            className={[
              "rounded-xl border p-5 sm:p-6 transition-colors",
              entry.is_current
                ? "border-[#1B4332] bg-[#1B4332]/5"
                : "border-[#E8E4DC] bg-[#FDFBF7]/60",
            ].join(" ")}
          >
            <header className="flex items-baseline justify-between gap-3 flex-wrap">
              <div>
                <h3 className="font-serif text-xl text-[#1B4332] font-semibold leading-tight">
                  {entry.grade}
                  <sup className="text-sm font-medium text-[#6B7280] ml-0.5">
                    {ordinalSuffix(entry.grade)}
                  </sup>{" "}
                  <span className="text-base text-[#6B7280] font-sans font-normal">
                    grade · {GRADE_LABEL[entry.grade] ?? ""}
                  </span>
                </h3>
                {entry.is_current ? (
                  <span className="mt-1 inline-block text-xs uppercase tracking-wider text-[#1B4332] font-semibold">
                    You are here
                  </span>
                ) : null}
              </div>
              <span className="text-sm font-medium text-[#1B4332] tabular-nums whitespace-nowrap">
                Target: {entry.unit_target}
              </span>
            </header>

            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <RoadmapItem
                icon={Sun}
                label="Summer"
                body={entry.summer_action}
              />
              <RoadmapItem
                icon={BookOpen}
                label="School year"
                body={entry.school_year_action}
              />
              <RoadmapItem
                icon={Trophy}
                label="Milestone"
                body={entry.milestone}
              />
              <RoadmapItem
                icon={AlertTriangle}
                label="Watch out"
                body={entry.warning}
                tone="warning"
              />
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}

function RoadmapItem({
  icon: Icon,
  label,
  body,
  tone,
}: {
  icon: typeof Sun;
  label: string;
  body: string;
  tone?: "warning";
}) {
  const iconColor = tone === "warning" ? "text-[#B68D40]" : "text-[#1B4332]";
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#6B7280] font-medium">
        <Icon className={`w-3.5 h-3.5 ${iconColor}`} aria-hidden />
        {label}
      </dt>
      <dd className="mt-1 text-sm text-[#4A5568] leading-relaxed">{body}</dd>
    </div>
  );
}

function ordinalSuffix(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
