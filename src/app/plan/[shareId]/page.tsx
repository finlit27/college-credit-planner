import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { loadPlan } from "@/lib/kv";
import { PlanShell } from "@/components/plan/PlanShell";

// Share URLs are stable for the 30-day TTL window; revalidate every 5 min
// so a re-render after a deploy picks up any new presentation logic without
// invalidating the share link itself.
export const revalidate = 300;
export const dynamicParams = true;

type Props = {
  params: Promise<{ shareId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { shareId } = await params;
  const record = await loadPlan(shareId).catch(() => null);
  if (!record) {
    return {
      title: "Plan not found | FinLit Garden",
    };
  }
  const name = record.plan.student.name;
  return {
    title: `${name}'s College Credit Plan | FinLit Garden`,
    description: `A free, personalized plan to graduate high school with up to two years of college credit already done. Built for ${name}.`,
    openGraph: {
      title: `${name}'s College Credit Plan`,
      description:
        "A free, personalized plan to graduate high school with up to two years of college credit.",
      siteName: "FinLit Garden",
    },
  };
}

export default async function PlanPage({ params }: Props) {
  const { shareId } = await params;
  const record = await loadPlan(shareId).catch((err) => {
    console.error("[/plan] loadPlan failed", err);
    return null;
  });
  if (!record) {
    notFound();
  }
  return <PlanShell plan={record.plan} />;
}
