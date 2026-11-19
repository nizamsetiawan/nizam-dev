import React, { useState } from "react";
import { usePortfolio } from "../../context/PortfolioContext";
import { Save, FileText, User, Layers } from "lucide-react";
import Swal from "sweetalert2";

const InputField = ({ label, hint, children }) => (
  <div className="space-y-1">
    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{label}</label>
    {hint && <p className="text-[11px] text-zinc-500">{hint}</p>}
    {children}
  </div>
);

const inputCls = "w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-500 transition-colors";
const textareaCls = `${inputCls} resize-none`;

export default function AboutBio() {
  const { config, updateConfig } = usePortfolio();

  const [formData, setFormData] = useState({
    tag: config?.about?.tag || "Latar Belakang",
    title: config?.about?.title || "Tentang Saya",
    description: config?.about?.description || "",
    paragraph1: config?.about?.paragraph1 || "",
    paragraph2: config?.about?.paragraph2 || "",
    paragraph3: config?.about?.paragraph3 || "",
    photoUrl: config?.profile?.photoUrl || "/Photo.jpeg",

    // Principles
    p0Title: config?.principles?.[0]?.title || "",
    p0Text: config?.principles?.[0]?.text || "",
    p1Title: config?.principles?.[1]?.title || "",
    p1Text: config?.principles?.[1]?.text || "",
    p2Title: config?.principles?.[2]?.title || "",
    p2Text: config?.principles?.[2]?.text || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const updatedConfig = {
      ...config,
      profile: {
        ...config.profile,
        photoUrl: formData.photoUrl,
      },
      about: {
        ...config.about,
        tag: formData.tag,
        title: formData.title,
        description: formData.description,
        paragraph1: formData.paragraph1,
        paragraph2: formData.paragraph2,
        paragraph3: formData.paragraph3,
      },
      principles: [
        { title: formData.p0Title, text: formData.p0Text },
        { title: formData.p1Title, text: formData.p1Text },
        { title: formData.p2Title, text: formData.p2Text },
      ],
    };

    updateConfig(updatedConfig);

    Swal.fire({
      title: "Tentang & Bio Disimpan!",
      text: "Perubahan narasi dan pilar prinsip berhasil diperbarui ke situs pengunjung.",
      icon: "success",
      confirmButtonColor: "#10b981",
      timer: 1800,
      timerProgressBar: true,
      showConfirmButton: false,
    });
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Tentang &amp; Bio Narasi
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Edit paragraf bio, URL foto profil, dan tiga pilar prinsip rekayasa yang ditampilkan di halaman Tentang.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Judul & Foto ── */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-5 shadow-sm">
          <div className="flex items-center gap-2 pb-1 border-b border-zinc-100 dark:border-zinc-800/60">
            <User className="w-4 h-4 text-emerald-500" />
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
              Header Section &amp; Foto Profil
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField label="Label Tag Section" hint='Contoh: "Latar Belakang" — ditampilkan di atas judul section'>
              <input
                type="text"
                name="tag"
                value={formData.tag}
                onChange={handleChange}
                placeholder="Latar Belakang"
                className={inputCls}
              />
            </InputField>

            <InputField label="Judul Section" hint='Contoh: "Tentang Saya"'>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Tentang Saya"
                className={inputCls}
              />
            </InputField>
          </div>

          <InputField label="Sub-deskripsi Section" hint="Teks ringkas di bawah judul section (1–2 kalimat)">
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Ringkasan singkat mengenai identitas dan filosofi saya..."
              className={inputCls}
            />
          </InputField>

          <InputField label="URL Foto Profil / Avatar" hint='Path lokal seperti "/Photo.jpeg" atau URL gambar eksternal'>
            <input
              type="text"
              name="photoUrl"
              value={formData.photoUrl}
              onChange={handleChange}
              placeholder="/Photo.jpeg atau https://..."
              className={inputCls}
            />
          </InputField>

          {/* Preview avatar */}
          {formData.photoUrl && (
            <div className="flex items-center gap-4 pt-1">
              <img
                src={formData.photoUrl}
                alt="Preview avatar"
                className="w-16 h-16 rounded-2xl object-cover border-2 border-zinc-200 dark:border-zinc-700 shadow-sm"
                onError={(e) => { e.target.style.display = "none"; }}
              />
              <p className="text-xs text-zinc-500">Preview foto (akan tampil jika URL valid)</p>
            </div>
          )}
        </div>

        {/* ── Paragraf Narasi Bio ── */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-5 shadow-sm">
          <div className="flex items-center gap-2 pb-1 border-b border-zinc-100 dark:border-zinc-800/60">
            <FileText className="w-4 h-4 text-emerald-500" />
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
              Paragraf Narasi Bio
            </h2>
          </div>

          <InputField label="Paragraf 1 — Pengenalan Diri" hint="Siapa kamu? Latar belakang & awal ketertarikan ke dunia teknologi.">
            <textarea
              name="paragraph1"
              rows={4}
              value={formData.paragraph1}
              onChange={handleChange}
              placeholder="Saya adalah seorang web developer yang berfokus pada..."
              className={textareaCls}
            />
          </InputField>

          <InputField label="Paragraf 2 — Filosofi & Pendekatan Kerja" hint="Bagaimana kamu memandang rekayasa perangkat lunak? Prinsip kamu?">
            <textarea
              name="paragraph2"
              rows={4}
              value={formData.paragraph2}
              onChange={handleChange}
              placeholder="Dibandingkan mengejar tren visual berlebihan, saya memprioritaskan..."
              className={textareaCls}
            />
          </InputField>

          <InputField label="Paragraf 3 — Visi & Arah ke Depan" hint="Apa yang sedang kamu perdalam? Ke mana arah karir kamu?">
            <textarea
              name="paragraph3"
              rows={4}
              value={formData.paragraph3}
              onChange={handleChange}
              placeholder="Saya terus memperdalam keahlian di ekosistem JavaScript/TypeScript modern..."
              className={textareaCls}
            />
          </InputField>
        </div>

        {/* ── 3 Pilar Prinsip ── */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-5 shadow-sm">
          <div className="flex items-center gap-2 pb-1 border-b border-zinc-100 dark:border-zinc-800/60">
            <Layers className="w-4 h-4 text-emerald-500" />
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                3 Pilar Prinsip Rekayasa
              </h2>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Ditampilkan sebagai 3 kartu prinsip di bagian bawah section Tentang.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { n: 0, label: "Pilar 1", titleName: "p0Title", textName: "p0Text" },
              { n: 1, label: "Pilar 2", titleName: "p1Title", textName: "p1Text" },
              { n: 2, label: "Pilar 3", titleName: "p2Title", textName: "p2Text" },
            ].map(({ n, label, titleName, textName }) => (
              <div
                key={n}
                className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2.5"
              >
                <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  {label}
                </div>
                <input
                  type="text"
                  name={titleName}
                  value={formData[titleName]}
                  onChange={handleChange}
                  placeholder="Judul pilar..."
                  className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-500 transition-colors"
                />
                <textarea
                  name={textName}
                  rows={3}
                  value={formData[textName]}
                  onChange={handleChange}
                  placeholder="Deskripsi singkat pilar ini..."
                  className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-500 resize-none transition-colors"
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── Tombol Simpan ── */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-500 transition-all shadow-md active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Tentang &amp; Bio</span>
          </button>
        </div>
      </form>
    </div>
  );
}
