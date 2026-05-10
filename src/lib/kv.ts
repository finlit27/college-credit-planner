import { Redis } from "@upstash/redis";
import type { Plan, ShareRecord } from "@/lib/schema";
import { generateShareId } from "@/lib/nanoid";

const THIRTY_DAYS_SECONDS = 60 * 60 * 24 * 30;
const PLAN_KEY_PREFIX = "cc-plan:";

let _client: Redis | null = null;
function client(): Redis {
  if (_client) return _client;
  // Upstash Vercel integration auto-sets KV_REST_API_URL + KV_REST_API_TOKEN
  // (or UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN).
  _client = Redis.fromEnv();
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
