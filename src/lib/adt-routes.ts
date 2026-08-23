/**
 * Associate Degree for Transfer (ADT) routes for dual-enrollment students.
 *
 * An ADT is the highest-leverage thing a dual-enrollment student can aim at:
 * 60 CSU-transferable units plus an ADT guarantees CSU admission as a junior
 * with priority consideration. TARGETS.csu already tells families this. What
 * the plan never showed them is which degree to actually walk toward, or
 * which courses in it a high schooler can register for.
 *
 * Like course-gates.ts, this is a RENDER-TIME layer. It stays out of the
 * Python CLI and the parity fixtures so the Plan payload is unchanged.
 *
 * HOW THESE THREE WERE CHOSEN
 * All 23 of El Camino's ADTs were checked against two filters: does the
 * required core contain a prerequisite a 9th or 10th grader cannot clear,
 * and do the courses actually run. Twelve have a fully open core. These
 * three combine an open core, a low unit count, and the healthiest section
 * counts in the live schedule.
 *
 * Psychology and Sociology were deliberately dropped. Both bury a statistics
 * course in the REQUIRED core with no alternative, and Psychology's core is
 * a three-term chain (PSYC C1000, then statistics, then PSYC 109B). They are
 * fine degrees and poor dual-enrollment targets.
 *
 * SCOPE
 * El Camino College only. Every course code, unit count and list below was
 * read from El Camino's 2026-2027 catalog, and every section count from the
 * live class schedule, on the verifiedOn date. Do not extend this to another
 * college by analogy: ADT major requirements come from a statewide Transfer
 * Model Curriculum, but each college maps its own course numbers onto it.
 */

/** The four things every ADT requires, independent of major. */
export const ADT_REQUIREMENTS: ReadonlyArray<string> = [
  "60 semester units that transfer to the California State University.",
  "The full Cal-GETC general education pattern.",
  "A minimum of 18 semester units in the major.",
  "A 2.0 GPA overall, and a grade of C or better in every course counted toward the major.",
];

/** How hard it is for a high schooler to register for a course right now. */
export type AdtAccess =
  /** No prerequisite. Registerable at any grade. */
  | "open"
  /** Prerequisite is a high school math course, cleared by transcript. */
  | "math-gated"
  /** Prerequisite is another college course, so it costs an extra term. */
  | "sequenced"
  /** Prerequisite is ENGL C1000, which El Camino puts in grade 12. */
  | "english-gated";

export interface AdtCourse {
  code: string;
  title: string;
  units: number;
  /** Interchangeable alternatives the catalog lists with "or". */
  orAlso?: string[];
  /** Cal-GETC area this course can also be credited to. A course counts in ONE area. */
  calGetcArea?: string;
  access: AdtAccess;
  /** The actual prerequisite text, when there is one. */
  prereq?: string;
}

export interface AdtGroup {
  label: string;
  /** Display string, verbatim from the catalog. */
  units: string;
  /** Numeric floor of `units`, used to compute how much is reachable now. */
  unitsMin: number;
  /** true when every listed course is required, false when the student chooses. */
  takeAll: boolean;
  note?: string;
  courses: AdtCourse[];
}

/** Section counts read from the live class schedule, per subject prefix. */
export interface AdtAvailability {
  subjects: string[];
  fall: number;
  spring: number;
  winter: number;
  note?: string;
}

export interface AdtRoute {
  id: string;
  name: string;
  totalMajorUnits: string;
  /** One line on what the degree is for. */
  summary: string;
  /** Why this route does or does not suit someone still in high school. */
  dualEnrollmentFit: string;
  /** The single thing most likely to stall this route. */
  watchOut: string;
  /**
   * Minimum number of separate terms the required core takes, because some
   * core courses are prerequisites for other core courses.
   */
  minCoreTerms: number;
  availability: AdtAvailability;
  groups: AdtGroup[];
}

export interface CollegeAdtRoutes {
  collegeId: string;
  collegeName: string;
  verifiedOn: string;
  sourceUrl: string;
  scheduleUrl: string;
  routes: AdtRoute[];
}

const STATS_OPTIONS: AdtCourse = {
  code: "STAT C1000",
  title: "Introduction to Statistics",
  units: 4,
  orAlso: ["STAT C1000H", "PSYC 109A", "SOCI 109A"],
  calGetcArea: "Area 2",
  access: "math-gated",
  prereq:
    "Algebra 2 with a C or better for STAT C1000. The PSYC 109A and SOCI 109A versions additionally require PSYC C1000 or SOCI 101 first.",
};

