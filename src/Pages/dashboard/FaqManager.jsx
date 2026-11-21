import React, { useState, useMemo } from "react";
import { Plus, Trash2, Edit2, HelpCircle, Download, Upload, CheckCircle2 } from "lucide-react";
import { usePortfolio } from "../../context/PortfolioContext";
import { downloadExcelTemplate, parseUploadedSpreadsheet, showImportResultAlert } from "../../utils/csvHelper";
import AdminModal from "../../components/admin/AdminModal";
import AdminDataToolbar from "../../components/admin/AdminDataToolbar";
import AdminPagination from "../../components/admin/AdminPagination";
import Swal from "sweetalert2";

export default function FaqManager() {
  const { config, updateConfig, accent, cardRadiusClass, buttonRadiusClass } = usePortfolio();
  const faqs = config?.faq || [];

  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("table");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editingId, setEditingId] = useState(null);

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
      question: item.question || "",
      answer: item.answer || "",
    });
  };

  // Instant Auto-Save on Add / Edit
  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!form.question?.trim() || !form.answer?.trim()) {
      Swal.fire({
        title: "Kolom Belum Lengkap",
        text: "Pertanyaan dan Jawaban wajib diisi.",
        icon: "warning",
      });
      return;
    }

    const payload = {
      question: form.question.trim(),
      answer: form.answer.trim(),
    };

    let updated = [];
    if (editingId === "new") {
      const newItem = {
        id: "faq-" + Date.now(),
        ...payload,
      };
      updated = [newItem, ...faqs];
    } else {
      updated = faqs.map((s) => (s.id === editingId ? { ...s, ...payload } : s));
    }

    try {
      await updateConfig({
        ...config,
        faq: updated,
      });

      setEditingId(null);

      Swal.fire({
        title: "Berhasil Disimpan",
        text: "FAQ berhasil disimpan otomatis.",
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
  const handleDelete = (id, question) => {
    Swal.fire({
      title: "Hapus Pertanyaan FAQ?",
      text: question ? `Anda yakin ingin menghapus pertanyaan "${question}"? Data akan langsung terhapus.` : "Data akan langsung terhapus.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#71717a",
      confirmButtonText: "Ya, Hapus Sekarang",
      cancelButtonText: "Batal",
    }).then(async (res) => {
      if (res.isConfirmed) {
        const filtered = faqs.filter((s) => s.id !== id);
        try {
          await updateConfig({
            ...config,
            faq: filtered,
          });

          Swal.fire({
            title: "Data Dihapus",
            text: "Pertanyaan FAQ berhasil dihapus.",
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
  const FAQ_TEMPLATE_HEADERS = ["Pertanyaan", "Jawaban"];
  const FAQ_SAMPLE_ROWS = [
    {
      Pertanyaan: "Apakah Anda siap untuk posisi Full-time atau Kontrak?",
      Jawaban: "Ya, saya terbuka untuk posisi Penuh Waktu (Full-time), Kontrak, maupun proyek Freelance terarah baik secara Remote maupun Hybrid.",
    },
    {
      Pertanyaan: "Bagaimana proses alur kerja pengembangan aplikasi?",
      Jawaban: "Dimulai dari diskusi kebutuhan, wireframing & prototyping, pengembangan frontend & backend, pengujian komprehensif, hingga deployment cloud.",
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

    downloadExcelTemplate("template_tanya_jawab_faq", FAQ_TEMPLATE_HEADERS, exportRows, accent?.hex || "#10b981");
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
          entityName: "FAQ",
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
        await updateConfig({
          ...config,
          faq: updatedList,
        });
      }

      showImportResultAlert({
        addedCount,
        updatedCount,
        errors,
        entityName: "FAQ",
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
  const filteredFaqs = useMemo(() => {
    if (!searchTerm.trim()) return faqs;
    const q = searchTerm.toLowerCase().trim();
    return faqs.filter((item) =>
      item.question?.toLowerCase().includes(q) ||
      item.answer?.toLowerCase().includes(q)
    );
  }, [faqs, searchTerm]);

  const totalPages = Math.ceil(filteredFaqs.length / pageSize) || 1;
  const paginatedFaqs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredFaqs.slice(start, start + pageSize);
  }, [filteredFaqs, currentPage, pageSize]);

  return (
    <div className="space-y-6 w-full pb-10">
      {/* Page Header with Compact Mini Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${accent.bgSubtle} ${accent.text}`}>
              <HelpCircle className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Tanya Jawab Umum (FAQ)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Kelola pertanyaan yang sering diajukan calon klien atau perekrut. Data tersimpan otomatis.
          </p>
        </div>

        {/* Compact Mini Badges */}
        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-400">
            <span>Total:</span>
            <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">{faqs.length}</strong>
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
          searchPlaceholder="Cari pertanyaan atau jawaban FAQ..."
          totalCount={faqs.length}
          filteredCount={filteredFaqs.length}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onAddNew={handleStartAdd}
          addLabel="Tambah FAQ"
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
      {filteredFaqs.length === 0 ? (
        <div className={`p-12 text-center bg-white dark:bg-zinc-900/40 ${cardRadiusClass} border border-zinc-200 dark:border-zinc-800 space-y-3`}>
          <HelpCircle className="w-12 h-12 text-zinc-400 mx-auto opacity-30" />
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            {searchTerm ? "Tidak ada hasil pencarian" : "Belum Ada FAQ Ditambahkan"}
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            {searchTerm
              ? `Tidak ditemukan pertanyaan FAQ yang cocok dengan kata kunci "${searchTerm}".`
              : "Tambahkan pertanyaan yang sering diajukan untuk mempermudah calon klien dan perekrut."}
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
              <span>Tambah FAQ Pertama</span>
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
                  <th className="py-3 px-4 min-w-[260px]">Pertanyaan</th>
                  <th className="py-3 px-4 min-w-[320px]">Jawaban</th>
                  <th className="py-3 px-4 text-right min-w-[100px]">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {paginatedFaqs.map((item, idx) => {
                  const globalIdx = (currentPage - 1) * pageSize + idx + 1;
                  return (
                    <tr
                      key={item.id || idx}
                      className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors group"
                    >
                      <td className="py-3 px-3.5 text-center font-mono text-zinc-400">
                        {globalIdx}
                      </td>
                      <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-100">
                        <div className="truncate max-w-[280px]" title={item.question}>
                          {item.question}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-zinc-500">
                        <div className="truncate max-w-[360px]" title={item.answer}>
                          {item.answer}
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
                            onClick={() => handleDelete(item.id, item.question)}
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
              totalItems={filteredFaqs.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      ) : (
        /* GRID VIEW */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedFaqs.map((item) => (
              <div
                key={item.id}
                className={`p-5 ${cardRadiusClass} bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-3 flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-all`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                      {item.question}
                    </h3>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleStartEdit(item)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.question)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <AdminPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredFaqs.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* POPUP MODAL FORM FOR ADD / EDIT */}
      <AdminModal
        isOpen={Boolean(editingId)}
        onClose={() => setEditingId(null)}
        title={editingId === "new" ? "Tambah Pertanyaan FAQ Baru" : "Edit Pertanyaan FAQ"}
        subtitle="Data akan langsung tersimpan secara otomatis setelah Anda mengklik simpan."
        icon={HelpCircle}
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
              form="faqForm"
              className={`px-5 py-2 ${buttonRadiusClass} ${accent.bg} text-white text-xs font-semibold hover:opacity-90 transition-all shadow-sm active:scale-95`}
            >
              Simpan FAQ
            </button>
          </>
        }
      >
        <form id="faqForm" onSubmit={handleSaveItem} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Pertanyaan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
              placeholder="cth. Apakah Anda menerima proyek freelance remote?"
              required
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Jawaban Lengkap <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={5}
              value={form.answer}
              onChange={(e) => setForm({ ...form, answer: e.target.value })}
              placeholder="Berikan jawaban informatif dan jelas..."
              required
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none resize-none"
            />
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
