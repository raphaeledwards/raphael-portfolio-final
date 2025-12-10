import { collection, addDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { getEmbedding, cosineSimilarity } from './vectorUtils';

// --- CONFIG: LAZY SUGGESTION CHIPS ---
export const SECTION_SUGGESTIONS = {
    home: ["What is your core leadership philosophy?", "Tell me about your technical background", "How do you scale engineering teams?"],
    about: ["What is your management style?", "Tell me about your journey", "How do you handle conflict?"],
    services: ["Tell me about Zero Trust Security", "How do you approach Cloud Migration?", "What is your compliance experience?"],
    projects: ["What was your most challenging project?", "Tell me about the Event-Driven Architecture", "How did you optimize costs?"],
    blog: ["Summarize your latest insights", "What are the key trends you see?", "Explain your view on AI agents"],
    contact: ["How can we collaborate?", "Are you open to advisory roles?", "What is your consulting rate?"]
};

// --- CONFIG: DEVELOPER MODE SUGGESTIONS ---
export const DEV_SUGGESTIONS = [
    "How does the RAG vector search work?",
    "Show me the source code for the Admin Panel",
    "Explain the Firestore authentication logic",
    "What is the system prompt for the AI?",
    "How are the lazy suggestion chips implemented?"
];

const STOP_WORDS = ["what", "where", "when", "who", "how", "your", "the", "and", "for", "with", "that", "this", "from", "have", "about", "tell", "show", "give"];

// --- UTILITY: RAG RETRIEVAL ---
// --- UTILITY: RAG RETRIEVAL (STRICT SEARCH V2) ---
export const getContextualData = async (query, projects = [], expertise = [], blogs = [], sourceCodes = [], isDevMode = false, systemContext = "", aboutMe = null) => {
    if (!query) return { content: "", confidence: 0 };

    const lowerQuery = query.toLowerCase();

    // 0. Sensitive Topic Interceptor
    const SENSITIVE_PHRASES = ["consulting rate", "consulting fee", "hourly rate", "salary", "how much do you charge", "your rate", "cost of services"];
    if (SENSITIVE_PHRASES.some(phrase => lowerQuery.includes(phrase))) {
        return {
            content: "SYSTEM_INJECTION: The user is asking for private financial information. You must politely refuse and direct them to email Raphael.",
            confidence: 1.0
        };
    }

    // 0.5 Tech Trigger Detection
    // Automatically enable "DevMode" retrieval if the user asks technical questions
    const TECH_TRIGGERS = ["rag", "vector", "embedding", "firestore", "firebase", "react", "component", "architecture", "system prompt", "api", "code", "implementation", "database"];
    const isTechQuery = TECH_TRIGGERS.some(trigger => lowerQuery.includes(trigger));
    const shouldIncludeCode = isDevMode || isTechQuery;

    // 1. Prepare Searchable Documents
    // We flatten everything into a standard format for the search engine
    let documents = [
        ...projects.map(p => ({ type: 'PROJECT', ...p })),
        ...expertise.map(e => ({ type: 'EXPERTISE', ...e })),
        ...blogs.map(b => ({ type: 'BLOG', ...b })),
    ];

    // Add About Me Data (if provided)
    if (aboutMe) {
        documents.push({ type: 'ABOUT', title: "About Raphael Edwards", ...aboutMe });
    }

    // Add Code (If explicitly requested via DevMode or implied via Tech Triggers)
    if (shouldIncludeCode) {
        documents = [...documents, ...sourceCodes.map(s => ({ type: 'CODE', ...s }))];
    }

    // 2. Strict Keyword Search Engine
    // "Vector" means "Vector". Fuzzy matching was the root cause of previous failures.
    const keywords = lowerQuery.replace(/[?.,!]/g, '').split(/\s+/).filter(w => w.length > 2 && !STOP_WORDS.includes(w));

    // Explicitly add 'rag' and 'vector' to keywords if they appear in query, to ensure they aren't filtered out by aggressive stop/short word logic (though they are >2 chars).
    if (lowerQuery.includes('rag')) keywords.push('rag');

    const scoredDocs = documents.map(doc => {
        let score = 0;
        const title = doc.title?.toLowerCase() || "";
        const desc = doc.description?.toLowerCase() || "";
        const content = doc.content?.toLowerCase() || "";
        const tags = (doc.tags || []).join(' ').toLowerCase();

        // Special logic: Flatten objects like "bio" or "philosophy" for ABOUT type
        const aboutContent = doc.type === 'ABOUT' ? (doc.bio + " " + doc.leadershipPhilosophy + " " + doc.technicalBackground).toLowerCase() : "";

        keywords.forEach(word => {
            // CRITICAL: Title matches are worth 100x more. 
            // This ensures "Vector Utils" > "Connected Vehicle" for query "Vector"
            if (title.includes(word)) score += 50;

            // Content matches
            if (desc.includes(word)) score += 5;
            if (content.includes(word)) score += 5;
            if (tags.includes(word)) score += 5;
            if (aboutContent.includes(word)) score += 10; // Boost bio matches
        });

        // --- SPECIFIC KNOWLEDGE BOOSTING ---

        // Boost RAG/Vector related source code when asking about RAG
        if (lowerQuery.includes('rag') || lowerQuery.includes('vector')) {
            if (title.includes('vectorutils') || title.includes('chatutils')) {
                score += 100; // Massive boost to ensure these appear
            }
        }

        // Boost Source Code in general if it matches keywords
        if (doc.type === 'CODE' && shouldIncludeCode && score > 0) {
            score += 20; // Bias towards code in Tech scenarios
        }

        return { ...doc, score };
    });

    // 3. Filter and Sort
    // We only take high quality matches.
    const relevantDocs = scoredDocs
        .filter(doc => doc.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 4); // Top 4 is enough for context window

    // 4. Format Output
    if (relevantDocs.length === 0) {
        return { content: "", confidence: 0 };
    }

    const formattedContent = relevantDocs.map(doc => {
        if (doc.type === 'PROJECT') return `[PROJECT: ${doc.title}]\n${doc.description}\nTechnolgies: ${doc.tags?.join(', ')}`;
        if (doc.type === 'EXPERTISE') return `[EXPERTISE: ${doc.title}]\n${doc.description}`;
        if (doc.type === 'BLOG') return `[BLOG: ${doc.title}]\n${doc.excerpt}\n${doc.content?.slice(0, 300)}...`; // Snippet only for blogs unless very relevant
        if (doc.type === 'CODE') return `[SOURCE CODE: ${doc.title}]\n${doc.description}\n---CODE START---\n${doc.content}\n---CODE END---`;
        if (doc.type === 'ABOUT') return `[BIOGRAPHY]\nBio: ${doc.bio}\nPhilosophy: ${doc.leadershipPhilosophy}\nTechnical Background: ${doc.technicalBackground}`; // Full context for bio
        return "";
    }).join('\n\n------------------------\n\n');

    // Simple confidence calculation
    const highestScore = relevantDocs[0].score;
    let confidence = 0.5;
    if (highestScore > 40) confidence = 0.9;
    else if (highestScore > 10) confidence = 0.7;

    return { content: formattedContent, confidence };
};

// --- UTILITY: LOGGING ---
export const logChatEntry = async (user, userInput, aiResponse) => {
    if (!db) {
        console.warn("Firestore not initialized. Cannot log chat entry.");
        return;
    }

    const userId = auth?.currentUser?.uid || 'anonymous';
    // Using a public path structure for simplicity in this demo.

    try {
        const chatCollection = collection(db, `chat_logs`);

        await addDoc(chatCollection, {
            userId: userId,
            userQuery: userInput,
            aiResponse: aiResponse,
            timestamp: new Date(),
            model: 'gemini-2.5-flash',
            context: 'RAG-Lite'
        });
        console.log("📝 Chat entry logged to Firestore.");
    } catch (e) {
        console.error("Error logging chat entry:", e);
    }
};