const EL_CAMINO_ROUTES: CollegeAdtRoutes = {
  collegeId: "el_camino",
  collegeName: "El Camino College",
  verifiedOn: "2026-08-20",
  sourceUrl: "http://catalog.elcamino.edu/content.php?catoid=12&navoid=686",
  scheduleUrl: "https://selfservice.elcamino.edu/student/Courses/Search",
  routes: [
    {
      id: "administration-of-justice-as-t",
      name: "Administration of Justice AS-T",
      totalMajorUnits: "18-19 units",
      summary:
        "Criminal law, investigation, corrections and forensics. Transfers to a CSU criminal justice or criminology major.",
      dualEnrollmentFit:
        "The strongest dual-enrollment target at this college. All 18 units can be completed without clearing a single prerequisite, and Administration of Justice runs more sections than any other subject checked, so seats are the least likely to be a problem. AJ 100 is already on El Camino's own Grades 9-10 recommended list.",
      watchOut:
        "List B looks like it forces statistics, but it does not. Choosing SOCI 101 and PSYC C1000 fills the whole 6 units with prerequisite-free courses. Separately, AJ 49, AJ 150 and AJ 155 carry enrollment limits that exclude minors. None of them appear below, so avoid wandering into them when picking electives.",
      minCoreTerms: 1,
      availability: { subjects: ["AJ"], fall: 23, spring: 22, winter: 5 },
      groups: [
        {
          label: "Required Core",
          units: "6 units",
          unitsMin: 6,
          takeAll: true,
          courses: [
            { code: "AJ 100", title: "Introduction to Administration of Justice", units: 3, calGetcArea: "Area 4", access: "open" },
            { code: "AJ 103", title: "Concepts of Criminal Law", units: 3, access: "open" },
          ],
        },
        {
          label: "List A",
          units: "6 units",
          unitsMin: 6,
          takeAll: false,
          note: "Choose two. Every option is prerequisite-free.",
          courses: [
            { code: "AJ 132", title: "Forensic Crime Scene Investigation", units: 3, access: "open" },
            { code: "AJ 111", title: "Criminal Investigation", units: 3, access: "open" },
            { code: "AJ 107", title: "Crime and Control: An Introduction to Corrections", units: 3, access: "open" },
            { code: "AJ 115", title: "Community and the Justice System", units: 3, access: "open" },
            { code: "AJ 126", title: "Juvenile Delinquency and Legal Procedures", units: 3, access: "open" },
            { code: "AJ 130", title: "Criminal Procedures", units: 3, access: "open" },
            { code: "AJ 131", title: "Legal Aspects of Evidence", units: 3, access: "open" },
          ],
        },
        {
          label: "List B",
          units: "6-7 units",
          unitsMin: 6,
          takeAll: false,
          note: "Choose two of the three. SOCI 101 plus PSYC C1000 avoids statistics entirely, and both run in winter.",
          courses: [
            { code: "SOCI 101", title: "Introduction to Sociology", units: 3, orAlso: ["SOCI 101H"], calGetcArea: "Area 4", access: "open" },
            { code: "PSYC C1000", title: "Introduction to Psychology", units: 3, orAlso: ["PSYC C1000H"], calGetcArea: "Area 4", access: "open" },
            STATS_OPTIONS,
          ],
        },
      ],
    },
    {
      id: "history-aa-t",
      name: "History AA-T",
      totalMajorUnits: "18-19 units",
      summary:
        "United States and world history, with a breadth requirement in culture and social science. Transfers to a CSU history major.",
      dualEnrollmentFit:
        "Eighteen units with no prerequisite anywhere in the core or List A, and the two List A courses, HIST 140 and HIST 141, sit on El Camino's Grades 9-10 recommended list. All four of those courses run in Winter 2027.",
      watchOut:
        "The literature options inside List B, the ENGL 28 through ENGL 43 group, sit behind ENGL C1000 and are therefore senior-year courses. The art history and world language options in the same group are not, so route around the English ones.",
      minCoreTerms: 1,
      availability: { subjects: ["HIST"], fall: 13, spring: 12, winter: 5 },
      groups: [
        {
          label: "Required Core",
          units: "6 units",
          unitsMin: 6,
          takeAll: true,
          note: "Both also satisfy half of the CSU American Institutions graduation requirement, which sits outside Cal-GETC and is allowed to double-count.",
          courses: [
            { code: "HIST C1001", title: "United States History to 1877 (formerly HIST 101)", units: 3, orAlso: ["HIST C1001H"], calGetcArea: "Area 3B or 4", access: "open" },
            { code: "HIST C1002", title: "United States History since 1877 (formerly HIST 102)", units: 3, orAlso: ["HIST C1002H"], calGetcArea: "Area 3B or 4", access: "open" },
          ],
        },
        {
          label: "List A",
          units: "6 units",
          unitsMin: 6,
          takeAll: true,
          note: "Both are on El Camino's Grades 9-10 list and both run in Winter 2027.",
          courses: [
            { code: "HIST 140", title: "History of Early Civilizations", units: 3, calGetcArea: "Area 3B or 4", access: "open" },
            { code: "HIST 141", title: "History of Modern Civilizations", units: 3, calGetcArea: "Area 3B or 4", access: "open" },
          ],
        },
        {
          label: "List B, culture group",
          units: "3 units",
          unitsMin: 3,
          takeAll: false,
          note: "Choose one. The catalog lists more options, including literature courses that require ENGL C1000. These are the prerequisite-free ones.",
          courses: [
            { code: "AHIS 207", title: "Art History of Mexico, Central and South America", units: 3, calGetcArea: "Area 3A", access: "open" },
            { code: "AHIS 209", title: "History of African Art", units: 3, calGetcArea: "Area 3A", access: "open" },
            { code: "SPAN 1", title: "Elementary Spanish I", units: 5, orAlso: ["SPAN 1H"], access: "open", prereq: "None, but comparable to two years of high school Spanish." },
            { code: "ASL 111", title: "American Sign Language I", units: 4, access: "open" },
            { code: "ENGL 31", title: "Mythology and Folklore", units: 3, calGetcArea: "Area 3B", access: "english-gated", prereq: "ENGL C1000." },
          ],
        },
        {
          label: "List B, social science group",
          units: "3 units",
          unitsMin: 3,
          takeAll: false,
          note: "Choose one. The catalog list is much longer. These are prerequisite-free and each clears a Cal-GETC area.",
          courses: [
            { code: "ESTU 1", title: "Introduction to Ethnic Studies", units: 3, calGetcArea: "Area 6 or 4", access: "open" },
            { code: "ANTH 2", title: "Introduction to Cultural Anthropology", units: 3, orAlso: ["ANTH 2H"], calGetcArea: "Area 4", access: "open" },
            { code: "POLS C1000", title: "American Government and Politics", units: 3, orAlso: ["POLS C1000H"], calGetcArea: "Area 4", access: "open" },
            { code: "GEOG 2", title: "Cultural Geography", units: 3, calGetcArea: "Area 4", access: "open" },
            { code: "SOCI 112", title: "Introduction to Criminology", units: 3, calGetcArea: "Area 4", access: "open" },
            { code: "ECON 100", title: "Fundamentals of Economics", units: 3, calGetcArea: "Area 4", access: "open" },
          ],
        },
      ],
    },
    {
      id: "anthropology-aa-t",
      name: "Anthropology AA-T",
      totalMajorUnits: "18-21 units",
      summary:
        "Biological anthropology, cultural anthropology and archaeology. Transfers to a CSU anthropology major.",
      dualEnrollmentFit:
        "All three required core courses are prerequisite-free, so a 9th or 10th grader can start immediately and take them in any order. ANTH 4 satisfies List A on its own, which is the route around statistics.",
      watchOut:
        "ANTH 3 is core but does not run in the winter session, only fall and spring, so it cannot be the winter pick. List B also refuses another anthropology course and forces a science or a statistics course.",
      minCoreTerms: 1,
      availability: {
        subjects: ["ANTH"],
        fall: 11,
        spring: 12,
        winter: 4,
        note: "ANTH 1 and ANTH 2 run in winter. ANTH 3 and the ANTH 5 lab are fall and spring only.",
      },
      groups: [
        {
          label: "Required Core",
          units: "9 units",
          unitsMin: 9,
          takeAll: true,
          courses: [
            { code: "ANTH 1", title: "Introduction to Biological Anthropology", units: 3, orAlso: ["ANTH 1H"], calGetcArea: "Area 5B", access: "open" },
            { code: "ANTH 2", title: "Introduction to Cultural Anthropology", units: 3, orAlso: ["ANTH 2H"], calGetcArea: "Area 4", access: "open" },
            { code: "ANTH 3", title: "Introduction to Archaeology", units: 3, access: "open" },
          ],
        },
        {
          label: "List A",
          units: "3-4 units",
          unitsMin: 3,
          takeAll: false,
          note: "Choose one. ANTH 4 is the route that avoids statistics.",
          courses: [
            { code: "ANTH 4", title: "Language and Culture", units: 3, calGetcArea: "Area 3B", access: "open" },
            STATS_OPTIONS,
          ],
        },
        {
          label: "List B",
          units: "3-4 units",
          unitsMin: 3,
          takeAll: false,
          note: "Choose one, plus any List A course not already used.",
          courses: [
            { code: "ANAT 32", title: "General Human Anatomy", units: 4, calGetcArea: "Area 5B", access: "open" },
            { code: "GEOG 8", title: "Introduction to Geographic Information Systems", units: 4, access: "open" },
            { code: "GEOL 1 + GEOL 3", title: "Physical Geology with Laboratory", units: 4, calGetcArea: "Area 5A", access: "open" },
            { code: "PSYC 109B", title: "Research Methods in the Behavioral Sciences", units: 4, access: "sequenced", prereq: "PSYC C1000 or SOCI 101, and a statistics course." },
          ],
        },
        {
          label: "List C",
          units: "3-4 units",
          unitsMin: 3,
          takeAll: false,
          note: "Choose one, plus any List A or List B course not already used. Every option here is prerequisite-free.",
          courses: [
            { code: "ANTH 5", title: "Biological Anthropology Laboratory", units: 1, calGetcArea: "Area 5C", access: "open" },
            { code: "ANTH 6", title: "Native Peoples of North America", units: 3, access: "open" },
            { code: "ANTH 7", title: "Native Peoples of South America", units: 3, access: "open" },
            { code: "ANTH 8", title: "Ancient Civilizations of Mesoamerica", units: 3, access: "open" },
            { code: "ANTH 9", title: "Women, Culture, and Society", units: 3, access: "open" },
            { code: "ANTH 11", title: "Anthropology of Religion, Magic and Witchcraft", units: 3, access: "open" },
            { code: "GEOG 2", title: "Cultural Geography", units: 3, calGetcArea: "Area 4", access: "open" },
            { code: "GEOG 5", title: "World Regional Geography", units: 3, orAlso: ["GEOG 5H"], calGetcArea: "Area 4", access: "open" },
            { code: "HIST 122", title: "United States Social History", units: 3, orAlso: ["HIST 122H"], calGetcArea: "Area 3B or 4", access: "open" },
            { code: "SOCI 101", title: "Introduction to Sociology", units: 3, orAlso: ["SOCI 101H"], calGetcArea: "Area 4", access: "open" },
            { code: "SOCI 107", title: "Issues of Race and Ethnicity in the United States", units: 3, calGetcArea: "Area 4", access: "open" },
            { code: "SOCI 108", title: "Global Perspectives on Race and Ethnicity", units: 3, calGetcArea: "Area 4", access: "open" },
          ],
        },
      ],
    },
  ],
};

