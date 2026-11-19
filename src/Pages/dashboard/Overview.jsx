import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FolderGit2,
  Award,
  MessageSquare,
  ExternalLink,
  User,
  Palette,
  Briefcase,
  Zap,
  Sliders,
  Layout,
  Share2,
  HelpCircle,
  GraduationCap,
  Activity,
} from "lucide-react";
import { usePortfolio } from "../../context/PortfolioContext";
import { supabase } from "../../supabase";
import { getVisitorLogs } from "../../utils/visitorTracker";

const StatCard = ({ title, count, icon: Icon, to, subtext }) => (
  <Link
    to={to}
    className="p-5 rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-sm group"
  >
    <div className="flex items-center justify-between">
      <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 group-hover:scale-105 transition-transform">
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-2xl font-extrabold text-zinc-900 dark:text-white">{count}</span>
    </div>
    <div className="mt-4">
      <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{title}</div>
      <div className="text-xs text-zinc-500 mt-0.5">{subtext}</div>
    </div>
  </Link>
);

export default function Overview() {
  const { config, updateConfig } = usePortfolio();
  const profile = config?.profile || {};

  const [projectCount, setProjectCount] = useState(0);
  const [certCount, setCertCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [visitorCount, setVisitorCount] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [p, c, comm] = await Promise.all([
          supabase.from("projects").select("id", { count: "exact" }),
          supabase.from("certificates").select("id", { count: "exact" }),
          supabase.from("portfolio_comments").select("id", { count: "exact" }),
        ]);
        if (p.count !== null) setProjectCount(p.count);
        if (c.count !== null) setCertCount(c.count);
        if (comm.count !== null) setCommentCount(comm.count);
      } catch {
        setProjectCount(3);
        setCertCount(4);
        setCommentCount(1);
      }

      const logs = await getVisitorLogs();
      setVisitorCount(logs.length);
    };
    fetchCounts();
  }, []);

  const toggleAvailability = () => {
    const updated = {
      ...config,
      profile: {
        ...profile,
        isAvailable: !profile.isAvailable,
      },
    };
    updateConfig(updated);
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Top Welcome Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Selamat Datang, Administrator
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white mt-1">
            Pusat Kendali Portofolio
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Kelola profil personal, riwayat karir, proyek, dan desain visual secara 100% dinamis.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/dashboard/logs"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm"
          >
            <Activity className="w-4 h-4 text-emerald-500" />
            <span>Lihat Log Pengunjung</span>
          </Link>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:text-black dark:hover:text-white transition-colors"
          >
            <span>Buka Situs Publik</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Quick Status Control */}
      <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${profile.isAvailable !== false ? "bg-emerald-500 animate-pulse" : "bg-zinc-400"}`}></div>
          <div>
            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              Status Ketersediaan: {profile.isAvailable !== false ? "Tersedia untuk Pekerjaan" : "Sedang Sibuk / Tidak Tersedia"}
            </div>
            <div className="text-xs text-zinc-500">
              Label badge pengunjung: "{profile.statusText || "Tersedia untuk Pekerjaan Penuh Waktu & Kontrak"}"
            </div>
          </div>
        </div>

        <button
          onClick={toggleAvailability}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            profile.isAvailable !== false
              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20"
              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
          }`}
        >
          {profile.isAvailable !== false ? "Ubah ke Mode Sibuk" : "Ubah ke Mode Tersedia"}
        </button>
      </div>

      {/* 4 Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Kunjungan Visitor"
          count={visitorCount}
          icon={Activity}
          to="/dashboard/logs"
          subtext="Total akses terekam"
        />
        <StatCard
          title="Proyek Portofolio"
          count={projectCount}
          icon={FolderGit2}
          to="/dashboard/projects"
          subtext="Item proyek aktif"
        />
        <StatCard
          title="Sertifikat Resmi"
          count={certCount}
          icon={Award}
          to="/dashboard/certificates"
          subtext="Kredensial terverifikasi"
        />
        <StatCard
          title="Komentar Tamu"
          count={commentCount}
          icon={MessageSquare}
          to="/dashboard/comments"
          subtext="Pesan di buku tamu"
        />
      </div>

      {/* Quick Setup Sections */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
          Pintasan Menu Utama
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link
            to="/dashboard/profile"
            className="p-4 rounded-xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
          >
            <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mb-2" />
            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Profil & Foto</div>
            <div className="text-[11px] text-zinc-500 mt-1">Ubah foto profil, nama, headline</div>
          </Link>

          <Link
            to="/dashboard/logs"
            className="p-4 rounded-xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
          >
            <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mb-2" />
            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Log Pengunjung</div>
            <div className="text-[11px] text-zinc-500 mt-1">IP, perangkat, lokasi, riwayat akses</div>
          </Link>

          <Link
            to="/dashboard/sections"
            className="p-4 rounded-xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
          >
            <Sliders className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mb-2" />
            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Visibilitas Section</div>
            <div className="text-[11px] text-zinc-500 mt-1">Sembunyikan / munculkan bagian</div>
          </Link>

          <Link
            to="/dashboard/appearance"
            className="p-4 rounded-xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
          >
            <Palette className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mb-2" />
            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Gaya & Ukuran</div>
            <div className="text-[11px] text-zinc-500 mt-1">Font, lebar kontainer, border radius</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
