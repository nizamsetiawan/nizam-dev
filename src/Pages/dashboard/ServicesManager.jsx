import React, { useState } from "react";
import { Plus, Trash2, Edit2, Save, Layout, Download, Upload, Palette } from "lucide-react";
import { usePortfolio } from "../../context/PortfolioContext";
import IconPickerModal, { AVAILABLE_ICONS } from "../../components/IconPickerModal";
import { downloadExcelTemplate, downloadCsvTemplate, parseUploadedSpreadsheet, showImportResultAlert } from "../../utils/csvHelper";
import Swal from "sweetalert2";

export default function ServicesManager() {
  const { config, updateConfig, accent } = usePortfolio();
  const [services, setServices] = useState(config?.services || []);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
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
      title: srv.title,
      description: srv.description,
      icon: srv.icon || "Layout",
    });
  };

  const handleSaveItem = (e) => {
    e.preventDefault();
    if (!form.title) return;

    let updated = [];
    if (editingId === "new") {
      const newSrv = {
        id: "srv-" + Date.now(),
        ...form,
      };
      updated = [...services, newSrv];
    } else {
      updated = services.map((s) => (s.id === editingId ? { ...s, ...form } : s));
    }

    setServices(updated);
    setEditingId(null);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Hapus Layanan Ini?",
      text: "Layanan ini akan dihapus dari daftar penawaran Anda.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    }).then((res) => {
      if (res.isConfirmed) {
        setServices((prev) => prev.filter((s) => s.id !== id));
      }
    });
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await updateConfig({
        ...config,
        services,
      });

      Swal.fire({
        title: "Layanan Disimpan!",
        text: "Daftar layanan berhasil diperbarui.",
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

  const SERVICES_TEMPLATE_HEADERS = ["Judul_Layanan", "Deskripsi", "Nama_Ikon"];
  const SERVICES_SAMPLE_ROWS = [
    {
      Judul_Layanan: "Pengembangan Frontend Modern",
      Deskripsi: "Membangun antarmuka web interaktif, performa tinggi, dan ramah SEO dengan React & Vite.",
      Nama_Ikon: "Layout",
    },
    {
      Judul_Layanan: "Sistem CMS & Admin Dashboard",
      Deskripsi: "Panel kontrol real-time dengan CRUD dinamis, otorisasi peran, dan visualisasi metrik.",
      Nama_Ikon: "Database",
    },
    {
      Judul_Layanan: "Optimasi Kinerja & SEO",
      Deskripsi: "Audit kecepatan render, Core Web Vitals, dan optimasi struktur metadata situs.",
      Nama_Ikon: "Zap",
    },
  ];

  const handleDownloadExcel = () => {
    downloadExcelTemplate("template_layanan_solusi", SERVICES_TEMPLATE_HEADERS, SERVICES_SAMPLE_ROWS, "#10b981");
  };

  const handleDownloadCsv = () => {
    downloadCsvTemplate("template_layanan_solusi", SERVICES_TEMPLATE_HEADERS, SERVICES_SAMPLE_ROWS);
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

      const imported = [];
      const errors = [];

      parsed.data.forEach((row) => {
        const rowNum = row["No"] || row["no"] || row._rowNumber;
        const title = row["Judul_Layanan"] || row["Title"] || row["judul"];
        const description = row["Deskripsi"] || row["Description"] || "";
        const icon = row["Nama_Ikon"] || row["Icon"] || "Layout";

        if (!title) {
          errors.push({ row: rowNum, reason: "Kolom 'Judul_Layanan' tidak boleh kosong." });
          return;
        }

        imported.push({
          id: "srv-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
          title,
          description,
          icon: AVAILABLE_ICONS[icon] ? icon : "Layout",
        });
      });

      if (imported.length > 0) {
        const updated = [...services, ...imported];
        setServices(updated);
        updateConfig({
          ...config,
          services: updated,
        });
      }

      showImportResultAlert({
        successCount: imported.length,
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

  const SelectedIconComp = AVAILABLE_ICONS[form.icon] || Layout;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${accent.bgSubtle} ${accent.text}`}>
              <Layout className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Layanan & Spesialisasi Solusi
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Kelola penawaran jasa rekayasa web yang dapat Anda bangun untuk klien atau perusahaan.
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
            <span>Tambah Layanan</span>
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

      {/* Editing Form Modal / Inline Box */}
      {editingId && (
        <form
          onSubmit={handleSaveItem}
          className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 shadow-md space-y-4"
        >
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Layout className={`w-4 h-4 ${accent.text}`} />
            {editingId === "new" ? "Tambah Layanan Baru" : "Edit Layanan"}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Judul Layanan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="cth. Pengembangan Frontend Modern"
                required
                className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none"
              />
            </div>

            {/* Ikon dengan Picker Modal */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Ikon Layanan
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
              Deskripsi Solusi
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Jelaskan apa yang Anda kerjakan dan nilai tambah yang didapatkan klien..."
              required
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

      {/* Services List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((srv) => {
          const IconComp = AVAILABLE_ICONS[srv.icon] || Layout;
          return (
            <div
              key={srv.id}
              className="p-5 rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${accent.bgSubtle} ${accent.text}`}>
                      <IconComp className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-mono text-zinc-500">
                      {srv.icon || "Layout"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStartEdit(srv)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(srv.id)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {srv.title}
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {srv.description}
                </p>
              </div>
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
