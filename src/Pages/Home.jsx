import React, { memo } from "react";
import { Helmet } from "react-helmet-async";
import { Github, Linkedin, Mail, ArrowDown, FileText, Twitter, Instagram } from "lucide-react";
import { usePortfolio } from "../context/PortfolioContext";

const MetricCard = memo(({ value, label, subtext, cardRadius }) => (
  <div className={`p-4 sm:p-5 ${cardRadius} bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700/80 transition-all shadow-sm`}>
    <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">{value}</div>
    <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 mt-1">{label}</div>
    <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">{subtext}</div>
  </div>
));

const Home = () => {
  const { config, accent, containerClass, cardRadiusClass, buttonRadiusClass } = usePortfolio();

  // If hero section is hidden, don't render it
  if (config?.sections?.hero === false) return null;

  const profile = config?.profile || {};
  const hero = config?.hero || {};
  const metrics = config?.metrics || [];
  const socials = config?.socials || {};
  const elements = config?.elements || {};

  // Collect unique skills for pills (only rendered if elements.heroTechPills is enabled)
  const allSkills = config?.skillsCategories
    ? Array.from(new Set(config.skillsCategories.flatMap((c) => c.skills))).slice(0, 8)
    : ["React", "TypeScript", "Tailwind CSS", "Supabase", "Node.js", "Vite", "PostgreSQL", "Git"];

  const scrollTo = (id) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <Helmet>
        <title>{`${profile.name || "Nizam Setiawan"} — ${profile.role || "Software Engineer"}`}</title>
        <meta
          name="description"
          content={hero.bio || "Personal portfolio showcasing modern web engineering."}
        />
      </Helmet>

      <section
        id="Home"
        className={`min-h-[88vh] flex flex-col justify-center pt-28 pb-16 px-4 sm:px-6 lg:px-8 ${containerClass} mx-auto`}
      >
        <div className="space-y-6">
          {/* Status Badge (Toggleable) */}
          {elements.heroStatusBadge !== false && (
            <div>
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium shadow-sm backdrop-blur-sm ${
                  profile.isAvailable !== false
                    ? `${accent.badge} bg-white/70 dark:bg-zinc-900/80`
                    : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800"
                }`}
              >
                <span className="relative flex h-2 w-2">
                  {profile.isAvailable !== false && (
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${accent.ping} opacity-75`}></span>
                  )}
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${profile.isAvailable !== false ? accent.dot : "bg-zinc-400"}`}></span>
                </span>
                <span>{profile.statusText || "Tersedia untuk Pekerjaan"}</span>
              </div>
            </div>
          )}

          {/* Main Title & Headline */}
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-[1.08]">
              {hero.headlinePrefix || "Membangun aplikasi web yang bersih, cepat, dan"}{" "}
              <span className={`${accent.text} underline decoration-zinc-300 dark:decoration-zinc-700 decoration-2 underline-offset-8`}>
                {hero.headlineAccent || "berdampak tinggi"}
              </span>{" "}
              {hero.headlineSuffix || "dengan arsitektur modern."}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed pt-2">
              Halo, saya <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">{profile.name || "Nizam Setiawan"}</strong> — {hero.bio || "seorang rekayasawan web dengan fokus pada performa dan arsitektur modern."}
            </p>
          </div>

          {/* Action CTAs & Socials */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => scrollTo("#Portofolio")}
              className={`inline-flex items-center gap-2 px-6 py-3 ${buttonRadiusClass} bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-semibold text-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-sm active:scale-95`}
            >
              <span>{hero.primaryCtaText || "Jelajahi Proyek"}</span>
              <ArrowDown className="w-4 h-4" />
            </button>

            {/* Resume Button (Toggleable) */}
            {elements.heroResumeBtn !== false && profile.resumeUrl && (
              <a
                href={profile.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 px-5 py-3 ${buttonRadiusClass} bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 font-semibold text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all shadow-sm active:scale-95`}
              >
                <FileText className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                <span>Resume / CV</span>
              </a>
            )}

            {/* Contact CTA Button (Toggleable) */}
            {elements.heroContactBtn !== false && (
              <a
                href="#Contact"
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo("#Contact");
                }}
                className={`inline-flex items-center gap-2 px-5 py-3 ${buttonRadiusClass} bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-sm hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white transition-all active:scale-95 shadow-sm`}
              >
                <Mail className="w-4 h-4" />
                <span>{hero.secondaryCtaText || "Hubungi Saya"}</span>
              </a>
            )}

            <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block mx-1"></div>

            {/* Direct Quick Social Links */}
            <div className="flex items-center gap-1.5">
              {socials.github && (
                <a
                  href={socials.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Profil GitHub"
                  className={`p-3 ${buttonRadiusClass} bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shadow-sm`}
                >
                  <Github className="w-4 h-4" />
                </a>
              )}
              {socials.linkedin && (
                <a
                  href={socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Profil LinkedIn"
                  className={`p-3 ${buttonRadiusClass} bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shadow-sm`}
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {socials.twitter && (
                <a
                  href={socials.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Profil Twitter"
                  className={`p-3 ${buttonRadiusClass} bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shadow-sm`}
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Optional Tech Stack Pills (Disabled by default to avoid duplicate repetition with Skills Section) */}
          {elements.heroTechPills === true && (
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800/80">
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">
                Teknologi Utama
              </div>
              <div className="flex flex-wrap gap-2">
                {allSkills.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 text-xs font-medium rounded-lg bg-zinc-100 dark:bg-zinc-900/70 text-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Metrics Grid (Toggleable) */}
          {elements.heroMetrics !== false && metrics && metrics.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-6">
              {metrics.map((m, idx) => (
                <MetricCard
                  key={idx}
                  value={m.value}
                  label={m.label}
                  subtext={m.subtext}
                  cardRadius={cardRadiusClass}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default memo(Home);
