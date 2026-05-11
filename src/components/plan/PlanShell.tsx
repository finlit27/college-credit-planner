import type { Plan } from "@/lib/schema";
import { CollegeCard } from "./CollegeCard";
import { CourseSequence } from "./CourseSequence";
import { GradeRoadmap } from "./GradeRoadmap";
import { CalGetcChecklist } from "./CalGetcChecklist";
import { SavingsTable } from "./SavingsTable";
import { ActionChecklist } from "./ActionChecklist";
import { CommonMistakes } from "./CommonMistakes";
import { ShareButton } from "./ShareButton";

/**
 * Top-level plan layout. Each child is a pure, single-purpose render
 * component that takes flat props from the Plan object.
 *
 * Order mirrors the CLI's markdown narrative so the web plan reads in
 * the same shape as the source-of-truth plan that has been validated
 * with families.
 *
 * NarrativeBlock (E4) + NewsletterOptIn (E6) will slot in once
 * /api/narrative and /api/newsletter exist (Phase C2 / C3).
 */
export function PlanShell({ plan }: { plan: Plan }) {
  const { student, target, online_only, college } = plan;

  return (
    <article className="container mx-auto px-4 py-10 sm:py-16">
      <header className="max-w-3xl mx-auto text-center">
        <p className="text-xs uppercase tracking-wider text-[#1B4332] font-semibold">
          College Credit Plan
        </p>
        <h1 className="mt-3 font-serif text-3xl sm:text-5xl text-[#1B4332] font-semibold leading-tight tracking-tight">
          {student.name}&apos;s plan to graduate with{" "}
          <span className="text-[#B68D40]">college credit already done.</span>
        </h1>
        <p className="mt-4 text-base sm:text-lg text-[#4A5568]">
          Grade {student.grade} · Aiming for {target.label}
          {online_only ? " · Fully online" : ""}
        </p>
        {student.gpa_status === "alert" ? (
          <p className="mt-3 inline-block text-sm text-[#1B4332] bg-[#B68D40]/15 border border-[#B68D40]/40 rounded-full px-3 py-1">
            Quick note: a few California colleges require a 2.0+ for dual
            enrollment. Most accept any GPA — verify directly with{" "}
            {college.name} before applying.
          </p>
        ) : null}
      </header>

      <div className="mt-12 max-w-3xl mx-auto space-y-6">
        <CollegeCard college={college} onlineOnly={online_only} />
        <CourseSequence track={plan.major_track} />
        <GradeRoadmap roadmap={plan.grade_roadmap} />
        <CalGetcChecklist
          areas={plan.cal_getc_areas}
          targetKey={target.key}
        />
        <SavingsTable rows={plan.savings_table} targetKey={target.key} />
        <ActionChecklist plan={plan} />
        <CommonMistakes mistakes={plan.common_mistakes} />
      </div>

      <div className="mt-12 max-w-2xl mx-auto bg-white rounded-2xl border border-[#E8E4DC] p-6 sm:p-10 text-center">
        <p className="text-xs uppercase tracking-wider text-[#1B4332] font-semibold">
          Share your plan
        </p>
        <h2 className="mt-2 font-serif text-2xl sm:text-3xl text-[#1B4332] font-semibold">
          Send this to your counselor — and your parents.
        </h2>
        <p className="mt-2 text-sm text-[#6B7280] max-w-md mx-auto leading-relaxed">
          This link works for 30 days. Anyone you send it to can see this exact
          plan — no signup, no tracking, no marketing emails.
        </p>
        <div className="mt-6">
          <ShareButton />
        </div>
      </div>

      <footer className="mt-12 max-w-2xl mx-auto text-center text-xs text-[#9CA3AF]">
        Plan generated {plan.generated_at} · California Community Colleges data
        verified against public dual-enrollment program pages
      </footer>
    </article>
  );
}
