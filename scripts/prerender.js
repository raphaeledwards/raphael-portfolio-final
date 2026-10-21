// Generates static, crawlable HTML for every route from the data in
// src/data/portfolioData.js (the single source of truth — nothing here is
// hand-duplicated content). Runs as a postbuild step, after `vite build` has
// already produced dist/index.html with the real hashed asset tags; this
// script takes that file as a template and clones it per route with
// route-specific content and metadata injected in.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
    PROJECT_ITEMS,
    EXPERTISE_AREAS,
    BLOG_POSTS,
    AI_LAB_ITEMS,
    ABOUT_ME,
    EDUCATION,
    CERTIFICATIONS,
    RECOGNITION,
    KEY_ACHIEVEMENTS,
    CONTACT_INFO
} from '../src/data/portfolioData.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, '../dist');
const SITE_URL = 'https://raphaeljedwards.com';
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop';
const BUILD_DATE = new Date().toISOString().slice(0, 10);

const shellTemplate = fs.readFileSync(path.join(DIST, 'index.html'), 'utf-8');

const esc = (str = '') => String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const paragraphs = (text = '') => text
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => `<p>${esc(p)}</p>`)
    .join('\n');

const NAV_ITEMS = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/services', label: 'Services' },
    { href: '/projects', label: 'Projects' },
    { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Contact' }
];

function renderNav(currentPath) {
    const items = NAV_ITEMS.map(item => {
        const current = item.href === currentPath ? ' aria-current="page"' : '';
        return `<li><a href="${item.href}"${current}>${esc(item.label)}</a></li>`;
    }).join('\n            ');
    return `<nav aria-label="Primary">
        <ul>
            ${items}
        </ul>
    </nav>`;
}

function renderFooter() {
    return `<footer>
        <p>&copy; ${new Date().getFullYear()} Raphael J. Edwards. <a href="/privacy">Privacy Policy</a></p>
    </footer>`;
}

function wrapPage(currentPath, mainHtml) {
    return `<header>${renderNav(currentPath)}</header>
    <main>
${mainHtml}
    </main>
    ${renderFooter()}`;
}

// --- Head metadata injection -------------------------------------------------

function injectHead(html, { title, description, canonicalPath, ogType = 'website', extraHead = '' }) {
    const canonicalUrl = `${SITE_URL}${canonicalPath}`;
    let out = html;

    out = out.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);
    out = out.replace(
        /<meta name="description" content="[^"]*"\s*\/>/,
        `<meta name="description" content="${esc(description)}" />`
    );
    out = out.replace(
        /<meta property="og:type" content="[^"]*"\s*\/>/,
        `<meta property="og:type" content="${esc(ogType)}" />`
    );
    out = out.replace(
        /<meta property="og:url" content="[^"]*"\s*\/>/,
        `<meta property="og:url" content="${esc(canonicalUrl)}" />`
    );
    out = out.replace(
        /<meta property="og:title" content="[^"]*"\s*\/>/,
        `<meta property="og:title" content="${esc(title)}" />`
    );
    out = out.replace(
        /<meta property="og:description" content="[^"]*"\s*\/>/,
        `<meta property="og:description" content="${esc(description)}" />`
    );
    out = out.replace(
        /<meta property="og:image" content="[^"]*"\s*\/>/,
        `<meta property="og:image" content="${esc(DEFAULT_IMAGE)}" />`
    );

    const headInject = `    <link rel="canonical" href="${canonicalUrl}" />\n${extraHead}  </head>`;
    out = out.replace(/\s*<\/head>/, `\n${headInject}`);

    return out;
}

function injectBody(html, bodyHtml) {
    return html.replace('<div id="root"></div>', `<div id="root">${bodyHtml}</div>`);
}

