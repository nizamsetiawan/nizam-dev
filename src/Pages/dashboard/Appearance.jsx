import React from "react";
import { usePortfolio } from "../../context/PortfolioContext";
import { useTheme } from "../../context/ThemeContext";
import { Check, Download, Upload, RotateCcw, Palette, Type, Maximize2, Square, Sparkles, Layers } from "lucide-react";
import Swal from "sweetalert2";

const ACCENT_COLORS = [
  { id: "emerald", name: "Hijau Zamrud (Emerald)", colorCode: "#10b981", desc: "Bersih, modern, presisi tinggi (Rekomendasi Utama)" },
  { id: "blue", name: "Biru Kobalt (Cobalt)", colorCode: "#3b82f6", desc: "Karakter kuat, stabil, nuansa teknologi terpercaya" },
  { id: "violet", name: "Ungu Violet (Violet)", colorCode: "#8b5cf6", desc: "Kreatif, elegan, bernuansa digital modern" },
  { id: "amber", name: "Kuning Amber (Gold)", colorCode: "#f59e0b", desc: "Hangat, berenergi, kontras yang berkelas" },
  { id: "rose", name: "Merah Crimson (Rose)", colorCode: "#f43f5e", desc: "Berani, tajam, bernuansa editorial modern" },
  { id: "zinc", name: "Monokrom Murni (Zinc)", colorCode: "#71717a", desc: "Minimalis absolut, hitam putih elegan" },
];

const FONT_SCALES = [
  { id: "compact", label: "Ringkas (Compact / 93%)", desc: "Ukuran teks lebih padat, ideal untuk tampilan banyak data." },
  { id: "normal", label: "Standar (Normal / 100%)", desc: "Rekomendasi seimbang untuk keterbacaan optimal di semua perangkat." },
  { id: "large", label: "Luas (Spacious / 107%)", desc: "Ukuran teks sedikit lebih besar untuk kemudahan membaca bagi HR/klien." },
];

const CONTAINER_WIDTHS = [
  { id: "5xl", label: "Standar (max-w-5xl / 1024px)", desc: "Tata letak terfokus di tengah dengan margin luas." },
  { id: "6xl", label: "Lebar Modern (max-w-6xl / 1152px)", desc: "Standar 2026 yang proporsional dan elegan (Bawaan)." },
  { id: "7xl", label: "Ekstra Lebar (max-w-7xl / 1280px)", desc: "Tampilan lebih lapang, sangat cocok untuk monitor beresolusi tinggi." },
  { id: "full", label: "Layar Penuh (max-w-[1400px])", desc: "Pemanfaatan ruang horizontal maksimal." },
];

const BORDER_RADII = [
  { id: "none", label: "Tajam (Sharp / 0px)", desc: "Tanpa lengkungan sudut, gaya brutalist atau technical modern." },
  { id: "md", label: "Sederhana (Subtle / 8px)", desc: "Lengkungan sudut halus dan rapi." },
  { id: "xl", label: "Modern (Rounded / 16px)", desc: "Gaya modern standar 2026 yang ramah dan bersih (Bawaan)." },
  { id: "2xl", label: "Penuh (Full Curved / 24px)", desc: "Lengkungan melingkar lembut pada kartu dan tombol." },
];

const BG_STYLES = [
  {
    id: "aurora",
    label: "Spektrum Aurora (Rekomendasi)",
    desc: "Cahaya spektrum aurora mengalir lembut, bernuansa hidup & futuristik.",
    preview: "aurora",
  },
  {
    id: "spectrum",
    label: "Gelombang Spektrum Audio",
    desc: "Sinyal frekuensi audio dan harmonic wave digital berdenyut halus.",
    preview: "spectrum",
  },
  {
    id: "cybergrid",
    label: "Cyber Grid Horizon",
    desc: "Grid digital modern dengan garis horizon bercahaya dan efek scanline.",
    preview: "cybergrid",
  },
  {
    id: "particles",
    label: "Partikel Kosmik (Stars)",
    desc: "Bintang dan titik kosmik bercahaya mengapung di angkasa.",
    preview: "particles",
  },
  {
    id: "dots",
    label: "Titik-titik (Dots)",
    desc: "Pola titik halus seperti kertas desain minimalis modern.",
    preview: "radial",
  },
  {
    id: "grid",
    label: "Kotak Grid (Grid)",
    desc: "Garis grid teknis blueprint digital.",
    preview: "grid",
  },
  {
    id: "cross",
    label: "Silang (Cross)",
    desc: "Pola silang/crosshatch rapat minimalis.",
    preview: "cross",
  },
  {
    id: "wave",
    label: "Gelombang (Wave)",
    desc: "Animasi gelombang SVG mengalir lembut di latar.",
    preview: "wave",
  },
  {
    id: "none",
    label: "Polos (None)",
    desc: "Latar bersih tanpa pola, paling minimalis.",
    preview: "none",
  },
];

