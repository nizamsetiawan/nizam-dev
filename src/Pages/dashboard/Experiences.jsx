import React, { useState, useMemo } from "react";
import { usePortfolio } from "../../context/PortfolioContext";
import { Plus, Trash2, Edit2, MoveUp, MoveDown, Briefcase, Calendar, Download, Upload, CheckCircle2, MapPin } from "lucide-react";
import { downloadExcelTemplate, parseUploadedSpreadsheet, showImportResultAlert } from "../../utils/csvHelper";
import AdminModal from "../../components/admin/AdminModal";
import AdminDataToolbar from "../../components/admin/AdminDataToolbar";
import AdminPagination from "../../components/admin/AdminPagination";
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
  const { config, updateConfig, accent, cardRadiusClass, buttonRadiusClass } = usePortfolio();
  const experiences = config?.experiences || [];

  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("table");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
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

  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.role?.trim() || !formData.company?.trim()) {
      Swal.fire({
        title: "Kolom Belum Lengkap",
        text: "Posisi dan Nama Perusahaan wajib diisi.",
        icon: "warning",
      });
      return;
    }

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
      .split(/[,|;]/)
      .map((s) => s.trim())
      .filter(Boolean);

    const newPayload = {
      role: formData.role.trim(),
      company: formData.company.trim(),
      startDate: formData.startDate,
      endDate: formData.isCurrent ? "" : formData.endDate,
      isCurrent: formData.isCurrent,
      period: generatedPeriod,
      location: formData.location.trim(),
      description: formData.description.trim(),
      skills,
    };

    let updatedList = [];
    if (editingId === "new") {
      updatedList = [{ id: `exp-${Date.now()}`, ...newPayload }, ...experiences];
    } else {
      updatedList = experiences.map((item) =>
        item.id === editingId ? { ...item, ...newPayload } : item
      );
    }

    try {
      await updateConfig({
        ...config,
        experiences: updatedList,
      });

      setEditingId(null);

      Swal.fire({
        title: "Berhasil Disimpan",
        text: "Data pengalaman kerja tersimpan otomatis.",
        icon: "success",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (err) {
      Swal.fire({
        title: "Gagal Menyimpan",
        text: err.message || "Terjadi kesalahan saat menyimpan data.",
        icon: "error",
      });
    }
  };

  // Instant Auto-Save on Delete (Tanpa perlu klik simpan terpisah)
  const handleDelete = (id, role) => {
    Swal.fire({
      title: "Hapus Pengalaman Kerja?",
      text: `Yakin ingin menghapus riwayat karir sebagai "${role}"? Data akan langsung terhapus dari sistem.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#71717a",
      confirmButtonText: "Ya, Hapus Sekarang",
      cancelButtonText: "Batal",
    }).then(async (res) => {
      if (res.isConfirmed) {
        const filtered = experiences.filter((item) => item.id !== id);
        try {
          await updateConfig({
            ...config,
            experiences: filtered,
          });

          Swal.fire({
            title: "Data Dihapus",
            text: "Riwayat pengalaman kerja berhasil dihapus.",
            icon: "success",
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 1500,
          });
        } catch (err) {
          Swal.fire({
            title: "Gagal Menghapus",
            text: err.message || "Gagal menghapus data dari sistem.",
            icon: "error",
          });
        }
      }
    });
  };

  const moveItem = async (idx, direction) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= experiences.length) return;
    const copy = [...experiences];
    const [moved] = copy.splice(idx, 1);
    copy.splice(targetIdx, 0, moved);
    await updateConfig({
      ...config,
      experiences: copy,
    });
  };

  // Excel Templates & Live Data Export
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
      Teknologi_Keahlian: "PHP, Laravel, JavaScript, MySQL",
    },
  ];

  const handleDownloadExcel = () => {
    const exportRows = (experiences && experiences.length > 0)
      ? experiences.map((exp, idx) => ({
          No: idx + 1,
          Posisi: exp.role || "",
          Perusahaan: exp.company || "",
          Bulan_Mulai: exp.startDate || "2023-01",
          Bulan_Selesai: exp.isCurrent ? "" : (exp.endDate || ""),
          Masih_Bekerja: exp.isCurrent ? "YA" : "TIDAK",
          Lokasi: exp.location || "Indonesia",
          Deskripsi: exp.description || "",
          Teknologi_Keahlian: Array.isArray(exp.skills) ? exp.skills.join(", ") : (exp.skills || ""),
        }))
      : EXP_SAMPLE_ROWS;

    downloadExcelTemplate("template_pengalaman_kerja", EXP_TEMPLATE_HEADERS, exportRows, accent?.hex || "#10b981");
  };

  const handleSpreadsheetUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const parsed = await parseUploadedSpreadsheet(file);

      if (!parsed.data || parsed.data.length === 0) {
        showImportResultAlert({
          successCount: 0,
          errors: [{ row: 1, reason: "Berkas kosong atau tidak ada data yang ditemukan." }],
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
        await updateConfig({
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

  // Filtered & Paginated Data
  const filteredExperiences = useMemo(() => {
    if (!searchTerm.trim()) return experiences;
    const q = searchTerm.toLowerCase().trim();
    return experiences.filter((exp) =>
      exp.role?.toLowerCase().includes(q) ||
      exp.company?.toLowerCase().includes(q) ||
      exp.period?.toLowerCase().includes(q) ||
      exp.location?.toLowerCase().includes(q) ||
      exp.description?.toLowerCase().includes(q) ||
      (Array.isArray(exp.skills) && exp.skills.some((s) => s.toLowerCase().includes(q)))
    );
  }, [experiences, searchTerm]);

  const totalPages = Math.ceil(filteredExperiences.length / pageSize) || 1;
  const paginatedExperiences = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredExperiences.slice(start, start + pageSize);
  }, [filteredExperiences, currentPage, pageSize]);

  // Quick stats
  const activeJobs = experiences.filter((e) => e.isCurrent).length;

  return (
    <div className="space-y-6 max-w-6xl pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${accent.bgSubtle} ${accent.text}`}>
              <Briefcase className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Pengalaman Kerja & Linimasa Karir
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Kelola riwayat karir profesional. Semua penambahan, pengeditan, atau penghapusan data tersimpan langsung ke sistem.
          </p>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className={`p-4 bg-white dark:bg-zinc-900/60 ${cardRadiusClass} border border-zinc-200 dark:border-zinc-800 shadow-2xs`}>
          <div className="flex items-center justify-between text-zinc-500 text-xs">
            <span>Total Pengalaman</span>
            <Briefcase className="w-4 h-4 text-zinc-400" />
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
            {experiences.length}
          </p>
        </div>

        <div className={`p-4 bg-white dark:bg-zinc-900/60 ${cardRadiusClass} border border-zinc-200 dark:border-zinc-800 shadow-2xs`}>
          <div className="flex items-center justify-between text-zinc-500 text-xs">
            <span>Pekerjaan Aktif</span>
            <Calendar className="w-4 h-4 text-zinc-400" />
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
            {activeJobs}
          </p>
        </div>

        <div className={`p-4 bg-white dark:bg-zinc-900/60 ${cardRadiusClass} border border-zinc-200 dark:border-zinc-800 shadow-2xs col-span-2 sm:col-span-1`}>
          <div className="flex items-center justify-between text-zinc-500 text-xs">
            <span>Sistem Penyimpanan</span>
            <CheckCircle2 className={`w-4 h-4 ${accent.text}`} />
          </div>
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Auto-Sync Realtime
          </p>
        </div>
      </div>

      {/* Data Toolbar */}
      <div className={`p-4 bg-white dark:bg-zinc-900/60 ${cardRadiusClass} border border-zinc-200 dark:border-zinc-800 shadow-2xs`}>
        <AdminDataToolbar
          searchTerm={searchTerm}
          setSearchTerm={(term) => {
            setSearchTerm(term);
            setCurrentPage(1);
          }}
          searchPlaceholder="Cari posisi, perusahaan, keahlian, atau kota..."
          totalCount={experiences.length}
          filteredCount={filteredExperiences.length}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onAddNew={handleOpenAdd}
          addLabel="Tambah Pengalaman"
          onDownloadExcel={handleDownloadExcel}
          onUploadExcel={handleSpreadsheetUpload}
          pageSize={pageSize}
          setPageSize={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Main Data Presentation */}
      {filteredExperiences.length === 0 ? (
        <div className={`p-12 text-center bg-white dark:bg-zinc-900/40 ${cardRadiusClass} border border-zinc-200 dark:border-zinc-800 space-y-3`}>
          <Briefcase className="w-12 h-12 text-zinc-400 mx-auto opacity-30" />
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            {searchTerm ? "Tidak ada hasil pencarian" : "Belum Ada Pengalaman Kerja"}
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            {searchTerm
              ? `Tidak ditemukan riwayat karir yang cocok dengan kata kunci "${searchTerm}".`
              : "Mulai tambahkan rekam jejak profesional Anda atau impor dari format Excel."}
          </p>
          {searchTerm ? (
            <button
              onClick={() => setSearchTerm("")}
              className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            >
              Reset Filter
            </button>
          ) : (
            <button
              onClick={handleOpenAdd}
              className={`inline-flex items-center gap-1.5 px-4 py-2 ${buttonRadiusClass} ${accent.bg} text-white text-xs font-semibold hover:opacity-90 transition-all`}
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Pengalaman Pertama</span>
            </button>
          )}
        </div>
      ) : viewMode === "table" ? (
        /* TABLE VIEW (Clean and compact for large records) */
        <div className={`bg-white dark:bg-zinc-900/70 ${cardRadiusClass} border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-2xs`}>
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/75 dark:bg-zinc-950/50 text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3.5 w-12 text-center">No</th>
                  <th className="py-3 px-4 min-w-[180px]">Posisi & Peran</th>
                  <th className="py-3 px-4 min-w-[160px]">Perusahaan</th>
                  <th className="py-3 px-3.5 min-w-[140px]">Periode Kerja</th>
                  <th className="py-3 px-3.5 min-w-[140px]">Lokasi</th>
                  <th className="py-3 px-3.5 min-w-[180px]">Keahlian / Tech</th>
                  <th className="py-3 px-4 text-right min-w-[120px]">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {paginatedExperiences.map((exp, idx) => {
                  const globalIdx = (currentPage - 1) * pageSize + idx + 1;
                  const realIdx = experiences.findIndex((e) => e.id === exp.id);

                  return (
                    <tr
                      key={exp.id || idx}
                      className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors group"
                    >
                      <td className="py-3 px-3.5 text-center font-mono text-zinc-400">
                        {globalIdx}
                      </td>
                      <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-100">
                        <div className="truncate max-w-[220px]" title={exp.role}>
                          {exp.role}
                        </div>
                        {exp.description && (
                          <div className="text-[11px] text-zinc-400 truncate max-w-[240px] font-normal">
                            {exp.description}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-zinc-700 dark:text-zinc-300 font-medium">
                        <span className="truncate max-w-[160px] inline-block" title={exp.company}>
                          {exp.company}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 font-mono text-zinc-500 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] ${
                          exp.isCurrent
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                        }`}>
                          {exp.period}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-zinc-500">
                        <span className="truncate max-w-[130px] inline-flex items-center gap-1" title={exp.location}>
                          <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                          <span className="truncate">{exp.location || "—"}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3.5">
                        {exp.skills && exp.skills.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {exp.skills.slice(0, 3).map((s) => (
                              <span
                                key={s}
                                className="px-1.5 py-0.5 text-[10px] rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-mono"
                              >
                                {s}
                              </span>
                            ))}
                            {exp.skills.length > 3 && (
                              <span className="text-[10px] text-zinc-400 font-mono">
                                +{exp.skills.length - 3}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-zinc-400 text-[11px]">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          {realIdx >= 0 && (
                            <>
                              <button
                                type="button"
                                onClick={() => moveItem(realIdx, -1)}
                                disabled={realIdx === 0}
                                className="p-1.5 rounded-lg text-zinc-400 hover:text-black dark:hover:text-white disabled:opacity-20 transition-colors"
                                title="Pindah ke Atas"
                              >
                                <MoveUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveItem(realIdx, 1)}
                                disabled={realIdx === experiences.length - 1}
                                className="p-1.5 rounded-lg text-zinc-400 hover:text-black dark:hover:text-white disabled:opacity-20 transition-colors"
                                title="Pindah ke Bawah"
                              >
                                <MoveDown className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(exp)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            title="Edit Data"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(exp.id, exp.role)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Hapus Data (Langsung Otomatis Terhapus)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-zinc-100 dark:border-zinc-800/80">
            <AdminPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredExperiences.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      ) : (
        /* GRID VIEW */
        <div className="space-y-4">
          <div className="space-y-3">
            {paginatedExperiences.map((exp, idx) => {
              const realIdx = experiences.findIndex((e) => e.id === exp.id);
              return (
                <div
                  key={exp.id || idx}
                  className={`p-5 ${cardRadiusClass} bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 shadow-2xs flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all`}
                >
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                        {exp.role}
                      </h3>
                      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md">
                        {exp.company}
                      </span>
                    </div>

                    <div className="text-xs font-mono text-zinc-500 flex flex-wrap items-center gap-2">
                      <span>{exp.period}</span>
                      {exp.location && (
                        <>
                          <span>•</span>
                          <span>{exp.location}</span>
                        </>
                      )}
                    </div>

                    {exp.description && (
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-3xl">
                        {exp.description}
                      </p>
                    )}

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

                  <div className="flex items-center gap-1 shrink-0 self-end sm:self-start">
                    {realIdx >= 0 && (
                      <>
                        <button
                          type="button"
                          onClick={() => moveItem(realIdx, -1)}
                          disabled={realIdx === 0}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-black dark:hover:text-white disabled:opacity-20"
                          title="Pindah ke Atas"
                        >
                          <MoveUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveItem(realIdx, 1)}
                          disabled={realIdx === experiences.length - 1}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-black dark:hover:text-white disabled:opacity-20"
                          title="Pindah ke Bawah"
                        >
                          <MoveDown className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(exp)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(exp.id, exp.role)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <AdminPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredExperiences.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* POPUP MODAL FORM FOR ADD / EDIT */}
      <AdminModal
        isOpen={Boolean(editingId)}
        onClose={() => setEditingId(null)}
        title={editingId === "new" ? "Tambah Riwayat Pengalaman Baru" : "Edit Riwayat Pengalaman"}
        subtitle="Data akan langsung tersimpan secara otomatis setelah Anda mengklik simpan."
        icon={Briefcase}
        maxWidth="max-w-2xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => setEditingId(null)}
              className={`px-4 py-2 ${buttonRadiusClass} text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors`}
            >
              Batal
            </button>
            <button
              type="submit"
              form="expForm"
              className={`px-5 py-2 ${buttonRadiusClass} ${accent.bg} text-white text-xs font-semibold hover:opacity-90 transition-all shadow-sm active:scale-95`}
            >
              Simpan Pengalaman
            </button>
          </>
        }
      >
        <form id="expForm" onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Posisi / Jabatan Pekerjaan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="cth. Senior Frontend Developer"
                required
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Nama Perusahaan / Institusi <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="cth. PT Solusi Digital Nusantara"
                required
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600"
              />
            </div>
          </div>

          {/* PERIODE TANGGAL */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              <span>Rentang Waktu Periode</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                  Bulan & Tahun Mulai
                </label>
                <input
                  type="month"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                  Bulan & Tahun Selesai
                </label>
                <input
                  type="month"
                  value={formData.endDate}
                  disabled={formData.isCurrent}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none disabled:opacity-40"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="expIsCurrentModal"
                checked={formData.isCurrent}
                onChange={(e) => setFormData({ ...formData, isCurrent: e.target.checked })}
                className="w-4 h-4 rounded text-zinc-900 dark:text-zinc-100 focus:ring-0 cursor-pointer"
              />
              <label htmlFor="expIsCurrentModal" className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 cursor-pointer">
                Masih aktif bekerja di sini saat ini (Status: "Sekarang")
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Lokasi Kerja
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="cth. Jakarta (Remote / On-site)"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Teknologi & Keahlian (pisahkan dengan koma)
              </label>
              <input
                type="text"
                value={formData.skillsInput}
                onChange={(e) => setFormData({ ...formData, skillsInput: e.target.value })}
                placeholder="cth. React, Next.js, TypeScript, Tailwind"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Deskripsi Tanggung Jawab & Kontribusi
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Jelaskan peran teknis, tantangan yang diselesaikan, atau dampak proyek..."
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none resize-none"
            />
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