function writeRoute(routePath, { title, description, ogType, extraHead, bodyHtml }) {
    const html = injectBody(
        injectHead(shellTemplate, { title, description, canonicalPath: routePath, ogType, extraHead }),
        wrapPage(routePath, bodyHtml)
    );

    const outPath = routePath === '/'
        ? path.join(DIST, 'index.html')
        : path.join(DIST, routePath.slice(1), 'index.html');

    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, html);
    console.log(`  ✓ ${routePath} -> ${path.relative(DIST, outPath)}`);
}

// --- Route content builders ---------------------------------------------------

function homePage() {
    const title = 'Raphael J. Edwards | Technology Executive & Services Architect';
    const description = 'Portfolio of Raphael J. Edwards, a Boston-based Technology Executive and Services Architect specializing in building resilient teams and solving complex problems.';

    const body = `
        <h1>Raphael J. Edwards — Technology Executive &amp; AI Practitioner</h1>
        <p>${esc(ABOUT_ME.bio)}</p>

        <section aria-labelledby="who-for">
            <h2 id="who-for">Who This Is For</h2>
            <p>Organizations and teams navigating cloud migration, Zero Trust security transformation, and the shift to AI-augmented engineering — and anyone evaluating whether a technology executive actually builds, not just manages.</p>
        </section>

        <section aria-labelledby="expertise">
            <h2 id="expertise">Expertise</h2>
            <ul>
                ${EXPERTISE_AREAS.map(area => `<li><strong>${esc(area.title)}</strong> — ${esc(area.description)}</li>`).join('\n                ')}
            </ul>
        </section>

        <section aria-labelledby="achievements">
            <h2 id="achievements">Key Achievements</h2>
            <ul>
                ${KEY_ACHIEVEMENTS.slice(0, 5).map(a => `<li>${esc(a)}</li>`).join('\n                ')}
            </ul>
        </section>

        <section aria-labelledby="explore">
            <h2 id="explore">Explore</h2>
            <ul>
                <li><a href="/about">About Raphael — bio, leadership philosophy, education, credentials</a></li>
                <li><a href="/services">Services &amp; Expertise</a></li>
                <li><a href="/projects">Featured Projects &amp; AI Lab</a></li>
                <li><a href="/blog">Blog — insights on leadership, security, and AI systems</a></li>
                <li><a href="/contact">Contact</a></li>
            </ul>
        </section>`;

    writeRoute('/', { title, description, ogType: 'website', bodyHtml: body });
}

function aboutPage() {
    const title = 'About Raphael J. Edwards';
    const description = `${ABOUT_ME.role} based in ${ABOUT_ME.location}. Bio, leadership philosophy, education, and credentials.`;

    const body = `
        <h1>About Raphael J. Edwards</h1>
        <p>${esc(ABOUT_ME.role)} · ${esc(ABOUT_ME.location)}</p>
        <p>${esc(ABOUT_ME.bio)}</p>

        <section aria-labelledby="philosophy">
            <h2 id="philosophy">Leadership Philosophy</h2>
            <p>${esc(ABOUT_ME.leadershipPhilosophy)}</p>
        </section>

        <section aria-labelledby="technical">
            <h2 id="technical">Technical Background</h2>
            <p>${esc(ABOUT_ME.technicalBackground)}</p>
        </section>

        <section aria-labelledby="education">
            <h2 id="education">Education</h2>
            <ul>
                ${EDUCATION.map(e => `<li>${esc(e.institution)} — ${esc(e.credential)} (${esc(e.period)})</li>`).join('\n                ')}
            </ul>
        </section>

        <section aria-labelledby="certifications">
            <h2 id="certifications">Certifications</h2>
            <ul>
                ${CERTIFICATIONS.map(c => `<li>${esc(c.name)} (${esc(c.period)})</li>`).join('\n                ')}
            </ul>
        </section>

        <section aria-labelledby="recognition">
            <h2 id="recognition">Recognition</h2>
            <ul>
                ${RECOGNITION.map(r => `<li>${esc(r.name)}, ${esc(r.year)}${r.note ? ` — ${esc(r.note)}` : ''}</li>`).join('\n                ')}
            </ul>
        </section>`;

    writeRoute('/about', { title, description, ogType: 'profile', bodyHtml: body });
}

