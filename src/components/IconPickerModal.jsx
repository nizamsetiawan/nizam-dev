import React, { useState } from "react";
import { usePortfolio } from "../context/PortfolioContext";
import {
  X,
  Search,
  Layout,
  Database,
  Cloud,
  Zap,
  Layers,
  Cpu,
  Globe,
  Code2,
  Terminal,
  Server,
  Shield,
  Smartphone,
  Monitor,
  Award,
  Star,
  Compass,
  GitBranch,
  Package,
  Box,
  Key,
  Lock,
  Workflow,
  Share2,
  Github,
  Linkedin,
  Twitter,
  Instagram,
  Mail,
  MessageSquare,
  Send,
  CheckCircle2,
  HelpCircle,
  GraduationCap,
  Briefcase,
  Palette,
  Sparkles,
} from "lucide-react";

export const AVAILABLE_ICONS = {
  Layout,
  Database,
  Cloud,
  Zap,
  Layers,
  Cpu,
  Globe,
  Code2,
  Terminal,
  Server,
  Shield,
  Smartphone,
  Monitor,
  Award,
  Star,
  Compass,
  GitBranch,
  Package,
  Box,
  Key,
  Lock,
  Workflow,
  Share2,
  Github,
  Linkedin,
  Twitter,
  Instagram,
  Mail,
  MessageSquare,
  Send,
  CheckCircle2,
  HelpCircle,
  GraduationCap,
  Briefcase,
  Palette,
  Sparkles,
};

export default function IconPickerModal({ isOpen, onClose, selectedIcon, onSelectIcon }) {
  const { accent } = usePortfolio();
  const [search, setSearch] = useState("");

  if (!isOpen) return null;

  const iconKeys = Object.keys(AVAILABLE_ICONS).filter((name) =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Pilih Ikon Visual
            </h3>
            <p className="text-[11px] text-zinc-500">
              Pilih ikon yang paling sesuai untuk merepresentasikan item Anda.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/80">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama ikon (cth. Database, Cloud, Github)..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 outline-none focus:border-zinc-400 dark:focus:border-zinc-500"
            />
          </div>
        </div>

        {/* Icons Grid */}
        <div className="p-4 overflow-y-auto grid grid-cols-4 sm:grid-cols-6 gap-2.5">
          {iconKeys.map((name) => {
            const IconComp = AVAILABLE_ICONS[name];
            const isSelected = selectedIcon === name;
            return (
              <button
                key={name}
                type="button"
                onClick={() => {
                  onSelectIcon(name);
                  onClose();
                }}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center group ${
                  isSelected
                    ? `${accent.bgSubtle} ${accent.border} ${accent.text} font-bold ring-2 ${accent.ring}`
                    : "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-600 hover:text-black dark:hover:text-white"
                }`}
                title={name}
              >
                <IconComp className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] truncate max-w-full font-mono">
                  {name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center text-xs text-zinc-500 bg-zinc-50 dark:bg-zinc-950/40">
          <span>Ikon terpilih: <strong className="text-zinc-900 dark:text-zinc-100 font-mono">{selectedIcon || "None"}</strong></span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
