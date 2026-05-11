"use client";

import { StepShell, ChoiceButton } from "../StepShell";
import { MAJOR_TRACKS } from "@/lib/major-tracks";
import type { MajorKey } from "../types";

type Props = {
  value: MajorKey | undefined;
  onChange: (major: MajorKey) => void;
};

const ORDER: ReadonlyArray<MajorKey> = [
  "stem",
  "health",
  "business",
  "social",
  "humanities",
  "arts",
  "undecided",
];

export function StepMajor({ value, onChange }: Props) {
  return (
    <StepShell
      title="What might you study?"
      subtitle="Don't sweat the choice — pick the closest fit. We use this to recommend courses that transfer cleanly into your major. You can always pivot later."
    >
      <div className="space-y-2.5">
        {ORDER.map((key) => {
          const m = MAJOR_TRACKS[key];
          return (
            <ChoiceButton
              key={key}
              selected={value === key}
              onClick={() => onChange(key)}
              label={m.label}
            >
              <div className="font-medium text-sm sm:text-base">{m.label}</div>
            </ChoiceButton>
          );
        })}
      </div>
    </StepShell>
  );
}
