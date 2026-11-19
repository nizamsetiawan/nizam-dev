import React, { useState, memo } from "react";
import { GraduationCap, Calendar, Award, ChevronDown } from "lucide-react";
import { usePortfolio } from "../context/PortfolioContext";

const EducationSection = () => {
  const { config, accent, containerClass, cardRadiusClass } = usePortfolio();
  const [showAllEdu, setShowAllEdu] = useState(false);

  if (config?.sections?.education === false) return null;

  const education = config?.education || [];
  if (education.length === 0) return null;

  const INITIAL_EDU = 2;
  const visibleEdu = showAllEdu ? education : education.slice(0, INITIAL_EDU);

  return (
    <section id="Education" className={`py-20 px-4 sm:px-6 lg:px-8 ${containerClass} mx-auto border-t border-zinc-200 dark:border-zinc-800/80`}>
      <div className="space-y-2 mb-8">
        <div className={`text-xs font-semibold uppercase tracking-wider ${accent.text}`}>
          Latar Belakang Akademik
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Pendidikan & Pelatihan Formal
        </h2>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
          Fondasi ilmu komputer, arsitektur sistem, dan penalaran teknis yang teruji.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {visibleEdu.map((edu, idx) => (
          <div
            key={edu.id || idx}
            className={`p-6 ${cardRadiusClass} bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700/80 transition-all shadow-sm space-y-3`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${accent.bgSubtle} ${accent.text}`}>
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    {edu.degree}
                  </h3>
                  <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    {edu.institution}
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-zinc-500 bg-zinc-100 dark:bg-zinc-800/80 px-2.5 py-1 rounded-md shrink-0">
                {edu.period}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {edu.description}
            </p>

            {edu.grade && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200 pt-1">
                <Award className={`w-3.5 h-3.5 ${accent.text}`} />
                <span>{edu.grade}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {education.length > INITIAL_EDU && (
        <div className="pt-6 text-center">
          <button
            onClick={() => setShowAllEdu(!showAllEdu)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-all shadow-sm active:scale-95"
          >
            <span>
              {showAllEdu
                ? "Tampilkan Lebih Sedikit"
                : `Lihat Semua Pendidikan (${education.length})`}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                showAllEdu ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      )}
    </section>
  );
};

export default memo(EducationSection);
