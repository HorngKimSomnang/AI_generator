import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Code2,
  FileText,
  Github,
  Sparkles,
  Loader2,
  Terminal,
  ChevronRight,
  Sun,
  Moon,
  Zap,
  Brain,
  FileCheck,
  TrendingUp,
  ChevronDown,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FeatureCard = ({ icon, title, reasoning, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay }}
    className="premium-card p-10 rounded-3xl hover:border-brand-primary/30 group bg-bg-card/40 backdrop-blur-sm"
  >
    <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-brand-primary/20 transition-all duration-500">
      {icon}
    </div>
    <h3 className="text-2xl font-bold mb-4 tracking-tight">{title}</h3>
    <p className="text-slate-500 text-sm leading-relaxed font-medium">
      <span className="text-brand-primary font-bold mr-1.5 opacity-80 uppercase tracking-widest text-[10px]">Reasoning:</span>
      {reasoning}
    </p>
  </motion.div>
);

const CustomDropdown = ({ value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-4 bg-brand-primary text-white text-[10px] font-black uppercase tracking-[0.2em] pl-6 pr-5 py-3 rounded-xl shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/40 transition-all outline-none border-none hover:-translate-y-0.5 active:translate-y-0"
      >
        <span>{value}</span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 5, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full left-0 mt-2 w-48 bg-bg-card/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-[150] overflow-hidden"
          >
            <div className="py-2">
              {options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-5 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors hover:bg-white/5 ${value === opt ? 'text-brand-primary bg-brand-primary/5' : 'text-slate-400'
                    }`}
                >
                  {opt}
                  {value === opt && <Check size={12} />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function App() {
  const [code, setCode] = useState('');
  const [documentation, setDocumentation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [language, setLanguage] = useState('JS');
  const [copied, setCopied] = useState(false);
  const [activePage, setActivePage] = useState('engine');
  const [streamingDocumentation, setStreamingDocumentation] = useState('');
  const [isAnnual, setIsAnnual] = useState(false);
  
  // Engine Config State
  const [detailLevel, setDetailLevel] = useState('Standard');
  const [outputFormat, setOutputFormat] = useState('Standard DocBlocks');
  const [tone, setTone] = useState('Technical');
  const [selectedPlan, setSelectedPlan] = useState('Starter');
  const abortControllerRef = useRef(null);
  const streamingIntervalRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  // Typewriter effect simulation
  const simulateStreaming = (text) => {
    if (!text) return;
    // Clear any existing intervals if we restart
    if (streamingIntervalRef.current) clearInterval(streamingIntervalRef.current);
    
    setStreamingDocumentation(text.charAt(0));
    let i = 1;
    streamingIntervalRef.current = setInterval(() => {
      if (i >= text.length) {
        clearInterval(streamingIntervalRef.current);
        return;
      }
      setStreamingDocumentation((prev) => prev + text.charAt(i));
      i++;
    }, 15);
  };

  const validateCode = () => {
    const codeSample = code.trim();
    if (language === 'JS') {
      const jsMarkers = ['const', 'let', 'var', 'function', '=>', 'import', 'export'];
      if (!jsMarkers.some(m => codeSample.includes(m)) && codeSample.includes('$')) {
        return "Detected PHP code. Please switch the language dropdown to PHP and try again.";
      }
    } else if (language === 'PHP') {
      if (!codeSample.includes('$') && !codeSample.includes('<?php') && codeSample.includes('const')) {
        return "Detected JavaScript code. Please switch the language dropdown to JS and try again.";
      }
    }
    return null;
  };

  const handleGenerate = async () => {
    if (!code.trim() || isLoading) return;

    const validationError = validateCode();
    if (validationError) {
      setError(validationError);
      return;
    }

    // Abort previous request
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);
    setDocumentation('');
    setStreamingDocumentation('');

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await axios.post(`${API_URL}/api/generate-docs`, {
        code,
        language,
        detailLevel,
        outputFormat,
        tone
      }, { signal: abortControllerRef.current.signal });
      
      const result = response.data.documentation;
      
      // If the AI output is a formatted error string, treat it as a UI error
      if (result.startsWith('Error:')) {
        setError(result);
        setIsLoading(false);
        return;
      }

      setDocumentation(result);
      simulateStreaming(result);
    } catch (err) {
      if (axios.isCancel(err)) return;
      console.error('Error generating docs:', err);
      setError(err.response?.data?.details || err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = (newLanguage) => {
    // Kill active synthesis immediately
    if (abortControllerRef.current) abortControllerRef.current.abort();
    if (streamingIntervalRef.current) clearInterval(streamingIntervalRef.current);
    
    setLanguage(newLanguage);
    setIsLoading(false);
    setError(null);
    setDocumentation('');
    setStreamingDocumentation('');
  };

  const downloadAsMarkdown = () => {
    const element = document.createElement("a");
    const file = new Blob([documentation], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = "documentation.md";
    document.body.appendChild(element);
    element.click();
  };

  const languages = ['JS', 'PHP'];

  return (
    <div className="min-h-screen flex flex-col transition-all duration-700 font-sans selection:bg-brand-primary/40 selection:text-white bg-bg-dark text-slate-400">

      {/* Mesh Background */}
      <div className="mesh-gradient" />

      {/* Navbar */}
      <nav className="px-12 py-8 flex items-center justify-between border-b border-white/[0.04] backdrop-blur-2xl sticky top-0 z-[100] transition-all bg-bg-dark/80">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4 group cursor-pointer"
        >
          <div className="w-12 h-12 bg-gradient-to-tr from-brand-primary to-brand-secondary rounded-2xl flex items-center justify-center shadow-[0_8px_30px_rgba(99,102,241,0.4)] group-hover:scale-105 transition-transform duration-500 rotate-3 group-hover:rotate-0">
            <Sparkles className="text-white" size={26} />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black text-brand-text-white tracking-tighter uppercase leading-none italic">DocGen</span>
            <span className="text-[10px] font-bold tracking-[0.3em] text-brand-primary/80 uppercase mt-1">Advanced Engine</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-10"
        >
          <div className="hidden lg:flex items-center gap-10">
            <button onClick={() => setActivePage('engine')} className={`nav-link !text-[11px] uppercase tracking-[0.2em] font-black hover:scale-95 ${activePage === 'engine' ? 'text-brand-primary' : ''}`}>Engine</button>
            <button onClick={() => setActivePage('docs')} className={`nav-link !text-[11px] uppercase tracking-[0.2em] font-black hover:scale-95 ${activePage === 'docs' ? 'text-brand-primary' : ''}`}>Docs</button>
            <button onClick={() => setActivePage('pricing')} className={`nav-link !text-[11px] uppercase tracking-[0.2em] font-black hover:scale-95 ${activePage === 'pricing' ? 'text-brand-primary' : ''}`}>Pricing</button>
          </div>

          <div className="h-5 w-[1px] bg-white/10 hidden md:block" />

          <div className="flex items-center gap-6">
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-brand-primary/30 transition-all flex items-center justify-center text-slate-400 hover:text-white group"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={18} className="group-hover:rotate-45 transition-transform" /> : <Moon size={18} className="group-hover:-rotate-12 transition-transform" />}
            </button>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="p-2 text-slate-400 hover:text-white transition-all hover:scale-110">
              <Github size={24} />
            </a>
          </div>
        </motion.div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-12 py-20 flex flex-col gap-24 relative z-10">

        <AnimatePresence mode="wait">
          {activePage === 'engine' && (
            <motion.div
              key="engine-page"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col gap-24"
            >
              <div className="flex flex-col items-center text-center gap-6 mb-8">
                <div className="px-4 py-2 rounded-full bg-brand-primary/5 border border-brand-primary/10 text-[10px] uppercase font-black tracking-[0.3em] text-brand-primary mb-4 animate-pulse">
                  The Documentation Engine
                </div>
                <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-none text-text-white">
                  Your Code, <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-indigo-400 to-brand-secondary">Documented.</span>
                </h1>
                <p className="text-xl text-slate-500 max-w-2xl font-medium leading-relaxed mt-4">
                  Transform messy snippets into professional documentation with advanced few-shot prompting and complexity analysis.
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-10 items-start mt-20">
                {/* Script Input */}
                <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="flex flex-col gap-6">
                  <div className="flex items-center px-2">
                    <div className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-text-white/60">
                      <Code2 size={18} className="text-brand-primary" />
                      <span>Script Input</span>
                    </div>
                  </div>
                  <div className="relative group/input">
                    <div className="absolute -inset-[1px] bg-gradient-to-r from-brand-primary via-transparent to-brand-secondary rounded-3xl opacity-40 group-focus-within/input:opacity-100 transition-opacity duration-700 blur-[2px]" />
                    <div className="relative premium-card rounded-3xl overflow-hidden backdrop-blur-3xl bg-bg-card/60 h-[480px]">
                      <div className="absolute top-6 left-8 right-8 z-[110] flex items-center justify-between pointer-events-none">
                        <div className="pointer-events-auto">
                          <CustomDropdown value={language} onChange={handleLanguageChange} options={languages} />
                        </div>
                        <div className="pointer-events-auto">
                          <button
                            onClick={handleGenerate}
                            disabled={!code.trim() || isLoading}
                            className="px-6 py-2.5 bg-brand-primary text-white rounded-xl transition-all font-black text-[10px] uppercase tracking-widest shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-30 disabled:hover:translate-y-0 flex items-center gap-2"
                          >
                            {isLoading ? <><Loader2 className="animate-spin" size={14} /><span>Processing...</span></> : <><Sparkles size={14} /><span>Run Synthesis</span></>}
                          </button>
                        </div>
                      </div>
                      <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="// Paste your logic here..."
                        className="code-area h-full !pl-10 !pr-0 !pt-28 !pb-20 placeholder-slate-800 custom-scrollbar relative z-10"
                        spellCheck="false"
                        disabled={isLoading}
                      />

                      {/* Floating Engine Status Indicator */}
                      <div className="absolute bottom-6 left-8 flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/[0.04] px-4 py-2 rounded-lg border border-white/[0.06] backdrop-blur-md z-[120]">
                        <motion.div 
                          animate={{ 
                            scale: code.length > 0 ? [1, 1.4, 1] : 1,
                            opacity: code.length > 0 ? [0.6, 1, 0.6] : 0.6
                          }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" 
                        />
                        Neural Engine Active
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Result Section */}
                <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="flex flex-col gap-6">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-text-white/60">
                      <FileText size={18} className="text-brand-secondary" />
                      <span>GENERATED SYNTHESIS</span>
                    </div>
                  </div>
                  <div className="relative group/result">
                    <div className={`absolute -inset-[1px] bg-gradient-to-r from-brand-secondary via-transparent to-brand-primary rounded-3xl transition-opacity duration-700 blur-[2px] ${documentation ? 'opacity-40' : 'opacity-10'}`} />
                    <div className="relative premium-card rounded-3xl h-[480px] overflow-hidden backdrop-blur-3xl bg-bg-card/60">
                      <div className="absolute top-6 right-8 z-[110] flex items-center gap-3">
                        {documentation && (
                          <>
                            <button
                              onClick={downloadAsMarkdown}
                              className="px-8 py-2.5 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-lg bg-brand-primary text-white shadow-brand-primary/20 hover:shadow-brand-primary/40 hover:-translate-y-0.5 active:translate-y-0"
                            >
                              <span>Download</span>
                            </button>
                            <button
                              onClick={() => { navigator.clipboard.writeText(documentation); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                              className={`px-8 py-2.5 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-lg hover:-translate-y-0.5 active:translate-y-0 ${copied ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-brand-secondary text-white shadow-brand-secondary/20 hover:shadow-brand-secondary/40'}`}
                            >
                              {copied ? <Check size={14} /> : <span>Copy</span>}
                            </button>
                          </>
                        )}
                      </div>
                      <div key={language} className="prose max-w-none prose-brand dark:prose-invert overflow-y-auto overflow-x-hidden h-full !pl-10 !pr-4 custom-scrollbar !pt-28 !pb-20">
                        {error ? (
                          <div className="flex flex-col items-center text-center gap-6 py-4">
                            <Terminal size={40} className="text-red-500/50" />
                            <div>
                              <h3 className="text-xl font-black uppercase tracking-widest text-text-white mb-2">Synthesis Failed</h3>
                              <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed px-4">{error}</p>
                            </div>
                          </div>
                        ) : isLoading ? (
                          <div className="h-full flex flex-col items-center justify-center relative">
                            {/* Neural Scan Bar */}
                            <motion.div 
                              initial={{ top: "0%" }}
                              animate={{ top: "100%" }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                              className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-primary to-transparent z-[150] opacity-50 shadow-[0_0_20px_rgba(99,102,241,0.5)]"
                            />
                            <div className="flex flex-col gap-4 w-full px-10">
                              <div className="h-4 w-3/4 bg-white/5 rounded-full overflow-hidden relative">
                                <motion.div animate={{ x: ['-100%', '100%'] }} transition={{ duration: 1.5, repeat: Infinity }} className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-primary/20 to-transparent" />
                              </div>
                              <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden relative">
                                <motion.div animate={{ x: ['-100%', '100%'] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }} className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-secondary/20 to-transparent" />
                              </div>
                              <div className="h-4 w-5/6 bg-white/5 rounded-full overflow-hidden relative">
                                <motion.div animate={{ x: ['-100%', '100%'] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }} className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-primary/20 to-transparent" />
                              </div>
                            </div>
                            <span className="mt-10 text-[10px] uppercase font-black tracking-[0.3em] text-brand-primary animate-pulse">Scanning Logic...</span>
                          </div>
                        ) : streamingDocumentation ? (
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{streamingDocumentation}</ReactMarkdown>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center text-center gap-8 py-20">
                            <div className="w-20 h-20 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center animate-float">
                              <ChevronRight size={40} className="text-slate-600" />
                            </div>
                            <p className="text-xl font-medium text-slate-500 tracking-tight">Awaiting input... <br /></p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Core Features */}
              <section className="pt-40 border-t border-white/[0.06] flex flex-col gap-24">
                <div className="flex flex-col items-center text-center gap-6">
                  <h2 className="text-5xl md:text-6xl font-black tracking-tight underline decoration-brand-primary/30 underline-offset-[16px]">Core Architecture</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <FeatureCard delay={0.1} icon={<Zap className="text-brand-primary" size={28} />} title="Few-Shot Documentation Engine" reasoning='Using "few-shot" prompting ensure the AI does not just describe the code, but formats it in a way that mimics professional documentation.' />
                  <FeatureCard delay={0.2} icon={<Brain className="text-brand-secondary" size={28} />} title="Automatic Logic Breakdown" reasoning="It doesn't just summarize; it explains the 'why' behind technical decisions." />
                  <FeatureCard delay={0.3} icon={<FileCheck className="text-brand-primary" size={28} />} title="Standardized Output Format" reasoning="Ensures consistency across all your documentations blocks." />
                  <FeatureCard delay={0.4} icon={<TrendingUp className="text-brand-secondary" size={28} />} title="Complexity Analysis" reasoning="Identifies O(n) notation using strict chain-of-thought analysis." />
                </div>
              </section>
            </motion.div>
          )}

          {activePage === 'pricing' && (
            <motion.div
              key="pricing-page"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center gap-24 py-20"
            >
              <div className="flex flex-col items-center text-center gap-6">
                <div className="px-4 py-2 rounded-full bg-brand-primary/5 border border-brand-primary/10 text-[10px] uppercase font-black tracking-[0.3em] text-brand-primary">The Core Experience</div>
                <h1 className="text-6xl md:text-7xl font-black tracking-tight">Enterprise Scaling</h1>
                
                {/* Billing Toggle */}
                <div className="flex items-center gap-4 bg-white/5 p-1.5 rounded-2xl border border-white/5 mt-4">
                  <button onClick={() => setIsAnnual(false)} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isAnnual ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'text-slate-500'}`}>Monthly</button>
                  <button onClick={() => setIsAnnual(true)} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isAnnual ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'text-slate-500'}`}>Yearly (Save 20%)</button>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-8 w-full">
                {[
                  { name: 'Starter', price: 0, features: ['10 Syntheses/day', 'Standard Tone', 'Basic Complexity'], color: 'slate' },
                  { name: 'Professional', price: 29, features: ['Unlimited Syntheses', 'Priority Neural Speed', 'GitHub Integration'], color: 'brand-primary', featured: true },
                  { name: 'Enterprise', price: 'Custom', features: ['Custom Style Guides', 'SSO & IAM', 'Dedicated GPU'], color: 'brand-secondary' }
                ].map(tier => (
                  <motion.div 
                    key={tier.name} 
                    whileHover={{ scale: 1.02 }}
                    className={`relative premium-card p-12 rounded-[40px] flex flex-col gap-10 border transition-all duration-500 ${tier.featured ? 'border-brand-primary bg-brand-primary/[0.03] scale-105' : 'border-white/5'} group`}
                  >
                    {/* Neural Glow expansion on hover */}
                    <div className="absolute -inset-[1px] bg-gradient-to-r from-brand-primary to-brand-secondary rounded-[40px] opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-700 pointer-events-none" />
                    
                    <div className="flex flex-col gap-2">
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{tier.name}</span>
                       <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-black text-text-white">
                          {typeof tier.price === 'number' ? (tier.price === 0 ? '$0' : `$${isAnnual ? Math.floor(tier.price * 12 * 0.8) : tier.price}`) : tier.price}
                        </span>
                        {typeof tier.price === 'number' && tier.price !== 0 && (
                          <span className="text-lg font-bold text-slate-500">{isAnnual ? '/yr' : '/mo'}</span>
                        )}
                       </div>
                    </div>
                    <div className="flex flex-col gap-4 flex-1">
                      {tier.features.map(f => (
                        <div key={f} className="flex items-center gap-4 text-xs font-bold text-slate-400">
                          <Check size={16} className="text-brand-primary" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={() => setSelectedPlan(tier.name)}
                      className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all relative z-10 flex items-center justify-center gap-2 ${selectedPlan === tier.name ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20' : tier.featured ? 'bg-brand-primary text-white shadow-xl shadow-brand-primary/40' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}
                    >
                      {selectedPlan === tier.name ? (
                        <>
                          <Check size={14} />
                          <span>Current Plan</span>
                        </>
                      ) : (
                        <span>Select Plan</span>
                      )}
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activePage === 'docs' && (
            <motion.div key="docs-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-40 gap-8">
              <Terminal size={64} className="text-brand-primary animate-pulse" />
              <h2 className="text-3xl font-black uppercase tracking-widest">Documentation Hub Coming Soon</h2>
              <p className="text-slate-500 max-w-md text-center">We are currently synthesizing the most interactive documentation experience in the industry.</p>
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* Footer */}
      <footer className="px-12 py-16 flex flex-col md:flex-row items-center justify-between border-t border-white/[0.04] bg-bg-card/40 backdrop-blur-3xl gap-8">
        <div className="flex flex-col gap-2 text-center md:text-left">
          <div className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">DocGen Neural Engine v1.0</div>
          <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Empowering the next generation of engineers</div>
        </div>

        <div className="flex items-center gap-10">
          <a href="#" className="text-[10px] font-black pointer-events-none uppercase tracking-widest text-slate-700 hover:text-white transition-colors">Privacy</a>
          <a href="#" className="text-[10px] font-black pointer-events-none uppercase tracking-widest text-slate-700 hover:text-white transition-colors">Terms</a>
          <div className="px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-500 tracking-widest flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            System Status: Optimal
          </div>
        </div>
      </footer>

      <style jsx>{`
        .prose-brand {
          --tw-prose-headings: var(--text-white);
          --tw-prose-body: var(--text-main);
          --tw-prose-bold: var(--text-white);
          --tw-prose-links: var(--color-brand-primary);
          --tw-prose-code: var(--color-brand-primary);
          --tw-prose-pre-bg: #030306;
          --tw-prose-pre-code: var(--color-brand-primary);
          --tw-prose-bullets: #475569;
          --tw-prose-hr: rgba(255, 255, 255, 0.05);
        }
        
        [data-theme='light'] .prose-brand {
          --tw-prose-pre-bg: #f8fafc;
          --tw-prose-pre-code: #0f172a;
          --tw-prose-hr: rgba(0, 0, 0, 0.05);
        }

        .prose :where(h1, h2, h3):not(:where([class~="not-prose"] *)) {
          letter-spacing: -0.04em;
          margin-top: 3em;
          margin-bottom: 1em;
          font-weight: 900;
          text-transform: uppercase;
        }
        .prose :where(p):not(:where([class~="not-prose"] *)) {
          line-height: 2;
          margin-bottom: 1.5em;
          font-weight: 500;
        }
        .prose :where(code):not(:where([class~="not-prose"] *)) {
          background-color: rgba(99, 102, 241, 0.1);
          padding: 0.3rem 0.6rem;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.85em;
        }
        .prose :where(pre):not(:where([class~="not-prose"] *)) {
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 24px;
          padding: 2.5rem;
          box-shadow: inset 0 0 80px rgba(0,0,0,0.4);
          white-space: pre-wrap;
          word-break: break-word;
          overflow-x: hidden;
        }
        
        [data-theme='light'] .prose :where(pre):not(:where([class~="not-prose"] *)) {
          border: 1px solid rgba(0, 0, 0, 0.06);
          box-shadow: none;
          background: #ffffff;
        }

        .prose :where(ul > li):not(:where([class~="not-prose"] *))::marker {
          color: var(--color-brand-primary);
        }
      `}</style>
    </div>
  );
}

export default App;
