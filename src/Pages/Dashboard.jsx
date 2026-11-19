import { useState } from "react";
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
      { to: "experience", label: "Pengalaman Kerja", icon: Briefcase },
      { to: "education", label: "Pendidikan Formal", icon: GraduationCap },
    ],
  },
  {
    title: "Karya & Portofolio",
    items: [
      { to: "projects", label: "Proyek Portofolio", icon: FolderGit2 },
      { to: "skills", label: "Matriks Keahlian", icon: Zap },
      { to: "services", label: "Layanan & Solusi", icon: Layout },
      { to: "certificates", label: "Sertifikat", icon: Award },
    ],
  },
  {
    title: "Interaksi & Jaringan",
    items: [
      { to: "socials", label: "Tautan Sosial", icon: Share2 },
      { to: "faq", label: "Tanya Jawab (FAQ)", icon: HelpCircle },
      { to: "comments", label: "Komentar Tamu", icon: MessageSquare },
    ],
  },
];

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { config, accent } = usePortfolio();

  const profile = config?.profile || {};

  const handleLogout = async () => {
    localStorage.removeItem("admin_session");
    await supabase.auth.signOut();
    navigate("/login");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full p-4 sm:p-5 gap-5">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-1 shrink-0 pb-1 border-b border-zinc-200 dark:border-zinc-800">
        <Link to="/dashboard/overview" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-bold text-xs flex items-center justify-center shadow-sm">
            {profile.initials || "EZ"}
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              Admin Portal
            </p>
            <p className="text-[10px] text-zinc-500">CMS Edisi 2026</p>
          </div>
        </Link>

        {/* Dark/Light toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
          title="Ubah Mode Gelap / Terang"
        >
          {theme === "dark" ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-zinc-700" />}
        </button>
      </div>

      {/* Categorized Navigation Menu */}
      <nav className="flex flex-col gap-5 flex-1 min-h-0 overflow-y-auto pr-1">
        {NAV_GROUPS.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest px-3 font-bold">
              {group.title}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ to, label, icon: Icon }) => {
                const active = location.pathname.includes(to);
                return (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-xs font-semibold shrink-0 ${
                      active
                        ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 shadow-sm"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Sign Out */}
      <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-xs font-semibold"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Keluar (Sign Out)</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex bg-[#fafafa] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors" style={{ height: "100dvh" }}>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop */}
      <aside
        className="hidden lg:flex w-64 shrink-0 flex-col border-r border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950/60 backdrop-blur-xl"
        style={{ height: "100dvh", position: "sticky", top: 0 }}
      >
        <SidebarContent />
      </aside>

      {/* Sidebar - Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-transform duration-300 lg:hidden shadow-2xl ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {/* Mobile Top Header */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            >
              <Menu className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              Admin Portal
            </span>
          </div>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
          >
            Lihat Situs
          </a>
        </div>

        {/* Scrollable Main View */}
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
