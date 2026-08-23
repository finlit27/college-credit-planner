import type { Plan } from "@/lib/schema";

/**
 * Per-college enrollment reality for dual-enrollment students: prerequisite
 * gates on the recommended course sequence, plus the per-term unit caps.
 *
 * WHY THIS EXISTS
 * The generic MAJOR_TRACKS sequence (ported from the Python CLI) opens every
 * major with "English 1A — Always first", and GRADE_PLANS tells 9th and 10th
 * graders it is their top priority. At El Camino that is wrong: ENGL C1000
 * requires English placement, which requires three years of high school
 * English with a 2.60 GPA, so El Camino states it is "commonly taken by
 * Grade 12 Seniors only". A South Bay 9th grader was being told to lead with
 * a course they cannot register for until senior year.
 *
 * Like course-kinds.ts, this is a RENDER-TIME layer. It does not live in the
 * Python CLI and is deliberately absent from the parity fixtures, so the
 * Plan payload stays byte-identical to the CLI's --json output.
 *
 * SCOPE
 * Only colleges whose published rules have actually been read appear here.
 * getCollegeGates() returns null for everything else, and the UI renders
 * nothing rather than guessing. Do not add a college without reading its
 * dual-enrollment pages and setting verified_on.
 */

export type GateSeverity =
  /** Hard stop. The student cannot register at this grade level. */
  | "blocked"
  /** Registerable, but a prerequisite has to be cleared first. */
  | "check"
  /** No prerequisite. The college lists it in a higher grade band. */
  | "note";

export interface CourseGate {
  id: string;
  /** The college's own course number, post Common Course Numbering. */
  courseCode: string;
  /** Matched against the generic course label in MAJOR_TRACKS.sequence. */
  patterns: RegExp[];
  severity: GateSeverity;
  /** Lowest grade at which a "blocked" gate opens. null for non-blocking gates. */
  opensAtGrade: 9 | 10 | 11 | 12 | null;
  /** What the college actually requires, stated plainly. */
  requirement: string;
  /** What the student should do instead, or to clear it. */
  guidance: string;
}

export interface TermCap {
  term: "fall" | "winter" | "spring" | "summer";
  label: string;
  /** Rendered verbatim. "1 course" and "11 units" are different units of measure on purpose. */
  limit: string;
  note?: string;
}

/** A course the college itself recommends for this grade band, with no prerequisite. */
export interface OpenCourse {
  code: string;
  title: string;
  units: number;
  /** Cal-GETC area(s) the course can be credited to. A course counts in ONE area. */
  areas: string[];
  gradeBand: "9-10" | "11-12";
}

export interface CollegeGates {
  collegeId: string;
  collegeName: string;
  /** ISO date the published sources below were last read end to end. */
  verifiedOn: string;
  sources: string[];
  termCaps: TermCap[];
  gates: CourseGate[];
  openCourses: OpenCourse[];
}

/**
 * El Camino College.
 * Verified 2026-08-19 against the college's published dual-enrollment and
 * transfer pages. Course numbers reflect the Common Course Numbering change
 * that took effect Fall 2026 (ENGL 1A -> ENGL C1000, HIST 101 -> HIST C1001,
 * ECON 102 -> ECON C2001, ECON 101 -> ECON C2002, MATH 150 -> STAT C1000).
 */
