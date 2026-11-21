import React from "react";
import { Search, X, LayoutGrid, LayoutList, Download, Upload, Plus } from "lucide-react";
import { usePortfolio } from "../../context/PortfolioContext";

export default function AdminDataToolbar({
  searchTerm = "",
  setSearchTerm,
  searchPlaceholder = "Cari data...",
  totalCount = 0,
  filteredCount = 0,
  viewMode = "table",
  setViewMode,
  onAddNew,
  addLabel = "Tambah Data",
  onDownloadExcel,
  onUploadExcel,
  pageSize = 10,
  setPageSize,
  pageSizeOptions = [5, 10, 25, 50],
  customActions = null,
}) {
  const { accent, buttonRadiusClass } = usePortfolio();

  return (
    <div className="flex flex-col gap-3">
      {/* Top Controls Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors shadow-xs"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-0.5"
              title="Reset pencarian"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Custom actions slot if any */}
          {customActions}

          {/* Download Excel (Icon Only) */}
          {onDownloadExcel && (
            <button
              onClick={onDownloadExcel}
              className={`p-2 ${buttonRadiusClass} bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold ${accent?.text || "text-emerald-500"} hover:opacity-80 transition-all shadow-xs`}
              title="Ekspor Data ke Berkas Excel (.xls)"
              aria-label="Ekspor Excel"
            >
              <Download className="w-4 h-4" />
            </button>
          )}

          {/* Import Excel (Icon Only) */}
          {onUploadExcel && (
            <label
              className={`p-2 ${buttonRadiusClass} bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white cursor-pointer transition-all shadow-xs`}
              title="Impor Data dari Berkas Excel (.xls, .xlsx)"
              aria-label="Impor Excel"
            >
              <Upload className="w-4 h-4" />
              <input
                type="file"
                accept=".xls, .xlsx, .csv"
                onChange={onUploadExcel}
                className="hidden"
              />
            </label>
          )}

          {/* Add New Data Button */}
          {onAddNew && (
            <button
              onClick={onAddNew}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 ${buttonRadiusClass} ${accent?.bg || "bg-emerald-600"} text-white font-semibold text-xs hover:opacity-90 transition-all shadow-sm active:scale-95`}
            >
              <Plus className="w-4 h-4" />
              <span>{addLabel}</span>
            </button>
          )}
        </div>
      </div>

      {/* Secondary Bar: Count summary, View Mode Toggle, and Page Size */}
      <div className="flex items-center justify-between gap-3 text-xs text-zinc-500 border-t border-zinc-100 dark:border-zinc-800/80 pt-2.5">
        <div className="flex items-center gap-2">
          <span>
            {searchTerm ? (
              <>
                Ditemukan <strong className="text-zinc-900 dark:text-zinc-200">{filteredCount}</strong> dari {totalCount} data
              </>
            ) : (
              <>
                Total <strong className="text-zinc-900 dark:text-zinc-200">{totalCount}</strong> data
              </>
            )}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Page Size Selector */}
          {setPageSize && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs">
              <span className="text-zinc-400">Tampilkan:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="px-2 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs outline-none cursor-pointer"
              >
                {pageSizeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt} baris
                  </option>
                ))}
                <option value={9999}>Semua</option>
              </select>
            </div>
          )}

          {/* View Mode Switcher (Grid vs Table) */}
          {setViewMode && (
            <div className="inline-flex items-center p-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === "table"
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs"
                    : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                }`}
                title="Tampilan Tabel (Cocok untuk data banyak)"
              >
                <LayoutList className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs"
                    : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                }`}
                title="Tampilan Kartu (Grid)"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
