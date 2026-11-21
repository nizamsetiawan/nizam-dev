import React, { useState } from "react";
import { Plus, Trash2, Edit2, Save, Share2, Globe, ExternalLink, Download, Upload } from "lucide-react";
import { usePortfolio } from "../../context/PortfolioContext";
import IconPickerModal, { AVAILABLE_ICONS } from "../../components/IconPickerModal";
import { downloadExcelTemplate, downloadCsvTemplate, parseUploadedSpreadsheet, showImportResultAlert } from "../../utils/csvHelper";
import Swal from "sweetalert2";

export default function SocialLinksManager() {
  const { config, updateConfig, accent } = usePortfolio();
  const [links, setLinks] = useState(config?.socialLinksList || []);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
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
      platform: item.platform,
      handle: item.handle,
      url: item.url,
      description: item.description,
      icon: item.icon || "Globe",
    });
  };

  const handleSaveItem = (e) => {
    e.preventDefault();
    if (!form.platform || !form.url) return;

    let updated = [];
    if (editingId === "new") {
      const newItem = {
        id: "soc-" + Date.now(),
        ...form,
      };
      updated = [...links, newItem];
    } else {
      updated = links.map((s) => (s.id === editingId ? { ...s, ...form } : s));
    }

    setLinks(updated);
    setEditingId(null);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Hapus Tautan Sosial?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    }).then((res) => {
      if (res.isConfirmed) {
        setLinks((prev) => prev.filter((s) => s.id !== id));
      }
    });
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await updateConfig({
        ...config,
        socialLinksList: links,
      });

      Swal.fire({
        title: "Tautan Sosial Disimpan!",
        text: "Daftar saluran komunikasi berhasil disimpan.",
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

  const SOCIAL_TEMPLATE_HEADERS = ["Nama_Platform", "Handle_Username", "Tautan_URL", "Deskripsi", "Nama_Ikon"];
  const SOCIAL_SAMPLE_ROWS = [
    {
      Nama_Platform: "GitHub",
      Handle_Username: "@nizamsetiawan",
      Tautan_URL: "https://github.com/nizamsetiawan",
      Deskripsi: "Repositori kode open-source dan kontribusi publik.",
      Nama_Ikon: "Github",
    },
    {
      Nama_Platform: "LinkedIn",
      Handle_Username: "Nizam Setiawan",
      Tautan_URL: "https://linkedin.com",
      Deskripsi: "Jaringan profesional dan riwayat karir formal.",
      Nama_Ikon: "Linkedin",
    },
    {
      Nama_Platform: "Discord",
      Handle_Username: "nizam#1234",
      Tautan_URL: "https://discord.com",
      Deskripsi: "Komunikasi dan kolaborasi komunitas pengembang.",
      Nama_Ikon: "MessageSquare",
    },
  ];

  const handleDownloadExcel = () => {
    downloadExcelTemplate("template_tautan_sosial", SOCIAL_TEMPLATE_HEADERS, SOCIAL_SAMPLE_ROWS, "#10b981");
  };

  const handleDownloadCsv = () => {
    downloadCsvTemplate("template_tautan_sosial", SOCIAL_TEMPLATE_HEADERS, SOCIAL_SAMPLE_ROWS);
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
          entityName: "Tautan Sosial",
        });
        return;
      }

      const imported = [];
      const errors = [];

      parsed.data.forEach((row) => {
        const rowNum = row["No"] || row["no"] || row._rowNumber;
        const platform = row["Nama_Platform"] || row["Platform"] || row["platform"];
        const handle = row["Handle_Username"] || row["Handle"] || "";
        const url = row["Tautan_URL"] || row["Url"] || row["url"];
        const description = row["Deskripsi"] || row["Description"] || "";
        const icon = row["Nama_Ikon"] || row["Icon"] || "Globe";

        if (!platform) {
          errors.push({ row: rowNum, reason: "Kolom 'Nama_Platform' tidak boleh kosong." });
          return;
        }
        if (!url) {
          errors.push({ row: rowNum, reason: "Kolom 'Tautan_URL' tidak boleh kosong." });
          return;
        }

        imported.push({
          id: "soc-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
          platform,
          handle,
          url,
          description,
          icon: AVAILABLE_ICONS[icon] ? icon : "Globe",
        });
      });

      if (imported.length > 0) {
        const updated = [...links, ...imported];
        setLinks(updated);
        updateConfig({
          ...config,
          socialLinksList: updated,
        });
      }

      showImportResultAlert({
        successCount: imported.length,
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

  const SelectedIconComp = AVAILABLE_ICONS[form.icon] || Globe;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${accent.bgSubtle} ${accent.text}`}>
              <Share2 className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Saluran & Tautan Sosial
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Kelola kartu saluran komunikasi (GitHub, LinkedIn, Email, X/Twitter, Instagram, Discord, dll).
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
            <span>Tambah Saluran</span>
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
            <Share2 className={`w-4 h-4 ${accent.text}`} />
            {editingId === "new" ? "Tambah Saluran Baru" : "Edit Saluran"}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Nama Platform <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={form.platform}
                onChange={(e) => setForm({ ...form, platform: e.target.value })}
                placeholder="cth. GitHub / LinkedIn / Discord"
                required
                className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Username / Handle
              </label>
              <input
                type="text"
                value={form.handle}
                onChange={(e) => setForm({ ...form, handle: e.target.value })}
                placeholder="cth. @nizamsetiawan"
                className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none"
              />
            </div>

            {/* Ikon Picker Modal */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Ikon Visual
              </label>
              <button
                type="button"
                onClick={() => setIconPickerOpen(true)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between hover:border-zinc-400 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <SelectedIconComp className={`w-4 h-4 ${accent.text}`} />
                  <span className="text-xs font-mono font-medium text-zinc-800 dark:text-zinc-200">{form.icon}</span>
                </div>
                <span className="text-[10px] text-zinc-500 bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded-md font-semibold">Ubah</span>
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Tautan URL Lengkap <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="https://..."
              required
              className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Deskripsi Singkat
            </label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="cth. Repositori kode open-source dan kontribusi publik."
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {links.map((item) => {
          const IconComp = AVAILABLE_ICONS[item.icon] || Globe;
          return (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 shadow-sm flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${accent.bgSubtle} ${accent.text}`}>
                      <IconComp className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {item.platform}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStartEdit(item)}
                      className="p-1 rounded-md text-zinc-400 hover:text-black dark:hover:text-white"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1 rounded-md text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="text-xs font-mono text-zinc-500">{item.handle}</div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 pt-2 border-t border-zinc-100 dark:border-zinc-800 truncate"
              >
                <span className="truncate">{item.url}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>
          );
        })}
      </div>

      {/* Icon Picker Modal */}
      <IconPickerModal
        isOpen={iconPickerOpen}
        onClose={() => setIconPickerOpen(false)}
        selectedIcon={form.icon}
        onSelectIcon={(iconName) => setForm({ ...form, icon: iconName })}
      />
    </div>
  );
}
