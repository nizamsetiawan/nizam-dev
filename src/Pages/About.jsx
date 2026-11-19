import React, { useState, memo } from "react";
import { Code2, Cpu, Layers, ChevronDown } from "lucide-react";
import { usePortfolio } from "../context/PortfolioContext";

// ── Skill tag color palettes (10 colors, cycling by index) ──
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
  const base = "px-2.5 py-0.5 text-[11px] font-semibold rounded-md transition-colors";
  const i = idx % 10;
  if (style === "colorful") return `${base} ${TAG_COLORS_FILL[i]}`;
  if (style === "outline")  return `${base} ${TAG_COLORS_OUTLINE[i]}`;
  return `${base} ${TAG_MONO}`;
};

const SkillTagList = ({ skills, tagStyle = "colorful" }) => (
  <div className="flex flex-wrap gap-1.5 pt-2">
    {skills.map((s, i) => (
      <span key={s} className={getTagClass(tagStyle, i)}>
        {s}
      </span>
    ))}
  </div>
);

const PRINCIPLE_ICONS = [Code2, Cpu, Layers];

const ExperienceItem = ({ role, company, period, location, description, skills, accent, tagStyle }) => (
  <div className="relative pl-6 sm:pl-8 pb-8 last:pb-0 group">
    {/* Timeline marker */}
    <div className={`absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full ${accent.dot} transition-colors ring-4 ring-[#fafafa] dark:ring-[#09090b]`}></div>
    <div className="absolute left-[4px] top-4 bottom-0 w-px bg-zinc-200 dark:bg-zinc-800 group-last:hidden"></div>

    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">{role}</h3>
          <div className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">{company}</div>
        </div>
        <div className="text-xs text-zinc-500 font-mono sm:text-right">
          <div>{period}</div>
          <div className="text-[11px] text-zinc-400 dark:text-zinc-600">{location}</div>
        </div>
      </div>

      <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed pt-1">
        {description}
      </p>

      {skills && skills.length > 0 && (
        <SkillTagList skills={skills} tagStyle={tagStyle} />
      )}
    </div>
  </div>
);

const About = () => {
  const { config, accent, containerClass, cardRadiusClass } = usePortfolio();

  const sections = config?.sections || {};
  const elements = config?.elements || {};

  // If both about section and experience are disabled, return null
  if (sections.about === false && sections.experiences === false) {
    return null;
  }

  const profile = config?.profile || {};
  const about = config?.about || {};
  const experiences = config?.experiences || [];
  const principles   = config?.principles  || [];
  const skillTagStyle = config?.appearance?.skillTagStyle ?? "colorful";

  const [showAllExp, setShowAllExp] = useState(false);
  const INITIAL_EXP = 3;
  const visibleExperiences = showAllExp ? experiences : experiences.slice(0, INITIAL_EXP);

  return (
    <section id="About" className={`py-20 px-4 sm:px-6 lg:px-8 ${containerClass} mx-auto space-y-20 border-t border-zinc-200 dark:border-zinc-800/80`}>
      {/* SECTION 1: BIO & SUMMARY (Rendered if sections.about is true) */}
      {sections.about !== false && (
        <div>
          <div className="space-y-2 mb-8">
            <div className={`text-xs font-semibold uppercase tracking-wider ${accent.text}`}>
              {about.tag || "Latar Belakang"}
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              {about.title || "Tentang Saya"}
            </h2>
            {about.description && (
              <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
                {about.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Photo / Profile Card (Toggleable) */}
            {elements.aboutPhoto !== false ? (
              <>
                <div className="md:col-span-4 flex flex-col items-center sm:items-start gap-4">
                  <div className={`relative w-48 h-48 sm:w-56 sm:h-56 ${cardRadiusClass} overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-md`}>
                    <img
                      src={profile.photoUrl || "/Photo.jpeg"}
                      alt={profile.name || "Foto Profil"}
                      className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                  
                  {elements.aboutInfoCard !== false && (
                    <div className={`w-full space-y-2 text-xs text-zinc-600 dark:text-zinc-400 p-4 ${cardRadiusClass} bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 shadow-sm`}>
                      <div className="flex items-center justify-between py-1 border-b border-zinc-100 dark:border-zinc-800/60">
                        <span className="text-zinc-500">Lokasi</span>
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">{profile.location || "Indonesia"}</span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-zinc-100 dark:border-zinc-800/60">
                        <span className="text-zinc-500">Spesialisasi</span>
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">{profile.role || "Frontend / Full-stack"}</span>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <span className="text-zinc-500">Ketersediaan</span>
                        <span className={`font-semibold ${accent.text}`}>
                          {profile.isAvailable !== false ? (profile.availabilityLabel || "Tersedia Segera") : "Sedang Penuh"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Narrative Paragraphs */}
                <div className="md:col-span-8 space-y-4 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  <p>{about.paragraph1}</p>
                  <p>{about.paragraph2}</p>
                  {about.paragraph3 && <p>{about.paragraph3}</p>}
                </div>
              </>
            ) : (
              /* Full-width narrative when photo is hidden */
              <div className="md:col-span-12 space-y-4 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-4xl">
                <p>{about.paragraph1}</p>
                <p>{about.paragraph2}</p>
                {about.paragraph3 && <p>{about.paragraph3}</p>}
              </div>
            )}
          </div>

          {/* Principles / Engineering Pillars (Toggleable) */}
          {elements.aboutPrinciples !== false && principles && principles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-10">
              {principles.map((pillar, idx) => {
                const IconComponent = PRINCIPLE_ICONS[idx % PRINCIPLE_ICONS.length];
                return (
                  <div
                    key={idx}
                    className={`p-5 sm:p-6 ${cardRadiusClass} bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700/80 transition-colors space-y-3 shadow-sm`}
                  >
                    <div className={`w-9 h-9 rounded-xl ${accent.bgSubtle} flex items-center justify-center ${accent.text}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{pillar.title}</h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{pillar.text}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: EXPERIENCES / TIMELINE (Rendered if sections.experiences is true) */}
      {sections.experiences !== false && experiences && experiences.length > 0 && (
        <div id="Experience" className="space-y-8 pt-4">
          <div className="space-y-2 mb-8">
            <div className={`text-xs font-semibold uppercase tracking-wider ${accent.text}`}>
              Linimasa Karir
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              Pengalaman Kerja & Kontribusi
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
              Jejak langkah profesional dalam merancang dan mengembangkan solusi rekayasa web skala produksi.
            </p>
          </div>

          <div className="space-y-2">
            {visibleExperiences.map((exp) => (
              <ExperienceItem
                key={exp.id}
                role={exp.role}
                company={exp.company}
                period={exp.period}
                location={exp.location}
                description={exp.description}
                skills={exp.skills}
                accent={accent}
                tagStyle={skillTagStyle}
              />
            ))}
          </div>

          {experiences.length > INITIAL_EXP && (
            <div className="pt-4 pl-6 sm:pl-8">
              <button
                onClick={() => setShowAllExp(!showAllExp)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700/80 border border-zinc-200 dark:border-zinc-700/80 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-all shadow-sm active:scale-95"
              >
                <span>
                  {showAllExp
                    ? "Tampilkan Lebih Sedikit"
                    : `Lihat Semua Pengalaman (${experiences.length})`}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    showAllExp ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default memo(About);
