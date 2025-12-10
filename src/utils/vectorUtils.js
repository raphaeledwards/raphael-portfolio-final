import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Initialize GenAI Lazily
let genAI = null;

// Simple in-memory cache to prevent redundant API calls
const embeddingCache = new Map();

/**
 * Generates a vector embedding for the given text using Gemini.
 * Uses the 'embedding-001' or 'text-embedding-004' model.
 * Caches results to improve performance.
 * @param {string} text 
 * @returns {Promise<number[]>} The embedding vector
 */
export const getEmbedding = async (text) => {
    if (!text || !GEMINI_API_KEY) return null;

    // Check Cache
    if (embeddingCache.has(text)) {
        console.debug('⚡ Embedding Cache Hit');
        return embeddingCache.get(text);
    }

    try {
        if (!genAI) {
            genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        }
        const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
        const result = await model.embedContent(text);
        const embedding = result.embedding.values;

        // Update Cache
        embeddingCache.set(text, embedding);

        return embedding;
    } catch (error) {
        console.error("Error generating embedding:", error);
        // Fallback or rethrow depending on desired strictness
        return null;
    }
};

/**
 * Calculates the Cosine Similarity between two vectors.
 * Returns a score between -1 and 1 (1 being identical).
 * @param {number[]} vecA 
 * @param {number[]} vecB 
 * @returns {number}
 */
export const cosineSimilarity = (vecA, vecB) => {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        magnitudeA += vecA[i] * vecA[i];
        magnitudeB += vecB[i] * vecB[i];
    }

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    if (magnitudeA === 0 || magnitudeB === 0) return 0;

    return dotProduct / (magnitudeA * magnitudeB);
};
