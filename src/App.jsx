import React, { useState, useEffect } from 'react';
import { Terminal, ChevronRight, Users, Lock, Cloud, BrainCircuit, MapPin, Linkedin, Globe, Mail, Menu, X as CloseIcon } from 'lucide-react';

// Mock Data for Projects
const PROJECT_ITEMS = [
  { id: 1, title: "Enterprise Cloud Migration", category: "Cloud", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop", description: "Led the strategic migration of legacy on-premise infrastructure to AWS for a Fortune 500 client." },
  { id: 2, title: "Zero-Trust Security Framework", category: "Cybersecurity", image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000&auto=format&fit=crop", description: "Implemented a comprehensive Zero-Trust architecture across global offices." },
  { id: 3, title: "AI-Driven Analytics Platform", category: "AI & Future Tech", image: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?q=80&w=1000&auto=format&fit=crop", description: "Developed a predictive analytics engine using machine learning." },
  { id: 4, title: "Global Team Restructuring", category: "Strategy", image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1000&auto=format&fit=crop", description: "Redesigned engineering org charts to align with agile methodologies." },
  { id: 5, title: "Edge Computing Rollout", category: "Cybersecurity", image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1000&auto=format&fit=crop", description: "Deployed edge computing nodes for real-time data processing." },
  { id: 6, title: "SaaS Product Launch", category: "Strategy", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1000&auto=format&fit=crop", description: "Go-to-market strategy for a new B2B SaaS platform." }
];

const EXPERTISE_AREAS = [
  { title: "Team Strategy & Growth", icon: Users, description: "Building high-performance cultures and scaling engineering organizations." },
  { title: "Cybersecurity & Edge", icon: Lock, description: "Securing assets in a decentralized world with robust, modern frameworks." },
  { title: "Cloud Computing", icon: Cloud, description: "Architecting scalable, resilient infrastructure for the modern enterprise." },
  { title: "AI & Future Tech", icon: BrainCircuit, description: "Leveraging machine learning and emerging tech to solve complex problems." }
];

const BLOG_POSTS = [
  { id: 1, title: "The Human Element in Digital Transformation", date: "Oct 24, 2024", excerpt: "Why technology is only 20% of the challenge when upgrading legacy systems." },
  { id: 2, title: "Navigating the Edge: Security Implications", date: "Sep 15, 2024", excerpt: "How edge computing is redefining the perimeter and what CISOs need to know." },
  { id: 3, title: "Leadership in the Age of AI", date: "Aug 02, 2024", excerpt: "Adapting management styles when your team is augmented by intelligent agents." }
];

const NAV_LINKS = ["Home", "Projects", "Services", "Blog", "Contact"];

const App = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // FIX: This line defines the categories variable to prevent the crash
  const categories = ["All", ...new Set(PROJECT_ITEMS.map(item => item.category))];
  
  const filteredItems = activeCategory === "All" 
    ? PROJECT_ITEMS 
    : PROJECT_ITEMS.filter(item => item.category === activeCategory);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

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
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1549724103-9c878e1b017b?q=80&w=2000&auto=format&fit=crop" alt="Boston Skyline" className="w-full h-full object-cover opacity-30 grayscale contrast-125" />
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
            Professional Services Director & Technology Leader based in Boston.
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
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Director. Leader.<br/>Problem Solver.</h2>
              <p className="text-neutral-400 text-lg leading-relaxed mb-6">I am a technology executive with over 15 years of experience leading digital transformation and building high-performance engineering cultures in the Boston area.</p>
              <p className="text-neutral-500 text-base leading-relaxed mb-8 italic border-l-2 border-neutral-800 pl-4">When I'm not designing technical strategy, I'm navigating the chaos of raising twins, Malcolm and Carter, with my wife Betsy—the ultimate lesson in crisis management and negotiation.</p>
              <div className="flex gap-6">
                <a href="#" className="flex items-center gap-2 text-white hover:text-rose-500 transition-colors font-bold"><Linkedin size={20} /> LinkedIn</a>
                <a href="#" className="flex items-center gap-2 text-white hover:text-rose-500 transition-colors font-bold"><Globe size={20} /> Github</a>
              </div>
            </div>
             <div className="relative order-1 md:order-2">
              <div className="aspect-square rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 relative z-10 group">
                <img src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1000&auto=format&fit=crop" alt="Raphael J. Edwards" className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
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
                <a href="mailto:raphael@raphaeljedwards.com" className="flex items-center justify-center gap-3 bg-rose-600 text-white px-8 py-4 rounded-md font-bold hover:bg-rose-700 transition-colors"><Mail size={20} /> raphael@raphaeljedwards.com</a>
                <a href="#" className="flex items-center justify-center gap-3 bg-neutral-800 text-white px-8 py-4 rounded-md font-bold hover:bg-neutral-700 transition-colors border border-neutral-700"><Linkedin size={20} /> Connect on LinkedIn</a>
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