import React, { useState, useMemo } from "react";
import {
  Eye,
  EyeOff,
  LayoutTemplate,
  Layers,
  Save,
  Info,
  Sliders,
  MapPin,
  HelpCircle,
  CheckCircle2,
} from "lucide-react";
import { usePortfolio } from "../../context/PortfolioContext";
import Swal from "sweetalert2";

// Tooltip popover with rich visual metadata on hover/click
function ItemInfoTooltip({ item, isVisible, type = "section", accent, cardRadiusClass }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className={`p-1 rounded-full text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${
          isOpen ? `${accent.text} bg-zinc-100 dark:bg-zinc-800 ring-2 ring-zinc-300 dark:ring-zinc-700` : ""
        }`}
        title="Arahkan kursor atau klik untuk info posisi & komponen di web publik"
        aria-label="Info detail section"
      >
        <Info className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div
          className={`absolute z-50 left-0 sm:left-auto sm:right-0 top-full mt-2 w-72 sm:w-80 p-3.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-2xl ${cardRadiusClass} text-left text-xs space-y-2.5 pointer-events-auto backdrop-blur-md`}
        >
          {/* Header Info */}
          <div className="flex items-start justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2">
            <div className="min-w-0">
              <p className="font-bold text-zinc-900 dark:text-zinc-100 text-xs truncate">
                {item.label}
              </p>
              <p className="text-[10px] text-zinc-500 font-medium">
                {type === "section" ? "Komponen Utama Halaman" : "Sub-Elemen Spesifik"}
              </p>
            </div>
            <span
              className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                isVisible
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700"
              }`}
            >
              {isVisible ? "● Tampil di Web" : "○ Disembunyikan"}
            </span>
          </div>

          {/* Lokasi di Situs */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
              <span>Posisi di Web Pengunjung</span>
            </div>
            <p className="text-[11px] text-zinc-800 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-800/60 p-2 rounded-lg border border-zinc-100 dark:border-zinc-800/80 font-medium">
              {item.location}
            </p>
          </div>

          {/* Isi Konten & Komponen */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              <Eye className="w-3 h-3 text-blue-500 shrink-0" />
              <span>Isi Konten &amp; Komponen</span>
            </div>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {item.preview}
            </p>
          </div>

          {/* Dampak Visibilitas */}
          <div className="space-y-1 pt-1 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              <HelpCircle className="w-3 h-3 text-emerald-500 shrink-0" />
              <span>Dampak Visibilitas</span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 italic">
              {isVisible ? item.impactOnVisible : item.impact}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SectionsManager() {
  const { config, updateConfig, getAccentClasses, getCardRadiusClass, getButtonRadiusClass } = usePortfolio();
  const accent = getAccentClasses();
  const cardRadiusClass = getCardRadiusClass();
  const buttonRadiusClass = getButtonRadiusClass();

  const [sections, setSections] = useState(config?.sections || {});
  const [elements, setElements] = useState(config?.elements || {});
  const [isSaving, setIsSaving] = useState(false);

  const toggleSection = async (key) => {
    const nextVal = sections[key] === false ? true : false;
    const newSections = {
      ...sections,
      [key]: nextVal,
    };
    setSections(newSections);
    await updateConfig({
      ...config,
      sections: newSections,
      elements,
    });
    Swal.fire({
      title: nextVal ? "Section Ditampilkan" : "Section Disembunyikan",
      icon: "success",
      toast: true,
      position: "top-end",
      timer: 1000,
      showConfirmButton: false,
    });
  };

  const toggleElement = async (key) => {
    const nextVal = elements[key] === false ? true : false;
    const newElements = {
      ...elements,
      [key]: nextVal,
    };
    setElements(newElements);
    await updateConfig({
      ...config,
      sections,
      elements: newElements,
    });
    Swal.fire({
      title: nextVal ? "Elemen Ditampilkan" : "Elemen Disembunyikan",
      icon: "success",
      toast: true,
      position: "top-end",
      timer: 1000,
      showConfirmButton: false,
    });
  };

  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
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
        toast: true,
        position: "top-end",
        timer: 1500,
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
    {
      key: "hero",
      label: "Hero / Beranda Utama",
      desc: "Headline utama, bio singkat, CTA, dan tombol tautan awal.",
      location: "Bagian paling atas situs (Section 1)",
      preview: "Foto profil/avatar besar, headline nama & gelar, badge ketersediaan karir, serta tombol aksi cepat 'Unduh CV' dan 'Hubungi Saya'.",
      impact: "Jika disembunyikan: Beranda utama ditiadakan, situs langsung diawali dari section 'Tentang Saya', dan tab 'Beranda' di navbar otomatis disembunyikan.",
      impactOnVisible: "Sedang aktif: Pengunjung disambut langsung oleh headline profil, foto avatar, dan tombol aksi utama.",
    },
    {
      key: "about",
      label: "Tentang Saya (About)",
      desc: "Narasi profil profesional, foto avatar, dan filosofi rekayasa.",
      location: "Di bawah Hero (Section 2 - About Me)",
      preview: "Foto potret profesional, narasi biografi rekayasa perangkat lunak, kartu info ringkas domisili, dan 3 kartu pilar filosofi pengembangan.",
      impact: "Jika disembunyikan: Cerita biografi personal dan pilar filosofi kerja tidak akan ditampilkan di website publik.",
      impactOnVisible: "Sedang aktif: Pengunjung dapat membaca narasi biografi lengkap dan pilar filosofi rekayasa Anda.",
    },
    {
      key: "experiences",
      label: "Pengalaman Kerja",
      desc: "Linimasa karir, riwayat pekerjaan, dan kontribusi teknis.",
      location: "Setelah About (Section 3 - Linimasa Karir)",
      preview: "Linimasa riwayat pekerjaan vertikal, nama perusahaan, posisi jabatan, periode tahun kerja, deskripsi kontribusi, dan tag teknologi.",
      impact: "Jika disembunyikan: Seluruh linimasa karir profesional dan riwayat perusahaan ditiadakan dari halaman publik.",
      impactOnVisible: "Sedang aktif: Pengunjung dan perekrut dapat menginspeksi linimasa riwayat pengalaman kerja Anda.",
    },
    {
      key: "services",
      label: "Layanan & Solusi",
      desc: "Daftar spesialisasi jasa dan kapabilitas pembangunan web.",
      location: "Di atas / di bawah Proyek (Section 4 - Katalog Jasa)",
      preview: "Grid kartu penawaran jasa (Web Development, Cloud, UI/UX, dll) beserta daftar fitur unggulan pada masing-masing bidang.",
      impact: "Jika disembunyikan: Katalog penawaran solusi teknis dan spesialisasi jasa tidak akan muncul di web.",
      impactOnVisible: "Sedang aktif: Calon klien dapat melihat ragam solusi dan penawaran jasa yang Anda sediakan.",
    },
    {
      key: "projects",
      label: "Proyek Portofolio",
      desc: "Koleksi aplikasi web unggulan beserta tautan demo & GitHub.",
      location: "Tepat di tengah halaman (Section 5 - Showcase Portofolio)",
      preview: "Galeri karya aplikasi web dengan thumbnail visual, badge stack teknologi, tombol Live Demo, dan link repositori GitHub.",
      impact: "Jika disembunyikan: Galeri studi kasus proyek dan karya aplikasi ditiadakan dari tampilan beranda publik.",
      impactOnVisible: "Sedang aktif: Pengunjung dapat mencoba demo aplikasi web dan melihat repositori kode proyek Anda.",
    },
    {
      key: "skills",
      label: "Matriks Keahlian Teknis",
      desc: "Kategori kompetensi dan tag teknologi yang dikuasai.",
      location: "Di bawah Proyek (Section 6 - Matriks Keahlian)",
      preview: "Matriks kelompok teknologi (Frontend, Backend, DevOps, Database, dll) lengkap dengan tag skill badges interaktif.",
      impact: "Jika disembunyikan: Seluruh daftar keahlian teknologi dan badge kemampuan teknis tidak akan dirender.",
      impactOnVisible: "Sedang aktif: Pengunjung dapat melihat peta kemampuan dan teknologi yang Anda kuasai.",
    },
    {
      key: "education",
      label: "Pendidikan Formal",
      desc: "Riwayat akademik, gelar vokasi, dan sertifikasi studi.",
      location: "Di samping / setelah Keahlian (Section 7 - Pendidikan)",
      preview: "Kartu institusi universitas, jenjang gelar & program studi, periode tahun akademik, dan catatan predikat/IPK.",
      impact: "Jika disembunyikan: Bagian riwayat pendidikan formal dan latar belakang akademis disembunyikan.",
      impactOnVisible: "Sedang aktif: Riwayat studi dan latar belakang akademis ditampilkan kepada pengunjung.",
    },
    {
      key: "certificates",
      label: "Sertifikat & Kredensial",
      desc: "Galeri sertifikat kursus dan pencapaian profesional.",
      location: "Sebelum Kontak (Section 8 - Sertifikat Resmi)",
      preview: "Grid kartu sertifikat lisensi/pelatihan kursus resmi dengan fitur lightbox preview gambar sertifikat asli, penerbit, dan tanggal terbit.",
      impact: "Jika disembunyikan: Bukti verifikasi sertifikat kursus dan kredensial profesional tidak ditampilkan.",
      impactOnVisible: "Sedang aktif: Pengunjung dapat menginspeksi dan memperbesar gambar sertifikat resmi Anda.",
    },
    {
      key: "socialHub",
      label: "Saluran & Tautan Sosial",
      desc: "Hub kartu interaktif untuk profil GitHub, LinkedIn, Twitter, dll.",
      location: "Menjelang Footer (Section 9 - Bento Saluran Sosial)",
      preview: "Kartu bento grid interaktif akun-akun sosial media resmi (GitHub, LinkedIn, Instagram, Discord, dll) dengan statistik & link langsung.",
      impact: "Jika disembunyikan: Blok tautan bento sosial media disembunyikan dari halaman publik.",
      impactOnVisible: "Sedang aktif: Pengunjung dapat dengan mudah terhubung ke profil sosial media eksternal Anda.",
    },
    {
      key: "faq",
      label: "Tanya Jawab (FAQ)",
      desc: "Daftar accordion pertanyaan umum seputar ketersediaan dan proyek.",
      location: "Sebelum Formulir Kontak (Section 10 - FAQ Accordion)",
      preview: "Daftar pertanyaan yang sering diajukan calon klien/perekrut (mengenai model kerjasama, rate fee, timezone, metode kerja) yang dapat dibuka-tutup.",
      impact: "Jika disembunyikan: Modul tanya-jawab interaktif tidak akan ditampilkan di website publik.",
      impactOnVisible: "Sedang aktif: Calon klien dapat membaca jawaban atas pertanyaan yang paling sering diajukan.",
    },
    {
      key: "contact",
      label: "Formulir Kontak",
      desc: "Kotak kirim pesan langsung dan info alamat surel.",
      location: "Bagian bawah situs (Section 11 - Formulir Pesan)",
      preview: "Formulir interaktif bagi pengunjung untuk mengirim pesan instan ke surel Anda, beserta kartu informasi kontak langsung.",
      impact: "Jika disembunyikan: Pengunjung tidak dapat mengirim pesan langsung lewat formulir di website.",
      impactOnVisible: "Sedang aktif: Pengunjung dan calon klien dapat mengirimkan pesan langsung ke email Anda.",
    },
    {
      key: "guestbook",
      label: "Buku Tamu / Komentar",
      desc: "Kolom pesan real-time publik pengunjung situs.",
      location: "Tepat di atas Footer (Section 12 - Kolom Buku Tamu)",
      preview: "Ruang interaktif di mana pengunjung publik dapat memberikan apresiasi, pesan sambutan, atau feedback secara realtime.",
      impact: "Jika disembunyikan: Seluruh kolom komentar buku tamu disembunyikan dari halaman publik.",
      impactOnVisible: "Sedang aktif: Komentar dan pesan buku tamu pengunjung publik dapat dibaca di web.",
    },
  ];

  const ELEMENT_DEFS = [
    {
      key: "heroStatusBadge",
      label: "Badge Status Ketersediaan",
      desc: "Menampilkan pin 'Tersedia untuk Pekerjaan' di atas headline.",
      location: "Elemen paling atas di dalam Hero Section",
      preview: "Pill hijau berkedip dengan teks ketersediaan kerja (misal: 'Tersedia untuk Pekerjaan Penuh Waktu & Kontrak').",
      impact: "Jika dimatikan: Badge status disembunyikan, headline nama langsung menjadi elemen teratas di hero.",
      impactOnVisible: "Sedang aktif: Pengunjung langsung tahu status ketersediaan kerja Anda sejak detik pertama.",
    },
    {
      key: "heroMetrics",
      label: "Kartu Angka Metrik di Hero",
      desc: "4 kotak statistik (Pengalaman, Proyek, Desain, Waktu Respon).",
      location: "Di bawah bio ringkas pada Hero Section",
      preview: "4 kotak metrik angka ringkas: Total Tahun Pengalaman, Proyek Selesai, Kepuasan, dan Waktu Respons.",
      impact: "Jika dimatikan: 4 kotak statistik di hero disembunyikan, membuat tampilan hero lebih minimalis.",
      impactOnVisible: "Sedang aktif: Angka pencapaian dan jam terbang Anda langsung terlihat di awal beranda.",
    },
    {
      key: "heroResumeBtn",
      label: "Tombol Unduh CV / Resume",
      desc: "Tombol pintas membuka dokumen resume di bagian Hero.",
      location: "Baris tombol aksi utama di Hero Section",
      preview: "Tombol 'Unduh Resume / CV' dengan ikon berkas yang membuka preview PDF resume dan tombol unduh langsung.",
      impact: "Jika dimatikan: Tombol pintas CV di hero ditiadakan (pengunjung hanya bisa melihat menu navigasi lain).",
      impactOnVisible: "Sedang aktif: Perekrut dapat mengklik tombol ini untuk langsung melihat/mengunduh CV PDF Anda.",
    },
    {
      key: "heroContactBtn",
      label: "Tombol Hubungi Saya di Hero",
      desc: "Tombol gulir instan ke formulir kontak.",
      location: "Di samping tombol CV pada Hero Section",
      preview: "Tombol aksi 'Hubungi Saya' yang jika diklik melakukan smooth-scroll otomatis ke section formulir kontak.",
      impact: "Jika dimatikan: Tombol pintas gulir kontak di bagian hero disembunyikan.",
      impactOnVisible: "Sedang aktif: Pengunjung dapat langsung melompat ke form kontak dengan 1 klik dari hero.",
    },
    {
      key: "heroTechPills",
      label: "Tag Keahlian Cepat di Hero",
      desc: "Pills teknologi di bawah hero (opsional/nonaktif secara default agar tidak mengulang bagian Matriks Keahlian).",
      location: "Tepat di bawah tombol aksi di Hero Section",
      preview: "Baris mini pill teknologi unggulan (React, Next.js, Node.js, Tailwind, dll).",
      impact: "Jika dimatikan: Hero terlihat lebih bersih dan tidak terjadi pengulangan dengan section Matriks Keahlian.",
      impactOnVisible: "Sedang aktif: Tag teknologi utama langsung terlihat di bawah tombol aksi hero.",
    },
    {
      key: "aboutPhoto",
      label: "Foto Avatar / Profil di Halaman Tentang",
      desc: "Gambar avatar diri. Jika dinonaktifkan, teks narasi akan melebar penuh secara rapi.",
      location: "Sisi kiri atau atas kartu narasi pada Section About",
      preview: "Foto portrait profil diri dengan bingkai modern dan efek pencahayaan dinamis.",
      impact: "Jika dimatikan: Foto dihilangkan dan teks narasi biografi otomatis mengisi lebar kolom penuh secara rapi.",
      impactOnVisible: "Sedang aktif: Pengunjung melihat foto portrait profesional Anda mendampingi teks narasi biografi.",
    },
    {
      key: "aboutInfoCard",
      label: "Kotak Info Lokasi & Role",
      desc: "Kartu ringkas lokasi dan peran di bawah foto profil.",
      location: "Di bawah foto avatar pada Section About",
      preview: "Kotak badge informasi status domisili wilayah dan fokus peran rekayasa perangkat lunak.",
      impact: "Jika dimatikan: Kotak info domisili dan role di bawah foto profil disembunyikan.",
      impactOnVisible: "Sedang aktif: Pengunjung dapat melihat domisili lokasi dan fokus rekayasa Anda.",
    },
    {
      key: "aboutPrinciples",
      label: "Kartu Pilar Prinsip Rekayasa",
      desc: "3 pilar filosofi pengembangan kode bersih & performa.",
      location: "Di bagian bawah narasi biografi pada Section About",
      preview: "3 kartu pilar filosofi kerja: Kode Bersih & Terstruktur, Optimasi Performa Cepat, serta Solusi Berpusat pada Pengguna.",
      impact: "Jika dimatikan: 3 kartu pilar prinsip pengembangan tidak akan ditampilkan di section About.",
      impactOnVisible: "Sedang aktif: Pengunjung dan calon klien dapat memahami standar kualitas dan filosofi kerja Anda.",
    },
    {
      key: "contactDirectEmail",
      label: "Kotak Salin Surel Cepat",
      desc: "Kartu info alamat email langsung dengan tombol salin otomatis.",
      location: "Di samping / di atas form pesan pada Section Kontak",
      preview: "Kotak kartu email kontak langsung lengkap dengan tombol 1-klik untuk menyalin alamat email ke clipboard pengunjung.",
      impact: "Jika dimatikan: Pengunjung tidak melihat kartu salin email cepat (hanya formulir pesan jika aktif).",
      impactOnVisible: "Sedang aktif: Pengunjung dapat menyalin alamat email Anda secara instan ke clipboard.",
    },
    {
      key: "contactForm",
      label: "Formulir Pengiriman Pesan",
      desc: "Form input nama, email, dan textarea pesan pengunjung.",
      location: "Area formulir utama pada Section Kontak",
      preview: "Formulir input nama, email, subjek, dan textarea pesan untuk pengunjung yang ingin mengirim inquiry atau tawaran kerja.",
      impact: "Jika dimatikan: Formulir input pesan dihilangkan dari section kontak (hanya menyisakan kartu email/kontak).",
      impactOnVisible: "Sedang aktif: Formulir pengiriman pesan berfungsi penuh untuk menerima pesan dari pengunjung.",
    },
  ];

  const activeSectionsCount = useMemo(() => {
    return SECTION_DEFS.filter((s) => sections[s.key] !== false).length;
  }, [sections]);

  const activeElementsCount = useMemo(() => {
    return ELEMENT_DEFS.filter((e) => elements[e.key] !== false).length;
  }, [elements]);

  return (
    <div className="space-y-8 w-full pb-10">
      {/* Header with Compact Mini Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${accent.bgSubtle} ${accent.text}`}>
              <Sliders className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Visibilitas Section &amp; Elemen Halaman
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Atur bagian mana saja yang ingin ditampilkan atau disembunyikan. Arahkan kursor ke ikon (i) untuk melihat info posisi di web pengunjung.
          </p>
        </div>

        {/* Compact Mini Badges */}
        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-400">
            <span>Section Aktif:</span>
            <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">{activeSectionsCount}/{SECTION_DEFS.length}</strong>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-400">
            <span>Elemen Aktif:</span>
            <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">{activeElementsCount}/{ELEMENT_DEFS.length}</strong>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Auto-Sync
          </span>
        </div>
      </div>

      {/* Quick Helper Notice */}
      <div className={`p-3.5 ${cardRadiusClass} bg-zinc-100/80 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 flex items-start gap-3 text-xs text-zinc-600 dark:text-zinc-400`}>
        <Info className={`w-4 h-4 ${accent.text} shrink-0 mt-0.5`} />
        <div className="leading-relaxed">
          <strong className="text-zinc-900 dark:text-zinc-200">Panduan Cepat Admin:</strong> Klik kartu atau sakelar toggle untuk langsung mengaktifkan/menyembunyikan bagian. Arahkan kursor (*hover*) ke ikon <span className="inline-flex items-center px-1 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 font-mono text-[10px] font-bold mx-0.5"><Info className="w-2.5 h-2.5 mr-0.5 inline" /> info</span> pada setiap kartu untuk mengetahui di mana letak persisnya bagian tersebut di halaman pengunjung publik tanpa perlu bolak-balik memeriksa situs.
        </div>
      </div>

      {/* SECTION 1: SECTIONS TOGGLES */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
          <LayoutTemplate className={`w-4 h-4 ${accent.text}`} />
          Visibilitas Section Halaman Utama
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {SECTION_DEFS.map((sec) => {
            const isVisible = sections[sec.key] !== false;
            return (
              <div
                key={sec.key}
                onClick={() => toggleSection(sec.key)}
                className={`relative p-4 ${cardRadiusClass} border transition-all cursor-pointer flex items-center justify-between gap-4 select-none hover:border-zinc-400 dark:hover:border-zinc-600 ${
                  isVisible
                    ? "bg-white dark:bg-zinc-900/60 border-zinc-300 dark:border-zinc-700 shadow-sm"
                    : "bg-zinc-50 dark:bg-zinc-950/60 border-zinc-200/80 dark:border-zinc-800/60 opacity-60"
                }`}
              >
                <div className="space-y-1 pr-2 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
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

                    {/* Info Tooltip Icon */}
                    <ItemInfoTooltip
                      item={sec}
                      isVisible={isVisible}
                      type="section"
                      accent={accent}
                      cardRadiusClass={cardRadiusClass}
                    />
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
                className={`relative p-4 ${cardRadiusClass} border transition-all cursor-pointer flex items-center justify-between gap-4 select-none hover:border-zinc-400 dark:hover:border-zinc-600 ${
                  isVisible
                    ? "bg-white dark:bg-zinc-900/60 border-zinc-300 dark:border-zinc-700 shadow-sm"
                    : "bg-zinc-50 dark:bg-zinc-950/60 border-zinc-200/80 dark:border-zinc-800/60 opacity-60"
                }`}
              >
                <div className="space-y-1 pr-2 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
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

                    {/* Info Tooltip Icon */}
                    <ItemInfoTooltip
                      item={el}
                      isVisible={isVisible}
                      type="element"
                      accent={accent}
                      cardRadiusClass={cardRadiusClass}
                    />
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
