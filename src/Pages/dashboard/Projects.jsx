import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../supabase";
import { broadcastRealtimeEvent } from "../../utils/realtimeSync";
import { usePortfolio } from "../../context/PortfolioContext";
import {
  Plus,
  Trash2,
  Upload,
  Download,
  X,
  ImageIcon,
  ExternalLink,
  Github,
  Edit2,
  FolderGit2,
  CheckCircle2,
  Globe,
} from "lucide-react";
import { downloadExcelTemplate, parseUploadedSpreadsheet, showImportResultAlert } from "../../utils/csvHelper";
import AdminModal from "../../components/admin/AdminModal";
import AdminDataToolbar from "../../components/admin/AdminDataToolbar";
import AdminPagination from "../../components/admin/AdminPagination";
import Swal from "sweetalert2";

const InputField = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-xs sm:text-sm outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-all"
    />
  </div>
);

const ProjectForm = ({
  initial = null,
  onSubmit,
  onCancel,
  submitLabel = "Simpan Proyek",
  uploading = false,
}) => {
  const [form, setForm] = useState({
    Title: initial?.Title || "",
    Description: initial?.Description || "",
    TechStack: Array.isArray(initial?.TechStack)
      ? initial.TechStack.join(", ")
      : initial?.TechStack || "",
    Features: Array.isArray(initial?.Features)
      ? initial.Features.join(", ")
      : initial?.Features || "",
    Link: initial?.Link || "",
    Github: initial?.Github || "",
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(initial?.Img || null);
  const [isDragging, setIsDragging] = useState(false);
  const { accent, buttonRadiusClass } = usePortfolio();

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (!f || !f.type.startsWith("image/")) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  return (
    <form
      id="projectForm"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form, file);
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <InputField
            label="Judul Proyek"
            value={form.Title}
            onChange={set("Title")}
            placeholder="cth. Modern Portfolio & CMS Dashboard"
            required
          />
        </div>

        <div className="sm:col-span-2 space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Deskripsi Proyek
          </label>
          <textarea
            value={form.Description}
            onChange={set("Description")}
            placeholder="Jelaskan tujuan, fungsionalitas utama, dan teknologi arsitekturnya..."
            rows={3}
            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-xs sm:text-sm outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-all resize-none"
          />
        </div>

        <InputField
          label="Teknologi / Tech Stack (pisahkan koma)"
          value={form.TechStack}
          onChange={set("TechStack")}
          placeholder="cth. React, Vite, Tailwind CSS, Supabase"
        />

        <InputField
          label="Fitur Unggulan (pisahkan koma)"
          value={form.Features}
          onChange={set("Features")}
          placeholder="cth. Real-time sync, Responsive UI, Dark mode"
        />

        <InputField
          label="Tautan Demo Publik (URL)"
          value={form.Link}
          onChange={set("Link")}
          placeholder="https://proyek-anda.vercel.app"
        />

        <InputField
          label="Tautan Repository GitHub (URL)"
          value={form.Github}
          onChange={set("Github")}
          placeholder="https://github.com/username/repo"
        />
      </div>

      {/* Image Upload Zone */}
      <div className="space-y-2 pt-2">
        <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
          Tangkapan Layar / Gambar Cover
        </label>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl border-2 border-dashed transition-all ${
            isDragging
              ? "border-emerald-500 bg-emerald-500/5"
              : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40"
          }`}
        >
          {preview ? (
            <div className="relative w-36 aspect-video rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 shrink-0 shadow-xs">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                }}
                className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white hover:bg-black"
                title="Hapus foto"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="w-24 aspect-video rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0">
              <ImageIcon className="w-6 h-6 text-zinc-400 opacity-60" />
            </div>
          )}

          <label className="flex-1 text-center sm:text-left cursor-pointer">
            <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:underline">
              Pilih Berkas Gambar atau Drag & Drop ke sini
            </span>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              PNG, JPG, WEBP, atau GIF (Maks. 5 MB)
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </form>
  );
};

export default function Projects() {
  const { accent, cardRadiusClass, buttonRadiusClass } = usePortfolio();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("table");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });
      setProjects(data || []);
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const uploadImage = async (file) => {
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const filePath = `projects/${fileName}`;

    const { error } = await supabase.storage
      .from("project-images")
      .upload(filePath, file);

    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabase.storage.from("project-images").getPublicUrl(filePath);

    return publicUrl;
  };

  const handleCreate = async (form, file) => {
    setUploading(true);
    try {
      let Img = "";
      if (file) Img = await uploadImage(file);

      const payload = {
        Title: form.Title,
        Description: form.Description,
        Img,
        Link: form.Link,
        Github: form.Github,
        TechStack: form.TechStack
          ? form.TechStack.split(/[,|;]/).map((s) => s.trim()).filter(Boolean)
          : [],
        Features: form.Features
          ? form.Features.split(/[,|;]/).map((s) => s.trim()).filter(Boolean)
          : [],
        is_published: true,
      };

      const { error } = await supabase.from("projects").insert([payload]);
      if (error) throw error;

      setShowCreate(false);
      fetchProjects();
      broadcastRealtimeEvent("PROJECTS_UPDATED");

      Swal.fire({
        title: "Proyek Ditambahkan!",
        text: "Proyek baru berhasil dipublikasikan.",
        icon: "success",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (err) {
      Swal.fire({
        title: "Gagal Menambahkan",
        text: err.message || "Terjadi kesalahan saat menambahkan proyek.",
        icon: "error",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async (form, file) => {
    setUploading(true);
    try {
      let Img = editProject.Img;
      if (file) Img = await uploadImage(file);

      const payload = {
        Title: form.Title,
        Description: form.Description,
        Img,
        Link: form.Link,
        Github: form.Github,
        TechStack: form.TechStack
          ? form.TechStack.split(/[,|;]/).map((s) => s.trim()).filter(Boolean)
          : [],
        Features: form.Features
          ? form.Features.split(/[,|;]/).map((s) => s.trim()).filter(Boolean)
          : [],
      };

      const { error } = await supabase
        .from("projects")
        .update(payload)
        .eq("id", editProject.id);

      if (error) throw error;

      setEditProject(null);
      fetchProjects();
      broadcastRealtimeEvent("PROJECTS_UPDATED");

      Swal.fire({
        title: "Proyek Diperbarui!",
        text: "Perubahan data proyek berhasil disimpan.",
        icon: "success",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (err) {
      Swal.fire({
        title: "Gagal Memperbarui",
        text: err.message || "Terjadi kesalahan saat memperbarui proyek.",
        icon: "error",
      });
    } finally {
      setUploading(false);
    }
  };

  // Instant Auto-Save on Delete (Tanpa perlu klik simpan terpisah)
  const handleDelete = (id, title) => {
    Swal.fire({
      title: "Hapus Proyek?",
      text: title ? `Anda yakin ingin menghapus proyek "${title}"? Data akan langsung terhapus dari database.` : "Data akan langsung terhapus dari database.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#71717a",
      confirmButtonText: "Ya, Hapus Sekarang",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const { error } = await supabase.from("projects").delete().eq("id", id);
          if (error) throw error;

          fetchProjects();
          broadcastRealtimeEvent("PROJECTS_UPDATED");

          Swal.fire({
            title: "Proyek Dihapus",
            text: "Data proyek berhasil dihapus.",
            icon: "success",
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 1500,
          });
        } catch (err) {
          Swal.fire({
            title: "Gagal Menghapus",
            text: err.message || "Gagal menghapus proyek.",
            icon: "error",
          });
        }
      }
    });
  };

  // Excel Templates & Live Data Export
  const PROJECT_TEMPLATE_HEADERS = [
    "Judul_Proyek",
    "Deskripsi",
    "Tautan_Demo",
    "Tautan_Github",
    "Teknologi_TechStack",
    "Gambar_URL",
    "Fitur_Unggulan",
  ];

  const PROJECT_SAMPLE_ROWS = [
    {
      Judul_Proyek: "Modern Portfolio & CMS",
      Deskripsi: "Portofolio developer dengan panel admin kontrol dinamis dan Supabase backend.",
      Tautan_Demo: "https://github.com/nizamsetiawan/nizam-dev",
      Tautan_Github: "https://github.com/nizamsetiawan/nizam-dev",
      Teknologi_TechStack: "React, Tailwind CSS, Supabase, Vite",
      Gambar_URL: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800",
      Fitur_Unggulan: "Arsitektur modular, 100% responsif, dark mode, dynamic CMS",
    },
    {
      Judul_Proyek: "Cloud Inventory System",
      Deskripsi: "Sistem inventaris terdistribusi dengan pemantauan stok real-time.",
      Tautan_Demo: "https://example.com",
      Tautan_Github: "https://github.com/nizamsetiawan",
      Teknologi_TechStack: "React, TypeScript, PostgreSQL",
      Gambar_URL: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800",
      Fitur_Unggulan: "Autentikasi role-based, ekspor laporan, dashboard grafik",
    },
  ];

  const handleDownloadExcel = () => {
    const exportRows = (projects && projects.length > 0)
      ? projects.map((p, idx) => ({
          No: idx + 1,
          Judul_Proyek: p.Title || "",
          Deskripsi: p.Description || "",
          Tautan_Demo: p.Link || "",
          Tautan_Github: p.Github || "",
          Teknologi_TechStack: Array.isArray(p.TechStack) ? p.TechStack.join(", ") : (p.TechStack || ""),
          Gambar_URL: p.Img || "",
          Fitur_Unggulan: Array.isArray(p.Features) ? p.Features.join(", ") : (p.Features || ""),
        }))
      : PROJECT_SAMPLE_ROWS;

    downloadExcelTemplate("template_proyek_portofolio", PROJECT_TEMPLATE_HEADERS, exportRows, accent?.hex || "#10b981");
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
          entityName: "Proyek",
        });
        return;
      }

      const itemsToUpdate = [];
      const itemsToInsert = [];
      const errors = [];

      parsed.data.forEach((row) => {
        const rowNumStr = row["No"] || row["no"] || row._rowNumber;
        const rowNo = parseInt(rowNumStr, 10);
        const title = (row["Judul_Proyek"] || row["Title"] || row["judul"] || row["Judul Proyek"] || "").trim();
        const desc = (row["Deskripsi"] || row["Description"] || "").trim();
        const link = (row["Tautan_Demo"] || row["Link"] || "#").trim();
        const github = (row["Tautan_Github"] || row["Github"] || "https://github.com/nizamsetiawan").trim();
        const techRaw = row["Teknologi_TechStack"] || row["TechStack"] || "";
        const img = (row["Gambar_URL"] || row["Img"] || "").trim();
        const featuresRaw = row["Fitur_Unggulan"] || row["Features"] || "";

        if (!title || title.toLowerCase() === "judul_proyek" || title.toLowerCase() === "judul proyek") {
          if (title.toLowerCase() === "judul_proyek" || title.toLowerCase() === "judul proyek") return;
          errors.push({ row: rowNumStr, reason: "Kolom 'Judul_Proyek' tidak boleh kosong." });
          return;
        }

        const techStack = techRaw ? String(techRaw).split(/[,|;]/).map((s) => s.trim()).filter(Boolean) : ["React"];
        const features = featuresRaw ? String(featuresRaw).split(/[,|;]/).map((s) => s.trim()).filter(Boolean) : [];

        const existingIdx = (!isNaN(rowNo) && rowNo >= 1 && rowNo <= projects.length)
          ? rowNo - 1
          : projects.findIndex((p) => p.Title?.toLowerCase() === title.toLowerCase());

        const payload = {
          Title: title,
          Description: desc,
          Link: link,
          Github: github,
          TechStack: techStack,
          Img: img || (existingIdx >= 0 ? projects[existingIdx].Img : ""),
          Features: features,
        };

        if (existingIdx >= 0 && existingIdx < projects.length) {
          itemsToUpdate.push({
            id: projects[existingIdx].id,
            ...payload,
          });
        } else {
          itemsToInsert.push(payload);
        }
      });

      let updatedCount = 0;
      let addedCount = 0;

      for (const item of itemsToUpdate) {
        try {
          const { error } = await supabase.from("projects").update(item).eq("id", item.id);
          if (!error) updatedCount++;
        } catch (err) {
          console.warn("Update project error:", err);
        }
      }

      if (itemsToInsert.length > 0) {
        try {
          const { error } = await supabase.from("projects").insert(itemsToInsert);
          if (!error) {
            addedCount += itemsToInsert.length;
          } else {
            throw error;
          }
        } catch (supabaseErr) {
          console.error("Insert error:", supabaseErr);
        }
      }

      if (updatedCount > 0 || addedCount > 0) {
        fetchProjects();
        broadcastRealtimeEvent("PROJECTS_UPDATED");
      }

      showImportResultAlert({
        addedCount,
        updatedCount,
        errors,
        entityName: "Proyek",
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
  const filteredProjects = useMemo(() => {
    if (!searchTerm.trim()) return projects;
    const q = searchTerm.toLowerCase().trim();
    return projects.filter((p) => {
      const titleMatch = p.Title?.toLowerCase().includes(q);
      const descMatch = p.Description?.toLowerCase().includes(q);
      let techMatch = false;
      if (Array.isArray(p.TechStack)) {
        techMatch = p.TechStack.some((t) => t.toLowerCase().includes(q));
      } else if (typeof p.TechStack === "string") {
        techMatch = p.TechStack.toLowerCase().includes(q);
      }
      return titleMatch || descMatch || techMatch;
    });
  }, [projects, searchTerm]);

  const totalPages = Math.ceil(filteredProjects.length / pageSize) || 1;
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProjects.slice(start, start + pageSize);
  }, [filteredProjects, currentPage, pageSize]);

  // Quick stats
  const withLiveDemo = projects.filter((p) => p.Link && p.Link !== "#").length;
  const withGithub = projects.filter((p) => p.Github && p.Github !== "#").length;

  return (
    <div className="space-y-6 w-full pb-10">
      {/* Header with Compact Mini Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${accent.bgSubtle} ${accent.text}`}>
              <FolderGit2 className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Manajemen Proyek Portofolio
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Kelola daftar karya dan aplikasi. Perubahan langsung tersimpan ke Supabase.
          </p>
        </div>

        {/* Compact Mini Badges */}
        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-400">
            <span>Total:</span>
            <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">{projects.length}</strong>
          </span>
          {withLiveDemo > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-400">
              <span>Demo:</span>
              <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">{withLiveDemo}</strong>
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Supabase Sync
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
          searchPlaceholder="Cari judul proyek, tech stack, atau deskripsi..."
          totalCount={projects.length}
          filteredCount={filteredProjects.length}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onAddNew={() => setShowCreate(true)}
          addLabel="Tambah Proyek"
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
      {loading ? (
        <div className="text-center py-16 text-xs text-zinc-400">
          Memuat daftar proyek dari database...
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className={`p-12 text-center bg-white dark:bg-zinc-900/40 ${cardRadiusClass} border border-zinc-200 dark:border-zinc-800 space-y-3`}>
          <FolderGit2 className="w-12 h-12 text-zinc-400 mx-auto opacity-30" />
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            {searchTerm ? "Tidak ada hasil pencarian" : "Belum Ada Proyek Portofolio"}
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            {searchTerm
              ? `Tidak ditemukan proyek yang cocok dengan kata kunci "${searchTerm}".`
              : "Unggah tangkapan layar dan tautan proyek Anda untuk ditampilkan di galeri karya."}
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
              onClick={() => setShowCreate(true)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 ${buttonRadiusClass} ${accent.bg} text-white text-xs font-semibold hover:opacity-90 transition-all`}
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Proyek Pertama</span>
            </button>
          )}
        </div>
      ) : viewMode === "table" ? (
        /* TABLE VIEW (Compact & easy for large project lists) */
        <div className={`bg-white dark:bg-zinc-900/70 ${cardRadiusClass} border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-2xs`}>
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/75 dark:bg-zinc-950/50 text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3.5 w-12 text-center">No</th>
                  <th className="py-3 px-3.5 w-20">Cover</th>
                  <th className="py-3 px-4 min-w-[200px]">Judul & Deskripsi</th>
                  <th className="py-3 px-4 min-w-[200px]">Teknologi / Stack</th>
                  <th className="py-3 px-3.5 min-w-[120px]">Tautan Demo</th>
                  <th className="py-3 px-4 text-right min-w-[100px]">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {paginatedProjects.map((p, idx) => {
                  const globalIdx = (currentPage - 1) * pageSize + idx + 1;
                  let techArray = [];
                  if (Array.isArray(p.TechStack)) {
                    techArray = p.TechStack;
                  } else if (typeof p.TechStack === "string") {
                    try {
                      techArray = JSON.parse(p.TechStack);
                    } catch {
                      techArray = p.TechStack.split(/[,|;]/).map((s) => s.trim()).filter(Boolean);
                    }
                  }

                  return (
                    <tr
                      key={p.id || idx}
                      className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors group"
                    >
                      <td className="py-3 px-3.5 text-center font-mono text-zinc-400">
                        {globalIdx}
                      </td>
                      <td className="py-3 px-3.5">
                        {p.Img ? (
                          <img
                            src={p.Img}
                            alt={p.Title}
                            className="w-14 h-9 object-cover rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-2xs"
                          />
                        ) : (
                          <div className="w-14 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
                            <FolderGit2 className="w-4 h-4 text-zinc-400 opacity-40" />
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-100">
                        <div className="truncate max-w-[240px] font-medium" title={p.Title}>
                          {p.Title}
                        </div>
                        {p.Description && (
                          <div className="text-[11px] text-zinc-400 truncate max-w-[260px] font-normal mt-0.5">
                            {p.Description}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {techArray.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-[220px]">
                            {techArray.slice(0, 3).map((t, tIdx) => (
                              <span
                                key={tIdx}
                                className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-mono"
                              >
                                {t}
                              </span>
                            ))}
                            {techArray.length > 3 && (
                              <span className="text-[10px] text-zinc-400 font-mono">
                                +{techArray.length - 3}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-zinc-400 text-[11px]">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {p.Link && p.Link !== "#" && (
                            <a
                              href={p.Link}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 rounded-md text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                              title="Buka Demo"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {p.Github && p.Github !== "#" && (
                            <a
                              href={p.Github}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 rounded-md text-zinc-400 hover:text-black dark:hover:text-white"
                              title="Buka GitHub"
                            >
                              <Github className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setEditProject(p)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            title="Edit Data"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(p.id, p.Title)}
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
              totalItems={filteredProjects.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      ) : (
        /* GRID VIEW */
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedProjects.map((project) => {
              let techArray = [];
              if (Array.isArray(project.TechStack)) {
                techArray = project.TechStack;
              } else if (typeof project.TechStack === "string") {
                try {
                  techArray = JSON.parse(project.TechStack);
                } catch {
                  techArray = project.TechStack.split(/[,|;]/).map((s) => s.trim()).filter(Boolean);
                }
              }

              return (
                <div
                  key={project.id}
                  className={`p-5 ${cardRadiusClass} bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all`}
                >
                  <div className="space-y-3">
                    {project.Img ? (
                      <div className="w-full aspect-video rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                        <img
                          src={project.Img}
                          alt={project.Title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="w-full aspect-video rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center">
                        <FolderGit2 className="w-8 h-8 text-zinc-400 opacity-40" />
                      </div>
                    )}

                    <div>
                      <h3 className="font-bold text-zinc-900 dark:text-white text-sm sm:text-base truncate" title={project.Title}>
                        {project.Title}
                      </h3>
                      {project.Description && (
                        <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1 line-clamp-2 leading-relaxed">
                          {project.Description}
                        </p>
                      )}
                    </div>

                    {techArray.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {techArray.slice(0, 4).map((t, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-[10px] font-medium"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {project.Link && (
                        <a
                          href={project.Link}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                          title="Demo"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      {project.Github && (
                        <a
                          href={project.Github}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                          title="GitHub"
                        >
                          <Github className="w-4 h-4" />
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditProject(project)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(project.id, project.Title)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <AdminPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredProjects.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* MODAL: CREATE */}
      <AdminModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="Tambah Proyek Baru"
        subtitle="Data akan langsung dipublikasikan dan tersimpan ke database Supabase."
        icon={FolderGit2}
        maxWidth="max-w-2xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className={`px-4 py-2 ${buttonRadiusClass} text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors`}
            >
              Batal
            </button>
            <button
              type="submit"
              form="projectForm"
              disabled={uploading}
              className={`px-5 py-2 ${buttonRadiusClass} ${accent.bg} text-white text-xs font-semibold hover:opacity-90 transition-all shadow-sm active:scale-95 disabled:opacity-50`}
            >
              {uploading ? "Mengunggah..." : "Terbitkan Proyek"}
            </button>
          </>
        }
      >
        <ProjectForm
          onSubmit={handleCreate}
          onCancel={() => setShowCreate(false)}
          submitLabel="Terbitkan Proyek"
          uploading={uploading}
        />
      </AdminModal>

      {/* MODAL: EDIT */}
      <AdminModal
        isOpen={Boolean(editProject)}
        onClose={() => setEditProject(null)}
        title="Edit Data Proyek"
        subtitle="Perubahan akan langsung diperbarui ke database Supabase secara instan."
        icon={Edit2}
        maxWidth="max-w-2xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => setEditProject(null)}
              className={`px-4 py-2 ${buttonRadiusClass} text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors`}
            >
              Batal
            </button>
            <button
              type="submit"
              form="projectForm"
              disabled={uploading}
              className={`px-5 py-2 ${buttonRadiusClass} ${accent.bg} text-white text-xs font-semibold hover:opacity-90 transition-all shadow-sm active:scale-95 disabled:opacity-50`}
            >
              {uploading ? "Menyimpan..." : "Perbarui Proyek"}
            </button>
          </>
        }
      >
        {editProject && (
          <ProjectForm
            initial={editProject}
            onSubmit={handleUpdate}
            onCancel={() => setEditProject(null)}
            submitLabel="Perbarui Proyek"
            uploading={uploading}
          />
        )}
      </AdminModal>
    </div>
  );
}
