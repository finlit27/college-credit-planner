/**
 * Resolve Upstash REST credentials from the environment.
 *
 * Why this file exists. `Redis.fromEnv()` reads exactly two pairs:
 * `UPSTASH_REDIS_REST_URL`/`_TOKEN`, then `KV_REST_API_URL`/`_TOKEN`. The
 * Vercel Upstash integration, when given a custom variable prefix, does not
 * produce either. It PREPENDS the prefix to its own standard names, so a
 * prefix of `UPSTASH_REDIS_REST` yields `UPSTASH_REDIS_REST_KV_REST_API_URL`.
 * A correctly connected, healthy database was therefore invisible to the app,
 * and the client fell through to a stale bare pair still pointing at a
 * database that had been deleted for inactivity. Every plan submission 500'd.
 *
 * Resolution order, and the reason for it:
 *   1. The canonical pair. If someone sets it by hand, they mean it.
 *   2. Any PREFIXED `*_KV_REST_API_URL`/`*_KV_REST_API_TOKEN` pair, which is
 *      what a live integration connection looks like.
 *   3. The bare `KV_REST_API_*` pair, last, because in this project it is the
 *      leftover from the deleted database rather than the live one.
 *
 * Pairs resolve together, never field by field, so a half-configured
 * environment cannot pair one database's URL with another's token.
 */

export type RedisCredentials = {
  url: string;
  token: string;
  /** Which env var supplied the URL. Logged once so outages are diagnosable. */
  source: string;
};

const CANONICAL_URL = "UPSTASH_REDIS_REST_URL";
const CANONICAL_TOKEN = "UPSTASH_REDIS_REST_TOKEN";
const BARE_URL = "KV_REST_API_URL";
const BARE_TOKEN = "KV_REST_API_TOKEN";

/** Vercel writes an empty string for a variable defined with no value. */
function present(value: string | undefined): value is string {
  return typeof value === "string" && value.trim() !== "";
}

/** Integration-generated pairs: any prefix, ending in the standard KV names. */
function prefixedPairs(env: NodeJS.ProcessEnv): Array<[string, string]> {
  return Object.keys(env)
    .filter((key) => key.endsWith(BARE_URL) && key !== BARE_URL)
    .sort()
    .map((urlKey): [string, string] => [
      urlKey,
      `${urlKey.slice(0, -BARE_URL.length)}${BARE_TOKEN}`,
    ]);
}

export function resolveRedisCredentials(
  env: NodeJS.ProcessEnv = process.env,
): RedisCredentials {
  const candidates: Array<[string, string]> = [
    [CANONICAL_URL, CANONICAL_TOKEN],
    ...prefixedPairs(env),
    [BARE_URL, BARE_TOKEN],
  ];

  for (const [urlKey, tokenKey] of candidates) {
    const url = env[urlKey];
    const token = env[tokenKey];
    if (present(url) && present(token)) {
      return { url: url.trim(), token: token.trim(), source: urlKey };
    }
  }

  throw new Error(
    `No Upstash REST credentials found. Looked for ${CANONICAL_URL}/${CANONICAL_TOKEN}, ` +
      `any *_${BARE_URL}/*_${BARE_TOKEN} pair from a Vercel integration, then ${BARE_URL}/${BARE_TOKEN}.`,
  );
}
