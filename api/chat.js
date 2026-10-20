import { GoogleGenerativeAI } from '@google/generative-ai';
import { isRateLimited, getClientIp } from './_rateLimit.js';

const MAX_PROMPT_LENGTH = 60000;
const RATE_LIMIT = { limit: 20, windowMs: 5 * 60 * 1000 };

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

    const { prompt } = req.body || {};
    if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: 'A "prompt" string is required.' });
    }
    if (prompt.length > MAX_PROMPT_LENGTH) {
        return res.status(413).json({ error: 'Prompt too long.' });
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent(prompt);
        return res.status(200).json({ text: result.response.text() });
    } catch (error) {
        console.error('Gemini chat error:', error);
        return res.status(502).json({ error: error.message || 'Gemini request failed.' });
    }
}
