import { describe, it, expect } from "vitest";
import {
  getCollegeGates,
  gateForCourse,
  isBlockedAtGrade,
  partitionSequence,
  openCoursesForGrade,
} from "@/lib/course-gates";
import { MAJOR_TRACKS } from "@/lib/major-tracks";
import { generatePlan } from "@/lib/plan-generator";
import type { Intake } from "@/lib/schema";

const EL_CAMINO = "El Camino College";

/** El Camino is region 1, so this intake resolves to El Camino. */
function intake(grade: 9 | 10 | 11 | 12, major: Intake["major"]): Intake {
  return {
    name: "Test",
    grade,
    gpa: 3.2,
    onlineOnly: false,
    regionId: "1",
    major,
    target: "csu",
  };
}

describe("course-gates — scope", () => {
  it("returns gates for El Camino", () => {
    const g = getCollegeGates(EL_CAMINO);
    expect(g).not.toBeNull();
    expect(g!.collegeId).toBe("el_camino");
  });

  it("returns null for colleges whose rules have not been researched", () => {
    for (const name of [
      "Santa Monica College",
      "Pasadena City College",
      "Orange Coast College",
      "Mt. San Antonio College (Mt. SAC)",
    ]) {
      expect(getCollegeGates(name)).toBeNull();
    }
  });

  it("carries a verification date and at least one published source", () => {
    const g = getCollegeGates(EL_CAMINO)!;
    expect(g.verifiedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(g.sources.length).toBeGreaterThan(0);
    for (const s of g.sources) expect(s).toMatch(/^https?:\/\//);
  });
});

describe("course-gates — the English 1A regression", () => {
  /**
   * The bug this module exists to fix. Every MAJOR_TRACKS sequence opens with
   * "English 1A", and GRADE_PLANS calls it the top priority for 9th and 10th
   * graders. At El Camino it needs three years of high school English with a
   * 2.60 GPA, so it is a senior-year course.
   */
  it("blocks English 1A for a 9th grader at El Camino", () => {
    const gates = getCollegeGates(EL_CAMINO)!;
    const plan = generatePlan(intake(9, "business"), "2026-08-19");
    const { available, blocked } = partitionSequence(
      plan.major_track.sequence,
      gates,
      9,
    );

    expect(blocked.map((b) => b.course.course)).toContain("English 1A");
    expect(available.map((a) => a.course.course)).not.toContain("English 1A");
    expect(blocked[0]!.gate!.courseCode).toBe("ENGL C1000");
    expect(blocked[0]!.gate!.requirement).toMatch(/2\.60 GPA/);
  });

  it("blocks English 1A for a 10th and 11th grader too", () => {
    const gates = getCollegeGates(EL_CAMINO)!;
    for (const grade of [10, 11] as const) {
      const plan = generatePlan(intake(grade, "stem"), "2026-08-19");
      const { blocked } = partitionSequence(plan.major_track.sequence, gates, grade);
      expect(blocked.map((b) => b.course.course)).toContain("English 1A");
    }
  });

  it("releases English 1A for a 12th grader", () => {
    const gates = getCollegeGates(EL_CAMINO)!;
    const plan = generatePlan(intake(12, "business"), "2026-08-19");
    const { available, blocked } = partitionSequence(
      plan.major_track.sequence,
      gates,
      12,
    );
    expect(available.map((a) => a.course.course)).toContain("English 1A");
    expect(blocked).toHaveLength(0);
  });

  it("points a blocked student at the Area 1B workaround", () => {
    const gates = getCollegeGates(EL_CAMINO)!;
    const gate = gateForCourse(gates, "English 1A")!;
    expect(gate.guidance).toMatch(/PHIL 105/);
  });
});

describe("course-gates — math prerequisites are conditional, not blocking", () => {
  /**
   * The intake never asks what math the student has finished, so demoting
   * Statistics for a 10th grader who already passed Algebra 2 would be wrong.
   * These surface as "check", which annotates without reordering.
   */
  it("marks Statistics as check rather than blocked", () => {
    const gates = getCollegeGates(EL_CAMINO)!;
    const gate = gateForCourse(gates, "Statistics")!;
    expect(gate.severity).toBe("check");
    expect(isBlockedAtGrade(gate, 9)).toBe(false);
    expect(gate.requirement).toMatch(/Algebra 2/);
  });

  it("keeps Statistics in the available list for a 9th grader", () => {
    const gates = getCollegeGates(EL_CAMINO)!;
    const plan = generatePlan(intake(9, "business"), "2026-08-19");
    const { available } = partitionSequence(plan.major_track.sequence, gates, 9);
    expect(available.map((a) => a.course.course)).toContain("Statistics");
  });

  it("gates Calculus on precalculus and Physics on trigonometry", () => {
    const gates = getCollegeGates(EL_CAMINO)!;
    expect(gateForCourse(gates, "Calculus 1")!.requirement).toMatch(/Precalculus/i);
    expect(gateForCourse(gates, "Physics 1")!.requirement).toMatch(/Trigonometry/i);
  });
});

describe("course-gates — other colleges are untouched", () => {
  it("passes every course through when no gates exist", () => {
    const plan = generatePlan(
      { ...intake(9, "business"), regionId: "2" },
      "2026-08-19",
    );
    const { available, blocked } = partitionSequence(
      plan.major_track.sequence,
      getCollegeGates(plan.college.name),
      9,
    );
    expect(available).toHaveLength(plan.major_track.sequence.length);
    expect(blocked).toHaveLength(0);
    expect(available.every((a) => a.gate === null)).toBe(true);
  });
});

describe("course-gates — ordering and coverage", () => {
  it("preserves CLI priority order within each group", () => {
    const gates = getCollegeGates(EL_CAMINO)!;
    const plan = generatePlan(intake(9, "humanities"), "2026-08-19");
    const { available, blocked } = partitionSequence(
      plan.major_track.sequence,
      gates,
      9,
    );
    for (const group of [available, blocked]) {
      const ps = group.map((g) => g.course.priority);
      expect(ps).toEqual([...ps].sort((a, b) => a - b));
    }
  });

  it("never loses or duplicates a course", () => {
    const gates = getCollegeGates(EL_CAMINO)!;
    for (const major of Object.keys(MAJOR_TRACKS) as Array<Intake["major"]>) {
      for (const grade of [9, 10, 11, 12] as const) {
        const plan = generatePlan(intake(grade, major), "2026-08-19");
        const { available, blocked } = partitionSequence(
          plan.major_track.sequence,
          gates,
          grade,
        );
        const seen = [...available, ...blocked]
          .map((g) => g.course.priority)
          .sort((a, b) => a - b);
        expect(seen).toEqual(plan.major_track.sequence.map((c) => c.priority));
      }
    }
  });

  it("has no dead gate patterns — every gate matches a real course label", () => {
    const gates = getCollegeGates(EL_CAMINO)!;
    const labels = Object.values(MAJOR_TRACKS).flatMap((t) =>
      t.sequence.map(([course]) => course),
    );
    for (const gate of gates.gates) {
      const hit = labels.some((l) => gate.patterns.some((p) => p.test(l)));
      expect(hit, `gate ${gate.id} matches no course label`).toBe(true);
    }
  });
});

describe("course-gates — term caps and open courses", () => {
  it("records the winter session as one course, not a unit count", () => {
    const gates = getCollegeGates(EL_CAMINO)!;
    const winter = gates.termCaps.find((t) => t.term === "winter")!;
    expect(winter.limit).toBe("1 course");
  });

  it("records all four terms", () => {
    const gates = getCollegeGates(EL_CAMINO)!;
    expect(gates.termCaps.map((t) => t.term).sort()).toEqual([
      "fall",
      "spring",
      "summer",
      "winter",
    ]);
  });

  it("serves the 9-10 band to underclassmen and the 11-12 band to upperclassmen", () => {
    const gates = getCollegeGates(EL_CAMINO);
    for (const g of [9, 10] as const) {
      const open = openCoursesForGrade(gates, g);
      expect(open.length).toBeGreaterThan(0);
      expect(open.every((c) => c.gradeBand === "9-10")).toBe(true);
    }
    for (const g of [11, 12] as const) {
      expect(
        openCoursesForGrade(gates, g).every((c) => c.gradeBand === "11-12"),
      ).toBe(true);
    }
  });

  it("returns no open courses when the college has no researched gates", () => {
    expect(openCoursesForGrade(null, 10)).toEqual([]);
  });

  it("every open course carries at least one Cal-GETC area", () => {
    const gates = getCollegeGates(EL_CAMINO)!;
    for (const c of gates.openCourses) {
      expect(c.areas.length).toBeGreaterThan(0);
      expect(c.units).toBeGreaterThan(0);
    }
  });
});
