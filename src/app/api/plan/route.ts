import { NextResponse } from "next/server";
import { IntakeSchema } from "@/lib/schema";
import { generateShareId } from "@/lib/nanoid";

// Phase D stub: validates intake and returns a fake shareId so the form
// can land on /plan/<id>. Phase C will replace this with the real
// generatePlan + Upstash persistence wiring.

export const runtime = "nodejs";
export const maxDuration = 10;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const parsed = IntakeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid intake", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const shareId = generateShareId();
  return NextResponse.json({ shareId });
}
