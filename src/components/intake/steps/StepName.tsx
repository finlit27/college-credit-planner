"use client";

import { StepShell } from "../StepShell";

type Props = {
  value: string | undefined;
  onChange: (name: string) => void;
  onEnter: () => void;
};

export function StepName({ value, onChange, onEnter }: Props) {
  return (
    <StepShell
      title="What should we call you?"
      subtitle="First name only. We use this to personalize your plan — we don't store it anywhere it'll get shared."
    >
      <label htmlFor="intake-name" className="sr-only">
        First name
      </label>
      <input
        id="intake-name"
        type="text"
        inputMode="text"
        autoComplete="given-name"
        autoFocus
        value={value ?? ""}
        maxLength={30}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (value ?? "").trim().length > 0) {
            e.preventDefault();
            onEnter();
          }
        }}
        placeholder="Maria"
        className="w-full rounded-xl border-2 border-[#E8E4DC] bg-white px-5 py-4 text-lg text-[#1B4332] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#1B4332] focus:ring-2 focus:ring-[#1B4332]/20"
      />
    </StepShell>
  );
}
