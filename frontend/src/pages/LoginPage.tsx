import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  Lock,
  Loader2,
  Eye,
  EyeOff,
  Sparkles,
  BookOpen,
  Brain,
  FileSearch,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

/* ── Decorative feature pill used on the illustration panel ── */
function FeaturePill({
  icon: Icon,
  text,
  delay = "0ms",
}: {
  icon: React.ElementType;
  text: string;
  delay?: string;
}) {
  return (
    <div
      className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl
        bg-white/10 backdrop-blur-sm border border-white/20
        text-white animate-slide-up"
      style={{ animationDelay: delay }}
    >
      <span className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5 text-white" />
      </span>
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
}

export default function LoginPage() {
  /* ── All original state preserved exactly ── */
  const { login } = useAuth();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);

  /* ── Original handler preserved exactly ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Invalid email or password";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f8f9fb] dark:bg-[#0b1120]">

      {/* ════════════════════════════════════════
          LEFT — Illustration / Brand Panel
      ════════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden
        bg-gradient-to-br from-brand-600 via-brand-700 to-[#0c4a6e]
        flex-col justify-between p-12">

        {/* Floating background orbs */}
        <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full
            bg-white/5 blur-3xl" />
          <div className="absolute top-1/2 -right-32 w-80 h-80 rounded-full
            bg-brand-400/20 blur-3xl" />
          <div className="absolute -bottom-20 left-1/3 w-72 h-72 rounded-full
            bg-white/5 blur-3xl" />
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        {/* Top: Logo */}
        <div className="relative flex items-center gap-3 animate-fade-in">
          <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/20
            flex items-center justify-center backdrop-blur-sm">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">ResearchAI</p>
            <p className="text-brand-200 text-[11px] font-medium uppercase tracking-widest">
              Summarizer
            </p>
          </div>
        </div>

        {/* Centre: Hero copy */}
        <div className="relative space-y-8">
          {/* Headline */}
          <div className="space-y-4 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
              bg-white/10 border border-white/20 text-brand-100 text-xs font-semibold
              uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              AI-Powered Research
            </div>
            <h2 className="text-4xl font-bold text-white leading-[1.15] tracking-tight">
              Turn papers into<br />
              <span className="text-brand-200">structured insights.</span>
            </h2>
            <p className="text-brand-100/80 text-base leading-relaxed max-w-xs">
              Upload any research PDF and let Gemini AI extract summaries,
              authors, metadata and answer questions from your library.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-col gap-3 max-w-xs">
            <FeaturePill icon={FileSearch} text="Instant PDF summarisation"   delay="80ms"  />
            <FeaturePill icon={Brain}      text="Gemini AI semantic search"    delay="160ms" />
            <FeaturePill icon={BookOpen}   text="Vector-powered Q&A"          delay="240ms" />
          </div>
        </div>

        {/* Bottom: Social proof */}
        <div className="relative animate-fade-in" style={{ animationDelay: "300ms" }}>
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl
            bg-white/8 border border-white/15 backdrop-blur-sm max-w-xs">
            <div className="flex -space-x-2">
              {["A", "B", "C"].map((l) => (
                <div key={l} className="w-7 h-7 rounded-full bg-brand-400/60 border-2 border-brand-700
                  flex items-center justify-center text-white text-[10px] font-bold">
                  {l}
                </div>
              ))}
            </div>
            <p className="text-brand-100 text-xs leading-tight">
              Trusted by researchers<br />
              <span className="text-white font-semibold">worldwide</span>
            </p>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
          RIGHT — Login Form
      ════════════════════════════════════════ */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-16">
        <div className="w-full max-w-md space-y-8 animate-fade-in">

          {/* Mobile-only logo */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700
              flex items-center justify-center shadow-md shadow-brand-200">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-base">ResearchAI</span>
          </div>

          {/* Heading */}
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Welcome back
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Sign in to your account to continue
            </p>
          </div>

          {/* Glass form card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/60
            shadow-xl shadow-slate-200/40 dark:shadow-none p-8 space-y-5">

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email */}
              <div className="space-y-1.5">
                <label
                  className="text-[13px] font-semibold text-slate-700 dark:text-slate-300"
                  htmlFor="email"
                >
                  Email address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4
                    text-slate-400 dark:text-slate-500 group-focus-within:text-brand-500
                    transition-colors duration-150 pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700
                      bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-sm placeholder-slate-400 dark:placeholder-slate-500
                      focus:outline-none focus:ring-2 focus:ring-brand-500/25
                      focus:border-brand-400 focus:bg-white dark:focus:bg-slate-900
                      transition-all duration-150"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label
                  className="text-[13px] font-semibold text-slate-700 dark:text-slate-300"
                  htmlFor="password"
                >
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4
                    text-slate-400 dark:text-slate-500 group-focus-within:text-brand-500
                    transition-colors duration-150 pointer-events-none" />
                  <input
                    id="password"
                    type={showPass ? "text" : "password"}
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700
                      bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-sm placeholder-slate-400 dark:placeholder-slate-500
                      focus:outline-none focus:ring-2 focus:ring-brand-500/25
                      focus:border-brand-400 focus:bg-white dark:focus:bg-slate-900
                      transition-all duration-150"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2
                      text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-lg
                      hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-150"
                    onClick={() => setShowPass((p) => !p)}
                  >
                    {showPass
                      ? <EyeOff className="w-4 h-4" />
                      : <Eye className="w-4 h-4" />
                    }
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className={`
                  w-full h-11 rounded-xl font-semibold text-sm text-white
                  flex items-center justify-center gap-2
                  transition-all duration-150 active:scale-[0.98]
                  disabled:opacity-60 disabled:cursor-not-allowed
                  ${loading
                    ? "bg-brand-500"
                    : "bg-gradient-to-r from-brand-500 to-brand-700 hover:from-brand-600 hover:to-brand-800 shadow-md shadow-brand-200 hover:shadow-lg hover:shadow-brand-300"
                  }
                `}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                or
              </span>
              <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
            </div>

            {/* Sign up link */}
            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-brand-600 font-semibold hover:text-brand-700
                  underline underline-offset-2 decoration-brand-200
                  hover:decoration-brand-400 transition-colors"
              >
                Create one
              </Link>
            </p>
          </div>

          {/* Footer note */}
          <p className="text-center text-[11px] text-slate-400">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
