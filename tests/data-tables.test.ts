import { describe, it, expect } from "vitest";
import { MAJOR_TRACKS } from "@/lib/major-tracks";
import { GRADE_PLANS } from "@/lib/grade-plans";
import { TARGETS, CLI_TARGET_KEY_MAP } from "@/lib/targets";
import { CAL_GETC_AREAS } from "@/lib/cal-getc";
import { SAVINGS_TABLE } from "@/lib/savings-table";
import { COMMON_MISTAKES } from "@/lib/common-mistakes";

describe("MAJOR_TRACKS", () => {
  it("has all 7 majors", () => {
    expect(Object.keys(MAJOR_TRACKS)).toEqual([
      "stem",
      "health",
      "business",
      "social",
      "humanities",
      "arts",
      "undecided",
    ]);
  });

  it("each major has a 5-course sequence", () => {
    for (const track of Object.values(MAJOR_TRACKS)) {
      expect(track.sequence).toHaveLength(5);
      // Each step is [course, reason]
      for (const [course, reason] of track.sequence) {
        expect(course.length).toBeGreaterThan(0);
        expect(reason.length).toBeGreaterThan(0);
      }
    }
  });

  it("every major starts with English 1A", () => {
    for (const track of Object.values(MAJOR_TRACKS)) {
      expect(track.sequence[0][0]).toMatch(/^English 1A/);
    }
  });
});

describe("GRADE_PLANS", () => {
  it("has plans for grades 9-12", () => {
    expect(Object.keys(GRADE_PLANS).map(Number).sort((a, b) => a - b)).toEqual([
      9, 10, 11, 12,
    ]);
  });

  it("each grade plan has the 5 required fields", () => {
    for (const gp of Object.values(GRADE_PLANS)) {
      expect(gp.unit_target.length).toBeGreaterThan(0);
      expect(gp.summer_action.length).toBeGreaterThan(0);
      expect(gp.school_year_action.length).toBeGreaterThan(0);
      expect(gp.milestone.length).toBeGreaterThan(0);
      expect(gp.warning.length).toBeGreaterThan(0);
    }
  });
});

describe("TARGETS", () => {
  it("has all 5 target destinations", () => {
    expect(Object.keys(TARGETS).sort()).toEqual([
      "csu",
      "private",
      "transfer",
      "uc",
      "undecided",
    ]);
  });

  it("each target has key + label + note", () => {
    for (const t of Object.values(TARGETS)) {
      expect(t.key).toBeTruthy();
      expect(t.label).toBeTruthy();
      expect(t.note.length).toBeGreaterThan(20);
    }
  });

  it("CLI_TARGET_KEY_MAP covers all 5 CLI keys", () => {
    expect(Object.keys(CLI_TARGET_KEY_MAP)).toEqual(["1", "2", "3", "4", "5"]);
  });
});

describe("CAL_GETC_AREAS", () => {
  it("has 7 areas", () => {
    expect(CAL_GETC_AREAS).toHaveLength(7);
  });

  it("includes Area 1 (English) first", () => {
    expect(CAL_GETC_AREAS[0].code).toBe("Area 1");
    expect(CAL_GETC_AREAS[0].title).toMatch(/English/);
  });
});

describe("SAVINGS_TABLE", () => {
  it("has 4 rows at 15/30/45/60 units", () => {
    expect(SAVINGS_TABLE.map((r) => r.units)).toEqual([15, 30, 45, 60]);
  });

  it("matches CLI money values exactly", () => {
    expect(SAVINGS_TABLE[1]).toMatchObject({
      units: 30,
      csu: "$6,450",
      uc: "$14,436",
    });
    expect(SAVINGS_TABLE[3].uc).toBe("$28,872");
  });
});

describe("COMMON_MISTAKES", () => {
  it("has exactly 5 mistakes", () => {
    expect(COMMON_MISTAKES).toHaveLength(5);
  });

  it("each mistake has title + detail", () => {
    for (const m of COMMON_MISTAKES) {
      expect(m.title.length).toBeGreaterThan(0);
      expect(m.detail.length).toBeGreaterThan(20);
    }
  });
});
