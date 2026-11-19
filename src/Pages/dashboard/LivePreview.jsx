import React, { useState, useRef } from "react";
import { Monitor, Tablet, Smartphone, ExternalLink, RefreshCw, ZoomIn, ZoomOut, Eye } from "lucide-react";

export default function LivePreview() {
  const [device, setDevice] = useState("desktop"); // desktop | tablet | mobile
  const [scale, setScale] = useState(1);
  const iframeRef = useRef(null);

  const handleRefresh = () => {
    if (iframeRef.current) {
      iframeRef.current.src = "/";
    }
  };

  const getDeviceWidth = () => {
    switch (device) {
      case "mobile":
        return "390px";
      case "tablet":
        return "768px";
      case "desktop":
      default:
        return "100%";
    }
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Top Controls Toolbar */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Pratinjau Langsung (Live Preview)
            </h1>
            <p className="text-[11px] text-zinc-500 hidden sm:block">
              Lihat tampilan situs portofolio Anda secara real-time di berbagai ukuran perangkat.
            </p>
          </div>
        </div>

        {/* Device Switcher Pills */}
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700">
          <button
            onClick={() => setDevice("desktop")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              device === "desktop"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm"
                : "text-zinc-500 hover:text-black dark:hover:text-white"
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Desktop</span>
          </button>
          <button
            onClick={() => setDevice("tablet")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              device === "tablet"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm"
                : "text-zinc-500 hover:text-black dark:hover:text-white"
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tablet</span>
          </button>
          <button
            onClick={() => setDevice("mobile")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              device === "mobile"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm"
                : "text-zinc-500 hover:text-black dark:hover:text-white"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ponsel</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleRefresh}
            className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white border border-zinc-200 dark:border-zinc-700 transition-colors"
            title="Muat Ulang Pratinjau"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm"
          >
            <span>Buka di Tab Baru</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Frame Container */}
      <div className="flex-1 min-h-[550px] rounded-2xl bg-zinc-200/50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 p-2 sm:p-4 flex items-center justify-center overflow-auto shadow-inner">
        <div
          className={`h-full bg-white dark:bg-[#09090b] rounded-2xl shadow-2xl overflow-hidden border border-zinc-300 dark:border-zinc-700 transition-all duration-300 flex flex-col ${
            device !== "desktop" ? "my-auto" : "w-full"
          }`}
          style={{
            width: getDeviceWidth(),
            maxWidth: "100%",
            height: device === "desktop" ? "100%" : device === "tablet" ? "92%" : "88%",
            minHeight: device === "mobile" ? "680px" : "auto",
          }}
        >
          {/* Mock Browser Header for Tablet & Mobile */}
          {device !== "desktop" && (
            <div className="h-7 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center px-3 justify-between shrink-0">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-400"></div>
                <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
              </div>
              <span className="text-[10px] text-zinc-400 font-mono">localhost:5173</span>
              <div className="w-6"></div>
            </div>
          )}

          {/* Embedded Iframe */}
          <iframe
            ref={iframeRef}
            src="/"
            title="Pratinjau Portofolio"
            className="w-full flex-1 border-none bg-white dark:bg-[#09090b]"
          />
        </div>
      </div>
    </div>
  );
}
