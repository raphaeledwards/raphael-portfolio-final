import { Users, Lock, Cloud, BrainCircuit } from 'lucide-react';

export const PROJECT_ITEMS = [
    { id: 1, title: "Connected Vehicle Architecture", category: "Future Tech", tags: ["vehicle", "ota", "architecture", "firmware", "iot", "cloud"], image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop", description: "Architected the secure Over-The-Air (OTA) delivery framework supporting 1M+ connected vehicles." },
    { id: 2, title: "Secure Financial Transformation", category: "Cybersecurity", tags: ["security", "finance", "cloud", "zero trust", "banking", "compliance"], image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000&auto=format&fit=crop", description: "Directed the $70M+ services portfolio securing critical cloud workloads for top financial institutions." },
    { id: 3, title: "Operational Intelligence (VMO)", category: "Operational Strategy", tags: ["operations", "strategy", "vmo", "efficiency", "data", "automation"], image: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?q=80&w=1000&auto=format&fit=crop", description: "Built a Value Management Office (VMO) that leveraged data to save 2,300+ field hours globally." },
    { id: 4, title: "Strategic Revenue Architecture", category: "Revenue Growth", tags: ["revenue", "growth", "incentives", "arr", "sales", "go-to-market"], image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1000&auto=format&fit=crop", description: "Architected an incentive program turning a $70k investment into $12M+ in Annual Recurring Revenue." },
    { id: 5, title: "Resilient Engineering Culture", category: "Organizational Strategy", tags: ["team", "culture", "leadership", "engineering", "post-mortem", "agile"], image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1000&auto=format&fit=crop", description: "Established a Blameless Post-Mortem program for 500+ staff to drive continuous security improvements." },
    { id: 6, title: "Global Investment Strategy", category: "Revenue Growth", tags: ["investment", "strategy", "global", "revenue", "scale"], image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1000&auto=format&fit=crop", description: "Led a global growth program converting a $1M investment into $28.8M in new annual recurring revenue." }
];

export const EXPERTISE_AREAS = [
    { title: "Team Strategy & Growth", icon: Users, description: "Building high-performance cultures and scaling engineering organizations." },
    { title: "Cybersecurity & Edge", icon: Lock, description: "Securing assets in a decentralized world with robust, modern frameworks." },
    { title: "Cloud Computing", icon: Cloud, description: "Architecting scalable, resilient infrastructure for the modern enterprise." },
    { title: "AI & Future Tech", icon: BrainCircuit, description: "Leveraging machine learning and emerging tech to solve complex problems." }
];

export const BLOG_POSTS = [
    {
        id: 1,
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
        title: "Technical Debt as a Feature",
        date: "Dec 08, 2025",
        tags: ["Strategy", "Technical Debt", "Engineering"],
        excerpt: "Refactoring isn't a chore; it's a strategic investment instrument.",
        content: `We often talk about technical debt like it's a moral failing. "We took a shortcut, now we must pay." But debt, in finance, is a tool for leverage. You take on debt to grow faster than your capital allows. The same applies to code.
        
        Taking on technical debt to ship a feature before a competitor is a valid business strategy. The problem isn't the debt; it's the lack of a repayment plan. When technical debt becomes "unmanaged," it turns into "technical insolvency"—where you spend all your time servicing the interest (fixing bugs) and have no principal left for new features.
        
        The best teams treat refactoring as a continuous feature. They allocate 20% of every sprint to paying down debt. This isn't "maintenance"; it's ensuring the factory floor remains clean enough to build the next Ferrari. If you don't schedule time for maintenance, your equipment will schedule it for you—usually at the worst possible time.`
    }
];

export const FEED_ITEMS = [
    {
        id: 1,
        source: "ArXiv",
        topic: "AI Agents",
        title: "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models",
        link: "https://arxiv.org/abs/2201.11903",
        note: "Validates the approach I'm taking with the rca_analyst tool. Multi-step reasoning is non-negotiable for root cause analysis."
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
    }
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
