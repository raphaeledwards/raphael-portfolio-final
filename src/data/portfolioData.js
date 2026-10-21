import { Users, Lock, Cloud, BrainCircuit } from 'lucide-react';

export const PROJECT_ITEMS = [
    { id: 1, title: "Connected Vehicle Architecture", category: "Future Tech", tags: ["vehicle", "ota", "architecture", "firmware", "iot", "cloud"], image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop", description: "Architected the secure Over-The-Air (OTA) delivery framework supporting 1M+ connected vehicles." },
    { id: 2, title: "Secure Financial Transformation", category: "Cybersecurity", tags: ["security", "finance", "cloud", "zero trust", "banking", "compliance"], image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000&auto=format&fit=crop", description: "Directed the $70M+ services portfolio securing critical cloud workloads for top financial institutions." },
    { id: 3, title: "Operational Intelligence (VMO)", category: "Operational Strategy", tags: ["operations", "strategy", "vmo", "efficiency", "data", "automation"], image: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?q=80&w=1000&auto=format&fit=crop", description: "Built a Value Management Office (VMO) that leveraged data to save 2,300+ field hours globally." },
    { id: 4, title: "Strategic Revenue Architecture", category: "Revenue Growth", tags: ["revenue", "growth", "incentives", "arr", "sales", "go-to-market"], image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1000&auto=format&fit=crop", description: "Architected an incentive program turning a $145k investment into $25M+ in Annual Recurring Revenue." },
    { id: 5, title: "Resilient Engineering Culture", category: "Organizational Strategy", tags: ["team", "culture", "leadership", "engineering", "post-mortem", "agile"], image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1000&auto=format&fit=crop", description: "Established a Blameless Post-Mortem program for 500+ staff to drive continuous security improvements." },
    { id: 6, title: "Global Investment Strategy", category: "Revenue Growth", tags: ["investment", "strategy", "global", "revenue", "scale"], image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1000&auto=format&fit=crop", description: "Led a global growth program converting a $1M investment into $28.8M in new annual recurring revenue." }
];

export const EXPERTISE_AREAS = [
    { title: "Team Strategy & Growth", icon: Users, description: "Building high-performance cultures and scaling engineering organizations." },
    { title: "Cybersecurity & Edge", icon: Lock, description: "Securing assets in a decentralized world with robust, modern frameworks." },
    { title: "Cloud Computing", icon: Cloud, description: "Architecting scalable, resilient infrastructure for the modern enterprise." },
    { title: "AI Systems Design", icon: BrainCircuit, description: "Building agent runtimes, persistent memory systems, and human-in-the-loop orchestration layers for production AI." }
];

export const BLOG_POSTS = [
    {
        id: 1,
        slug: "the-human-element-in-digital-transformation",
        title: "The Human Element in Digital Transformation",
        date: "Oct 24, 2025",
        tags: ["Leadership", "Transformation", "Culture"],
        excerpt: "Why technology is only 20% of the challenge when upgrading legacy systems.",
        content: `Digital transformation is rarely about the code. In my experience leading large-scale modernizations, the technology stack—whether it's moving to Kubernetes, adopting a microservices architecture, or migrating to the cloud—is the predictable part. The variable that determines success or failure is always human.

        When we ask teams to change how they work, we aren't just swapping tools; we are challenging their mastery. A developer who has spent ten years mastering a legacy monolithic system may feel threatened by a sudden shift to distributed systems they don't yet understand. If leadership fails to bridge this gap with empathy, training, and a clear vision of "what's in it for them," the transformation will hit a wall of silent resistance.

        True success comes from building a culture of continuous learning before the first line of new code is written. It involves identifying internal champions, creating safe spaces for failure, and celebrating the small wins along the way. The goal isn't just a new tech stack; it's a renewed engineering culture that feels empowered, not replaced, by innovation.`
    },
    {
        id: 2,
        slug: "navigating-the-edge-security-implications",
        title: "Navigating the Edge: Security Implications",
        date: "Sep 15, 2025",
        tags: ["Security", "Edge Computing", "Zero Trust"],
        excerpt: "How edge computing is redefining the perimeter and what CISOs need to know.",
        content: `The traditional security perimeter is dead. With the rise of Edge Computing and IoT, the "fortress" model—where we protect a central data center with high walls—is no longer viable. We are moving compute power closer to where data is generated, which means our attack surface essentially expands to every connected device, sensor, and gateway in the field.

        Securing the edge requires a fundamental shift to a Zero Trust architecture. We must assume that any node can be compromised at any time. This means implementing rigorous identity verification not just for users, but for devices and workloads. Each interaction must be authenticated, authorized, and encrypted, independent of network location.

        Furthermore, observability becomes critical. You cannot protect what you cannot see. Distributed tracing and real-time anomaly detection at the edge are no longer "nice-to-haves"—they are essential survival mechanisms. As we push logic to the edge, security compliance must be baked into the CI/CD pipeline itself, ensuring that security policy is code, not an afterthought.`
    },
    {
        id: 3,
        slug: "leadership-in-the-age-of-ai",
        title: "Leadership in the Age of AI",
        date: "Aug 02, 2025",
        tags: ["AI", "Leadership", "Management"],
        excerpt: "Adapting management styles when your team is augmented by intelligent agents.",
        content: `We are entering an era where "team" no longer just refers to humans. With the integration of AI agents into the software development lifecycle, the role of an engineering leader is evolving from purely managing people to orchestrating hybrid human-AI workflows. This shifts the focus from "how do we write this code?" to "how do we define the problem clearly enough for our agents to solve it?"

        The challenge for leaders is to prevent the commoditization of their workforce. AI should be positioned as an amplifier of human creativity, not a replacement for it. This means encouraging engineers to move up the abstraction ladder—focusing on system architecture, user empathy, and complex reasoning, while delegating the boilerplate generation and test writing to AI.

        However, this also introduces new risks. Over-reliance on generated code can lead to a "knowledge gap" where the team no longer understands the systems they maintain. Effective leadership now requires enforcing rigorous code review standards (even for AI code) and ensuring that "human-in-the-loop" isn't just a buzzword, but a structural necessity in critical decision paths.`
    },
    {
        id: 4,
        slug: "ai-agents-in-devops-the-end-of-pipelines",
        title: "AI Agents in DevOps: The End of Pipelines?",
        date: "Nov 05, 2025",
        tags: ["DevOps", "AI", "Automation"],
        excerpt: "Why static CI/CD pipelines are becoming obsolete in the face of autonomous agents.",
        content: `The traditional CI/CD pipeline is a deterministic assembly line. It assumes that inputs A plus process B will always equal output C. But software development is becoming probabilistic. When AI agents start generating code, writing tests, and even deploying fixes, the rigid "pipeline" metaphor breaks down.

        We are moving towards "Guardrail Engineering." Instead of scripting every step of the build process, we define the boundaries of safe operation and let agents navigate the path. An agent might detect a performance regression in staging, analyze the commit history, generate a patch, and re-run the tests—all without human intervention.
        
        This requires a shift in how we think about DevOps. It's no longer about maintaining Jenkins scripts; it's about observing agent behavior and ensuring they adhere to policy. The future isn't a pipeline; it's a fleet of autonomous vehicles, and our job is to build the roads and traffic lights.`
    },
    {
        id: 5,
        slug: "zero-trust-isnt-product-its-culture",
        title: "Zero Trust isn't Product, It's Culture",
        date: "Nov 12, 2025",
        tags: ["Security", "Zero Trust", "Culture"],
        excerpt: "Stop buying 'Zero Trust' boxes. Start verifying every interaction.",
        content: `Vendor marketing has convinced many leaders that Zero Trust is something you buy. It's not. You can't install a "Zero Trust Firewall" and call it a day. Zero Trust is a fundamental architectural philosophy that begins with a simple, uncomfortable premise: "We are already breached."
        
        Implementing this requires a cultural shift more than a technical one. It means developers can no longer rely on implicit trust between services. "It's on the internal network" is no longer a valid security control. Every service must authenticate every request, even from its neighbor.
        
        This friction is intentional. It forces teams to think about identity, scope, and least privilege at the design phase, not just during a security audit. When you stop trusting the network, you start building software that is resilient by default, capable of operating safely in hostile environments—which, let's face it, is the entire internet today.`
    },
    {
        id: 6,
        slug: "cloud-finops-your-aws-bill-is-bleeding",
        title: "Cloud FinOps: Your AWS Bill is Bleeding",
        date: "Nov 22, 2025",
        tags: ["Cloud", "FinOps", "Cost"],
        excerpt: "Why auto-scaling is a trap without economic observability.",
        content: `The promise of the cloud was "pay only for what you use." The reality for most enterprises is "pay for what you forgot to turn off." I've scrutinized AWS bills where 40% of the spend was waste—orphaned snapshots, over-provisioned databases, and data transfer fees from inefficient architecture.
        
        FinOps is the practice of bringing financial accountability to the variable spend model of the cloud. It's not just about cutting costs; it's about connecting technical decisions to business value. Does that microservice really need high-availability across three zones for a batch job that runs once a day?
        
        Engineers need visibility into the cost of their code. When a developer sees that their inefficient query costs the company $500 a month, they fix it. Without that feedback loop, efficiency is an abstraction. Economic observability must be part of your monitoring stack, right alongside latency and error rates.`
    },
    {
        id: 7,
        slug: "stop-measuring-lines-of-code",
        title: "Stop Measuring Lines of Code",
        date: "Dec 01, 2025",
        tags: ["Management", "Metrics", "Engineering"],
        excerpt: "Velocity metrics that actually matter for high-performance teams.",
        content: `If you measure developers by lines of code, you will get bloated, unmaintainable software. If you measure them by tickets closed, you will get trivial bug fixes. The observer effect in engineering management is real: you get exactly behavior you incentivize.
        
        Real engineering velocity is measured in "Cycle Time"—the time from first commit to production deployment. It focuses on the friction in the system. How long does a PR sit in review? How flaky are the tests? How complex is the deployment?
        
        High-performing teams don't necessarily type faster; they get stuck less. They focus on DORA metrics: Deployment Frequency, Lead Time for Changes, Time to Restore Service, and Change Failure Rate. These measure the health of the *system*, not the busyness of the *worker*.`
    },
    {
        id: 8,
        slug: "technical-debt-as-a-feature",
        title: "Technical Debt as a Feature",
        date: "Dec 08, 2025",
        tags: ["Strategy", "Technical Debt", "Engineering"],
        excerpt: "Refactoring isn't a chore; it's a strategic investment instrument.",
        content: `We often talk about technical debt like it's a moral failing. "We took a shortcut, now we must pay." But debt, in finance, is a tool for leverage. You take on debt to grow faster than your capital allows. The same applies to code.

        Taking on technical debt to ship a feature before a competitor is a valid business strategy. The problem isn't the debt; it's the lack of a repayment plan. When technical debt becomes "unmanaged," it turns into "technical insolvency"—where you spend all your time servicing the interest (fixing bugs) and have no principal left for new features.

        The best teams treat refactoring as a continuous feature. They allocate 20% of every sprint to paying down debt. This isn't "maintenance"; it's ensuring the factory floor remains clean enough to build the next Ferrari. If you don't schedule time for maintenance, your equipment will schedule it for you—usually at the worst possible time.`
    },
    {
        id: 9,
        slug: "building-a-local-ai-agent-from-scratch",
        title: "Building a Local AI Agent from Scratch",
        date: "Jan 15, 2026",
        tags: ["AI", "Engineering", "Agents"],
        excerpt: "What actually happens when you wire local LLM inference, vector memory, and autonomous task loops into a single coherent system.",
        content: `The first question when building an autonomous AI agent isn't "which LLM?" It's "what happens when it's wrong?" I spent several weeks building a local agent runtime, and the hardest problems had nothing to do with the model itself.

The stack: Node.js and TypeScript for the runtime, Ollama for local LLM inference, and LanceDB for vector-based persistent memory. No cloud APIs, no usage costs, no data leaving the machine. The trade-off is latency — a local model is slower than a hosted API, but for an always-on personal agent, privacy and control matter more than raw throughput.

The architectural challenge is memory. A context window is not memory. It's a scratchpad. Real memory means the agent can recall something from six weeks ago, understand how it connects to today's request, and respond with appropriate continuity. That requires a three-tier system: short-term (in-context), episodic (recent interactions indexed by vector similarity), and semantic (synthesized facts extracted from recurring patterns).

The second challenge is autonomy guardrails. An agent that can act — send messages, query APIs, execute code — needs a policy engine that distinguishes between safe, reversible actions and destructive, irreversible ones. I implemented an approval gate architecture where any action above a defined risk threshold requires explicit confirmation before proceeding. This isn't safety theater; it's what makes the agent trustworthy enough to actually delegate to.

The lesson: the capability of the underlying model matters far less than the architecture surrounding it. Orchestration, memory design, and policy enforcement are where the real engineering happens.`
    },
    {
        id: 10,
        slug: "the-memory-problem-in-ai-systems",
        title: "The Memory Problem in AI Systems",
        date: "Feb 28, 2026",
        tags: ["AI", "Memory", "Architecture"],
        excerpt: "Context windows aren't memory. Here's what persistent AI memory actually requires at the architecture level.",
        content: `Every production AI feature I've seen fail does so in the same way: it treats context as disposable. The session ends, the conversation resets, and the system has no recollection of the user, their preferences, or the problem they've been trying to solve for the past three months.

This is a product failure masquerading as a technical limitation.

The technical solution exists. Semantic vector stores can persist and retrieve memory at scale. Text embedding models encode nuanced context into high-dimensional space and retrieve it by similarity, not exact match. The primitives are available; the problem is design.

The first design challenge is what to store and when. Raw conversation transcripts are too noisy. If you store everything, you retrieve everything — including contradictions and outdated states. Effective AI memory requires a synthesis layer: something that periodically distills interactions into compressed, structured facts. I've implemented this as an autonomous nightly agent that reviews the day's interactions, extracts durable insights, and writes them back to the memory store as tagged, searchable entries.

The second challenge is memory freshness. A fact stored three months ago may be stale today. Memory systems need staleness scoring — older, unconfirmed memories should carry lower retrieval weight than recently validated ones. Most implementations skip this entirely, which leads to AI systems confidently acting on outdated information.

Memory is what separates a demo from a product. If your AI feature can't remember the user across sessions, you haven't built a feature — you've built a novelty.`
    }
];

export const FEED_ITEMS = [
    {
        id: 1,
        source: "ArXiv",
        topic: "Agent Architecture",
        title: "Autonomy and Agency in Agentic AI: Architectural Tactics for Regulated Contexts",
        link: "https://arxiv.org/abs/2605.12105",
        note: "Cuts through the autonomy hype with a practical design space: autonomy and agency are coupled, and higher autonomy demands tighter agency constraints or you lose recovery capability. The architectural tactics — checkpoints, escalation gates, tool fencing — map directly to how I think about policy engines in production agent deployments."
    },
    {
        id: 2,
        source: "HBR",
        topic: "Management",
        title: "The High Cost of a Toxic Culture",
        link: "https://hbr.org/2022/07/the-high-cost-of-a-toxic-culture",
        note: "Reminds me that 'resilience' isn't just about code; it's about psychological safety in the team. Toxic cultures create brittle systems."
    },
    {
        id: 3,
        source: "YCombinator",
        topic: "Strategy",
        title: "Do Things That Don't Scale",
        link: "http://paulgraham.com/ds.html",
        note: "My go-to rebuttal when stakeholders demand 'fully automated efficiency' on Day 1. You have to be the manual engine before you can build the automatic one."
    },
    {
        id: 4,
        source: "Google Cloud",
        topic: "Zero Trust",
        title: "BeyondProd: A new approach to cloud-native security",
        link: "https://cloud.google.com/security/beyondprod",
        note: "The blueprint for my work on the Connected Vehicle OTA framework. Identity must be the perimeter, not the firewall."
    },
    {
        id: 5,
        source: "Netflix TechBlog",
        topic: "Chaos Engineering",
        title: "Fit Cycle: A new way to describe Netflix culture",
        link: "https://netflixtechblog.com",
        note: "Chaos Engineering isn't about breaking things; it's about revealing the truth of the system. If you don't test failure, you're just hoping for success."
    },
    {
        id: 6,
        source: "ArXiv",
        topic: "AI Memory",
        title: "Memory for Autonomous LLM Agents: Mechanisms, Evaluation, and Emerging Frontiers",
        link: "https://arxiv.org/abs/2603.07670",
        note: "Formalizes agent memory as a write-manage-read loop across five mechanism families. The key insight: if your memory system only performs well in single-session tests, it's not actually persistent memory. This is the framework I now use to evaluate whether a memory implementation is real."
    },
    {
        id: 7,
        source: "ArXiv",
        topic: "AI Governance",
        title: "Policy-as-Prompt: Turning AI Governance Rules into Guardrails for AI Agents",
        link: "https://arxiv.org/abs/2509.23994",
        note: "Operationalizes governance rules directly into agent behavior via prompt-based guardrails — treating compliance as architecture, not audit. The alternative (audit logs and post-hoc review) is just hoping nothing goes wrong."
    }
];


export const AI_LAB_ITEMS = [
    {
        id: 'lab-4',
        title: "Race Engineer (Sim Racing AI)",
        category: "AI Engineering",
        built: "Active · Q4 2026",
        tags: ["Python", "Local AI", "Real-Time Telemetry", "Voice", "Rules Engine"],
        image: "https://images.unsplash.com/photo-1590450175845-897484157f46?q=80&w=1000&auto=format&fit=crop",
        description: "A real-time race engineer that watches every lap a driver runs and coaches them by voice — what they're doing wrong in each corner, when to pit, when traffic matters — built entirely local, with no cloud service and no LLM making the actual coaching decisions.",
        content: `Most racing games already show a driver how much time they're losing, lap over lap. They don't explain why. This project is a race engineer that fills that gap — watching live telemetry as the driver drives, deciding what's actually worth saying, and speaking it out loud at the moment it matters.

The first lesson was not to trust the data at face value. The game's own on-screen timer turned out to be off by a full 40 seconds — a reminder that any system built on top of someone else's instrumentation has to independently verify what it's being told before acting on it. The telemetry feed has a second, quieter failure mode: it can keep reporting numbers for several seconds after the game has actually closed. Both problems meant building verification into the system itself, rather than trusting the upstream source.

The coaching decisions are deliberately not made by a language model. Every call the system makes — braked too early, too much speed into the corner, fuel running short — comes from a rules engine built on thresholds pulled from real recorded sessions, not a generative guess. An LLM shows up in exactly one place: giving the system a natural, human voice. It's a conscious bet against the current trend of routing everything through a chatbot — the judgment stays deterministic and auditable; AI is reserved for the one job it's actually good at.

It also reasons about race context the way a human engineer would: recognizing when a driver was defending against another car rather than simply driving badly, telling a lapped backmarker from a close rival, and managing fuel strategy through a race even when the game provides no reliable way to know how much time is left — a gap only found by exhaustively testing the telemetry feed itself.

The lesson: a system can earn the label "AI" without outsourcing its judgment to one. The harder and more valuable work is deciding what's true, what's worth saying, and when to say it. AI is just the voice.`
    },
    {
        id: 'lab-1',
        title: "AI Agent Development",
        category: "AI Engineering",
        built: "Active · Q1 2026",
        tags: ["TypeScript", "Local LLM", "Persistent Memory", "Policy Engine"],
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1000&auto=format&fit=crop",
        description: "Self-hosted autonomous agent runtime with persistent memory and a policy layer that decides, action by action, which of its own decisions it's allowed to make alone. Zero cloud dependency.",
        content: `Most "autonomous agent" demos stop at a clever prompt. This one had to survive actually running unattended, day after day, with no cloud fallback and no one watching it constantly.

The hardest problem wasn't capability, it was memory. An agent that forgets everything between sessions isn't useful — but one that remembers everything raw drowns in its own history. The fix was a tiered system: a short-term scratchpad for the task at hand, a recent-history layer indexed by relevance rather than recency, and a nightly process that reviews the day and distills the parts worth keeping. Nothing is stored or recalled raw — it's synthesized first.

The second problem was trust. Every action the agent considers is classified by how reversible and how risky it is. Anything above a defined threshold stops and waits for a human decision before it executes — a scoped restriction, not a blanket one, so the agent still acts independently on the large majority of routine work. A separate layer watches the agent's own behavior over time, flagging drift from its established patterns and halting for review before a small deviation becomes a real problem.

The lesson: the model is the easy part. What actually makes an autonomous system trustworthy enough to leave running is the architecture around it — memory that's curated instead of dumped, and guardrails that scale permission to risk.`
    },
    {
        id: 'lab-2',
        title: "AI Memory & Context Management",
        category: "AI Engineering",
        built: "Active · Q2 2026",
        tags: ["Gemini", "Vector Search", "AI Memory", "Multi-Model Routing"],
        image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1000&auto=format&fit=crop",
        description: "A research project asking a focused question: what does it actually take to give an AI system memory that's genuinely persistent — not just a longer context window, but something that gets better at knowing what matters over time?",
        content: `Most "AI memory" is really just a bigger context window — stuff more text in and hope the model finds the signal. This project treats memory as something that has to be actively managed: written, curated, decayed, and re-synthesized, not just stored.

The system holds a semantic memory store, retrieved by meaning rather than exact wording, and an autonomous process that runs every night reviewing the day's interactions and distilling the parts worth keeping into durable, searchable entries. Older memories lose weight over time unless something reinforces them, so the system never acts on context that's gone stale.

Requests are also routed between a faster, cheaper model for routine retrieval and a more capable one for genuine synthesis, based on how complex the task actually is — treating cost and quality as a judgment call per request, not a fixed setting. A further experiment layers in physiological signal — resting heart rate, sleep quality — as a weighting input on memory retrieval, testing whether an AI system's sense of context should account for the state of the person it's talking to, not just what they said.

The finding: storage and retrieval were never the hard part. The hard part is synthesis — deciding what's actually worth remembering. Raw context is noise; the value is entirely in what gets extracted and compressed.`
    },
    {
        id: 'lab-3',
        title: "This Portfolio — Live AI Application",
        category: "AI Engineering",
        built: "Live · 2026",
        tags: ["Gemini API", "Vector Search", "React", "Live Product"],
        image: "https://images.unsplash.com/photo-1537432376769-00f5c2f4c8d2?q=80&w=1000&auto=format&fit=crop",
        description: "This site is itself a working AI application, not a mockup. Behind the login is an assistant that actually knows this portfolio's content and can answer real questions about the work in it.",
        content: `Anyone can claim AI fluency on a resume. The most honest proof is deploying something real and leaving it running in public, where it has to actually work.

The assistant is grounded in the real content of this site — every project, post, and area of expertise is indexed and pulled in as context at query time, so it can discuss specific trade-offs and synthesize across topics instead of giving generic answers.

Access sits behind a login, deliberately. That's not a barrier, it's a filter — a visitor curious enough to create an account is a visitor worth having a real conversation with. The underlying content can be updated live through an admin panel, without a redeploy, so the site stays current the same way any real product does.

The point of building it this way: if I'm going to claim fluency with AI systems, the most honest proof is running one in public, not describing one in a slide.`
    }
];

export const CURRENT_STACK = [
    "Ollama", "LanceDB", "Gemini API", "Firebase", "SDXL"
];

export const ABOUT_ME = {
    title: "About Raphael J. Edwards",
    role: "Technology Executive & Services Architect",
    location: "Boston, MA",
    bio: `A technology executive with a "builder" mindset. I don't just manage complexity; I architect the strategic programs that scale global success. From web security to enterprise growth, I lead the high-performance teams that deliver measurable business value. Proven by a track record of architecting strategic programs that turn small investments into multi-million dollar recurring revenue loops.`,
    leadershipPhilosophy: `My core leadership philosophy centers on the belief that while technology is easy, people are hard. I advocate for blameless post-mortems and psychological safety as foundational elements for building resilient teams. I move engineering teams from chaos to clarity by embedding OKR frameworks and encouraging a culture of continuous learning. I believe in orchestrating hybrid human-AI workflows where AI amplifies human creativity rather than replacing it.`,
    technicalBackground: `My background is rooted in deep technical architecture, specifically in Cloud Computing (AWS, GCP, Azure), Cybersecurity (Zero Trust, Edge Security), and Future Tech (IoT, Connected Vehicles). I have architected secure OTA frameworks for 1M+ vehicles and led large-scale digital transformations involved microservices and cloud-native adoptions.`
};

export const NAV_LINKS = ["Home", "Projects", "Services", "Blog", "Contact"];

// Structured mirror of the credentials/achievements prose in resumeContext.js's AI
// system prompt, kept separately so the static page generator (scripts/prerender.js)
// has real fields to render instead of parsing a prompt string. Keep in sync by hand
// if either changes.
export const EDUCATION = [
    { institution: "University of Massachusetts Lowell", credential: "B.S.B.A., Management Information Systems and Business Administration", period: "2001 – 2005" }
];

export const CERTIFICATIONS = [
    { name: "Project Management Professional (PMP) #1276180", period: "June 2009 – June 2024" },
    { name: "AWS Certified Cloud Practitioner", period: "February 2020 – February 2023" }
];

export const RECOGNITION = [
    { name: "Global Services Pinnacle Award", year: "2023" },
    { name: "Akamai Leadership Academy", year: "2020" },
    { name: "Akamai Leadership Preparatory School", year: "2017" },
    { name: "Akamai Certified Instructor", year: "2016 – 2018" },
    { name: "Akamai \"Titan\" Award Recipient", year: "2015", note: "Given annually to the top-performing employees across Akamai's global Sales, Services & Marketing organization." }
];

export const KEY_ACHIEVEMENTS = [
    "Directed a $70M+ ARR services organization that served as the primary enablement and delivery engine, securing and scaling a $300M+ financial institution portfolio.",
    "Built a culture of high-performance by embedding an OKR framework to align a 45-person global team (NA, Costa Rica, India), consistently delivering on ambitious corporate goals.",
    "Conducts quarterly business reviews (QBRs) to C-level stakeholders, highlighting financial performance, risks, and opportunities for a $70M portfolio.",
    "Architected a services sales incentive plan that turned a $145k investment (over 3 years) into $25M+ in new Annual Recurring Revenue.",
    "Established an oversight committee to capture service over-utilization, generating a 210% increase in new revenue.",
    "Built a global Value Management Office (VMO) from ideation to operationalization, centralizing expertise and saving 2,300+ field hours in its first two years.",
    "Established a global Blameless Post-Mortem program reaching 500+ services personnel, creating a culture of learning and driving direct product enhancements.",
    "Leading a global leadership transformation initiative focused on coaching, development, and establishing behaviors that drive organizational impact.",
    "Created \"Project Milkshake,\" a thought leadership program that produced new go-to-market assets and directly supported marketing collateral."
];

// TODO(raphael): the live Contact section uses raphael@raphaeljedwards.com, but the
// Person JSON-LD in index.html and the AI persona's contact line (resumeContext.js,
// via VITE_ADMIN_EMAILS) use raphaeledwards@gmail.com. Pick one canonical contact
// email — this mirrors the existing site's mailto link pending that decision.
export const CONTACT_INFO = {
    email: "raphael@raphaeljedwards.com",
    linkedin: "https://www.linkedin.com/in/raphaeljedwards/",
    github: "https://github.com/raphaeledwards",
    location: "Boston, MA",
    availableFor: ["Speaking engagements", "Advisory board roles", "Strategic consulting"]
};
