import { NextResponse } from "next/server";
import { IntakeSchema } from "@/lib/schema";
import { generatePlan } from "@/lib/plan-generator";
import { savePlan } from "@/lib/kv";

// POST /api/plan
//   body  : Intake (Zod-validated)
//   reply : { shareId } on 200, { error, issues? } on 4xx/5xx
//
// Generates a deterministic plan from the intake, persists it to Upstash
// with a 30-day TTL, and returns the short share ID for /plan/<id>.

export const runtime = "nodejs";
export const maxDuration = 10;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = IntakeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid intake", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    const plan = generatePlan(parsed.data);
    const shareId = await savePlan(plan);
    return NextResponse.json({ shareId });
  } catch (err) {
    console.error("[/api/plan] failed to generate or save plan", err);
    return NextResponse.json(
      { error: "Could not build your plan right now. Please try again." },
      { status: 500 },
    );
  }
}
