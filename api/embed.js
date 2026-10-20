import { GoogleGenerativeAI } from '@google/generative-ai';
import { isRateLimited, getClientIp } from './_rateLimit.js';

const MAX_TEXT_LENGTH = 8000;
const RATE_LIMIT = { limit: 120, windowMs: 5 * 60 * 1000 };

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'AI configuration missing on the server.' });
    }

    if (isRateLimited(getClientIp(req), RATE_LIMIT)) {
        return res.status(429).json({ error: 'Too many requests. Please slow down.' });
    }

    const { text } = req.body || {};
    if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'A "text" string is required.' });
    }
    if (text.length > MAX_TEXT_LENGTH) {
        return res.status(413).json({ error: 'Text too long.' });
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
        const result = await model.embedContent(text);
        return res.status(200).json({ embedding: result.embedding.values });
    } catch (error) {
        console.error('Gemini embed error:', error);
        return res.status(502).json({ error: error.message || 'Gemini request failed.' });
    }
}
