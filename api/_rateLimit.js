// Best-effort per-IP rate limiting using in-memory state.
// NOTE: Vercel serverless functions are stateless across cold starts and may run as
// multiple concurrent instances, so this is NOT a strict guarantee — it only raises
// the cost of casual abuse. A durable limiter would need shared storage (e.g. Vercel
// KV/Upstash), which is new infra intentionally out of scope for this phase.
const hits = new Map();

export function isRateLimited(key, { limit, windowMs }) {
    const now = Date.now();
    const entry = hits.get(key);

    if (!entry || now - entry.windowStart > windowMs) {
        hits.set(key, { windowStart: now, count: 1 });
        return false;
    }

    entry.count += 1;
    return entry.count > limit;
}

export function getClientIp(req) {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) return forwarded.split(',')[0].trim();
    return req.socket?.remoteAddress || 'unknown';
}
