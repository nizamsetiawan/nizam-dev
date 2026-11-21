import React, { useState, useRef } from "react";
import { usePortfolio } from "../../context/PortfolioContext";
import { Save, Upload, Image, Trash2, Camera, RefreshCw, FileText, X, CheckCircle2, Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import { supabase } from "../../supabase";

export default function ProfileHero() {
  const { config, updateConfig, accent } = usePortfolio();

  const resumeInputRef = useRef(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [isDraggingResume, setIsDraggingResume] = useState(false);

  const [formData, setFormData] = useState({
    name: config?.profile?.name || "",
    initials: config?.profile?.initials || "",
    role: config?.profile?.role || "",
    location: config?.profile?.location || "",
    availabilityLabel: config?.profile?.availabilityLabel || "",
    statusText: config?.profile?.statusText || "",
    isAvailable: config?.profile?.isAvailable !== false,
    resumeUrl: config?.profile?.resumeUrl || "",
    photoUrl: config?.profile?.photoUrl || "/Photo.jpeg",
    contactEmail: config?.profile?.contactEmail || "",

    // Hero headline
    headlinePrefix: config?.hero?.headlinePrefix || "",
    headlineAccent: config?.hero?.headlineAccent || "",
    headlineSuffix: config?.hero?.headlineSuffix || "",
    bio: config?.hero?.bio || "",
    primaryCtaText: config?.hero?.primaryCtaText || "",
    secondaryCtaText: config?.hero?.secondaryCtaText || "",

    // Socials
    github: config?.socials?.github || "",
    linkedin: config?.socials?.linkedin || "",
    twitter: config?.socials?.twitter || "",

    // Metrics (4 items)
    metric0Value: config?.metrics?.[0]?.value || "",
    metric0Label: config?.metrics?.[0]?.label || "",
    metric0Sub: config?.metrics?.[0]?.subtext || "",

    metric1Value: config?.metrics?.[1]?.value || "",
    metric1Label: config?.metrics?.[1]?.label || "",
    metric1Sub: config?.metrics?.[1]?.subtext || "",

    metric2Value: config?.metrics?.[2]?.value || "",
    metric2Label: config?.metrics?.[2]?.label || "",
    metric2Sub: config?.metrics?.[2]?.subtext || "",

    metric3Value: config?.metrics?.[3]?.value || "",
    metric3Label: config?.metrics?.[3]?.label || "",
    metric3Sub: config?.metrics?.[3]?.subtext || "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        title: "Ukuran Gambar Terlalu Besar",
        text: "Maksimal ukuran berkas foto profil adalah 5MB.",
        icon: "warning",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setFormData((prev) => ({
        ...prev,
        photoUrl: uploadEvent.target.result,
      }));

      Swal.fire({
        title: "Foto Berhasil Dimuat!",
        text: "Pratinjau foto profil telah diperbarui. Jangan lupa klik 'Simpan Perubahan' di bawah.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    };
    reader.readAsDataURL(file);
  };

  // ── Upload PDF Resume ke Supabase Storage (Mendukung Klik & Drag-and-Drop) ──
  const handleResumeFile = async (file) => {
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      Swal.fire({ title: "Format Tidak Valid", text: "Hanya berkas PDF yang diizinkan.", icon: "warning" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      Swal.fire({ title: "Berkas Terlalu Besar", text: "Maksimal ukuran berkas PDF adalah 10MB.", icon: "warning" });
      return;
    }

    setResumeUploading(true);
    try {
      const path = `resume_${Date.now()}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from("resume-files")
        .upload(path, file, { upsert: true, contentType: "application/pdf" });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("resume-files").getPublicUrl(path);

      setFormData((prev) => ({ ...prev, resumeUrl: publicUrl }));

      Swal.fire({
        title: "Resume Berhasil Diunggah!",
        text: "URL resume telah diperbarui. Jangan lupa klik 'Simpan Perubahan' di bawah.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Resume upload error:", err);
      Swal.fire({
        title: "Gagal Mengunggah",
        text: err.message || "Terjadi kesalahan saat mengunggah resume. Pastikan bucket 'resume-files' sudah dibuat di Supabase Storage.",
        icon: "error",
      });
    } finally {
      setResumeUploading(false);
      if (resumeInputRef.current) resumeInputRef.current.value = "";
    }
  };

  const handleResumeUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) handleResumeFile(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const updatedConfig = {
      ...config,
      profile: {
        ...config.profile,
        name: formData.name,
        initials: formData.initials,
        role: formData.role,
        location: formData.location,
        availabilityLabel: formData.availabilityLabel,
        statusText: formData.statusText,
        isAvailable: formData.isAvailable,
        resumeUrl: formData.resumeUrl,
        photoUrl: formData.photoUrl,
        contactEmail: formData.contactEmail,
      },
      hero: {
        ...config.hero,
        headlinePrefix: formData.headlinePrefix,
        headlineAccent: formData.headlineAccent,
        headlineSuffix: formData.headlineSuffix,
        bio: formData.bio,
        primaryCtaText: formData.primaryCtaText,
        secondaryCtaText: formData.secondaryCtaText,
      },
      socials: {
        ...config.socials,
        github: formData.github,
        linkedin: formData.linkedin,
        twitter: formData.twitter,
        email: formData.contactEmail,
      },
      metrics: [
        { value: formData.metric0Value, label: formData.metric0Label, subtext: formData.metric0Sub },
        { value: formData.metric1Value, label: formData.metric1Label, subtext: formData.metric1Sub },
        { value: formData.metric2Value, label: formData.metric2Label, subtext: formData.metric2Sub },
        { value: formData.metric3Value, label: formData.metric3Label, subtext: formData.metric3Sub },
      ],
    };

    updateConfig(updatedConfig);

    Swal.fire({
      title: "Profil & Hero Disimpan!",
      text: "Perubahan foto, identitas, dan headline langsung diterapkan di situs.",
      icon: "success",
      confirmButtonColor: "#10b981",
      timer: 1800,
      showConfirmButton: false,
    });
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Kustomisasi Profil & Hero
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Ubah foto avatar profil, nama lengkap, headline hero, lencana status ketersediaan kerja, dan metrik capaian.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* BAGIAN 1: FOTO PROFIL / AVATAR */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <Camera className={`w-4 h-4 ${accent.text}`} />
              Foto Profil & Avatar Diri
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Live Avatar Preview */}
            <div className="relative group shrink-0">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 shadow-md">
                {formData.photoUrl ? (
                  <img
                    src={formData.photoUrl}
                    alt="Pratinjau Foto Profil"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400">
                    <Image className="w-8 h-8 opacity-40 mb-1" />
                    <span className="text-[10px]">Tanpa Foto</span>
                  </div>
                )}
              </div>
            </div>

            {/* Photo Controls */}
            <div className="space-y-3.5 flex-1 w-full">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Tautan Gambar (URL)
                </label>
                <input
                  type="text"
                  name="photoUrl"
                  value={formData.photoUrl}
                  onChange={handleChange}
                  placeholder="https://... atau /Photo.jpeg"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
                />
              </div>

              {/* Upload file button + Quick Actions */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 cursor-pointer transition-all shadow-sm">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Unggah Foto dari Komputer</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, photoUrl: "/Photo.jpeg" }))}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Foto Bawaan</span>
                </button>

                {formData.photoUrl && (
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, photoUrl: "" }))}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Foto</span>
                  </button>
                )}
              </div>
              <p className="text-[11px] text-zinc-500">
                Format yang didukung: JPG, PNG, WEBP. Foto ini akan tampil di bagian "Tentang Saya" (About).
              </p>
            </div>
          </div>
        </div>

        {/* BAGIAN 2: IDENTITAS */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
            Identitas & Informasi Umum
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Nama Lengkap</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Inisial (Logo Monogram Navbar)</label>
              <input
                type="text"
                name="initials"
                value={formData.initials}
                onChange={handleChange}
                maxLength={4}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Peran Profesional / Jabatan</label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Lokasi & Mode Kerja</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Berkas CV / Resume (PDF)</label>

              {/* Current file indicator */}
              {formData.resumeUrl ? (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <CheckCircle2 className={`w-4 h-4 ${accent.text} shrink-0`} />
                  <a
                    href={formData.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-xs text-zinc-600 dark:text-zinc-400 hover:underline truncate font-mono"
                  >
                    {formData.resumeUrl.split("/").pop()}
                  </a>
                  <button
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, resumeUrl: "" }))}
                    className="p-0.5 text-zinc-400 hover:text-red-500 transition-colors"
                    title="Hapus URL Resume"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="text-xs text-zinc-500 italic px-1">Belum ada resume yang diunggah.</div>
              )}

              {/* Upload area with drag & drop */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingResume(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsDraggingResume(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingResume(false);
                  const f = e.dataTransfer.files?.[0];
                  if (f) handleResumeFile(f);
                }}
                className={`flex items-center gap-2 mt-1 p-3 rounded-xl border-2 border-dashed transition-colors cursor-pointer group ${
                  isDraggingResume
                    ? `${accent.border} ${accent.bgSubtle}`
                    : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 bg-zinc-50/50 dark:bg-zinc-900/40"
                }`}
                onClick={() => !resumeUploading && resumeInputRef.current?.click()}
              >
                <input
                  ref={resumeInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleResumeUpload}
                  disabled={resumeUploading}
                />
                {resumeUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 text-zinc-400 animate-spin shrink-0" />
                    <span className="text-xs text-zinc-500">Mengunggah PDF...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors shrink-0" />
                    <div className="flex-1">
                      <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200 transition-colors">
                        {formData.resumeUrl ? "Ganti Berkas PDF" : "Klik untuk Unggah PDF"}
                      </span>
                      <span className="text-[11px] text-zinc-400 ml-1.5">Maks. 10MB</span>
                    </div>
                    <Upload className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  </>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Alamat Email Kontak</label>
              <input
                type="email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Ketersediaan Kerja */}
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/60 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Teks Lencana Status Pengunjung</label>
              <input
                type="text"
                name="statusText"
                value={formData.statusText}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-4">
              <input
                type="checkbox"
                id="isAvailable"
                name="isAvailable"
                checked={formData.isAvailable}
                onChange={handleChange}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="isAvailable" className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 cursor-pointer">
                Tandai sebagai "Tersedia untuk Bekerja" (Titik Hijau Berkedip)
              </label>
            </div>
          </div>
        </div>

        {/* BAGIAN 3: HEADLINE TEKS */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
            Teks Headline Hero
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Awalan Headline</label>
              <input
                type="text"
                name="headlinePrefix"
                value={formData.headlinePrefix}
                onChange={handleChange}
                placeholder="Membangun aplikasi web yang bersih, cepat, dan"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Kata Kunci Aksen (Warna)</label>
              <input
                type="text"
                name="headlineAccent"
                value={formData.headlineAccent}
                onChange={handleChange}
                placeholder="berdampak tinggi"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Akhiran Headline</label>
              <input
                type="text"
                name="headlineSuffix"
                value={formData.headlineSuffix}
                onChange={handleChange}
                placeholder="dengan arsitektur modern."
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Narasi Perkenalan / Sub-bio</label>
            <textarea
              name="bio"
              rows={3}
              value={formData.bio}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-500 resize-none"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Teks Tombol Aksi Utama (CTA 1)</label>
              <input
                type="text"
                name="primaryCtaText"
                value={formData.primaryCtaText}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Teks Tombol Aksi Kedua (CTA 2)</label>
              <input
                type="text"
                name="secondaryCtaText"
                value={formData.secondaryCtaText}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* BAGIAN 4: METRIK CAPAIAN HERO */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
            4 Kartu Metrik Angka di Hero
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Metrik 0 */}
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <div className="text-xs font-bold text-zinc-500">Metrik 1</div>
              <input
                type="text"
                name="metric0Value"
                value={formData.metric0Value}
                onChange={handleChange}
                placeholder="Angka (Contoh: 3+ Tahun)"
                className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
              />
              <input
                type="text"
                name="metric0Label"
                value={formData.metric0Label}
                onChange={handleChange}
                placeholder="Label (Contoh: Pengalaman Web)"
                className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
              />
              <input
                type="text"
                name="metric0Sub"
                value={formData.metric0Sub}
                onChange={handleChange}
                placeholder="Keterangan (Contoh: Teknologi Modern)"
                className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            {/* Metrik 1 */}
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <div className="text-xs font-bold text-zinc-500">Metrik 2</div>
              <input
                type="text"
                name="metric1Value"
                value={formData.metric1Value}
                onChange={handleChange}
                placeholder="Angka (Contoh: 15+)"
                className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
              />
              <input
                type="text"
                name="metric1Label"
                value={formData.metric1Label}
                onChange={handleChange}
                placeholder="Label (Contoh: Proyek Selesai)"
                className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
              />
              <input
                type="text"
                name="metric1Sub"
                value={formData.metric1Sub}
                onChange={handleChange}
                placeholder="Keterangan (Contoh: Skala Produksi)"
                className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            {/* Metrik 2 */}
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <div className="text-xs font-bold text-zinc-500">Metrik 3</div>
              <input
                type="text"
                name="metric2Value"
                value={formData.metric2Value}
                onChange={handleChange}
                placeholder="Angka (Contoh: 100%)"
                className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
              />
              <input
                type="text"
                name="metric2Label"
                value={formData.metric2Label}
                onChange={handleChange}
                placeholder="Label (Contoh: Desain Responsif)"
                className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
              />
              <input
                type="text"
                name="metric2Sub"
                value={formData.metric2Sub}
                onChange={handleChange}
                placeholder="Keterangan (Contoh: Optimal di Semua Layar)"
                className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            {/* Metrik 3 */}
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <div className="text-xs font-bold text-zinc-500">Metrik 4</div>
              <input
                type="text"
                name="metric3Value"
                value={formData.metric3Value}
                onChange={handleChange}
                placeholder="Angka (Contoh: < 24 Jam)"
                className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
              />
              <input
                type="text"
                name="metric3Label"
                value={formData.metric3Label}
                onChange={handleChange}
                placeholder="Label (Contoh: Waktu Respon)"
                className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
              />
              <input
                type="text"
                name="metric3Sub"
                value={formData.metric3Sub}
                onChange={handleChange}
                placeholder="Keterangan (Contoh: Komunikasi Cepat)"
                className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>
        </div>

        {/* Tombol Simpan */}
        <div className="flex justify-end">
          <button
            type="submit"
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl ${accent.bg} text-white font-semibold text-sm hover:opacity-90 transition-all shadow-md active:scale-95`}
          >
            <Save className="w-4 h-4" />
            <span>Simpan Perubahan Profil & Hero</span>
          </button>
        </div>
      </form>
    </div>
  );
}
