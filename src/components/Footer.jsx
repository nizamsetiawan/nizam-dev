import React from "react";
import { Link } from "react-router-dom";
import { ArrowUp } from "lucide-react";
import { usePortfolio } from "../context/PortfolioContext";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { config, containerClass } = usePortfolio();
  const profile = config?.profile || {};
  const footer = config?.footer || {};

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-950/60 py-10 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className={`${containerClass} mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-500`}>
        <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
          <span className="font-semibold text-zinc-800 dark:text-zinc-300">{profile.name || "Nizam Setiawan"}</span>
          <span className="hidden sm:inline">•</span>
          <span>{footer.note || "Dirancang dengan standar rekayasa modern"} © {currentYear}</span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors font-medium"
          >
            Portal Admin
          </Link>
          <span>•</span>
          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-1 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors font-medium"
          >
            <span>Kembali ke atas</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
