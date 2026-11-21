import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  ExternalLink,
  Github,
  CheckCircle2,
  Calendar,
  Layers,
  Code2,
  FolderGit2,
} from "lucide-react";
import { toSlug } from "../utils/slug";
import { usePortfolio } from "../context/PortfolioContext";
import Swal from "sweetalert2";

// ── Shared tag color palettes (10 colors, cycling by index) ──
const TAG_COLORS_FILL = [
  "bg-blue-100   text-blue-700   dark:bg-blue-900/40   dark:text-blue-300   border border-blue-200   dark:border-blue-800/50",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50",
  "bg-violet-100 text-violet-700  dark:bg-violet-900/40  dark:text-violet-300  border border-violet-200  dark:border-violet-800/50",
  "bg-amber-100  text-amber-700   dark:bg-amber-900/40   dark:text-amber-300   border border-amber-200   dark:border-amber-800/50",
  "bg-rose-100   text-rose-700    dark:bg-rose-900/40    dark:text-rose-300    border border-rose-200    dark:border-rose-800/50",
  "bg-cyan-100   text-cyan-700    dark:bg-cyan-900/40    dark:text-cyan-300    border border-cyan-200    dark:border-cyan-800/50",
  "bg-orange-100 text-orange-700  dark:bg-orange-900/40  dark:text-orange-300  border border-orange-200  dark:border-orange-800/50",
  "bg-teal-100   text-teal-700    dark:bg-teal-900/40    dark:text-teal-300    border border-teal-200    dark:border-teal-800/50",
  "bg-indigo-100 text-indigo-700  dark:bg-indigo-900/40  dark:text-indigo-300  border border-indigo-200  dark:border-indigo-800/50",
  "bg-pink-100   text-pink-700    dark:bg-pink-900/40    dark:text-pink-300    border border-pink-200    dark:border-pink-800/50",
];
const TAG_COLORS_OUTLINE = [
  "border border-blue-400   text-blue-600   dark:text-blue-400",
  "border border-emerald-400 text-emerald-600 dark:text-emerald-400",
  "border border-violet-400  text-violet-600  dark:text-violet-400",
  "border border-amber-400   text-amber-600   dark:text-amber-400",
  "border border-rose-400    text-rose-600    dark:text-rose-400",
  "border border-cyan-400    text-cyan-600    dark:text-cyan-400",
  "border border-orange-400  text-orange-600  dark:text-orange-400",
  "border border-teal-400    text-teal-600    dark:text-teal-400",
  "border border-indigo-400  text-indigo-600  dark:text-indigo-400",
  "border border-pink-400    text-pink-600    dark:text-pink-400",
];
const TAG_MONO = "bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800";

const getTagClass = (style, idx) => {
  const base = "px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors";
  const i = idx % 10;
  if (style === "colorful") return `${base} ${TAG_COLORS_FILL[i]}`;
  if (style === "outline")  return `${base} ${TAG_COLORS_OUTLINE[i]}`;
  return `${base} ${TAG_MONO}`;
};

export default function ProjectDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { config, accent, containerClass, cardRadiusClass, buttonRadiusClass } = usePortfolio();
  const skillTagStyle = config?.appearance?.skillTagStyle ?? "colorful";
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const stored = JSON.parse(localStorage.getItem("projects")) || [];
    const found = stored.find((p) => toSlug(p.Title) === slug);

    if (found) {
      setProject({
        ...found,
        Features: found.Features || [
          "Arsitektur komponen modular dan reusable",
          "Desain antarmuka 100% responsif di desktop, tablet, dan ponsel",
          "Optimasi performa Core Web Vitals dan SEO semantik",
          "Integrasi basis data cloud real-time dan otorisasi aman",
        ],
        TechStack: found.TechStack || ["React", "Tailwind CSS", "Vite", "Supabase"],
        Github: found.Github || "https://github.com/nizamsetiawan",
      });
    }
    setLoading(false);
  }, [slug]);

  const handleGithubClick = (e, githubLink) => {
    if (githubLink === "Private" || !githubLink) {
      e.preventDefault();
      Swal.fire({
        icon: "info",
        title: "Repositori Privat",
        text: "Kode sumber untuk proyek ini bersifat tertutup (private repository).",
        confirmButtonColor: "#10b981",
        confirmButtonText: "Mengerti",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className={`min-h-[70vh] flex flex-col items-center justify-center px-4 ${containerClass} mx-auto text-center space-y-4`}>
        <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400">
          <FolderGit2 className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          Proyek Tidak Ditemukan
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 max-w-sm">
          Detail proyek yang Anda cari mungkin telah diubah atau tidak terdaftar di sistem.
        </p>
        <Link
          to="/"
          className={`inline-flex items-center gap-2 px-5 py-2.5 ${buttonRadiusClass} bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Portofolio</span>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${project.Title} — Rincian Proyek`}</title>
        <meta
          name="description"
          content={project.Description || "Rincian spesifikasi teknis dan implementasi proyek portofolio."}
        />
      </Helmet>

      <div className={`pt-28 pb-20 px-4 sm:px-6 lg:px-8 ${containerClass} mx-auto space-y-10`}>
        {/* Navigation Breadcrumb & Back */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </button>

          <span className="text-xs font-mono text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-3 py-1 rounded-md">
            ID: #{project.id}
          </span>
        </div>

        {/* Title & Header */}
        <div className="space-y-3">
          <div className={`text-xs font-semibold uppercase tracking-wider ${accent.text}`}>
            Studi Kasus Proyek
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            {project.Title}
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
            {project.Description}
          </p>
        </div>

        {/* Project Visual Showcase */}
        {project.Img && (
          <div className={`w-full overflow-hidden ${cardRadiusClass} border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-md`}>
            <img
              src={project.Img}
              alt={project.Title}
              className="w-full max-h-[500px] object-cover"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>
        )}

        {/* Project Meta & Action Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Content: Features & Overview */}
          <div className="lg:col-span-8 space-y-8">
            {/* Features List */}
            {project.Features && project.Features.length > 0 && (
              <div className={`p-6 sm:p-7 ${cardRadiusClass} bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 shadow-sm space-y-4`}>
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <CheckCircle2 className={`w-4 h-4 ${accent.text}`} />
                  Fitur Unggulan & Kapabilitas Solusi
                </h2>
                <div className="space-y-3 pt-1">
                  {project.Features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      <span className={`w-1.5 h-1.5 rounded-full ${accent.dot} shrink-0 mt-2`}></span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Meta: Tech Stack & Actions */}
          <div className="lg:col-span-4 space-y-5">
            <div className={`p-6 ${cardRadiusClass} bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 shadow-sm space-y-5`}>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
                  Aksi & Tautan Langsung
                </h3>
                <div className="space-y-2">
                  {project.Link && project.Link !== "#" && (
                    <a
                      href={project.Link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 ${buttonRadiusClass} bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-sm`}
                    >
                      <span>Buka Live Demo</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  {project.Github && (
                    <a
                      href={project.Github}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => handleGithubClick(e, project.Github)}
                      className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 ${buttonRadiusClass} bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold hover:text-black dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all`}
                    >
                      <Github className="w-3.5 h-3.5" />
                      <span>{project.Github === "Private" ? "Kode Sumber Privat" : "Lihat Repositori GitHub"}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Tech Stack Pills */}
              {project.TechStack && project.TechStack.length > 0 && (
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/60">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2.5">
                    Teknologi Digunakan
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {project.TechStack.map((tech, idx) => (
                      <span
                        key={tech}
                        className={getTagClass(skillTagStyle, idx)}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
