import { describe, it, expect, vi, beforeEach } from "vitest";

// Hoisted mock for the @upstash/redis client used inside src/lib/kv.ts.
// `set` is a vi.fn we can assert against; `Redis.fromEnv()` returns it.
const setMock = vi.fn(async () => "OK");
const getMock = vi.fn(async () => null);
vi.mock("@upstash/redis", () => ({
  Redis: {
    fromEnv: () => ({ set: setMock, get: getMock }),
  },
}));

import { POST } from "@/app/api/plan/route";
import type { Intake } from "@/lib/schema";

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

const VALID_INPERSON: Intake = {
  name: "Maria",
  grade: 10,
  gpa: 3.2,
  onlineOnly: false,
  regionId: "3",
  major: "stem",
  target: "uc",
};

const VALID_ONLINE: Intake = {
  name: "Sam",
  grade: 11,
  gpa: 2.7,
  onlineOnly: true,
  major: "undecided",
  target: "csu",
};

describe("POST /api/plan", () => {
  beforeEach(() => {
    setMock.mockClear();
    getMock.mockClear();
    setMock.mockResolvedValue("OK");
  });

  it("returns a 10-char shareId for a valid in-person intake", async () => {
    const res = await POST(makeRequest(VALID_INPERSON));
    expect(res.status).toBe(200);
    const json = (await res.json()) as { shareId: string };
    expect(json.shareId).toMatch(/^[A-Za-z0-9_-]{10}$/);
  });

  it("returns a shareId for a valid online-only intake (no regionId)", async () => {
    const res = await POST(makeRequest(VALID_ONLINE));
    expect(res.status).toBe(200);
    const json = (await res.json()) as { shareId: string };
    expect(json.shareId).toHaveLength(10);
  });

  it("persists a ShareRecord to Upstash with a 30-day TTL", async () => {
    await POST(makeRequest(VALID_INPERSON));
    expect(setMock).toHaveBeenCalledOnce();
    const [key, value, options] = setMock.mock.calls[0];
    expect(typeof key).toBe("string");
    expect(key).toMatch(/^cc-plan:[A-Za-z0-9_-]{10}$/);
    expect(value).toMatchObject({
      shareId: expect.any(String),
      createdAt: expect.any(String),
      plan: expect.objectContaining({
        schema_version: 1,
        student: expect.objectContaining({ name: "Maria", grade: 10 }),
      }),
    });
    expect(options).toEqual({ ex: 60 * 60 * 24 * 30 });
  });

  it("uses the shareId from the response as the Upstash key suffix", async () => {
    const res = await POST(makeRequest(VALID_INPERSON));
    const { shareId } = (await res.json()) as { shareId: string };
    const [key, value] = setMock.mock.calls[0];
    expect(key).toBe(`cc-plan:${shareId}`);
    expect((value as { shareId: string }).shareId).toBe(shareId);
  });

  it("returns 400 with Zod issues for an invalid intake", async () => {
    const res = await POST(makeRequest({ name: "", grade: 10 }));
    expect(res.status).toBe(400);
    const json = (await res.json()) as {
      error: string;
      issues: unknown[];
    };
    expect(json.error).toBe("Invalid intake");
    expect(Array.isArray(json.issues)).toBe(true);
    expect(json.issues.length).toBeGreaterThan(0);
    expect(setMock).not.toHaveBeenCalled();
  });

  it("returns 400 for an in-person intake missing regionId", async () => {
    const { regionId: _ignored, ...rest } = VALID_INPERSON;
    void _ignored;
    const res = await POST(makeRequest({ ...rest, onlineOnly: false }));
    expect(res.status).toBe(400);
    expect(setMock).not.toHaveBeenCalled();
  });

  it("returns 400 for an unparseable body", async () => {
    const res = await POST(makeRequest("not-json"));
    expect(res.status).toBe(400);
    expect(setMock).not.toHaveBeenCalled();
  });

  it("returns 500 when Upstash save fails", async () => {
    setMock.mockRejectedValueOnce(new Error("Upstash down"));
    // silence console.error noise in test output
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await POST(makeRequest(VALID_INPERSON));
    expect(res.status).toBe(500);
    const json = (await res.json()) as { error: string };
    expect(json.error).toMatch(/try again/i);
    errSpy.mockRestore();
  });

  it("generates the same plan shape that generatePlan() produces", async () => {
    await POST(makeRequest(VALID_INPERSON));
    const value = setMock.mock.calls[0][1] as {
      plan: {
        student: { name: string };
        college: { region_label: string | null };
        major_track: { key: string };
      };
    };
    expect(value.plan.student.name).toBe("Maria");
    expect(value.plan.college.region_label).not.toBeNull(); // in-person
    expect(value.plan.major_track.key).toBe("stem");
  });
});
