import React, { useState, useMemo } from "react";
import { Plus, Trash2, Edit2, Layout, Download, Upload, CheckCircle2, Palette } from "lucide-react";
import { usePortfolio } from "../../context/PortfolioContext";
import IconPickerModal, { AVAILABLE_ICONS } from "../../components/IconPickerModal";
import { downloadExcelTemplate, parseUploadedSpreadsheet, showImportResultAlert } from "../../utils/csvHelper";
import AdminModal from "../../components/admin/AdminModal";
import AdminDataToolbar from "../../components/admin/AdminDataToolbar";
import AdminPagination from "../../components/admin/AdminPagination";
import Swal from "sweetalert2";

export default function ServicesManager() {
  const { config, updateConfig, accent, cardRadiusClass, buttonRadiusClass } = usePortfolio();
  const services = config?.services || [];

  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("table");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editingId, setEditingId] = useState(null);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    icon: "Layout",
  });

  const handleStartAdd = () => {
    setEditingId("new");
    setForm({ title: "", description: "", icon: "Layout" });
  };

  const handleStartEdit = (srv) => {
    setEditingId(srv.id);
    setForm({
      title: srv.title || "",
      description: srv.description || "",
      icon: srv.icon || "Layout",
    });
  };

  // Instant Auto-Save on Add / Edit
  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!form.title?.trim()) {
      Swal.fire({
        title: "Kolom Belum Lengkap",
        text: "Judul Layanan wajib diisi.",
        icon: "warning",
      });
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      icon: form.icon || "Layout",
    };

    let updated = [];
    if (editingId === "new") {
      const newSrv = {
        id: "srv-" + Date.now(),
        ...payload,
      };
      updated = [newSrv, ...services];
    } else {
      updated = services.map((s) => (s.id === editingId ? { ...s, ...payload } : s));
    }

    try {
      await updateConfig({
        ...config,
        services: updated,
      });

      setEditingId(null);

      Swal.fire({
        title: "Berhasil Disimpan",
        text: "Layanan berhasil disimpan otomatis.",
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
      title: "Hapus Layanan Ini?",
      text: title ? `Anda yakin ingin menghapus layanan "${title}"? Data akan langsung terhapus dari sistem.` : "Data akan langsung terhapus dari sistem.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#71717a",
      confirmButtonText: "Ya, Hapus Sekarang",
      cancelButtonText: "Batal",
    }).then(async (res) => {
      if (res.isConfirmed) {
        const filtered = services.filter((s) => s.id !== id);
        try {
          await updateConfig({
            ...config,
            services: filtered,
          });

          Swal.fire({
            title: "Data Dihapus",
            text: "Layanan berhasil dihapus.",
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
  const SERVICES_TEMPLATE_HEADERS = ["Judul_Layanan", "Deskripsi", "Nama_Ikon"];
  const SERVICES_SAMPLE_ROWS = [
    {
      Judul_Layanan: "Pengembangan Frontend Modern",
      Deskripsi: "Membangun antarmuka web interaktif, performa tinggi, dan ramah SEO dengan React & Vite.",
      Nama_Ikon: "Layout",
    },
    {
      Judul_Layanan: "Desain Sistem & Integrasi API",
      Deskripsi: "Arsitektur database Supabase, otentikasi role-based, dan webhook sinkronisasi otomatis.",
      Nama_Ikon: "Database",
    },
  ];

  const handleDownloadExcel = () => {
    const exportRows = (services && services.length > 0)
      ? services.map((s, idx) => ({
          No: idx + 1,
          Judul_Layanan: s.title || "",
          Deskripsi: s.description || "",
          Nama_Ikon: s.icon || "Layout",
        }))
      : SERVICES_SAMPLE_ROWS;

    downloadExcelTemplate("template_layanan_solusi", SERVICES_TEMPLATE_HEADERS, exportRows, accent?.hex || "#10b981");
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
          entityName: "Layanan",
        });
        return;
      }

      const updatedList = [...services];
      let updatedCount = 0;
      let addedCount = 0;
      const errors = [];

      parsed.data.forEach((row) => {
        const rowNumStr = row["No"] || row["no"] || row._rowNumber;
        const rowNo = parseInt(rowNumStr, 10);
        const title = (row["Judul_Layanan"] || row["Title"] || row["layanan"] || "").trim();
        const description = (row["Deskripsi"] || row["Description"] || "").trim();
        const icon = (row["Nama_Ikon"] || row["Icon"] || "Layout").trim();

        if (!title || title.toLowerCase() === "judul_layanan") {
          if (title.toLowerCase() === "judul_layanan") return;
          errors.push({ row: rowNumStr, reason: "Kolom 'Judul_Layanan' tidak boleh kosong." });
          return;
        }

        const existingIdx = (!isNaN(rowNo) && rowNo >= 1 && rowNo <= services.length)
          ? rowNo - 1
          : updatedList.findIndex((item) => item.title?.toLowerCase() === title.toLowerCase());

        const payload = {
          title,
          description,
          icon,
        };

        if (existingIdx >= 0 && existingIdx < updatedList.length) {
          updatedList[existingIdx] = {
            ...updatedList[existingIdx],
            ...payload,
          };
          updatedCount++;
        } else {
          updatedList.push({
            id: "srv-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
            ...payload,
          });
          addedCount++;
        }
      });

      if (updatedCount > 0 || addedCount > 0) {
        await updateConfig({
          ...config,
          services: updatedList,
        });
      }

      showImportResultAlert({
        addedCount,
        updatedCount,
        errors,
        entityName: "Layanan",
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

  // Filter & Pagination
  const filteredServices = useMemo(() => {
    if (!searchTerm.trim()) return services;
    const q = searchTerm.toLowerCase().trim();
    return services.filter((s) =>
      s.title?.toLowerCase().includes(q) ||
      s.description?.toLowerCase().includes(q) ||
      s.icon?.toLowerCase().includes(q)
    );
  }, [services, searchTerm]);

  const totalPages = Math.ceil(filteredServices.length / pageSize) || 1;
  const paginatedServices = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredServices.slice(start, start + pageSize);
  }, [filteredServices, currentPage, pageSize]);

  const renderIcon = (iconName) => {
    const IconComponent = AVAILABLE_ICONS[iconName] || Layout;
    return <IconComponent className="w-5 h-5" />;
  };

  return (
    <div className="space-y-6 max-w-6xl pb-10">
      {/* Page Header with Compact Mini Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${accent.bgSubtle} ${accent.text}`}>
              <Layout className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Layanan &amp; Penawaran Solusi
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Kelola spesialisasi jasa yang Anda sediakan. Perubahan langsung tersimpan otomatis.
          </p>
        </div>

        {/* Compact Mini Badges */}
        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-400">
            <span>Total:</span>
            <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">{services.length}</strong>
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
          searchPlaceholder="Cari judul layanan, deskripsi, atau ikon..."
          totalCount={services.length}
          filteredCount={filteredServices.length}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onAddNew={handleStartAdd}
          addLabel="Tambah Layanan"
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
      {filteredServices.length === 0 ? (
        <div className={`p-12 text-center bg-white dark:bg-zinc-900/40 ${cardRadiusClass} border border-zinc-200 dark:border-zinc-800 space-y-3`}>
          <Layout className="w-12 h-12 text-zinc-400 mx-auto opacity-30" />
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            {searchTerm ? "Tidak ada hasil pencarian" : "Belum Ada Layanan Ditambahkan"}
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            {searchTerm
              ? `Tidak ditemukan layanan yang cocok dengan kata kunci "${searchTerm}".`
              : "Tambahkan paket penawaran dan spesialisasi jasa Anda ke profil."}
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
              onClick={handleStartAdd}
              className={`inline-flex items-center gap-1.5 px-4 py-2 ${buttonRadiusClass} ${accent.bg} text-white text-xs font-semibold hover:opacity-90 transition-all`}
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Layanan Pertama</span>
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
                  <th className="py-3 px-3.5 w-16 text-center">Ikon</th>
                  <th className="py-3 px-4 min-w-[220px]">Judul Layanan</th>
                  <th className="py-3 px-4 min-w-[280px]">Deskripsi Solusi</th>
                  <th className="py-3 px-4 text-right min-w-[100px]">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {paginatedServices.map((srv, idx) => {
                  const globalIdx = (currentPage - 1) * pageSize + idx + 1;
                  return (
                    <tr
                      key={srv.id || idx}
                      className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors group"
                    >
                      <td className="py-3 px-3.5 text-center font-mono text-zinc-400">
                        {globalIdx}
                      </td>
                      <td className="py-3 px-3.5 text-center">
                        <div className={`w-8 h-8 mx-auto rounded-lg ${accent.bgSubtle} ${accent.text} flex items-center justify-center`}>
                          {renderIcon(srv.icon)}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-100">
                        <div className="truncate max-w-[220px]" title={srv.title}>
                          {srv.title}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-zinc-500">
                        <div className="truncate max-w-[320px]" title={srv.description}>
                          {srv.description || "—"}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(srv)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            title="Edit Data"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(srv.id, srv.title)}
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
              totalItems={filteredServices.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      ) : (
        /* GRID VIEW */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {paginatedServices.map((srv) => (
              <div
                key={srv.id}
                className={`p-5 ${cardRadiusClass} bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-3 flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-all`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className={`p-2.5 rounded-xl ${accent.bgSubtle} ${accent.text}`}>
                      {renderIcon(srv.icon)}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStartEdit(srv)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(srv.id, srv.title)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {srv.title}
                    </h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-3 leading-relaxed">
                      {srv.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <AdminPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredServices.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* POPUP MODAL FORM FOR ADD / EDIT */}
      <AdminModal
        isOpen={Boolean(editingId)}
        onClose={() => setEditingId(null)}
        title={editingId === "new" ? "Tambah Layanan Baru" : "Edit Layanan"}
        subtitle="Data akan langsung tersimpan secara otomatis setelah Anda mengklik simpan."
        icon={Layout}
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
              form="srvForm"
              className={`px-5 py-2 ${buttonRadiusClass} ${accent.bg} text-white text-xs font-semibold hover:opacity-90 transition-all shadow-sm active:scale-95`}
            >
              Simpan Layanan
            </button>
          </>
        }
      >
        <form id="srvForm" onSubmit={handleSaveItem} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Judul Layanan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="cth. Pengembangan Web Fullstack"
              required
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Pilihan Ikon
            </label>
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${accent.bgSubtle} ${accent.text} border border-zinc-200 dark:border-zinc-800`}>
                {renderIcon(form.icon)}
              </div>
              <button
                type="button"
                onClick={() => setIconPickerOpen(true)}
                className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors"
              >
                Ubah Ikon ({form.icon})
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Deskripsi Solusi
            </label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Jelaskan ruang lingkup pekerjaan, teknologi, dan manfaat yang didapatkan klien..."
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none resize-none"
            />
          </div>
        </form>
      </AdminModal>

      {/* ICON PICKER MODAL */}
      <IconPickerModal
        isOpen={iconPickerOpen}
        onClose={() => setIconPickerOpen(false)}
        selectedIcon={form.icon}
        onSelect={(iconKey) => {
          setForm({ ...form, icon: iconKey });
          setIconPickerOpen(false);
        }}
      />
    </div>
  );
}
