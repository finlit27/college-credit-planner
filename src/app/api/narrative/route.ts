import { NextResponse } from "next/server";
import { loadPlan } from "@/lib/kv";

// GET /api/narrative?shareId=<id>
//   reply: { paragraph: string | null, error?: string }
//
// Loads the saved plan from Upstash, summarizes the key fields, and asks the
// n8n narrative workflow for a 2-sentence personalized note. Always returns
// 200 with a `paragraph` field. `paragraph: null` means the client should
// hide the narrative block (per SPEC §3.4: the page renders fully even if
// the narrative is offline or slow).
//
// Timeout is 5s end-to-end (matches the client-side AbortController in
// NarrativeBlock and the spec's 5s budget).

export const runtime = "nodejs";
export const maxDuration = 10;

const TIMEOUT_MS = 5_000;

type NarrativeReply = { paragraph: string | null; error?: string };

export async function GET(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const shareId = searchParams.get("shareId");

  if (!shareId || !/^[A-Za-z0-9_-]{10}$/.test(shareId)) {
    return reply({ paragraph: null, error: "invalid-shareId" }, 400);
  }

  let record;
  try {
    record = await loadPlan(shareId);
  } catch (err) {
    console.error("[/api/narrative] loadPlan failed", err);
    return reply({ paragraph: null, error: "kv-failed" });
  }
  if (!record) {
    return reply({ paragraph: null, error: "not-found" }, 404);
  }

  const webhookUrl = process.env.N8N_NARRATIVE_WEBHOOK;
  if (!webhookUrl) {
    // Soft-fail so the client hides the block silently.
    return reply({ paragraph: null, error: "narrative-not-configured" });
  }

  const plan = record.plan;
  const payload = {
    name: plan.student.name,
    grade: plan.student.grade,
    region: plan.college.region_label ?? "Online only",
    major: plan.major_track.label,
    target: plan.target.label,
    college: plan.college.name,
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) {
      console.error(`[/api/narrative] n8n returned ${res.status}`);
      return reply({ paragraph: null, error: "upstream-failed" });
    }

    const data = (await res.json().catch(() => ({}))) as {
      paragraph?: unknown;
    };
    const paragraph =
      typeof data.paragraph === "string" && data.paragraph.trim().length > 0
        ? data.paragraph.trim()
        : null;
    return reply({ paragraph });
  } catch (err) {
    clearTimeout(timer);
    const isTimeout = (err as Error).name === "AbortError";
    return reply({
      paragraph: null,
      error: isTimeout ? "timeout" : "fetch-failed",
    });
  }
}

function reply(body: NarrativeReply, status = 200): Response {
  return NextResponse.json(body, { status });
}