function servicesPage() {
    const title = 'Services & Expertise | Raphael J. Edwards';
    const description = 'Team strategy, cybersecurity, cloud architecture, and AI systems design — the core expertise areas Raphael J. Edwards works in.';

    const body = `
        <h1>Services &amp; Expertise</h1>
        ${EXPERTISE_AREAS.map(area => `<article>
            <h2>${esc(area.title)}</h2>
            <p>${esc(area.description)}</p>
        </article>`).join('\n        ')}`;

    writeRoute('/services', { title, description, bodyHtml: body });
}

function projectsPage() {
    const title = 'Featured Projects | Raphael J. Edwards';
    const description = 'Career impact projects and independent AI Lab builds — connected vehicle architecture, financial-sector security, revenue programs, and self-hosted AI agent systems.';

    const body = `
        <h1>Featured Projects</h1>

        <section aria-labelledby="career-impact">
            <h2 id="career-impact">Career Impact</h2>
            ${PROJECT_ITEMS.map(p => `<article>
                <h3>${esc(p.title)}</h3>
                <p><em>${esc(p.category)}</em></p>
                <p>${esc(p.description)}</p>
            </article>`).join('\n            ')}
        </section>

        <section aria-labelledby="ai-lab">
            <h2 id="ai-lab">AI Lab — Personal Builds</h2>
            <p>Personal AI systems built independently — proof of hands-on fluency with the stack, not just leadership over it.</p>
            ${AI_LAB_ITEMS.map(p => `<article>
                <h3>${esc(p.title)}</h3>
                <p><em>${esc(p.category)}${p.built ? ` · ${esc(p.built)}` : ''}</em></p>
                <p>${esc(p.description)}</p>
                <p>Stack: ${p.tags.map(esc).join(', ')}</p>
            </article>`).join('\n            ')}
        </section>`;

    writeRoute('/projects', { title, description, bodyHtml: body });
}

function blogIndexPage() {
    const title = 'Blog | Raphael J. Edwards';
    const description = 'Insights on engineering leadership, Zero Trust security, cloud FinOps, and building AI agent systems.';

    const sorted = [...BLOG_POSTS].sort((a, b) => new Date(b.date) - new Date(a.date));

    const body = `
        <h1>Insights &amp; Blog</h1>
        <ul>
            ${sorted.map(post => `<li>
                <article>
                    <h2><a href="/blog/${post.slug}">${esc(post.title)}</a></h2>
                    <p><time>${esc(post.date)}</time> · ${post.tags.map(esc).join(', ')}</p>
                    <p>${esc(post.excerpt)}</p>
                </article>
            </li>`).join('\n            ')}
        </ul>`;

    writeRoute('/blog', { title, description, bodyHtml: body });
}

function blogPostPage(post) {
    const title = `${post.title} | Raphael J. Edwards`;
    const description = post.excerpt;
    const isoDate = new Date(post.date).toISOString();

    const articleJsonLd = `    <script type="application/ld+json">
    ${JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.excerpt,
        datePublished: isoDate,
        author: { '@type': 'Person', name: 'Raphael J. Edwards', url: SITE_URL },
        publisher: { '@type': 'Person', name: 'Raphael J. Edwards' },
        mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`
    }, null, 2)}
    </script>
