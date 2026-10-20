// Simple in-memory cache to prevent redundant API calls
const embeddingCache = new Map();

/**
 * Generates a vector embedding for the given text via the server-side /api/embed
 * function (keeps the Gemini API key out of the client bundle).
 * Caches results to improve performance.
 * @param {string} text
 * @returns {Promise<number[]>} The embedding vector
 */
export const getEmbedding = async (text) => {
    if (!text) return null;

    // Check Cache
    if (embeddingCache.has(text)) {
        console.debug('⚡ Embedding Cache Hit');
        return embeddingCache.get(text);
    }

    try {
        const response = await fetch('/api/embed', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Embedding request failed');

        // Update Cache
        embeddingCache.set(text, data.embedding);

        return data.embedding;
    } catch (error) {
        console.error("❌ Error generating embedding:", { textPreview: text.substring(0, 20), errorMsg: error.message, fullError: error });
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
