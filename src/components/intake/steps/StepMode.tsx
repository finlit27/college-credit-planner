"use client";

import { StepShell, ChoiceButton } from "../StepShell";

type Props = {
  value: boolean | undefined;
  onChange: (onlineOnly: boolean) => void;
};

export function StepMode({ value, onChange }: Props) {
  return (
    <StepShell
      title="In-person or fully online?"
      subtitle="Most students go in-person at their local community college. Fully online is great if you have transportation limits or a packed schedule."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <ChoiceButton
          selected={value === false}
          onClick={() => onChange(false)}
          label="In-person at my local community college"
        >
          <div>
            <div className="font-medium text-base">In-person</div>
            <div className="text-sm text-[#6B7280] mt-1">
              At a community college near you. Maximum flexibility on courses
              and labs.
            </div>
          </div>
        </ChoiceButton>
        <ChoiceButton
          selected={value === true}
          onClick={() => onChange(true)}
          label="Fully online only"
        >
          <div>
            <div className="font-medium text-base">Fully online</div>
            <div className="text-sm text-[#6B7280] mt-1">
              We&apos;ll route you to Orange Coast College, the strongest fully
              online dual-enrollment program in SoCal.
            </div>
          </div>
        </ChoiceButton>
      </div>
    </StepShell>
  );
}
