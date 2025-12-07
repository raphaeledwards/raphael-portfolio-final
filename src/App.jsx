import React, { useState, useEffect, useRef } from 'react';
import { Terminal, ChevronRight, Users, Lock, Cloud, BrainCircuit, MapPin, Linkedin, Globe, Mail, Menu, X as CloseIcon, MessageSquare, Send } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signOut, signInAnonymously, signInWithCustomToken } from 'firebase/auth';

// --- ASSET CONFIGURATION ---
// IMPORTANT: The live preview here cannot access your local './assets/' folder.
// I have commented these out so the preview works. 
// UNCOMMENT these two lines for your local Vercel build:
 import headshot from './assets/headshot.jpg';
 import bostonSkyline from './assets/boston-skyline.jpg';

// --- GEMINI API CONFIGURATION ---
// GET YOUR KEY HERE: https://aistudio.google.com/app/apikey
//
// 1. FOR PRODUCTION (Vercel/Local):
//    Uncomment the line below to pull the key from your environment variables (.env).
    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

// 2. FOR PREVIEW (Current):
//    We use an empty string here to prevent "import.meta" build errors in this preview.
//const GEMINI_API_KEY = ""; 

// --- FIREBASE SETUP (SAFE MODE) ---
let auth = null;
try {
  if (typeof __firebase_config !== 'undefined') {
    const firebaseConfig = JSON.parse(__firebase_config);
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
  } else {
    console.warn("⚠️ Firebase config not found. Running in Offline/Demo Mode.");
  }
} catch (error) {
  console.error("Firebase initialization failed:", error);
}

// --- ASSETS ---
// 1. FOR LOCAL/VERCEL (Your actual files):
//    Uncomment these lines when running on your machine:
 const HEADSHOT_URL = headshot;
 const BOSTON_SKYLINE_URL = bostonSkyline;

// 2. FOR PREVIEW (Temporary Placeholders):
//const HEADSHOT_URL = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=800&q=80";
//const BOSTON_SKYLINE_URL = "https://images.unsplash.com/photo-1506191845112-c72635417cb3?fit=crop&w=1920&q=80";

