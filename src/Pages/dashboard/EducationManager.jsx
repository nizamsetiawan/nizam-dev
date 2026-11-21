import React, { useState, useMemo } from "react";
import { Plus, Trash2, Edit2, GraduationCap, Calendar, Download, Upload, CheckCircle2, Award } from "lucide-react";
import { usePortfolio } from "../../context/PortfolioContext";
import { downloadExcelTemplate, parseUploadedSpreadsheet, showImportResultAlert } from "../../utils/csvHelper";
import AdminModal from "../../components/admin/AdminModal";
import AdminDataToolbar from "../../components/admin/AdminDataToolbar";
import AdminPagination from "../../components/admin/AdminPagination";
import Swal from "sweetalert2";

export default function EducationManager() {
  const { config, updateConfig, accent, cardRadiusClass, buttonRadiusClass } = usePortfolio();
  const education = config?.education || [];

  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("table");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editingId, setEditingId] = useState(null);

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

  // Instant Auto-Save on Add / Edit
  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!form.degree?.trim() || !form.institution?.trim()) {
      Swal.fire({
        title: "Kolom Belum Lengkap",
        text: "Gelar/Jurusan dan Institusi wajib diisi.",
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

    const payload = {
      ...form,
      period: periodStr,
    };

    let updated = [];
    if (editingId === "new") {
      const newItem = {
        id: "edu-" + Date.now(),
        ...payload,
      };
      updated = [newItem, ...education];
    } else {
      updated = education.map((s) => (s.id === editingId ? { ...s, ...payload } : s));
    }

    try {
      await updateConfig({
        ...config,
        education: updated,
      });

      setEditingId(null);

      Swal.fire({
        title: "Berhasil Disimpan",
        text: "Data riwayat pendidikan telah tersimpan otomatis.",
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
  const handleDelete = (id, title) => {
    Swal.fire({
      title: "Hapus Riwayat Pendidikan?",
      text: title ? `Anda yakin ingin menghapus "${title}"? Data akan langsung terhapus dari sistem.` : "Data akan langsung terhapus dari sistem.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#71717a",
      confirmButtonText: "Ya, Hapus Sekarang",
      cancelButtonText: "Batal",
    }).then(async (res) => {
      if (res.isConfirmed) {
        const filtered = education.filter((s) => s.id !== id);
        try {
          await updateConfig({
            ...config,
            education: filtered,
          });

          Swal.fire({
            title: "Data Dihapus",
            text: "Riwayat pendidikan berhasil dihapus.",
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

  // Excel Templates
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
    const exportRows = (education && education.length > 0)
      ? education.map((edu, idx) => ({
          No: idx + 1,
          Gelar_Jurusan: edu.degree || "",
          Institusi_Universitas: edu.institution || "",
          Tahun_Mulai: edu.startDate || "2020",
          Tahun_Selesai: edu.isCurrent ? "" : (edu.endDate || "2024"),
          Masih_Studi: edu.isCurrent ? "YA" : "TIDAK",
          Deskripsi: edu.description || "",
          Predikat_Nilai: edu.grade || "",
        }))
      : EDU_SAMPLE_ROWS;

    downloadExcelTemplate("template_pendidikan_formal", EDU_TEMPLATE_HEADERS, exportRows, accent.hex || "#10b981");
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

      const updatedList = [...education];
      let updatedCount = 0;
      let addedCount = 0;
      const errors = [];

      parsed.data.forEach((row) => {
        const rowNumStr = row["No"] || row["no"] || row._rowNumber;
        const rowNo = parseInt(rowNumStr, 10);
        const degree = (row["Gelar_Jurusan"] || row["Degree"] || row["gelar"] || "").trim();
        const institution = (row["Institusi_Universitas"] || row["Institution"] || row["institusi"] || "").trim();
        const start = (row["Tahun_Mulai"] || row["StartYear"] || "2020").trim();
        const end = (row["Tahun_Selesai"] || row["EndYear"] || "2024").trim();
        const currentRaw = (row["Masih_Studi"] || "").toUpperCase().trim();
        const isCurrent = currentRaw === "YA" || currentRaw === "YES" || currentRaw === "TRUE";
        const description = (row["Deskripsi"] || row["Description"] || "").trim();
        const grade = (row["Predikat_Nilai"] || row["Grade"] || "").trim();

        if (!degree || degree.toLowerCase() === "gelar_jurusan") {
          if (degree.toLowerCase() === "gelar_jurusan") return;
          errors.push({ row: rowNumStr, reason: "Kolom 'Gelar_Jurusan' tidak boleh kosong." });
          return;
        }
        if (!institution || institution.toLowerCase() === "institusi_universitas") {
          if (institution.toLowerCase() === "institusi_universitas") return;
          errors.push({ row: rowNumStr, reason: "Kolom 'Institusi_Universitas' tidak boleh kosong." });
          return;
        }

        const period = `${start} — ${isCurrent ? "Sekarang" : end}`;

        const existingIdx = (!isNaN(rowNo) && rowNo >= 1 && rowNo <= education.length)
          ? rowNo - 1
          : updatedList.findIndex((item) => item.degree?.toLowerCase() === degree.toLowerCase() && item.institution?.toLowerCase() === institution.toLowerCase());

        const payload = {
          degree,
          institution,
          startDate: start,
          endDate: isCurrent ? "" : end,
          isCurrent,
          period,
          description,
          grade,
        };

        if (existingIdx >= 0 && existingIdx < updatedList.length) {
          updatedList[existingIdx] = {
            ...updatedList[existingIdx],
            ...payload,
          };
          updatedCount++;
        } else {
          updatedList.push({
            id: "edu-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
            ...payload,
          });
          addedCount++;
        }
      });

      if (updatedCount > 0 || addedCount > 0) {
        await updateConfig({
          ...config,
          education: updatedList,
        });
      }

      showImportResultAlert({
        addedCount,
        updatedCount,
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

  // Filtered & Paginated Data
  const filteredEducation = useMemo(() => {
    if (!searchTerm.trim()) return education;
    const q = searchTerm.toLowerCase().trim();
    return education.filter((edu) =>
      edu.degree?.toLowerCase().includes(q) ||
      edu.institution?.toLowerCase().includes(q) ||
      edu.period?.toLowerCase().includes(q) ||
      edu.description?.toLowerCase().includes(q) ||
      edu.grade?.toLowerCase().includes(q)
    );
  }, [education, searchTerm]);

  const totalPages = Math.ceil(filteredEducation.length / pageSize) || 1;
  const paginatedEducation = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEducation.slice(start, start + pageSize);
  }, [filteredEducation, currentPage, pageSize]);

  // Quick stats
  const activeCount = education.filter((e) => e.isCurrent).length;

  return (
    <div className="space-y-6 w-full pb-10">
      {/* Page Header with Compact Mini Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${accent.bgSubtle} ${accent.text}`}>
              <GraduationCap className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Pendidikan Formal & Pelatihan
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Kelola riwayat studi akademik. Perubahan langsung tersimpan otomatis.
          </p>
        </div>

        {/* Compact Mini Badges */}
        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-400">
            <span>Total:</span>
            <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">{education.length}</strong>
          </span>
          {activeCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-400">
              <span>Aktif:</span>
              <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">{activeCount}</strong>
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Auto-Sync
          </span>
        </div>
      </div>

      {/* Data Toolbar: Search, Mode Switch, Page Size, Import/Export, Add */}
      <div className={`p-4 bg-white dark:bg-zinc-900/60 ${cardRadiusClass} border border-zinc-200 dark:border-zinc-800 shadow-2xs`}>
        <AdminDataToolbar
          searchTerm={searchTerm}
          setSearchTerm={(term) => {
            setSearchTerm(term);
            setCurrentPage(1);
          }}
          searchPlaceholder="Cari gelar, jurusan, institusi, atau tahun..."
          totalCount={education.length}
          filteredCount={filteredEducation.length}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onAddNew={handleStartAdd}
          addLabel="Tambah Pendidikan"
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
      {filteredEducation.length === 0 ? (
        <div className={`p-12 text-center bg-white dark:bg-zinc-900/40 ${cardRadiusClass} border border-zinc-200 dark:border-zinc-800 space-y-3`}>
          <GraduationCap className="w-12 h-12 text-zinc-400 mx-auto opacity-30" />
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            {searchTerm ? "Tidak ada hasil pencarian" : "Belum Ada Riwayat Pendidikan"}
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            {searchTerm
              ? `Tidak ditemukan data pendidikan yang cocok dengan kata kunci "${searchTerm}".`
              : "Tambahkan riwayat akademik baru atau unggah berkas template Excel untuk memulai."}
          </p>
          {searchTerm ? (
            <button
              onClick={() => setSearchTerm("")}
              className={`px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white`}
            >
              Reset Filter
            </button>
          ) : (
            <button
              onClick={handleStartAdd}
              className={`inline-flex items-center gap-1.5 px-4 py-2 ${buttonRadiusClass} ${accent.bg} text-white text-xs font-semibold hover:opacity-90 transition-all`}
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Pendidikan Pertama</span>
            </button>
          )}
        </div>
      ) : viewMode === "table" ? (
        /* TABLE VIEW (Optimal for large datasets) */
        <div className={`bg-white dark:bg-zinc-900/70 ${cardRadiusClass} border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-2xs`}>
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/75 dark:bg-zinc-950/50 text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3.5 w-12 text-center">No</th>
                  <th className="py-3 px-4 min-w-[200px]">Gelar & Jurusan</th>
                  <th className="py-3 px-4 min-w-[200px]">Institusi / Kampus</th>
                  <th className="py-3 px-3.5 min-w-[130px]">Periode Studi</th>
                  <th className="py-3 px-3.5 min-w-[150px]">Predikat / Nilai</th>
                  <th className="py-3 px-4 text-right min-w-[100px]">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {paginatedEducation.map((edu, idx) => {
                  const globalIdx = (currentPage - 1) * pageSize + idx + 1;
                  return (
                    <tr
                      key={edu.id || idx}
                      className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors group"
                    >
                      <td className="py-3 px-3.5 text-center font-mono text-zinc-400">
                        {globalIdx}
                      </td>
                      <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-100">
                        <div className="truncate max-w-[240px] font-medium" title={edu.degree}>
                          {edu.degree}
                        </div>
                        {edu.description && (
                          <div className="text-[11px] text-zinc-400 truncate max-w-[260px] font-normal">
                            {edu.description}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-zinc-600 dark:text-zinc-300">
                        <div className="truncate max-w-[220px]" title={edu.institution}>
                          {edu.institution}
                        </div>
                      </td>
                      <td className="py-3 px-3.5 font-mono text-zinc-500 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] ${
                          edu.isCurrent
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                        }`}>
                          {edu.period}
                        </span>
                      </td>
                      <td className="py-3 px-3.5">
                        {edu.grade ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                            <Award className="w-3 h-3" />
                            <span className="truncate max-w-[140px]">{edu.grade}</span>
                          </span>
                        ) : (
                          <span className="text-zinc-400 text-[11px]">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(edu)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            title="Edit Data"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(edu.id, edu.degree)}
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
              totalItems={filteredEducation.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      ) : (
        /* GRID VIEW */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedEducation.map((edu) => (
              <div
                key={edu.id}
                className={`p-5 ${cardRadiusClass} bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-3 flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-all`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate" title={edu.degree}>
                        {edu.degree}
                      </h3>
                      <p className="text-xs text-zinc-500 mt-0.5 truncate" title={edu.institution}>
                        {edu.institution}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleStartEdit(edu)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(edu.id, edu.degree)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                      {edu.period}
                    </span>
                    {edu.grade && (
                      <span className="text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                        {edu.grade}
                      </span>
                    )}
                  </div>

                  {edu.description && (
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-3">
                      {edu.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <AdminPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredEducation.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* POPUP MODAL FORM FOR ADD / EDIT (Does not push content down) */}
      <AdminModal
        isOpen={Boolean(editingId)}
        onClose={() => setEditingId(null)}
        title={editingId === "new" ? "Tambah Riwayat Pendidikan" : "Edit Riwayat Pendidikan"}
        subtitle="Data akan langsung tersimpan secara otomatis setelah Anda mengklik simpan."
        icon={GraduationCap}
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
              form="eduForm"
              className={`px-5 py-2 ${buttonRadiusClass} ${accent.bg} text-white text-xs font-semibold hover:opacity-90 transition-all shadow-sm active:scale-95`}
            >
              Simpan Data
            </button>
          </>
        }
      >
        <form id="eduForm" onSubmit={handleSaveItem} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Gelar / Jurusan Studi <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={form.degree}
                onChange={(e) => setForm({ ...form, degree: e.target.value })}
                placeholder="cth. S1 Teknik Informatika"
                required
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Nama Institusi / Universitas <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={form.institution}
                onChange={(e) => setForm({ ...form, institution: e.target.value })}
                placeholder="cth. Institut Teknologi Sepuluh Nopember"
                required
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600"
              />
            </div>
          </div>

          {/* PERIODE TAHUN */}
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
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                  Tahun Selesai / Kelulusan
                </label>
                <input
                  type="number"
                  min="1980"
                  max="2035"
                  value={form.endDate}
                  disabled={form.isCurrent}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none disabled:opacity-40"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="eduIsCurrentModal"
                checked={form.isCurrent}
                onChange={(e) => setForm({ ...form, isCurrent: e.target.checked })}
                className="w-4 h-4 rounded text-zinc-900 dark:text-zinc-100 focus:ring-0 cursor-pointer"
              />
              <label htmlFor="eduIsCurrentModal" className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 cursor-pointer">
                Masih aktif menempuh studi saat ini (Status: "Sekarang")
              </label>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Predikat Nilai / Prestasi (Opsional)
            </label>
            <input
              type="text"
              value={form.grade}
              onChange={(e) => setForm({ ...form, grade: e.target.value })}
              placeholder="cth. IPK 3.85 / 4.00 (Cumlaude)"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Deskripsi Mata Kuliah / Skripsi / Catatan Tambahan
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Fokus keahlian, tugas akhir atau kegiatan organisasi penting..."
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none resize-none"
            />
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
