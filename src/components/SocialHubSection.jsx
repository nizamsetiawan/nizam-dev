import React, { memo } from "react";
import {
  Github, Linkedin, Mail, Twitter, Instagram, ExternalLink, Globe,
  Code2, Database, Cloud, Zap, Layers, Cpu, Terminal, Server,
  Shield, Smartphone, Monitor, Award, Star, Compass, GitBranch,
  Package, Box, Key, Lock, Workflow, Share2, MessageSquare, Send,
  CheckCircle2, HelpCircle, GraduationCap, Briefcase, Palette, Sparkles,
} from "lucide-react";
import { usePortfolio } from "../context/PortfolioContext";

const ICON_MAP = {
  Github, Linkedin, Mail, Twitter, Instagram, Globe, Code2,
  Database, Cloud, Zap, Layers, Cpu, Terminal, Server, Shield,
  Smartphone, Monitor, Award, Star, Compass, GitBranch, Package,
  Box, Key, Lock, Workflow, Share2, MessageSquare, Send,
  CheckCircle2, HelpCircle, GraduationCap, Briefcase, Palette, Sparkles,
};

const SocialHubSection = () => {
  const { config, accent, containerClass, cardRadiusClass, buttonRadiusClass } = usePortfolio();

  if (config?.sections?.socialHub === false) return null;

  const links = config?.socialLinksList || [];
  if (links.length === 0) return null;

  return (
    <section id="Socials" className={`py-20 px-4 sm:px-6 lg:px-8 ${containerClass} mx-auto border-t border-zinc-200 dark:border-zinc-800/80`}>
      <div className="space-y-2 mb-8">
        <div className={`text-xs font-semibold uppercase tracking-wider ${accent.text}`}>
          Saluran Komunikasi
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Tautan Sosial & Komunitas
        </h2>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
          Temukan aktivitas pemrograman saya, diskusikan peluang kerja, atau jalin relasi profesional di platform favorit Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {links.map((item, idx) => {
          const IconComp = ICON_MAP[item.icon] || Globe;
          return (
            <a
              key={item.id || idx}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-5 ${cardRadiusClass} bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700/80 transition-all shadow-sm flex flex-col justify-between group`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl ${accent.bgSubtle} ${accent.text} group-hover:scale-110 transition-transform`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
                </div>
                <div>
                  <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    {item.platform}
                  </div>
                  <div className="text-xs font-mono text-zinc-500 mt-0.5">
                    {item.handle}
                  </div>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-4 mt-2 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-xs font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                <span>Kunjungi Profil</span>
                <span>→</span>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
};

export default memo(SocialHubSection);
