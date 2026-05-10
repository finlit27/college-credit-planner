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
      ["English 1A", "Cal-GETC Area 1 — always first; prerequisite for many courses"],
      ["Calculus 1", "Cal-GETC Area 2 — foundational for all STEM majors"],
      ["Chemistry or Biology w/ Lab", "Cal-GETC Area 5B — lab science requirement"],
      ["Psychology or Sociology", "Cal-GETC Area 4 — easiest GE to knock out"],
      ["Physics 1", "Strengthens STEM transfer application; often required for Engineering"],
    ],
  },
  health: {
    key: "health",
    label: "Health Sciences / Pre-Med / Nursing",
    sequence: [
      ["English 1A", "Cal-GETC Area 1 — always first"],
      ["Statistics", "Cal-GETC Area 2 — required for nursing and health programs"],
      ["Biology w/ Lab", "Cal-GETC Area 5B — core pre-med requirement"],
      ["Chemistry", "Required for pre-med track"],
      ["Psychology", "Cal-GETC Area 4 — highly relevant to health fields"],
    ],
  },
  business: {
    key: "business",
    label: "Business / Economics / Finance",
    sequence: [
      ["English 1A", "Cal-GETC Area 1 — always first"],
      ["Statistics", "Cal-GETC Area 2 — core business tool"],
      ["Economics (Micro or Macro)", "Cal-GETC Area 4 — directly relevant to major"],
      ["Philosophy or History", "Cal-GETC Area 3B — humanities breadth"],
      ["A lab science", "Cal-GETC Area 5B — completes GE"],
    ],
  },
  social: {
    key: "social",
    label: "Social Sciences (Psychology, Sociology, Political Science, History)",
    sequence: [
      ["English 1A", "Cal-GETC Area 1 — always first"],
      ["Statistics", "Cal-GETC Area 2 — required for most social science majors"],
      ["Psychology", "Cal-GETC Area 4 — directly in major"],
      ["Sociology", "Cal-GETC Area 4 — pairs well with Psych"],
      ["History (US or World)", "Cal-GETC Area 3B or 4 depending on course"],
    ],
  },
  humanities: {
    key: "humanities",
    label: "Humanities (English, Literature, Philosophy, Languages)",
    sequence: [
      ["English 1A", "Cal-GETC Area 1 — always first"],
      ["English 1B or Literature", "Cal-GETC Area 3B — direct major credit"],
      ["Philosophy", "Cal-GETC Area 3B — core humanities"],
      ["History", "Cal-GETC Area 3B — broadens humanities portfolio"],
      ["A lab science", "Cal-GETC Area 5B — fulfills GE science"],
    ],
  },
  arts: {
    key: "arts",
    label: "Arts / Media / Design / Film",
    sequence: [
      ["English 1A", "Cal-GETC Area 1 — always first"],
      ["Art History or Film 1", "Cal-GETC Area 3A — directly in major"],
      ["Psychology", "Cal-GETC Area 4 — easy GE, widely transferable"],
      ["A math (Stats recommended)", "Cal-GETC Area 2 — fulfills math GE"],
      ["Biology or Earth Science", "Cal-GETC Area 5B — least demanding lab science option"],
    ],
  },
  undecided: {
    key: "undecided",
    label: "Undecided / General education focus",
    sequence: [
      ["English 1A", "Cal-GETC Area 1 — always first; universal prerequisite"],
      ["Statistics", "Cal-GETC Area 2 — most versatile math for any major"],
      ["Psychology", "Cal-GETC Area 4 — widely transferable, high-success course"],
      ["History (US History recommended)", "Cal-GETC Area 3B — covers history and social science"],
      ["Biology or Earth Science", "Cal-GETC Area 5B — fulfills lab science GE"],
    ],
  },
};
