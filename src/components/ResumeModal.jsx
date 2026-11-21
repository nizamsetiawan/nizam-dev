import React from "react";
import { X, Download, FileText, ExternalLink } from "lucide-react";
import { usePortfolio } from "../context/PortfolioContext";

export default function ResumeModal({ isOpen, onClose, pdfUrl }) {
  const { accent, buttonRadiusClass } = usePortfolio();

  if (!isOpen || !pdfUrl) return null;

  const fileName = pdfUrl.split("/").pop() || "Resume-CV.pdf";

  return (
    <div
      className="fixed inset-0 z-[999] flex flex-col bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-950/90 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg ${accent.bgSubtle} ${accent.border} border flex items-center justify-center`}>
            <FileText className={`w-4 h-4 ${accent.text}`} />
          </div>
          <div>
            <div className="text-sm font-bold text-white leading-tight">Resume / CV</div>
            <div className="text-[11px] text-zinc-500 font-mono truncate max-w-[200px] sm:max-w-xs">{fileName}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Open in new tab */}
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold transition-all"
            title="Buka di Tab Baru"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tab Baru</span>
          </a>

          {/* Download button */}
          <a
            href={pdfUrl}
            download={fileName}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${buttonRadiusClass} ${accent.bg} text-white text-xs font-bold transition-all hover:opacity-90 shadow-lg`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh PDF</span>
          </a>

          {/* Close button */}
          <button
            onClick={onClose}
            className="ml-1 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* PDF Preview Area */}
      <div className="flex-1 overflow-hidden relative">
        <iframe
          src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1`}
          className="w-full h-full border-0"
          title="Preview Resume / CV"
          loading="lazy"
        />

        {/* Fallback jika iframe tidak bisa render PDF */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-zinc-900/90 opacity-0 hover:opacity-0 pointer-events-none select-none">
          <FileText className="w-12 h-12 text-zinc-600" />
          <p className="text-zinc-400 text-sm">Jika PDF tidak tampil, gunakan tombol &quot;Tab Baru&quot; atau &quot;Unduh PDF&quot; di atas.</p>
        </div>
      </div>

      {/* Bottom hint */}
      <div className="px-4 py-2 bg-zinc-950/90 border-t border-zinc-800 text-center text-[11px] text-zinc-500 shrink-0">
        Klik di luar area untuk menutup • Gunakan tombol unduh untuk menyimpan berkas
      </div>
    </div>
  );
}
