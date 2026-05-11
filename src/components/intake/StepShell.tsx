import type { ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

/** Consistent question layout used inside every step. */
export function StepShell({ title, subtitle, children }: Props) {
  return (
    <div className="space-y-6">
      <div>
        {/* tabIndex={-1} lets IntakeForm focus the heading on step change for
            screen-reader + keyboard users; outline-none avoids a visible ring
            since the page change itself is already a visual cue. */}
        <h2
          tabIndex={-1}
          className="font-serif text-2xl sm:text-3xl text-[#1B4332] font-semibold leading-tight focus:outline-none"
        >
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-2 text-sm sm:text-base text-[#6B7280] leading-relaxed">
            {subtitle}
          </p>
        ) : null}
      </div>
      <div>{children}</div>
    </div>
  );
}

/** Big tap-target button — the building block of choice-based steps. */
export function ChoiceButton({
  selected,
  onClick,
  children,
  label,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      aria-label={label}
      className={[
        "w-full text-left rounded-xl border-2 px-5 py-4 transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FDFBF7]",
        "min-h-[60px]",
        selected
          ? "border-[#1B4332] bg-[#1B4332]/5 text-[#1B4332]"
          : "border-[#E8E4DC] bg-white text-[#4A5568] hover:border-[#B68D40] hover:bg-[#B68D40]/5",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
