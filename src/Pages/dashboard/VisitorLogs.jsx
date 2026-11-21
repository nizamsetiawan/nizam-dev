import React, { useState, useEffect, useMemo } from "react";
import {
  Activity,
  RefreshCw,
  Trash2,
  Download,
  Search,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Clock,
  Compass,
  MapPin,
  ShieldCheck,
  Filter,
} from "lucide-react";
import { getVisitorLogs, clearVisitorLogs } from "../../utils/visitorTracker";
import { usePortfolio } from "../../context/PortfolioContext";
import Swal from "sweetalert2";

export default function VisitorLogs() {
  const { accent } = usePortfolio();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deviceFilter, setDeviceFilter] = useState("all");

  const loadLogs = async () => {
    setLoading(true);
    const data = await getVisitorLogs();
    setLogs(data);
    setLoading(false);
  };

  useEffect(() => {
    loadLogs();

    const handleUpdate = () => {
      loadLogs();
    };

    window.addEventListener("visitorLogsUpdated", handleUpdate);
    return () => window.removeEventListener("visitorLogsUpdated", handleUpdate);
  }, []);

  const handleClearLogs = () => {
    Swal.fire({
      title: "Bersihkan Semua Log Pengunjung?",
      text: "Riwayat log akses pengunjung akan dihapus secara permanen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#71717a",
      confirmButtonText: "Ya, Hapus Semua",
      cancelButtonText: "Batal",
    }).then(async (res) => {
      if (res.isConfirmed) {
        await clearVisitorLogs();
        setLogs([]);
        Swal.fire({
          title: "Log Berhasil Dihapus",
          icon: "success",
          confirmButtonColor: "#10b981",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  const handleExportCSV = () => {
    if (logs.length === 0) return;

    const headers = ["ID", "Waktu", "IP Address", "Lokasi", "Perangkat", "OS", "Browser", "Resolusi", "Halaman", "Referrer"];
    const rows = logs.map((l) => [
      l.id,
      `"${new Date(l.timestamp).toLocaleString("id-ID")}"`,
      `"${l.ip}"`,
      `"${l.location}"`,
      `"${l.device}"`,
      `"${l.os}"`,
      `"${l.browser}"`,
      `"${l.screen}"`,
      `"${l.path}"`,
      `"${l.referrer}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `visitor-logs-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((item) => {
      const matchDevice =
        deviceFilter === "all" ||
        (deviceFilter === "desktop" && item.device.toLowerCase().includes("desktop")) ||
        (deviceFilter === "mobile" && item.device.toLowerCase().includes("ponsel")) ||
        (deviceFilter === "tablet" && item.device.toLowerCase().includes("tablet"));

      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        item.ip?.toLowerCase().includes(q) ||
        item.location?.toLowerCase().includes(q) ||
        item.browser?.toLowerCase().includes(q) ||
        item.os?.toLowerCase().includes(q) ||
        item.path?.toLowerCase().includes(q) ||
        item.referrer?.toLowerCase().includes(q);

      return matchDevice && matchSearch;
    });
  }, [logs, deviceFilter, search]);

  // Analytics aggregates
  const uniqueIps = useMemo(() => new Set(logs.map((l) => l.ip)).size, [logs]);
  const desktopCount = useMemo(() => logs.filter((l) => l.device.toLowerCase().includes("desktop")).length, [logs]);
  const mobileCount = useMemo(() => logs.filter((l) => l.device.toLowerCase().includes("ponsel")).length, [logs]);

  const topLocation = useMemo(() => {
    if (logs.length === 0) return "-";
    const counts = {};
    logs.forEach((l) => {
      counts[l.location] = (counts[l.location] || 0) + 1;
    });
    return Object.keys(counts).reduce((a, b) => (counts[a] > counts[b] ? a : b));
  }, [logs]);

  const getDeviceIcon = (deviceStr) => {
    if (deviceStr.toLowerCase().includes("ponsel")) return <Smartphone className="w-3.5 h-3.5 text-blue-500" />;
    if (deviceStr.toLowerCase().includes("tablet")) return <Tablet className="w-3.5 h-3.5 text-amber-500" />;
    return <Monitor className="w-3.5 h-3.5 text-emerald-500" />;
  };

  return (
    <div className="space-y-8 w-full pb-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${accent.bgSubtle} ${accent.text}`}>
              <Activity className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Log & Riwayat Akses Pengunjung
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Pantau jejak pengunjung publik yang membuka portofolio Anda secara real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={loadLogs}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-all shadow-sm"
            title="Segarkan Log"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Segarkan</span>
          </button>

          {logs.length > 0 && (
            <>
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-all shadow-sm"
                title="Unduh format CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Ekspor CSV</span>
              </button>

              <button
                onClick={handleClearLogs}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-xs font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-all shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Bersihkan Log</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-1">
          <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
            Total Kunjungan
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
            {logs.length}
          </div>
          <div className="text-[11px] text-zinc-400">Total hit tercatat</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-1">
          <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
            Pengunjung Unik
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {uniqueIps}
          </div>
          <div className="text-[11px] text-zinc-400">Berdasarkan alamat IP</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-1">
          <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
            Komposisi Perangkat
          </div>
          <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 pt-1">
            <span>🖥️ {desktopCount} Desktop</span>
            <span>•</span>
            <span>📱 {mobileCount} Ponsel</span>
          </div>
          <div className="text-[11px] text-zinc-400">Resolusi beragam</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-1">
          <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
            Lokasi Dominan
          </div>
          <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate pt-1">
            {topLocation}
          </div>
          <div className="text-[11px] text-zinc-400">Perkiraan geolokasi</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Device Pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {[
            { id: "all", label: "Semua" },
            { id: "desktop", label: "Desktop" },
            { id: "mobile", label: "Ponsel" },
            { id: "tablet", label: "Tablet" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setDeviceFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                deviceFilter === tab.id
                  ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari IP, lokasi, browser, path..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Log Entries Table / List */}
      {loading ? (
        <div className="text-center py-16 text-sm text-zinc-500">
          Memuat riwayat log pengunjung...
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-zinc-900/40 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
          <Activity className="w-10 h-10 text-zinc-400 mx-auto opacity-40" />
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Belum Ada Log Pengunjung
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Setiap ada pengunjung yang mengakses halaman publik (Beranda atau Rincian Proyek), log akses otomatis terekam di sini.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLogs.map((log) => {
            const dateObj = new Date(log.timestamp);
            const formattedDate = dateObj.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });
            const formattedTime = dateObj.toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            });

            return (
              <div
                key={log.id}
                className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
              >
                {/* Left Meta: Device, IP, Location */}
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 shrink-0 mt-0.5">
                    {getDeviceIcon(log.device)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold font-mono text-zinc-900 dark:text-zinc-100">
                        {log.ip}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                        {log.device}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                        {log.os}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-zinc-400" />
                        {log.location}
                      </span>
                      <span>•</span>
                      <span>{log.browser}</span>
                      <span>•</span>
                      <span className="font-mono">{log.screen}</span>
                    </div>
                  </div>
                </div>

                {/* Right Meta: Path, Referrer, Timestamp */}
                <div className="flex md:flex-col md:items-end justify-between items-center gap-1 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-zinc-100 dark:border-zinc-800 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 text-[11px] font-mono font-semibold rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      {log.path}
                    </span>
                    <span className="text-[11px] text-zinc-400 hidden sm:inline" title="Rujukan Asal">
                      via {log.referrer}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-mono">
                    <Clock className="w-3 h-3 text-zinc-400" />
                    <span>{formattedDate}, {formattedTime} WIB</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
