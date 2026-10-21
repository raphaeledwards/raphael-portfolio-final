// Vercel Routing Middleware (file-convention: middleware.js at repo root,
// Node.js runtime by default). Serves a Markdown twin of a page when the
// request's Accept header prefers text/markdown, and a real 404 status with
// Markdown content for unknown paths under the same negotiation. Everything
// else passes through untouched - plain HTML requests never hit the fetches
// below.
//
// Docs checked 2026-10-21: https://vercel.com/docs/routing-middleware,
// https://vercel.com/docs/routing-middleware/js-reference
import { next } from '@vercel/functions';
import { mdPathFor } from './lib/mdPath.js';

export const config = {
    // Skip the two highest-traffic static prefixes outright; the in-function
    // dot-extension check below (runs on every other request) is what
    // actually excludes all static assets, including the .md files this
    // middleware itself fetches, which prevents re-triggering on them.
    matcher: ['/((?!api/|assets/).*)']
};

function wantsMarkdown(request) {
    const accept = request.headers.get('accept') || '';
    return accept.includes('text/markdown');
}

export default async function middleware(request) {
    const url = new URL(request.url);

    // Only negotiate on clean route paths (no extension) - anything with a
    // dot is a real static asset (.js, .css, .png, .md, .xml, ...) and must
    // never be intercepted, including the .md files fetched below.
    if (url.pathname.includes('.') || !wantsMarkdown(request)) {
        return next();
    }

    // Forward the inbound request's cookies and any Vercel protection-bypass
    // header so this same-origin self-fetch doesn't get challenged by
    // Deployment Protection on a protected (e.g. preview) deployment - it
    // otherwise has no auth context of its own and would silently return the
    // SSO interstitial page instead of the real file.
    const internalHeaders = {};
    const cookie = request.headers.get('cookie');
    const bypass = request.headers.get('x-vercel-protection-bypass');
    if (cookie) internalHeaders.cookie = cookie;
    if (bypass) internalHeaders['x-vercel-protection-bypass'] = bypass;

    const mdUrl = new URL(mdPathFor(url.pathname), url.origin);
    const mdResponse = await fetch(mdUrl, { headers: internalHeaders });

    if (mdResponse.ok) {
        const body = await mdResponse.text();
        return new Response(body, {
            status: 200,
            headers: {
                'Content-Type': 'text/markdown; charset=utf-8',
                'Vary': 'Accept'
            }
        });
    }

    const notFoundUrl = new URL('/404.md', url.origin);
    const notFoundResponse = await fetch(notFoundUrl, { headers: internalHeaders });
    const notFoundBody = notFoundResponse.ok ? await notFoundResponse.text() : '# Not Found\n';

    return new Response(notFoundBody, {
        status: 404,
        headers: {
            'Content-Type': 'text/markdown; charset=utf-8',
            'Vary': 'Accept'
        }
    });
}