`;

    const body = `
        <article>
            <h1>${esc(post.title)}</h1>
            <p><time datetime="${isoDate}">${esc(post.date)}</time> · ${post.tags.map(esc).join(', ')}</p>
            ${paragraphs(post.content)}
        </article>
        <p><a href="/blog">&larr; Back to all posts</a></p>`;

    writeRoute(`/blog/${post.slug}`, { title, description, ogType: 'article', extraHead: articleJsonLd, bodyHtml: body });
}

function contactPage() {
    const title = 'Contact | Raphael J. Edwards';
    const description = `Get in touch with Raphael J. Edwards for ${CONTACT_INFO.availableFor.join(', ').toLowerCase()}.`;

    const body = `
        <h1>Contact</h1>
        <p>Based in ${esc(CONTACT_INFO.location)}. Available for ${CONTACT_INFO.availableFor.map(esc).join(', ')}.</p>
        <ul>
            <li>Email: <a href="mailto:${esc(CONTACT_INFO.email)}">${esc(CONTACT_INFO.email)}</a></li>
            <li>LinkedIn: <a href="${esc(CONTACT_INFO.linkedin)}">${esc(CONTACT_INFO.linkedin)}</a></li>
            <li>GitHub: <a href="${esc(CONTACT_INFO.github)}">${esc(CONTACT_INFO.github)}</a></li>
        </ul>
        <p>I personally read and respond to every message sent to the email above.</p>`;

    writeRoute('/contact', { title, description, bodyHtml: body });
}

function privacyPage() {
    const title = 'Privacy Policy | Raphael J. Edwards';
    const description = 'How raphaeljedwards.com handles analytics, the AI chat feature, reactions, and visitor data.';

    const body = `
        <h1>Privacy Policy</h1>
        <p>Last updated: ${BUILD_DATE}</p>

        <section aria-labelledby="analytics">
            <h2 id="analytics">Analytics</h2>
            <p>This site uses Firebase Analytics (built on Google Analytics) to understand aggregate traffic patterns such as page views and session counts. No custom event tracking is implemented beyond Firebase's automatic page-view collection.</p>
        </section>

        <section aria-labelledby="reactions">
            <h2 id="reactions">Reaction Buttons</h2>
            <p>Clicking a reaction button increments a public counter stored in our database against that project or blog post. This is anonymous — it is not tied to your identity or account. Your browser's session storage remembers that you reacted, purely to prevent double-counting in the same session; nothing is sent to our servers beyond the increment itself.</p>
        </section>

        <section aria-labelledby="ai-chat">
            <h2 id="ai-chat">AI Chat</h2>
            <p>The AI Chat feature requires signing in with Google. Messages you send are processed server-side and forwarded to Google's Gemini API to generate a response. Each conversation turn (your message, the AI's response, a timestamp, and your user ID) is logged to our database for quality review and is visible only to the site administrator. Chat history is also kept in your browser's local storage so your conversation persists between visits; clearing it is available from the chat panel.</p>
        </section>

        <section aria-labelledby="auth">
            <h2 id="auth">Authentication</h2>
            <p>Google Sign-In (via Firebase Authentication) is used only to gate access to the AI Chat feature and the admin panel. It is not used for marketing or advertising purposes.</p>
        </section>

        <section aria-labelledby="sharing">
            <h2 id="sharing">Data Sharing</h2>
            <p>We do not sell visitor data to third parties. Data is shared only with the service providers required to run the site: Google Firebase (hosting authentication, database, and analytics) and Google Gemini (processing AI chat messages).</p>
        </section>

        <section aria-labelledby="requests">
            <h2 id="requests">Privacy Requests</h2>
            <p>For questions about this policy or to request deletion of your data, email <a href="mailto:${esc(CONTACT_INFO.email)}">${esc(CONTACT_INFO.email)}</a>.</p>
        </section>`;

    writeRoute('/privacy', { title, description, bodyHtml: body });
}

// --- Run ------------------------------------------------------------------------

console.log('Prerendering static routes...');
homePage();
aboutPage();
servicesPage();
projectsPage();
blogIndexPage();
BLOG_POSTS.forEach(blogPostPage);
contactPage();
privacyPage();
console.log(`Done. ${5 + BLOG_POSTS.length + 2} routes generated.`);
