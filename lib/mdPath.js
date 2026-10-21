// Shared by middleware.js and scripts/prerender.js. Both need the exact same
// route-path <-> markdown-file-path mapping, or middleware's lookup for a
// route's Markdown twin silently 404s even when the file exists.
export function mdPathFor(routePath) {
    const clean = routePath.replace(/\/+$/, '') || '/';
    return clean === '/' ? '/index.md' : `${clean}.md`;
}