const ROUTES_BY_COLLEGE_NAME: Record<string, CollegeAdtRoutes> = {
  [EL_CAMINO_ROUTES.collegeName]: EL_CAMINO_ROUTES,
};

/** Returns researched ADT routes for a college, or null when none exist. */
export function getAdtRoutes(collegeName: string): CollegeAdtRoutes | null {
  return ROUTES_BY_COLLEGE_NAME[collegeName] ?? null;
}

/** Every course in a route, flattened. */
export function routeCourses(route: AdtRoute): AdtCourse[] {
  return route.groups.flatMap((g) => g.courses);
}

/**
 * How many units of a route a student with no college coursework and no
 * cleared prerequisites could complete today.
 *
 * For a take-all group, only the open courses count. For a choose-from group,
 * the group is credited up to its unit floor if the open options can cover it,
 * since the student is free to pick those and ignore the gated ones.
 */
export function openUnits(route: AdtRoute): number {
  return route.groups.reduce((sum, g) => {
    const openTotal = g.courses
      .filter((c) => c.access === "open")
      .reduce((s, c) => s + c.units, 0);
    if (g.takeAll) return sum + openTotal;
    return sum + Math.min(g.unitsMin, openTotal);
  }, 0);
}

/**
 * Routes ordered by how startable they are: fewest sequential terms first,
 * then most units reachable with no prerequisite, then the healthiest section
 * count in the live schedule, since a degree you cannot get a seat in is not
 * actually available.
 */
export function routesByAccessibility(routes: AdtRoute[]): AdtRoute[] {
  return [...routes].sort(
    (a, b) =>
      a.minCoreTerms - b.minCoreTerms ||
      openUnits(b) - openUnits(a) ||
      b.availability.fall - a.availability.fall,
  );
}
