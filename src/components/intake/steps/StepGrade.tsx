"use client";

import { StepShell, ChoiceButton } from "../StepShell";
import type { Grade } from "../types";

type Props = {
  name: string | undefined;
  value: Grade | undefined;
  onChange: (grade: Grade) => void;
};

const GRADES: ReadonlyArray<{ value: Grade; label: string; sub: string }> = [
  { value: 9, label: "9th grade", sub: "Freshman" },
  { value: 10, label: "10th grade", sub: "Sophomore" },
  { value: 11, label: "11th grade", sub: "Junior" },
  { value: 12, label: "12th grade", sub: "Senior" },
];

export function StepGrade({ name, value, onChange }: Props) {
  const greeting = name ? `Nice to meet you, ${name}.` : "Got it.";
  return (
    <StepShell
      title={`${greeting} What grade are you in?`}
      subtitle="The earlier you start, the more credit you can stack before high school graduation."
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {GRADES.map((g) => (
          <ChoiceButton
            key={g.value}
            selected={value === g.value}
            onClick={() => onChange(g.value)}
            label={`${g.label} (${g.sub})`}
          >
            <div className="text-center">
              <div className="text-2xl font-serif font-semibold">{g.value}</div>
              <div className="text-xs uppercase tracking-wider text-[#9CA3AF]">
                {g.sub}
              </div>
            </div>
          </ChoiceButton>
        ))}
      </div>
    </StepShell>
  );
}
