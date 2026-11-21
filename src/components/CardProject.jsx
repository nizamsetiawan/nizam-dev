import React from "react";
import { Link } from "react-router-dom";
import { ExternalLink, ArrowRight, Github } from "lucide-react";
import { toSlug } from "../utils/slug";
import { usePortfolio } from "../context/PortfolioContext";

// Shared colorful tag palette (10 colors, cycling)
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
const TAG_MONO = "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/50";

const getTagClass = (style, idx) => {
  const base = "px-2.5 py-0.5 text-[11px] font-semibold rounded-md";
  const i = idx % 10;
  if (style === "colorful") return `${base} ${TAG_COLORS_FILL[i]}`;
  if (style === "outline")  return `${base} ${TAG_COLORS_OUTLINE[i]}`;
  return `${base} ${TAG_MONO}`;
};

const CardProject = ({ Img, Title, Description, Link: ProjectLink, Github: GithubLink, TechStack, id }) => {
  const { config, accent } = usePortfolio();
  const tagStyle = config?.appearance?.skillTagStyle ?? "colorful";

  const handleLiveDemo = (e) => {
    if (!ProjectLink) {
      e.preventDefault();
      alert("Tautan live demo belum tersedia");
    }
  };

  // Parse TechStack
  let techArray = [];
  if (Array.isArray(TechStack)) {
    techArray = TechStack;
  } else if (typeof TechStack === "string") {
    try {
      techArray = JSON.parse(TechStack);
    } catch {
      techArray = TechStack.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }

  return (
    <div className="group relative flex flex-col h-full rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-lg dark:hover:shadow-black/50">
      {/* Project Thumbnail Image */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800/80">
        <img
          src={Img || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop"}
          alt={Title || "Pratinjau proyek"}
          loading="lazy"
          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 dark:from-zinc-950/60 via-transparent to-transparent opacity-60"></div>
      </div>

      {/* Content */}
      <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-black dark:group-hover:text-white transition-colors">
              {Title || "Proyek Tanpa Judul"}
            </h3>
          </div>

          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed">
            {Description || "Belum ada deskripsi untuk proyek ini."}
          </p>
        </div>

        {/* Tech Stack Tags */}
        {techArray.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {techArray.slice(0, 4).map((tech, idx) => (
              <span
                key={idx}
                className={getTagClass(tagStyle, idx)}
              >
                {tech}
              </span>
            ))}
            {techArray.length > 4 && (
              <span className="px-2 py-0.5 text-[11px] text-zinc-500 font-mono">
                +{techArray.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Action Links */}
        <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            {ProjectLink ? (
              <a
                href={ProjectLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleLiveDemo}
                className={`inline-flex items-center gap-1.5 font-semibold ${accent?.text || "text-emerald-600 dark:text-emerald-400"} ${accent?.hoverText || "hover:text-emerald-700 dark:hover:text-emerald-300"} transition-colors`}
              >
                <span>Demo Langsung</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <span className="text-zinc-400 dark:text-zinc-600 text-[11px]">Tanpa Demo</span>
            )}

            {GithubLink && (
              <a
                href={GithubLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Repositori GitHub"
                className="inline-flex items-center gap-1 font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-zinc-200 transition-colors"
              >
                <Github className="w-3.5 h-3.5" />
                <span>Kode</span>
              </a>
            )}
          </div>

          {Title && (
            <Link
              to={`/project/${toSlug(Title)}`}
              className="inline-flex items-center gap-1 font-semibold text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors"
            >
              <span>Detail</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardProject;
