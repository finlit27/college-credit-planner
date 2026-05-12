import type { MajorKey } from "@/lib/major-tracks";

/**
 * Whether a course in MAJOR_TRACKS is general-ed only, major prep only,
 * or both. Used by the UI to badge each course so families can see at a
 * glance which courses do double duty.
 *
 * This is a *render-time* concept layered on top of the plan data. It does
 * not live in the Python CLI or the parity fixtures, because the kind is
 * a function of (major, course-position) and never changes per student.
 *
 * Index in each tuple matches priority - 1 (priority is 1-indexed in the
 * plan). Lookup via getCourseKind(majorKey, priority).
 */

export type CourseKind = "GE" | "Major Prep" | "GE + Major Prep";

export const COURSE_KINDS: Record<MajorKey, ReadonlyArray<CourseKind>> = {
  // STEM: English (GE), Calc (both), Chem/Bio lab (both), Psych/Soc (GE), Physics (major)
  stem: ["GE", "GE + Major Prep", "GE + Major Prep", "GE", "Major Prep"],
  // Health: English (GE), Stats (both), Bio lab (both), Chem (major), Psych (both)
  health: [
    "GE",
    "GE + Major Prep",
    "GE + Major Prep",
    "Major Prep",
    "GE + Major Prep",
  ],
  // Business: English (GE), Stats (both), Econ (both), Phil/Hist (GE), Lab sci (GE)
  business: ["GE", "GE + Major Prep", "GE + Major Prep", "GE", "GE"],
  // Social: English (GE), Stats (both), Psych (both), Sociology (both), History (GE)
  social: [
    "GE",
    "GE + Major Prep",
    "GE + Major Prep",
    "GE + Major Prep",
    "GE",
  ],
  // Humanities: English 1A (both, since English is core to humanities), 1B (both),
  // Philosophy (both), History (both), Lab sci (GE)
  humanities: [
    "GE + Major Prep",
    "GE + Major Prep",
    "GE + Major Prep",
    "GE + Major Prep",
    "GE",
  ],
  // Arts: English (GE), Art Hist/Film (both), Psych (GE), Math (GE), Bio (GE)
  arts: ["GE", "GE + Major Prep", "GE", "GE", "GE"],
  // Undecided: every course is GE only since no specific major to prep for
  undecided: ["GE", "GE", "GE", "GE", "GE"],
};

export function getCourseKind(
  majorKey: MajorKey,
  priority: number,
): CourseKind {
  const list = COURSE_KINDS[majorKey];
  if (!list) return "GE";
  return list[priority - 1] ?? "GE";
}

/** Tailwind classes for the badge, color-coded by value tier. */
export function badgeClasses(kind: CourseKind): string {
  switch (kind) {
    case "GE + Major Prep":
      // Highest-value: counts for both GE and major. Forest green.
      return "bg-[#1B4332]/10 text-[#1B4332] border-[#1B4332]/25";
    case "Major Prep":
      // Major-specific value. Gold.
      return "bg-[#B68D40]/15 text-[#1B4332] border-[#B68D40]/40";
    case "GE":
    default:
      // Table stakes. Muted gray.
      return "bg-[#E8E4DC] text-[#6B7280] border-[#E8E4DC]";
  }
}
