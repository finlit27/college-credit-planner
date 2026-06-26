import { describe, it, expect, vi, beforeEach } from "vitest";

const { subscribeMock } = vi.hoisted(() => ({ subscribeMock: vi.fn() }));
vi.mock("@/lib/kit", () => ({ subscribeToKit: subscribeMock }));

import { POST } from "@/app/api/newsletter/route";

function makeReq(body: unknown): Request {
  return new Request("http://localhost/api/newsletter", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("POST /api/newsletter", () => {
  beforeEach(() => subscribeMock.mockReset());

  it("400 on invalid JSON", async () => {
    const res = await POST(makeReq("{not json"));
    expect(res.status).toBe(400);
  });

  it("400 on a missing/invalid email", async () => {
    const res = await POST(makeReq({ email: "nope" }));
    expect(res.status).toBe(400);
    const json = (await res.json()) as { ok: boolean; error: string };
    expect(json).toEqual({ ok: false, error: "invalid-email" });
    expect(subscribeMock).not.toHaveBeenCalled();
  });

  it("200 and forwards to Kit with the transfer-blueprint source on success", async () => {
    subscribeMock.mockResolvedValueOnce({ ok: true });
    const res = await POST(makeReq({ email: "parent@example.com", firstName: "Dana" }));
    expect(res.status).toBe(200);
    expect((await res.json())).toEqual({ ok: true });
    expect(subscribeMock).toHaveBeenCalledWith({
      email: "parent@example.com",
      firstName: "Dana",
      fields: { source: "transfer-blueprint" },
    });
  });

  it("503 when Kit is not configured", async () => {
    subscribeMock.mockResolvedValueOnce({ ok: false, error: "not-configured" });
    const res = await POST(makeReq({ email: "parent@example.com" }));
    expect(res.status).toBe(503);
  });

  it("502 on an upstream failure", async () => {
    subscribeMock.mockResolvedValueOnce({ ok: false, error: "upstream-failed" });
    const res = await POST(makeReq({ email: "parent@example.com" }));
    expect(res.status).toBe(502);
  });
});
