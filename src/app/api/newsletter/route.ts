import { NextResponse } from "next/server";
import { subscribeToKit } from "@/lib/kit";

// POST /api/newsletter
//   body : { email: string, firstName?: string }
//   reply: { ok: true } on 200; { ok: false, error } on 400/502/503
//
// Soft opt-in from the plan result page. Adds the parent to the Kit
// "transfer-blueprint" segment. No plan data is sent to Kit, just the email.

export const runtime = "nodejs";
export const maxDuration = 10;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid-json" }, { status: 400 });
  }

  const { email, firstName } = (body ?? {}) as { email?: unknown; firstName?: unknown };
  if (typeof email !== "string" || !EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "invalid-email" }, { status: 400 });
  }

  const result = await subscribeToKit({
    email,
    firstName: typeof firstName === "string" && firstName.trim() ? firstName.trim() : undefined,
    fields: { source: "transfer-blueprint" },
  });

  if (!result.ok) {
    const status = result.error === "not-configured" ? 503 : 502;
    return NextResponse.json({ ok: false, error: result.error }, { status });
  }
  return NextResponse.json({ ok: true });
}
