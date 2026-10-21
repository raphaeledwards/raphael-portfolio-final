# Agent Readiness Plan — raphaeljedwards.com

**Goal:** Take the agent-readiness score from 47 → 90+ so an AI agent fetching the site with plain HTTP (no JavaScript) can answer "who is Raphael, what does he do, how do I reach him" from the HTML alone.

**Repo:** `raphaeledwards/raphael-portfolio-final` (React 18 + Vite 5 + Tailwind, Firebase, Gemini, deployed on Vercel as an SPA)

---

## Status (updated 2026-10-21)

**All 4 phases are merged to `main` and verified live on raphaeljedwards.com.** The plan as scoped is complete. What's left is entirely manual steps only Raphael can do — see below.

| Phase | Status | PR |
|---|---|---|
| 0 — Secrets cleanup | ✅ Done | [#1](https://github.com/raphaeledwards/raphael-portfolio-final/pull/1) |
| *(unplanned)* Hotfix — blank-page crash from a pre-existing missing `VITE_FIREBASE_API_KEY` env var | ✅ Done | [#2](https://github.com/raphaeledwards/raphael-portfolio-final/pull/2) |
| 1 — Static HTML per route | ✅ Done | [#3](https://github.com/raphaeledwards/raphael-portfolio-final/pull/3) |
| 2 — Markdown + real 404s + middleware | ✅ Done | [#4](https://github.com/raphaeledwards/raphael-portfolio-final/pull/4) |
| *(unplanned)* Full code review of Phases 0-2, 8 findings fixed | ✅ Done | [#5](https://github.com/raphaeledwards/raphael-portfolio-final/pull/5) |
| 3 — Trust pages + metadata | ✅ Done | [#6](https://github.com/raphaeledwards/raphael-portfolio-final/pull/6) |
| 4 — Sitemap + cleanup | ✅ Done | [#7](https://github.com/raphaeledwards/raphael-portfolio-final/pull/7) |

**Deviations from the plan as originally written** (why, inline in the phase sections below too):
- Phase 1 pulls structured data (education, certifications, recognition, achievements, contact) from new exports added to `portfolioData.js`, not by parsing `resumeContext.js`'s AI-prompt prose as the plan assumed — that file is a template string, not structured data, and parsing it felt riskier than adding a few new arrays. `resumeContext.js` itself was left untouched to avoid any risk to chat behavior.
- Phase 2's `vercel.json` fix ended up being "delete the catch-all rewrite entirely" rather than "rewrite only the SPA-only routes" — there turned out to be zero routes needing an SPA fallback (the admin panel is in-page state, not a URL).
- Phase 2's middleware API is `middleware.js` + `next()`/`Response` from the `@vercel/functions` package (current Vercel docs, checked 2026-10-21) — the familiar Next.js-style `export function middleware(request)` zero-dependency convention doesn't apply outside Next.js.
- Phase 3's og-image is generated at build time via `sharp` (new devDependency) compositing the real headshot with a branded card, not a hand-made static file. Live at [raphaeljedwards.com/og-image.png](https://raphaeljedwards.com/og-image.png).
- Phase 4's sitemap drops `changefreq` (Google has said for years it ignores this; `priority` was kept since it's still harmless/low-cost to include).

---

## Remaining manual steps (only Raphael can do these)

Nothing here blocks the site working as deployed today — it's live, static content is correct, and the hotfix (PR #2) keeps the page from crashing even with Firebase unconfigured. These close the remaining gaps.

### 1. ✅ Done (2026-10-21) — Fix the Vercel environment variables

Root cause confirmed and fixed. It was never deleted service accounts/APIs (the `raphael-portfolio-auth` Firebase/GCP project, its OAuth client, and its enabled APIs were all intact) — all six `VITE_FIREBASE_*` vars plus `VITE_ADMIN_EMAILS` were simply absent from Vercel's Production/Preview environments, which made `firebase.js`'s init throw and `auth` resolve to `null`, and then made the Admin Console's email allowlist reject every login even once auth itself started working.

- Added all 7 vars (`VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`, `VITE_ADMIN_EMAILS`) to Vercel as **Config** type, not Secret/Sensitive — Vite inlines `VITE_`-prefixed vars into the public bundle regardless, so Vercel itself warns against marking them Sensitive. Redeployed.
- Also added `raphaeljedwards.com` (bare apex, no `www`) to Firebase Authentication → Authorized domains — it was missing (only `www.raphaeljedwards.com` was listed). Not the root cause, but a real gap, now closed.
- **Confirmed working end-to-end:** Google sign-in, Admin Console unlock, Seed Database, and the AI Lab content rewrite (incl. the new Race Engineer entry) is live in Firestore.
- **Still unconfirmed:** whether `GEMINI_API_KEY` (no `VITE_` prefix, server-only) is actually set in Vercel, and whether the dead `VITE_GEMINI_API_KEY` was deleted — these weren't touched during this fix. Verify before assuming AI chat works end-to-end.

Full diagnostic trail: `FIREBASE_AUTH_RECOVERY.md` (repo root, local-only, not committed).

### 2. Confirm the Gemini API key is restricted

Google Cloud Console → APIs & Services → Credentials → the key used for `GEMINI_API_KEY` → confirm it's restricted to the Generative Language API only. This limits the blast radius if the key ever leaks again.

### 3. Confirm/fix the Firestore admin UID

`firestore.rules` in this repo still has the literal placeholder `'YOUR_ADMIN_UID_HERE'` for every admin-only write (seed database, clear chat logs, etc.):

```
match /{document=**} {
  allow write: if request.auth.uid == 'YOUR_ADMIN_UID_HERE';
}
```

- Firebase Console → Firestore Database → Rules: check whether the **deployed** rules already have your real UID substituted in (they may have been edited directly in the console, separately from this repo).
- If not: sign in to the site once, open the Admin Panel, copy your UID from there (displayed under "Authenticated User"), and replace the placeholder in both the Firebase Console rules editor and this repo's `firestore.rules`, then redeploy the rules (`firebase deploy --only firestore:rules` if you use the CLI, or paste directly into the console).
- **Update (2026-10-21):** Seed Database now succeeds against prod, which means the *deployed* console rules already allow the write for Raphael's UID — the admin-write path is functionally fine. What's still open is just repo hygiene: this repo's checked-in `firestore.rules` may still show the literal placeholder while the console has the real UID, which is confusing for anyone reading the repo as source of truth. Worth syncing the real UID into the repo file at some point, but it's not blocking anything.

### 4. Pick one canonical contact email

Pre-existing inconsistency, not introduced by this work:
- Live Contact section (`src/App.jsx`) and `portfolioData.js`'s `CONTACT_INFO.email` → `raphael@raphaeljedwards.com`
- Person JSON-LD (`index.html`) and the AI persona's contact line (`resumeContext.js`, via the `VITE_ADMIN_EMAILS` env var) → `raphaeledwards@gmail.com`

Decide which is the real one, then either update `CONTACT_INFO.email` in `portfolioData.js` + the JSON-LD in `index.html` to match, or update `VITE_ADMIN_EMAILS` in Vercel + the JSON-LD to match the other.

### 5. Set the `www` → apex redirect

Vercel → Project Settings → Domains. Right now `raphaeljedwards.com` (apex) redirects *to* `www.raphaeljedwards.com` — backwards from what this plan assumes. All canonicals, `sitemap.xml`, `llms.txt`, and JSON-LD use the apex domain (`https://raphaeljedwards.com`) as canonical, matching the plan's original diagnosis. Set `www` to redirect to apex (308) instead, or decide you actually want `www` as canonical and say so — if the latter, every generated URL across the site would need updating to match.

### 6. Optional: purge the dead `.env` blob from git history

Low priority — the Gemini key that was committed in `.env` was already rotated/dead before Phase 0. Pure hygiene: `git filter-repo --path .env --invert-paths` (or BFG Repo-Cleaner), then force-push and have anyone else with a local clone re-clone. Only worth doing if the exposure itself (not the dead key) bothers you.

---

## Diagnosis (why the score is 47)

| Scan failure | Root cause in the repo |
|---|---|
| Core content not available without JS | `index.html` ships an empty `<div id="root"></div>`. Every word of content lives in `src/data/portfolioData.js` and only appears after React runs. |
| 404s return 200 | `vercel.json` rewrites `/(.*)` → `/index.html`, so every bad URL returns the homepage with HTTP 200. |
| No Markdown negotiation | Nothing inspects the `Accept` header. |
| No /about, /contact, /privacy | The site is one page with scroll sections. `/about` is just the SPA shell. |
| Metadata incomplete | `canonical` and `og:image` are set by `react-helmet-async` (JS-only), so they're invisible to raw fetch. `og:image` is a stock Unsplash photo. |
| Sitemap is useless to agents | `sitemap.xml` lists `/#about`, `/#services`, etc. Hash fragments are never sent to the server, so all six URLs are the same empty shell. `lastmod` is 2024-01-01. |

What's already good, keep it: `robots.txt` (AI crawlers allowed), the Person JSON-LD in `index.html`. (`public/llms.txt` was good too, but is now regenerated from `portfolioData.js` at build time instead of hand-maintained — see Phase 2.)

---

## Phase 0 — Secrets cleanup (do this first, separate PR) ✅ Done (PR #1)

**Found while auditing:** `.env` is committed to the public repo. The `.gitignore` line meant to exclude it was written as UTF-16 (shows up as `. e n v`), which is the classic PowerShell `echo .env >> .gitignore` bug, so git never ignored it.

Separately, anything prefixed `VITE_` is compiled into the public JS bundle, so `VITE_GEMINI_API_KEY` is readable by anyone who opens DevTools on the live site, even after the repo is fixed.

1. Rewrite `.gitignore` as UTF-8 with a proper `.env` and `.env.*` entry (keep `!.env.example`).
2. `git rm --cached .env`. Add `.env.example` with placeholder values.
3. Move Gemini calls server-side: create `api/chat.js` and `api/embed.js` as Vercel serverless functions that read `GEMINI_API_KEY` (no `VITE_` prefix) from env. Update `ChatInterface.jsx`, `chatUtils.js`, `vectorUtils.js`, and `AdminPanel.jsx` to call `/api/*` instead of the SDK directly. Add basic abuse protection on `/api/chat` (input length cap; simple per-IP rate limit if feasible without new infra).
4. Verify `firestore.rules` enforces admin writes by authenticated email server-side. `VITE_ADMIN_EMAILS` only gates UI; it is not security.
5. Firebase web config (`VITE_FIREBASE_*`) is designed to be public. Leave it client-side.

**Status:** The key in the committed `.env` was already rotated (dead). This phase is cleanup plus closing the bundle exposure, so the *current* key doesn't leak the same way.

**Manual steps for Raphael (Claude Code cannot do these):**
- Confirm the current Gemini key is restricted to the Generative Language API in Google Cloud Console.
- Add `GEMINI_API_KEY` to Vercel Project Settings → Environment Variables; delete `VITE_GEMINI_API_KEY` there after the Phase 0 deploy is verified.
- Optional: purge `.env` from git history (`git filter-repo`). Low priority since the committed key is dead; mainly hygiene.

---

## Phase 1 — Static, crawlable HTML for every page (the big one) ✅ Done (PR #3)

**Approach:** Build-time static generation from `portfolioData.js`. No framework migration (no Next.js, no react-router rewrite). The React app stays exactly as it is for humans; agents get real HTML.

1. Create `scripts/prerender.js`, run as a `postbuild` step (`"postbuild": "node scripts/prerender.js"` in `package.json`).
2. It imports `src/data/portfolioData.js` and `src/data/resumeContext.js` (the single source of truth, so content never drifts) and, for each route below, writes `dist/<route>/index.html` by taking the built `dist/index.html` and injecting into `<div id="root">`:
   - semantic HTML: one `<h1>`, sequential `<h2>`/`<h3>`, `<main>`, `<article>`, `<nav>` with real `<a href>` links between pages
   - at least 500 characters of meaningful text per page
   - per-page `<title>`, `<meta name="description">`, `<link rel="canonical">`, `og:title`, `og:description`, `og:url`, `og:type`, `og:image`
   - `createRoot` replaces `#root` contents on load, so human visitors see no difference.
3. Routes to generate:
   - `/` — who Raphael is, what he does, who it's for, expertise summary, key achievements, links to every other page
   - `/about` — bio, leadership philosophy, recognition, education, credentials
   - `/services` — expertise areas from `EXPERTISE_AREAS` (the scan's agent tried `/services` and got nothing)
   - `/projects` — `PROJECT_ITEMS` and `AI_LAB_ITEMS`
   - `/blog` — index of all posts with title, date, tags, excerpt, link
   - `/blog/<slug>` — one page per `BLOG_POSTS` entry, full content, `og:type=article`, `Article` JSON-LD with `datePublished` and `author`
   - `/contact` — email, LinkedIn, GitHub, location (Boston, MA), what to contact him about, expected response
   - `/privacy` — see Phase 3
4. Generate slugs from titles (kebab-case, stable). Add a `slug` field to each blog post in `portfolioData.js` so URLs never change if a title is edited.
5. Make the SPA respect paths: on load, map `window.location.pathname` to the existing section scroll behavior (`/about` → scroll to about section, `/blog/<slug>` → open that post). Update in-app nav to use real paths with `history.pushState` instead of hash or scroll-only. Keep `#section` links working as a fallback.
6. Homepage `index.html` itself (`/`) must pass on its own: the scan checks the root URL.

---

## Phase 2 — Markdown for agents + real 404s ✅ Done (PR #4)

1. In `scripts/prerender.js`, also emit a Markdown twin for every route: `dist/index.md`, `dist/about.md`, `dist/blog/<slug>.md`, etc. Clean Markdown, `# H1` first, links absolute.
2. Also emit `dist/llms-full.txt` (all pages concatenated as Markdown). Regenerate `public/llms.txt` from data at build time so it stays current, and link `llms-full.txt` and each `.md` page from it.
3. Add `dist/404.html` (static, real content, links home + sitemap + llms.txt) and `dist/404.md`.
4. **Replace the catch-all rewrite in `vercel.json`.** Static files are served before rewrites, so prerendered routes resolve on their own. Only rewrite the SPA-only routes that have no static file (if any, e.g. admin). Unknown paths must fall through to `404.html` with status 404.
5. **Content negotiation** via Vercel Routing Middleware (`middleware.js` at repo root; works on non-Next.js projects; confirm current API in Vercel docs before writing it):
   - If `Accept` includes `text/markdown` and the path maps to a known route → respond with that route's `.md` file, `Content-Type: text/markdown; charset=utf-8`, `Vary: Accept`, status 200.
   - If `Accept` includes `text/markdown` and the path is unknown → respond with `404.md`, `Content-Type: text/markdown`, status 404.
   - Otherwise pass through to normal HTML. HTML responses must also carry `Vary: Accept` (set via `headers` in `vercel.json`).
   - Skip middleware for `/assets/*`, `/api/*`, images, and other static asset paths (use the `config.matcher`).
6. Add `<link rel="alternate" type="text/markdown" href="/about.md">` to each page's head.

---

## Phase 3 — Trust pages + metadata completeness ✅ Done (PR #6)

1. `/privacy` must be **accurate to what the code actually does**. Audit the codebase and describe, in plain English:
   - Google Analytics (there's a `VITE_FIREBASE_MEASUREMENT_ID`): what's collected
   - Reaction buttons: what's written to Firestore and whether it's tied to a user
   - AI chat: visitor messages are sent to Google Gemini for processing; whether conversations are stored
   - Firebase Auth: only for admin login
   - No selling of data, contact email for privacy requests, last-updated date
   Minimum 500 characters. Do not invent data practices; if unsure, flag it in the PR for Raphael to confirm.
2. `/about` and `/contact` each ≥ 500 chars of real content (pull from `ABOUT_ME`, `resumeContext.js`, and the JSON-LD).
3. Metadata in raw HTML on **every** generated page (not via Helmet): `<html lang="en">`, `<link rel="canonical">`, `og:image`, `og:type`, plus `twitter:card`.
4. Replace the Unsplash `og:image` with a real 1200×630 social card. Generate `public/og-image.png` at build time or commit a static one (headshot + name + title). Use an absolute URL.
5. Fix the favicon (currently `/vite.svg`).
6. Canonical host: keep **apex** (`https://raphaeljedwards.com`) to match existing JSON-LD and llms.txt. The scan hit `www.` — Raphael must set `www` → apex as a 308 redirect in Vercel → Domains (manual step). All canonicals, sitemap entries, and og:url use apex.
7. Expand the Person JSON-LD with `sameAs` (LinkedIn, GitHub), `worksFor` (Organization: Akamai Technologies), and an `@id`. Add `WebSite` JSON-LD on the homepage and `BreadcrumbList` on subpages.

---

## Phase 4 — Sitemap + cleanup ⏳ Next

1. Generate `dist/sitemap.xml` at build time from the route list: real paths only (no `#`), `lastmod` from the build date or the post date for blog posts. Delete the static `public/sitemap.xml`.
2. Keep `robots.txt`; update `Sitemap:` and `LLMs:` lines if paths change. Add `Disallow:` for any admin route.
3. Make sure the admin panel, login, and Firestore seeding still work exactly as before.

---

## Acceptance tests (run against the Vercel preview URL, then prod)

```bash
BASE=https://<preview-or-prod-domain>

# 1. Raw HTML has real content and a single H1
curl -sS $BASE/ | grep -c '<h1'                       # expect 1
curl -sS $BASE/ | sed 's/<[^>]*>//g' | tr -s ' \n' | wc -c   # expect well over 500

# 2. Trust pages exist with content
for p in about contact privacy services projects blog; do
  curl -sS -o /dev/null -w "$p %{http_code}\n" $BASE/$p      # expect 200
done

# 3. Markdown negotiation on homepage
curl -sS -L -i -H 'Accept: text/markdown' $BASE/ | head -20
#   expect: 200, Content-Type: text/markdown, Vary: Accept, body starts with "# "
curl -sS -L -i -H 'Accept: text/html' $BASE/ | head -20
#   expect: 200, Content-Type: text/html, Vary: Accept

# 4. Real 404 with Markdown body
curl -sS -L -i -H 'Accept: text/markdown' $BASE/some-path-that-does-not-exist
#   expect: 404, Content-Type: text/markdown, body mentions sitemap / llms.txt
curl -sS -o /dev/null -w "%{http_code}\n" $BASE/nope   # expect 404

# 5. Metadata in raw HTML
curl -sS $BASE/ | grep -E 'rel="canonical"|og:image|og:type|<html lang'

# 6. Sitemap has no hash URLs
curl -sS $BASE/sitemap.xml | grep -c '#'               # expect 0

# 7. No secrets in the bundle
curl -sS $BASE/ | grep -o 'assets/[^"]*\.js' | head -5 | while read f; do
  curl -sS $BASE/$f | grep -c 'AIza' ; done            # only the Firebase key should appear, never Gemini
```

Also: `npm run build` passes, `npm run preview` renders identically for a human, chat and reactions still work, Lighthouse SEO ≥ 95.

---

## Constraints for Claude Code

- `portfolioData.js` stays the single source of truth. No hand-duplicated content in HTML files.
- No framework migration. No new runtime dependencies unless clearly justified; dev dependencies for build scripts are fine.
- One branch + PR per phase. Phase 0 ships first and alone.
- Don't break the admin panel, Firestore seeding, embeddings, or "Index Source Code".
- Where a fact about Raphael or a data practice is uncertain, leave a `TODO(raphael):` and list it in the PR description rather than guessing.