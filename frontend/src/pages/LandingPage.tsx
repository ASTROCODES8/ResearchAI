import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  ArrowRight,
  Brain,
  Database,
  FileText,
  GitBranch,
  Layers,
  MessageSquare,
  Network,
  Search,
  Sparkles,
  Upload,
  Zap,
  Sun,
  Moon,
  ChevronRight,
  BookOpen,
  BarChart3,
  Shield,
} from "lucide-react";




/* ───────────────────────────────────────────
   Intersection observer for scroll animations
─────────────────────────────────────────── */
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

/* ───────────────────────────────────────────
   Animated gradient orbs
─────────────────────────────────────────── */
function GradientOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-brand-400/20 via-violet-400/15 to-transparent blur-3xl animate-float" />
      <div
        className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-violet-500/15 via-brand-300/10 to-transparent blur-3xl animate-float"
        style={{ animationDelay: "1.5s" }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-brand-500/8 via-purple-400/5 to-transparent blur-3xl animate-float"
        style={{ animationDelay: "3s" }}
      />
    </div>
  );
}

/* ───────────────────────────────────────────
   Interactive knowledge graph visual
─────────────────────────────────────────── */
function KnowledgeGraphVisual() {
  const nodes = [
    { x: 50, y: 30, label: "BERT", type: "Model" },
    { x: 25, y: 55, label: "NLP", type: "Domain" },
    { x: 75, y: 55, label: "SQuAD", type: "Dataset" },
    { x: 15, y: 30, label: "Transformer", type: "Model" },
    { x: 85, y: 30, label: "F1 Score", type: "Metric" },
    { x: 50, y: 75, label: "Fine-tuning", type: "Method" },
    { x: 30, y: 80, label: "Google", type: "Org" },
    { x: 70, y: 80, label: "Attention", type: "Method" },
  ];

  const edges = [
    [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [1, 6], [3, 7], [5, 7], [2, 4],
  ];

  const typeColors: Record<string, string> = {
    Model: "#6366f1",
    Domain: "#06b6d4",
    Dataset: "#10b981",
    Metric: "#f59e0b",
    Method: "#8b5cf6",
    Org: "#ec4899",
  };

  return (
    <div className="relative w-full aspect-square max-w-md mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Edges */}
        {edges.map(([from, to], i) => (
          <line
            key={`edge-${i}`}
            x1={nodes[from].x}
            y1={nodes[from].y}
            x2={nodes[to].x}
            y2={nodes[to].y}
            stroke="currentColor"
            className="text-slate-300 dark:text-slate-600"
            strokeWidth="0.3"
            strokeDasharray="1,1"
          >
            <animate
              attributeName="stroke-opacity"
              values="0.3;0.8;0.3"
              dur={`${3 + i * 0.5}s`}
              repeatCount="indefinite"
            />
          </line>
        ))}
        {/* Nodes */}
        {nodes.map((node, i) => (
          <g key={`node-${i}`}>
            <circle
              cx={node.x}
              cy={node.y}
              r="4"
              fill={typeColors[node.type]}
              opacity="0.15"
            >
              <animate
                attributeName="r"
                values="4;5.5;4"
                dur={`${3 + i * 0.3}s`}
                repeatCount="indefinite"
              />
            </circle>
            <circle
              cx={node.x}
              cy={node.y}
              r="2"
              fill={typeColors[node.type]}
            />
            <text
              x={node.x}
              y={node.y + 6}
              textAnchor="middle"
              className="fill-slate-600 dark:fill-slate-400"
              style={{ fontSize: "2.5px", fontFamily: "Inter, sans-serif" }}
            >
              {node.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════
   LANDING PAGE
═══════════════════════════════════════════ */
export default function LandingPage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const heroReveal = useScrollReveal();
  const featuresReveal = useScrollReveal();
  const archReveal = useScrollReveal();
  const howReveal = useScrollReveal();
  const techReveal = useScrollReveal();
  const ctaReveal = useScrollReveal();



  const features = [
    {
      icon: Upload,
      title: "Smart Paper Upload",
      desc: "Upload PDFs and let AI extract titles, authors, dates, and comprehensive summaries automatically.",
      color: "from-brand-500 to-cyan-500",
    },
    {
      icon: Layers,
      title: "Section-Aware Chunking",
      desc: "Papers are intelligently split into semantic chunks preserving section context for precise retrieval.",
      color: "from-violet-500 to-purple-500",
    },
    {
      icon: Network,
      title: "Knowledge Graph",
      desc: "Neo4j-powered entity-relationship graphs are auto-constructed from each paper using Gemini extraction.",
      color: "from-emerald-500 to-teal-500",
    },
    {
      icon: Search,
      title: "Hybrid RAG Query",
      desc: "Questions are answered using combined Graph + Vector retrieval for deeper, citation-aware responses.",
      color: "from-amber-500 to-orange-500",
    },
    {
      icon: Brain,
      title: "Gemini 2.5 Flash",
      desc: "Powered by Google's latest LLM for fast, accurate extraction, summarization, and question answering.",
      color: "from-pink-500 to-rose-500",
    },
    {
      icon: MessageSquare,
      title: "Query History",
      desc: "Full conversation history with source attribution, so you never lose an insight.",
      color: "from-indigo-500 to-blue-500",
    },
  ];

  const pipeline = [
    {
      step: "01",
      title: "Upload",
      desc: "Drop a research PDF",
      icon: FileText,
    },
    {
      step: "02",
      title: "Extract",
      desc: "AI extracts metadata & summary",
      icon: Sparkles,
    },
    {
      step: "03",
      title: "Chunk & Embed",
      desc: "Section-aware vectors stored in Qdrant",
      icon: Database,
    },
    {
      step: "04",
      title: "Build Graph",
      desc: "Entities & relations written to Neo4j",
      icon: GitBranch,
    },
    {
      step: "05",
      title: "Ask Anything",
      desc: "Hybrid retrieval + Gemini answers",
      icon: Zap,
    },
  ];

  const techStack = [
    { name: "Gemini 2.5 Flash", role: "LLM Engine", icon: Sparkles },
    { name: "Neo4j AuraDB", role: "Knowledge Graph", icon: Network },
    { name: "Qdrant Cloud", role: "Vector Database", icon: Database },
    { name: "MongoDB Atlas", role: "Document Store", icon: Layers },
    { name: "FastAPI", role: "Backend API", icon: Zap },
    { name: "React + Tailwind", role: "Frontend", icon: BookOpen },
  ];

  return (
    <div className="relative min-h-screen bg-white dark:bg-[#0a0e1a] text-slate-900 dark:text-slate-100 overflow-x-hidden">
      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass dark:glass-dark border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-brand-sm group-hover:shadow-brand-md transition-shadow duration-300">
              <Brain className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Research<span className="text-gradient">AI</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Features</a>
            <a href="#architecture" className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Architecture</a>
            <a href="#how-it-works" className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">How It Works</a>
            <a href="#tech-stack" className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Tech Stack</a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            {user ? (
              <Link
                to="/dashboard"
                className="btn-primary text-sm px-5 py-2"
              >
                Dashboard <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="btn-primary text-sm px-5 py-2"
                >
                  Get Started <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <GradientOrbs />

      {/* ═══════════════════════════════════════
         HERO
      ═══════════════════════════════════════ */}
      <section
        ref={heroReveal.ref}
        className="relative pt-32 pb-20 md:pt-44 md:pb-32"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left – Copy */}
            <div
              className={`space-y-8 transition-all duration-700 ${
                heroReveal.isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20">
                <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                <span className="text-xs font-semibold text-brand-700 dark:text-brand-300">
                  Powered by Hybrid Graph + Vector RAG
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-[1.05]">
                Your AI{" "}
                <span className="bg-gradient-to-r from-brand-500 via-violet-500 to-purple-600 bg-clip-text text-transparent">
                  Research
                </span>
                <br />
                Intelligence
                <br />
                Platform
              </h1>

              <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-lg leading-relaxed">
                Upload papers. Build knowledge graphs. Ask questions with 
                citation-aware answers powered by Gemini and Graph RAG.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to={user ? "/dashboard" : "/signup"}
                  className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-violet-600 text-white font-semibold text-sm shadow-brand-md hover:shadow-brand-lg hover:-translate-y-0.5 transition-all duration-200"
                >
                  Start Analyzing
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-medium text-sm hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/8 transition-all duration-200"
                >
                  See How It Works
                </a>
              </div>

              {/* Capability pills */}
              <div className="flex flex-wrap items-center gap-2.5 pt-4">
                {[
                  { label: "Graph + Vector RAG", icon: "🔗" },
                  { label: "Neo4j Knowledge Graph", icon: "🧠" },
                  { label: "Gemini 2.5 Flash", icon: "⚡" },
                ].map((pill) => (
                  <span
                    key={pill.label}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10"
                  >
                    <span>{pill.icon}</span> {pill.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Right – Knowledge Graph Visual */}
            <div
              className={`transition-all duration-700 delay-200 ${
                heroReveal.isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 via-violet-500/5 to-transparent rounded-3xl blur-2xl" />
                <div className="relative glass dark:glass-dark rounded-3xl p-8 border border-white/40 dark:border-white/5">
                  <div className="text-center mb-4">
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      Live Knowledge Graph Preview
                    </span>
                  </div>
                  <KnowledgeGraphVisual />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
         FEATURES
      ═══════════════════════════════════════ */}
      <section id="features" ref={featuresReveal.ref} className="relative py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div
            className={`text-center mb-16 transition-all duration-700 ${
              featuresReveal.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 mb-4">
              <Zap className="w-3 h-3 text-violet-600 dark:text-violet-400" />
              <span className="text-xs font-semibold text-violet-700 dark:text-violet-300">Core Capabilities</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Everything you need to{" "}
              <span className="text-gradient">understand research</span>
            </h2>
            <p className="mt-4 text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              From intelligent paper parsing to knowledge graph construction and hybrid retrieval — all automated.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={f.title}
                className={`group relative p-6 rounded-2xl border border-slate-100 dark:border-white/5 bg-white/60 dark:bg-white/[0.02] hover:bg-white dark:hover:bg-white/[0.04] hover:border-slate-200 dark:hover:border-white/10 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${
                  featuresReveal.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{
                  transitionDelay: featuresReveal.isVisible ? `${i * 100}ms` : "0ms",
                  transitionDuration: "700ms",
                }}
              >
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <f.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
         ARCHITECTURE
      ═══════════════════════════════════════ */}
      <section
        id="architecture"
        ref={archReveal.ref}
        className="relative py-24 md:py-32 bg-gradient-to-b from-slate-50/50 to-white dark:from-white/[0.02] dark:to-transparent"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div
            className={`text-center mb-16 transition-all duration-700 ${
              archReveal.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 mb-4">
              <GitBranch className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Architecture</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Hybrid Graph + Vector{" "}
              <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                RAG Pipeline
              </span>
            </h2>
            <p className="mt-4 text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              A dual-retrieval architecture combining semantic similarity with structured knowledge for superior answers.
            </p>
          </div>

          <div
            className={`grid md:grid-cols-2 gap-8 transition-all duration-700 delay-200 ${
              archReveal.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {/* Vector Path */}
            <div className="relative p-8 rounded-2xl border border-slate-100 dark:border-white/5 bg-white/60 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Vector Path</h3>
                  <p className="text-xs text-slate-400">Qdrant Cloud</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  "Question → Gemini Embedding",
                  "Cosine similarity search across chunks",
                  "Section-aware context retrieval",
                  "Returns top-k relevant text passages",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-brand-500 shrink-0" />
                    <span className="text-sm text-slate-600 dark:text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Graph Path */}
            <div className="relative p-8 rounded-2xl border border-slate-100 dark:border-white/5 bg-white/60 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                  <Network className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Graph Path</h3>
                  <p className="text-xs text-slate-400">Neo4j AuraDB</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  "Question → Entity extraction via Gemini",
                  "1-hop graph traversal across knowledge base",
                  "Structured relationship context",
                  "Returns entity connections & facts",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-violet-500 shrink-0" />
                    <span className="text-sm text-slate-600 dark:text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Merge point */}
          <div
            className={`mt-8 p-6 rounded-2xl border border-dashed border-brand-200 dark:border-brand-500/20 bg-brand-50/50 dark:bg-brand-500/5 text-center transition-all duration-700 delay-400 ${
              archReveal.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className="flex items-center justify-center gap-3">
              <Sparkles className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              <span className="font-semibold text-brand-700 dark:text-brand-300">
                Both contexts merged → Gemini 2.5 Flash generates citation-aware answer
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
         HOW IT WORKS
      ═══════════════════════════════════════ */}
      <section id="how-it-works" ref={howReveal.ref} className="relative py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div
            className={`text-center mb-16 transition-all duration-700 ${
              howReveal.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 mb-4">
              <BarChart3 className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">Pipeline</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              From PDF to{" "}
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                Intelligence
              </span>{" "}
              in 5 steps
            </h2>
          </div>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
              {pipeline.map((step, i) => (
                <div
                  key={step.step}
                  className={`relative text-center transition-all duration-700 ${
                    howReveal.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  }`}
                  style={{
                    transitionDelay: howReveal.isVisible ? `${i * 120}ms` : "0ms",
                  }}
                >
                  <div className="relative mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-white dark:from-white/5 dark:to-white/[0.02] border border-slate-200 dark:border-white/10 flex items-center justify-center mb-4 group hover:scale-110 transition-transform duration-300">
                    <step.icon className="w-6 h-6 text-slate-600 dark:text-slate-300" />
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-[10px] font-bold text-white">
                      {step.step}
                    </div>
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{step.title}</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
         TECH STACK
      ═══════════════════════════════════════ */}
      <section
        id="tech-stack"
        ref={techReveal.ref}
        className="relative py-24 md:py-32 bg-gradient-to-b from-slate-50/50 to-white dark:from-white/[0.02] dark:to-transparent"
      >
        <div className="max-w-5xl mx-auto px-6">
          <div
            className={`text-center mb-16 transition-all duration-700 ${
              techReveal.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 dark:bg-pink-500/10 border border-pink-100 dark:border-pink-500/20 mb-4">
              <Shield className="w-3 h-3 text-pink-600 dark:text-pink-400" />
              <span className="text-xs font-semibold text-pink-700 dark:text-pink-300">Built With</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Modern{" "}
              <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
                Technology Stack
              </span>
            </h2>
          </div>

          <div
            className={`grid grid-cols-2 md:grid-cols-3 gap-4 transition-all duration-700 delay-200 ${
              techReveal.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {techStack.map((tech, i) => (
              <div
                key={tech.name}
                className="group p-5 rounded-2xl border border-slate-100 dark:border-white/5 bg-white/60 dark:bg-white/[0.02] hover:bg-white dark:hover:bg-white/[0.04] hover:border-slate-200 dark:hover:border-white/10 hover:shadow-md transition-all duration-300 text-center"
              >
                <tech.icon className="w-6 h-6 mx-auto mb-3 text-slate-400 dark:text-slate-500 group-hover:text-brand-500 transition-colors duration-300" />
                <div className="font-semibold text-sm">{tech.name}</div>
                <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  {tech.role}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
         CTA
      ═══════════════════════════════════════ */}
      <section ref={ctaReveal.ref} className="relative py-24 md:py-32">
        <div className="max-w-4xl mx-auto px-6">
          <div
            className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-violet-600 to-purple-700 p-12 md:p-16 text-center transition-all duration-700 ${
              ctaReveal.isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"
            }`}
          >
            {/* Decorative orbs */}
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-white/5 blur-3xl" />

            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
                Ready to transform how you
                <br />
                read research?
              </h2>
              <p className="text-lg text-white/70 max-w-xl mx-auto mb-8">
                Upload your first paper and experience AI-powered research intelligence with Graph RAG.
              </p>
              <Link
                to={user ? "/dashboard" : "/signup"}
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-brand-700 font-semibold text-sm hover:bg-white/95 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-200"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-100 dark:border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center">
              <Brain className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-semibold">ResearchAI</span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Built with Gemini 2.0 Flash · Neo4j · Qdrant · FastAPI · React
          </p>
        </div>
      </footer>
    </div>
  );
}
