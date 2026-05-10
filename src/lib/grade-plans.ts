export type GradeLevel = 9 | 10 | 11 | 12;

export interface GradePlan {
  unit_target: string;
  summer_action: string;
  school_year_action: string;
  milestone: string;
  warning: string;
}

/**
 * Ported verbatim from CLI's GRADE_PLANS constant.
 * Source: tools/generate_student_plan.py
 */
export const GRADE_PLANS: Record<GradeLevel, GradePlan> = {
  9: {
    unit_target: "3–6 units",
    summer_action:
      "Apply to summer program at your target college now. One course (3 units) is ideal for a first attempt. English 1A is the top priority.",
    school_year_action:
      "Confirm whether your high school has a CCAP partnership (ask your counselor). If yes, enroll in one dual enrollment course in spring semester.",
    milestone: "By end of 9th grade: 3–6 transferable units banked.",
    warning:
      "Some colleges require students to be in 10th grade or older. Check eligibility at your specific college before applying.",
  },
  10: {
    unit_target: "6–15 units",
    summer_action:
      "Take 2 courses in summer (6 units). If English 1A is done, move to a Cal-GETC Area 2 or Area 4 course next.",
    school_year_action:
      "Enroll in 1–2 dual enrollment courses during the school year via CCAP. Balance with sophomore-year coursework.",
    milestone: "By end of 10th grade: 6–15 transferable units banked.",
    warning:
      "Don't take non-transferable courses. Verify every course is on ASSIST.org (assist.org) before enrolling.",
  },
  11: {
    unit_target: "18–35 units",
    summer_action:
      "This is the high-output summer. Max out the summer unit cap at your target college. Two courses minimum.",
    school_year_action:
      "2 dual enrollment courses + AP strategy. Don't double-count — if you're taking AP Psych, skip Psych 1 at the CCC. Use AP for overlapping subjects, CCC for subjects without an AP option.",
    milestone:
      "By end of 11th grade: 18–35 transferable units. Cal-GETC should be 50–75% complete.",
    warning:
      "Watch the unit caps — exceeding them can cause enrollment issues. Confirm limits with both your high school and the community college each semester.",
  },
  12: {
    unit_target: "30–60 units",
    summer_action:
      "Summer before senior year: cement any remaining Cal-GETC gaps. By this summer you should have 25+ units already.",
    school_year_action:
      "Max out dual enrollment during senior year. If ADT is within reach, pursue it — the CSU admission guarantee is worth it. Request official transcripts from all CCCs attended by April.",
    milestone:
      "By high school graduation: 30–60 transferable units. Cal-GETC complete. ADT filed (if CSU-bound).",
    warning:
      "Apply for ADT by the deadline — it's not automatic. File with the Admissions office at your community college and have transcripts sent to CSU by the application deadline.",
  },
};