// --- MOCK DATA ---
const PROJECT_ITEMS = [
  { id: 1, title: "Connected Vehicle Architecture", category: "Future Tech", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop", description: "Architected the secure Over-The-Air (OTA) delivery framework supporting 1M+ connected vehicles." },
  { id: 2, title: "Secure Financial Transformation", category: "Cybersecurity", image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000&auto=format&fit=crop", description: "Directed the $70M+ services portfolio securing critical cloud workloads for top financial institutions." },
  { id: 3, title: "Operational Intelligence (VMO)", category: "Operational Strategy", image: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?q=80&w=1000&auto=format&fit=crop", description: "Built a Value Management Office (VMO) that leveraged data to save 2,300+ field hours globally." },
  { id: 4, title: "Strategic Revenue Architecture", category: "Revenue Growth", image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1000&auto=format&fit=crop", description: "Architected an incentive program turning a $70k investment into $12M+ in Annual Recurring Revenue." },
  { id: 5, title: "Resilient Engineering Culture", category: "Organizational Strategy", image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1000&auto=format&fit=crop", description: "Established a Blameless Post-Mortem program for 500+ staff to drive continuous security improvements." },
  { id: 6, title: "Global Investment Strategy", category: "Revenue Growth", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1000&auto=format&fit=crop", description: "Led a global growth program converting a $1M investment into $28.8M in new annual recurring revenue." }
];

const EXPERTISE_AREAS = [
  { title: "Team Strategy & Growth", icon: Users, description: "Building high-performance cultures and scaling engineering organizations." },
  { title: "Cybersecurity & Edge", icon: Lock, description: "Securing assets in a decentralized world with robust, modern frameworks." },
  { title: "Cloud Computing", icon: Cloud, description: "Architecting scalable, resilient infrastructure for the modern enterprise." },
  { title: "AI & Future Tech", icon: BrainCircuit, description: "Leveraging machine learning and emerging tech to solve complex problems." }
];

const BLOG_POSTS = [
  { id: 1, title: "The Human Element in Digital Transformation", date: "Oct 24, 2025", excerpt: "Why technology is only 20% of the challenge when upgrading legacy systems." },
  { id: 2, title: "Navigating the Edge: Security Implications", date: "Sep 15, 2025", excerpt: "How edge computing is redefining the perimeter and what CISOs need to know." },
  { id: 3, title: "Leadership in the Age of AI", date: "Aug 02, 2025", excerpt: "Adapting management styles when your team is augmented by intelligent agents." }
];

const NAV_LINKS = ["Home", "Projects", "Services", "Blog", "Contact"];

// --- COMPONENTS ---

const Login = ({ onOfflineLogin }) => {
  const handleLogin = async () => {
    if (auth) {
      try {
        await signInAnonymously(auth);
      } catch (error) {
        console.error("Login failed:", error);
      }
    } else {
      console.log("Running in offline mode - simulating login");
      if (onOfflineLogin) onOfflineLogin();
    }
  };

  return (
    <div className="text-center animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-neutral-900 border border-neutral-800 p-12 rounded-2xl max-w-md w-full shadow-2xl mx-auto">
        <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8 text-rose-500" />
        </div>
        <h2 className="text-2xl font-bold mb-4 text-white">Restricted Access</h2>
        <p className="text-neutral-400 mb-8">
          {auth ? "Identity verification required to access the neural interface." : "Server connection offline. Enter Demo Mode?"}
        </p>
        <button 
          onClick={handleLogin}
          className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-6 rounded-md transition-colors flex items-center justify-center gap-2"
        >
          <Terminal size={18} />
          {auth ? "Authenticate Session" : "Launch Offline Demo"}
        </button>
      </div>
    </div>
  );
};

// --- CHAT INTERFACE ---
const ChatInterface = ({ user }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: `Identity confirmed: ${user?.email || 'Director'}. Accessing neural archives... Hello. I am Raphael's digital twin. Ask me about his architecture philosophy, leadership style, or technical experience.` }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newMessages = [...messages, { role: 'user', text: inputValue }];
    setMessages(newMessages);
    setInputValue("");
    setIsTyping(true);

    if (!GEMINI_API_KEY) {
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          text: "⚠️ MISSING API KEY: I am currently offline. To enable my brain, please add `VITE_GEMINI_API_KEY` to your environment variables." 
        }]);
        setIsTyping(false);
      }, 500);
      return;
    }

    // UPDATED MODEL: Using the confirmed available model from user diagnostics
    const targetModel = "gemini-2.5-flash";

    try {
      const systemPrompt = `
        You are the AI Digital Twin of Raphael J. Edwards. 
        You are a Technology Executive & Services Architect based in Boston.
        Your tone is professional, strategic, yet approachable with a slight cyberpunk/futuristic flair suitable for a high-tech portfolio.
        
        HERE IS YOUR RESUME DATA:
        - Expertise: Team Strategy, Cybersecurity, Cloud Computing, AI & Future Tech.
        - Projects: Connected Vehicle Architecture (OTA for 1M+ cars), Secure Financial Transformation ($70M+ portfolio), Operational Intelligence (VMO saving 2300 hours), Strategic Revenue Architecture ($70k to $12M ARR).
        - Leadership Style: "Building resilient teams. Solving complex problems." You believe in blameless post-mortems and high-performance cultures.
        - Contact: raphael@raphaeljedwards.com.
        
        INSTRUCTIONS:
        - Answer the user's questions based on this data.
        - Be concise and impactful.
        - If asked about something not in the data, politely pivot back to your expertise or offer to contact the real Raphael.
        - Do not make up facts not present here.
      `;

      const historyForApi = newMessages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: systemPrompt }] }, 
            ...historyForApi 
          ]
        })
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      const botResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm having trouble connecting to the neural net right now.";
      setMessages(prev => [...prev, { role: 'assistant', text: botResponse }]);

    } catch (error) {
      console.error("Gemini API Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', text: `Connection Error: ${error.message}.` }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[80vh] bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300">
      {/* Header */}
      <div className="bg-neutral-950 p-4 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div>
          <span className="font-mono text-sm text-neutral-400">NEURAL LINK: <span className="text-green-500">ACTIVE</span></span>
        </div>
        <BrainCircuit className="text-neutral-600" size={20} />
      </div>

      {/* Messages Area */}
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

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="p-4 bg-neutral-950 border-t border-neutral-800 flex gap-4">
        <input 
          type="text" 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter query parameters..."
          className="flex-1 bg-neutral-900 border border-neutral-800 rounded-md px-4 py-3 text-white focus:outline-none focus:border-rose-500 font-mono text-sm transition-colors"
        />
        <button 
          type="submit"
          disabled={!inputValue.trim() || isTyping}
          className="bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 rounded-md transition-colors flex items-center justify-center"
        >
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
  
  // Auth State
  const [user, setUser] = useState(null);
  const [showChat, setShowChat] = useState(false);

  // Categories Calculation
  const categories = ["All", ...new Set(PROJECT_ITEMS.map(item => item.category))];
  
  const filteredItems = activeCategory === "All" 
    ? PROJECT_ITEMS 
    : PROJECT_ITEMS.filter(item => item.category === activeCategory);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    
    // Auth Initialization & Listener
    if (auth) {
      const initAuth = async () => {
          if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
              try {
                  await signInWithCustomToken(auth, __initial_auth_token);
              } catch (e) {
                  console.error("Custom token auth failed", e);
              }
          }
      };
      initAuth();

      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
      });
      return () => {
        window.removeEventListener('scroll', handleScroll);
        unsubscribe();
      };
    } else {
      // Cleanup only for scroll if auth is missing
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const scrollToSection = (id) => {
    setShowChat(false); // Close chat if navigating
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (auth) {
        await signOut(auth);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleOfflineLogin = () => {
    setUser({ uid: 'offline-demo-user', email: 'Offline Director' });
  };

  // Protected Chat Interface
  if (showChat) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans flex flex-col">
        {/* Chat Nav */}
        <nav className="border-b border-neutral-800 p-4 flex justify-between items-center bg-neutral-900">
          <button onClick={() => setShowChat(false)} className="flex items-center gap-2 hover:text-rose-500 transition-colors font-medium">
            <ChevronRight className="rotate-180" size={20} /> Back to Portfolio
          </button>
          
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm text-neutral-400 hidden md:inline">{user.email || 'Anonymous Director'}</span>
                <button onClick={handleLogout} className="text-xs border border-neutral-700 px-3 py-1 rounded hover:bg-neutral-800 transition-colors">Sign Out</button>
              </>
            ) : null}
          </div>
        </nav>

        {/* Auth Logic */}
        <div className="flex-1 flex items-center justify-center p-4">
          {!user ? (
            <Login onOfflineLogin={handleOfflineLogin} />
          ) : (
             <div className="w-full max-w-6xl mx-auto">
                <ChatInterface user={user} />
             </div>
          )}
        </div>
      </div>
    );
  }

  // Main Portfolio Interface
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-rose-600 selection:text-white">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 border-b border-white/5 ${isScrolled ? 'bg-neutral-950/90 backdrop-blur-md py-4 shadow-xl' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3 font-bold text-xl tracking-tight cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div className="bg-rose-600 p-1.5 rounded-md">
              <Terminal className="w-5 h-5 text-white" />
            </div>
            <span>RAPHAEL<span className="text-neutral-500">JEDWARDS</span></span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide uppercase">
            {NAV_LINKS.map(item => (
              <button key={item} onClick={() => scrollToSection(item.toLowerCase())} className="hover:text-rose-500 transition-colors">
                {item}
              </button>
            ))}
            
            {/* New Chat Button */}
            <button 
              onClick={() => setShowChat(true)}
              className="flex items-center gap-2 text-rose-500 font-bold hover:text-white transition-colors"
            >
              <MessageSquare size={16} /> AI Chat
            </button>

            <button className="ml-4 px-5 py-2 border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 hover:border-rose-500 hover:text-rose-500 transition-all rounded-md text-xs font-bold" onClick={() => window.open('/Raphael_Edwards_CV.pdf', '_blank')}>
              Download CV
            </button>
          </div>

          <button className="md:hidden text-neutral-100" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <CloseIcon /> : <Menu />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-neutral-950 border-b border-neutral-800 p-6 flex flex-col gap-4 shadow-2xl">
            {NAV_LINKS.map(item => (
              <button key={item} onClick={() => scrollToSection(item.toLowerCase())} className="text-left py-3 border-b border-neutral-900 hover:text-rose-500 transition-colors uppercase font-medium">
                {item}
              </button>
            ))}
            <button onClick={() => { setShowChat(true); setIsMobileMenuOpen(false); }} className="text-left py-3 border-b border-neutral-900 text-rose-500 font-bold uppercase flex items-center gap-2">
               <MessageSquare size={16} /> AI Assistant
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={BOSTON_SKYLINE_URL} alt="Boston Skyline" className="w-full h-full object-cover opacity-30 grayscale contrast-125" />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/50 to-neutral-950/30" />
          {/* SAFE BACKGROUND PATTERN */}
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')]"></div>
        </div>

        <div className="relative z-10 px-6 max-w-5xl mx-auto mt-16 text-center">
          <div className="inline-block px-3 py-1 mb-6 border border-rose-500/30 rounded-full bg-rose-500/10 text-rose-500 text-xs font-bold tracking-widest uppercase">Technology Leadership</div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-8 leading-none">
            BUILDING <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-600">RESILIENT TEAMS.</span> <br />
            SOLVING <span className="text-white">COMPLEX PROBLEMS.</span>
          </h1>
          <p className="text-lg md:text-2xl text-neutral-400 mb-10 max-w-2xl mx-auto leading-relaxed font-light border-l-4 border-rose-600 pl-6 text-left">
            Technology Executive & Services Architect based in Boston.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => scrollToSection('projects')} className="bg-white text-black px-8 py-4 rounded-sm font-bold hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2">
              View Projects <ChevronRight size={18} />
            </button>
            <button onClick={() => scrollToSection('contact')} className="px-8 py-4 rounded-sm font-bold border border-white/20 hover:bg-white/10 transition-colors backdrop-blur-sm">
              Consulting Inquiries
            </button>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24 bg-neutral-950 border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative order-2 md:order-1">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Architecting Scalable<br/>Digital Success</h2>
              <p className="text-neutral-400 text-lg leading-relaxed mb-6">A technology executive with a "builder" mindset. I don't just manage complexity; I architect the strategic programs that scale global success. From web security to enterprise growth, I lead the high-performance teams that deliver measurable business value.</p>
              <p className="text-neutral-500 text-base leading-relaxed mb-8 italic border-l-2 border-neutral-800 pl-4">Proven by a track record of architecting strategic programs that turn small investments into multi-million dollar recurring revenue loops.</p>
              <div className="flex gap-6">
                <a href="https://www.linkedin.com/in/raphaeljedwards/" className="flex items-center gap-2 text-white hover:text-rose-500 transition-colors font-bold"><Linkedin size={20} /> LinkedIn</a>
                <a href="https://github.com/raphaeledwards" className="flex items-center gap-2 text-white hover:text-rose-500 transition-colors font-bold"><Globe size={20} /> Github</a>
              </div>
            </div>
             <div className="relative order-1 md:order-2">
              <div className="aspect-square rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 relative z-10 group">
                <img src={HEADSHOT_URL} alt="Raphael J. Edwards" className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
                <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/90 to-transparent">
                  <div className="flex items-center gap-2 text-rose-500 mb-1 font-bold"><MapPin size={16} /> Boston, MA</div>
                </div>
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
            {EXPERTISE_AREAS.map((area, idx) => (
              <div key={idx} className="group p-8 rounded-xl bg-neutral-900/50 border border-neutral-800 hover:border-rose-500/50 transition-all hover:-translate-y-1">
                <div className="mb-6 inline-flex p-3 rounded-lg bg-neutral-800 text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-colors"><area.icon size={24} /></div>
                <h3 className="text-xl font-bold mb-3">{area.title}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">{area.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects */}
      <section id="projects" className="py-24 px-6 bg-neutral-900">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Featured Work</h2>
              <p className="text-neutral-400 max-w-xl">A selection of strategic initiatives, technical implementations, and organizational transformations.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeCategory === cat ? 'bg-rose-600 text-white' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white'}`}>{cat}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item) => (
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
             {BLOG_POSTS.map(post => (
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
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;