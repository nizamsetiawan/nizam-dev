import React, { useState, memo } from "react";
import {
  Layout, Database, Cloud, Zap, Layers, Cpu, Globe, Code2,
  Terminal, Server, Shield, Smartphone, Monitor, Award, Star,
  Compass, GitBranch, Package, Box, Key, Lock, Workflow, Share2,
  Github, Linkedin, Twitter, Instagram, Mail, MessageSquare, Send,
  CheckCircle2, HelpCircle, GraduationCap, Briefcase, Palette, Sparkles, ChevronDown,
} from "lucide-react";
import { usePortfolio } from "../context/PortfolioContext";

const ICON_MAP = {
  Layout, Database, Cloud, Zap, Layers, Cpu, Globe, Code2,
  Terminal, Server, Shield, Smartphone, Monitor, Award, Star,
  Compass, GitBranch, Package, Box, Key, Lock, Workflow, Share2,
  Github, Linkedin, Twitter, Instagram, Mail, MessageSquare, Send,
  CheckCircle2, HelpCircle, GraduationCap, Briefcase, Palette, Sparkles,
};

const ServicesSection = () => {
  const { config, accent, containerClass, cardRadiusClass } = usePortfolio();
  const [showAllServices, setShowAllServices] = useState(false);

  if (config?.sections?.services === false) return null;

  const services = config?.services || [];
  if (services.length === 0) return null;

  const INITIAL_SERVICES = 4;
  const visibleServices = showAllServices ? services : services.slice(0, INITIAL_SERVICES);

  return (
    <section id="Services" className={`py-20 px-4 sm:px-6 lg:px-8 ${containerClass} mx-auto border-t border-zinc-200 dark:border-zinc-800/80`}>
      <div className="space-y-2 mb-8">
        <div className={`text-xs font-semibold uppercase tracking-wider ${accent.text}`}>
          Layanan & Keahlian Solusi
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Apa yang Bisa Saya Bangun untuk Anda
        </h2>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
          Kombinasi keahlian teknis dan standar industri modern untuk menghadirkan produk digital yang bernilai tinggi.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {visibleServices.map((srv, idx) => {
          const IconComp = ICON_MAP[srv.icon] || Layout;
          return (
            <div
              key={srv.id || idx}
              className={`p-6 sm:p-7 ${cardRadiusClass} bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700/80 transition-all shadow-sm group`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${accent.bgSubtle} ${accent.text} shrink-0 group-hover:scale-105 transition-transform`}>
                  <IconComp className="w-5 h-5" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    {srv.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {srv.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {services.length > INITIAL_SERVICES && (
        <div className="pt-6 text-center">
          <button
            onClick={() => setShowAllServices(!showAllServices)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-all shadow-sm active:scale-95"
          >
            <span>
              {showAllServices
                ? "Tampilkan Lebih Sedikit"
                : `Lihat Semua Layanan (${services.length})`}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                showAllServices ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      )}
    </section>
  );
};

export default memo(ServicesSection);
