import React, { useState, useEffect, useRef } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import {
  Upload,
  History,
  LogOut,
  Menu,
  X,
  Search,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Bell,
  Sun,
  Moon,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import toast from "react-hot-toast";

const navItems = [
  {
    to: "/dashboard/upload",
    label: "Upload Paper",
    icon: Upload,
    description: "Process new papers",
  },
  {
    to: "/dashboard/history",
    label: "History",
    icon: History,
    description: "View past summaries",
  },
  {
    to: "/dashboard/query",
    label: "Ask Papers",
    icon: Search,
    description: "Query your library",
  },
  {
    to: "/dashboard/query-history",
    label: "Query History",
    icon: MessageSquare,
    description: "Past conversations",
  },
];

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/dashboard/upload": {
    title: "Upload Paper",
    subtitle: "Process a new research paper with AI",
  },
  "/dashboard/history": {
    title: "Paper Library",
    subtitle: "All your processed research papers",
  },
  "/dashboard/query": {
    title: "Ask Your Papers",
    subtitle: "Semantic search across your library",
  },
  "/dashboard/query-history": {
    title: "Query History",
    subtitle: "Your past AI conversations",
  },
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const mainRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const currentPage = pageTitles[location.pathname] || {
    title: "Dashboard",
    subtitle: "AI Research Summarizer",
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out");
  };

  // Track scroll for glass navbar
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const handleScroll = () => setIsScrolled(el.scrollTop > 8);
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Close user menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const avatarInitial = user?.name?.[0]?.toUpperCase() ?? "U";

  return (
    <div className="flex h-screen bg-[#f8f9fb] dark:bg-[#0b1120] overflow-hidden font-sans text-slate-900 dark:text-slate-100">
      {/* ── Mobile Overlay ── */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${
          sidebarOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col
          bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800
          transition-all duration-300 ease-in-out
          shadow-[4px_0_24px_rgba(0,0,0,0.04)] dark:shadow-none
          lg:static lg:z-auto gpu
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${sidebarCollapsed ? "lg:w-[68px]" : "w-[240px]"}
        `}
      >
        {/* ── Logo ── */}
        <div
          className={`
            h-14 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 shrink-0
            transition-all duration-300
            ${sidebarCollapsed ? "px-3 justify-center" : "px-4"}
          `}
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shrink-0 shadow-md shadow-brand-200">
            <Sparkles className="w-4 h-4 text-white" />
          </div>

          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0 overflow-hidden">
              <p className="text-[13px] font-bold text-slate-900 dark:text-white leading-tight truncate">
                ResearchAI
              </p>
              <p className="text-[10px] text-slate-400 leading-tight tracking-wide uppercase font-medium">
                Summarizer
              </p>
            </div>
          )}

          {/* Mobile close */}
          <button
            className="lg:hidden ml-auto p-1 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-4 h-4" />
          </button>

          {/* Desktop collapse toggle */}
          {!sidebarCollapsed && (
            <button
              className="hidden lg:flex p-1 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              onClick={() => setSidebarCollapsed(true)}
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ── Expand button when collapsed ── */}
        {sidebarCollapsed && (
          <button
            className="hidden lg:flex justify-center p-2 mx-2 mt-2 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            onClick={() => setSidebarCollapsed(false)}
            title="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* ── Section label ── */}
        {!sidebarCollapsed && (
          <div className="px-4 pt-4 pb-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400 dark:text-slate-500">
              Navigation
            </p>
          </div>
        )}

        {/* ── Nav ── */}
        <nav className={`flex-1 px-2 py-2 space-y-0.5 overflow-y-auto`}>
          {navItems.map(({ to, label, icon: Icon, description }) => (
            <NavLink
              key={to}
              to={to}
              title={sidebarCollapsed ? label : undefined}
              className={({ isActive }) =>
                `
                group relative flex items-center gap-3 rounded-xl text-sm font-medium
                transition-all duration-150 cursor-pointer
                ${sidebarCollapsed ? "px-0 py-2.5 justify-center" : "px-3 py-2.5"}
                ${
                  isActive
                    ? "bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                }
              `
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active pill indicator */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-brand-600 rounded-r-full" />
                  )}

                  <span
                    className={`
                      flex items-center justify-center w-8 h-8 rounded-lg shrink-0
                      transition-all duration-150
                      ${
                        isActive
                          ? "bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-400"
                          : "text-slate-500 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 group-hover:bg-slate-100 dark:group-hover:bg-slate-800/50"
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                  </span>

                  {!sidebarCollapsed && (
                    <span className="truncate">{label}</span>
                  )}

                  {/* Tooltip for collapsed state */}
                  {sidebarCollapsed && (
                    <span className="absolute left-full ml-2 z-50 px-2.5 py-1.5 bg-slate-900 dark:bg-slate-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 shadow-lg border border-slate-700">
                      {label}
                      <span className="block text-slate-400 text-[10px] mt-0.5">
                        {description}
                      </span>
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* ── User Footer ── */}
        <div className="border-t border-slate-100 dark:border-slate-800 p-2 shrink-0">
          {sidebarCollapsed ? (
            /* Collapsed: just avatar */
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="w-full flex justify-center p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              title={user?.name ?? ""}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                {avatarInitial}
              </div>
            </button>
          ) : (
            /* Expanded: full user card */
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
                  {avatarInitial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-slate-900 dark:text-slate-200 truncate leading-tight">
                    {user?.name}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate leading-tight">
                    {user?.email}
                  </p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="
                  group w-full flex items-center gap-2.5 px-2 py-2 rounded-xl
                  text-[13px] font-medium text-slate-500 dark:text-slate-400
                  hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400
                  transition-all duration-150
                "
              >
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-red-100 dark:group-hover:bg-red-500/20 transition-colors">
                  <LogOut className="w-3.5 h-3.5" />
                </span>
                Sign out
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* ── Topbar / Navbar ── */}
        <header
          className={`
            h-14 flex items-center gap-3 px-4 lg:px-6 shrink-0 z-30
            transition-all duration-200
            ${
              isScrolled
                ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 shadow-[0_1px_0_rgba(0,0,0,0.04)] dark:shadow-none"
                : "bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800"
            }
          `}
        >
          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 -ml-1 text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Page title */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-[15px] font-semibold text-slate-900 dark:text-white truncate">
                {currentPage.title}
              </h1>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium hidden sm:block truncate">
              {currentPage.subtitle}
            </p>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-1.5">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="relative p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle theme"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notification bell */}
            <button
              className="relative p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {/* Animated notification dot */}
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse" />
            </button>

            {/* Divider */}
            <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />

            {/* User avatar menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen((o) => !o)}
                className="flex items-center gap-2 p-1 pr-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                  {avatarInitial}
                </div>
                <span className="hidden sm:block text-[13px] font-medium text-slate-700 dark:text-slate-300 max-w-[100px] truncate">
                  {user?.name?.split(" ")[0]}
                </span>
                <ChevronRight
                  className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-500 hidden sm:block transition-transform duration-200 ${userMenuOpen ? "rotate-90" : ""}`}
                />
              </button>

              {/* Dropdown */}
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl shadow-slate-200/60 dark:shadow-none overflow-hidden z-50 animate-fade-in">
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                    <p className="text-[13px] font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {user?.name}
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-400 truncate mt-0.5">
                      {user?.email}
                    </p>
                  </div>
                  {/* Menu items */}
                  <div className="p-1.5">
                    <button
                      onClick={handleLogout}
                      className="
                        w-full flex items-center gap-2.5 px-3 py-2 rounded-xl
                        text-[13px] font-medium text-red-600 dark:text-red-400
                        hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-left
                      "
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── Page Content ── */}
        <main
          ref={mainRef}
          className="flex-1 overflow-y-auto"
        >
          <div className="px-4 py-6 lg:px-8 lg:py-8 max-w-[1280px] mx-auto w-full animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
