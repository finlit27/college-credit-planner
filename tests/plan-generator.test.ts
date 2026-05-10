import { describe, it, expect } from "vitest";
import { generatePlan } from "@/lib/plan-generator";
import { PlanSchema, type Intake } from "@/lib/schema";

const baseIntake: Intake = {
  name: "Maria",
  grade: 10,
  gpa: 3.2,
  onlineOnly: false,
  regionId: "3",
  major: "stem",
  target: "csu",
};

describe("generatePlan — happy path", () => {
  it("produces a schema-valid Plan", () => {
    const plan = generatePlan(baseIntake, "2026-05-10");
    expect(PlanSchema.safeParse(plan).success).toBe(true);
  });

  it("returns Pasadena City College for region 3", () => {
    const plan = generatePlan(baseIntake);
    expect(plan.college.name).toBe("Pasadena City College");
    expect(plan.college.summer_cap).toBe(6);
    expect(plan.college.backup).toBe("Mt. San Antonio College");
  });

  it("respects the explicit generatedAt for deterministic tests", () => {
    const plan = generatePlan(baseIntake, "2026-01-15");
    expect(plan.generated_at).toBe("2026-01-15");
  });
});

describe("generatePlan — online-only override", () => {
  it("forces Orange Coast College and nulls backup/why/region_label", () => {
    const plan = generatePlan({
      ...baseIntake,
      onlineOnly: true,
      regionId: undefined,
    });
    expect(plan.college.name).toBe("Orange Coast College");
    expect(plan.college.summer_cap).toBe(10);
    expect(plan.college.backup).toBeNull();
    expect(plan.college.why).toBeNull();
    expect(plan.college.region_label).toBeNull();
    expect(plan.online_only).toBe(true);
  });

  it("forces Orange Coast even when regionId is set", () => {
    const plan = generatePlan({
      ...baseIntake,
      onlineOnly: true,
      regionId: "1",
    });
    expect(plan.college.name).toBe("Orange Coast College");
  });
});

describe("generatePlan — GPA status branches", () => {
  it("returns 'alert' for sub-2.0 GPA", () => {
    const plan = generatePlan({ ...baseIntake, gpa: 1.5 });
    expect(plan.student.gpa_status).toBe("alert");
  });

  it("returns 'note' for 2.0-2.4 GPA", () => {
    const plan = generatePlan({ ...baseIntake, gpa: 2.2 });
    expect(plan.student.gpa_status).toBe("note");
  });

  it("returns 'ok' for 2.5+ GPA", () => {
    const plan = generatePlan({ ...baseIntake, gpa: 2.7 });
    expect(plan.student.gpa_status).toBe("ok");
    const plan2 = generatePlan({ ...baseIntake, gpa: 3.7 });
    expect(plan2.student.gpa_status).toBe("ok");
  });
});

describe("generatePlan — grade_roadmap length", () => {
  it("9th grader gets a 4-grade roadmap", () => {
    const plan = generatePlan({ ...baseIntake, grade: 9 });
    expect(plan.grade_roadmap).toHaveLength(4);
    expect(plan.grade_roadmap[0].grade).toBe(9);
    expect(plan.grade_roadmap[0].is_current).toBe(true);
    expect(plan.grade_roadmap[3].grade).toBe(12);
    expect(plan.grade_roadmap[3].is_current).toBe(false);
  });

  it("12th grader gets a 1-grade roadmap", () => {
    const plan = generatePlan({ ...baseIntake, grade: 12 });
    expect(plan.grade_roadmap).toHaveLength(1);
    expect(plan.grade_roadmap[0].grade).toBe(12);
    expect(plan.grade_roadmap[0].is_current).toBe(true);
  });
});

describe("generatePlan — unit_target_at_graduation", () => {
  it("uses 30-60 units for 9th-10th graders", () => {
    expect(
      generatePlan({ ...baseIntake, grade: 9 }).unit_target_at_graduation
    ).toBe("30–60 units");
    expect(
      generatePlan({ ...baseIntake, grade: 10 }).unit_target_at_graduation
    ).toBe("30–60 units");
  });

  it("uses 30-45 units for 11th-12th graders", () => {
    expect(
      generatePlan({ ...baseIntake, grade: 11 }).unit_target_at_graduation
    ).toBe("30–45 units");
    expect(
      generatePlan({ ...baseIntake, grade: 12 }).unit_target_at_graduation
    ).toBe("30–45 units");
  });
});

describe("generatePlan — course sequence", () => {
  it("includes 5 courses with priority 1-5", () => {
    const plan = generatePlan(baseIntake);
    expect(plan.major_track.sequence).toHaveLength(5);
    plan.major_track.sequence.forEach((c, i) => {
      expect(c.priority).toBe(i + 1);
    });
  });

  it("starts with English 1A for every major", () => {
    for (const major of [
      "stem",
      "health",
      "business",
      "social",
      "humanities",
      "arts",
      "undecided",
    ] as const) {
      const plan = generatePlan({ ...baseIntake, major });
      expect(plan.major_track.sequence[0].course).toMatch(/^English 1A/);
    }
  });
});

describe("generatePlan — target notes", () => {
  it("CSU target mentions ADT", () => {
    const plan = generatePlan({ ...baseIntake, target: "csu" });
    expect(plan.target.note).toMatch(/ADT/);
  });

  it("UC target mentions Cal-GETC", () => {
    const plan = generatePlan({ ...baseIntake, target: "uc" });
    expect(plan.target.note).toMatch(/Cal-GETC/);
  });
});

describe("generatePlan — common_mistakes numbering", () => {
  it("renumbers from 1", () => {
    const plan = generatePlan(baseIntake);
    expect(plan.common_mistakes).toHaveLength(5);
    expect(plan.common_mistakes.map((m) => m.number)).toEqual([1, 2, 3, 4, 5]);
  });
});

describe("generatePlan — savings table parity", () => {
  it("includes 4 rows at 15/30/45/60 units with CLI money values", () => {
    const plan = generatePlan(baseIntake);
    expect(plan.savings_table.map((r) => r.units)).toEqual([15, 30, 45, 60]);
    expect(plan.savings_table[1].csu).toBe("$6,450");
    expect(plan.savings_table[1].uc).toBe("$14,436");
  });
});
