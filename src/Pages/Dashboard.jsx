import { useState, useMemo } from "react";
import { Routes, Route, Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import { useTheme } from "../context/ThemeContext";
import { usePortfolio } from "../context/PortfolioContext";

// Dashboard Subpages
import Overview from "./dashboard/Overview";
import LivePreview from "./dashboard/LivePreview";
import VisitorLogs from "./dashboard/VisitorLogs";
import SectionsManager from "./dashboard/SectionsManager";
import ProfileHero from "./dashboard/ProfileHero";
import AboutBio from "./dashboard/AboutBio";
import Experiences from "./dashboard/Experiences";
import ServicesManager from "./dashboard/ServicesManager";
import SkillsManager from "./dashboard/SkillsManager";
import Projects from "./dashboard/Projects";
import EducationManager from "./dashboard/EducationManager";
import Certificates from "./dashboard/Certificates";
import SocialLinksManager from "./dashboard/SocialLinksManager";
import FaqManager from "./dashboard/FaqManager";
import Comments from "./dashboard/Comments";
import Appearance from "./dashboard/Appearance";

import {
  FolderGit2,
  Award,
  MessageSquare,
  LogOut,
  LayoutDashboard,
  Menu,
  User,
  FileText,
  Briefcase,
  Zap,
  Palette,
  Sun,
  Moon,
  Eye,
  Sliders,
  Share2,
  GraduationCap,
  HelpCircle,
  Layout,
  Activity,
  ExternalLink,
  Search,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Radio,
  X,
} from "lucide-react";

// Categorized navigation structure
const NAV_GROUPS = [
  {
    title: "Tampilan & Analitik",
    items: [
      { to: "overview", label: "Ringkasan", icon: LayoutDashboard },
      { to: "preview", label: "Pratinjau Langsung", icon: Eye },
      { to: "logs", label: "Log Pengunjung", icon: Activity },
      { to: "sections", label: "Visibilitas Section", icon: Sliders },
      { to: "appearance", label: "Gaya & Ukuran", icon: Palette },
    ],
  },
  {
    title: "Konten Profil & Karir",
    items: [
      { to: "profile", label: "Profil & Hero", icon: User },
      { to: "about", label: "Tentang & Narasi", icon: FileText },
      { to: "experience", label: "Pengalaman Kerja", icon: Briefcase, countKey: "experiences" },
      { to: "education", label: "Pendidikan Formal", icon: GraduationCap, countKey: "education" },
    ],
  },
  {
    title: "Karya & Portofolio",
    items: [
      { to: "projects", label: "Proyek Portofolio", icon: FolderGit2 },
      { to: "skills", label: "Matriks Keahlian", icon: Zap, countKey: "skillsCategories" },
      { to: "services", label: "Layanan & Solusi", icon: Layout, countKey: "services" },
      { to: "certificates", label: "Sertifikat", icon: Award },
    ],
  },
  {
    title: "Interaksi & Jaringan",
    items: [
      { to: "socials", label: "Tautan Sosial", icon: Share2, countKey: "socialLinksList" },
      { to: "faq", label: "Tanya Jawab (FAQ)", icon: HelpCircle, countKey: "faq" },
      { to: "comments", label: "Komentar Tamu", icon: MessageSquare },
    ],
  },
];

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuSearch, setMenuSearch] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("admin_sidebar_collapsed") === "true";
  });
  const { theme, toggleTheme } = useTheme();
  const { config, accent, cardRadiusClass, buttonRadiusClass } = usePortfolio();

  const toggleSidebarCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("admin_sidebar_collapsed", String(next));
      return next;
    });
  };

  const profile = config?.profile || {};
  const adminEmail = localStorage.getItem("admin_email") || profile.contactEmail || "admin@portofolio.dev";

  const handleLogout = async () => {
    localStorage.removeItem("admin_session");
    localStorage.removeItem("admin_email");
    await supabase.auth.signOut();
    navigate("/login");
  };

  // Find active group and item for breadcrumb
  const currentNav = useMemo(() => {
    for (const group of NAV_GROUPS) {
      for (const item of group.items) {
        if (location.pathname.includes(item.to)) {
          return { groupTitle: group.title, item };
        }
      }
    }
    return {
      groupTitle: "Tampilan & Analitik",
      item: { to: "overview", label: "Ringkasan", icon: LayoutDashboard },
    };
  }, [location.pathname]);

  // Filter menu items by search
  const filteredGroups = useMemo(() => {
    if (!menuSearch.trim()) return NAV_GROUPS;
    const q = menuSearch.toLowerCase().trim();
    return NAV_GROUPS.map((g) => ({
      ...g,
      items: g.items.filter((item) =>
        item.label.toLowerCase().includes(q) || g.title.toLowerCase().includes(q)
      ),
    })).filter((g) => g.items.length > 0);
  }, [menuSearch]);

  const SidebarContent = ({ collapsed = false }) => (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950/95 text-zinc-900 dark:text-zinc-100 select-none">
      {/* Brand Header */}
      <div className={`border-b border-zinc-200/80 dark:border-zinc-800/80 flex items-center shrink-0 ${
        collapsed ? "p-3 flex-col gap-2.5 justify-center" : "p-4 justify-between"
      }`}>
        <Link to="/dashboard/overview" className="flex items-center gap-3 group min-w-0" title="Admin Portal Overview">
          <div className={`w-9 h-9 shrink-0 ${cardRadiusClass} ${accent.bg} text-white font-extrabold text-xs flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
            {profile.initials || "MNS"}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate flex items-center gap-1.5">
                <span>Admin Portal</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              </p>
              <p className="text-[10px] text-zinc-500 font-mono truncate">
                {profile.name || "Muhammad Nizam"}
              </p>
            </div>
          )}
        </Link>

        {/* Desktop Collapse Toggle Button (< / >) */}
        <button
          onClick={toggleSidebarCollapse}
          className={`hidden lg:flex p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition-colors ${
            collapsed ? "mt-1 w-full justify-center" : ""
          }`}
          title={collapsed ? "Perluas Menu (>)" : "Ciutkan Menu (<)"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Mobile Close Button (X) */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-1 rounded-lg text-zinc-400 hover:text-zinc-800 dark:hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Menu Search */}
      {!collapsed ? (
        <div className="px-3.5 pt-3 pb-1">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={menuSearch}
              onChange={(e) => setMenuSearch(e.target.value)}
              placeholder="Cari menu navigasi..."
              className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-xl bg-zinc-100/80 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
            />
            {menuSearch && (
              <button
                onClick={() => setMenuSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="px-2 pt-2.5 pb-1 flex justify-center">
          <button
            onClick={() => {
              setIsCollapsed(false);
              localStorage.setItem("admin_sidebar_collapsed", "false");
            }}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            title="Cari Menu (Klik untuk Perluas)"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Nav Menu */}
      <nav className={`flex-1 overflow-y-auto py-2 space-y-3 scrollbar-thin ${
        collapsed ? "px-2" : "px-3.5"
      }`}>
        {filteredGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!collapsed ? (
              <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider px-2">
                {group.title}
              </p>
            ) : (
              gIdx > 0 && <div className="border-t border-zinc-200/60 dark:border-zinc-800/60 my-2 mx-1" />
            )}
            <div className="space-y-1">
              {group.items.map(({ to, label, icon: Icon, countKey }) => {
                const active = location.pathname.includes(to);
                const count = countKey && Array.isArray(config?.[countKey]) ? config[countKey].length : null;

                if (collapsed) {
                  return (
                    <Link
                      key={to}
                      to={to}
                      title={`${label}${count !== null ? ` (${count})` : ""}`}
                      className={`relative flex items-center justify-center w-10 h-10 mx-auto rounded-xl transition-all group ${
                        active
                          ? `bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 shadow-sm`
                          : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/80 hover:text-black dark:hover:text-white"
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${active ? "" : "text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200"}`} />
                      {count !== null && (
                        <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 text-[9px] font-bold rounded-full bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-950 flex items-center justify-center ring-2 ring-white dark:ring-zinc-950">
                          {count > 99 ? "99+" : count}
                        </span>
                      )}
                    </Link>
                  );
                }

                return (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setSidebarOpen(false)}
                    className={`group flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                      active
                        ? `bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 shadow-sm`
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/80 hover:text-black dark:hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${active ? "" : "text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200"}`} />
                      <span className="truncate">{label}</span>
                    </div>

                    {count !== null && (
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                          active
                            ? "bg-zinc-700 dark:bg-zinc-200 text-white dark:text-zinc-900"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom User & Sign Out Card */}
      <div className={`border-t border-zinc-200/80 dark:border-zinc-800/80 shrink-0 bg-zinc-50/50 dark:bg-zinc-900/40 ${
        collapsed ? "p-2 space-y-2 flex flex-col items-center" : "p-3 space-y-2"
      }`}>
        {!collapsed ? (
          <>
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                  <ShieldCheck className={`w-3.5 h-3.5 ${accent.text}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-zinc-900 dark:text-zinc-200 truncate">
                    Admin Terotentikasi
                  </p>
                  <p className="text-[10px] font-mono text-zinc-400 truncate max-w-[130px]">
                    {adminEmail}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-red-300 dark:hover:border-red-900/60 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 text-xs font-semibold transition-colors shadow-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar Portal</span>
            </button>
          </>
        ) : (
          <>
            <div
              className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center shrink-0 cursor-default"
              title={`Admin Terotentikasi (${adminEmail})`}
            >
              <ShieldCheck className={`w-4 h-4 ${accent.text}`} />
            </div>

            <button
              onClick={handleLogout}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-red-300 dark:hover:border-red-900/60 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors shadow-xs"
              title="Keluar Portal"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );

  const ActiveIcon = currentNav.item.icon || LayoutDashboard;

  return (
    <div className="flex bg-[#fcfcfc] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors overflow-hidden" style={{ height: "100dvh" }}>
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden backdrop-blur-sm animate-fadeIn"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop */}
      <aside
        className={`hidden lg:flex shrink-0 flex-col border-r border-zinc-200/80 dark:border-zinc-800/80 z-20 transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-[68px]" : "w-64"
        }`}
        style={{ height: "100dvh" }}
      >
        <SidebarContent collapsed={isCollapsed} />
      </aside>

      {/* Sidebar - Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-transform duration-300 lg:hidden shadow-2xl ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent collapsed={false} />
      </aside>

      {/* Main View Shell */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
        {/* Modern Topbar Header (Desktop & Mobile) */}
        <header className="h-14 shrink-0 px-4 sm:px-6 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md flex items-center justify-between gap-4 z-10">
          {/* Left: Mobile Toggle & Desktop Collapse Toggle & Breadcrumbs */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {/* Mobile Drawer Hamburger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Desktop Collapse Toggle (> / <) Button */}
            <button
              onClick={toggleSidebarCollapse}
              className="hidden lg:flex items-center justify-center p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors shadow-2xs"
              title={isCollapsed ? "Perluas Menu Sidebar (>)" : "Ciutkan Menu Sidebar (<)"}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 min-w-0">
              <span className="hidden sm:inline text-zinc-400 dark:text-zinc-600">
                {currentNav.groupTitle}
              </span>
              <ChevronRight className="hidden sm:inline w-3.5 h-3.5 text-zinc-400" />
              <div className="flex items-center gap-1.5 text-zinc-900 dark:text-zinc-100 font-bold truncate">
                <ActiveIcon className={`w-4 h-4 ${accent.text} shrink-0`} />
                <span className="truncate">{currentNav.item.label}</span>
              </div>
            </div>
          </div>

          {/* Right: Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Live Indicator Pill */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Realtime Sinkron</span>
            </div>

            {/* View Live Website Button */}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${buttonRadiusClass} bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-xs`}
              title="Buka beranda situs di tab baru"
            >
              <span>Lihat Situs</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {/* Dark / Light Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 ${buttonRadiusClass} bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors`}
              title="Ganti Tema Gelap / Terang"
            >
              {theme === "dark" ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-zinc-700" />}
            </button>
          </div>
        </header>

        {/* Scrollable Workspace Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<Overview />} />
            <Route path="preview" element={<LivePreview />} />
            <Route path="logs" element={<VisitorLogs />} />
            <Route path="sections" element={<SectionsManager />} />
            <Route path="appearance" element={<Appearance />} />
            <Route path="profile" element={<ProfileHero />} />
            <Route path="about" element={<AboutBio />} />
            <Route path="services" element={<ServicesManager />} />
            <Route path="experience" element={<Experiences />} />
            <Route path="skills" element={<SkillsManager />} />
            <Route path="projects" element={<Projects />} />
            <Route path="education" element={<EducationManager />} />
            <Route path="certificates" element={<Certificates />} />
            <Route path="socials" element={<SocialLinksManager />} />
            <Route path="faq" element={<FaqManager />} />
            <Route path="comments" element={<Comments />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
