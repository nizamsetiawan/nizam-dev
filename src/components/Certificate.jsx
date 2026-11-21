import React, { useState } from "react";
import { ZoomIn, X } from "lucide-react";
import { usePortfolio } from "../context/PortfolioContext";

const Certificate = ({ ImgSertif }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { cardRadiusClass } = usePortfolio();

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        className={`group relative cursor-pointer overflow-hidden ${cardRadiusClass} bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 shadow-sm`}
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-950">
          <img
            src={ImgSertif}
            alt="Certificate credential"
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <span className="p-2.5 rounded-full bg-white/90 dark:bg-zinc-900/90 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 shadow-lg">
              <ZoomIn className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute -top-12 right-0 p-2 text-zinc-400 hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={ImgSertif}
              alt="Certificate full view"
              className="max-h-[85vh] w-auto max-w-full rounded-2xl border border-zinc-800 object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Certificate;
