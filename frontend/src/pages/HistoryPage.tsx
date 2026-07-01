import React, { useState, useEffect } from "react";
import {
  History,
  Search,
  Loader2,
  FileX,
  Library,
  Upload,
  SlidersHorizontal,
  X,
} from "lucide-react";
import api from "../lib/api";
import PaperCard from "../components/PaperCard";
import toast from "react-hot-toast";

interface Paper {
  id: string;
  title: string;
  authors: string[];
  published_date: string;
  overview: string;
  pdf_url: string;
  created_at: string;
}

/* ── Skeleton card shown while loading ── */
function PaperCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5 space-y-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 animate-pulse" />
        <div className="flex-1 space-y-2 pt-0.5">
          <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full w-4/5 animate-pulse" />
          <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full w-2/5 animate-pulse" />
        </div>
      </div>
      {/* Meta */}
      <div className="space-y-2">
        <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full w-3/5 animate-pulse" />
        <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full w-2/5 animate-pulse" />
      </div>
      <div className="border-t border-slate-100 dark:border-slate-800" />
      {/* Overview */}
      <div className="space-y-2">
        <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full w-full animate-pulse" />
        <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full w-full animate-pulse" />
        <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full w-2/3 animate-pulse" />
      </div>
    </div>
  );
}

export default function HistoryPage() {
  /* ── All original state preserved exactly ── */
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  /* ── All original API calls preserved exactly ── */
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<{ papers: Paper[]; total: number }>("/papers/history");
        setPapers(res.data.papers);
      } catch {
        toast.error("Could not load history");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ── All original filtering logic preserved exactly ── */
  const filtered = papers.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.authors.some((a) => a.toLowerCase().includes(q)) ||
      p.published_date.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-4">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20 flex items-center justify-center">
              <Library className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400 dark:text-slate-500">
              Research Library
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Paper History
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {loading
              ? "Loading your library…"
              : papers.length === 0
                ? "No papers processed yet"
                : `${papers.length} paper${papers.length !== 1 ? "s" : ""} in your library`
            }
          </p>
        </div>

        {/* Search bar — only when papers exist or loading */}
        {(papers.length > 0 || loading) && (
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              className="input-field pl-9 pr-9"
              placeholder="Search title, author…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Search active chip ── */}
      {search && !loading && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20 text-brand-700 dark:text-brand-400 text-xs font-medium">
            <SlidersHorizontal className="w-3 h-3" />
            Filtered by: "{search}"
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* ── Content states ── */}

      {/* Loading skeleton grid */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <PaperCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty state — no papers at all */}
      {!loading && papers.length === 0 && (
        <div className="card py-16 px-8 flex flex-col items-center text-center space-y-5 animate-slide-up">
          {/* Icon */}
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-800/50 flex items-center justify-center shadow-inner dark:shadow-none border border-slate-200 dark:border-slate-700">
              <History className="w-9 h-9 text-slate-300 dark:text-slate-500" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md flex items-center justify-center text-sm">
              📄
            </span>
          </div>

          <div className="space-y-1.5 max-w-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Your library is empty
            </h3>
            <p className="text-sm text-slate-400 dark:text-slate-500 leading-relaxed">
              Upload your first research paper and Gemini AI will extract a
              structured summary instantly.
            </p>
          </div>

          <a
            href="/dashboard/upload"
            className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-700 text-white text-sm font-semibold shadow-md shadow-brand-200 hover:shadow-lg hover:shadow-brand-300 transition-all active:scale-[0.98]"
          >
            <Upload className="w-4 h-4" />
            Upload a Paper
          </a>
        </div>
      )}

      {/* No search results */}
      {!loading && papers.length > 0 && filtered.length === 0 && (
        <div className="card py-12 px-8 flex flex-col items-center text-center space-y-4 animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center">
            <FileX className="w-7 h-7 text-slate-300 dark:text-slate-500" />
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-slate-700 dark:text-slate-300">No papers found</p>
            <p className="text-sm text-slate-400 dark:text-slate-500">
              No results for{" "}
              <span className="font-medium text-slate-600 dark:text-slate-400">"{search}"</span>
            </p>
          </div>
          <button
            onClick={() => setSearch("")}
            className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
          >
            Clear search
          </button>
        </div>
      )}

      {/* Papers grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((paper, i) => (
            <div
              key={paper.id}
              className="animate-slide-up"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <PaperCard 
                paper={paper} 
                onDelete={(deletedId) => {
                  setPapers((prev) => prev.filter((p) => p.id !== deletedId));
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
