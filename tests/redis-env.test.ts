import { describe, it, expect } from "vitest";
import { resolveRedisCredentials } from "@/lib/redis-env";

const CANONICAL = {
  UPSTASH_REDIS_REST_URL: "https://canonical.upstash.io",
  UPSTASH_REDIS_REST_TOKEN: "token-canonical",
};

// What the Vercel Upstash integration actually created on 2026-08-19 when the
// connect dialog was given a custom prefix of UPSTASH_REDIS_REST.
const PREFIXED = {
  UPSTASH_REDIS_REST_KV_REST_API_URL: "https://prefixed.upstash.io",
  UPSTASH_REDIS_REST_KV_REST_API_TOKEN: "token-prefixed",
  UPSTASH_REDIS_REST_KV_URL: "rediss://prefixed.upstash.io:6379",
  UPSTASH_REDIS_REST_KV_REST_API_READ_ONLY_TOKEN: "token-readonly",
};

// The stale pair left over from the database that was deleted for inactivity.
const LEGACY = {
  KV_REST_API_URL: "https://warm-vulture-154350.upstash.io",
  KV_REST_API_TOKEN: "token-legacy",
};

describe("resolveRedisCredentials", () => {
  it("prefers the canonical pair over everything else", () => {
    const got = resolveRedisCredentials({ ...LEGACY, ...PREFIXED, ...CANONICAL });
    expect(got.url).toBe("https://canonical.upstash.io");
    expect(got.token).toBe("token-canonical");
  });

  it("uses the integration's prefixed pair when the canonical pair is absent", () => {
    const got = resolveRedisCredentials({ ...LEGACY, ...PREFIXED });
    expect(got.url).toBe("https://prefixed.upstash.io");
    expect(got.token).toBe("token-prefixed");
  });

  it("prefers ANY prefixed pair over the bare legacy pair, whatever the prefix", () => {
    // Guards the real failure mode: the exact generated name was read off a
    // truncated dashboard label. If the prefix differs, resolution must still
    // avoid the stale bare pair rather than silently dialing a dead database.
    const got = resolveRedisCredentials({
      ...LEGACY,
      STORAGE_KV_REST_API_URL: "https://surprise.upstash.io",
      STORAGE_KV_REST_API_TOKEN: "token-surprise",
    });
    expect(got.url).toBe("https://surprise.upstash.io");
    expect(got.token).toBe("token-surprise");
  });

  it("falls back to the bare legacy pair when nothing else is set", () => {
    const got = resolveRedisCredentials({ ...LEGACY });
    expect(got.url).toBe("https://warm-vulture-154350.upstash.io");
    expect(got.token).toBe("token-legacy");
  });

  it("never mixes a URL from one pair with a token from another", () => {
    // Half-configured: canonical URL present, canonical token missing.
    const got = resolveRedisCredentials({
      UPSTASH_REDIS_REST_URL: "https://canonical.upstash.io",
      ...PREFIXED,
    });
    expect(got.url).toBe("https://prefixed.upstash.io");
    expect(got.token).toBe("token-prefixed");
  });

  it("ignores empty-string values, which Vercel produces for a blank field", () => {
    const got = resolveRedisCredentials({
      UPSTASH_REDIS_REST_URL: "",
      UPSTASH_REDIS_REST_TOKEN: "",
      ...PREFIXED,
    });
    expect(got.url).toBe("https://prefixed.upstash.io");
  });

  it("never resolves to a non-REST connection string", () => {
    const got = resolveRedisCredentials({ ...PREFIXED });
    expect(got.url.startsWith("https://")).toBe(true);
  });

  it("throws naming the variables it looked for when none are set", () => {
    expect(() => resolveRedisCredentials({})).toThrow(/UPSTASH_REDIS_REST_URL/);
  });

  it("reports which source won, so an outage is diagnosable from the logs", () => {
    expect(resolveRedisCredentials({ ...CANONICAL }).source).toBe(
      "UPSTASH_REDIS_REST_URL",
    );
    expect(resolveRedisCredentials({ ...PREFIXED }).source).toBe(
      "UPSTASH_REDIS_REST_KV_REST_API_URL",
    );
  });
});
