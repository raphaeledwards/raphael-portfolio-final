// Best-effort per-IP rate limiting using in-memory state.
// NOTE: Vercel serverless functions are stateless across cold starts and may run as
// multiple concurrent instances, so this is NOT a strict guarantee — it only raises
// the cost of casual abuse. A durable limiter would need shared storage (e.g. Vercel
// KV/Upstash), which is new infra intentionally out of scope for this phase.
const hits = new Map();

export function isRateLimited(key, { limit, windowMs }) {
    const now = Date.now();

    // Sweep expired entries on every call so `hits` doesn't grow unbounded for
    // the lifetime of a warm instance.
    for (const [k, v] of hits) {
        if (now - v.windowStart > windowMs) hits.delete(k);
    }

    const entry = hits.get(key);
    if (!entry) {
        hits.set(key, { windowStart: now, count: 1 });
        return false;
    }

    entry.count += 1;
    return entry.count > limit;
}

export function getClientIp(req) {
    // x-forwarded-for is a client-extendable chain ("client, proxy1, proxy2, ...").
    // Vercel appends the real client IP as the LAST hop; earlier entries can be
    // forged by the client itself, so taking the first entry would make this
    // trivially bypassable. x-real-ip, when present, is already a single
    // trustworthy value.
    const realIp = req.headers['x-real-ip'];
    if (realIp) return realIp;

    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
        const parts = forwarded.split(',').map(p => p.trim()).filter(Boolean);
        if (parts.length) return parts[parts.length - 1];
    }

    return req.socket?.remoteAddress || 'unknown';
}
