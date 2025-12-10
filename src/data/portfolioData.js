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
        excerpt: "Why technology is only 20% of the challenge when upgrading legacy systems.",
        content: `Digital transformation is rarely about the code. In my experience leading large-scale modernizations, the technology stack—whether it's moving to Kubernetes, adopting a microservices architecture, or migrating to the cloud—is the predictable part. The variable that determines success or failure is always human.

        When we ask teams to change how they work, we aren't just swapping tools; we are challenging their mastery. A developer who has spent ten years mastering a legacy monolithic system may feel threatened by a sudden shift to distributed systems they don't yet understand. If leadership fails to bridge this gap with empathy, training, and a clear vision of "what's in it for them," the transformation will hit a wall of silent resistance.

        True success comes from building a culture of continuous learning before the first line of new code is written. It involves identifying internal champions, creating safe spaces for failure, and celebrating the small wins along the way. The goal isn't just a new tech stack; it's a renewed engineering culture that feels empowered, not replaced, by innovation.`
    },
    {
        id: 2,
        title: "Navigating the Edge: Security Implications",
        date: "Sep 15, 2025",
        excerpt: "How edge computing is redefining the perimeter and what CISOs need to know.",
        content: `The traditional security perimeter is dead. With the rise of Edge Computing and IoT, the "fortress" model—where we protect a central data center with high walls—is no longer viable. We are moving compute power closer to where data is generated, which means our attack surface essentially expands to every connected device, sensor, and gateway in the field.

        Securing the edge requires a fundamental shift to a Zero Trust architecture. We must assume that any node can be compromised at any time. This means implementing rigorous identity verification not just for users, but for devices and workloads. Each interaction must be authenticated, authorized, and encrypted, independent of network location.

        Furthermore, observability becomes critical. You cannot protect what you cannot see. Distributed tracing and real-time anomaly detection at the edge are no longer "nice-to-haves"—they are essential survival mechanisms. As we push logic to the edge, security compliance must be baked into the CI/CD pipeline itself, ensuring that security policy is code, not an afterthought.`
    },
    {
        id: 3,
        title: "Leadership in the Age of AI",
        date: "Aug 02, 2025",
        excerpt: "Adapting management styles when your team is augmented by intelligent agents.",
        content: `We are entering an era where "team" no longer just refers to humans. With the integration of AI agents into the software development lifecycle, the role of an engineering leader is evolving from purely managing people to orchestrating hybrid human-AI workflows. This shifts the focus from "how do we write this code?" to "how do we define the problem clearly enough for our agents to solve it?"

        The challenge for leaders is to prevent the commoditization of their workforce. AI should be positioned as an amplifier of human creativity, not a replacement for it. This means encouraging engineers to move up the abstraction ladder—focusing on system architecture, user empathy, and complex reasoning, while delegating the boilerplate generation and test writing to AI.

        However, this also introduces new risks. Over-reliance on generated code can lead to a "knowledge gap" where the team no longer understands the systems they maintain. Effective leadership now requires enforcing rigorous code review standards (even for AI code) and ensuring that "human-in-the-loop" isn't just a buzzword, but a structural necessity in critical decision paths.`
    }
];

export const NAV_LINKS = ["Home", "Projects", "Services", "Blog", "Contact"];