const EL_CAMINO: CollegeGates = {
  collegeId: "el_camino",
  collegeName: "El Camino College",
  verifiedOn: "2026-08-19",
  sources: [
    "https://www.elcamino.edu/academics/dual-enrollment/course-restrictions.php",
    "https://www.elcamino.edu/academics/dual-enrollment/frequently-asked-questions.php",
    "https://www.elcamino.edu/academics/dual-enrollment/dual-enrollment.php",
    "https://www.elcamino.edu/academics/docs/Popular%20Courses%20for%20Dual%20Enrollment.pdf",
  ],
  termCaps: [
    { term: "fall", label: "Fall semester", limit: "11 units" },
    {
      term: "winter",
      label: "Winter session",
      limit: "1 course",
      note: "Accelerated 5-week term. One course, not one to two.",
    },
    { term: "spring", label: "Spring semester", limit: "11 units" },
    { term: "summer", label: "Summer term", limit: "8 units" },
  ],
  gates: [
    {
      id: "engl-c1000",
      courseCode: "ENGL C1000",
      patterns: [/^english\s*1a$/i, /\benglish\s*1a\b/i],
      severity: "blocked",
      opensAtGrade: 12,
      requirement:
        "English placement, which requires three years of high school English with a 2.60 GPA or better.",
      guidance:
        "El Camino states this is commonly taken by Grade 12 seniors only. Take Area 4 and Area 6 courses first and come back to English senior year. Cal-GETC Area 1B does not have to wait: PHIL 105 satisfies it and lists English 1A eligibility as recommended preparation rather than an enforced prerequisite. PSYC 103 also satisfies Area 1B but is hard-gated behind this course.",
    },
    {
      id: "engl-c1002",
      courseCode: "ENGL C1002",
      patterns: [/english\s*1b/i, /\bliterature\b/i],
      severity: "blocked",
      opensAtGrade: 12,
      requirement: "ENGL C1000 or equivalent, which is itself a senior-year course.",
      guidance:
        "A 3, 4 or 5 on the AP English Language or Literature exam also clears it, which is the faster route if AP English is on the high school plan.",
    },
    {
      id: "stat-c1000",
      courseCode: "STAT C1000",
      patterns: [/\bstatistics\b/i, /\bstats\b/i, /^a math\b/i],
      severity: "check",
      opensAtGrade: null,
      requirement: "Algebra 2 with a grade of C or better.",
      guidance:
        "High school transcripts clear this. If Algebra 2 is done, it is open now. If not, it opens the term after.",
    },
    {
      id: "math-190",
      courseCode: "MATH 190",
      patterns: [/\bcalculus\b/i],
      severity: "check",
      opensAtGrade: null,
      requirement: "Precalculus with a grade of C or better.",
      guidance:
        "High school transcripts clear prerequisites up to MATH 190. MATH 191 and above need AP exam scores or a college transcript.",
    },
    {
      id: "chem",
      courseCode: "CHEM 20 / CHEM 4",
      patterns: [/\bchemistry\b/i],
      severity: "check",
      opensAtGrade: null,
      requirement: "Algebra 1 for CHEM 20, Algebra 2 for CHEM 4.",
      guidance:
        "If this course is listed as chemistry OR biology, the biology option has no math prerequisite and is the faster path.",
    },
    {
      id: "phys",
      courseCode: "PHYS 2A",
      patterns: [/\bphysics\b/i],
      severity: "check",
      opensAtGrade: null,
      requirement: "Trigonometry with a grade of C or better.",
      guidance: "Plan this for 11th or 12th grade, after the trig course lands on the transcript.",
    },
    {
      id: "econ",
      courseCode: "ECON C2001 / C2002",
      patterns: [/\beconomics\b/i, /\becon\b/i],
      severity: "check",
      opensAtGrade: null,
      requirement: "Algebra 1 with a grade of C or better.",
      guidance:
        "The lowest math bar of any gated course here. Most students clear it before 9th grade ends.",
    },
    {
      id: "psyc-soci-band",
      courseCode: "PSYC C1000 / SOCI 101",
      patterns: [/\bpsychology\b/i, /\bsociology\b/i],
      severity: "note",
      opensAtGrade: null,
      requirement: "No prerequisite. Recommended preparation only.",
      guidance:
        "El Camino lists these in its Grades 11-12 band, not Grades 9-10. A 9th or 10th grader can still register. Weigh the reading load before a compressed 5-week winter term.",
    },
    {
      id: "hum-band",
      courseCode: "PHIL 101 / HIST C1001 / ARTH C1100",
      patterns: [/\bphilosophy\b/i, /\bart history\b/i, /\bfilm\b/i, /\bhistory\b/i],
      severity: "note",
      opensAtGrade: null,
      requirement: "No prerequisite.",
      guidance:
        "El Camino lists these in its Grades 11-12 band. For 9th and 10th graders, HIST 140 and 141 cover the same Cal-GETC areas and sit in the Grades 9-10 band.",
    },
  ],
  openCourses: [
    { code: "ANTH 1", title: "Introduction to Biological Anthropology", units: 3, areas: ["5B"], gradeBand: "9-10" },
    { code: "ANTH 2", title: "Introduction to Cultural Anthropology", units: 3, areas: ["4"], gradeBand: "9-10" },
    { code: "ESTU 1", title: "Introduction to Ethnic Studies", units: 3, areas: ["6", "4"], gradeBand: "9-10" },
    { code: "ESTU 3", title: "The Chicano in Contemporary U.S. Society", units: 3, areas: ["6", "4"], gradeBand: "9-10" },
    { code: "HIST 140", title: "History of Early Civilizations", units: 3, areas: ["3B", "4"], gradeBand: "9-10" },
    { code: "HIST 141", title: "History of Modern Civilizations", units: 3, areas: ["3B", "4"], gradeBand: "9-10" },
    { code: "CDEV 103", title: "Child Growth and Development", units: 3, areas: ["4"], gradeBand: "9-10" },
    { code: "AJ 100", title: "Introduction to Administration of Justice", units: 3, areas: ["4"], gradeBand: "9-10" },
    { code: "ASTR 25", title: "Stars and Galaxies", units: 3, areas: ["5A"], gradeBand: "9-10" },
    { code: "OCEA 10", title: "Introduction to Oceanography", units: 4, areas: ["5A"], gradeBand: "11-12" },
  ],
};

