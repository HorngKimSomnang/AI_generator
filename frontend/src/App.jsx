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

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const handleGenerate = async () => {
    if (!code.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setDocumentation('');

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await axios.post(`${API_URL}/api/generate-docs`, {
        code,
        language
      });
      setDocumentation(response.data.documentation);
    } catch (err) {
      console.error('Error generating docs:', err);
      setError(err.response?.data?.details || err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
            <a href="#" className="nav-link !text-[11px] uppercase tracking-[0.2em] font-black hover:scale-95">Engine</a>
            <a href="#" className="nav-link !text-[11px] uppercase tracking-[0.2em] font-black hover:scale-95">Docs</a>
            <a href="#" className="nav-link !text-[11px] uppercase tracking-[0.2em] font-black hover:scale-95">Pricing</a>
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

        {/* Header Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center text-center gap-6 mb-8"
        >
          <div className="px-4 py-2 rounded-full bg-brand-primary/5 border border-brand-primary/10 text-[10px] uppercase font-black tracking-[0.3em] text-brand-primary mb-4 animate-pulse">
            Next Generation AI System
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-none text-text-white">
            Your Code, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-indigo-400 to-brand-secondary">Documented.</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl font-medium leading-relaxed mt-4">
            Transform messy snippets into professional documentation with advanced few-shot prompting and complexity analysis.
          </p>
        </motion.div>

        {/* Action Center */}
        <div className="grid lg:grid-cols-2 gap-10 items-start mt-20">

          {/* Source Section */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col gap-6"
          >
            <div className="flex items-center px-2">
              <div className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-white/50">
                <Code2 size={18} className="text-brand-primary" />
                <span>Script Input</span>
              </div>
            </div>

            <div className="relative group/input">
              <div className="absolute -inset-[1px] bg-gradient-to-r from-brand-primary via-transparent to-brand-secondary rounded-3xl opacity-40 group-focus-within/input:opacity-100 transition-opacity duration-700 blur-[2px]" />
              <div className="relative premium-card rounded-3xl overflow-hidden backdrop-blur-3xl bg-bg-card/60 h-[480px]">
                {/* Upper Control Bar */}
                <div className="absolute top-6 left-8 right-8 z-[110] flex items-center justify-between pointer-events-none">
                  <div className="pointer-events-auto">
                    <CustomDropdown
                      value={language}
                      onChange={setLanguage}
                      options={languages}
                    />
                  </div>
                  <div className="pointer-events-auto">
                    <button
                      onClick={handleGenerate}
                      disabled={!code.trim() || isLoading}
                      className="px-6 py-2.5 bg-brand-primary text-white rounded-xl transition-all font-black text-[10px] uppercase tracking-widest shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-30 disabled:hover:translate-y-0 flex items-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="animate-spin" size={14} />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={14} />
                          <span>Run Synthesis</span>
                        </>
                      )}
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

                {/* Floating Engine Status Indicator with Mask */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-bg-card/90 to-transparent pointer-events-none z-[115]" />
                <div className="absolute bottom-6 left-8 flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white/[0.04] px-4 py-2 rounded-lg border border-white/[0.06] backdrop-blur-md z-[120]">
                  <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                  Neural Engine Active
                </div>
              </div>
            </div>
          </motion.div>

          {/* Result Section */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col gap-6"
          >
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-white/50">
                <FileText size={18} className="text-brand-secondary" />
                <span>Generated Synthesis</span>
              </div>
            </div>

            <div className="relative group/result">
              <div className={`absolute -inset-[1px] bg-gradient-to-r from-brand-secondary via-transparent to-brand-primary rounded-3xl transition-opacity duration-700 blur-[2px] ${documentation ? 'opacity-40' : 'opacity-10'}`} />
              <div className="relative premium-card rounded-3xl h-[480px] overflow-hidden backdrop-blur-3xl bg-bg-card/60">

                {/* Top Control Bar */}
                <div className="absolute top-6 right-8 z-[110]">
                  {documentation && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(documentation);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className={`px-8 py-2.5 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-lg hover:-translate-y-0.5 active:translate-y-0 ${copied
                        ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                        : 'bg-brand-secondary text-white shadow-brand-secondary/20 hover:shadow-brand-secondary/40'
                        }`}
                    >
                      <AnimatePresence mode="wait">
                        {copied ? (
                          <motion.div
                            key="check"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center gap-2"
                          >
                            <Check size={14} />
                            <span>Copied!</span>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="terminal"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center gap-2"
                          >
                            <span>Copy</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </button>
                  )}
                </div>

                <AnimatePresence mode="wait">
                  {error ? (
                    <motion.div
                      key="error-state"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="h-full flex flex-col items-center justify-center text-center gap-6 py-20"
                    >
                      <Terminal size={48} className="text-red-500/50" />
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">Synthesis Failed</h3>
                        <p className="text-sm text-slate-500 max-w-sm">{error}</p>
                      </div>
                    </motion.div>
                  ) : documentation ? (
                    <motion.div
                      key="doc-content"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -30 }}
                      transition={{ duration: 0.8 }}
                      className="prose max-w-none prose-brand dark:prose-invert overflow-y-auto overflow-x-hidden h-full !pl-10 !pr-4 custom-scrollbar !pt-28 !pb-20"
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {documentation}
                      </ReactMarkdown>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="doc-placeholder"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.6 }}
                      className="h-full flex flex-col items-center justify-center text-center gap-8 py-20"
                    >
                      <div className="w-20 h-20 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center animate-float">
                        <ChevronRight size={40} className="text-slate-600" />
                      </div>
                      <p className="text-xl font-medium text-slate-500 tracking-tight">
                        Awaiting input... <br />
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Internal Decorative Glow */}
                <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-brand-primary/5 blur-[160px] rounded-full pointer-events-none" />

                {documentation && (
                  <>
                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-bg-card/90 to-transparent pointer-events-none z-[115]" />
                    <div className="absolute bottom-6 left-8 flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white/[0.04] px-4 py-2 rounded-lg border border-white/[0.06] backdrop-blur-md z-[120]">
                      <div className="w-2 h-2 rounded-full bg-brand-secondary shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                      Synthesis Finalized
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Core Features Section */}
        <section className="pt-40 border-t border-white/[0.06] flex flex-col gap-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center text-center gap-6"
          >
            <h2 className="text-5xl md:text-6xl font-black tracking-tight underline decoration-brand-primary/30 underline-offset-[16px]">Core Architecture</h2>
            <p className="text-lg text-slate-500 max-w-2xl font-medium leading-relaxed">
              We leverage cutting-edge neural patterns to transform raw logic into architectural masterpieces.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <FeatureCard
              delay={0.1}
              icon={<Zap className="text-brand-primary group-hover:animate-pulse" size={28} />}
              title="Few-Shot Documentation Engine"
              reasoning='Using "few-shot" prompting (providing examples of industry-standard DocBlocks and READMEs) ensures the AI does not just describe the code, but formats it in a way that mimics professional documentation like JSDoc or PHPdoc.'
            />
            <FeatureCard
              delay={0.2}
              icon={<Brain className="text-brand-secondary group-hover:animate-pulse" size={28} />}
              title="Automatic Logic Breakdown"
              reasoning="It doesn't just summarize; it explains the 'why' behind specific functions. This helps me understand the technical decisions made during the 'vibe coding' process."
            />
            <FeatureCard
              delay={0.3}
              icon={<FileCheck className="text-brand-primary group-hover:animate-pulse" size={28} />}
              title="Standardized Output Format"
              reasoning="By forcing the AI to use a consistent template (Parameters, Return Values, Exceptions), it ensures my project portfolio looks uniform and professional to potential employers."
            />
            <FeatureCard
              delay={0.4}
              icon={<TrendingUp className="text-brand-secondary group-hover:animate-pulse" size={28} />}
              title="Complexity Analysis"
              reasoning="The tool identifies the time and space complexity (O(n) notation), which is a critical skill for my university exams and technical interviews."
            />
          </div>
        </section>

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
