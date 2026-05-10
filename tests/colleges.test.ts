import { describe, it, expect } from "vitest";
import {
  getCollege,
  COLLEGES_BY_REGION,
  COLLEGES_BY_ID,
  COLLEGES_DATA,
} from "@/lib/colleges";

describe("colleges data", () => {
  it("loads 11 colleges from the synced JSON", () => {
    expect(COLLEGES_DATA.colleges).toHaveLength(11);
  });

  it("indexes by region_id 1-11", () => {
    for (const id of ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]) {
      expect(COLLEGES_BY_REGION[id]).toBeDefined();
    }
  });

  it("indexes by college id", () => {
    expect(COLLEGES_BY_ID.el_camino?.college).toBe("El Camino College");
    expect(COLLEGES_BY_ID.orange_coast?.college).toBe("Orange Coast College");
    expect(COLLEGES_BY_ID.irvine_valley?.summer_cap).toBe(15);
  });
});

describe("getCollege", () => {
  it("returns the region's college when in-person", () => {
    const c = getCollege("3", false);
    expect(c.college).toBe("Pasadena City College");
    expect(c.summer_cap).toBe(6);
    expect(c.backup).toBe("Mt. San Antonio College");
  });

  it("returns Orange Coast College for online-only regardless of regionId", () => {
    const c1 = getCollege(undefined, true);
    const c2 = getCollege("1", true);
    expect(c1.college).toBe("Orange Coast College");
    expect(c2.college).toBe("Orange Coast College");
    expect(c1.summer_cap).toBe(10);
  });

  it("throws when in-person and regionId is missing", () => {
    expect(() => getCollege(undefined, false)).toThrow(/regionId is required/);
  });

  it("throws on unknown regionId", () => {
    expect(() => getCollege("99", false)).toThrow(/Unknown regionId/);
  });
});
