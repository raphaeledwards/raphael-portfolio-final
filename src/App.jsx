import React, { useState, useEffect, useRef } from 'react';
import { Terminal, ChevronRight, MapPin, Linkedin, Globe, Mail, Menu, X as CloseIcon, MessageSquare, Send, BrainCircuit, Lock, Users, Cloud, Sparkles, LogOut, Code } from 'lucide-react';

import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signOut, signInAnonymously, signInWithCustomToken, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

// --- PRODUCTION CONFIGURATION ---

// 1. ASSETS
import headshot from './assets/headshot.jpg';
import bostonSkyline from './assets/boston-skyline.jpg';

// 2. GEMINI API KEY
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

// 3. FIREBASE SETUP
// Imports auth and db directly from your local firebase.js configuration
import { auth, db } from './firebase';

// 4. RESUME CONTEXT (THE BRAIN)
// Imports the external system prompt for the AI persona
import { systemPrompt as externalSystemPrompt } from './data/resumeContext';
import Login from './Login'; // Imported external component
import AdminPanel from './components/AdminPanel'; // Import Admin Panel
import './styles/xray.css'; // Import X-Ray Mode Styles

// --- CONFIG: LAZY SUGGESTION CHIPS ---
const SECTION_SUGGESTIONS = {
  home: ["What is your core leadership philosophy?", "Tell me about your technical background", "How do you scale engineering teams?"],
  about: ["What is your management style?", "Tell me about your journey", "How do you handle conflict?"],
  services: ["Tell me about Zero Trust Security", "How do you approach Cloud Migration?", "What is your compliance experience?"],
  projects: ["What was your most challenging project?", "Tell me about the Event-Driven Architecture", "How did you optimize costs?"],
  blog: ["Summarize your latest insights", "What are the key trends you see?", "Explain your view on AI agents"],
  contact: ["How can we collaborate?", "Are you open to advisory roles?", "What is your consulting rate?"]
};

// --- CONFIG: DEVELOPER MODE SUGGESTIONS ---
const DEV_SUGGESTIONS = [
  "How does the RAG vector search work?",
  "Show me the source code for the Admin Panel",
  "Explain the Firestore authentication logic",
  "What is the system prompt for the AI?",
  "How are the lazy suggestion chips implemented?"
];

// --- DATA ---
import { PROJECT_ITEMS as INITIAL_PROJECTS, EXPERTISE_AREAS as INITIAL_EXPERTISE, BLOG_POSTS as INITIAL_BLOGS, NAV_LINKS } from './data/portfolioData';
import { fetchContent } from './services/contentService';
import { getEmbedding, cosineSimilarity } from './utils/vectorUtils';



// --- UTILITY: RAG RETRIEVAL ---
const getContextualData = async (query, projects, expertise, blogs, sourceCodes = [], isDevMode = false) => {
  if (!query) return "";

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
      const scored = allItems.map(item => ({
        ...item,
        score: cosineSimilarity(queryEmbedding, item.data.embedding)
      }));

      // Filter by threshold to remove noise
      const relevant = scored
        .filter(item => item.score > 0.45) // Threshold can be tuned
        .sort((a, b) => b.score - a.score)
        .slice(0, isDevMode ? 3 : 5); // Fewer items if code (as code is large)

      if (relevant.length > 0) {
        if (isDevMode) console.log("[RAG] Vector matches found:", relevant.map(r => r.data.title));
        return relevant.map(match => {
          const { type, data } = match;
          if (type === 'PROJECT') return `[PROJECT] ${data.title} (${data.category}): ${data.description}`;
          if (type === 'EXPERTISE') return `[EXPERTISE] ${data.title}: ${data.description}`;
          if (type === 'BLOG') return `[BLOG] ${data.title} (${data.date}): ${data.excerpt}`;
          if (type === 'CODE') return `[SOURCE CODE - ${data.title}]\n${data.description}\n\nCONTENT:\n${data.content}`;
          return "";
        }).join('\n---\n');
      }
    } else {
      if (isDevMode) console.log("[RAG] No embeddings found on data items. Falling back to Keywords.");
    }
  }

  // 2. Fallback to Keyword Search (Code excluded for now in keyword search to keep it simple)
  const lowerQuery = query.toLowerCase();
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
    ...blogs.map(b => ({ type: 'BLOG', data: b, score: calculateScore(b) }))
  ].filter(match => match.score > 0).sort((a, b) => b.score - a.score).slice(0, 5);

  if (allMatches.length === 0) return "";

  return allMatches.map(match => {
    const { type, data } = match;
    if (type === 'PROJECT') return `[PROJECT] ${data.title} (${data.category}): ${data.description}`;
    if (type === 'EXPERTISE') return `[EXPERTISE] ${data.title}: ${data.description}`;
    if (type === 'BLOG') return `[BLOG] ${data.title} (${data.date}): ${data.excerpt}`;
    return "";
  }).join('\n---\n');
};

