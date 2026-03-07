/**
 * lib/rateLimiter.js
 * Simple in-memory per-IP rate limiter for Vercel serverless functions.
 * Uses a global Map so it persists across warm invocations within the same instance.
 *
 * Note: Because serverless can spin up multiple instances, this is a "best-effort"
 * rate limiter. For strict limits, use an external store (Upstash Redis).
 */

// Global store — survives warm re-invocations
let store = global._rateLimitStore;
if (!store) {
    store = global._rateLimitStore = new Map();
}

/**
 * Creates a rate limiter instance.
 * @param {number} maxRequests  - Max allowed requests per window
 * @param {number} windowMs     - Window size in milliseconds
 */
function createLimiter(maxRequests, windowMs) {
    return {
        /**
         * Checks if the IP is within the rate limit.
         * @param {string} ip
         * @returns {{ allowed: boolean, retryAfter: number }}
         */
        check(ip) {
            const key = `${maxRequests}:${windowMs}:${ip}`;
            const now = Date.now();
            const record = store.get(key);

            if (!record || now > record.resetAt) {
                // Start a fresh window
                store.set(key, { count: 1, resetAt: now + windowMs });
                return { allowed: true, retryAfter: 0 };
            }

            if (record.count >= maxRequests) {
                const retryAfter = Math.ceil((record.resetAt - now) / 1000);
                return { allowed: false, retryAfter };
            }

            record.count += 1;
            return { allowed: true, retryAfter: 0 };
        },
    };
}

// Pre-built limiters for each route
const leadLimiter = createLimiter(5, 15 * 60 * 1000);   // 5 req / 15 min
const chatLimiter = createLimiter(10, 10 * 60 * 1000);  // 10 req / 10 min

module.exports = { createLimiter, leadLimiter, chatLimiter };
