import React, { useState, useRef, useCallback } from "react";
import {
  Upload,
  FileText,
  Loader2,
  CheckCircle,
  XCircle,
  X,
  Users,
  Calendar,
  BookOpen,
  ExternalLink,
  RefreshCw,
  Sparkles,
  ArrowUpFromLine,
  Brain,
  Cpu,
  ScanText,
  Download,
} from "lucide-react";
import api from "../lib/api";
import toast from "react-hot-toast";

interface Summary {
  id: string;
  title: string;
  authors: string[];
  published_date: string;
  overview: string;
  pdf_url: string;
  created_at: string;
}

type State = "idle" | "uploading" | "success" | "error";

/* ── Processing steps shown during upload ── */
const STEPS = [
  { icon: ScanText,  label: "Extracting text from PDF…"          },
  { icon: Brain,     label: "Analyzing content with Gemini AI…"  },
  { icon: Cpu,       label: "Structuring summary & metadata…"    },
];

export default function UploadPage() {
  const [file, setFile]         = useState<File | null>(null);
  const [state, setState]       = useState<State>("idle");
  const [result, setResult]     = useState<Summary | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [stepIdx, setStepIdx]   = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const stepRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── All original handlers preserved exactly ── */
  const selectFile = (f: File) => {
    if (!f.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Only PDF files are accepted");
      return;
    }
    setFile(f);
    setResult(null);
    setState("idle");
    setErrorMsg("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) selectFile(e.target.files[0]);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) selectFile(e.dataTransfer.files[0]);
  }, []);

  const handleDragOver  = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  const handleUpload = async () => {
    if (!file) return;
    setState("uploading");
    setErrorMsg("");
    setStepIdx(0);

    // Animate through steps while waiting
    stepRef.current = setInterval(() => {
      setStepIdx((i) => (i < STEPS.length - 1 ? i + 1 : i));
    }, 2800);

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await api.post<Summary>("/papers/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
      setState("success");
      toast.success("Paper processed successfully!");
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Upload failed. Please try again.";
      setErrorMsg(msg);
      setState("error");
      toast.error(msg);
    } finally {
      if (stepRef.current) clearInterval(stepRef.current);
    }
  };

  const handleDownload = async () => {
    if (!result) return;
    try {
      const response = await fetch(result.pdf_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${result.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setState("idle");
    setErrorMsg("");
    setStepIdx(0);
    if (stepRef.current) clearInterval(stepRef.current);
    if (inputRef.current) inputRef.current.value = "";
  };

  const CurrentStepIcon = STEPS[stepIdx].icon;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">

      {/* ── Page Header ── */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20 text-brand-600 dark:text-brand-400 text-[11px] font-semibold tracking-wide uppercase">
            <Sparkles className="w-3 h-3" />
            AI-Powered
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Upload Research Paper
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
          Drop a PDF and Gemini AI will extract a structured summary, authors,
          publication date, and key insights automatically.
        </p>
      </div>

      {/* ── Drop Zone ── */}
      {state !== "success" && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !file && inputRef.current?.click()}
          className={`
            relative overflow-hidden rounded-2xl transition-all duration-200
            ${!file ? "cursor-pointer" : ""}
            ${isDragging
              ? "border-2 border-brand-400 bg-brand-50 dark:bg-brand-500/10 scale-[1.01] shadow-lg shadow-brand-100 dark:shadow-brand-500/20"
              : file
                ? "border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm"
                : "border-2 border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-brand-300 dark:hover:border-brand-500/50 hover:bg-brand-50/30 dark:hover:bg-brand-500/5 hover:shadow-sm"
            }
          `}
        >
          {/* Hidden file input */}
          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleChange}
          />

          {/* Decorative gradient orb — only on empty state */}
          {!file && (
            <div
              aria-hidden
              className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-gradient-to-br from-brand-100/60 to-brand-50/20 blur-2xl pointer-events-none"
            />
          )}

          {!file ? (
            /* ── Empty drop zone ── */
            <div className="px-8 py-14 flex flex-col items-center text-center space-y-5">
              {/* Animated icon stack */}
              <div className="relative">
                <div className={`
                  w-20 h-20 rounded-3xl flex items-center justify-center
                  bg-gradient-to-br from-brand-500 to-brand-700
                  shadow-xl shadow-brand-200
                  transition-transform duration-200
                  ${isDragging ? "scale-110 rotate-3" : ""}
                `}>
                  <ArrowUpFromLine className="w-8 h-8 text-white" strokeWidth={1.8} />
                </div>
                {/* floating badges */}
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md flex items-center justify-center text-[10px]">
                  📄
                </span>
                <span className="absolute -bottom-2 -left-2 w-7 h-7 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md flex items-center justify-center text-[10px]">
                  🤖
                </span>
              </div>

              <div className="space-y-1.5">
                <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
                  {isDragging ? "Release to upload" : "Drop your PDF here"}
                </p>
                <p className="text-sm text-slate-400 dark:text-slate-500">
                  or{" "}
                  <span className="text-brand-600 font-medium underline underline-offset-2 decoration-dotted">
                    browse files
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-4 pt-1">
                {["PDF only", "Any size", "Instant AI summary"].map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 text-[11px] font-medium text-slate-400 dark:text-slate-500"
                  >
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 inline-block" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            /* ── File selected ── */
            <div className="p-5 flex items-center gap-4">
              {/* PDF icon */}
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-50 to-red-100 dark:from-red-500/10 dark:to-red-500/20 border border-red-100 dark:border-red-500/20 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6 text-red-500 dark:text-red-400" />
              </div>
              {/* File info */}
              <div className="flex-1 min-w-0 space-y-0.5">
                <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{file.name}</p>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                  <span className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-500/20">
                    Ready to process
                  </span>
                </div>
              </div>
              {/* Remove */}
              <button
                onClick={(e) => { e.stopPropagation(); reset(); }}
                className="shrink-0 p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Action Buttons ── */}
      {state !== "success" && file && (
        <div className="flex gap-3">
          <button
            onClick={handleUpload}
            disabled={state === "uploading"}
            className={`
              flex-1 h-11 rounded-xl flex items-center justify-center gap-2
              font-semibold text-sm text-white
              transition-all duration-150 active:scale-[0.98]
              disabled:opacity-60 disabled:cursor-not-allowed
              ${state === "uploading"
                ? "bg-brand-500 cursor-not-allowed"
                : "bg-gradient-to-r from-brand-500 to-brand-700 hover:from-brand-600 hover:to-brand-800 shadow-md shadow-brand-200 hover:shadow-lg hover:shadow-brand-300"
              }
            `}
          >
            {state === "uploading" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing…
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Process with AI
              </>
            )}
          </button>

          {state !== "uploading" && (
            <button
              onClick={reset}
              className="h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-300 transition-colors shadow-sm flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* ── Processing Indicator ── */}
      {state === "uploading" && (
        <div className="card p-5 space-y-4 animate-fade-in">
          {/* Step indicator */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20 flex items-center justify-center shrink-0">
              <CurrentStepIcon className="w-5 h-5 text-brand-600 dark:text-brand-400 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {STEPS[stepIdx].label}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                This may take 15–45 seconds
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex gap-1.5">
              {STEPS.map((s, i) => (
                <div
                  key={i}
                  className={`
                    flex-1 h-1 rounded-full transition-all duration-700
                    ${i <= stepIdx ? "bg-brand-500" : "bg-slate-100 dark:bg-slate-700"}
                  `}
                />
              ))}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Step {stepIdx + 1} of {STEPS.length}
              </p>
              <p className="text-[11px] text-brand-600 dark:text-brand-400 font-medium">
                {Math.round(((stepIdx + 1) / STEPS.length) * 100)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Error State ── */}
      {state === "error" && (
        <div className="rounded-2xl border border-red-100 dark:border-red-500/20 bg-red-50/50 dark:bg-red-500/5 p-5 flex items-start gap-4 animate-fade-in">
          <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-500/20 flex items-center justify-center shrink-0">
            <XCircle className="w-4.5 h-4.5 text-red-500 dark:text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-red-700 dark:text-red-400">Processing failed</p>
            <p className="text-xs text-red-500 dark:text-red-400/80 mt-0.5 leading-relaxed">{errorMsg}</p>
          </div>
          <button
            onClick={reset}
            className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-500/30 rounded-xl px-3 py-2 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* ── Success Result Card ── */}
      {state === "success" && result && (
        <div className="space-y-4 animate-slide-up">

          {/* Success banner */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center shrink-0">
              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-400">
                Summary extracted successfully
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400/80 mt-0.5">
                Gemini AI has processed your paper
              </p>
            </div>
            <button
              onClick={handleDownload}
              className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-500/30 rounded-xl px-3 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download PDF
            </button>
          </div>

          {/* Main result card */}
          <div className="card overflow-hidden">
            {/* Card top gradient bar */}
            <div className="h-1 w-full bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600" />

            <div className="p-6 space-y-6">
              {/* Title */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500">
                    Title
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-snug tracking-tight">
                  {result.title}
                </h2>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-100 dark:border-slate-700/60" />

              {/* Authors + Date row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Authors */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500">
                      Authors
                    </span>
                  </div>
                  {result.authors.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {result.authors.map((a) => (
                        <span
                          key={a}
                          className="px-2.5 py-1 bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 text-xs rounded-full font-medium border border-brand-100 dark:border-brand-500/20"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 dark:text-slate-500 italic">Not found</p>
                  )}
                </div>

                {/* Published date */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500">
                      Published
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {result.published_date}
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-100 dark:border-slate-700/60" />

              {/* Overview */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <ScanText className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500">
                    AI Overview
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {result.overview}
                </p>
              </div>
            </div>
          </div>

          {/* Upload another */}
          <button
            onClick={reset}
            className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors shadow-sm active:scale-[0.98]"
          >
            <Upload className="w-4 h-4" />
            Upload Another Paper
          </button>
        </div>
      )}
    </div>
  );
}