const BG_INTENSITIES = [
  { id: "subtle", label: "Sangat Halus", desc: "Hampir tak terlihat, sangat minimalis." },
  { id: "medium", label: "Sedang (Bawaan)", desc: "Visibilitas standar, seimbang dan nyaman." },
  { id: "vivid",  label: "Jelas",           desc: "Pola lebih menonjol, cocok untuk tampilan berani." },
];

const SKILL_TAG_STYLES = [
  {
    id: "colorful",
    label: "Berwarna (Colorful)",
    desc: "Tiap tag ditampilkan dengan warna berbeda — biru, hijau, ungu, amber, dll.",
    samples: [
      "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
      "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
    ],
  },
  {
    id: "outline",
    label: "Garis Tepi (Outline)",
    desc: "Border berwarna, latar transparan, efek highlight elegan.",
    samples: [
      "border border-blue-400 text-blue-600 dark:text-blue-400",
      "border border-emerald-400 text-emerald-600 dark:text-emerald-400",
      "border border-violet-400 text-violet-600 dark:text-violet-400",
    ],
  },
  {
    id: "mono",
    label: "Monokrom (Mono)",
    desc: "Tag seragam hitam/putih minimalis tanpa aksen warna.",
    samples: [
      "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700",
      "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700",
      "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700",
    ],
  },
];

