import type {
  Intake,
  MajorKeySchema,
  TargetKeySchema,
  RegionIdSchema,
} from "@/lib/schema";
import type { z } from "zod";

export type MajorKey = z.infer<typeof MajorKeySchema>;
export type TargetKey = z.infer<typeof TargetKeySchema>;
export type RegionId = z.infer<typeof RegionIdSchema>;
export type Grade = 9 | 10 | 11 | 12;
export type GpaBucket = 1.5 | 2.2 | 2.7 | 3.2 | 3.7;

/**
 * Form-time state. Mirrors `Intake` but every field is optional because
 * users fill them in across 7 steps. Validation happens at submit time
 * via `IntakeSchema.safeParse`.
 */
export type IntakeDraft = {
  name?: string;
  grade?: Grade;
  gpa?: GpaBucket;
  onlineOnly?: boolean;
  regionId?: RegionId;
  major?: MajorKey;
  target?: TargetKey;
};

/**
 * Step indices are stable: even when onlineOnly skips step 5,
 * the other steps keep their canonical positions. The reducer
 * jumps step 4 → 6 on NEXT and 6 → 4 on BACK when onlineOnly.
 */
export type StepIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export const TOTAL_STEPS: StepIndex = 7;

export type IntakeFormState = {
  step: StepIndex;
  draft: IntakeDraft;
  submitting: boolean;
  error: string | null;
};

export type IntakeFormAction =
  | { type: "SET"; patch: IntakeDraft }
  | { type: "NEXT" }
  | { type: "BACK" }
  | { type: "SUBMIT_START" }
  | { type: "SUBMIT_FAIL"; error: string };

export const INITIAL_STATE: IntakeFormState = {
  step: 1,
  draft: {},
  submitting: false,
  error: null,
};

/** Returns the next step index, skipping step 5 when onlineOnly is true. */
export function advanceStep(
  current: StepIndex,
  onlineOnly: boolean | undefined
): StepIndex {
  if (current === 7) return 7;
  const candidate = (current + 1) as StepIndex;
  if (candidate === 5 && onlineOnly) return 6;
  return candidate;
}

/** Returns the previous step index, skipping step 5 when onlineOnly is true. */
export function rewindStep(
  current: StepIndex,
  onlineOnly: boolean | undefined
): StepIndex {
  if (current === 1) return 1;
  const candidate = (current - 1) as StepIndex;
  if (candidate === 5 && onlineOnly) return 4;
  return candidate;
}

export function intakeReducer(
  state: IntakeFormState,
  action: IntakeFormAction
): IntakeFormState {
  switch (action.type) {
    case "SET":
      return { ...state, draft: { ...state.draft, ...action.patch }, error: null };
    case "NEXT":
      return {
        ...state,
        step: advanceStep(state.step, state.draft.onlineOnly),
        error: null,
      };
    case "BACK":
      return {
        ...state,
        step: rewindStep(state.step, state.draft.onlineOnly),
        error: null,
      };
    case "SUBMIT_START":
      return { ...state, submitting: true, error: null };
    case "SUBMIT_FAIL":
      return { ...state, submitting: false, error: action.error };
    default:
      return state;
  }
}

/**
 * Per-step validity. Mirrors the IntakeSchema constraints but on the draft.
 * Used to enable/disable the "Next" button.
 */
export function isStepValid(state: IntakeFormState): boolean {
  const { step, draft } = state;
  switch (step) {
    case 1:
      return Boolean(draft.name && draft.name.trim().length > 0);
    case 2:
      return draft.grade !== undefined;
    case 3:
      return draft.gpa !== undefined;
    case 4:
      return draft.onlineOnly !== undefined;
    case 5:
      return draft.regionId !== undefined;
    case 6:
      return draft.major !== undefined;
    case 7:
      return draft.target !== undefined;
    default:
      return false;
  }
}

/** True only when every required field is filled and the draft is a complete Intake. */
export function isComplete(draft: IntakeDraft): draft is Intake {
  if (!draft.name || draft.grade === undefined || draft.gpa === undefined) {
    return false;
  }
  if (draft.onlineOnly === undefined) return false;
  if (!draft.onlineOnly && !draft.regionId) return false;
  if (!draft.major || !draft.target) return false;
  return true;
}
