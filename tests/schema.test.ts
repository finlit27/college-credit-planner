import { describe, it, expect } from "vitest";
import {
  IntakeSchema,
  PlanSchema,
  ShareRecordSchema,
  MajorKeySchema,
  TargetKeySchema,
  GradeSchema,
  GpaBucketSchema,
} from "@/lib/schema";

describe("IntakeSchema", () => {
  const validIntake = {
    name: "Maria",
    grade: 10 as const,
    gpa: 3.2 as const,
    onlineOnly: false,
    regionId: "3" as const,
    major: "stem" as const,
    target: "csu" as const,
  };

  it("accepts a valid in-person intake", () => {
    expect(IntakeSchema.safeParse(validIntake).success).toBe(true);
  });

  it("accepts a valid online-only intake without regionId", () => {
    const intake = { ...validIntake, onlineOnly: true, regionId: undefined };
    expect(IntakeSchema.safeParse(intake).success).toBe(true);
  });

  it("rejects in-person intake without regionId", () => {
    const intake = { ...validIntake, regionId: undefined };
    const result = IntakeSchema.safeParse(intake);
    expect(result.success).toBe(false);
  });

  it("rejects empty name", () => {
    const intake = { ...validIntake, name: "" };
    expect(IntakeSchema.safeParse(intake).success).toBe(false);
  });

  it("rejects out-of-range grade", () => {
    const intake = { ...validIntake, grade: 8 };
    expect(IntakeSchema.safeParse(intake).success).toBe(false);
  });

  it("rejects invalid major key", () => {
    const intake = { ...validIntake, major: "invalid-major" };
    expect(IntakeSchema.safeParse(intake).success).toBe(false);
  });

  it("trims whitespace on name", () => {
    const intake = { ...validIntake, name: "  Maria  " };
    const result = IntakeSchema.parse(intake);
    expect(result.name).toBe("Maria");
  });
});

describe("MajorKeySchema + TargetKeySchema", () => {
  it("accepts all 7 CLI majors", () => {
    const majors = [
      "stem",
      "health",
      "business",
      "social",
      "humanities",
      "arts",
      "undecided",
    ];
    for (const m of majors) {
      expect(MajorKeySchema.safeParse(m).success).toBe(true);
    }
  });

  it("accepts all 5 CLI targets", () => {
    const targets = ["uc", "csu", "private", "undecided", "transfer"];
    for (const t of targets) {
      expect(TargetKeySchema.safeParse(t).success).toBe(true);
    }
  });
});

describe("GpaBucketSchema", () => {
  it("accepts the 5 CLI gpa midpoints", () => {
    for (const g of [1.5, 2.2, 2.7, 3.2, 3.7]) {
      expect(GpaBucketSchema.safeParse(g).success).toBe(true);
    }
  });

  it("rejects arbitrary gpa values", () => {
    expect(GpaBucketSchema.safeParse(3.5).success).toBe(false);
    expect(GpaBucketSchema.safeParse(4.0).success).toBe(false);
  });
});

describe("PlanSchema", () => {
  const validPlan = {
    schema_version: 1 as const,
    generated_at: "2026-05-10",
    student: { name: "Maria", grade: 10, gpa: 3.2, gpa_status: "ok" as const },
    online_only: false,
    college: {
      name: "Pasadena City College",
      url: "https://www.pasadena.edu/future-students/dual-enrollment/",
      summer_cap: 6,
      backup: "Mt. San Antonio College",
      why: "Broad CCAP network...",
      region_label: "LA East / San Gabriel Valley",
    },
    major_track: {
      key: "stem" as const,
      label: "STEM",
      sequence: [{ priority: 1, course: "English 1A", reason: "Area 1" }],
    },
    target: { key: "csu" as const, label: "CSU", note: "ADT path..." },
    grade_roadmap: [
      {
        grade: 10,
        is_current: true,
        unit_target: "6–15 units",
        summer_action: "Take 2 courses...",
        school_year_action: "Enroll in 1–2...",
        milestone: "By end of 10th...",
        warning: "Verify on ASSIST...",
      },
    ],
    cal_getc_areas: [
      { code: "Area 1", title: "English Communication", example: "English 1A" },
    ],
    savings_table: [
      {
        units: 30,
        time: "~1 year",
        csu: "$6,450",
        uc: "$14,436",
        private: "$65,000–$95,000",
      },
    ],
    common_mistakes: [
      {
        number: 1,
        title: "Taking non-transferable courses",
        detail: "Verify on ASSIST.org",
      },
    ],
    unit_target_at_graduation: "30–60 units",
  };

  it("accepts a valid plan", () => {
    expect(PlanSchema.safeParse(validPlan).success).toBe(true);
  });

  it("rejects mismatched schema_version", () => {
    const plan = { ...validPlan, schema_version: 2 as unknown as 1 };
    expect(PlanSchema.safeParse(plan).success).toBe(false);
  });

  it("allows nullable college.backup for online-only", () => {
    const plan = {
      ...validPlan,
      online_only: true,
      college: { ...validPlan.college, backup: null, region_label: null },
    };
    expect(PlanSchema.safeParse(plan).success).toBe(true);
  });
});

describe("ShareRecordSchema", () => {
  it("accepts a valid record", () => {
    const record = {
      shareId: "abcd123456",
      plan: {
        schema_version: 1 as const,
        generated_at: "2026-05-10",
        student: {
          name: "Maria",
          grade: 10,
          gpa: 3.2,
          gpa_status: "ok" as const,
        },
        online_only: false,
        college: {
          name: "Pasadena City College",
          url: "https://www.pasadena.edu/future-students/dual-enrollment/",
          summer_cap: 6,
          backup: "Mt. San Antonio College",
          why: "...",
          region_label: "LA East / SGV",
        },
        major_track: { key: "stem" as const, label: "STEM", sequence: [] },
        target: { key: "csu" as const, label: "CSU", note: "..." },
        grade_roadmap: [],
        cal_getc_areas: [],
        savings_table: [],
        common_mistakes: [],
        unit_target_at_graduation: "30–60 units",
      },
      createdAt: "2026-05-10T14:00:00Z",
    };
    expect(ShareRecordSchema.safeParse(record).success).toBe(true);
  });

  it("rejects shareId of wrong length", () => {
    const record = { shareId: "short", plan: {}, createdAt: "..." };
    expect(ShareRecordSchema.safeParse(record).success).toBe(false);
  });
});
