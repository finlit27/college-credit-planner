import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { subscribeToKit } from "@/lib/kit";

describe("subscribeToKit (Kit v4)", () => {
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

  it("creates the subscriber then adds them to the form, authed with X-Kit-Api-Key", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ subscriber: { id: 123 } }), { status: 201 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ subscriber: { id: 123 } }), { status: 200 }),
      );
    globalThis.fetch = fetchMock as typeof globalThis.fetch;

    const r = await subscribeToKit({ email: "a@b.com", firstName: "Sam" });
    expect(r).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);

    // Call 1: upsert the subscriber
    const [url1, init1] = fetchMock.mock.calls[0];
    expect(url1).toBe("https://api.kit.com/v4/subscribers");
    expect((init1 as RequestInit).headers).toMatchObject({ "X-Kit-Api-Key": "test-key" });
    const body1 = JSON.parse((init1 as RequestInit).body as string) as Record<string, unknown>;
    expect(body1).toMatchObject({ email_address: "a@b.com", first_name: "Sam" });

    // Call 2: add the returned subscriber id to the form
    const [url2, init2] = fetchMock.mock.calls[1];
    expect(url2).toBe("https://api.kit.com/v4/forms/999/subscribers/123");
    expect((init2 as RequestInit).headers).toMatchObject({ "X-Kit-Api-Key": "test-key" });
  });

  it("returns upstream-failed when create-subscriber is unauthorized (401)", async () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    globalThis.fetch = vi.fn(
      async () => new Response("unauthorized", { status: 401 }),
    ) as typeof globalThis.fetch;
    const r = await subscribeToKit({ email: "a@b.com" });
    expect(r).toEqual({ ok: false, error: "upstream-failed" });
    errSpy.mockRestore();
  });

  it("returns upstream-failed when the form-add step fails", async () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ subscriber: { id: 123 } }), { status: 201 }),
      )
      .mockResolvedValueOnce(new Response("nope", { status: 404 })) as typeof globalThis.fetch;
    const r = await subscribeToKit({ email: "a@b.com" });
    expect(r).toEqual({ ok: false, error: "upstream-failed" });
    errSpy.mockRestore();
  });
});
