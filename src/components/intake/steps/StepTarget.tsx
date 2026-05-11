"use client";

import { StepShell, ChoiceButton } from "../StepShell";
import { TARGETS } from "@/lib/targets";
import type { TargetKey } from "../types";

type Props = {
  value: TargetKey | undefined;
  onChange: (target: TargetKey) => void;
};

const ORDER: ReadonlyArray<TargetKey> = [
  "uc",
  "csu",
  "private",
  "undecided",
  "transfer",
];

export function StepTarget({ value, onChange }: Props) {
  return (
    <StepShell
      title="What's the dream after high school?"
      subtitle="Last one. This shapes which credit pathway we recommend — Cal-GETC, an ADT, or a more flexible mix."
    >
      <div className="space-y-2.5">
        {ORDER.map((key) => {
          const t = TARGETS[key];
          return (
            <ChoiceButton
              key={key}
              selected={value === key}
              onClick={() => onChange(key)}
              label={t.label}
            >
              <div className="font-medium text-sm sm:text-base">{t.label}</div>
            </ChoiceButton>
          );
        })}
      </div>
    </StepShell>
  );
}
