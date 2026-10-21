// Generates static, crawlable HTML + Markdown for every route from the data in
// src/data/portfolioData.js (the single source of truth — nothing here is
// hand-duplicated content). Runs as a postbuild step, after `vite build` has
// already produced dist/index.html with the real hashed asset tags; this
// script takes that file as a template and clones it per route with
// route-specific content and metadata injected in, plus a parallel Markdown
// twin of each page for agents that request `Accept: text/markdown`.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { mdPathFor } from '../lib/mdPath.js';
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
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;
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
    const mdUrl = `${SITE_URL}${mdPathFor(canonicalPath)}`;
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
    out = out.replace(
        /<meta name="twitter:title" content="[^"]*"\s*\/>/,
        `<meta name="twitter:title" content="${esc(title)}" />`
    );
    out = out.replace(
        /<meta name="twitter:description" content="[^"]*"\s*\/>/,
        `<meta name="twitter:description" content="${esc(description)}" />`
    );
    out = out.replace(
        /<meta name="twitter:image" content="[^"]*"\s*\/>/,
        `<meta name="twitter:image" content="${esc(DEFAULT_IMAGE)}" />`
    );

    const headInject = `    <link rel="canonical" href="${canonicalUrl}" />
    <link rel="alternate" type="text/markdown" href="${mdUrl}" />
${extraHead}  </head>`;
    out = out.replace(/\s*<\/head>/, `\n${headInject}`);

    return out;
}

function injectBody(html, bodyHtml) {
    return html.replace('<div id="root"></div>', `<div id="root">${bodyHtml}</div>`);
}

function websiteJsonLd() {
    return `    <script type="application/ld+json">
    ${JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Raphael J. Edwards',
        url: SITE_URL,
        publisher: { '@id': `${SITE_URL}/#person` }
    }, null, 2)}
    </script>
`;
}

function breadcrumbJsonLd(items) {
    return `    <script type="application/ld+json">
    ${JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: item.name,
            item: `${SITE_URL}${item.path}`
        }))
    }, null, 2)}
    </script>
`;
}

const generatedMarkdown = [];

function writeRoute(routePath, { title, description, ogType, extraHead, bodyHtml, markdown }) {
    const html = injectBody(
        injectHead(shellTemplate, { title, description, canonicalPath: routePath, ogType, extraHead }),
        wrapPage(routePath, bodyHtml)
    );

    const outPath = routePath === '/'
        ? path.join(DIST, 'index.html')
        : path.join(DIST, routePath.slice(1), 'index.html');

    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, html);

    const mdOutPath = path.join(DIST, mdPathFor(routePath).slice(1));
    fs.mkdirSync(path.dirname(mdOutPath), { recursive: true });
    fs.writeFileSync(mdOutPath, markdown);
    generatedMarkdown.push({ path: routePath, title, markdown });

    console.log(`  ✓ ${routePath} -> ${path.relative(DIST, outPath)} + ${path.relative(DIST, mdOutPath)}`);
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

    const md = `# Raphael J. Edwards — Technology Executive & AI Practitioner

${ABOUT_ME.bio}

## Who This Is For

Organizations and teams navigating cloud migration, Zero Trust security transformation, and the shift to AI-augmented engineering — and anyone evaluating whether a technology executive actually builds, not just manages.

## Expertise

${EXPERTISE_AREAS.map(a => `- **${a.title}** — ${a.description}`).join('\n')}

## Key Achievements

${KEY_ACHIEVEMENTS.slice(0, 5).map(a => `- ${a}`).join('\n')}

## Explore

- [About](${SITE_URL}/about) — bio, leadership philosophy, education, credentials
- [Services & Expertise](${SITE_URL}/services)
- [Featured Projects & AI Lab](${SITE_URL}/projects)
- [Blog](${SITE_URL}/blog) — insights on leadership, security, and AI systems
- [Contact](${SITE_URL}/contact)
`;

    writeRoute('/', { title, description, ogType: 'website', extraHead: websiteJsonLd(), bodyHtml: body, markdown: md });
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

    const md = `# About Raphael J. Edwards

${ABOUT_ME.role} · ${ABOUT_ME.location}

${ABOUT_ME.bio}

## Leadership Philosophy

${ABOUT_ME.leadershipPhilosophy}

## Technical Background

${ABOUT_ME.technicalBackground}

## Education

${EDUCATION.map(e => `- ${e.institution} — ${e.credential} (${e.period})`).join('\n')}

## Certifications

${CERTIFICATIONS.map(c => `- ${c.name} (${c.period})`).join('\n')}

## Recognition

${RECOGNITION.map(r => `- ${r.name}, ${r.year}${r.note ? ` — ${r.note}` : ''}`).join('\n')}
`;

    const breadcrumbs = breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'About', path: '/about' }]);
    writeRoute('/about', { title, description, ogType: 'profile', extraHead: breadcrumbs, bodyHtml: body, markdown: md });
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

    const md = `# Services & Expertise

