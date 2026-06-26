// src/lib/kit.ts
//
// Thin client for Kit (ConvertKit) v3 forms-subscribe. Env-gated and
// soft-failing, mirroring src/app/api/narrative/route.ts: a missing key or a
// flaky upstream never throws, it returns a typed error the caller can handle.

export type KitResult =
  | { ok: true }
  | { ok: false; error: "not-configured" | "upstream-failed" | "timeout" | "fetch-failed" };

const TIMEOUT_MS = 5_000;

export async function subscribeToKit(input: {
  email: string;
  firstName?: string;
  fields?: Record<string, string>;
}): Promise<KitResult> {
  const apiKey = process.env.KIT_API_KEY;
  const formId = process.env.KIT_FORM_ID;
  if (!apiKey || !formId) return { ok: false, error: "not-configured" };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`https://api.convertkit.com/v3/forms/${formId}/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        email: input.email,
        first_name: input.firstName,
        fields: input.fields,
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) {
      console.error(`[kit] subscribe returned ${res.status}`);
      return { ok: false, error: "upstream-failed" };
    }
    return { ok: true };
  } catch (err) {
    clearTimeout(timer);
    const isTimeout = (err as Error).name === "AbortError";
    return { ok: false, error: isTimeout ? "timeout" : "fetch-failed" };
  }
}