// --- UTILITY: LOGGING ---
const logChatEntry = async (user, userInput, aiResponse) => {
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

// --- COMPONENTS ---

const ICON_MAP = {
  "Users": Users,
  "Lock": Lock,
  "Cloud": Cloud,
  "BrainCircuit": BrainCircuit
};



// 2. CHAT INTERFACE
const ChatInterface = ({ user, projects, expertise, blogs, sourceCodes, onClose, activeSection, onLogout, isDevMode, onToggleDevMode }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: `Identity confirmed: ${user?.email || 'Director'}. Accessing neural archives... Hello. I am Raphael's digital twin. Ask me about his architecture philosophy, leadership style, or technical experience.` }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
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

    // 1. RETRIEVAL: Pull context based on the current user input
    // Pass dynamic data to RAG
    const contextualData = await getContextualData(userInput, projects, expertise, blogs, sourceCodes, isDevMode);

    // 2. AUGMENTATION: Build the final prompt by combining the persona and the relevant data
    // Use externalSystemPrompt (imported from data file)
    let baseContext = typeof externalSystemPrompt !== 'undefined' ? externalSystemPrompt : "You are a helpful assistant.";

    // Inject Developer Mode Persona
    if (isDevMode) {
      baseContext += "\n\n[MODE: DEVELOPER] You are now in 'Code Archaeologist' mode. You have access to the actual source code of this application. When answering, cite specific files and lines of code if provided in the context. Explain the architecture and logic like a senior principal engineer conducting a code walkthrough. Be technical, precise, and transparent.";
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
      setMessages(prev => [...prev, { role: 'assistant', text: aiResponse }]);

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
            onClick={onToggleDevMode}
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
              <span className="block text-xs opacity-50 mb-1 mb-2 font-bold uppercase tracking-wider">{msg.role === 'user' ? 'You' : 'Raphael AI'}</span>
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

const App = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [isDevMode, setIsDevMode] = useState(false);

  // Dynamic Content State
  const [projectItems, setProjectItems] = useState(INITIAL_PROJECTS);
  const [expertiseAreas, setExpertiseAreas] = useState(INITIAL_EXPERTISE);
  const [blogPosts, setBlogPosts] = useState(INITIAL_BLOGS);
  const [sourceCodes, setSourceCodes] = useState([]);

  useEffect(() => {
    const loadContent = async () => {
      const projects = await fetchContent('projects', INITIAL_PROJECTS);
      const expertise = await fetchContent('expertise', INITIAL_EXPERTISE);
      const blogs = await fetchContent('blogs', INITIAL_BLOGS);
      const code = await fetchContent('source_code', []);

      setProjectItems(projects);
      setExpertiseAreas(expertise); // Note: Icons might need re-mapping if fetched from DB (where they are just names/strings)
      setBlogPosts(blogs);
      setSourceCodes(code);
    };
    loadContent();
  }, []);




  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);

    // Section Observer
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.3 // Trigger when 30% of section is visible
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    // Observe all sections
    ['home', 'about', 'services', 'projects', 'blog', 'contact'].forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    // Auth Listener
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        if (currentUser) setShowLoginModal(false);
      });
      return () => {
        window.removeEventListener('scroll', handleScroll);
        unsubscribe();
        observer.disconnect();
      };
    } else {
      return () => {
        window.removeEventListener('scroll', handleScroll);
        observer.disconnect();
      }
    }
  }, []);

  const scrollToSection = (id) => {
    setShowChat(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (auth) await signOut(auth);
      else setUser(null);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleOfflineLogin = () => setUser({ uid: 'offline-demo-user', email: 'Offline Director' });

  /* Removed conditional return for Chat to allow overlay */

  return (
    <div className={`min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-rose-600 selection:text-white ${isDevMode ? 'x-ray-mode' : ''}`}>
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 border-b border-white/5 ${isScrolled ? 'bg-neutral-950/90 backdrop-blur-md py-4 shadow-xl' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3 font-bold text-xl tracking-tight cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="bg-rose-600 p-1.5 rounded-md"><Terminal className="w-5 h-5 text-white" /></div>
            <span>RAPHAEL<span className="text-neutral-500">JEDWARDS</span></span>
          </div>
          <div className="flex items-center gap-8 text-sm font-medium tracking-wide uppercase">
            {NAV_LINKS.map(item => <button key={item} onClick={() => scrollToSection(item.toLowerCase())} className="hover:text-rose-500 transition-colors">{item}</button>)}
            {user && (
              <button onClick={() => setShowAdminPanel(true)} className="flex items-center gap-2 text-rose-500 font-bold hover:text-white transition-colors">
                <Lock size={16} /> Admin
              </button>
            )}
            <button onClick={() => setShowChat(true)} className="flex items-center gap-2 text-rose-500 font-bold hover:text-white transition-colors"><MessageSquare size={16} /> AI Chat</button>
            <button className="ml-4 px-5 py-2 border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 hover:border-rose-500 hover:text-rose-500 transition-all rounded-md text-xs font-bold" onClick={() => window.open('/Raphael_Edwards_CV.pdf', '_blank')}>Download CV</button>
          </div>
          <button className="md:hidden text-neutral-100" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>{isMobileMenuOpen ? <CloseIcon /> : <Menu />}</button>
        </div>
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-neutral-950 border-b border-neutral-800 p-6 flex flex-col gap-4 shadow-2xl">
            {NAV_LINKS.map(item => <button key={item} onClick={() => scrollToSection(item.toLowerCase())} className="text-left py-3 border-b border-neutral-900 hover:text-rose-500 transition-colors uppercase font-medium">{item}</button>)}
            <button onClick={() => { setShowChat(true); setIsMobileMenuOpen(false); }} className="text-left py-3 border-b border-neutral-900 text-rose-500 font-bold uppercase flex items-center gap-2"><MessageSquare size={16} /> AI Assistant</button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={bostonSkyline} alt="Boston Skyline" className="w-full h-full object-cover opacity-30 grayscale contrast-125" />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/50 to-neutral-950/30" />
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')]"></div>
        </div>
        <div className="relative z-10 px-6 max-w-5xl mx-auto mt-16 text-center">
          <div className="inline-block px-3 py-1 mb-6 border border-rose-500/30 rounded-full bg-rose-500/10 text-rose-500 text-xs font-bold tracking-widest uppercase">Technology Leadership</div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-8 leading-none">BUILDING <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-600">RESILIENT TEAMS.</span> <br />SOLVING <span className="text-white">COMPLEX PROBLEMS.</span></h1>
          <p className="text-lg md:text-2xl text-neutral-400 mb-10 max-w-2xl mx-auto leading-relaxed font-light border-l-4 border-rose-600 pl-6 text-left">Technology Executive & Services Architect based in Boston.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => scrollToSection('projects')} className="bg-white text-black px-8 py-4 rounded-sm font-bold hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2">View Projects <ChevronRight size={18} /></button>
            <button onClick={() => scrollToSection('contact')} className="px-8 py-4 rounded-sm font-bold border border-white/20 hover:bg-white/10 transition-colors backdrop-blur-sm">Consulting Inquiries</button>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24 bg-neutral-950 border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative order-2 md:order-1">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Architecting Scalable<br />Digital Success</h2>
              <p className="text-neutral-400 text-lg leading-relaxed mb-6">A technology executive with a "builder" mindset. I don't just manage complexity; I architect the strategic programs that scale global success. From web security to enterprise growth, I lead the high-performance teams that deliver measurable business value.</p>
              <p className="text-neutral-500 text-base leading-relaxed mb-8 italic border-l-2 border-neutral-800 pl-4">Proven by a track record of architecting strategic programs that turn small investments into multi-million dollar recurring revenue loops.</p>
              <div className="flex gap-6">
                <a href="https://www.linkedin.com/in/raphaeljedwards/" className="flex items-center gap-2 text-white hover:text-rose-500 transition-colors font-bold"><Linkedin size={20} /> LinkedIn</a>
                <a href="https://github.com/raphaeledwards" className="flex items-center gap-2 text-white hover:text-rose-500 transition-colors font-bold"><Globe size={20} /> Github</a>
              </div>
            </div>
            <div className="relative order-1 md:order-2">
              <div className="aspect-square rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 relative z-10 group">
                <img src={headshot} alt="Raphael J. Edwards" className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
                <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/90 to-transparent"><div className="flex items-center gap-2 text-rose-500 mb-1 font-bold"><MapPin size={16} /> Boston, MA</div></div>
              </div>
              <div className="absolute inset-0 border-2 border-rose-500/20 rounded-2xl transform translate-x-4 translate-y-4 -z-0"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-24 bg-neutral-950 border-t border-neutral-900">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {expertiseAreas.map((area, idx) => (
              <div key={idx} className="group p-8 rounded-xl bg-neutral-900/50 border border-neutral-800 hover:border-rose-500/50 transition-all hover:-translate-y-1">
                <div className="mb-6 inline-flex p-3 rounded-lg bg-neutral-800 text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                  {/* Handle both icon component or just render a default since DB won't store functions */}
                  {(() => {
                    const IconComponent = area.icon || (area.iconName && ICON_MAP[area.iconName]) || Terminal;
                    return <IconComponent size={24} />;
                  })()}
                </div>
                <h3 className="text-xl font-bold mb-3">{area.title}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">{area.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects */}
      <section id="projects" className="py-24 px-6 bg-neutral-900 relative">
        {isDevMode && <div className="x-ray-tooltip">FIRESTORE READ: 45ms (CACHED)</div>}
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Featured Work</h2>
              <p className="text-neutral-400 max-w-xl">A selection of strategic initiatives, technical implementations, and organizational transformations.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {["All", ...new Set(projectItems.map(item => item.category))].map(cat => <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeCategory === cat ? 'bg-rose-600 text-white' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white'}`}>{cat}</button>)}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(activeCategory === "All" ? projectItems : projectItems.filter(item => item.category === activeCategory)).map((item) => (
              <div key={item.id} className="group flex flex-col bg-neutral-950 rounded-xl overflow-hidden border border-neutral-800 hover:border-rose-500/30 transition-all cursor-pointer" onClick={() => alert(`Viewing: ${item.title}`)}>
                <div className="relative h-64 overflow-hidden">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100" />
                  <div className="absolute top-4 left-4 bg-neutral-950/90 backdrop-blur px-3 py-1 rounded text-xs font-bold text-rose-500 uppercase tracking-wide border border-neutral-800">{item.category}</div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-rose-500 transition-colors">{item.title}</h3>
                  <p className="text-neutral-400 text-sm leading-relaxed mb-4 flex-1">{item.description}</p>
                  <div className="flex items-center text-sm font-bold text-white mt-auto group-hover:translate-x-1 transition-transform">View Case Study <ChevronRight size={16} className="ml-1 text-rose-500" /></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog */}
      <section id="blog" className="py-24 bg-neutral-900">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="flex justify-between items-end mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Latest Insights</h2>
            <button className="text-rose-500 font-bold hover:text-white transition-colors">View All Posts</button>
          </div>
          <div className="space-y-6">
            {blogPosts.map(post => (
              <div key={post.id} className="group block bg-neutral-950 p-8 rounded-xl border border-neutral-800 hover:border-rose-500/40 transition-all cursor-pointer">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                  <h3 className="text-xl font-bold text-white group-hover:text-rose-500 transition-colors">{post.title}</h3>
                  <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide whitespace-nowrap">{post.date}</span>
                </div>
                <p className="text-neutral-400">{post.excerpt}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-24 px-6 bg-neutral-950 border-t border-neutral-900">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-neutral-900 p-8 md:p-16 rounded-3xl border border-neutral-800 text-center relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Let's Solve Something Hard.</h2>
              <p className="text-neutral-400 mb-10 max-w-lg mx-auto">Available for speaking engagements, advisory board roles, and strategic consulting.</p>
              <div className="flex flex-col md:flex-row justify-center gap-6">
                <a href="mailto:raphael@raphaeljedwards.com" className="flex items-center justify-center gap-3 bg-rose-600 text-white px-8 py-4 rounded-md font-bold hover:bg-rose-700 transition-colors"><Mail size={20} /> Email Me!</a>
                <a href="https://www.linkedin.com/in/raphaeljedwards/" className="flex items-center justify-center gap-3 bg-neutral-800 text-white px-8 py-4 rounded-md font-bold hover:bg-neutral-700 transition-colors border border-neutral-700"><Linkedin size={20} /> Connect on LinkedIn</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-900 py-12 bg-neutral-950">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 font-bold text-lg"><Terminal className="w-5 h-5 text-rose-500" /><span>RAPHAEL<span className="text-neutral-500">JEDWARDS</span></span></div>
            <div className="text-neutral-500 text-sm">&copy; {new Date().getFullYear()} Raphael J. Edwards. All rights reserved.</div>
            <div className="flex gap-6">
              <span className="text-xs text-neutral-600 font-medium uppercase tracking-wider">Strategy</span>
              <span className="text-xs text-neutral-600 font-medium uppercase tracking-wider">Cloud</span>

              <span className="text-xs text-neutral-600 font-medium uppercase tracking-wider">Security</span>
              <button onClick={() => user ? setShowAdminPanel(true) : setShowLoginModal(true)} className="text-neutral-800 hover:text-neutral-600 transition-colors" aria-label="Admin Access">
                <Lock size={10} />
              </button>
            </div>
          </div>
        </div>
      </footer>
      <AdminPanel isOpen={showAdminPanel} onClose={() => setShowAdminPanel(false)} />

      {/* Decoupled Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 text-neutral-400 hover:text-white z-10 p-2">
              <CloseIcon size={20} />
            </button>
            <Login onOfflineLogin={handleOfflineLogin} />
          </div>
        </div>
      )}

      {/* CHAT OVERLAY SIDEBAR */}
      <div className={`fixed inset-y-0 right-0 z-[60] w-full md:w-[450px] bg-neutral-900 border-l border-neutral-800 transform transition-transform duration-300 ease-in-out shadow-2xl ${showChat ? 'translate-x-0' : 'translate-x-full'}`}>
        {!user ? (
          <div className="h-full flex flex-col items-center justify-center p-8 relative">
            <button onClick={() => setShowChat(false)} className="absolute top-4 right-4 text-neutral-400 hover:text-white"><CloseIcon /></button>
            <h3 className="text-xl font-bold mb-4">Neural Access Required</h3>
            <Login onOfflineLogin={handleOfflineLogin} />
          </div>
        ) : (
          <ChatInterface
            user={user}
            projects={projectItems}
            expertise={expertiseAreas}
            blogs={blogPosts}
            sourceCodes={sourceCodes}
            onClose={() => setShowChat(false)}
            activeSection={activeSection}
            onLogout={handleLogout}
            isDevMode={isDevMode}
            onToggleDevMode={() => setIsDevMode(!isDevMode)}
          />
        )}
      </div>
      {/* Global X-Ray Overlay for extra effect if needed */}
      {
        isDevMode && (
          <div className="fixed bottom-4 right-4 z-[100] font-mono text-xs text-green-500 bg-black border border-green-500 px-2 py-1 pointer-events-none opacity-80">
            SYS.MONITOR::ACTIVE
          </div>
        )
      }
    </div >
  );
};

export default App;