export default function Appearance() {
  const { config, updateConfig, resetToDefaults, accent } = usePortfolio();
  const { theme, toggleTheme } = useTheme();

  const appearance = config?.appearance || {};
  const currentAccent        = appearance.accentColor    || "emerald";
  const currentFontScale     = appearance.fontSizeScale  || "normal";
  const currentWidth         = appearance.containerWidth || "6xl";
  const currentRadius        = appearance.borderRadius   || "xl";
  const currentBgStyle       = appearance.bgStyle        || "dots";
  const currentBgIntensity   = appearance.bgIntensity    || "medium";
  const currentSkillTagStyle = appearance.skillTagStyle  || "colorful";

  const handleUpdateAppearance = (field, value, label) => {
    updateConfig({
      ...config,
      appearance: {
        ...appearance,
        [field]: value,
      },
    });

    Swal.fire({
      title: "Gaya Diperbarui!",
      text: `${label} berhasil diubah dan diterapkan langsung ke tampilan.`,
      icon: "success",
      toast: true,
      position: "top-end",
      timer: 1200,
      showConfirmButton: false,
    });
  };

  const handleReset = () => {
    Swal.fire({
      title: "Kembalikan ke Pengaturan Awal?",
      text: "Tindakan ini akan mengembalikan profil, bio, keahlian, dan warna ke konfigurasi awal.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#71717a",
      confirmButtonText: "Ya, Kembalikan ke Awal",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        resetToDefaults();
        Swal.fire({
          title: "Pengaturan Direset!",
          text: "Semua pengaturan telah kembali ke bawaan awal.",
          icon: "success",
          confirmButtonColor: "#10b981",
        });
      }
    });
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(config, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `portofolio-config-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        updateConfig(parsed);
        Swal.fire({
          title: "Konfigurasi Berhasil Diimpor!",
          text: "Data portofolio telah diperbarui dari file cadangan Anda.",
          icon: "success",
          confirmButtonColor: "#10b981",
        });
      } catch (err) {
        Swal.fire({
          title: "Format File Tidak Valid",
          text: "Harap unggah file JSON konfigurasi yang valid.",
          icon: "error",
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-10 max-w-5xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl ${accent.bgSubtle} ${accent.text}`}>
            <Palette className="w-5 h-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Gaya, Warna & Ukuran Tata Letak
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Sesuaikan skema warna aksen, ukuran font, lebar kontainer, dan lengkungan kartu secara real-time.
        </p>
      </div>

      {/* SECTION 1: ACCENT COLOR */}
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className={`w-4 h-4 ${accent.text}`} />
            Pilihan Warna Aksen Utama
          </h2>
          <p className="text-xs text-zinc-500">
            Dipadukan serasi dengan latar monokrom hitam & putih.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ACCENT_COLORS.map((item) => {
            const isSelected = currentAccent === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleUpdateAppearance("accentColor", item.id, "Warna Aksen")}
                className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 relative ${
                  isSelected
                    ? "bg-white dark:bg-zinc-900 border-zinc-900 dark:border-white shadow-md ring-1 ring-zinc-900/10 dark:ring-white/20"
                    : "bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                <div
                  className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-white shadow-xs"
                  style={{ backgroundColor: item.colorCode }}
                >
                  {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                </div>

                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    {item.name}
                  </div>
                  <div className="text-[11px] text-zinc-500 leading-relaxed">
                    {item.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: FONT SIZE SCALING */}
      <div className="space-y-4 pt-6 border-t border-zinc-200 dark:border-zinc-800/80">
        <div>
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
            <Type className={`w-4 h-4 ${accent.text}`} />
            Skala Ukuran Teks (Typography Scale)
          </h2>
          <p className="text-xs text-zinc-500">
            Menyesuaikan proporsi seluruh teks di seluruh halaman.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {FONT_SCALES.map((scale) => {
            const isSelected = currentFontScale === scale.id;
            return (
              <button
                key={scale.id}
                onClick={() => handleUpdateAppearance("fontSizeScale", scale.id, "Ukuran Teks")}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? "bg-white dark:bg-zinc-900 border-zinc-900 dark:border-white shadow-md"
                    : "bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    {scale.label}
                  </span>
                  {isSelected && <Check className={`w-4 h-4 ${accent.text}`} />}
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed">{scale.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: CONTAINER WIDTH */}
      <div className="space-y-4 pt-6 border-t border-zinc-200 dark:border-zinc-800/80">
        <div>
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
            <Maximize2 className={`w-4 h-4 ${accent.text}`} />
            Lebar Maksimal Kontainer (Container Max-Width)
          </h2>
          <p className="text-xs text-zinc-500">
            Mengatur batas lebar layout konten dari sisi kiri ke kanan.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {CONTAINER_WIDTHS.map((cw) => {
            const isSelected = currentWidth === cw.id;
            return (
              <button
                key={cw.id}
                onClick={() => handleUpdateAppearance("containerWidth", cw.id, "Lebar Kontainer")}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? "bg-white dark:bg-zinc-900 border-zinc-900 dark:border-white shadow-md"
                    : "bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    {cw.label}
                  </span>
                  {isSelected && <Check className={`w-4 h-4 ${accent.text}`} />}
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed">{cw.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 4: BORDER RADIUS */}
      <div className="space-y-4 pt-6 border-t border-zinc-200 dark:border-zinc-800/80">
        <div>
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
            <Square className={`w-4 h-4 ${accent.text}`} />
            Gaya Lengkungan Sudut (Border Radius)
          </h2>
          <p className="text-xs text-zinc-500">
            Tingkat lengkungan sudut pada kartu komponen, badge, dan tombol.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {BORDER_RADII.map((br) => {
            const isSelected = currentRadius === br.id;
            return (
              <button
                key={br.id}
                onClick={() => handleUpdateAppearance("borderRadius", br.id, "Sudut Lengkung")}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? "bg-white dark:bg-zinc-900 border-zinc-900 dark:border-white shadow-md"
                    : "bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    {br.label}
                  </span>
                  {isSelected && <Check className={`w-4 h-4 ${accent.text}`} />}
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed">{br.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 5: BACKGROUND PATTERN */}
      <div className="space-y-6 pt-6 border-t border-zinc-200 dark:border-zinc-800/80">
        <div>
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
            <Layers className={`w-4 h-4 ${accent.text}`} />
            Pola Latar Belakang (Background Pattern)
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Pilih jenis animasi atau pola dekoratif di latar halaman pengunjung. Semua berbasis CSS murni.
          </p>
        </div>

        {/* BG Style selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {BG_STYLES.map((item) => {
            const isSelected = currentBgStyle === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleUpdateAppearance("bgStyle", item.id, "Pola Latar")}
                className={`p-4 rounded-2xl border text-left transition-all relative ${
                  isSelected
                    ? "bg-white dark:bg-zinc-900 border-zinc-900 dark:border-white shadow-md ring-1 ring-zinc-900/10 dark:ring-white/20"
                    : "bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                {/* Mini pattern preview */}
                <div className="w-full h-10 mb-3 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 relative">
                  {item.preview === "aurora" && (
                    <div className="absolute inset-0 overflow-hidden flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/50 blur-md animate-pulse" />
                      <div className="w-10 h-10 rounded-full bg-indigo-500/50 blur-md -ml-3" />
                      <div className="w-8 h-8 rounded-full bg-cyan-500/50 blur-md -ml-2" />
                    </div>
                  )}
                  {item.preview === "spectrum" && (
                    <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-80">
                      {[30, 60, 95, 50, 80, 45, 75].map((h, idx) => (
                        <div key={idx} className="w-1 rounded-full bg-emerald-500" style={{ height: `${h * 0.3}px` }} />
                      ))}
                    </div>
                  )}
                  {item.preview === "cybergrid" && (
                    <div className="absolute inset-0 opacity-70">
                      <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(#10b981 1px, transparent 1px), linear-gradient(to right, #10b981 1px, transparent 1px)", backgroundSize: "12px 12px", opacity: 0.35 }} />
                      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-emerald-400 shadow-sm" />
                    </div>
                  )}
                  {item.preview === "radial" && (
                    <div className="absolute inset-0 opacity-50" style={{ backgroundImage: "radial-gradient(#71717a 1px, transparent 1px)", backgroundSize: "10px 10px" }} />
                  )}
                  {item.preview === "grid" && (
                    <div className="absolute inset-0 opacity-50" style={{ backgroundImage: "linear-gradient(#71717a 1px, transparent 1px), linear-gradient(to right, #71717a 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
                  )}
                  {item.preview === "cross" && (
                    <div className="absolute inset-0 opacity-50" style={{ backgroundImage: "linear-gradient(#71717a 1px, transparent 1px), linear-gradient(to right, #71717a 1px, transparent 1px)", backgroundSize: "10px 10px", backgroundPosition: "5px 5px" }} />
                  )}
                  {item.preview === "wave" && (
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                      <path d="M0,15 C16,5 34,25 50,15 C66,5 84,25 100,15 L100,30 C84,40 66,20 50,30 C34,40 16,20 0,30 Z" className="fill-zinc-400 dark:fill-zinc-500 opacity-50" />
                    </svg>
                  )}
                  {item.preview === "particles" && [3, 7, 2, 9, 5].map((size, i) => (
                    <div key={i} className="absolute rounded-full bg-zinc-500 opacity-40" style={{ width: size, height: size, top: `${[20, 60, 40, 15, 70][i]}%`, left: `${[15, 35, 60, 80, 50][i]}%` }} />
                  ))}
                  {item.preview === "none" && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[10px] text-zinc-400 font-mono tracking-wider">— polos —</span>
                    </div>
                  )}
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: accent.colorCode || "#10b981" }}>
                      <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{item.label}</span>
                  {isSelected && <Check className={`w-3.5 h-3.5 ${accent.text} shrink-0`} />}
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed">{item.desc}</p>
              </button>
            );
          })}
        </div>

        {/* BG Intensity */}
        <div>
          <h3 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-3">
            Intensitas Pola
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {BG_INTENSITIES.map((item) => {
              const isSelected = currentBgIntensity === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleUpdateAppearance("bgIntensity", item.id, "Intensitas Latar")}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "bg-white dark:bg-zinc-900 border-zinc-900 dark:border-white shadow-sm"
                      : "bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{item.label}</span>
                    {isSelected && <Check className={`w-3.5 h-3.5 ${accent.text}`} />}
                  </div>
                  <p className="text-[11px] text-zinc-500">{item.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 6: SKILL TAG STYLE */}
      <div className="space-y-4 pt-6 border-t border-zinc-200 dark:border-zinc-800/80">
        <div>
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className={`w-4 h-4 ${accent.text}`} />
            Gaya Tag Teknologi & Keahlian
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Tampilan badge skill di linimasa karir, pendidikan, dan kartu proyek.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SKILL_TAG_STYLES.map((item) => {
            const isSelected = currentSkillTagStyle === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleUpdateAppearance("skillTagStyle", item.id, "Gaya Tag Keahlian")}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? "bg-white dark:bg-zinc-900 border-zinc-900 dark:border-white shadow-md ring-1 ring-zinc-900/10 dark:ring-white/20"
                    : "bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                {/* Tag preview */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {["React", "Vite", "API"].map((tag, i) => (
                    <span key={tag} className={`px-2 py-0.5 text-[10px] font-semibold rounded-md ${item.samples[i]}`}>
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{item.label}</span>
                  {isSelected && <Check className={`w-3.5 h-3.5 ${accent.text} shrink-0`} />}
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed">{item.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 7: BACKUP, EXPORT & RESET */}
      <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800/80 space-y-4">
        <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
          Cadangan & Pemulihan Konfigurasi
        </h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExportJSON}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor File Konfigurasi (JSON)</span>
          </button>

          <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all shadow-sm cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>Impor File JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
            />
          </label>

          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-xs font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-all shadow-sm ml-auto"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset ke Pengaturan Awal</span>
          </button>
        </div>
      </div>
    </div>
  );
}
