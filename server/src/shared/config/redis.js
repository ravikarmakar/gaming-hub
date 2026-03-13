import { initializeNativeRedis, getNativeRedis } from "./nativeRedis.js";
import { logger } from "../utils/logger.js";
import dotenv from "dotenv";
dotenv.config();

// --- Initialize native Redis (ioredis) ---
initializeNativeRedis();

/**
 * Unified Redis wrapper.
 * Uses native ioredis (~1ms).
 * Exposes the same API used throughout the codebase:
 *   get, set (with {ex} options), del, expire, pipeline, flushall, delByPrefix
 */
const createUnifiedRedis = () => {
  const getClient = () => {
    const n = getNativeRedis();
    if (!n) throw new Error("Native Redis client not available");
    return n;
  };

  return {
    /**
     * GET key
     */
    get: async (key) => {
      return await getClient().get(key);
    },

    /**
     * SET key value, with optional { ex: seconds }
     * Normalizes {ex} syntax → ioredis 'EX' syntax
     */
    set: async (key, value, options) => {
      const n = getClient();
      if (options?.ex) {
        return await n.set(key, value, "EX", options.ex);
      }
      return await n.set(key, value);
    },

    /**
     * DEL key(s)
     */
    del: async (...keys) => {
      return await getClient().del(...keys);
    },

    /**
     * EXPIRE key seconds
     */
    expire: async (key, seconds) => {
      return await getClient().expire(key, seconds);
    },

    /**
     * FLUSHALL 
     */
    flushall: async () => {
      return await getClient().flushall();
    },

    /**
     * DEL by prefix using SCAN
     */
    delByPrefix: async (prefix) => {
      const n = getClient();
      let cursor = "0";
      let deletedCount = 0;
      do {
        const [nextCursor, keys] = await n.scan(cursor, "MATCH", `${prefix}*`, "COUNT", 100);
        cursor = nextCursor;
        if (keys.length > 0) {
          deletedCount += await n.del(...keys);
        }
      } while (cursor !== "0");
      return deletedCount;
    },

    /**
     * Pipeline — wraps ioredis pipeline to maintain consistent result format.
     */
    pipeline: () => {
      const n = getClient();
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
          // Normalize: ioredis returns [[err, val], ...], we return [val, ...]
          return results.map(([err, val]) => {
            if (err) throw err;
            return val;
          });
        },
      };
      return wrapper;
    },
  };
};

export const redis = createUnifiedRedis();

