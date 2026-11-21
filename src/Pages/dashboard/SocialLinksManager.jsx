import React, { useState, useMemo } from "react";
import { Plus, Trash2, Edit2, Share2, Globe, ExternalLink, Download, Upload, CheckCircle2 } from "lucide-react";
import { usePortfolio } from "../../context/PortfolioContext";
import IconPickerModal, { AVAILABLE_ICONS } from "../../components/IconPickerModal";
import { downloadExcelTemplate, parseUploadedSpreadsheet, showImportResultAlert } from "../../utils/csvHelper";
import AdminModal from "../../components/admin/AdminModal";
import AdminDataToolbar from "../../components/admin/AdminDataToolbar";
import AdminPagination from "../../components/admin/AdminPagination";
import Swal from "sweetalert2";

export default function SocialLinksManager() {
  const { config, updateConfig, accent, cardRadiusClass, buttonRadiusClass } = usePortfolio();
  const links = config?.socialLinksList || [];

  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("table");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editingId, setEditingId] = useState(null);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);

  const [form, setForm] = useState({
    platform: "",
    handle: "",
    url: "",
    description: "",
    icon: "Globe",
  });

  const handleStartAdd = () => {
    setEditingId("new");
    setForm({ platform: "", handle: "", url: "", description: "", icon: "Globe" });
  };

  const handleStartEdit = (item) => {
    setEditingId(item.id);
    setForm({
      platform: item.platform || "",
      handle: item.handle || "",
      url: item.url || "",
      description: item.description || "",
      icon: item.icon || "Globe",
    });
  };

  // Instant Auto-Save on Add / Edit
  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!form.platform?.trim() || !form.url?.trim()) {
      Swal.fire({
        title: "Kolom Belum Lengkap",
        text: "Nama Platform dan URL tautan wajib diisi.",
        icon: "warning",
      });
      return;
    }

    const payload = {
      platform: form.platform.trim(),
      handle: form.handle.trim(),
      url: form.url.trim(),
      description: form.description.trim(),
      icon: form.icon || "Globe",
    };

    let updated = [];
    if (editingId === "new") {
      const newItem = {
        id: "soc-" + Date.now(),
        ...payload,
      };
      updated = [newItem, ...links];
    } else {
      updated = links.map((s) => (s.id === editingId ? { ...s, ...payload } : s));
    }

    try {
      await updateConfig({
        ...config,
        socialLinksList: updated,
      });

      setEditingId(null);

      Swal.fire({
        title: "Berhasil Disimpan",
        text: "Tautan sosial telah tersimpan otomatis.",
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
  const handleDelete = (id, platform) => {
    Swal.fire({
      title: "Hapus Tautan Sosial?",
      text: platform ? `Anda yakin ingin menghapus tautan ke "${platform}"? Data akan langsung terhapus.` : "Data akan langsung terhapus.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#71717a",
      confirmButtonText: "Ya, Hapus Sekarang",
      cancelButtonText: "Batal",
    }).then(async (res) => {
      if (res.isConfirmed) {
        const filtered = links.filter((s) => s.id !== id);
        try {
          await updateConfig({
            ...config,
            socialLinksList: filtered,
          });

          Swal.fire({
            title: "Data Dihapus",
            text: "Tautan sosial berhasil dihapus.",
            icon: "success",
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 1500,
          });
        } catch (err) {
          Swal.fire({
            title: "Gagal Menghapus",
            text: err.message || "Gagal menghapus data.",
            icon: "error",
          });
        }
      }
    });
  };

  // Excel Templates & Live Data Export
  const SOCIAL_TEMPLATE_HEADERS = ["Nama_Platform", "Handle_Username", "Tautan_URL", "Deskripsi", "Nama_Ikon"];
  const SOCIAL_SAMPLE_ROWS = [
    {
      Nama_Platform: "GitHub",
      Handle_Username: "@nizamsetiawan",
      Tautan_URL: "https://github.com/nizamsetiawan",
      Deskripsi: "Repositori proyek open source dan kontribusi kode.",
      Nama_Ikon: "Github",
    },
    {
      Nama_Platform: "LinkedIn",
      Handle_Username: "Muhammad Nizam Setiawan",
      Tautan_URL: "https://linkedin.com/in/nizamsetiawan",
      Deskripsi: "Jaringan profesional dan pembaruan karir industri.",
      Nama_Ikon: "Linkedin",
    },
  ];

  const handleDownloadExcel = () => {
    const exportRows = (links && links.length > 0)
      ? links.map((s, idx) => ({
          No: idx + 1,
          Nama_Platform: s.platform || "",
          Handle_Username: s.handle || "",
          Tautan_URL: s.url || "",
          Deskripsi: s.description || "",
          Nama_Ikon: s.icon || "Globe",
        }))
      : SOCIAL_SAMPLE_ROWS;

    downloadExcelTemplate("template_tautan_sosial", SOCIAL_TEMPLATE_HEADERS, exportRows, accent?.hex || "#10b981");
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
          entityName: "Tautan Sosial",
        });
        return;
      }

      const updatedList = [...links];
      let updatedCount = 0;
      let addedCount = 0;
      const errors = [];

      parsed.data.forEach((row) => {
        const rowNumStr = row["No"] || row["no"] || row._rowNumber;
        const rowNo = parseInt(rowNumStr, 10);
        const platform = (row["Nama_Platform"] || row["Platform"] || row["platform"] || "").trim();
        const handle = (row["Handle_Username"] || row["Handle"] || row["username"] || "").trim();
        const url = (row["Tautan_URL"] || row["URL"] || row["Url"] || row["tautan"] || "").trim();
        const description = (row["Deskripsi"] || row["Description"] || "").trim();
        const icon = (row["Nama_Ikon"] || row["Icon"] || "Globe").trim();

        if (!platform || platform.toLowerCase() === "nama_platform") {
          if (platform.toLowerCase() === "nama_platform") return;
          errors.push({ row: rowNumStr, reason: "Kolom 'Nama_Platform' tidak boleh kosong." });
          return;
        }
        if (!url || url.toLowerCase() === "tautan_url") {
          if (url.toLowerCase() === "tautan_url") return;
          errors.push({ row: rowNumStr, reason: "Kolom 'Tautan_URL' tidak boleh kosong." });
          return;
        }

        const existingIdx = (!isNaN(rowNo) && rowNo >= 1 && rowNo <= links.length)
          ? rowNo - 1
          : updatedList.findIndex((item) => item.platform?.toLowerCase() === platform.toLowerCase());

        const payload = {
          platform,
          handle,
          url,
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
            id: "soc-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
            ...payload,
          });
          addedCount++;
        }
      });

      if (updatedCount > 0 || addedCount > 0) {
        await updateConfig({
          ...config,
          socialLinksList: updatedList,
        });
      }

      showImportResultAlert({
        addedCount,
        updatedCount,
        errors,
        entityName: "Tautan Sosial",
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
  const filteredLinks = useMemo(() => {
    if (!searchTerm.trim()) return links;
    const q = searchTerm.toLowerCase().trim();
    return links.filter((item) =>
      item.platform?.toLowerCase().includes(q) ||
      item.handle?.toLowerCase().includes(q) ||
      item.url?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q)
    );
  }, [links, searchTerm]);

  const totalPages = Math.ceil(filteredLinks.length / pageSize) || 1;
  const paginatedLinks = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLinks.slice(start, start + pageSize);
  }, [filteredLinks, currentPage, pageSize]);

  const renderIcon = (iconName) => {
    const IconComponent = AVAILABLE_ICONS[iconName] || Globe;
    return <IconComponent className="w-5 h-5" />;
  };

  return (
    <div className="space-y-6 max-w-6xl pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${accent.bgSubtle} ${accent.text}`}>
              <Share2 className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Tautan Sosial & Saluran Komunikasi
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Kelola tautan media sosial dan profil developer. Perubahan data tersimpan otomatis secara realtime.
          </p>
        </div>
      </div>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className={`p-4 bg-white dark:bg-zinc-900/60 ${cardRadiusClass} border border-zinc-200 dark:border-zinc-800 shadow-2xs`}>
          <div className="flex items-center justify-between text-zinc-500 text-xs">
            <span>Total Saluran</span>
            <Share2 className="w-4 h-4 text-zinc-400" />
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
            {links.length}
          </p>
        </div>

        <div className={`p-4 bg-white dark:bg-zinc-900/60 ${cardRadiusClass} border border-zinc-200 dark:border-zinc-800 shadow-2xs`}>
          <div className="flex items-center justify-between text-zinc-500 text-xs">
            <span>Tautan Terverifikasi</span>
            <ExternalLink className="w-4 h-4 text-zinc-400" />
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
            {links.filter((l) => l.url?.startsWith("http")).length}
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
          searchPlaceholder="Cari platform, username, atau URL..."
          totalCount={links.length}
          filteredCount={filteredLinks.length}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onAddNew={handleStartAdd}
          addLabel="Tambah Tautan"
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
      {filteredLinks.length === 0 ? (
        <div className={`p-12 text-center bg-white dark:bg-zinc-900/40 ${cardRadiusClass} border border-zinc-200 dark:border-zinc-800 space-y-3`}>
          <Share2 className="w-12 h-12 text-zinc-400 mx-auto opacity-30" />
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            {searchTerm ? "Tidak ada hasil pencarian" : "Belum Ada Tautan Sosial"}
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            {searchTerm
              ? `Tidak ditemukan tautan yang cocok dengan kata kunci "${searchTerm}".`
              : "Hubungkan profil Anda dengan akun media sosial profesional seperti GitHub, LinkedIn, Twitter, dll."}
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
              <span>Tambah Tautan Pertama</span>
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
                  <th className="py-3 px-3.5 w-14 text-center">Ikon</th>
                  <th className="py-3 px-4 min-w-[160px]">Platform</th>
                  <th className="py-3 px-4 min-w-[150px]">Username / Handle</th>
                  <th className="py-3 px-4 min-w-[200px]">URL Tautan</th>
                  <th className="py-3 px-4 min-w-[200px]">Deskripsi</th>
                  <th className="py-3 px-4 text-right min-w-[100px]">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {paginatedLinks.map((item, idx) => {
                  const globalIdx = (currentPage - 1) * pageSize + idx + 1;
                  return (
                    <tr
                      key={item.id || idx}
                      className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors group"
                    >
                      <td className="py-3 px-3.5 text-center font-mono text-zinc-400">
                        {globalIdx}
                      </td>
                      <td className="py-3 px-3.5 text-center">
                        <div className={`w-8 h-8 mx-auto rounded-lg ${accent.bgSubtle} ${accent.text} flex items-center justify-center`}>
                          {renderIcon(item.icon)}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-100">
                        <div className="truncate max-w-[160px]" title={item.platform}>
                          {item.platform}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400 font-mono">
                        <div className="truncate max-w-[150px]" title={item.handle}>
                          {item.handle || "—"}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-zinc-500 font-mono">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="truncate max-w-[200px] inline-flex items-center gap-1 hover:underline hover:text-emerald-600 dark:hover:text-emerald-400"
                          title={item.url}
                        >
                          <span className="truncate">{item.url}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </td>
                      <td className="py-3 px-4 text-zinc-500">
                        <div className="truncate max-w-[220px]" title={item.description}>
                          {item.description || "—"}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(item)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            title="Edit Data"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id, item.platform)}
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
              totalItems={filteredLinks.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      ) : (
        /* GRID VIEW */
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {paginatedLinks.map((item) => (
              <div
                key={item.id}
                className={`p-5 ${cardRadiusClass} bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-3 flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-all`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className={`p-2.5 rounded-xl ${accent.bgSubtle} ${accent.text}`}>
                      {renderIcon(item.icon)}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStartEdit(item)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.platform)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {item.platform}
                    </h3>
                    {item.handle && (
                      <p className="text-xs text-zinc-500 font-mono mt-0.5">
                        {item.handle}
                      </p>
                    )}
                    {item.description && (
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 truncate max-w-full"
                  >
                    <span className="truncate">{item.url}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          <AdminPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredLinks.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* POPUP MODAL FORM FOR ADD / EDIT */}
      <AdminModal
        isOpen={Boolean(editingId)}
        onClose={() => setEditingId(null)}
        title={editingId === "new" ? "Tambah Tautan Sosial Baru" : "Edit Tautan Sosial"}
        subtitle="Data akan langsung tersimpan secara otomatis setelah Anda mengklik simpan."
        icon={Share2}
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
              form="socForm"
              className={`px-5 py-2 ${buttonRadiusClass} ${accent.bg} text-white text-xs font-semibold hover:opacity-90 transition-all shadow-sm active:scale-95`}
            >
              Simpan Tautan
            </button>
          </>
        }
      >
        <form id="socForm" onSubmit={handleSaveItem} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Nama Platform <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={form.platform}
                onChange={(e) => setForm({ ...form, platform: e.target.value })}
                placeholder="cth. GitHub, LinkedIn, X"
                required
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Username / Handle
              </label>
              <input
                type="text"
                value={form.handle}
                onChange={(e) => setForm({ ...form, handle: e.target.value })}
                placeholder="cth. @nizamsetiawan"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Tautan URL <span className="text-rose-500">*</span>
            </label>
            <input
              type="url"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="https://..."
              required
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
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
              Deskripsi Singkat
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="cth. Profil repositori kode dan proyek open-source..."
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
