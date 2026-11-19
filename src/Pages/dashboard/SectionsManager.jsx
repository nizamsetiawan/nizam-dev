import React, { useState } from "react";
import { Eye, EyeOff, LayoutTemplate, Layers, CheckCircle, Save, Info, Sliders } from "lucide-react";
import { usePortfolio } from "../../context/PortfolioContext";
import Swal from "sweetalert2";

export default function SectionsManager() {
  const { config, updateConfig, accent } = usePortfolio();
  const [sections, setSections] = useState(config?.sections || {});
  const [elements, setElements] = useState(config?.elements || {});
  const [isSaving, setIsSaving] = useState(false);

  const toggleSection = (key) => {
    setSections((prev) => ({
      ...prev,
      [key]: prev[key] === false ? true : false,
    }));
  };

  const toggleElement = (key) => {
    setElements((prev) => ({
      ...prev,
      [key]: prev[key] === false ? true : false,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateConfig({
        ...config,
        sections,
        elements,
      });

      Swal.fire({
        title: "Visibilitas Diperbarui!",
        text: "Pengaturan tampilan section dan elemen website berhasil disimpan.",
        icon: "success",
        confirmButtonColor: "#10b981",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        title: "Gagal Menyimpan",
        text: "Terjadi kesalahan saat menyimpan pengaturan.",
        icon: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const SECTION_DEFS = [
    { key: "hero", label: "Hero / Beranda Utama", desc: "Headline utama, bio singkat, CTA, dan tombol tautan awal." },
    { key: "about", label: "Tentang Saya (About)", desc: "Narasi profil profesional, foto avatar, dan filosofi rekayasa." },
    { key: "experiences", label: "Pengalaman Kerja", desc: "Linimasa karir, riwayat pekerjaan, dan kontribusi teknis." },
    { key: "services", label: "Layanan & Solusi", desc: "Daftar spesialisasi jasa dan kapabilitas pembangunan web." },
    { key: "projects", label: "Proyek Portofolio", desc: "Koleksi aplikasi web unggulan beserta tautan demo & GitHub." },
    { key: "skills", label: "Matriks Keahlian Teknis", desc: "Kategori kompetensi dan tag teknologi yang dikuasai." },
    { key: "education", label: "Pendidikan Formal", desc: "Riwayat akademik, gelar vokasi, dan sertifikasi studi." },
    { key: "certificates", label: "Sertifikat & Kredensial", desc: "Galeri sertifikat kursus dan pencapaian profesional." },
    { key: "socialHub", label: "Saluran & Tautan Sosial", desc: "Hub kartu interaktif untuk profil GitHub, LinkedIn, Twitter, dll." },
    { key: "faq", label: "Tanya Jawab (FAQ)", desc: "Daftar accordion pertanyaan umum seputar ketersediaan dan proyek." },
    { key: "contact", label: "Formulir Kontak", desc: "Kotak kirim pesan langsung dan info alamat surel." },
    { key: "guestbook", label: "Buku Tamu / Komentar", desc: "Kolom pesan real-time publik pengunjung situs." },
  ];

  const ELEMENT_DEFS = [
    { key: "heroStatusBadge", label: "Badge Status Ketersediaan", desc: "Menampilkan pin 'Tersedia untuk Pekerjaan' di atas headline." },
    { key: "heroMetrics", label: "Kartu Angka Metrik di Hero", desc: "4 kotak statistik (Pengalaman, Proyek, Desain, Waktu Respon)." },
    { key: "heroResumeBtn", label: "Tombol Unduh CV / Resume", desc: "Tombol pintas membuka dokumen resume di bagian Hero." },
    { key: "heroContactBtn", label: "Tombol Hubungi Saya di Hero", desc: "Tombol gulir instan ke formulir kontak." },
    { key: "heroTechPills", label: "Tag Keahlian Cepat di Hero", desc: "Pills teknologi di bawah hero (opsional/nonaktif secara default agar tidak mengulang bagian Matriks Keahlian)." },
    { key: "aboutPhoto", label: "Foto Avatar / Profil di Halaman Tentang", desc: "Gambar avatar diri. Jika dinonaktifkan, teks narasi akan melebar penuh secara rapi." },
    { key: "aboutInfoCard", label: "Kotak Info Lokasi & Role", desc: "Kartu ringkas lokasi dan peran di bawah foto profil." },
    { key: "aboutPrinciples", label: "Kartu Pilar Prinsip Rekayasa", desc: "3 pilar filosofi pengembangan kode bersih & performa." },
    { key: "contactDirectEmail", label: "Kotak Salin Surel Cepat", desc: "Kartu info alamat email langsung dengan tombol salin otomatis." },
    { key: "contactForm", label: "Formulir Pengiriman Pesan", desc: "Form input nama, email, dan textarea pesan pengunjung." },
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${accent.bgSubtle} ${accent.text}`}>
              <Sliders className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Manajer Section & Visibilitas Elemen
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Atur bagian mana saja yang ingin ditampilkan atau disembunyikan. Navigasi menu akan menyesuaikan secara otomatis.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-semibold text-xs sm:text-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-sm active:scale-95 disabled:opacity-50`}
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? "Menyimpan..." : "Simpan Visibilitas"}</span>
        </button>
      </div>

      {/* Info notice */}
      <div className="p-4 rounded-2xl bg-zinc-100/80 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 flex items-start gap-3 text-xs text-zinc-600 dark:text-zinc-400">
        <Info className={`w-4 h-4 ${accent.text} shrink-0 mt-0.5`} />
        <div>
          <strong className="text-zinc-900 dark:text-zinc-200">Tips 100% Dinamis:</strong> Jika sebuah section dinonaktifkan (disembunyikan), section tersebut tidak akan dirender di situs pengunjung dan tautan menu di Navbar atas otomatis menghilang sehingga tampilan tetap rapi.
        </div>
      </div>

      {/* SECTION 1: SECTIONS TOGGLES */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
          <LayoutTemplate className={`w-4 h-4 ${accent.text}`} />
          Visibilitas Section Halaman
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {SECTION_DEFS.map((sec) => {
            const isVisible = sections[sec.key] !== false;
            return (
              <div
                key={sec.key}
                onClick={() => toggleSection(sec.key)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 select-none ${
                  isVisible
                    ? "bg-white dark:bg-zinc-900/60 border-zinc-300 dark:border-zinc-700 shadow-sm"
                    : "bg-zinc-50 dark:bg-zinc-950/60 border-zinc-200/80 dark:border-zinc-800/60 opacity-60"
                }`}
              >
                <div className="space-y-1 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {sec.label}
                    </span>
                    {isVisible ? (
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        Aktif
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-500 border border-zinc-300 dark:border-zinc-700">
                        Sembunyi
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    {sec.desc}
                  </p>
                </div>

                <div
                  className={`w-12 h-6 rounded-full transition-colors flex items-center p-1 shrink-0 ${
                    isVisible ? accent.bg : "bg-zinc-300 dark:bg-zinc-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      isVisible ? "translate-x-6" : "translate-x-0"
                    }`}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: INDIVIDUAL ELEMENT TOGGLES */}
      <div className="space-y-4 pt-6 border-t border-zinc-200 dark:border-zinc-800/80">
        <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
          <Layers className={`w-4 h-4 ${accent.text}`} />
          Visibilitas Elemen Tertentu (Teks, Gambar, Tombol)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {ELEMENT_DEFS.map((el) => {
            const isVisible = elements[el.key] !== false;
            return (
              <div
                key={el.key}
                onClick={() => toggleElement(el.key)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 select-none ${
                  isVisible
                    ? "bg-white dark:bg-zinc-900/60 border-zinc-300 dark:border-zinc-700 shadow-sm"
                    : "bg-zinc-50 dark:bg-zinc-950/60 border-zinc-200/80 dark:border-zinc-800/60 opacity-60"
                }`}
              >
                <div className="space-y-1 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {el.label}
                    </span>
                    {isVisible ? (
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        Aktif
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-500 border border-zinc-300 dark:border-zinc-700">
                        Sembunyi
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    {el.desc}
                  </p>
                </div>

                <div
                  className={`w-12 h-6 rounded-full transition-colors flex items-center p-1 shrink-0 ${
                    isVisible ? accent.bg : "bg-zinc-300 dark:bg-zinc-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      isVisible ? "translate-x-6" : "translate-x-0"
                    }`}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
