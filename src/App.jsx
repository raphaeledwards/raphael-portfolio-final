import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { Terminal, ChevronRight, MapPin, Linkedin, Globe, Mail, Menu, X as CloseIcon, MessageSquare, Send, BrainCircuit, Lock, Users, Cloud, Sparkles, LogOut, Code } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth'; // Only keep what is used in App
import { auth } from './firebase';

// 1. ASSETS
import headshot from './assets/headshot.jpg';
import bostonSkyline from './assets/boston-skyline.jpg';

// Lazy Load Heavy Components
const Login = lazy(() => import('./Login'));
const AdminPanel = lazy(() => import('./components/AdminPanel'));
const ChatInterface = lazy(() => import('./components/ChatInterface'));

import Modal from './components/Modal'; // Lightweight, keep eager
import ErrorBoundary from './components/ErrorBoundary'; // NEW IMPORT
import SEO from './components/SEO'; // SEO Component
import ReactionButton from './components/ReactionButton'; // Engagement Component

// --- DATA ---
// --- DATA ---
import { PROJECT_ITEMS as INITIAL_PROJECTS, EXPERTISE_AREAS as INITIAL_EXPERTISE, BLOG_POSTS as INITIAL_BLOGS, FEED_ITEMS, NAV_LINKS } from './data/portfolioData';
import { SOURCE_CODE_MANIFEST } from './data/sourceCodeManifest';
import { fetchContent } from './services/contentService';

