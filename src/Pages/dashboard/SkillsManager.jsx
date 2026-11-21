import React, { useState } from "react";
import { usePortfolio } from "../../context/PortfolioContext";
import { Plus, Trash2, Pencil, Check, X, Zap, Download, Upload } from "lucide-react";
import { downloadExcelTemplate, parseUploadedSpreadsheet, showImportResultAlert } from "../../utils/csvHelper";
import Swal from "sweetalert2";

export default function SkillsManager() {
  const { config, updateConfig, accent } = usePortfolio();
  const categories = config?.skillsCategories || [];

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
      skillsInput: (cat.skills || []).join(", "),
    });
  };

  const handleSave = (e) => {
    e.preventDefault();

    if (!formData.category) {
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

    if (editingId === "new") {
      const newEntry = {
        id: `cat-${Date.now()}`,
        category: formData.category,
        description: formData.description,
        skills,
      };
      updatedList = [...categories, newEntry];
    } else {
      updatedList = categories.map((item) =>
        item.id === editingId
          ? {
              ...item,
              category: formData.category,
              description: formData.description,
              skills,
            }
          : item
      );
    }

    updateConfig({
      ...config,
      skillsCategories: updatedList,
    });

    setEditingId(null);

    Swal.fire({
      title: "Kategori Keahlian Disimpan!",
      text: "Daftar kompetensi telah diperbarui.",
      icon: "success",
      confirmButtonColor: "#10b981",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const handleDelete = (id, category) => {
    Swal.fire({
      title: "Hapus Kategori Keahlian?",
      text: `Yakin ingin menghapus kategori "${category}" beserta seluruh tag teknologinya?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    }).then((res) => {
      if (res.isConfirmed) {
        const filtered = categories.filter((item) => item.id !== id);
        updateConfig({
          ...config,
          skillsCategories: filtered,
        });
      }
    });
  };

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
          errors: [{ row: 1, reason: "Berkas kosong atau tidak memiliki baris data." }],
          entityName: "Kategori Keahlian",
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

        if (!category) {
          errors.push({ row: rowNumStr, reason: "Kolom 'Nama_Kategori' tidak boleh kosong." });
          return;
        }

        const skills = skillsRaw
          ? String(skillsRaw).split(/[,|;]/).map((s) => s.trim()).filter(Boolean)
          : [];

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
        updateConfig({
          ...config,
          skillsCategories: updatedList,
        });
      }

      showImportResultAlert({
        addedCount,
        updatedCount,
        errors,
        entityName: "Kategori Keahlian",
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${accent.bgSubtle} ${accent.text}`}>
              <Zap className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Matriks Keahlian & Spesialisasi
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Kelola rumpun keahlian teknis, bahasa pemrograman, framework, dan peralatan kerja.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Download Template Excel */}
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
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl ${accent.bg} text-white font-semibold text-xs sm:text-sm hover:opacity-90 transition-all shadow-sm active:scale-95`}
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kategori</span>
          </button>
        </div>
      </div>

      {/* Editor Modal */}
      {editingId && (
        <form
          onSubmit={handleSave}
          className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 shadow-xl space-y-4 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Zap className={`w-4 h-4 ${accent.text}`} />
              {editingId === "new" ? "Tambah Kategori Keahlian Baru" : "Edit Kategori Keahlian"}
            </h2>
            <button
              type="button"
              onClick={() => setEditingId(null)}
              className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Nama Kategori <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="cth. Rekayasa Frontend"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Deskripsi Singkat Kategori
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="cth. Teknologi utama untuk membangun antarmuka pengguna responsif."
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Daftar Tag Keahlian (Pisahkan dengan tanda koma)
              </label>
              <input
                type="text"
                value={formData.skillsInput}
                onChange={(e) => setFormData({ ...formData, skillsInput: e.target.value })}
                placeholder="cth. React.js, TypeScript, Tailwind CSS, Vite"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
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
              Simpan Kategori
            </button>
          </div>
        </form>
      )}

      {/* Grid of Categories */}
      {categories.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-zinc-900/40 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
          <Zap className="w-10 h-10 text-zinc-400 mx-auto opacity-40" />
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Belum Ada Kategori Keahlian
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Mulai tambahkan rumpun keahlian Anda secara manual atau unggah berkas CSV secara massal.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 shadow-sm flex flex-col justify-between space-y-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                      {cat.category}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      {cat.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      title="Edit Kategori"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id, cat.category)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      title="Hapus Kategori"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {cat.skills &&
                    cat.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                      >
                        {skill}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
