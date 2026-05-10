export interface CommonMistake {
  title: string;
  detail: string;
}

/**
 * Ported verbatim from CLI's COMMON_MISTAKES constant.
 * Source: tools/generate_student_plan.py
 */
export const COMMON_MISTAKES: ReadonlyArray<CommonMistake> = [
  {
    title: "Taking non-transferable courses",
    detail:
      "Every course must appear on ASSIST.org as transferable to UC or CSU before you enroll. " +
      "Remedial math, ESL courses, and some vocational courses don't count. Verify first, always.",
  },
  {
    title: "Missing enrollment deadlines",
    detail:
      "Summer programs fill fast — many close in March or April for June sessions. " +
      "Set a calendar reminder each January to apply for the following summer.",
  },
  {
    title: "Exceeding unit caps without checking",
    detail:
      "Enrolling in more units than your CCAP or concurrent enrollment agreement allows can result " +
      "in dropped enrollment or loss of fee waiver. Confirm your cap with both your high school counselor " +
      "and the community college each semester.",
  },
  {
    title: "Letting AP and dual enrollment overlap",
    detail:
      "If you're taking AP Psychology, don't also take Psych 1 at a CCC — you can't use both for the " +
      "same Cal-GETC area. Use AP for subjects where you have the strongest shot at a 4 or 5; " +
      "use CCC for subjects with no AP option.",
  },
  {
    title: "Forgetting to request official transcripts",
    detail:
      "Units only transfer if the receiving college gets an official transcript from the CCC. " +
      "Request transcripts from every community college attended before submitting your college application. " +
      "This step trips up more families than almost anything else.",
  },
];
