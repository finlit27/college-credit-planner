import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Hoisted mock for the @upstash/redis client so loadPlan() works in-process.
const setMock = vi.fn(async () => "OK");
const getMock = vi.fn();
vi.mock("@upstash/redis", () => ({
  Redis: {
    fromEnv: () => ({ set: setMock, get: getMock }),
  },
}));

import { GET } from "@/app/api/narrative/route";

function makeRequest(shareId: string | null): Request {
  const url = shareId
    ? `http://localhost/api/narrative?shareId=${shareId}`
    : "http://localhost/api/narrative";
  return new Request(url, { method: "GET" });
}

const SAMPLE_RECORD = {
  shareId: "AbCdEfGhIj",
  createdAt: "2026-05-10T00:00:00.000Z",
  plan: {
    student: { name: "Maria", grade: 10 },
    college: {
      name: "Pasadena City College",
      region_label: "LA East / San Gabriel Valley",
    },
    major_track: { label: "STEM" },
    target: { label: "CSU" },
  },
};

describe("GET /api/narrative", () => {
  const originalWebhook = process.env.N8N_NARRATIVE_WEBHOOK;
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    setMock.mockClear();
    getMock.mockClear();
    process.env.N8N_NARRATIVE_WEBHOOK = "https://n8n.example/cc-narrative";
  });

  afterEach(() => {
    process.env.N8N_NARRATIVE_WEBHOOK = originalWebhook;
    globalThis.fetch = originalFetch;
  });

  it("returns 400 for a missing shareId", async () => {
    const res = await GET(makeRequest(null));
    expect(res.status).toBe(400);
    const json = (await res.json()) as { paragraph: null; error: string };
    expect(json.paragraph).toBeNull();
    expect(json.error).toBe("invalid-shareId");
  });

  it("returns 400 for a malformed shareId", async () => {
    const res = await GET(makeRequest("not-valid-id"));
    expect(res.status).toBe(400);
  });

  it("returns 404 when the plan is not found in Upstash", async () => {
    getMock.mockResolvedValueOnce(null);
    const res = await GET(makeRequest("AbCdEfGhIj"));
    expect(res.status).toBe(404);
    const json = (await res.json()) as { paragraph: null; error: string };
    expect(json.error).toBe("not-found");
  });

  it("soft-fails with paragraph=null when webhook env var is missing", async () => {
    delete process.env.N8N_NARRATIVE_WEBHOOK;
    getMock.mockResolvedValueOnce(SAMPLE_RECORD);
    const res = await GET(makeRequest("AbCdEfGhIj"));
    expect(res.status).toBe(200);
    const json = (await res.json()) as { paragraph: null; error: string };
    expect(json.paragraph).toBeNull();
    expect(json.error).toBe("narrative-not-configured");
  });

  it("returns the paragraph from a successful n8n response", async () => {
    getMock.mockResolvedValueOnce(SAMPLE_RECORD);
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          paragraph: "Maria, the play here is straightforward.",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    globalThis.fetch = fetchMock as typeof globalThis.fetch;

    const res = await GET(makeRequest("AbCdEfGhIj"));
    expect(res.status).toBe(200);
    const json = (await res.json()) as { paragraph: string };
    expect(json.paragraph).toBe(
      "Maria, the play here is straightforward.",
    );
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://n8n.example/cc-narrative");
    const body = JSON.parse(
      (init as RequestInit).body as string,
    ) as Record<string, unknown>;
    expect(body).toMatchObject({
      name: "Maria",
      grade: 10,
      college: "Pasadena City College",
      target: "CSU",
    });
  });

  it("returns paragraph=null when n8n returns a non-200", async () => {
    getMock.mockResolvedValueOnce(SAMPLE_RECORD);
    globalThis.fetch = vi.fn(async () =>
      new Response("upstream error", { status: 502 }),
    ) as typeof globalThis.fetch;
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const res = await GET(makeRequest("AbCdEfGhIj"));
    expect(res.status).toBe(200);
    const json = (await res.json()) as { paragraph: null; error: string };
    expect(json.paragraph).toBeNull();
    expect(json.error).toBe("upstream-failed");
    errSpy.mockRestore();
  });

  it("returns paragraph=null when n8n returns empty/missing paragraph", async () => {
    getMock.mockResolvedValueOnce(SAMPLE_RECORD);
    globalThis.fetch = vi.fn(async () =>
      new Response(JSON.stringify({ paragraph: "" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    ) as typeof globalThis.fetch;

    const res = await GET(makeRequest("AbCdEfGhIj"));
    expect(res.status).toBe(200);
    const json = (await res.json()) as { paragraph: null };
    expect(json.paragraph).toBeNull();
  });

  it("returns paragraph=null on Upstash failure", async () => {
    getMock.mockRejectedValueOnce(new Error("Upstash down"));
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const res = await GET(makeRequest("AbCdEfGhIj"));
    expect(res.status).toBe(200);
    const json = (await res.json()) as { paragraph: null; error: string };
    expect(json.paragraph).toBeNull();
    expect(json.error).toBe("kv-failed");
    errSpy.mockRestore();
  });
});
