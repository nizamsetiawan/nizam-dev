import React, { useState, useMemo } from "react";
import { usePortfolio } from "../../context/PortfolioContext";
import { Plus, Trash2, Edit2, Zap, Download, Upload, CheckCircle2 } from "lucide-react";
import { downloadExcelTemplate, parseUploadedSpreadsheet, showImportResultAlert } from "../../utils/csvHelper";
import AdminModal from "../../components/admin/AdminModal";
import AdminDataToolbar from "../../components/admin/AdminDataToolbar";
import AdminPagination from "../../components/admin/AdminPagination";
import Swal from "sweetalert2";

export default function SkillsManager() {
  const { config, updateConfig, accent, cardRadiusClass, buttonRadiusClass } = usePortfolio();
  const categories = config?.skillsCategories || [];

  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("table");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    category: "",
    description: "",
    skillsInput: "",
  });

  const handleOpenAdd = () => {
    setEditingId("new");
    setFormData({
      category: "",
      description: "",
      skillsInput: "",
    });
  };

  const handleOpenEdit = (cat) => {
    setEditingId(cat.id);
    setFormData({
      category: cat.category || "",
      description: cat.description || "",
      skillsInput: Array.isArray(cat.skills) ? cat.skills.join(", ") : (cat.skills || ""),
    });
  };

  // Instant Auto-Save on Add / Edit
  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.category?.trim()) {
      Swal.fire({
        title: "Kolom Belum Lengkap",
        text: "Nama Kategori Keahlian wajib diisi.",
        icon: "warning",
      });
      return;
    }

    const skills = formData.skillsInput
      .split(/[,|;]/)
      .map((s) => s.trim())
      .filter(Boolean);

    let updatedList = [];
    const payload = {
      category: formData.category.trim(),
      description: formData.description.trim(),
      skills,
    };

    if (editingId === "new") {
      const newEntry = {
        id: `cat-${Date.now()}`,
        ...payload,
      };
      updatedList = [newEntry, ...categories];
    } else {
      updatedList = categories.map((item) =>
        item.id === editingId ? { ...item, ...payload } : item
      );
    }

    try {
      await updateConfig({
        ...config,
        skillsCategories: updatedList,
      });

      setEditingId(null);

      Swal.fire({
        title: "Berhasil Disimpan",
        text: "Kategori keahlian tersimpan otomatis.",
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
  const handleDelete = (id, category) => {
    Swal.fire({
      title: "Hapus Kategori Keahlian?",
      text: category ? `Yakin ingin menghapus kategori "${category}" beserta seluruh tag teknologinya? Data akan langsung terhapus.` : "Data akan langsung terhapus.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#71717a",
      confirmButtonText: "Ya, Hapus Sekarang",
      cancelButtonText: "Batal",
    }).then(async (res) => {
      if (res.isConfirmed) {
        const filtered = categories.filter((item) => item.id !== id);
        try {
          await updateConfig({
            ...config,
            skillsCategories: filtered,
          });

          Swal.fire({
            title: "Data Dihapus",
            text: "Kategori keahlian berhasil dihapus.",
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

  // Excel Templates & Live Data Export
  const SKILLS_TEMPLATE_HEADERS = ["Nama_Kategori", "Deskripsi_Kategori", "Daftar_Keahlian"];
  const SKILLS_SAMPLE_ROWS = [
    {
      Nama_Kategori: "Rekayasa Frontend",
      Deskripsi_Kategori: "Teknologi utama untuk membangun antarmuka pengguna yang cepat dan responsif.",
      Daftar_Keahlian: "React.js, TypeScript, Tailwind CSS, Vite, HTML5, CSS3",
    },
    {
      Nama_Kategori: "Backend & Basis Data",
      Deskripsi_Kategori: "Pengelolaan data, layanan cloud, dan arsitektur integrasi API.",
      Daftar_Keahlian: "Supabase, PostgreSQL, Node.js, REST API, WebSockets",
    },
  ];

  const handleDownloadExcel = () => {
    const exportRows = (categories && categories.length > 0)
      ? categories.map((c, idx) => ({
          No: idx + 1,
          Nama_Kategori: c.category || "",
          Deskripsi_Kategori: c.description || "",
          Daftar_Keahlian: Array.isArray(c.skills) ? c.skills.join(", ") : (c.skills || ""),
        }))
      : SKILLS_SAMPLE_ROWS;

    downloadExcelTemplate("template_matriks_keahlian", SKILLS_TEMPLATE_HEADERS, exportRows, accent?.hex || "#10b981");
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
          entityName: "Keahlian",
        });
        return;
      }

      const updatedList = [...categories];
      let updatedCount = 0;
      let addedCount = 0;
      const errors = [];

      parsed.data.forEach((row) => {
        const rowNumStr = row["No"] || row["no"] || row._rowNumber;
        const rowNo = parseInt(rowNumStr, 10);
        const category = (row["Nama_Kategori"] || row["Category"] || row["kategori"] || "").trim();
        const description = (row["Deskripsi_Kategori"] || row["Description"] || "").trim();
        const skillsRaw = row["Daftar_Keahlian"] || row["Skills"] || "";

        if (!category || category.toLowerCase() === "nama_kategori") {
          if (category.toLowerCase() === "nama_kategori") return;
          errors.push({ row: rowNumStr, reason: "Kolom 'Nama_Kategori' tidak boleh kosong." });
          return;
        }

        const skills = skillsRaw ? String(skillsRaw).split(/[,|;]/).map((s) => s.trim()).filter(Boolean) : [];

        const existingIdx = (!isNaN(rowNo) && rowNo >= 1 && rowNo <= categories.length)
          ? rowNo - 1
          : updatedList.findIndex((item) => item.category?.toLowerCase() === category.toLowerCase());

        const payload = {
          category,
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
            id: `cat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            ...payload,
          });
          addedCount++;
        }
      });

      if (updatedCount > 0 || addedCount > 0) {
        await updateConfig({
          ...config,
          skillsCategories: updatedList,
        });
      }

      showImportResultAlert({
        addedCount,
        updatedCount,
        errors,
        entityName: "Keahlian",
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

  // Filter & Pagination
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;
    const q = searchTerm.toLowerCase().trim();
    return categories.filter((cat) =>
      cat.category?.toLowerCase().includes(q) ||
      cat.description?.toLowerCase().includes(q) ||
      (Array.isArray(cat.skills) && cat.skills.some((s) => s.toLowerCase().includes(q)))
    );
  }, [categories, searchTerm]);

  const totalPages = Math.ceil(filteredCategories.length / pageSize) || 1;
  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCategories.slice(start, start + pageSize);
  }, [filteredCategories, currentPage, pageSize]);

  // Quick stats
  const totalSkillsCount = categories.reduce((acc, cat) => acc + (cat.skills?.length || 0), 0);

  return (
    <div className="space-y-6 w-full pb-10">
      {/* Page Header with Compact Mini Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${accent.bgSubtle} ${accent.text}`}>
              <Zap className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Matriks Kompetensi & Keahlian
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Kelola bidang keahlian teknis dan daftar teknologi. Data langsung tersimpan otomatis ke sistem.
          </p>
        </div>

        {/* Compact Mini Badges */}
        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-400">
            <span>Kategori:</span>
            <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">{categories.length}</strong>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-400">
            <span>Keahlian:</span>
            <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">{totalSkillsCount}</strong>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Auto-Sync
          </span>
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
          searchPlaceholder="Cari nama kategori, keahlian, atau deskripsi..."
          totalCount={categories.length}
          filteredCount={filteredCategories.length}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onAddNew={handleOpenAdd}
          addLabel="Tambah Kategori"
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
      {filteredCategories.length === 0 ? (
        <div className={`p-12 text-center bg-white dark:bg-zinc-900/40 ${cardRadiusClass} border border-zinc-200 dark:border-zinc-800 space-y-3`}>
          <Zap className="w-12 h-12 text-zinc-400 mx-auto opacity-30" />
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            {searchTerm ? "Tidak ada hasil pencarian" : "Belum Ada Kategori Keahlian"}
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            {searchTerm
              ? `Tidak ditemukan kategori yang cocok dengan kata kunci "${searchTerm}".`
              : "Kelompokkan keahlian Anda ke dalam beberapa kategori seperti Frontend, Backend, Tools, dll."}
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
              <span>Tambah Kategori Pertama</span>
            </button>
          )}
        </div>
      ) : viewMode === "table" ? (
        /* TABLE VIEW */
        <div className={`bg-white dark:bg-zinc-900/70 ${cardRadiusClass} border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-2xs`}>
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/75 dark:bg-zinc-950/50 text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3.5 w-12 text-center">No</th>
                  <th className="py-3 px-4 min-w-[180px]">Kategori</th>
                  <th className="py-3 px-4 min-w-[220px]">Deskripsi</th>
                  <th className="py-3 px-3.5 min-w-[90px] text-center">Jumlah</th>
                  <th className="py-3 px-4 min-w-[260px]">Daftar Tag Keahlian</th>
                  <th className="py-3 px-4 text-right min-w-[100px]">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {paginatedCategories.map((cat, idx) => {
                  const globalIdx = (currentPage - 1) * pageSize + idx + 1;
                  return (
                    <tr
                      key={cat.id || idx}
                      className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors group"
                    >
                      <td className="py-3 px-3.5 text-center font-mono text-zinc-400">
                        {globalIdx}
                      </td>
                      <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-100">
                        <div className="truncate max-w-[180px]" title={cat.category}>
                          {cat.category}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-zinc-500">
                        <div className="truncate max-w-[240px]" title={cat.description}>
                          {cat.description || "—"}
                        </div>
                      </td>
                      <td className="py-3 px-3.5 text-center font-mono">
                        <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-semibold text-[11px]">
                          {cat.skills?.length || 0}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {cat.skills && cat.skills.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-[280px]">
                            {cat.skills.slice(0, 4).map((s, sIdx) => (
                              <span
                                key={sIdx}
                                className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-mono"
                              >
                                {s}
                              </span>
                            ))}
                            {cat.skills.length > 4 && (
                              <span className="text-[10px] text-zinc-400 font-mono">
                                +{cat.skills.length - 4}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-zinc-400 text-[11px]">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(cat)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            title="Edit Data"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(cat.id, cat.category)}
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
              totalItems={filteredCategories.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      ) : (
        /* GRID VIEW */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedCategories.map((cat) => (
              <div
                key={cat.id}
                className={`p-5 ${cardRadiusClass} bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-3 flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-all`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {cat.category}
                      </h3>
                      {cat.description && (
                        <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">
                          {cat.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(cat)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id, cat.category)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {cat.skills && cat.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {cat.skills.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 text-xs rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200/60 dark:border-zinc-700/60"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <AdminPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredCategories.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* POPUP MODAL FORM FOR ADD / EDIT */}
      <AdminModal
        isOpen={Boolean(editingId)}
        onClose={() => setEditingId(null)}
        title={editingId === "new" ? "Tambah Kategori Keahlian Baru" : "Edit Kategori Keahlian"}
        subtitle="Data akan langsung tersimpan secara otomatis setelah Anda mengklik simpan."
        icon={Zap}
        maxWidth="max-w-lg"
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
              form="catForm"
              className={`px-5 py-2 ${buttonRadiusClass} ${accent.bg} text-white text-xs font-semibold hover:opacity-90 transition-all shadow-sm active:scale-95`}
            >
              Simpan Kategori
            </button>
          </>
        }
      >
        <form id="catForm" onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Nama Kategori <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="cth. Rekayasa Frontend, Cloud & DevOps, dll"
              required
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Deskripsi Singkat Bidang Keahlian
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="cth. Spesialisasi antarmuka performa tinggi dan rekayasa komponen"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Daftar Tag Keahlian (pisahkan dengan koma atau titik koma)
            </label>
            <textarea
              rows={4}
              value={formData.skillsInput}
              onChange={(e) => setFormData({ ...formData, skillsInput: e.target.value })}
              placeholder="React, Next.js, TypeScript, Tailwind CSS, Vite, Redux..."
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none resize-none"
            />
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
