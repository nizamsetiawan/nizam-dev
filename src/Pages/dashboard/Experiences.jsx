import React, { useState } from "react";
import { usePortfolio } from "../../context/PortfolioContext";
import { Plus, Trash2, Pencil, MoveUp, MoveDown, Briefcase, Calendar, Download, Upload, FileSpreadsheet } from "lucide-react";
import { downloadExcelTemplate, parseUploadedSpreadsheet, showImportResultAlert } from "../../utils/csvHelper";
import Swal from "sweetalert2";

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const formatMonthYear = (ymStr) => {
  if (!ymStr) return "";
  const parts = ymStr.split("-");
  if (parts.length < 2) return ymStr;
  const monthIdx = parseInt(parts[1], 10) - 1;
  const monthName = MONTH_NAMES[monthIdx] || parts[1];
  return `${monthName} ${parts[0]}`;
};

export default function Experiences() {
  const { config, updateConfig, accent } = usePortfolio();
  const experiences = config?.experiences || [];

  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    role: "",
    company: "",
    startDate: "2023-01",
    endDate: "",
    isCurrent: true,
    location: "",
    description: "",
    skillsInput: "",
  });

  const handleOpenAdd = () => {
    setEditingId("new");
    setFormData({
      role: "",
      company: "",
      startDate: new Date().toISOString().slice(0, 7),
      endDate: "",
      isCurrent: true,
      location: "Indonesia (Remote / Hybrid)",
      description: "",
      skillsInput: "",
    });
  };

  const handleOpenEdit = (exp) => {
    setEditingId(exp.id);

    // Parse period if in format "YYYY-MM" or fallback
    let start = exp.startDate || "";
    let end = exp.endDate || "";
    let current = exp.isCurrent ?? false;

    if (!start && exp.period) {
      if (exp.period.toLowerCase().includes("sekarang") || exp.period.toLowerCase().includes("present")) {
        current = true;
      }
    }

    setFormData({
      role: exp.role || "",
      company: exp.company || "",
      startDate: start || "2023-01",
      endDate: end,
      isCurrent: current,
      location: exp.location || "",
      description: exp.description || "",
      skillsInput: (exp.skills || []).join(", "),
    });
  };

  const handleSave = (e) => {
    e.preventDefault();

    if (!formData.role || !formData.company) {
      Swal.fire({
        title: "Kolom Belum Lengkap",
        text: "Posisi dan Nama Perusahaan wajib diisi.",
        icon: "warning",
      });
      return;
    }

    // Date validation
    if (!formData.isCurrent && formData.startDate && formData.endDate) {
      if (formData.startDate > formData.endDate) {
        Swal.fire({
          title: "Tanggal Tidak Valid",
          text: "Bulan mulai bekerja tidak boleh lebih akhir daripada bulan selesai bekerja.",
          icon: "error",
        });
        return;
      }
    }

    const startText = formatMonthYear(formData.startDate);
    const endText = formData.isCurrent ? "Sekarang" : formatMonthYear(formData.endDate);
    const generatedPeriod = startText && endText ? `${startText} — ${endText}` : formData.period || "2023 — Sekarang";

    const skills = formData.skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    let updatedList = [];

    const newPayload = {
      role: formData.role,
      company: formData.company,
      startDate: formData.startDate,
      endDate: formData.isCurrent ? "" : formData.endDate,
      isCurrent: formData.isCurrent,
      period: generatedPeriod,
      location: formData.location,
      description: formData.description,
      skills,
    };

    if (editingId === "new") {
      updatedList = [{ id: `exp-${Date.now()}`, ...newPayload }, ...experiences];
    } else {
      updatedList = experiences.map((item) =>
        item.id === editingId ? { ...item, ...newPayload } : item
      );
    }

    updateConfig({
      ...config,
      experiences: updatedList,
    });

    setEditingId(null);

    Swal.fire({
      title: "Pengalaman Kerja Disimpan!",
      text: "Linimasa karir telah diperbarui.",
      icon: "success",
      confirmButtonColor: "#10b981",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const handleDelete = (id, role) => {
    Swal.fire({
      title: "Hapus Pengalaman Kerja?",
      text: `Yakin ingin menghapus riwayat karir sebagai "${role}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    }).then((res) => {
      if (res.isConfirmed) {
        const filtered = experiences.filter((item) => item.id !== id);
        updateConfig({
          ...config,
          experiences: filtered,
        });
      }
    });
  };

  const moveItem = (idx, direction) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= experiences.length) return;
    const copy = [...experiences];
    const [moved] = copy.splice(idx, 1);
    copy.splice(targetIdx, 0, moved);
    updateConfig({
      ...config,
      experiences: copy,
    });
  };

  const EXP_TEMPLATE_HEADERS = ["Posisi", "Perusahaan", "Bulan_Mulai", "Bulan_Selesai", "Masih_Bekerja", "Lokasi", "Deskripsi", "Teknologi_Keahlian"];
  const EXP_SAMPLE_ROWS = [
    {
      Posisi: "Senior Frontend Engineer",
      Perusahaan: "Tech Innovation Corp",
      Bulan_Mulai: "2023-01",
      Bulan_Selesai: "",
      Masih_Bekerja: "YA",
      Lokasi: "Jakarta (Remote)",
      Deskripsi: "Membangun arsitektur antarmuka web performa tinggi dengan React dan Tailwind.",
      Teknologi_Keahlian: "React, Vite, Tailwind CSS, TypeScript",
    },
    {
      Posisi: "Web Developer",
      Perusahaan: "Digital Studio Nusantara",
      Bulan_Mulai: "2021-06",
      Bulan_Selesai: "2022-12",
      Masih_Bekerja: "TIDAK",
      Lokasi: "Bandung (Hybrid)",
      Deskripsi: "Mengembangkan aplikasi web kustom dan integrasi REST API backend.",
      Teknologi_Keahlian: "JavaScript, HTML5, CSS3, REST API",
    },
  ];

  const handleDownloadExcel = () => {
    const exportRows = (experiences && experiences.length > 0)
      ? experiences.map((exp, idx) => ({
          No: idx + 1,
          Posisi: exp.role || "",
          Perusahaan: exp.company || "",
          Bulan_Mulai: exp.startDate || "",
          Bulan_Selesai: exp.isCurrent ? "" : (exp.endDate || ""),
          Masih_Bekerja: exp.isCurrent ? "YA" : "TIDAK",
          Lokasi: exp.location || "Indonesia",
          Deskripsi: exp.description || "",
          Teknologi_Keahlian: Array.isArray(exp.skills) ? exp.skills.join(", ") : (exp.skills || ""),
        }))
      : EXP_SAMPLE_ROWS;

    downloadExcelTemplate("template_pengalaman_kerja", EXP_TEMPLATE_HEADERS, exportRows, accent.hex || "#10b981");
  };

  // Bulk Spreadsheet Upload (Excel .xls / .xlsx)
  const handleSpreadsheetUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const parsed = await parseUploadedSpreadsheet(file);

      if (!parsed.data || parsed.data.length === 0) {
        showImportResultAlert({
          successCount: 0,
          errors: [{ row: 1, reason: "Berkas kosong atau tidak memiliki baris data." }],
          entityName: "Pengalaman Kerja",
        });
        return;
      }

      const updatedList = [...experiences];
      let updatedCount = 0;
      let addedCount = 0;
      const errors = [];

      parsed.data.forEach((row) => {
        const rowNumStr = row["No"] || row["no"] || row._rowNumber;
        const rowNo = parseInt(rowNumStr, 10);
        const role = (row["Posisi"] || row["Role"] || row["posisi"] || "").trim();
        const company = (row["Perusahaan"] || row["Company"] || row["perusahaan"] || "").trim();
        const startDate = (row["Bulan_Mulai"] || row["StartDate"] || row["bulan_mulai"] || "").trim();
        const endDate = (row["Bulan_Selesai"] || row["EndDate"] || row["bulan_selesai"] || "").trim();
        const isCurrentRaw = (row["Masih_Bekerja"] || row["IsCurrent"] || "").toUpperCase().trim();
        const isCurrent = isCurrentRaw === "YA" || isCurrentRaw === "YES" || isCurrentRaw === "TRUE" || !endDate;
        const location = (row["Lokasi"] || row["Location"] || "Indonesia").trim();
        const description = (row["Deskripsi"] || row["Description"] || "").trim();
        const skillsRaw = row["Teknologi_Keahlian"] || row["Skills"] || "";

        if (!role || role.toLowerCase() === "posisi") {
          if (role.toLowerCase() === "posisi") return;
          errors.push({ row: rowNumStr, reason: "Kolom 'Posisi' tidak boleh kosong." });
          return;
        }
        if (!company || company.toLowerCase() === "perusahaan") {
          if (company.toLowerCase() === "perusahaan") return;
          errors.push({ row: rowNumStr, reason: "Kolom 'Perusahaan' tidak boleh kosong." });
          return;
        }

        const startText = startDate ? formatMonthYear(startDate) : "2023";
        const endText = isCurrent ? "Sekarang" : (endDate ? formatMonthYear(endDate) : "2024");
        const period = `${startText} — ${endText}`;

        const skills = skillsRaw ? String(skillsRaw).split(/[,|;]/).map((s) => s.trim()).filter(Boolean) : [];

        const existingIdx = (!isNaN(rowNo) && rowNo >= 1 && rowNo <= experiences.length)
          ? rowNo - 1
          : updatedList.findIndex((item) => item.role?.toLowerCase() === role.toLowerCase() && item.company?.toLowerCase() === company.toLowerCase());

        const payload = {
          role,
          company,
          startDate: startDate || "2023-01",
          endDate: isCurrent ? "" : endDate,
          isCurrent,
          period,
          location,
          description,
          skills,
        };

        if (existingIdx >= 0 && existingIdx < updatedList.length) {
          updatedList[existingIdx] = {
            ...updatedList[existingIdx],
            ...payload,
          };
          updatedCount++;
        } else {
          updatedList.push({
            id: `exp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            ...payload,
          });
          addedCount++;
        }
      });

      if (updatedCount > 0 || addedCount > 0) {
        updateConfig({
          ...config,
          experiences: updatedList,
        });
      }

      showImportResultAlert({
        addedCount,
        updatedCount,
        errors,
        entityName: "Pengalaman Kerja",
      });
    } catch (err) {
      Swal.fire({
        title: "Format Berkas Tidak Valid",
        text: "Terjadi kesalahan saat membaca file: " + err.message,
        icon: "error",
      });
    } finally {
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${accent.bgSubtle} ${accent.text}`}>
              <Briefcase className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Pengalaman Kerja & Linimasa Karir
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Kelola riwayat karir, posisi pekerjaan, rentang waktu bulan & tahun, dan teknologi terkait.
          </p>
        </div>

        {/* Action Buttons: Add, Download Template, Import Excel */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadExcel}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold ${accent.text} hover:opacity-80 transition-all shadow-sm`}
            title="Unduh format tabel Excel (.xls) ber-header & No"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Template / Data Excel (.xls)</span>
          </button>

          <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white cursor-pointer transition-all shadow-sm">
            <Upload className="w-3.5 h-3.5" />
            <span>Impor Berkas Excel</span>
            <input
              type="file"
              accept=".xls, .xlsx, .csv"
              onChange={handleSpreadsheetUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={handleOpenAdd}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl ${accent.bg} text-white text-xs font-semibold hover:opacity-90 transition-all shadow-sm active:scale-95`}
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Pengalaman</span>
          </button>
        </div>
      </div>

      {/* Form Tambah / Edit */}
      {editingId && (
        <form
          onSubmit={handleSave}
          className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 shadow-lg space-y-4"
        >
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Briefcase className={`w-4 h-4 ${accent.text}`} />
            {editingId === "new" ? "Tambah Riwayat Pengalaman Baru" : "Edit Riwayat Pengalaman"}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Posisi / Jabatan Pekerjaan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="cth. Senior Frontend Developer"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Nama Perusahaan / Institusi <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="cth. PT Solusi Digital Nusantara"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* PERIODE TANGGAL & CHECKBOX MASIH BEKERJA */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              <span>Rentang Waktu Periode</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                  Bulan & Tahun Mulai Bekerja
                </label>
                <input
                  type="month"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                  Bulan & Tahun Selesai Bekerja
                </label>
                <input
                  type="month"
                  value={formData.endDate}
                  disabled={formData.isCurrent}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isCurrent"
                checked={formData.isCurrent}
                onChange={(e) => setFormData({ ...formData, isCurrent: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="isCurrent" className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 cursor-pointer">
                Masih aktif bekerja di sini (Status: "Sekarang")
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Lokasi & Model Kerja
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="cth. Jakarta (Remote) atau Bandung (Hybrid)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Teknologi & Keahlian Digunakan (Pisahkan dengan tanda koma)
              </label>
              <input
                type="text"
                value={formData.skillsInput}
                onChange={(e) => setFormData({ ...formData, skillsInput: e.target.value })}
                placeholder="cth. React, Vite, Tailwind CSS, TypeScript"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Deskripsi Tanggung Jawab & Kontribusi
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Jelaskan peran teknis, tantangan yang diselesaikan, atau dampak proyek..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-500 resize-none"
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
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 shadow-sm"
            >
              Simpan Pengalaman
            </button>
          </div>
        </form>
      )}

      {/* List */}
      {experiences.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-zinc-900/40 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
          <Briefcase className="w-10 h-10 text-zinc-400 mx-auto opacity-40" />
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Belum Ada Pengalaman Kerja
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Tambahkan riwayat karir Anda secara manual atau unggah sekaligus menggunakan berkas CSV / Excel.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {experiences.map((exp, idx) => (
            <div
              key={exp.id || idx}
              className="p-5 rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 shadow-sm flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {exp.role}
                  </h3>
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md">
                    {exp.company}
                  </span>
                </div>

                <div className="text-xs font-mono text-zinc-500">
                  {exp.period} • {exp.location}
                </div>

                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-3xl">
                  {exp.description}
                </p>

                {exp.skills && exp.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {exp.skills.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions & Reordering */}
              <div className="flex items-center gap-1 shrink-0 self-end sm:self-start">
                <button
                  onClick={() => moveItem(idx, -1)}
                  disabled={idx === 0}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-black dark:hover:text-white disabled:opacity-20"
                  title="Pindah ke atas"
                >
                  <MoveUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => moveItem(idx, 1)}
                  disabled={idx === experiences.length - 1}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-black dark:hover:text-white disabled:opacity-20"
                  title="Pindah ke bawah"
                >
                  <MoveDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleOpenEdit(exp)}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  title="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(exp.id, exp.role)}
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  title="Hapus"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
