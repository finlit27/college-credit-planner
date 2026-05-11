"use client";

import { useReducer } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import {
  INITIAL_STATE,
  TOTAL_STEPS,
  intakeReducer,
  isComplete,
  isStepValid,
} from "./types";
import { IntakeSchema } from "@/lib/schema";
import { StepName } from "./steps/StepName";
import { StepGrade } from "./steps/StepGrade";
import { StepGPA } from "./steps/StepGPA";
import { StepMode } from "./steps/StepMode";
import { StepRegion } from "./steps/StepRegion";
import { StepMajor } from "./steps/StepMajor";
import { StepTarget } from "./steps/StepTarget";

export function IntakeForm() {
  const [state, dispatch] = useReducer(intakeReducer, INITIAL_STATE);
  const router = useRouter();

  const valid = isStepValid(state);
  const isLastStep = state.step === TOTAL_STEPS;

  async function handleSubmit() {
    if (!isComplete(state.draft)) {
      dispatch({ type: "SUBMIT_FAIL", error: "Please fill in every step." });
      return;
    }
    const parsed = IntakeSchema.safeParse(state.draft);
    if (!parsed.success) {
      // TODO: Christopher — final error copy
      dispatch({
        type: "SUBMIT_FAIL",
        error: "Something looks off with your answers. Please double-check each step.",
      });
      return;
    }
    dispatch({ type: "SUBMIT_START" });
    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }
      const data = (await res.json()) as { shareId?: string };
      if (!data.shareId) {
        throw new Error("Missing shareId in response");
      }
      router.push(`/plan/${data.shareId}`);
    } catch {
      // TODO: Christopher — final submit error copy
      dispatch({
        type: "SUBMIT_FAIL",
        error:
          "We couldn't build your plan right now. Please try again in a moment.",
      });
    }
  }

  function handleNext() {
    if (!valid) return;
    if (isLastStep) {
      void handleSubmit();
    } else {
      dispatch({ type: "NEXT" });
    }
  }

  return (
    <section className="container mx-auto px-4 pb-16 sm:pb-24">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-[#E8E4DC] shadow-sm p-6 sm:p-10">
          <ProgressBar step={state.step} total={TOTAL_STEPS} />

          <div className="mt-8">
            {state.step === 1 && (
              <StepName
                value={state.draft.name}
                onChange={(name) => dispatch({ type: "SET", patch: { name } })}
                onEnter={handleNext}
              />
            )}
            {state.step === 2 && (
              <StepGrade
                name={state.draft.name}
                value={state.draft.grade}
                onChange={(grade) =>
                  dispatch({ type: "SET", patch: { grade } })
                }
              />
            )}
            {state.step === 3 && (
              <StepGPA
                value={state.draft.gpa}
                onChange={(gpa) => dispatch({ type: "SET", patch: { gpa } })}
              />
            )}
            {state.step === 4 && (
              <StepMode
                value={state.draft.onlineOnly}
                onChange={(onlineOnly) =>
                  dispatch({
                    type: "SET",
                    patch: onlineOnly
                      ? { onlineOnly, regionId: undefined }
                      : { onlineOnly },
                  })
                }
              />
            )}
            {state.step === 5 && (
              <StepRegion
                value={state.draft.regionId}
                onChange={(regionId) =>
                  dispatch({ type: "SET", patch: { regionId } })
                }
              />
            )}
            {state.step === 6 && (
              <StepMajor
                value={state.draft.major}
                onChange={(major) =>
                  dispatch({ type: "SET", patch: { major } })
                }
              />
            )}
            {state.step === 7 && (
              <StepTarget
                value={state.draft.target}
                onChange={(target) =>
                  dispatch({ type: "SET", patch: { target } })
                }
              />
            )}
          </div>

          {state.error ? (
            <div
              role="alert"
              className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {state.error}
            </div>
          ) : null}

          <div className="mt-8 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => dispatch({ type: "BACK" })}
              disabled={state.step === 1 || state.submitting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-[#4A5568] hover:bg-[#1B4332]/5 disabled:opacity-0 disabled:pointer-events-none transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332]"
              aria-label="Previous step"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={!valid || state.submitting}
              className="inline-flex items-center gap-2 bg-[#1B4332] hover:bg-[#143526] disabled:bg-[#1B4332]/30 disabled:cursor-not-allowed text-white rounded-full px-6 py-3 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332] focus-visible:ring-offset-2 focus-visible:ring-offset-white min-h-[44px]"
              aria-label={isLastStep ? "Build my plan" : "Next step"}
            >
              {state.submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Building your plan…
                </>
              ) : isLastStep ? (
                <>
                  Build my plan
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = Math.round((step / total) * 100);
  return (
    <div>
      <div className="flex items-baseline justify-between text-xs uppercase tracking-wider text-[#9CA3AF]">
        <span>
          Step {step} of {total}
        </span>
        <span className="tabular-nums">{pct}%</span>
      </div>
      <div
        className="mt-2 h-1.5 rounded-full bg-[#E8E4DC] overflow-hidden"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={step}
        aria-label={`Step ${step} of ${total}`}
      >
        <div
          className="h-full bg-[#B68D40] transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
