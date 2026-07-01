import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Loader2,
  BookOpen,
  Users,
  Calendar,
  MessageSquare,
  AlertCircle,
  Sparkles,
  Send,
  CornerDownLeft,
  Zap,
} from "lucide-react";
import toast from "react-hot-toast";
import { queryPapers } from "../lib/api";

/* ── Interfaces — preserved exactly ── */
interface Source {
  paper_id: string;
  title: string;
  authors: string;
  published_date: string;
  score: number;
}

interface QueryResult {
  question: string;
  answer: string;
  sources: Source[];
  graph_facts?: { source: string; relation: string; target: string }[];
}

/* ── Typing dots animation component ── */
function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-0.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce"
          style={{ animationDelay: `${i * 150}ms`, animationDuration: "900ms" }}
        />
      ))}
    </div>
  );
}

/* ── Score pill with animated fill bar ── */
function ScorePill({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color =
    pct >= 80
      ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20"
      : pct >= 60
      ? "text-brand-700 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 border-brand-100 dark:border-brand-500/20"
      : "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20";

  return (
    <div className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold ${color}`}>
      <Zap className="w-2.5 h-2.5" />
      {pct}%
    </div>
  );
}

/* ── Suggested questions ── */
const SUGGESTIONS = [
  "What are the main findings of the uploaded papers?",
  "What methods were used for evaluation?",
  "What limitations were identified by the authors?",
  "How does this compare to prior work?",
];

export default function QueryPage() {
  /* ── All original state preserved exactly ── */
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /* ── Auto-resize textarea ── */
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [question]);

  /* ── All original handlers preserved exactly ── */
  const handleQuery = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const data = await queryPapers(question);
      setResult(data);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Query failed. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleQuery();
    }
  };

  const canSubmit = !loading && question.trim().length > 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">

      {/* ── Page Header ── */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20 text-brand-600 dark:text-brand-400 text-[11px] font-semibold tracking-wide uppercase">
            <Sparkles className="w-3 h-3" />
            Semantic Search
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Ask Your Papers
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Ask any question — Gemini AI searches across all your uploaded research
          papers and synthesises a precise answer.
        </p>
      </div>

      {/* ── AI Input Box ── */}
      <div className={`
        relative rounded-2xl border transition-all duration-200 bg-white dark:bg-slate-900
        ${loading
          ? "border-brand-200 dark:border-brand-500/40 shadow-md shadow-brand-50 dark:shadow-none"
          : question.trim()
          ? "border-brand-300 dark:border-brand-500/50 shadow-md shadow-brand-50 dark:shadow-none"
          : "border-slate-200 dark:border-slate-700 shadow-sm hover:border-slate-300 dark:hover:border-slate-600"
        }
      `}>
        {/* Top gradient bar when active */}
        {(question.trim() || loading) && (
          <div className="absolute top-0 inset-x-0 h-[2px] rounded-t-2xl bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 transition-opacity duration-300" />
        )}

        <div className="p-4">
          {/* Label row */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20 flex items-center justify-center">
              <MessageSquare className="w-3 h-3 text-brand-600 dark:text-brand-400" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400 dark:text-slate-500">
              Your Question
            </span>
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            className="
              w-full resize-none bg-transparent text-slate-900 dark:text-white text-[15px]
              leading-relaxed placeholder-slate-400 dark:placeholder-slate-500
              focus:outline-none
              min-h-[56px] max-h-[200px] overflow-y-auto
            "
            placeholder="e.g. What methods were used to evaluate model performance?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            rows={2}
          />

          {/* Bottom action row */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <CornerDownLeft className="w-3 h-3" />
              Enter to search · Shift+Enter for new line
            </p>

            <button
              onClick={handleQuery}
              disabled={!canSubmit}
              className={`
                flex items-center gap-2 h-9 px-4 rounded-xl font-semibold text-sm
                transition-all duration-150 active:scale-[0.97]
                ${canSubmit
                  ? "bg-gradient-to-r from-brand-500 to-brand-700 text-white shadow-md shadow-brand-200 hover:shadow-lg hover:shadow-brand-300"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                }
              `}
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Searching…
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Ask
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Suggestion chips — shown only on empty state ── */}
      {!result && !loading && !question.trim() && (
        <div className="space-y-2 animate-slide-up">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 dark:text-slate-500 px-1">
            Try asking…
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setQuestion(s)}
                className="
                  flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                  bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-500/50
                  hover:bg-brand-50 dark:hover:bg-brand-500/10 text-slate-600 dark:text-slate-300 hover:text-brand-700 dark:hover:text-brand-400
                  text-xs font-medium transition-all duration-150
                  shadow-sm hover:shadow-md
                "
              >
                <Search className="w-3 h-3 shrink-0" />
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Loading / Thinking state ── */}
      {loading && (
        <div className="animate-fade-in">
          {/* AI thinking card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-brand-100 dark:border-brand-500/20 shadow-sm p-5">
            <div className="flex items-start gap-3">
              {/* AI avatar */}
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shrink-0 shadow-md shadow-brand-200">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 pt-0.5 space-y-2">
                <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">
                  Searching your papers…
                </p>
                <TypingDots />
                {/* Shimmer skeleton lines */}
                <div className="space-y-2 mt-3">
                  {[100, 90, 75, 60].map((w, i) => (
                    <div
                      key={i}
                      className="h-2.5 rounded-full bg-gradient-to-r from-slate-100 dark:from-slate-800 via-slate-50 dark:via-slate-700 to-slate-100 dark:to-slate-800 animate-pulse"
                      style={{ width: `${w}%`, animationDelay: `${i * 120}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Result ── */}
      {result && (
        <div className="space-y-4 animate-slide-up">

          {/* ── Question echo ── */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 text-sm font-bold text-slate-600 dark:text-slate-300">
              Q
            </div>
            <div className="flex-1 pt-1">
              <p className="text-[14px] font-semibold text-slate-900 dark:text-white leading-snug">
                {result.question}
              </p>
            </div>
          </div>

          {/* ── AI Answer card ── */}
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            {/* Top gradient accent */}
            <div className="h-[3px] w-full bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600" />

            <div className="p-5 space-y-4">
              {/* Header */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-md shadow-brand-200">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-slate-900 dark:text-white">AI Answer</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                    Synthesised from your papers
                  </p>
                </div>
              </div>

              {/* Answer body */}
              <div className="pl-[44px]">
                <p className="text-[14px] text-slate-700 dark:text-slate-300 leading-[1.75] whitespace-pre-line">
                  {result.answer}
                </p>
              </div>
            </div>
          </div>

          {/* ── Sources ── */}
          {result.sources.length > 0 && (
            <div className="space-y-3">
              {/* Sources label */}
              <div className="flex items-center gap-2 px-1">
                <BookOpen className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400 dark:text-slate-500">
                  Sources · {result.sources.length} paper{result.sources.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="space-y-2.5">
                {result.sources.map((source, i) => (
                  <div
                    key={source.paper_id}
                    className="
                      group bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800
                      shadow-sm hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700
                      transition-all duration-200 hover:-translate-y-0.5 p-4
                      animate-slide-up
                    "
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <div className="flex items-start gap-3">
                      {/* Index badge */}
                      <span className="
                        w-7 h-7 rounded-xl bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20
                        text-brand-700 dark:text-brand-400 text-xs font-bold
                        flex items-center justify-center shrink-0 mt-0.5
                        group-hover:bg-brand-100 dark:group-hover:bg-brand-500/30 transition-colors duration-150
                      ">
                        {i + 1}
                      </span>

                      {/* Source details */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <p className="text-[13px] font-semibold text-slate-900 dark:text-white leading-snug">
                          {source.title}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          {source.authors && (
                            <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                              <Users className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
                              <span className="truncate max-w-[200px]">{source.authors}</span>
                            </span>
                          )}
                          {source.published_date && (
                            <span className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
                              <Calendar className="w-3 h-3 shrink-0" />
                              {source.published_date}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Score pill */}
                      <ScorePill score={source.score} />
                    </div>

                    {/* Match score bar */}
                    <div className="mt-3 pl-10">
                      <div className="h-1 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-700"
                          style={{ width: `${Math.round(source.score * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Related Graph Facts ── */}
          {result.graph_facts && result.graph_facts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 px-1">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Related Graph Facts
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.graph_facts.map((fact, i) => (
                  <div key={i} className="flex items-center text-xs font-semibold bg-purple-50 dark:bg-purple-500/10 text-purple-800 dark:text-purple-300 px-3 py-1.5 rounded-full border border-purple-100 dark:border-purple-500/20">
                    <span className="truncate max-w-[120px]">{fact.source}</span>
                    <span className="mx-2 text-purple-400 dark:text-purple-500 font-medium tracking-widest text-[9px]">→ {fact.relation} →</span>
                    <span className="truncate max-w-[120px]">{fact.target}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── No sources found ── */}
          {result.sources.length === 0 && (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 animate-fade-in">
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-500" />
              </div>
              <div className="pt-0.5">
                <p className="text-[13px] font-semibold text-amber-800 dark:text-amber-400">
                  No matching sources found
                </p>
                <p className="text-[12px] text-amber-600 dark:text-amber-400/80 mt-0.5 leading-relaxed">
                  Try uploading more research papers related to your question, or
                  rephrase the query.
                </p>
              </div>
            </div>
          )}

          {/* ── Ask another ── */}
          <button
            onClick={() => { setResult(null); setQuestion(""); textareaRef.current?.focus(); }}
            className="
              w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800
              text-sm font-medium text-slate-500 dark:text-slate-400
              hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-300
              flex items-center justify-center gap-2
              transition-colors duration-150 shadow-sm
            "
          >
            <Search className="w-3.5 h-3.5" />
            Ask another question
          </button>
        </div>
      )}
    </div>
  );
}
