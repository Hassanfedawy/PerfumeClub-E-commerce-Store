import { LRUCache } from 'lru-cache';

const rateLimit = {
  tokenCache: new LRUCache({
    max: 500,
    ttl: 60 * 1000, // 1 minute
  }),

  check: (req, limit = 10, timeWindow = 60000) => {
    const token = req.headers.get('authorization') || req.ip;
    const tokenCount = (rateLimit.tokenCache.get(token) || [0, Date.now()])[0];
    const tokenTimestamp = (rateLimit.tokenCache.get(token) || [0, Date.now()])[1];

    if (Date.now() - tokenTimestamp > timeWindow) {
      // Reset if outside time window
      rateLimit.tokenCache.set(token, [1, Date.now()]);
      return {
        isLimited: false,
        limit,
        remaining: limit - 1,
        reset: Date.now() + timeWindow,
      };
    }

    if (tokenCount >= limit) {
      return {
        isLimited: true,
        limit,
        remaining: 0,
        reset: tokenTimestamp + timeWindow,
      };
    }

    rateLimit.tokenCache.set(token, [tokenCount + 1, tokenTimestamp]);
    return {
      isLimited: false,
      limit,
      remaining: limit - tokenCount - 1,
      reset: tokenTimestamp + timeWindow,
    };
  },
};
