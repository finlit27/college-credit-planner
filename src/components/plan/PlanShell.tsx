import type { Plan } from "@/lib/schema";

/**
 * Phase E1 skeleton. Renders the plan hero + section placeholders.
 * Phases E2–E6 replace each <section> with real components
 * (CollegeCard, CourseSequence, GradeRoadmap, CalGetcChecklist,
 *  SavingsTable, ActionChecklist, CommonMistakes, NarrativeBlock,
 *  ShareButton, NewsletterOptIn).
 */
export function PlanShell({ plan }: { plan: Plan }) {
  const { student, target, college, online_only } = plan;
  return (
    <article className="container mx-auto px-4 py-10 sm:py-16">
      <header className="max-w-3xl mx-auto text-center">
        <p className="text-xs uppercase tracking-wider text-[#B68D40] font-medium">
          College Credit Plan
        </p>
        <h1 className="mt-3 font-serif text-3xl sm:text-5xl text-[#1B4332] font-semibold leading-tight">
          {student.name}&apos;s plan to graduate with{" "}
          <span className="text-[#B68D40]">college credit already done.</span>
        </h1>
        <p className="mt-4 text-base sm:text-lg text-[#4A5568]">
          Grade {student.grade} · Aiming for {target.label}
          {online_only ? " · Online-only" : ""}
        </p>
      </header>

      <div className="mt-12 max-w-3xl mx-auto space-y-6">
        <SectionPlaceholder
          eyebrow="Your recommended college"
          title={college.name}
          subtitle={
            online_only
              ? `Summer cap: ${college.summer_cap} units · Fully online`
              : `${college.region_label} · Summer cap: ${college.summer_cap} units`
          }
        />
        <SectionPlaceholder
          eyebrow="Your major track"
          title={plan.major_track.label}
          subtitle={`${plan.major_track.sequence.length} priority courses, in order`}
        />
        <SectionPlaceholder
          eyebrow="Grade-by-grade roadmap"
          title={`From ${student.grade}th grade through senior year`}
          subtitle={`Unit target at graduation: ${plan.unit_target_at_graduation}`}
        />
        <SectionPlaceholder
          eyebrow="The Cal-GETC checklist"
          title={`${plan.cal_getc_areas.length} areas to clear`}
          subtitle="The general-ed list that unlocks UC + CSU transfer"
        />
        <SectionPlaceholder
          eyebrow="What you save"
          title={`Up to ${plan.savings_table[plan.savings_table.length - 1]?.csu ?? "$$$"} at a CSU`}
          subtitle="Family savings vs. paying full tuition after high school"
        />
        <SectionPlaceholder
          eyebrow="Don't trip on these"
          title={`${plan.common_mistakes.length} common mistakes`}
          subtitle="The patterns we see new dual-enrollment families fall into"
        />
      </div>

      <footer className="mt-16 max-w-2xl mx-auto text-center text-sm text-[#9CA3AF]">
        Plan generated {plan.generated_at} · College data from California
        Community Colleges public sources
      </footer>
    </article>
  );
}

function SectionPlaceholder({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <section className="bg-white border border-[#E8E4DC] rounded-2xl p-6 sm:p-8">
      <p className="text-xs uppercase tracking-wider text-[#B68D40] font-medium">
        {eyebrow}
      </p>
      <h2 className="mt-2 font-serif text-xl sm:text-2xl text-[#1B4332] font-semibold leading-tight">
        {title}
      </h2>
      <p className="mt-2 text-sm text-[#6B7280]">{subtitle}</p>
    </section>
  );
}