const ICON_MAP = {
  "Users": Users,
  "Lock": Lock,
  "Cloud": Cloud,
  "BrainCircuit": BrainCircuit
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
  const [selectedItem, setSelectedItem] = useState(null); // For Modal

  // Featured Work Tabs
  const [activeWorkTab, setActiveWorkTab] = useState('work'); // 'work' | 'feed'

  // Blog Filtering & Pagination
  const [sortOrder, setSortOrder] = useState('newest');
  const [selectedTag, setSelectedTag] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 3;

  // Dynamic Content State
  const [projectItems, setProjectItems] = useState(INITIAL_PROJECTS);
  const [expertiseAreas, setExpertiseAreas] = useState(INITIAL_EXPERTISE);
  const [blogPosts, setBlogPosts] = useState(INITIAL_BLOGS);
  const [sourceCodes, setSourceCodes] = useState([]);

  const loadContent = async () => {
    // Determine source code fallback logic
    // We prioritize Firestore, but if empty/error, we use local manifest.
    // PASS USER STATE to ensure connection
    const sourceCode = await fetchContent('source_code', SOURCE_CODE_MANIFEST, user);
    setSourceCodes(sourceCode.map(s => ({ ...s, type: 'source_code' })));

    // Other content
    const projects = await fetchContent('projects', INITIAL_PROJECTS, user);
    const expertise = await fetchContent('expertise', INITIAL_EXPERTISE, user);
    const blogs = await fetchContent('blogs', INITIAL_BLOGS, user);

    setProjectItems(projects.map(p => ({ ...p, type: 'project' })));
    setExpertiseAreas(expertise); // Expertise doesn't use modal/reactions yet
    setBlogPosts(blogs.map(b => ({ ...b, type: 'blog' })));
  };

  useEffect(() => {
    loadContent();
  }, [user]); // Re-fetch on auth change to ensure we get DB access if rules require it



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
  const handleViewItem = (item) => setSelectedItem(item);

  /* Removed conditional return for Chat to allow overlay */

  const getPageTitle = (section) => {
    switch (section) {
      case 'about': return 'About Me';
      case 'services': return 'Services & Expertise';
      case 'projects': return 'Featured Projects';
      case 'blog': return 'Insights & Blog';
      case 'contact': return 'Contact';
      default: return ''; // Default uses full site title
    }
  };

  const getCollectionName = (type) => {
    if (type === 'source_code') return 'source_code';
    if (type === 'project') return 'projects';
    return 'blogs';
  };

  const handleReactionUpdate = (collectionName, docId, newCount) => {
    // Helper to update specific list
    const updateList = (list) => list.map(item => item.id === docId ? { ...item, reactionCount: newCount } : item);

    if (collectionName === 'projects') setProjectItems(prev => updateList(prev));
    if (collectionName === 'blogs') setBlogPosts(prev => updateList(prev));
    if (collectionName === 'source_code') setSourceCodes(prev => updateList(prev));

    // Update selected item if it matches
    if (selectedItem && selectedItem.id === docId) {
      setSelectedItem(prev => ({ ...prev, reactionCount: newCount }));
    }
  };

  return (
    <ErrorBoundary>
      <SEO title={getPageTitle(activeSection)} />
      <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-rose-600 selection:text-white">
        {/* Navigation */}
        <nav className={`fixed w-full z-50 transition-all duration-300 border-b border-white/5 ${isScrolled ? 'bg-neutral-950/90 backdrop-blur-md py-4 shadow-xl' : 'bg-transparent py-6'}`}>
          <div className="container mx-auto px-6 flex justify-between items-center">
            <div className="flex items-center gap-3 font-bold text-xl tracking-tight cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="bg-rose-600 p-1.5 rounded-md"><Terminal className="w-5 h-5 text-white" /></div>
              <span>RAPHAEL<span className="text-neutral-500">JEDWARDS</span></span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide uppercase">
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
            <h2 className="sr-only">Services & Expertise</h2>
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
        <section id="projects" className="py-24 px-6 bg-neutral-900">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div>
                <h2 className="text-3xl md:text-5xl font-bold mb-4">Featured Work</h2>
                <div className="flex gap-6 border-b border-neutral-800">
                  <button
                    onClick={() => setActiveWorkTab('work')}
                    className={`pb-4 text-sm font-bold uppercase tracking-wider transition-all ${activeWorkTab === 'work' ? 'text-rose-500 border-b-2 border-rose-500' : 'text-neutral-500 hover:text-white'}`}
                  >
                    Selected Projects
                  </button>
                  <button
                    onClick={() => setActiveWorkTab('feed')}
                    className={`pb-4 text-sm font-bold uppercase tracking-wider transition-all ${activeWorkTab === 'feed' ? 'text-rose-500 border-b-2 border-rose-500' : 'text-neutral-500 hover:text-white'}`}
                  >
                    Director's Cut
                  </button>
                </div>
              </div>

              {activeWorkTab === 'work' && (
                <div className="flex flex-wrap gap-2">
                  {["All", ...new Set(projectItems.map(item => item.category))].map(cat => <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeCategory === cat ? 'bg-rose-600 text-white' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white'}`}>{cat}</button>)}
                </div>
              )}
            </div>

            {/* Tab 1: Selected Projects */}
            {activeWorkTab === 'work' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {(activeCategory === "All" ? projectItems : projectItems.filter(item => item.category === activeCategory)).map((item) => (
                  <div key={item.id} className="group flex flex-col bg-neutral-950 rounded-xl overflow-hidden border border-neutral-800 hover:border-rose-500/30 transition-all cursor-pointer" onClick={() => handleViewItem(item)}>
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
            )}

            {/* Tab 2: Director's Cut Feed */}
            {activeWorkTab === 'feed' && (
              <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <p className="text-neutral-400 mb-8 italic border-l-2 border-neutral-800 pl-4">
                  "The noise ratio in tech is too high. This is my signal. A curated feed of the artifacts that are actually shaping my thinking, annotated with why they matter."
                </p>
                <div className="grid gap-6">
                  {FEED_ITEMS.map((item) => (
                    <div key={item.id} className="bg-neutral-950 border border-neutral-800 rounded-xl p-8 hover:border-rose-500/30 transition-colors group">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="bg-neutral-900 text-white px-3 py-1 rounded text-xs font-bold uppercase tracking-wider border border-neutral-800">{item.source}</span>
                        <span className="text-rose-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1"><Terminal size={12} /> {item.topic}</span>
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold text-white mb-6 group-hover:text-rose-500 transition-colors">
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2">
                          {item.title}
                          <ChevronRight size={20} className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      </h3>

                      <div className="relative pl-6 border-l-2 border-rose-500/50">
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-neutral-950 border-2 border-rose-500 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                        </div>
                        <p className="text-neutral-300 italic leading-relaxed">
                          <span className="text-rose-500 font-bold not-italic mr-2">Raphael's Note:</span>
                          {item.note}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Blog */}
        <section id="blog" className="py-24 bg-neutral-900">
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="flex justify-between items-end mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Latest Insights</h2>
            </div>
            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-6 mb-12 justify-between items-start md:items-center">
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="bg-neutral-900 border border-neutral-800 text-white rounded-lg px-4 py-2 appearance-none cursor-pointer hover:border-rose-500 transition-colors pr-10 font-bold text-sm"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500">
                  <ChevronRight size={14} className="rotate-90" />
                </div>
              </div>

              {/* Tag Filter */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => { setSelectedTag(null); setCurrentPage(1); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${!selectedTag ? 'bg-rose-600 text-white' : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:border-rose-500 hover:text-white'}`}
                >
                  All
                </button>
                {[...new Set(blogPosts.flatMap(post => post.tags || []))].map(tag => (
                  <button
                    key={tag}
                    onClick={() => { setSelectedTag(tag); setCurrentPage(1); }}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${selectedTag === tag ? 'bg-rose-600 text-white' : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:border-rose-500 hover:text-white'}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Content List */}
            <div className="space-y-6">
              {(() => {
                let filtered = [...blogPosts];

                // 1. Filter by Tag
                if (selectedTag) {
                  filtered = filtered.filter(post => post.tags && post.tags.includes(selectedTag));
                }

                // 2. Sort
                filtered.sort((a, b) => {
                  const dateA = new Date(a.date);
                  const dateB = new Date(b.date);
                  return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
                });

                // 3. Paginate
                const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
                const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

                return (
                  <>
                    {paginated.map(post => (
                      <div key={post.id} onClick={() => handleViewItem(post)} className="group block bg-neutral-950 p-8 rounded-xl border border-neutral-800 hover:border-rose-500/40 transition-all cursor-pointer">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                          <h3 className="text-xl font-bold text-white group-hover:text-rose-500 transition-colors">{post.title}</h3>
                          <div className="flex items-center gap-4">
                            <div className="flex gap-2">
                              {post.tags?.slice(0, 2).map(tag => (
                                <span key={tag} className="text-[10px] font-bold uppercase tracking-wider bg-neutral-900 text-neutral-500 px-2 py-1 rounded">{tag}</span>
                              ))}
                            </div>
                            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide whitespace-nowrap">{post.date}</span>
                          </div>
                        </div>
                        <p className="text-neutral-400">{post.excerpt}</p>
                        <div className="mt-4 flex items-center justify-between">
                          <div className="text-sm font-bold text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">Read Article <ChevronRight size={14} /></div>
                          <div onClick={(e) => e.stopPropagation()}>
                            <ReactionButton
                              collectionName="blogs"
                              docId={post.id}
                              initialCount={post.reactionCount}
                              onReaction={(newCount) => handleReactionUpdate('blogs', post.id, newCount)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex justify-center items-center gap-4 mt-12 bg-neutral-900/50 p-4 rounded-full w-fit mx-auto border border-neutral-800">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className={`p-2 rounded-full transition-colors ${currentPage === 1 ? 'text-neutral-600 cursor-not-allowed' : 'text-white hover:bg-neutral-800 hover:text-rose-500'}`}
                        >
                          <ChevronRight size={20} className="rotate-180" />
                        </button>
                        <span className="text-sm font-bold text-neutral-400">Page <span className="text-white">{currentPage}</span> of {totalPages}</span>
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className={`p-2 rounded-full transition-colors ${currentPage === totalPages ? 'text-neutral-600 cursor-not-allowed' : 'text-white hover:bg-neutral-800 hover:text-rose-500'}`}
                        >
                          <ChevronRight size={20} />
                        </button>
                      </div>
                    )}
                  </>
                );
              })()}
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
        <Suspense fallback={null}>
          <AdminPanel isOpen={showAdminPanel} onClose={() => setShowAdminPanel(false)} />
        </Suspense>

        {/* Decoupled Login Modal */}
        {showLoginModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
              <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 text-neutral-400 hover:text-white z-10 p-2">
                <CloseIcon size={20} />
              </button>
              <Suspense fallback={<div className="h-48 flex items-center justify-center text-white">Loading...</div>}>
                <Login onOfflineLogin={handleOfflineLogin} />
              </Suspense>
            </div>
          </div>
        )}

        {/* Content Modal */}
        <Modal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} title={selectedItem?.title || "Details"}>
          {selectedItem && (
            <div>
              {selectedItem.image && (
                <img src={selectedItem.image} alt={selectedItem.title} className="w-full h-64 object-cover rounded-xl mb-6 border border-neutral-800" />
              )}
              {selectedItem.category && (
                <span className="inline-block px-2 py-1 bg-neutral-800 text-rose-500 text-xs font-bold uppercase rounded mb-4">{selectedItem.category}</span>
              )}
              <p className="whitespace-pre-wrap leading-relaxed mb-6">{selectedItem.content || selectedItem.description}</p>

              <div className="flex justify-end border-t border-neutral-800 pt-4">
                <ReactionButton
                  collectionName={getCollectionName(selectedItem.type)}
                  docId={selectedItem.id}
                  initialCount={selectedItem.reactionCount}
                  onReaction={(newCount) => handleReactionUpdate(getCollectionName(selectedItem.type), selectedItem.id, newCount)}
                />
              </div>
            </div>
          )}
        </Modal>

        {/* CHAT OVERLAY SIDEBAR */}
        <div className={`fixed inset-y-0 right-0 z-[60] w-full md:w-[450px] bg-neutral-900 border-l border-neutral-800 transform transition-transform duration-300 ease-in-out shadow-2xl ${showChat ? 'translate-x-0' : 'translate-x-full'}`}>
          {!user ? (
            <div className="h-full flex flex-col items-center justify-center p-8 relative">
              <button onClick={() => setShowChat(false)} className="absolute top-4 right-4 text-neutral-400 hover:text-white"><CloseIcon /></button>
              <h3 className="text-xl font-bold mb-4">Neural Access Required</h3>
              <Suspense fallback={<div className="text-white">Loading...</div>}>
                <Login onOfflineLogin={handleOfflineLogin} />
              </Suspense>
            </div>
          ) : (
            <Suspense fallback={<div className="h-full flex items-center justify-center text-rose-500 font-bold">Initializing AI...</div>}>
              <ChatInterface
                user={user}
                projects={projectItems}
                expertise={expertiseAreas}
                blogs={blogPosts}
                sourceCodes={sourceCodes}
                onClose={() => setShowChat(false)}
                activeSection={activeSection}
                onLogout={handleLogout}
              />
            </Suspense>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default App;