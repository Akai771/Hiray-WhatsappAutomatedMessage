import { redisConnection } from "../../config/redis";
import { env } from "../../config/env";

// Meta caps an unverified WhatsApp Business number to a fixed number of
// business-initiated sends per rolling 24h window (currently 250). Going
// over doesn't just fail the extra sends — it risks Meta throttling or
// restricting the number entirely — so this tracks real send timestamps in
// a Redis sorted set and gates every send through reserveSendSlot() before
// it's attempted, rather than letting the worker find out from Meta's own
// rejection after the fact.
const QUOTA_KEY = "whatsapp:send_log";
const WINDOW_MS = 24 * 60 * 60 * 1000;

// Atomic so concurrent workers reserving at the same instant can't both
// observe "count < limit" and both proceed — evicting expired entries,
// counting, and reserving all happen as one Redis-side step.
// KEYS[1] = sorted-set key
// ARGV[1] = now (ms)  ARGV[2] = window (ms)  ARGV[3] = limit  ARGV[4] = member id
// Returns [1, 0] on success (slot reserved), or [0, retryAtMs] when full —
// retryAtMs is when the oldest entry ages out of the window and a slot frees up.
const RESERVE_SCRIPT = `
local key = KEYS[1]
local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])
local member = ARGV[4]

redis.call('ZREMRANGEBYSCORE', key, '-inf', now - window)

local count = redis.call('ZCARD', key)
if count < limit then
  redis.call('ZADD', key, now, member)
  redis.call('PEXPIRE', key, window)
  return {1, 0}
end

local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
local retryAt = tonumber(oldest[2]) + window
return {0, retryAt}
`;

export interface QuotaReservation {
  reserved: boolean;
  /** epoch ms a slot should next free up — only set when reserved is false */
  retryAt?: number;
}

// memberId should be stable per logical send (the notification log id) so a
// job retried after a transient failure doesn't reserve a second slot for
// the same recipient.
export async function reserveSendSlot(memberId: string): Promise<QuotaReservation> {
  const now = Date.now();
  const [reserved, retryAt] = (await redisConnection.eval(
    RESERVE_SCRIPT,
    1,
    QUOTA_KEY,
    now,
    WINDOW_MS,
    env.WHATSAPP_DAILY_LIMIT,
    memberId,
  )) as [number, number];

  return reserved === 1 ? { reserved: true } : { reserved: false, retryAt };
}

// A reserved slot is only "real" once WhatsApp actually accepts the
// message — call this on send failure so a bad number/template doesn't
// quietly burn into the day's limit for nothing.
export async function releaseSendSlot(memberId: string): Promise<void> {
  await redisConnection.zrem(QUOTA_KEY, memberId);
}

export async function getQuotaUsage(): Promise<{ used: number; limit: number; windowMs: number }> {
  const now = Date.now();
  await redisConnection.zremrangebyscore(QUOTA_KEY, "-inf", now - WINDOW_MS);
  const used = await redisConnection.zcard(QUOTA_KEY);
  return { used, limit: env.WHATSAPP_DAILY_LIMIT, windowMs: WINDOW_MS };
}
