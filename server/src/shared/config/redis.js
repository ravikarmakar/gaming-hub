import { Redis as UpstashRedis } from "@upstash/redis";
import { initializeNativeRedis, getNativeRedis } from "./nativeRedis.js";
import { logger } from "../utils/logger.js";
import dotenv from "dotenv";
dotenv.config();

// --- Upstash (HTTP) fallback ---
let upstashRedis = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  upstashRedis = new UpstashRedis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

// --- Try to initialize native Redis (ioredis) ---
initializeNativeRedis();

/**
 * Unified Redis wrapper.
 * Prefers native ioredis (~1ms) over Upstash HTTP (~50-100ms).
 * Exposes the same API used throughout the codebase:
 *   get, set (with {ex} options), del, expire, pipeline, flushall
 */
const createUnifiedRedis = () => {
  const native = () => getNativeRedis();

  return {
    /**
     * GET key
     */
    get: async (key) => {
      const n = native();
      if (n) return await n.get(key);
      if (upstashRedis) return await upstashRedis.get(key);
      throw new Error("No Redis client available");
    },

    /**
     * SET key value, with optional { ex: seconds }
     * Normalizes Upstash {ex} syntax → ioredis 'EX' syntax
     */
    set: async (key, value, options) => {
      const n = native();
      if (n) {
        if (options?.ex) {
          return await n.set(key, value, "EX", options.ex);
        }
        return await n.set(key, value);
      }
      if (upstashRedis) return await upstashRedis.set(key, value, options);
      throw new Error("No Redis client available");
    },

    /**
     * DEL key(s)
     */
    del: async (...keys) => {
      const n = native();
      if (n) return await n.del(...keys);
      if (upstashRedis) return await upstashRedis.del(...keys);
      throw new Error("No Redis client available");
    },

    /**
     * EXPIRE key seconds
     */
    expire: async (key, seconds) => {
      const n = native();
      if (n) return await n.expire(key, seconds);
      if (upstashRedis) return await upstashRedis.expire(key, seconds);
      throw new Error("No Redis client available");
    },

    /**
     * FLUSHALL 
     */
    flushall: async () => {
      const n = native();
      if (n) return await n.flushall();
      if (upstashRedis) return await upstashRedis.flushall();
      throw new Error("No Redis client available");
    },

    /**
     * Pipeline — wraps ioredis pipeline to match Upstash result format.
     * Upstash pipeline: p.incr(key); p.ttl(key); results = await p.exec() → [val1, val2]
     * ioredis pipeline: p.incr(key); p.ttl(key); results = await p.exec() → [[err, val1], [err, val2]]
     */
    pipeline: () => {
      const n = native();
      if (n) {
        const p = n.pipeline();
        const wrapper = {
          get: (key) => { p.get(key); return wrapper; },
          incr: (key) => { p.incr(key); return wrapper; },
          ttl: (key) => { p.ttl(key); return wrapper; },
          del: (key) => { p.del(key); return wrapper; },
          set: (key, value, ...args) => { p.set(key, value, ...args); return wrapper; },
          expire: (key, seconds) => { p.expire(key, seconds); return wrapper; },
          hget: (key, field) => { p.hget(key, field); return wrapper; },
          hset: (key, field, value) => { p.hset(key, field, value); return wrapper; },
          exists: (key) => { p.exists(key); return wrapper; },
          hexists: (key, field) => { p.hexists(key, field); return wrapper; },
          exec: async () => {
            const results = await p.exec();
            // Normalize: ioredis returns [[err, val], ...], Upstash returns [val, ...]
            return results.map(([err, val]) => {
              if (err) throw err;
              return val;
            });
          },
        };
        return wrapper;
      }

      if (upstashRedis) return upstashRedis.pipeline();
      throw new Error("No Redis client available");
    },
  };
};

export const redis = createUnifiedRedis();