const GATES_BY_COLLEGE_NAME: Record<string, CollegeGates> = {
  [EL_CAMINO.collegeName]: EL_CAMINO,
};

/** Returns the verified gate set for a college, or null when none has been researched. */
export function getCollegeGates(collegeName: string): CollegeGates | null {
  return GATES_BY_COLLEGE_NAME[collegeName] ?? null;
}

/** First gate whose pattern matches a generic course label, or null. */
export function gateForCourse(
  gates: CollegeGates,
  courseLabel: string,
): CourseGate | null {
  for (const gate of gates.gates) {
    if (gate.patterns.some((p) => p.test(courseLabel))) return gate;
  }
  return null;
}

/** True when a gate hard-blocks registration at this grade level. */
export function isBlockedAtGrade(gate: CourseGate, grade: number): boolean {
  return (
    gate.severity === "blocked" &&
    gate.opensAtGrade !== null &&
    grade < gate.opensAtGrade
  );
}

export interface GatedCourse {
  course: Plan["major_track"]["sequence"][number];
  gate: CourseGate | null;
  blocked: boolean;
}

/**
 * Splits the recommended sequence into what the student can register for now
 * and what is hard-blocked at their grade level. Relative order is preserved
 * inside each group, so the CLI's priority ordering still shows through.
 */
export function partitionSequence(
  sequence: Plan["major_track"]["sequence"],
  gates: CollegeGates | null,
  grade: number,
): { available: GatedCourse[]; blocked: GatedCourse[] } {
  if (!gates) {
    return {
      available: sequence.map((course) => ({ course, gate: null, blocked: false })),
      blocked: [],
    };
  }

  const available: GatedCourse[] = [];
  const blocked: GatedCourse[] = [];

  for (const course of sequence) {
    const gate = gateForCourse(gates, course.course);
    const isBlocked = gate !== null && isBlockedAtGrade(gate, grade);
    (isBlocked ? blocked : available).push({ course, gate, blocked: isBlocked });
  }

  return { available, blocked };
}

/** Prerequisite-free courses the college itself recommends for this grade. */
export function openCoursesForGrade(
  gates: CollegeGates | null,
  grade: number,
): OpenCourse[] {
  if (!gates) return [];
  const band = grade <= 10 ? "9-10" : "11-12";
  return gates.openCourses.filter((c) => c.gradeBand === band);
}
