import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  Loader2,
  Eye,
  EyeOff,
  Sparkles,
  BookOpen,
  Brain,
  FileSearch,
  ArrowRight,
  Check,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

/* ── Password strength indicator ── */
function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;

  const checks = [
    { label: "6+ characters",   pass: password.length >= 6     },
    { label: "Has a number",     pass: /\d/.test(password)       },
    { label: "Has a letter",     pass: /[a-zA-Z]/.test(password) },
  ];
  const passed = checks.filter((c) => c.pass).length;
  const levels = ["Weak", "Fair", "Strong"];
  const colors = ["bg-red-400", "bg-amber-400", "bg-emerald-400"];
  const textColors = ["text-red-500", "text-amber-500", "text-emerald-600"];

  return (
    <div className="space-y-2 animate-fade-in">
      {/* Strength bar */}
      <div className="flex items-center gap-2">
        <div className="flex gap-1 flex-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-300
                ${i < passed ? colors[passed - 1] : "bg-slate-100"}`}
            />
          ))}
        </div>
        <span className={`text-[11px] font-semibold ${textColors[passed - 1] ?? "text-slate-400"}`}>
          {passed > 0 ? levels[passed - 1] : ""}
        </span>
      </div>

      {/* Check list */}
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {checks.map(({ label, pass }) => (
          <span
            key={label}
            className={`flex items-center gap-1 text-[11px] font-medium transition-colors
              ${pass ? "text-emerald-600" : "text-slate-400"}`}
          >
            <Check className={`w-3 h-3 ${pass ? "opacity-100" : "opacity-30"}`} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Illustration panel feature pill ── */
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

export default function SignupPage() {
  /* ── All original state preserved exactly ── */
  const { signup } = useAuth();
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);

  /* ── Original handler preserved exactly ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await signup(email, password, name);
      toast.success("Account created!");
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Signup failed. Try again.";
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
        bg-gradient-to-br from-[#0c4a6e] via-brand-700 to-brand-600
        flex-col justify-between p-12">

        {/* Floating background orbs */}
        <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-20 w-96 h-96 rounded-full
            bg-brand-400/15 blur-3xl" />
          <div className="absolute bottom-0 -left-20 w-80 h-80 rounded-full
            bg-white/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            w-64 h-64 rounded-full bg-brand-300/10 blur-3xl" />
          {/* Subtle grid */}
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
          <div className="space-y-4 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
              bg-white/10 border border-white/20 text-brand-100 text-xs font-semibold
              uppercase tracking-wider">
              <ShieldCheck className="w-3 h-3" />
              Free to get started
            </div>
            <h2 className="text-4xl font-bold text-white leading-[1.15] tracking-tight">
              Your research,<br />
              <span className="text-brand-200">supercharged.</span>
            </h2>
            <p className="text-brand-100/80 text-base leading-relaxed max-w-xs">
              Join researchers who upload PDFs and instantly get AI-generated
              summaries, semantic search, and intelligent Q&A.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-col gap-3 max-w-xs">
            <FeaturePill icon={FileSearch} text="Upload & summarise any PDF"  delay="80ms"  />
            <FeaturePill icon={Brain}      text="Ask questions across papers"  delay="160ms" />
            <FeaturePill icon={BookOpen}   text="Full conversation history"    delay="240ms" />
          </div>
        </div>

        {/* Bottom: Trust badges */}
        <div className="relative animate-fade-in" style={{ animationDelay: "300ms" }}>
          <div className="flex flex-wrap gap-2">
            {["Gemini AI", "Vector Search", "Secure Auth", "No data limits"].map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full
                  bg-white/10 border border-white/15 text-brand-100 text-xs font-medium"
              >
                <Check className="w-3 h-3 text-brand-300" />
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
          RIGHT — Signup Form
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
              Create your account
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Start analysing research papers with AI in seconds
            </p>
          </div>

          {/* Glass form card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-700/60
            shadow-xl shadow-slate-200/40 dark:shadow-none p-8 space-y-5">

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Full name */}
              <div className="space-y-1.5">
                <label
                  className="text-[13px] font-semibold text-slate-700 dark:text-slate-300"
                  htmlFor="name"
                >
                  Full name
                </label>
                <div className="relative group">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4
                    text-slate-400 dark:text-slate-500 group-focus-within:text-brand-500
                    transition-colors duration-150 pointer-events-none" />
                  <input
                    id="name"
                    type="text"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700
                      bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-sm placeholder-slate-400 dark:placeholder-slate-500
                      focus:outline-none focus:ring-2 focus:ring-brand-500/25
                      focus:border-brand-400 focus:bg-white dark:focus:bg-slate-900
                      transition-all duration-150"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="name"
                  />
                </div>
              </div>

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
              <div className="space-y-2">
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
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
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

                {/* Animated password strength */}
                <PasswordStrength password={password} />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className={`
                  w-full h-11 rounded-xl font-semibold text-sm text-white
                  flex items-center justify-center gap-2 mt-2
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
                    Creating account…
                  </>
                ) : (
                  <>
                    Create Account
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

            {/* Sign in link */}
            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-brand-600 font-semibold hover:text-brand-700
                  underline underline-offset-2 decoration-brand-200
                  hover:decoration-brand-400 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Footer note */}
          <p className="text-center text-[11px] text-slate-400">
            By creating an account, you agree to our Terms of Service and
            Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
