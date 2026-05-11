// Phase D placeholder. Phase E replaces this with the real plan render
// (PlanShell + CollegeCard + CourseSequence + GradeRoadmap + …).

type Props = {
  params: Promise<{ shareId: string }>;
};

export default async function PlanPlaceholder({ params }: Props) {
  const { shareId } = await params;
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-[#E8E4DC] p-8 sm:p-12 shadow-sm">
        <p className="text-xs uppercase tracking-wider text-[#B68D40] font-medium">
          Phase D placeholder
        </p>
        <h1 className="mt-3 font-serif text-3xl sm:text-4xl text-[#1B4332] font-semibold">
          Your plan is being assembled.
        </h1>
        <p className="mt-4 text-[#4A5568] leading-relaxed">
          You landed at <code className="font-mono text-sm text-[#1B4332]">/plan/{shareId}</code>.
          Phase E will replace this stub with the rendered plan — recommended
          college, course sequence, grade roadmap, Cal-GETC checklist, savings
          table, and shareable link.
        </p>
      </div>
    </section>
  );
}
