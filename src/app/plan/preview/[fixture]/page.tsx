import { notFound } from "next/navigation";
import { promises as fs } from "node:fs";
import path from "node:path";
import { PlanSchema } from "@/lib/schema";
import { PlanShell } from "@/components/plan/PlanShell";

// Dev-only preview route. Renders PlanShell using a parity fixture from
// tests/fixtures/parity/ so the layout can be reviewed without Upstash.
// Disabled in production builds.
//
// Usage:
//   /plan/preview/maria-10-sgv-stem-csu
//   /plan/preview/sam-11-online-undecided-undecided
//   /plan/preview/jordan-9-oc-health-uc
//   /plan/preview/alex-12-inland-business-transfer
//   /plan/preview/riley-9-sfv-arts-private

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ fixture: string }>;
};

export default async function PreviewPlanPage({ params }: Props) {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }
  const { fixture } = await params;

  // Defense in depth — never let a hostile param escape the fixtures dir.
  if (!/^[a-z0-9-]+$/.test(fixture)) {
    notFound();
  }

  const fixturePath = path.join(
    process.cwd(),
    "tests",
    "fixtures",
    "parity",
    `${fixture}.json`,
  );
  let raw: string;
  try {
    raw = await fs.readFile(fixturePath, "utf8");
  } catch {
    notFound();
  }
  const plan = PlanSchema.parse(JSON.parse(raw));
  return (
    <>
      <div className="bg-[#B68D40]/10 border-b border-[#B68D40]/20 text-center py-2 text-xs uppercase tracking-wider text-[#1B4332] font-semibold">
        Dev preview · fixture: {fixture}
      </div>
      <PlanShell plan={plan} />
    </>
  );
}
