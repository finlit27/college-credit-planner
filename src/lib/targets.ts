import type { TargetKeySchema } from "@/lib/schema";
import type { z } from "zod";

export type TargetKey = z.infer<typeof TargetKeySchema>;

export interface Target {
  key: TargetKey;
  label: string;
  note: string;
}

/**
 * Ported verbatim from CLI's TARGETS constant.
 * The keys in CLI are "1"-"5"; we map them to semantic keys here.
 */
export const TARGETS: Record<TargetKey, Target> = {
  uc: {
    key: "uc",
    label: "UC (University of California)",
    note:
      "Complete the full Cal-GETC (7 areas) for maximum impact. " +
      "Important: UC grants elective and lower-division credit for dual enrollment units, " +
      "but a minimum residency requirement (36 upper-division units at the UC) means the " +
      "fastest realistic graduation is still 2 years. Units reduce lower-division course load " +
      "significantly. Freeing time for upper-division major coursework from day one.",
  },
  csu: {
    key: "csu",
    label: "CSU (California State University)",
    note:
      "The ADT (Associate Degree for Transfer) is your biggest lever. " +
      "60 transferable units + an ADT guarantees CSU admission as a junior with priority. " +
      "True 2-year graduation is realistic. Target: complete Cal-GETC + major prep courses " +
      "before high school graduation.",
  },
  private: {
    key: "private",
    label: "Private university (USC, LMU, Loyola, etc.)",
    note:
      "Policies vary widely by institution. Most accept dual enrollment units as elective credit. " +
      "Check each school's transfer credit policy before over-investing in community college courses. " +
      "AP + dual enrollment combo is most flexible for private universities.",
  },
  undecided: {
    key: "undecided",
    label: "Undecided between UC and CSU",
    note:
      "Follow the Cal-GETC path. It covers both UC and CSU and keeps all doors open. " +
      "The ADT is a CSU-specific tool; pursue it if CSU becomes the preference by 11th grade.",
  },
  transfer: {
    key: "transfer",
    label: "Planning to transfer from community college (2+2 path)",
    note:
      "Head start on an ADT is extremely valuable. Dual enrollment units count toward the ADT, " +
      "so completing 30+ units before high school graduation means you could finish an ADT " +
      "in your first year at a CCC and transfer as a junior after just one year of community college.",
  },
};

/**
 * The CLI numeric target keys ("1"-"5") map to semantic keys.
 * Used by the form to translate user choice to semantic key.
 */
export const CLI_TARGET_KEY_MAP: Record<string, TargetKey> = {
  "1": "uc",
  "2": "csu",
  "3": "private",
  "4": "undecided",
  "5": "transfer",
};
