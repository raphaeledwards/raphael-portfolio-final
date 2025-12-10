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
export const getContextualData = async (query, projects = [], expertise = [], blogs = [], sourceCodes = [], isDevMode = false, systemContext = "") => {
    if (!query) return { content: "", confidence: 0 };

    const lowerQuery = query.toLowerCase();

    // 0. Sensitive Topic Interceptor (Prevents Hallucination on Private Data)
    const SENSITIVE_PHRASES = ["consulting rate", "consulting fee", "hourly rate", "salary", "how much do you charge", "your rate", "cost of services"];
    if (SENSITIVE_PHRASES.some(phrase => lowerQuery.includes(phrase))) {
        return {
            content: "SYSTEM_INJECTION: The user is asking for private financial information (rates/fees/salary). You MUST explicitly REFUSE to provide any numbers. State that your security clearance does not permit discussing financial details and direct them to email Raphael directly.",
            confidence: 1.0
        };
    }

    // 1. Try Vector Search first
    const queryEmbedding = await getEmbedding(query);

    if (queryEmbedding) {
        // Collect all items with embeddings, conditionally including code
        const allItems = [
            ...projects.map(p => ({ type: 'PROJECT', data: p })),
            ...expertise.map(e => ({ type: 'EXPERTISE', data: e })),
            ...blogs.map(b => ({ type: 'BLOG', data: b })),
            ...(isDevMode ? sourceCodes.map(s => ({ type: 'CODE', data: s })) : [])
        ].filter(item => item.data.embedding && Array.isArray(item.data.embedding));

        if (allItems.length > 0) {
            if (isDevMode) console.log(`[RAG] Vector search across ${allItems.length} items.`);

            let relevant = [];
            try {
                const scored = allItems.map(item => ({
                    ...item,
                    score: cosineSimilarity(queryEmbedding, item.data.embedding)
                }));

                // Filter by threshold to remove noise
                relevant = scored
                    .filter(item => item.score > 0.45) // Threshold can be tuned
                    .sort((a, b) => b.score - a.score)
                    .slice(0, isDevMode ? 3 : 5); // Fewer items if code (as code is large)

            } catch (err) {
                console.error("[RAG] Error during vector scoring:", err);
                // Fallback to empty relevant to continue to keyword search if vector fails
            }

            if (relevant.length > 0) {
                if (isDevMode) console.log("[RAG] Vector matches found:", relevant.map(r => r.data.title));
                const highestScore = relevant[0].score;
                const content = relevant.map(match => {
                    const { type, data } = match;
                    if (type === 'PROJECT') return `[PROJECT] ${data.title} (${data.category}): ${data.description}`;
                    if (type === 'EXPERTISE') return `[EXPERTISE] ${data.title}: ${data.description}`;
                    if (type === 'BLOG') return `[BLOG] ${data.title} (${data.date}): ${data.excerpt}`;
                    if (type === 'CODE') return `[SOURCE CODE - ${data.title}]\n${data.description}\n\nCONTENT:\n${data.content}`;
                    return "";
                }).join('\n---\n');
                return { content, confidence: highestScore };
            }
        } else {
            if (isDevMode) console.log("[RAG] No embeddings found on data items. Falling back to Keywords.");
        }
    }

    // 2. Fallback to Keyword Search (Code excluded for now in keyword search to keep it simple)
    // 2. Fallback to Keyword Search (Code excluded for now in keyword search to keep it simple)
    // lowerQuery is already defined above
    const keywords = lowerQuery.split(/\s+/).filter(w => w.length > 2);

    const calculateScore = (item) => {
        let score = 0;
        const stringifiedItem = JSON.stringify(item).toLowerCase();
        keywords.forEach(keyword => {
            if (item.title?.toLowerCase().includes(keyword)) score += 10;
            if (item.category?.toLowerCase().includes(keyword)) score += 5;
            if (item.tags?.some(tag => tag.toLowerCase().includes(keyword))) score += 5;
            if (stringifiedItem.includes(keyword)) score += 1;
        });
        return score;
    };

    const allMatches = [
        ...projects.map(p => ({ type: 'PROJECT', data: p, score: calculateScore(p) })),
        ...expertise.map(e => ({ type: 'EXPERTISE', data: e, score: calculateScore(e) })),
        ...blogs.map(b => ({ type: 'BLOG', data: b, score: calculateScore(b) })),
        ...(isDevMode ? sourceCodes.map(s => ({ type: 'CODE', data: s, score: calculateScore(s) })) : [])
    ].filter(match => match.score > 0).sort((a, b) => b.score - a.score).slice(0, 5);

    if (allMatches.length === 0) return { content: "", confidence: 0.1 }; // Low confidence fallback

    // Normalize keyword score roughly (max expected score ~30 for a good match: Title(10) + Cat(5) + Tag(5) + Content matches)
    let highestScore = Math.min(allMatches[0].score / 30, 0.9);

    // 3. System Context Boost (Core Identity Check)
    // If the query matches the static system prompt (leadership, philosophy, etc.), we should be confident.
    if (systemContext) {
        const systemKeywords = keywords.filter(k =>
            !STOP_WORDS.includes(k.toLowerCase()) &&
            systemContext.toLowerCase().includes(k)
        );

        if (systemKeywords.length >= 1) {
            if (isDevMode) console.log(`[RAG] System Prompt match found for keywords: ${systemKeywords.join(', ')}`);
            // Boost confidence if we hit core identity topics, even if no specific "document" was returned.
            // We return the found RAG content (or empty), but with a boosted confidence score.
            highestScore = Math.max(highestScore, 0.85);
        }
    }

    const content = allMatches.map(match => {
        const { type, data } = match;
        if (type === 'PROJECT') return `[PROJECT] ${data.title} (${data.category}): ${data.description}`;
        if (type === 'EXPERTISE') return `[EXPERTISE] ${data.title}: ${data.description}`;
        if (type === 'BLOG') return `[BLOG] ${data.title} (${data.date}): ${data.excerpt}`;
        if (type === 'CODE') return `[SOURCE CODE - ${data.title}]\n${data.description}\n\nCONTENT:\n${data.content}`;
        return "";
    }).join('\n---\n');

    return { content, confidence: highestScore };
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
