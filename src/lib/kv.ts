import { Redis } from "@upstash/redis";
import type { Plan, ShareRecord } from "@/lib/schema";
import { generateShareId } from "@/lib/nanoid";
import { resolveRedisCredentials } from "@/lib/redis-env";

const THIRTY_DAYS_SECONDS = 60 * 60 * 24 * 30;
const PLAN_KEY_PREFIX = "cc-plan:";

let _client: Redis | null = null;
function client(): Redis {
  if (_client) return _client;
  // Not Redis.fromEnv(): it reads only two fixed variable names, and the
  // Vercel Upstash integration generates neither when given a custom prefix.
  // See src/lib/redis-env.ts for the resolution order and the outage it fixes.
  const { url, token, source } = resolveRedisCredentials();
  console.log(`[kv] Upstash credentials resolved from ${source}`);
  _client = new Redis({ url, token });
  return _client;
}

/** Persist a plan and return a short share ID. */
export async function savePlan(plan: Plan): Promise<string> {
  const shareId = generateShareId();
  const record: ShareRecord = {
    shareId,
    plan,
    createdAt: new Date().toISOString(),
  };
  await client().set(`${PLAN_KEY_PREFIX}${shareId}`, record, {
    ex: THIRTY_DAYS_SECONDS,
  });
  return shareId;
}

/** Load a plan by share ID. Returns null if missing or expired. */
export async function loadPlan(shareId: string): Promise<ShareRecord | null> {
  const record = await client().get<ShareRecord>(
    `${PLAN_KEY_PREFIX}${shareId}`
  );
  return record ?? null;
}
