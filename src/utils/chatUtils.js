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
// --- UTILITY: RAG RETRIEVAL (STRICT HYBRID SEARCH V3) ---
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
    const TECH_TRIGGERS = ["rag", "vector", "embedding", "firestore", "firebase", "react", "component", "architecture", "system prompt", "api", "code", "implementation", "database"];
    const isTechQuery = TECH_TRIGGERS.some(trigger => lowerQuery.includes(trigger));
    const shouldIncludeCode = isDevMode || isTechQuery;

    // 1. Prepare Searchable Documents
    let documents = [
        ...projects.map(p => ({ type: 'PROJECT', ...p })),
        ...expertise.map(e => ({ type: 'EXPERTISE', ...e })),
        ...blogs.map(b => ({ type: 'BLOG', ...b })),
    ];

    if (aboutMe) {
        documents.push({ type: 'ABOUT', title: "About Raphael Edwards", ...aboutMe });
    }

    if (shouldIncludeCode) {
        documents = [...documents, ...sourceCodes.map(s => ({ type: 'CODE', ...s }))];
    }

    // 1.5 Inject System Persona as a Searchable Document
    // This allows the RAG to "find" the email/contact info which is defined in the system prompt.
    if (systemContext) {
        documents.push({
            type: 'PERSONA',
            title: 'AI Persona & Core Instructions',
            description: 'The core identity, contact information, and operating rules for the AI.',
            content: systemContext,
            tags: ['email', 'contact', 'identity', 'rules', 'persona', 'raphael', 'system']
        });
    }

    // 2. GENERATE QUERY EMBEDDING
    let queryEmbedding = null;
    try {
        // We attempt to get the embedding for the user's question
        queryEmbedding = await getEmbedding(query);
    } catch (e) {
        console.warn("Failed to generate query embedding, falling back to pure keyword search.", e);
    }

    // 3. HYBRID SCORING ENGINE
    const keywords = lowerQuery.replace(/[?.,!]/g, '').split(/\s+/).filter(w => w.length > 2 && !STOP_WORDS.includes(w));
    if (lowerQuery.includes('rag')) keywords.push('rag');

    const scoredDocs = documents.map(doc => {
        let score = 0;
        let vectorScore = 0;
        let keywordScore = 0;

        // A. VECTOR SCORING (Semantic)
        if (queryEmbedding && doc.embedding) {
            // Calculate Cosine Similarity (Result is usually 0.7 to 1.0 for matches)
            const similarity = cosineSimilarity(queryEmbedding, doc.embedding);

            // Normalize and weight it.
            // Adjusted Threshold: 0.3 (based on production observation of ~0.4-0.5 for relevant docs)
            if (similarity > 0.3) {
                // Scale 0.3-1.0 range to approx 0-100 points
                // (similarity - 0.3) is 0.0 to 0.7
                // 0.7 * 142 ~= 100
                vectorScore = (similarity - 0.3) * 142;
            }
        }

        // B. KEYWORD SCORING (Exact Match)
        const title = doc.title?.toLowerCase() || "";
        const desc = doc.description?.toLowerCase() || "";
        const content = doc.content?.toLowerCase() || "";
        const tags = (doc.tags || []).join(' ').toLowerCase();
        const aboutContent = doc.type === 'ABOUT' ? (doc.bio + " " + doc.leadershipPhilosophy + " " + doc.technicalBackground).toLowerCase() : "";

        keywords.forEach(word => {
            if (title.includes(word)) keywordScore += 50;
            if (desc.includes(word)) keywordScore += 5;
            if (content.includes(word)) keywordScore += 5;
            if (tags.includes(word)) keywordScore += 5;
            if (aboutContent.includes(word)) keywordScore += 10;
        });

        // Boost RAG/Vector specific queries via Keywords if Vector search missed 
        // (This acts as a safety net if embeddings aren't present)
        if (lowerQuery.includes('rag') || lowerQuery.includes('vector')) {
            if (title.includes('vectorutils') || title.includes('chatutils')) {
                keywordScore += 100;
            }
        }

        // C. FINAL SCORE
        // If we have vector score, it usually trumps keyword, but we combine them.
        score = vectorScore + keywordScore;

        return { ...doc, score, vectorScore, keywordScore };
    });

    // 4. Filter and Sort
    const relevantDocs = scoredDocs
        .filter(doc => doc.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 4);

    // 5. Format Output
    if (relevantDocs.length === 0) {
        console.log("[RAG Debug] No relevant documents found.", { query, scores: scoredDocs.filter(d => d.score > 0) });
        return { content: "", confidence: 0 };
    }

    console.log("[RAG Debug] Relevant Docs Found:", relevantDocs.map(d => ({ title: d.title, score: d.score, vector: d.vectorScore, keyword: d.keywordScore })));

    const formattedContent = relevantDocs.map(doc => {
        // Robust Type Normalization
        let docType = doc.type;

        // Handle "source_code" from Firestore or missing type via Extension inference
        if (docType === 'source_code') docType = 'CODE';
        if (!docType && (doc.title.endsWith('.js') || doc.title.endsWith('.jsx') || doc.title.endsWith('.css') || doc.title.endsWith('.json'))) {
            docType = 'CODE';
        }

        const sourceLabel = doc.vectorScore > doc.keywordScore ? " [Semantic Match]" : " [Keyword Match]";
        const prefix = `Doc: ${doc.title} (${Math.round(doc.score)} pts${sourceLabel})`;

        if (docType === 'PROJECT') return `[PROJECT: ${doc.title}]\n${doc.description}\nTechnolgies: ${doc.tags?.join(', ')}`;
        if (docType === 'EXPERTISE') return `[EXPERTISE: ${doc.title}]\n${doc.description}`;
        if (docType === 'BLOG') return `[BLOG: ${doc.title}]\n${doc.excerpt}\n${doc.content?.slice(0, 300)}...`;
        if (docType === 'CODE') return `[SOURCE CODE: ${doc.title}]\n${doc.description}\n---CODE START---\n${doc.content}\n---CODE END---`;
        if (docType === 'ABOUT') return `[BIOGRAPHY]\nBio: ${doc.bio}\nPhilosophy: ${doc.leadershipPhilosophy}\nTechnical Background: ${doc.technicalBackground}`;
        if (docType === 'PERSONA') return `[SYSTEM IDENTITY]\n${doc.content}`;

        // Fallback: Return raw content if type is still unknown, but no error log needed.
        return `[DOC: ${doc.title}]\n${JSON.stringify(doc, null, 2)}`;
    }).join('\n\n------------------------\n\n');

    // console.log("[RAG Context Constructed]"); // Clean logs

    // Confidence Calculation
    // Confidence Calculation
    const highestDoc = relevantDocs[0];
    const highestScore = highestDoc.score;
    let confidence = 0.5;

    // RULE: If the top result is the SYSTEM PERSONA or BIO, we are 95% confident.
    if (highestDoc.type === 'PERSONA' || highestDoc.type === 'ABOUT') {
        confidence = 0.95;
    } else if (highestScore > 40) {
        confidence = 0.9;
    } else if (highestScore > 10) {
        confidence = 0.7;
    }

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
