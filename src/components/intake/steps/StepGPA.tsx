"use client";

import { StepShell, ChoiceButton } from "../StepShell";
import type { GpaBucket } from "../types";

type Props = {
  value: GpaBucket | undefined;
  onChange: (gpa: GpaBucket) => void;
};

const GPA_BUCKETS: ReadonlyArray<{
  value: GpaBucket;
  label: string;
  detail: string;
}> = [
  { value: 3.7, label: "A's mostly", detail: "3.5 and up" },
  { value: 3.2, label: "Mostly A's & B's", detail: "3.0 – 3.4" },
  { value: 2.7, label: "B's & C's", detail: "2.5 – 2.9" },
  { value: 2.2, label: "Mostly C's", detail: "2.0 – 2.4" },
  { value: 1.5, label: "Below C average", detail: "Under 2.0" },
];

export function StepGPA({ value, onChange }: Props) {
  return (
    <StepShell
      title="What's your GPA looking like?"
      subtitle="Most California community colleges accept dual enrollment regardless of GPA — this just helps us tailor advice. No judgment."
    >
      <div className="space-y-3">
        {GPA_BUCKETS.map((b) => (
          <ChoiceButton
            key={b.value}
            selected={value === b.value}
            onClick={() => onChange(b.value)}
            label={`${b.label} (${b.detail})`}
          >
            <div className="flex items-baseline justify-between">
              <span className="font-medium">{b.label}</span>
              <span className="text-sm text-[#9CA3AF] tabular-nums">
                {b.detail}
              </span>
            </div>
          </ChoiceButton>
        ))}
      </div>
    </StepShell>
  );
}
