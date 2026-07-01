import React, { useState, useEffect } from "react";
import {
  History,
  Loader2,
  MessageSquare,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Search,
  Sparkles,
  Clock,
  Users,
  Zap,
  X,
  MessagesSquare,
} from "lucide-react";
import { getQueryHistory } from "../lib/api";
import toast from "react-hot-toast";

/* ── Interfaces — preserved exactly ── */
interface Source {
  paper_id: string;
  title: string;
  authors: string;
  published_date: string;
  score: number;
}

interface QueryRecord {
  id: string;
  question: string;
  answer: string;
  sources: Source[];
  created_at: string;
}

/* ── Skeleton loader for a single history item ── */
function QueryItemSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5 space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 animate-pulse" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full w-4/5 animate-pulse" />
          <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full w-1/3 animate-pulse" />
        </div>
        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse shrink-0" />
      </div>
      <div className="pl-12 space-y-1.5">
        <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full w-full animate-pulse" />
        <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full w-5/6 animate-pulse" />
      </div>
    </div>
  );
}

/* ── Relative time formatter ── */
function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/* ── Full date format ── */
function fullDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ── Individual query card (QueryItem) — all logic preserved ── */
function QueryItem({ record, index }: { record: QueryRecord; index: number }) {
  const [expanded, setExpanded] = useState(false);

  /* Original date logic — preserved exactly */
  const date = new Date(record.created_at).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className="
        group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800
        shadow-sm hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700
        transition-all duration-200 overflow-hidden
        animate-slide-up
      "
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Left accent stripe — brand on hover, slate on idle */}
      <div className="
        absolute left-0 top-0 bottom-0 w-[3px]
        bg-slate-100 dark:bg-slate-800 group-hover:bg-brand-400
        transition-colors duration-300
      " />

      <div className="pl-5 pr-5 pt-4 pb-4">
        {/* ── Question header ── */}
        <div className="flex items-start gap-3">
          {/* Question icon */}
          <div className="
            w-9 h-9 rounded-xl shrink-0
            bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20
            flex items-center justify-center
            group-hover:bg-brand-100 dark:group-hover:bg-brand-500/30 transition-colors duration-200
          ">
            <MessageSquare className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          </div>

          {/* Question text + time */}
          <div className="flex-1 min-w-0 space-y-0.5">
            <p className="text-[13px] font-semibold text-slate-900 dark:text-white leading-snug">
              {record.question}
            </p>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
              <span
                className="text-[11px] text-slate-400 dark:text-slate-500 font-medium"
                title={date}
              >
                {relativeTime(record.created_at)} · {fullDate(record.created_at)}
              </span>
            </div>
          </div>

          {/* Expand / collapse toggle */}
          <button
            onClick={() => setExpanded((e) => !e)}
            className="
              shrink-0 w-8 h-8 rounded-xl flex items-center justify-center
              text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300
              hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent
              hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-150
            "
            title={expanded ? "Collapse" : "Expand answer"}
          >
            {expanded
              ? <ChevronUp className="w-4 h-4" />
              : <ChevronDown className="w-4 h-4" />
            }
          </button>
        </div>

        {/* ── Collapsed: preview snippet — preserved exactly ── */}
        {!expanded && (
          <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 pl-12 mt-2">
            {record.answer}
          </p>
        )}

        {/* ── Expanded: full answer + sources — all logic preserved ── */}
        {expanded && (
          <div className="pl-12 mt-4 space-y-5 animate-slide-up">

            {/* Answer section */}
            <div className="space-y-2">
              {/* Section label */}
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-brand-500 dark:text-brand-400" />
                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500">
                  AI Answer
                </span>
              </div>

              {/* Answer body */}
              <div className="relative rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 p-4">
                <p className="text-[13px] text-slate-700 dark:text-slate-300 leading-[1.75] whitespace-pre-line">
                  {record.answer}
                </p>
              </div>
            </div>

            {/* Sources section */}
            {record.sources.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500">
                    Sources · {record.sources.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {record.sources.map((source, i) => (
                    <div
                      key={source.paper_id}
                      className="
                        flex items-start gap-2.5 p-3
                        bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700
                        hover:border-brand-100 dark:hover:border-brand-500/30 hover:bg-brand-50/30 dark:hover:bg-brand-500/10
                        transition-all duration-150
                      "
                    >
                      {/* Index */}
                      <span className="
                        w-5 h-5 rounded-lg bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20
                        text-brand-700 dark:text-brand-400 text-[10px] font-bold
                        flex items-center justify-center shrink-0 mt-0.5
                      ">
                        {i + 1}
                      </span>

                      {/* Details */}
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <p className="text-[12px] font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                          {source.title}
                        </p>
                        {source.authors && (
                          <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                            <Users className="w-2.5 h-2.5 shrink-0 text-slate-400 dark:text-slate-500" />
                            {source.authors}
                          </span>
                        )}
                      </div>

                      {/* Score */}
                      <span className="
                        shrink-0 flex items-center gap-1
                        text-[11px] font-bold
                        text-brand-700 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20
                        px-2 py-0.5 rounded-full
                      ">
                        <Zap className="w-2.5 h-2.5" />
                        {(source.score * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main page component ── */
export default function QueryHistoryPage() {
  /* ── All original state preserved exactly ── */
  const [records, setRecords] = useState<QueryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  /* ── All original API calls preserved exactly ── */
  useEffect(() => {
    (async () => {
      try {
        const data = await getQueryHistory();
        setRecords(data.history);
      } catch {
        toast.error("Could not load query history");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ── All original filtering preserved exactly ── */
  const filtered = records.filter((r) =>
    r.question.toLowerCase().includes(search.toLowerCase())
  );

  /* ── Group records by date for timeline ── */
  const groupedByDate = filtered.reduce<Record<string, QueryRecord[]>>(
    (acc, r) => {
      const key = new Date(r.created_at).toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      (acc[key] ??= []).push(r);
      return acc;
    },
    {}
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-4">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20 flex items-center justify-center">
              <MessagesSquare className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400 dark:text-slate-500">
              Conversation History
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Query History
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {loading
              ? "Loading your queries…"
              : `${records.length} past ${records.length !== 1 ? "queries" : "query"} with your research papers`
            }
          </p>
        </div>

        {/* Search — shown when records exist */}
        {(records.length > 0 || loading) && (
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              className="input-field pl-9 pr-8"
              placeholder="Search questions…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-700 rounded transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Loading skeleton ── */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <QueryItemSkeleton key={i} />
          ))}
        </div>
      )}

      {/* ── Empty state — no queries at all ── */}
      {!loading && records.length === 0 && (
        <div className="card py-16 px-8 flex flex-col items-center text-center space-y-5 animate-slide-up">
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-800/50 flex items-center justify-center shadow-inner dark:shadow-none border border-slate-200 dark:border-slate-700">
              <History className="w-9 h-9 text-slate-300 dark:text-slate-500" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md flex items-center justify-center text-sm">
              💬
            </span>
          </div>

          <div className="space-y-1.5 max-w-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No queries yet
            </h3>
            <p className="text-sm text-slate-400 dark:text-slate-500 leading-relaxed">
              Ask a question about your uploaded research papers to start a
              conversation history.
            </p>
          </div>

          <a
            href="/dashboard/query"
            className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-700 text-white text-sm font-semibold shadow-md shadow-brand-200 hover:shadow-lg hover:shadow-brand-300 transition-all active:scale-[0.98]"
          >
            <MessageSquare className="w-4 h-4" />
            Ask a Question
          </a>
        </div>
      )}

      {/* ── No search results ── */}
      {!loading && records.length > 0 && filtered.length === 0 && (
        <div className="card py-12 px-8 flex flex-col items-center text-center space-y-4 animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center">
            <BookOpen className="w-7 h-7 text-slate-300 dark:text-slate-500" />
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-slate-700 dark:text-slate-300">No queries found</p>
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

      {/* ── Timeline grouped by date ── */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-6">
          {Object.entries(groupedByDate).map(([dateLabel, dayRecords]) => (
            <div key={dateLabel} className="space-y-2.5">
              {/* Date divider */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    {dateLabel}
                  </span>
                </div>
                <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium shrink-0">
                  {dayRecords.length} {dayRecords.length === 1 ? "query" : "queries"}
                </span>
              </div>

              {/* Cards for this date */}
              <div className="space-y-2.5">
                {dayRecords.map((record, idx) => (
                  <QueryItem
                    key={record.id}
                    record={record}
                    index={idx}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
