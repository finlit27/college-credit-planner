import type { MajorKeySchema } from "@/lib/schema";
import type { z } from "zod";

export type MajorKey = z.infer<typeof MajorKeySchema>;

export interface MajorTrack {
  key: MajorKey;
  label: string;
  /** Ordered course sequence. Each tuple is [course, why]. */
  sequence: ReadonlyArray<readonly [string, string]>;
}

/**
 * Ported verbatim from CLI's MAJOR_TRACKS constant.
 * Source: tools/generate_student_plan.py
 */
export const MAJOR_TRACKS: Record<MajorKey, MajorTrack> = {
  stem: {
    key: "stem",
    label: "STEM (Engineering, Computer Science, Biology, Chemistry, Physics, Math)",
    sequence: [
      ["English 1A", "Cal-GETC Area 1. Always first; prerequisite for many courses"],
      ["Calculus 1", "Cal-GETC Area 2. Foundational for all STEM majors"],
      ["Chemistry or Biology w/ Lab", "Cal-GETC Area 5B. Lab science requirement"],
      ["Psychology or Sociology", "Cal-GETC Area 4. Easiest GE to knock out"],
      ["Physics 1", "Strengthens STEM transfer application; often required for Engineering"],
    ],
  },
  health: {
    key: "health",
    label: "Health Sciences / Pre-Med / Nursing",
    sequence: [
      ["English 1A", "Cal-GETC Area 1. Always first"],
      ["Statistics", "Cal-GETC Area 2. Required for nursing and health programs"],
      ["Biology w/ Lab", "Cal-GETC Area 5B. Core pre-med requirement"],
      ["Chemistry", "Required for pre-med track"],
      ["Psychology", "Cal-GETC Area 4. Highly relevant to health fields"],
    ],
  },
  business: {
    key: "business",
    label: "Business / Economics / Finance",
    sequence: [
      ["English 1A", "Cal-GETC Area 1. Always first"],
      ["Statistics", "Cal-GETC Area 2. Core business tool"],
      ["Economics (Micro or Macro)", "Cal-GETC Area 4. Directly relevant to major"],
      ["Philosophy or History", "Cal-GETC Area 3B. Humanities breadth"],
      ["A lab science", "Cal-GETC Area 5B. Completes GE"],
    ],
  },
  social: {
    key: "social",
    label: "Social Sciences (Psychology, Sociology, Political Science, History)",
    sequence: [
      ["English 1A", "Cal-GETC Area 1. Always first"],
      ["Statistics", "Cal-GETC Area 2. Required for most social science majors"],
      ["Psychology", "Cal-GETC Area 4. Directly in major"],
      ["Sociology", "Cal-GETC Area 4. Pairs well with Psych"],
      ["History (US or World)", "Cal-GETC Area 3B or 4 depending on course"],
    ],
  },
  humanities: {
    key: "humanities",
    label: "Humanities (English, Literature, Philosophy, Languages)",
    sequence: [
      ["English 1A", "Cal-GETC Area 1. Always first"],
      ["English 1B or Literature", "Cal-GETC Area 3B. Direct major credit"],
      ["Philosophy", "Cal-GETC Area 3B. Core humanities"],
      ["History", "Cal-GETC Area 3B. Broadens humanities portfolio"],
      ["A lab science", "Cal-GETC Area 5B. Fulfills GE science"],
    ],
  },
  arts: {
    key: "arts",
    label: "Arts / Media / Design / Film",
    sequence: [
      ["English 1A", "Cal-GETC Area 1. Always first"],
      ["Art History or Film 1", "Cal-GETC Area 3A. Directly in major"],
      ["Psychology", "Cal-GETC Area 4. Easy GE, widely transferable"],
      ["A math (Stats recommended)", "Cal-GETC Area 2. Fulfills math GE"],
      ["Biology or Earth Science", "Cal-GETC Area 5B. Least demanding lab science option"],
    ],
  },
  undecided: {
    key: "undecided",
    label: "Undecided / General education focus",
    sequence: [
      ["English 1A", "Cal-GETC Area 1. Always first; universal prerequisite"],
      ["Statistics", "Cal-GETC Area 2. Most versatile math for any major"],
      ["Psychology", "Cal-GETC Area 4. Widely transferable, high-success course"],
      ["History (US History recommended)", "Cal-GETC Area 3B. Covers history and social science"],
      ["Biology or Earth Science", "Cal-GETC Area 5B. Fulfills lab science GE"],
    ],
  },
};
