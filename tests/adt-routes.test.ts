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

  it("carries a verification date, a catalog source and a schedule source", () => {
    const r = getAdtRoutes(EL_CAMINO)!;
    expect(r.verifiedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(r.sourceUrl).toMatch(/^https?:\/\//);
    expect(r.scheduleUrl).toMatch(/^https?:\/\//);
  });

  it("states the four ADT-wide requirements", () => {
    expect(ADT_REQUIREMENTS).toHaveLength(4);
    expect(ADT_REQUIREMENTS.join(" ")).toMatch(/60 semester units/);
    expect(ADT_REQUIREMENTS.join(" ")).toMatch(/Cal-GETC/);
  });

  it("offers the three routes with fully open cores", () => {
    expect(routes().map((r) => r.id).sort()).toEqual([
      "administration-of-justice-as-t",
      "anthropology-aa-t",
      "history-aa-t",
    ]);
  });

  it("no longer offers the statistics-gated routes", () => {
    /**
     * Psychology and Sociology were dropped deliberately: both put a statistics
     * course in the REQUIRED core with no alternative, and Psychology's core is
     * a three-term prerequisite chain. Neither is a good dual-enrollment target.
     */
    const ids = routes().map((r) => r.id);
    expect(ids).not.toContain("psychology-aa-t");
    expect(ids).not.toContain("sociology-aa-t");
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

  it("every route states units, fit and a watch-out", () => {
    for (const route of routes()) {
      expect(route.totalMajorUnits).toMatch(/units$/);
      expect(route.watchOut.length).toBeGreaterThan(20);
      expect(route.dualEnrollmentFit.length).toBeGreaterThan(20);
    }
  });

  it("unitsMin agrees with the displayed unit string", () => {
    for (const route of routes()) {
      for (const g of route.groups) {
        const floor = Number(g.units.match(/^(\d+)/)![1]);
        expect(g.unitsMin, `${route.id} / ${g.label}`).toBe(floor);
      }
    }
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

  it("a choose-from group always offers at least one open option", () => {
    for (const route of routes()) {
      for (const g of route.groups.filter((g) => !g.takeAll)) {
        const open = g.courses.filter((c) => c.access === "open");
        expect(open.length, `${route.id} / ${g.label} has no open option`).toBeGreaterThan(0);
      }
    }
  });
});

describe("adt-routes — availability from the live schedule", () => {
  it("every route reports section counts for at least one subject", () => {
    for (const route of routes()) {
      expect(route.availability.subjects.length).toBeGreaterThan(0);
      expect(route.availability.fall).toBeGreaterThan(0);
      expect(route.availability.spring).toBeGreaterThan(0);
    }
  });

  it("Administration of Justice has the deepest schedule", () => {
    const aj = byId("administration-of-justice-as-t").availability;
    for (const other of routes().filter((r) => r.id !== "administration-of-justice-as-t")) {
      expect(aj.fall).toBeGreaterThan(other.availability.fall);
    }
  });

  it("flags that Anthropology's core is not fully available in winter", () => {
    const anth = byId("anthropology-aa-t");
    expect(anth.availability.note).toMatch(/ANTH 3/);
    expect(anth.watchOut).toMatch(/winter/i);
  });
});

describe("adt-routes — the dual-enrollment reality", () => {
  it("every route's required core is entirely prerequisite-free", () => {
    for (const route of routes()) {
      const core = route.groups.find((g) => g.label === "Required Core")!;
      expect(
        core.courses.every((c) => c.access === "open"),
        `${route.id} core is not fully open`,
      ).toBe(true);
    }
  });

  it("Administration of Justice is completable with zero gated courses", () => {
    const aj = byId("administration-of-justice-as-t");
    expect(openUnits(aj)).toBeGreaterThanOrEqual(18);
    expect(aj.watchOut).toMatch(/SOCI 101 and PSYC C1000/);
  });

  it("warns that AJ courses restricted to adults are excluded", () => {
    const aj = byId("administration-of-justice-as-t");
    expect(aj.watchOut).toMatch(/AJ 49/);
    const codes = routeCourses(aj).map((c) => c.code);
    for (const banned of ["AJ 49", "AJ 150", "AJ 155"]) {
      expect(codes).not.toContain(banned);
    }
  });

  it("History's core doubles into the CSU American Institutions requirement", () => {
    const hist = byId("history-aa-t");
    const core = hist.groups.find((g) => g.label === "Required Core")!;
    expect(core.note).toMatch(/American Institutions/);
    expect(core.courses.map((c) => c.code)).toEqual(["HIST C1001", "HIST C1002"]);
  });

  it("History flags the English-gated literature options in List B", () => {
    const hist = byId("history-aa-t");
    const gated = routeCourses(hist).filter((c) => c.access === "english-gated");
    expect(gated.length).toBeGreaterThan(0);
    expect(hist.watchOut).toMatch(/ENGL C1000/);
  });

  it("Anthropology offers a List A option that avoids statistics", () => {
    const listA = byId("anthropology-aa-t").groups.find((g) => g.label === "List A")!;
    expect(listA.courses.find((c) => c.code === "ANTH 4")!.access).toBe("open");
  });

  it("ranks Administration of Justice first", () => {
    expect(routesByAccessibility(routes())[0]!.id).toBe("administration-of-justice-as-t");
  });

  it("reports a substantial number of immediately-open units for every route", () => {
    for (const route of routes()) {
      expect(openUnits(route), route.id).toBeGreaterThanOrEqual(18);
    }
  });

  it("uses ESTU, not ETHN, wherever Ethnic Studies appears", () => {
    for (const route of routes()) {
      for (const c of routeCourses(route)) {
        expect(c.code.startsWith("ETHN")).toBe(false);
      }
    }
  });
});
