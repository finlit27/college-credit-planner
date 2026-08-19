import { describe, it, expect } from "vitest";
import {
  getAdtRoutes,
  routeCourses,
  openUnits,
  routesByAccessibility,
  ADT_REQUIREMENTS,
  type AdtRoute,
} from "@/lib/adt-routes";

const EL_CAMINO = "El Camino College";
const routes = () => getAdtRoutes(EL_CAMINO)!.routes;
const byId = (id: string): AdtRoute => routes().find((r) => r.id === id)!;

describe("adt-routes — scope and provenance", () => {
  it("serves El Camino and nothing else", () => {
    expect(getAdtRoutes(EL_CAMINO)).not.toBeNull();
    for (const other of ["Santa Monica College", "LA Pierce College", "Orange Coast College"]) {
      expect(getAdtRoutes(other)).toBeNull();
    }
  });

  it("carries a verification date and a catalog source", () => {
    const r = getAdtRoutes(EL_CAMINO)!;
    expect(r.verifiedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(r.sourceUrl).toMatch(/^https?:\/\//);
  });

  it("states the four ADT-wide requirements", () => {
    expect(ADT_REQUIREMENTS).toHaveLength(4);
    expect(ADT_REQUIREMENTS.join(" ")).toMatch(/60 semester units/);
    expect(ADT_REQUIREMENTS.join(" ")).toMatch(/Cal-GETC/);
  });

  it("offers exactly the three social-science routes", () => {
    expect(routes().map((r) => r.id).sort()).toEqual([
      "anthropology-aa-t",
      "psychology-aa-t",
      "sociology-aa-t",
    ]);
  });
});

describe("adt-routes — data integrity", () => {
  it("every course has a code, a title and positive units", () => {
    for (const route of routes()) {
      for (const c of routeCourses(route)) {
        expect(c.code.length).toBeGreaterThan(0);
        expect(c.title.length).toBeGreaterThan(0);
        expect(c.units).toBeGreaterThan(0);
      }
    }
  });

  it("every route states its total major units and a watch-out", () => {
    for (const route of routes()) {
      expect(route.totalMajorUnits).toMatch(/units$/);
      expect(route.watchOut.length).toBeGreaterThan(20);
      expect(route.dualEnrollmentFit.length).toBeGreaterThan(20);
    }
  });

  it("required-core groups are takeAll, list groups are choose-from", () => {
    for (const route of routes()) {
      const core = route.groups.find((g) => g.label === "Required Core")!;
      expect(core.takeAll).toBe(true);
      for (const g of route.groups.filter((g) => g.label !== "Required Core")) {
        expect(g.takeAll).toBe(false);
      }
    }
  });

  it("core units match the catalog's stated core totals", () => {
    expect(byId("anthropology-aa-t").groups[0]!.units).toBe("9 units");
    expect(byId("sociology-aa-t").groups[0]!.units).toBe("10 units");
    expect(byId("psychology-aa-t").groups[0]!.units).toBe("11 units");
  });

  it("any course carrying a non-open access level explains why", () => {
    for (const route of routes()) {
      for (const c of routeCourses(route)) {
        if (c.access !== "open") {
          expect(c.prereq, `${c.code} has access ${c.access} but no prereq text`).toBeTruthy();
        }
      }
    }
  });
});

describe("adt-routes — the dual-enrollment reality", () => {
  it("Anthropology's required core is entirely prerequisite-free", () => {
    const core = byId("anthropology-aa-t").groups[0]!;
    expect(core.courses.map((c) => c.code)).toEqual(["ANTH 1", "ANTH 2", "ANTH 3"]);
    expect(core.courses.every((c) => c.access === "open")).toBe(true);
  });

  it("Anthropology offers a List A option that avoids statistics", () => {
    const listA = byId("anthropology-aa-t").groups.find((g) => g.label === "List A")!;
    expect(listA.courses.some((c) => c.access === "open")).toBe(true);
    expect(listA.courses.find((c) => c.code === "ANTH 4")!.access).toBe("open");
  });

  it("Sociology and Psychology both force a statistics course into the core", () => {
    for (const id of ["sociology-aa-t", "psychology-aa-t"]) {
      const core = byId(id).groups[0]!;
      expect(core.courses.some((c) => c.access === "math-gated")).toBe(true);
    }
  });

  it("Psychology's core is a three-term chain", () => {
    const psych = byId("psychology-aa-t");
    expect(psych.minCoreTerms).toBe(3);
    const research = psych.groups[0]!.courses.find((c) => c.code === "PSYC 109B")!;
    expect(research.access).toBe("sequenced");
    expect(research.prereq).toMatch(/statistics/i);
  });

  it("flags PSYC 103 as the Area 1B trap", () => {
    const listB = byId("psychology-aa-t").groups.find((g) => g.label === "List B")!;
    const psyc103 = listB.courses.find((c) => c.code === "PSYC 103")!;
    expect(psyc103.calGetcArea).toBe("Area 1B");
    expect(psyc103.access).toBe("english-gated");
    expect(byId("psychology-aa-t").watchOut).toMatch(/PHIL 105/);
  });

  it("ranks Anthropology as the most startable route", () => {
    const ranked = routesByAccessibility(routes());
    expect(ranked[0]!.id).toBe("anthropology-aa-t");
    expect(ranked[ranked.length - 1]!.id).toBe("psychology-aa-t");
  });

  it("reports a positive number of immediately-open units for every route", () => {
    for (const route of routes()) {
      expect(openUnits(route)).toBeGreaterThan(0);
    }
    // Anthropology should be startable with the most open units of the three.
    const open = Object.fromEntries(routes().map((r) => [r.id, openUnits(r)]));
    expect(open["anthropology-aa-t"]).toBeGreaterThan(open["psychology-aa-t"]!);
  });

  it("shows most ADT courses double-count into a Cal-GETC area", () => {
    for (const route of routes()) {
      const withArea = routeCourses(route).filter((c) => c.calGetcArea);
      expect(withArea.length).toBeGreaterThan(0);
    }
  });
});
