"use client";

import { StepShell, ChoiceButton } from "../StepShell";
import { COLLEGES_DATA } from "@/lib/colleges";
import type { RegionId } from "../types";

type Props = {
  value: RegionId | undefined;
  onChange: (regionId: RegionId) => void;
};

export function StepRegion({ value, onChange }: Props) {
  const regions = COLLEGES_DATA.colleges
    .slice()
    .sort((a, b) => Number(a.region_id) - Number(b.region_id));

  return (
    <StepShell
      title="Where do you live?"
      subtitle="Pick the area closest to you. We'll match you with the community college that has the strongest dual-enrollment program in that region."
    >
      <div className="space-y-2.5">
        {regions.map((r) => (
          <ChoiceButton
            key={r.region_id}
            selected={value === r.region_id}
            onClick={() => onChange(r.region_id as RegionId)}
            label={`${r.region_label} (${r.college})`}
          >
            <div>
              <div className="font-medium text-sm sm:text-base">
                {r.region_label}
              </div>
              <div className="text-xs sm:text-sm text-[#9CA3AF] mt-1">
                → {r.college}
              </div>
            </div>
          </ChoiceButton>
        ))}
      </div>
    </StepShell>
  );
}
