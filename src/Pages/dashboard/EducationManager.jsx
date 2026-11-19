import React, { useState } from "react";
import { Plus, Trash2, Edit2, Save, GraduationCap, Calendar, Download, Upload } from "lucide-react";
import { usePortfolio } from "../../context/PortfolioContext";
import { downloadExcelTemplate, downloadCsvTemplate, parseUploadedSpreadsheet, showImportResultAlert } from "../../utils/csvHelper";
import Swal from "sweetalert2";

export default function EducationManager() {
  const { config, updateConfig, accent } = usePortfolio();
  const [education, setEducation] = useState(config?.education || []);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    degree: "",
    institution: "",
    startDate: "2020",
    endDate: "2024",
    isCurrent: false,
    period: "2020 — 2024",
    description: "",
    grade: "",
  });

  const handleStartAdd = () => {
    setEditingId("new");
    setForm({
      degree: "",
      institution: "",
      startDate: "2020",
      endDate: "2024",
      isCurrent: false,
      period: "2020 — 2024",
      description: "",
      grade: "",
    });
  };

  const handleStartEdit = (edu) => {
    setEditingId(edu.id);
    setForm({
      degree: edu.degree || "",
      institution: edu.institution || "",
      startDate: edu.startDate || "2020",
      endDate: edu.endDate || "2024",
      isCurrent: edu.isCurrent ?? false,
      period: edu.period || "",
      description: edu.description || "",
      grade: edu.grade || "",
    });
  };

  const handleSaveItem = (e) => {
    e.preventDefault();
    if (!form.degree || !form.institution) {
      Swal.fire({
        title: "Kolom Belum Lengkap",
        text: "Gelar dan Institusi wajib diisi.",
        icon: "warning",
      });
      return;
    }

    if (!form.isCurrent && form.startDate && form.endDate) {
      if (parseInt(form.startDate, 10) > parseInt(form.endDate, 10)) {
        Swal.fire({
          title: "Tahun Tidak Valid",
          text: "Tahun mulai studi tidak boleh lebih besar dari tahun kelulusan.",
          icon: "error",
        });
        return;
      }
    }

    const periodStr = `${form.startDate} — ${form.isCurrent ? "Sekarang" : form.endDate}`;

    let updated = [];
    const payload = {
      ...form,
      period: periodStr,
    };

    if (editingId === "new") {
      const newItem = {
        id: "edu-" + Date.now(),
        ...payload,
      };
      updated = [...education, newItem];
    } else {
      updated = education.map((s) => (s.id === editingId ? { ...s, ...payload } : s));
    }

    setEducation(updated);
    setEditingId(null);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Hapus Riwayat Pendidikan?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    }).then((res) => {
      if (res.isConfirmed) {
        setEducation((prev) => prev.filter((s) => s.id !== id));
      }
    });
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await updateConfig({
        ...config,
        education,
      });

      Swal.fire({
        title: "Pendidikan Disimpan!",
        text: "Daftar latar belakang akademik berhasil disimpan.",
        icon: "success",
        confirmButtonColor: "#10b981",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({ title: "Gagal Menyimpan", icon: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const EDU_TEMPLATE_HEADERS = ["Gelar_Jurusan", "Institusi_Universitas", "Tahun_Mulai", "Tahun_Selesai", "Masih_Studi", "Deskripsi", "Predikat_Nilai"];
  const EDU_SAMPLE_ROWS = [
    {
      Gelar_Jurusan: "S1 Teknik Informatika",
      Institusi_Universitas: "Institut Teknologi Sepuluh Nopember",
      Tahun_Mulai: "2020",
      Tahun_Selesai: "2024",
      Masih_Studi: "TIDAK",
      Deskripsi: "Fokus pada rekayasa perangkat lunak, sistem terdistribusi, dan kecerdasan buatan.",
      Predikat_Nilai: "IPK 3.85 (Cumlaude)",
    },
    {
      Gelar_Jurusan: "Bootcamp Fullstack Web",
      Institusi_Universitas: "Tech Academy Indonesia",
      Tahun_Mulai: "2023",
      Tahun_Selesai: "2023",
      Masih_Studi: "TIDAK",
      Deskripsi: "Intensif MERN Stack, RESTful API, dan deployment cloud modern.",
      Predikat_Nilai: "Lulus Predikat Sangat Memuaskan",
    },
  ];

  const handleDownloadExcel = () => {
    downloadExcelTemplate("template_pendidikan_formal", EDU_TEMPLATE_HEADERS, EDU_SAMPLE_ROWS, "#10b981");
  };

  const handleDownloadCsv = () => {
    downloadCsvTemplate("template_pendidikan_formal", EDU_TEMPLATE_HEADERS, EDU_SAMPLE_ROWS);
  };

  const handleSpreadsheetUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const parsed = await parseUploadedSpreadsheet(file);

      if (!parsed.data || parsed.data.length === 0) {
        showImportResultAlert({
          successCount: 0,
          errors: [{ row: 1, reason: "Berkas kosong atau tidak memiliki baris data." }],
          entityName: "Pendidikan",
        });
        return;
      }

      const imported = [];
      const errors = [];

      parsed.data.forEach((row) => {
        const rowNum = row["No"] || row["no"] || row._rowNumber;
        const degree = row["Gelar_Jurusan"] || row["Degree"] || row["gelar"];
        const institution = row["Institusi_Universitas"] || row["Institution"] || row["institusi"];
        const start = row["Tahun_Mulai"] || row["StartYear"] || "2020";
        const end = row["Tahun_Selesai"] || row["EndYear"] || "2024";
        const currentRaw = (row["Masih_Studi"] || "").toUpperCase();
        const isCurrent = currentRaw === "YA" || currentRaw === "YES" || currentRaw === "TRUE";
        const description = row["Deskripsi"] || row["Description"] || "";
        const grade = row["Predikat_Nilai"] || row["Grade"] || "";

        if (!degree) {
          errors.push({ row: rowNum, reason: "Kolom 'Gelar_Jurusan' tidak boleh kosong." });
          return;
        }
        if (!institution) {
          errors.push({ row: rowNum, reason: "Kolom 'Institusi_Universitas' tidak boleh kosong." });
          return;
        }

        const period = `${start} — ${isCurrent ? "Sekarang" : end}`;

        imported.push({
          id: "edu-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
          degree,
          institution,
          startDate: start,
          endDate: isCurrent ? "" : end,
          isCurrent,
          period,
          description,
          grade,
        });
      });

      if (imported.length > 0) {
        const updated = [...education, ...imported];
        setEducation(updated);
        updateConfig({
          ...config,
          education: updated,
        });
      }

      showImportResultAlert({
        successCount: imported.length,
        errors,
        entityName: "Pendidikan",
      });
    } catch (err) {
      Swal.fire({
        title: "Gagal Mengimpor Berkas",
        text: err.message,
        icon: "error",
      });
    } finally {
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${accent.bgSubtle} ${accent.text}`}>
              <GraduationCap className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Pendidikan Formal & Pelatihan
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Kelola daftar riwayat studi akademik, tahun kelulusan, dan predikat nilai Anda.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Download Template Excel */}
          <button
            onClick={handleDownloadExcel}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-all shadow-sm"
            title="Unduh format tabel Excel (.xls) ber-header & No"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Template Excel (.xls)</span>
          </button>

          {/* Download Template CSV */}
          <button
            onClick={handleDownloadCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-all shadow-sm"
            title="Unduh format CSV (.csv) ber-header & No"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Template CSV</span>
          </button>

          <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white cursor-pointer transition-all shadow-sm">
            <Upload className="w-3.5 h-3.5" />
            <span>Impor Excel / CSV</span>
            <input
              type="file"
              accept=".csv, .xls, .xlsx"
              onChange={handleSpreadsheetUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={handleStartAdd}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl ${accent.bg} text-white font-semibold text-xs sm:text-sm hover:opacity-90 transition-all shadow-sm active:scale-95`}
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Pendidikan</span>
          </button>

          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-semibold text-xs sm:text-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Menyimpan..." : "Simpan Semua"}</span>
          </button>
        </div>
      </div>

      {editingId && (
        <form
          onSubmit={handleSaveItem}
          className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 shadow-md space-y-4"
        >
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <GraduationCap className={`w-4 h-4 ${accent.text}`} />
            {editingId === "new" ? "Tambah Riwayat Pendidikan" : "Edit Pendidikan"}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Gelar / Jurusan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={form.degree}
                onChange={(e) => setForm({ ...form, degree: e.target.value })}
                placeholder="cth. S1 Teknik Informatika"
                required
                className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Nama Institusi / Universitas <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={form.institution}
                onChange={(e) => setForm({ ...form, institution: e.target.value })}
                placeholder="cth. Institut Teknologi..."
                required
                className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none"
              />
            </div>
          </div>

          {/* PERIODE TAHUN & CHECKBOX SEDANG STUDI */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              <span>Periode Tahun Studi</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                  Tahun Mulai
                </label>
                <input
                  type="number"
                  min="1980"
                  max="2035"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                  Tahun Selesai / Lulus
                </label>
                <input
                  type="number"
                  min="1980"
                  max="2035"
                  value={form.endDate}
                  disabled={form.isCurrent}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 focus:outline-none disabled:opacity-40"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="eduIsCurrent"
                checked={form.isCurrent}
                onChange={(e) => setForm({ ...form, isCurrent: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="eduIsCurrent" className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 cursor-pointer">
                Masih aktif menempuh pendidikan (Status: "Sekarang")
              </label>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Predikat Nilai / Penghargaan (Opsional)
            </label>
            <input
              type="text"
              value={form.grade}
              onChange={(e) => setForm({ ...form, grade: e.target.value })}
              placeholder="cth. IPK 3.8 / 4.0 atau Predikat Memuaskan"
              className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Deskripsi Pembelajaran & Skripsi
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Fokus studi, mata kuliah inti, atau proyek tugas akhir..."
              className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none resize-none"
            ></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEditingId(null)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 dark:bg-white text-white dark:text-zinc-950"
            >
              Terapkan
            </button>
          </div>
        </form>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {education.map((edu) => (
          <div
            key={edu.id}
            className="p-5 rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 shadow-sm space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {edu.degree}
                </h3>
                <p className="text-xs text-zinc-500">{edu.institution} • {edu.period}</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleStartEdit(edu)}
                  className="p-1 rounded-md text-zinc-400 hover:text-black dark:hover:text-white"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(edu.id)}
                  className="p-1 rounded-md text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {edu.description}
            </p>

            {edu.grade && (
              <span className="inline-block text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                {edu.grade}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
