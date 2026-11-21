import React, { useState } from "react";
import { Plus, Trash2, Edit2, Save, HelpCircle, Download, Upload } from "lucide-react";
import { usePortfolio } from "../../context/PortfolioContext";
import { downloadExcelTemplate, parseUploadedSpreadsheet, showImportResultAlert } from "../../utils/csvHelper";
import Swal from "sweetalert2";

export default function FaqManager() {
  const { config, updateConfig, accent } = usePortfolio();
  const [faqs, setFaqs] = useState(config?.faq || []);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    question: "",
    answer: "",
  });

  const handleStartAdd = () => {
    setEditingId("new");
    setForm({ question: "", answer: "" });
  };

  const handleStartEdit = (item) => {
    setEditingId(item.id);
    setForm({
      question: item.question,
      answer: item.answer,
    });
  };

  const handleSaveItem = (e) => {
    e.preventDefault();
    if (!form.question || !form.answer) {
      Swal.fire({
        title: "Kolom Belum Lengkap",
        text: "Pertanyaan dan Jawaban wajib diisi.",
        icon: "warning",
      });
      return;
    }

    let updated = [];
    if (editingId === "new") {
      const newItem = {
        id: "faq-" + Date.now(),
        ...form,
      };
      updated = [...faqs, newItem];
    } else {
      updated = faqs.map((s) => (s.id === editingId ? { ...s, ...form } : s));
    }

    setFaqs(updated);
    setEditingId(null);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Hapus Pertanyaan FAQ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    }).then((res) => {
      if (res.isConfirmed) {
        setFaqs((prev) => prev.filter((s) => s.id !== id));
      }
    });
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await updateConfig({
        ...config,
        faq: faqs,
      });

      Swal.fire({
        title: "FAQ Disimpan!",
        text: "Daftar pertanyaan dan jawaban berhasil disimpan.",
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

  const FAQ_TEMPLATE_HEADERS = ["Pertanyaan", "Jawaban"];
  const FAQ_SAMPLE_ROWS = [
    {
      Pertanyaan: "Apakah Anda siap untuk posisi Full-time atau Kontrak?",
      Jawaban: "Ya, saya terbuka untuk posisi Penuh Waktu (Full-time), Kontrak, maupun proyek Freelance terarah baik secara Remote maupun Hybrid.",
    },
    {
      Pertanyaan: "Berapa lama estimasi pengerjaan sebuah situs web?",
      Jawaban: "Rata-rata portofolio atau landing page selesai dalam 3–7 hari kerja, sedangkan aplikasi web interaktif memerlukan 2–4 minggu.",
    },
    {
      Pertanyaan: "Apakah Anda bersedia bekerja secara remote?",
      Jawaban: "Ya, saya sangat terbiasa dengan lingkungan kerja remote dan memiliki setup home office yang lengkap untuk produktivitas optimal.",
    },
  ];

  const handleDownloadExcel = () => {
    const exportRows = (faqs && faqs.length > 0)
      ? faqs.map((f, idx) => ({
          No: idx + 1,
          Pertanyaan: f.question || "",
          Jawaban: f.answer || "",
        }))
      : FAQ_SAMPLE_ROWS;

    downloadExcelTemplate("template_faq_tanya_jawab", FAQ_TEMPLATE_HEADERS, exportRows, accent?.hex || "#10b981");
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
          entityName: "Tanya Jawab (FAQ)",
        });
        return;
      }

      const updatedList = [...faqs];
      let updatedCount = 0;
      let addedCount = 0;
      const errors = [];

      parsed.data.forEach((row) => {
        const rowNumStr = row["No"] || row["no"] || row._rowNumber;
        const rowNo = parseInt(rowNumStr, 10);
        const question = (row["Pertanyaan"] || row["Question"] || row["pertanyaan"] || "").trim();
        const answer = (row["Jawaban"] || row["Answer"] || row["jawaban"] || "").trim();

        if (!question || question.toLowerCase() === "pertanyaan") {
          if (question.toLowerCase() === "pertanyaan") return;
          errors.push({ row: rowNumStr, reason: "Kolom 'Pertanyaan' tidak boleh kosong." });
          return;
        }
        if (!answer || answer.toLowerCase() === "jawaban") {
          if (answer.toLowerCase() === "jawaban") return;
          errors.push({ row: rowNumStr, reason: "Kolom 'Jawaban' tidak boleh kosong." });
          return;
        }

        const existingIdx = (!isNaN(rowNo) && rowNo >= 1 && rowNo <= faqs.length)
          ? rowNo - 1
          : updatedList.findIndex((item) => item.question?.toLowerCase() === question.toLowerCase());

        const payload = {
          question,
          answer,
        };

        if (existingIdx >= 0 && existingIdx < updatedList.length) {
          updatedList[existingIdx] = {
            ...updatedList[existingIdx],
            ...payload,
          };
          updatedCount++;
        } else {
          updatedList.push({
            id: "faq-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
            ...payload,
          });
          addedCount++;
        }
      });

      if (updatedCount > 0 || addedCount > 0) {
        setFaqs(updatedList);
        updateConfig({
          ...config,
          faq: updatedList,
        });
      }

      showImportResultAlert({
        addedCount,
        updatedCount,
        errors,
        entityName: "Tanya Jawab (FAQ)",
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
              <HelpCircle className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Tanya Jawab Umum (FAQ)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Kelola daftar pertanyaan yang sering diajukan oleh HR, perekrut, atau calon klien.
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
            onClick={handleStartAdd}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl ${accent.bg} text-white font-semibold text-xs sm:text-sm hover:opacity-90 transition-all shadow-sm active:scale-95`}
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Pertanyaan</span>
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
            <HelpCircle className={`w-4 h-4 ${accent.text}`} />
            {editingId === "new" ? "Tambah Pertanyaan Baru" : "Edit Pertanyaan"}
          </h2>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Pertanyaan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
              placeholder="cth. Apakah Anda siap untuk posisi Full-time atau Kontrak?"
              required
              className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Jawaban <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={form.answer}
              onChange={(e) => setForm({ ...form, answer: e.target.value })}
              placeholder="Berikan jawaban yang jelas, profesional, dan solutif..."
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

      {/* FAQ List */}
      {faqs.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-zinc-900/40 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
          <HelpCircle className="w-10 h-10 text-zinc-400 mx-auto opacity-40" />
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Belum Ada Pertanyaan FAQ
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Tambahkan FAQ secara manual atau unggah berkas CSV secara massal.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className="p-5 rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 shadow-sm space-y-2 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <HelpCircle className={`w-4 h-4 ${accent.text} shrink-0`} />
                  <span>{faq.question}</span>
                </h3>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleStartEdit(faq)}
                    className="p-1 rounded-md text-zinc-400 hover:text-black dark:hover:text-white"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(faq.id)}
                    className="p-1 rounded-md text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed pl-6">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
