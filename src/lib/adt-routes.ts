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
 * SCOPE
 * El Camino College only. Every course code, unit count and list below was
 * read from El Camino's 2026-2027 catalog on the verifiedOn date. Do not
 * extend this to another college by analogy: ADT major requirements come
 * from a statewide Transfer Model Curriculum, but each college maps its own
 * course numbers onto it, and those differ.
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
  units: string;
  /** true when every listed course is required, false when the student chooses. */
  takeAll: boolean;
  note?: string;
  courses: AdtCourse[];
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
  groups: AdtGroup[];
}

export interface CollegeAdtRoutes {
  collegeId: string;
  collegeName: string;
  verifiedOn: string;
  sourceUrl: string;
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
  verifiedOn: "2026-08-19",
  sourceUrl: "http://catalog.elcamino.edu/content.php?catoid=12&navoid=686",
  routes: [
    {
      id: "anthropology-aa-t",
      name: "Anthropology AA-T",
      totalMajorUnits: "18-21 units",
      summary:
        "Biological anthropology, cultural anthropology and archaeology. Transfers to a CSU anthropology major.",
      dualEnrollmentFit:
        "The most completable of the three. All three required core courses are prerequisite-free, so a 9th or 10th grader can start immediately and take them in any order. It is also the only one of the three whose lists offer a path around statistics, since ANTH 4 satisfies List A on its own.",
      watchOut:
        "List B does not accept another anthropology course. It forces a science or a statistics course, so the math question comes back at the end even if List A avoided it.",
      minCoreTerms: 1,
      groups: [
        {
          label: "Required Core",
          units: "9 units",
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
    {
      id: "sociology-aa-t",
      name: "Sociology AA-T",
      totalMajorUnits: "19 units",
      summary:
        "Sociological theory, social problems and research methods. Transfers to a CSU sociology major and feeds social work and criminology.",
      dualEnrollmentFit:
        "Two of the three core courses are prerequisite-free, and every List A and List B option is a 3-unit lecture with no prerequisite. Most of the 19 units are reachable in 9th and 10th grade.",
      watchOut:
        "Statistics is required in the core with no alternative. Algebra 2 has to be finished with a C first, and if the SOCI 109A version is chosen it also requires SOCI 101 beforehand.",
      minCoreTerms: 2,
      groups: [
        {
          label: "Required Core",
          units: "10 units",
          takeAll: true,
          courses: [
            { code: "SOCI 101", title: "Introduction to Sociology", units: 3, orAlso: ["SOCI 101H"], calGetcArea: "Area 4", access: "open" },
            { code: "SOCI 104", title: "Social Problems", units: 3, calGetcArea: "Area 4", access: "open" },
            STATS_OPTIONS,
          ],
        },
        {
          label: "List A",
          units: "6 units",
          takeAll: false,
          note: "Choose two. All four are prerequisite-free.",
          courses: [
            { code: "SOCI 102", title: "Families and Intimate Relationships", units: 3, calGetcArea: "Area 4", access: "open" },
            { code: "SOCI 107", title: "Issues of Race and Ethnicity in the United States", units: 3, calGetcArea: "Area 4", access: "open" },
            { code: "SOCI 112", title: "Introduction to Criminology", units: 3, calGetcArea: "Area 4", access: "open" },
            { code: "PSYC 108", title: "Social Psychology", units: 3, calGetcArea: "Area 4", access: "open" },
          ],
        },
        {
          label: "List B",
          units: "3 units",
          takeAll: false,
          note: "Choose one.",
          courses: [
            { code: "ANTH 2", title: "Introduction to Cultural Anthropology", units: 3, orAlso: ["ANTH 2H"], calGetcArea: "Area 4", access: "open" },
            { code: "ASTU 7", title: "History of American Popular Culture", units: 3, calGetcArea: "Area 3B or 4", access: "open" },
            { code: "PSYC 112", title: "Human Sexuality", units: 3, access: "open" },
            { code: "PSYC 116", title: "Lifespan Development", units: 3, access: "open" },
            { code: "SOCI 108", title: "Global Perspectives on Race and Ethnicity", units: 3, calGetcArea: "Area 4", access: "open" },
            { code: "SOCI 110", title: "Introduction to Social Work", units: 3, access: "open" },
            { code: "SOCI 113", title: "Gender and Society", units: 3, calGetcArea: "Area 4", access: "open" },
            { code: "SOCI 115", title: "Sociology of Death and Dying", units: 3, calGetcArea: "Area 4", access: "open" },
            { code: "SOCI 118", title: "Sociology of Sexualities", units: 3, calGetcArea: "Area 4", access: "open" },
            { code: "WSTU 1", title: "Introduction to Women's Studies", units: 3, calGetcArea: "Area 4", access: "open" },
          ],
        },
      ],
    },
    {
      id: "psychology-aa-t",
      name: "Psychology AA-T",
      totalMajorUnits: "20-21 units",
      summary:
        "The science of psychology, statistics and research design. Transfers to a CSU psychology major.",
      dualEnrollmentFit:
        "The broadest major of the three and the most commonly declared, but the hardest to finish in high school. The core is a three-link chain: PSYC C1000, then a statistics course, then PSYC 109B, which cannot be compressed because each is a prerequisite for the next.",
      watchOut:
        "PSYC 103 looks attractive because it satisfies Cal-GETC Area 1B, but it is the one List B course with a hard ENGL C1000 prerequisite, so it is a senior-year course. PHIL 105 fills Area 1B without that prerequisite.",
      minCoreTerms: 3,
      groups: [
        {
          label: "Required Core",
          units: "11 units",
          takeAll: true,
          note: "These three must be taken in order. Each one gates the next.",
          courses: [
            { code: "PSYC C1000", title: "Introduction to Psychology", units: 3, orAlso: ["PSYC C1000H"], calGetcArea: "Area 4", access: "open" },
            STATS_OPTIONS,
            { code: "PSYC 109B", title: "Research Methods in the Behavioral Sciences", units: 4, access: "sequenced", prereq: "PSYC C1000 or SOCI 101, and a statistics course, each with a C or better." },
          ],
        },
        {
          label: "List A",
          units: "3-4 units",
          takeAll: false,
          note: "Choose one.",
          courses: [
            { code: "BIOL 10", title: "Fundamentals of Biology", units: 4, orAlso: ["BIOL 10H"], calGetcArea: "Area 5B", access: "open" },
            { code: "PSYC 107", title: "Physiological Psychology", units: 3, calGetcArea: "Area 5B", access: "open" },
          ],
        },
        {
          label: "List B",
          units: "6 units",
          takeAll: false,
          note: "Choose two, plus any List A course not already used.",
          courses: [
            { code: "PSYC 102", title: "Psychology for Effective Living", units: 3, access: "open" },
            { code: "PSYC 103", title: "Critical Thinking and Psychology", units: 3, orAlso: ["PSYC 103H"], calGetcArea: "Area 1B", access: "english-gated", prereq: "ENGL C1000 with a C or better." },
            { code: "PSYC 108", title: "Social Psychology", units: 3, calGetcArea: "Area 4", access: "open" },
            { code: "PSYC 110", title: "African American Psychology", units: 3, access: "open" },
            { code: "PSYC 112", title: "Human Sexuality", units: 3, access: "open" },
            { code: "PSYC 115", title: "Abnormal Psychology", units: 3, access: "open" },
            { code: "PSYC 116", title: "Lifespan Development", units: 3, access: "open" },
            { code: "PSYC 117", title: "Cultural Psychology", units: 3, access: "open" },
            { code: "PSYC 119", title: "LGBTQ+ Psychology", units: 3, access: "open" },
            { code: "PSYC 125", title: "The Psychology of Gender", units: 3, access: "open" },
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
 * How many units of a route are registerable with no prerequisite at all.
 * This is the honest "can a 9th grader start this today" number.
 */
export function openUnits(route: AdtRoute): number {
  return route.groups.reduce((sum, g) => {
    const open = g.courses.filter((c) => c.access === "open");
    if (g.takeAll) return sum + open.reduce((s, c) => s + c.units, 0);
    // For choose-from groups, credit the single largest open option only.
    return sum + (open.length ? Math.max(...open.map((c) => c.units)) : 0);
  }, 0);
}

/** Routes ordered by how much of the major a high schooler can start immediately. */
export function routesByAccessibility(routes: AdtRoute[]): AdtRoute[] {
  return [...routes].sort(
    (a, b) => a.minCoreTerms - b.minCoreTerms || openUnits(b) - openUnits(a),
  );
}
