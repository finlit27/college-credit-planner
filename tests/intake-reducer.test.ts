import { describe, it, expect } from "vitest";
import {
  intakeReducer,
  INITIAL_STATE,
  advanceStep,
  rewindStep,
  isStepValid,
  isComplete,
} from "@/components/intake/types";

describe("intake reducer", () => {
  it("starts on step 1 with an empty draft", () => {
    expect(INITIAL_STATE.step).toBe(1);
    expect(INITIAL_STATE.draft).toEqual({});
    expect(INITIAL_STATE.submitting).toBe(false);
    expect(INITIAL_STATE.error).toBeNull();
  });

  it("SET patches the draft without changing step", () => {
    const next = intakeReducer(INITIAL_STATE, {
      type: "SET",
      patch: { name: "Maria" },
    });
    expect(next.draft.name).toBe("Maria");
    expect(next.step).toBe(1);
  });

  it("SET merges patches rather than overwriting", () => {
    const a = intakeReducer(INITIAL_STATE, {
      type: "SET",
      patch: { name: "Maria" },
    });
    const b = intakeReducer(a, { type: "SET", patch: { grade: 10 } });
    expect(b.draft).toEqual({ name: "Maria", grade: 10 });
  });

  it("NEXT advances 1 → 2 → 3 → 4", () => {
    let s = INITIAL_STATE;
    s = intakeReducer(s, { type: "NEXT" });
    expect(s.step).toBe(2);
    s = intakeReducer(s, { type: "NEXT" });
    expect(s.step).toBe(3);
    s = intakeReducer(s, { type: "NEXT" });
    expect(s.step).toBe(4);
  });

  it("BACK rewinds within bounds and cannot go below 1", () => {
    let s = intakeReducer(INITIAL_STATE, { type: "NEXT" });
    s = intakeReducer(s, { type: "NEXT" });
    expect(s.step).toBe(3);
    s = intakeReducer(s, { type: "BACK" });
    s = intakeReducer(s, { type: "BACK" });
    expect(s.step).toBe(1);
    s = intakeReducer(s, { type: "BACK" });
    expect(s.step).toBe(1);
  });

  it("NEXT does not advance past step 7", () => {
    let s: typeof INITIAL_STATE = { ...INITIAL_STATE, step: 7 };
    s = intakeReducer(s, { type: "NEXT" });
    expect(s.step).toBe(7);
  });

  it("skips step 5 (region) when onlineOnly is true on NEXT", () => {
    let s = { ...INITIAL_STATE, step: 4 as const, draft: { onlineOnly: true } };
    s = intakeReducer(s, { type: "NEXT" });
    expect(s.step).toBe(6);
  });

  it("does NOT skip step 5 when onlineOnly is false", () => {
    let s = {
      ...INITIAL_STATE,
      step: 4 as const,
      draft: { onlineOnly: false },
    };
    s = intakeReducer(s, { type: "NEXT" });
    expect(s.step).toBe(5);
  });

  it("skips step 5 on BACK when onlineOnly is true (6 → 4)", () => {
    let s = { ...INITIAL_STATE, step: 6 as const, draft: { onlineOnly: true } };
    s = intakeReducer(s, { type: "BACK" });
    expect(s.step).toBe(4);
  });

  it("SUBMIT_START sets submitting=true and clears error", () => {
    const start: typeof INITIAL_STATE = {
      ...INITIAL_STATE,
      error: "previous error",
    };
    const after = intakeReducer(start, { type: "SUBMIT_START" });
    expect(after.submitting).toBe(true);
    expect(after.error).toBeNull();
  });

  it("SUBMIT_FAIL clears submitting and records error", () => {
    const start: typeof INITIAL_STATE = { ...INITIAL_STATE, submitting: true };
    const after = intakeReducer(start, {
      type: "SUBMIT_FAIL",
      error: "boom",
    });
    expect(after.submitting).toBe(false);
    expect(after.error).toBe("boom");
  });
});

describe("advanceStep / rewindStep helpers", () => {
  it("advanceStep clamps at 7", () => {
    expect(advanceStep(7, false)).toBe(7);
    expect(advanceStep(7, true)).toBe(7);
  });

  it("rewindStep clamps at 1", () => {
    expect(rewindStep(1, false)).toBe(1);
    expect(rewindStep(1, true)).toBe(1);
  });
});

describe("isStepValid", () => {
  it("requires non-empty name on step 1", () => {
    expect(isStepValid({ ...INITIAL_STATE, step: 1 })).toBe(false);
    expect(
      isStepValid({ ...INITIAL_STATE, step: 1, draft: { name: "   " } }),
    ).toBe(false);
    expect(
      isStepValid({ ...INITIAL_STATE, step: 1, draft: { name: "Maria" } }),
    ).toBe(true);
  });

  it("requires grade on step 2", () => {
    expect(isStepValid({ ...INITIAL_STATE, step: 2 })).toBe(false);
    expect(
      isStepValid({ ...INITIAL_STATE, step: 2, draft: { grade: 10 } }),
    ).toBe(true);
  });

  it("requires gpa on step 3", () => {
    expect(
      isStepValid({ ...INITIAL_STATE, step: 3, draft: { gpa: 3.2 } }),
    ).toBe(true);
  });

  it("requires onlineOnly on step 4 (true or false both valid)", () => {
    expect(isStepValid({ ...INITIAL_STATE, step: 4 })).toBe(false);
    expect(
      isStepValid({ ...INITIAL_STATE, step: 4, draft: { onlineOnly: false } }),
    ).toBe(true);
    expect(
      isStepValid({ ...INITIAL_STATE, step: 4, draft: { onlineOnly: true } }),
    ).toBe(true);
  });

  it("requires regionId on step 5", () => {
    expect(
      isStepValid({ ...INITIAL_STATE, step: 5, draft: { regionId: "3" } }),
    ).toBe(true);
  });

  it("requires major on step 6 and target on step 7", () => {
    expect(
      isStepValid({ ...INITIAL_STATE, step: 6, draft: { major: "stem" } }),
    ).toBe(true);
    expect(
      isStepValid({ ...INITIAL_STATE, step: 7, draft: { target: "uc" } }),
    ).toBe(true);
  });
});

describe("isComplete", () => {
  const FULL_INPERSON = {
    name: "Maria",
    grade: 10 as const,
    gpa: 3.2 as const,
    onlineOnly: false,
    regionId: "3" as const,
    major: "stem" as const,
    target: "uc" as const,
  };

  it("returns true for a full in-person intake", () => {
    expect(isComplete(FULL_INPERSON)).toBe(true);
  });

  it("returns true for a full online-only intake (no regionId)", () => {
    const { regionId, ...rest } = FULL_INPERSON;
    void regionId;
    expect(isComplete({ ...rest, onlineOnly: true })).toBe(true);
  });

  it("returns false when in-person intake is missing regionId", () => {
    const { regionId, ...rest } = FULL_INPERSON;
    void regionId;
    expect(isComplete({ ...rest, onlineOnly: false })).toBe(false);
  });

  it("returns false when any required field is missing", () => {
    expect(isComplete({ ...FULL_INPERSON, name: undefined })).toBe(false);
    expect(isComplete({ ...FULL_INPERSON, grade: undefined })).toBe(false);
    expect(isComplete({ ...FULL_INPERSON, major: undefined })).toBe(false);
  });
});
