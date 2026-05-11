import { ExternalLink } from "lucide-react";
import type { Plan } from "@/lib/schema";

type Props = {
  plan: Plan;
};

/**
 * Ported verbatim from CLI's generate_student_plan.py (lines 421–443).
 * "Action Checklist" is the procedural to-do list; it's not in PlanSchema
 * because it's derived from college_url + target_key, not from a data table.
 */
export function ActionChecklist({ plan }: Props) {
  const collegeUrl = plan.college.url;
  const targetKey = plan.target.key;
  const showAdt = targetKey === "csu" || targetKey === "transfer";

  const sections: ReadonlyArray<{ title: string; items: React.ReactNode[] }> = [
    {
      title: "Right now",
      items: [
        <>
          Ask your high-school counselor:{" "}
          <em>&ldquo;Does our school have a CCAP partnership with a community
          college?&rdquo;</em>
        </>,
        <>
          Visit{" "}
          <a
            href={collegeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[#1B4332] hover:text-[#143526] underline underline-offset-2 break-all"
          >
            the dual-enrollment page
            <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" aria-hidden />
          </a>{" "}
          and find the summer application.
        </>,
        "Check the summer application deadline (most close March–May).",
        "Confirm English 1A is offered this summer (online or in-person).",
        "Get parent/guardian signature ready — required for every dual-enrollment application.",
      ],
    },
    {
      title: "Before your first enrollment",
      items: [
        <>
          Verify your first course on{" "}
          <a
            href="https://assist.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1B4332] hover:text-[#143526] underline underline-offset-2"
          >
            ASSIST.org
          </a>{" "}
          — confirm it transfers to UC and/or CSU.
        </>,
        <>
          Create a CCCApply account at{" "}
          <a
            href="https://www.cccapply.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1B4332] hover:text-[#143526] underline underline-offset-2"
          >
            CCCApply.org
          </a>
          .
        </>,
        "Order any required textbooks (check if your CCAP covers them).",
      ],
    },
    {
      title: "Every semester",
      items: [
        "Confirm the unit cap with both your high-school counselor and the community college.",
        "Verify every new course on ASSIST.org before you enroll.",
        "Keep a running list of all CCC courses completed, with grades.",
      ],
    },
    {
      title: "Senior year, before graduation",
      items: [
        "Request official transcripts from every CCC you attended.",
        "Submit transcripts to every college you're applying to.",
        ...(showAdt
          ? [
              <>
                <strong className="font-semibold text-[#1B4332]">File for the ADT</strong>{" "}
                (Associate Degree for Transfer) with the community-college
                Admissions office.
              </>,
            ]
          : []),
        "Verify Cal-GETC completion with a CCC counselor.",
      ],
    },
  ];

  return (
    <section className="bg-white border border-[#E8E4DC] rounded-2xl p-6 sm:p-8">
      <p className="text-xs uppercase tracking-wider text-[#1B4332] font-semibold">
        Your action checklist
      </p>

      <h2 className="mt-2 font-serif text-2xl sm:text-3xl text-[#1B4332] font-semibold leading-tight">
        What to actually do, in order
      </h2>

      <div className="mt-6 space-y-6">
        {sections.map((section) => (
          <div key={section.title}>
            <h3 className="font-serif text-lg text-[#1B4332] font-semibold">
              {section.title}
            </h3>
            <ul className="mt-3 space-y-2">
              {section.items.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm text-[#4A5568] leading-relaxed"
                >
                  <span
                    aria-hidden
                    className="flex-shrink-0 mt-1 w-4 h-4 rounded border-2 border-[#E8E4DC] bg-white"
                  />
                  <span className="flex-1">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
