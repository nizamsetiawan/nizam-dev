import React, { useState, memo } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { usePortfolio } from "../context/PortfolioContext";

const FaqSection = () => {
  const { config, accent, containerClass, cardRadiusClass } = usePortfolio();
  const [openIdx, setOpenIdx] = useState(0); // first open by default
  const [showAllFaq, setShowAllFaq] = useState(false);

  if (config?.sections?.faq === false) return null;

  const faqs = config?.faq || [];
  if (faqs.length === 0) return null;

  const INITIAL_FAQS = 4;
  const visibleFaqs = showAllFaq ? faqs : faqs.slice(0, INITIAL_FAQS);

  return (
    <section id="FAQ" className={`py-20 px-4 sm:px-6 lg:px-8 ${containerClass} mx-auto border-t border-zinc-200 dark:border-zinc-800/80`}>
      <div className="space-y-2 mb-8">
        <div className={`text-xs font-semibold uppercase tracking-wider ${accent.text}`}>
          Tanya Jawab Umum
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Pertanyaan yang Sering Diajukan (FAQ)
        </h2>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
          Klarifikasi cepat seputar ketersediaan kerja, alur kolaborasi, dan kapabilitas teknologi saya.
        </p>
      </div>

      <div className="space-y-3 max-w-4xl">
        {visibleFaqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={faq.id || idx}
              className={`border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 ${cardRadiusClass} overflow-hidden transition-all shadow-sm`}
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 hover:text-black dark:hover:text-white transition-colors"
              >
                <div className="flex items-center gap-3">
                  <HelpCircle className={`w-4 h-4 ${accent.text} shrink-0`} />
                  <span>{faq.question}</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180 text-zinc-900 dark:text-zinc-100" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/60">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}

        {faqs.length > INITIAL_FAQS && (
          <div className="pt-4 text-center">
            <button
              onClick={() => setShowAllFaq(!showAllFaq)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-all shadow-sm active:scale-95"
            >
              <span>
                {showAllFaq
                  ? "Tampilkan Lebih Sedikit"
                  : `Lihat Semua Pertanyaan (${faqs.length})`}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  showAllFaq ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default memo(FaqSection);
