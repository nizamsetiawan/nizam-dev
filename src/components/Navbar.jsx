import React, { useState, useEffect } from "react";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { usePortfolio } from "../context/PortfolioContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("Home");
  const { theme, toggleTheme } = useTheme();
  const { config, accent, containerClass } = usePortfolio();

  const profile = config?.profile || {};
  const sections = config?.sections || {};

  // Build dynamic navigation items based on visible sections
  const navItems = [
    sections.hero !== false && { href: "#Home", label: "Ringkasan" },
    sections.about !== false && { href: "#About", label: "Tentang" },
    sections.experiences !== false && { href: "#Experience", label: "Pengalaman" },
    sections.services !== false && { href: "#Services", label: "Layanan" },
    sections.projects !== false && { href: "#Portofolio", label: "Proyek" },
    sections.skills !== false && { href: "#Skills", label: "Keahlian" },
    sections.education !== false && { href: "#Education", label: "Pendidikan" },
    sections.socialHub !== false && { href: "#Socials", label: "Sosial" },
    sections.faq !== false && { href: "#FAQ", label: "FAQ" },
    (sections.contact !== false || sections.guestbook !== false) && { href: "#Contact", label: "Kontak" },
  ].filter(Boolean);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const sectionElements = navItems.map((item) => {
        const el = document.querySelector(item.href);
        if (el) {
          return {
            id: item.href.replace("#", ""),
            top: el.offsetTop - 200,
            bottom: el.offsetTop + el.offsetHeight - 200,
          };
        }
        return null;
      }).filter(Boolean);

      const currentPos = window.scrollY;
      const found = sectionElements.find((s) => currentPos >= s.top && currentPos < s.bottom);
      if (found) {
        setActiveSection(found.id);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [navItems]);

  const scrollToSection = (e, href) => {
    e.preventDefault();
    setIsOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
      <nav
        className={`w-full ${containerClass} transition-all duration-300 rounded-2xl border ${
          scrolled
            ? "bg-white/85 dark:bg-zinc-950/85 backdrop-blur-md border-zinc-200/90 dark:border-zinc-800/80 shadow-md shadow-zinc-200/50 dark:shadow-black/50 px-4 sm:px-6 py-2.5"
            : "bg-white/50 dark:bg-zinc-950/40 backdrop-blur-sm border-zinc-200/60 dark:border-zinc-800/40 px-4 sm:px-6 py-3"
        } flex items-center justify-between`}
      >
        {/* Brand / Status */}
        <a
          href="#Home"
          onClick={(e) => scrollToSection(e, "#Home")}
          className="flex items-center gap-3 group"
        >
          <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 flex items-center justify-center font-bold text-xs text-zinc-900 dark:text-zinc-100 group-hover:border-zinc-400 dark:group-hover:border-zinc-700 transition-colors shadow-sm">
            {profile.initials || "EZ"}
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-black dark:group-hover:text-white transition-colors">
              {profile.name || "Eki Zulfar Rachman"}
            </span>
            {profile.isAvailable !== false ? (
              <span className={`text-[10px] ${accent.text} flex items-center gap-1.5 font-medium`}>
                <span className={`w-1.5 h-1.5 rounded-full ${accent.dot} animate-pulse`}></span>
                Tersedia untuk bekerja
              </span>
            ) : (
              <span className="text-[10px] text-zinc-400 flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
                Sedang tidak tersedia
              </span>
            )}
          </div>
        </a>

        {/* Desktop Dynamic Navigation Links */}
        <div className="hidden md:flex items-center gap-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">
          {navItems.map((item) => {
            const isActive = activeSection === item.href.replace("#", "");
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => scrollToSection(e, item.href)}
                className={`px-3 py-1.5 rounded-lg transition-all duration-150 ${
                  isActive
                    ? "text-zinc-950 dark:text-white font-semibold bg-zinc-200/60 dark:bg-zinc-800/80 shadow-xs"
                    : "hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/60"
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </div>

        {/* Right Actions: Dark/Light Mode & Mobile Hamburger (No duplicate CV button) */}
        <div className="flex items-center gap-2">
          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            aria-label="Ubah Tema"
            className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors shadow-sm"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400 transition-transform rotate-0 hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-zinc-700 transition-transform rotate-0 hover:-rotate-12" />
            )}
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Buka Menu"
            className="md:hidden p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors"
          >
            {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Dropdown */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-4 right-4 mt-2 p-4 rounded-2xl bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-1">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => scrollToSection(e, item.href)}
              className="block px-3 py-2 text-sm font-medium rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white transition-colors"
            >
              {item.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
};

export default Navbar;