${EXPERTISE_AREAS.map(a => `## ${a.title}\n\n${a.description}`).join('\n\n')}
`;

    const breadcrumbs = breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Services', path: '/services' }]);
    writeRoute('/services', { title, description, extraHead: breadcrumbs, bodyHtml: body, markdown: md });
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

    const md = `# Featured Projects

## Career Impact

${PROJECT_ITEMS.map(p => `### ${p.title}\n\n*${p.category}*\n\n${p.description}`).join('\n\n')}

## AI Lab — Personal Builds

Personal AI systems built independently — proof of hands-on fluency with the stack, not just leadership over it.

${AI_LAB_ITEMS.map(p => `### ${p.title}\n\n*${p.category}${p.built ? ` · ${p.built}` : ''}*\n\n${p.description}\n\nStack: ${p.tags.join(', ')}`).join('\n\n')}
`;

    const breadcrumbs = breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Projects', path: '/projects' }]);
    writeRoute('/projects', { title, description, extraHead: breadcrumbs, bodyHtml: body, markdown: md });
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

    const md = `# Insights & Blog

${sorted.map(post => `## [${post.title}](${SITE_URL}/blog/${post.slug})\n\n*${post.date} · ${post.tags.join(', ')}*\n\n${post.excerpt}`).join('\n\n')}
`;

    const breadcrumbs = breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Blog', path: '/blog' }]);
    writeRoute('/blog', { title, description, extraHead: breadcrumbs, bodyHtml: body, markdown: md });
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
` + breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Blog', path: '/blog' }, { name: post.title, path: `/blog/${post.slug}` }]);

    const body = `
        <article>
            <h1>${esc(post.title)}</h1>
            <p><time datetime="${isoDate}">${esc(post.date)}</time> · ${post.tags.map(esc).join(', ')}</p>
            ${paragraphs(post.content)}
        </article>
        <p><a href="/blog">&larr; Back to all posts</a></p>`;

    const md = `# ${post.title}

*${post.date} · ${post.tags.join(', ')}*

${post.content.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean).join('\n\n')}

[← Back to all posts](${SITE_URL}/blog)
`;

    writeRoute(`/blog/${post.slug}`, { title, description, ogType: 'article', extraHead: articleJsonLd, bodyHtml: body, markdown: md });
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

    const md = `# Contact

Based in ${CONTACT_INFO.location}. Available for ${CONTACT_INFO.availableFor.join(', ')}.

- Email: [${CONTACT_INFO.email}](mailto:${CONTACT_INFO.email})
- LinkedIn: [${CONTACT_INFO.linkedin}](${CONTACT_INFO.linkedin})
- GitHub: [${CONTACT_INFO.github}](${CONTACT_INFO.github})

I personally read and respond to every message sent to the email above.
`;

    const breadcrumbs = breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Contact', path: '/contact' }]);
    writeRoute('/contact', { title, description, extraHead: breadcrumbs, bodyHtml: body, markdown: md });
}

