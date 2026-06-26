// src/lib/kit.ts
//
// Thin client for Kit (formerly ConvertKit) API v4. Env-gated and
// soft-failing, mirroring src/app/api/narrative/route.ts: a missing key or a
// flaky upstream never throws, it returns a typed error the caller can handle.
//
// v4 auth is the `X-Kit-Api-Key` header (not a body field). Adding someone to a
// form is two steps: upsert the subscriber, then add that subscriber id to the
// form (the form-add endpoint requires an existing subscriber).
// Docs: https://developers.kit.com/api-reference

export type KitResult =
  | { ok: true }
  | { ok: false; error: "not-configured" | "upstream-failed" | "timeout" | "fetch-failed" };

const TIMEOUT_MS = 5_000;
const KIT_BASE = "https://api.kit.com/v4";

export async function subscribeToKit(input: {
  email: string;
  firstName?: string;
  fields?: Record<string, string>;
}): Promise<KitResult> {
  const apiKey = process.env.KIT_API_KEY;
  const formId = process.env.KIT_FORM_ID;
  if (!apiKey || !formId) return { ok: false, error: "not-configured" };

  const headers = {
    "Content-Type": "application/json",
    "X-Kit-Api-Key": apiKey,
  };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    // 1. Upsert the subscriber (creates new or updates existing by email).
    const createRes = await fetch(`${KIT_BASE}/subscribers`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        email_address: input.email,
        first_name: input.firstName,
        fields: input.fields,
      }),
      signal: controller.signal,
    });
    if (!createRes.ok) {
      clearTimeout(timer);
      console.error(`[kit] create subscriber returned ${createRes.status}`);
      return { ok: false, error: "upstream-failed" };
    }
    const data = (await createRes.json().catch(() => ({}))) as {
      subscriber?: { id?: number };
    };
    const id = data.subscriber?.id;
    if (!id) {
      clearTimeout(timer);
      console.error("[kit] create subscriber: missing subscriber.id in response");
      return { ok: false, error: "upstream-failed" };
    }

    // 2. Add the subscriber to the form (this is what triggers the sequence).
    const addRes = await fetch(`${KIT_BASE}/forms/${formId}/subscribers/${id}`, {
      method: "POST",
      headers,
      body: JSON.stringify({}),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!addRes.ok) {
      console.error(`[kit] add to form returned ${addRes.status}`);
      return { ok: false, error: "upstream-failed" };
    }
    return { ok: true };
  } catch (err) {
    clearTimeout(timer);
    const isTimeout = (err as Error).name === "AbortError";
    return { ok: false, error: isTimeout ? "timeout" : "fetch-failed" };
  }
}
