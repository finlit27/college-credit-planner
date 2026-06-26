import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { subscribeToKit } from "@/lib/kit";

describe("subscribeToKit", () => {
  const origKey = process.env.KIT_API_KEY;
  const origForm = process.env.KIT_FORM_ID;
  const origFetch = globalThis.fetch;

  beforeEach(() => {
    process.env.KIT_API_KEY = "test-key";
    process.env.KIT_FORM_ID = "999";
  });
  afterEach(() => {
    process.env.KIT_API_KEY = origKey;
    process.env.KIT_FORM_ID = origForm;
    globalThis.fetch = origFetch;
  });

  it("returns not-configured when env vars are missing", async () => {
    delete process.env.KIT_API_KEY;
    const r = await subscribeToKit({ email: "a@b.com" });
    expect(r).toEqual({ ok: false, error: "not-configured" });
  });

  it("posts to the Kit v3 form-subscribe endpoint and returns ok on 200", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ subscription: { id: 1 } }), { status: 200 }),
    );
    globalThis.fetch = fetchMock as typeof globalThis.fetch;
    const r = await subscribeToKit({ email: "a@b.com", firstName: "Sam", fields: { source: "transfer-blueprint" } });
    expect(r).toEqual({ ok: true });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.convertkit.com/v3/forms/999/subscribe");
    const body = JSON.parse((init as RequestInit).body as string) as Record<string, unknown>;
    expect(body).toMatchObject({ api_key: "test-key", email: "a@b.com", first_name: "Sam", fields: { source: "transfer-blueprint" } });
  });

  it("returns upstream-failed on a non-200", async () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    globalThis.fetch = vi.fn(async () => new Response("nope", { status: 422 })) as typeof globalThis.fetch;
    const r = await subscribeToKit({ email: "a@b.com" });
    expect(r).toEqual({ ok: false, error: "upstream-failed" });
    errSpy.mockRestore();
  });
});