function privacyPage() {
    const title = 'Privacy Policy | Raphael J. Edwards';
    const description = 'How raphaeljedwards.com handles analytics, the AI chat feature, reactions, and visitor data.';

    const sections = [
        ['Analytics', "This site uses Firebase Analytics (built on Google Analytics) to understand aggregate traffic patterns such as page views and session counts. No custom event tracking is implemented beyond Firebase's automatic page-view collection."],
        ['Reaction Buttons', "Clicking a reaction button increments a public counter stored in our database against that project or blog post. This is anonymous — it is not tied to your identity or account. Your browser's session storage remembers that you reacted, purely to prevent double-counting in the same session; nothing is sent to our servers beyond the increment itself."],
        ['AI Chat', "The AI Chat feature requires signing in with Google. Messages you send are processed server-side and forwarded to Google's Gemini API to generate a response. Each conversation turn (your message, the AI's response, a timestamp, and your user ID) is logged to our database for quality review and is visible only to the site administrator. Chat history is also kept in your browser's local storage so your conversation persists between visits; clearing it is available from the chat panel."],
        ['Authentication', 'Google Sign-In (via Firebase Authentication) is used only to gate access to the AI Chat feature and the admin panel. It is not used for marketing or advertising purposes.'],
        ['Data Sharing', 'We do not sell visitor data to third parties. Data is shared only with the service providers required to run the site: Google Firebase (hosting, authentication, database, and analytics) and Google Gemini (processing AI chat messages).'],
        ['Privacy Requests', `For questions about this policy or to request deletion of your data, email [${CONTACT_INFO.email}](mailto:${CONTACT_INFO.email}).`]
    ];

    const body = `
        <h1>Privacy Policy</h1>
        <p>Last updated: ${BUILD_DATE}</p>
        ${sections.map(([heading, text]) => `<section aria-labelledby="${slugifyHeading(heading)}">
            <h2 id="${slugifyHeading(heading)}">${esc(heading)}</h2>
            <p>${heading === 'Privacy Requests' ? `For questions about this policy or to request deletion of your data, email <a href="mailto:${esc(CONTACT_INFO.email)}">${esc(CONTACT_INFO.email)}</a>.` : esc(text)}</p>
        </section>`).join('\n        ')}`;

    const md = `# Privacy Policy

Last updated: ${BUILD_DATE}

${sections.map(([heading, text]) => `## ${heading}\n\n${text}`).join('\n\n')}
`;

    const breadcrumbs = breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Privacy Policy', path: '/privacy' }]);
    writeRoute('/privacy', { title, description, extraHead: breadcrumbs, bodyHtml: body, markdown: md });
}

function slugifyHeading(str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// --- 404 ------------------------------------------------------------------------

function notFoundPage() {
    const body = `
        <h1>Page Not Found</h1>
        <p>There's nothing at this address. Try the homepage, the <a href="/sitemap.xml">sitemap</a>, or <a href="/llms.txt">llms.txt</a> for a full list of pages.</p>
        <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/sitemap.xml">Sitemap</a></li>
            <li><a href="/llms.txt">llms.txt</a></li>
        </ul>`;

    const html = injectBody(
        injectHead(shellTemplate, {
            title: '404 Not Found | Raphael J. Edwards',
            description: "The page you're looking for doesn't exist.",
            canonicalPath: '/404',
            ogType: 'website'
        }),
        wrapPage(null, body)
    );
    fs.writeFileSync(path.join(DIST, '404.html'), html);

    const md = `# Page Not Found

There's nothing at this address. Try the [homepage](${SITE_URL}/), the [sitemap](${SITE_URL}/sitemap.xml), or [llms.txt](${SITE_URL}/llms.txt) for a full list of pages.
`;
    fs.writeFileSync(path.join(DIST, '404.md'), md);
    console.log('  ✓ /404 -> 404.html + 404.md');
}

// --- llms.txt / llms-full.txt ----------------------------------------------------

function llmsFiles() {
    const fullText = generatedMarkdown
        .map(page => `<!-- Source: ${SITE_URL}${page.path} -->\n\n${page.markdown.trim()}`)
        .join('\n\n---\n\n');
    fs.writeFileSync(path.join(DIST, 'llms-full.txt'), fullText + '\n');

    const sorted = [...BLOG_POSTS].sort((a, b) => new Date(b.date) - new Date(a.date));

    const llmsTxt = `# Raphael J. Edwards

> ${ABOUT_ME.role} based in ${ABOUT_ME.location}. Motto: "Building resilient teams. Solving complex problems." Contact: ${CONTACT_INFO.email}

${ABOUT_ME.bio}

${ABOUT_ME.leadershipPhilosophy}

## Pages

- [Home](${SITE_URL}/) ([markdown](${SITE_URL}/index.md))
- [About](${SITE_URL}/about) ([markdown](${SITE_URL}/about.md)) — bio, leadership philosophy, education, certifications, recognition
- [Services & Expertise](${SITE_URL}/services) ([markdown](${SITE_URL}/services.md))
- [Featured Projects & AI Lab](${SITE_URL}/projects) ([markdown](${SITE_URL}/projects.md))
- [Blog](${SITE_URL}/blog) ([markdown](${SITE_URL}/blog.md))
- [Contact](${SITE_URL}/contact) ([markdown](${SITE_URL}/contact.md))
- [Privacy Policy](${SITE_URL}/privacy) ([markdown](${SITE_URL}/privacy.md))

## Blog Posts

${sorted.map(p => `- [${p.title}](${SITE_URL}/blog/${p.slug}) (${p.date}) ([markdown](${SITE_URL}/blog/${p.slug}.md)) — ${p.excerpt}`).join('\n')}

## Everything, concatenated

For the full text of every page in one file: ${SITE_URL}/llms-full.txt

## Contact

- Email: ${CONTACT_INFO.email}
- LinkedIn: ${CONTACT_INFO.linkedin}
- GitHub: ${CONTACT_INFO.github}
- Location: ${CONTACT_INFO.location}
`;
    fs.writeFileSync(path.join(DIST, 'llms.txt'), llmsTxt);
    console.log('  ✓ /llms.txt (regenerated from data) + /llms-full.txt');
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
notFoundPage();
llmsFiles();
console.log(`Done. ${generatedMarkdown.length} routes generated (HTML + Markdown), plus 404 and llms.txt/llms-full.txt.`);
