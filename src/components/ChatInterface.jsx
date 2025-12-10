import React, { useState, useEffect, useRef } from 'react';
import { Terminal, ChevronRight, MapPin, Linkedin, Globe, Mail, Menu, X as CloseIcon, MessageSquare, Send, BrainCircuit, Lock, Users, Cloud, Sparkles, LogOut, Code } from 'lucide-react';
import { systemPrompt as externalSystemPrompt } from '../data/resumeContext';
import { getContextualData, logChatEntry, SECTION_SUGGESTIONS, DEV_SUGGESTIONS } from '../utils/chatUtils';

// 2. GEMINI API KEY
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

const ChatInterface = ({ user, projects, expertise, blogs, sourceCodes, onClose, activeSection, onLogout }) => {
    const [messages, setMessages] = useState([
        { role: 'assistant', text: `Identity confirmed: ${user?.email || 'Director'}. Accessing neural archives... Hello. I am Raphael's digital twin. Ask me about his architecture philosophy, leadership style, or technical experience.` }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [isDevMode, setIsDevMode] = useState(false);
    const messagesEndRef = useRef(null);

    // Get current suggestions based on section, fallback to 'home'
    // If Dev Mode is active, show technical queries instead
    const currentSuggestions = isDevMode
        ? DEV_SUGGESTIONS
        : (SECTION_SUGGESTIONS[activeSection] || SECTION_SUGGESTIONS['home']);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (textOverride = null) => {
        // If textOverride is an event (form submit), prevent default
        if (textOverride && textOverride.preventDefault) textOverride.preventDefault();

        // Determine actual text to send
        const textToSend = typeof textOverride === 'string' ? textOverride : inputValue;

        if (!textToSend.trim()) return;

        const userInput = textToSend;
        const newMessages = [...messages, { role: 'user', text: userInput }];
        setMessages(newMessages);
        setInputValue("");
        setIsTyping(true);


        // Standard Gemini API Key from environment
        const apiKey = GEMINI_API_KEY;

        if (!apiKey) {
            // 1. UI ERROR STATE (Hardening)
            setMessages(prev => [...prev, {
                role: 'assistant',
                text: "⚠️ SYSTEM ALERT: AI Configuration Missing.\n\nPlease check your .env file and ensure VITE_GEMINI_API_KEY is set."
            }]);
            setIsTyping(false);
            return;
        }

        const targetModel = "gemini-2.5-flash";

        // 2. AUGMENTATION: Build the final prompt by combining the persona and the relevant data
        // Use externalSystemPrompt (imported from data file)
        let baseContext = typeof externalSystemPrompt !== 'undefined' ? externalSystemPrompt : "You are a helpful assistant.";

        // 1. RETRIEVAL: Pull context based on the current user input
        // Pass dynamic data to RAG, including the baseContext for confidence scoring
        const { content: contextualData, confidence } = await getContextualData(userInput, projects, expertise, blogs, sourceCodes, isDevMode, baseContext);

        // Inject Developer Mode Persona
        if (isDevMode) {
            baseContext += "\n\n[MODE: DEVELOPER] You are now in 'Code Archaeologist' mode. You have access to the actual source code of this application. When answering, cite specific files and lines of code if provided in the context. Explain the architecture and logic like a senior principal engineer conducting a code walkthrough. Be technical, precise, and transparent.";
        }

        // Inject Confidence Instructions if low
        if (confidence < 0.5) {
            baseContext += `\n\n[SYSTEM NOTE: LOW CONFIDENCE (${Math.round(confidence * 100)}%)] The retrieved context is not very strong for this query. Use the term "I'm about ${Math.round(confidence * 100)}% sure on this" or "Raphael might want to clarify" to manage expectations.`;
        }

        const finalSystemPrompt = contextualData
            ? `${baseContext}\n\n[SYSTEM INJECTION: RELEVANT DATA FOUND]\nUse the following specific project details to answer the user's question:\n${contextualData}`
            : baseContext; // Fallback to generic persona if no specific keywords match

        let aiResponse = "I'm having trouble connecting right now.";

        try {
            const historyForApi = newMessages.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }]
            }));

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [
                        { role: 'user', parts: [{ text: finalSystemPrompt }] }, // Use the RAG prompt
                        ...historyForApi
                    ]
                })
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error.message);

            aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || aiResponse;
            setMessages(prev => [...prev, { role: 'assistant', text: aiResponse, confidence }]);

        } catch (error) {
            console.error("Gemini API Error:", error);
            setMessages(prev => [...prev, { role: 'assistant', text: `Connection Error: ${error.message}` }]);
            aiResponse = `Gemini connection failed: ${error.message}`;
        } finally {
            setIsTyping(false);
            // LOG THE CHAT ENTRY
            await logChatEntry(user, userInput, aiResponse);
        }
    };

    return (
        <div className="flex flex-col h-full bg-neutral-900 border-l border-neutral-800 shadow-2xl">
            <div className="bg-neutral-950 p-4 border-b border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div>
                    <span className="font-mono text-sm text-neutral-400">NEURAL LINK: <span className="text-green-500">ACTIVE</span></span>
                </div>
                <div className="flex gap-2">
                    <button onClick={onLogout} className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-rose-500 transition-colors" title="Sign Out"><LogOut size={18} /></button>

                    <button
                        onClick={() => setIsDevMode(!isDevMode)}
                        className={`p-1 rounded transition-colors ${isDevMode ? 'text-blue-400 bg-blue-400/10' : 'text-neutral-400 hover:bg-neutral-800'}`}
                        title={isDevMode ? "Disable Developer Mode" : "Enable Developer Mode"}
                    >
                        <Code size={18} />
                    </button>

                    <button onClick={onClose} className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white transition-colors"><CloseIcon size={20} /></button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6 font-mono text-sm">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-4 rounded-lg ${msg.role === 'user' ? 'bg-rose-600 text-white' : 'bg-neutral-950 border border-neutral-800 text-neutral-300'}`}>
                            <span className="block text-xs opacity-50 mb-1 mb-2 font-bold uppercase tracking-wider flex justify-between items-center">
                                <span>{msg.role === 'user' ? 'You' : 'Raphael AI'}</span>
                                {msg.confidence !== undefined && (
                                    <div className="flex items-center gap-1 group relative" title={`Confidence Score: ${Math.round(msg.confidence * 100)}%`}>
                                        <div className="w-16 h-1 bg-neutral-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${msg.confidence > 0.65 ? 'bg-green-500' : msg.confidence > 0.45 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                style={{ width: `${Math.round(msg.confidence * 100)}%` }}
                                            />
                                        </div>
                                        <span className={`text-[10px] ${msg.confidence > 0.65 ? 'text-green-500' : msg.confidence > 0.45 ? 'text-yellow-500' : 'text-red-500'}`}>
                                            {Math.round(msg.confidence * 100)}%
                                        </span>
                                    </div>
                                )}
                            </span>
                            <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-neutral-950 border border-neutral-800 p-4 rounded-lg flex gap-2 items-center">
                            <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                            <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Suggestion Chips */}
            <div className="px-4 pt-2 pb-0 flex flex-wrap gap-2">
                {currentSuggestions.map((suggestion, idx) => (
                    <button
                        key={`${activeSection}-${idx}`}
                        onClick={() => handleSendMessage(suggestion)}
                        className={`text-xs px-3 py-1.5 rounded-full transition-all animate-in fade-in slide-in-from-bottom-2 duration-300 cursor-pointer flex items-center gap-1 group whitespace-nowrap border ${isDevMode
                            ? 'bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/50 text-blue-400 hover:text-blue-300'
                            : 'bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/20 hover:border-rose-500/50 text-rose-500 hover:text-rose-400'
                            }`}
                    >
                        {isDevMode ? <Code size={10} /> : <Sparkles size={10} className="group-hover:text-amber-400 transition-colors" />}
                        {suggestion}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSendMessage} className="p-4 bg-neutral-950 border-t border-neutral-800 flex gap-4">
                <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Enter query parameters..." className="flex-1 bg-neutral-900 border border-neutral-800 rounded-md px-4 py-3 text-white focus:outline-none focus:border-rose-500 font-mono text-sm transition-colors" />
                <button type="submit" disabled={!inputValue.trim() || isTyping} className="bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 rounded-md transition-colors flex items-center justify-center">
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
};

export default ChatInterface;
