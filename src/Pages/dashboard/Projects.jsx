import { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import { broadcastRealtimeEvent } from "../../utils/realtimeSync";
import {
  Plus,
  Trash2,
  Upload,
  Download,
  X,
  ImageIcon,
  ExternalLink,
  Github,
  Pencil,
  FolderGit2,
} from "lucide-react";
import { downloadExcelTemplate, downloadCsvTemplate, parseUploadedSpreadsheet, showImportResultAlert } from "../../utils/csvHelper";
import Swal from "sweetalert2";

const InputField = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}) => (
  <div className="space-y-1">
    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 text-sm outline-none focus:border-emerald-500 transition-all"
    />
  </div>
);

const ProjectCard = ({ project, onDelete, onEdit }) => {
  let techArray = [];
  if (Array.isArray(project.TechStack)) {
    techArray = project.TechStack;
  } else if (typeof project.TechStack === "string") {
    try {
      techArray = JSON.parse(project.TechStack);
    } catch {
      techArray = project.TechStack.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
      <div className="space-y-3">
        {project.Img ? (
          <div className="w-full aspect-[16/9] rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
            <img
              src={project.Img}
              alt={project.Title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="w-full aspect-[16/9] rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center">
            <FolderGit2 className="w-8 h-8 text-zinc-400 opacity-40" />
          </div>
        )}

        <div>
          <h3 className="font-bold text-zinc-900 dark:text-white text-base">
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
            {techArray.slice(0, 5).map((t, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 text-[10px] font-medium"
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
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
              title="Live Link"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          {project.Github && (
            <a
              href={project.Github}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
              title="GitHub"
            >
              <Github className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(project)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            <Pencil className="w-3 h-3" /> Edit
          </button>
          <button
            onClick={() => onDelete(project.id, project.Title)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-semibold transition-colors"
          >
            <Trash2 className="w-3 h-3" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const ProjectForm = ({
  initial,
  onSubmit,
  onCancel,
  submitLabel = "Simpan Proyek",
  uploading,
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

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form, file);
      }}
      className="p-5 sm:p-6 space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <InputField
            label="Project Title"
            value={form.Title}
            onChange={set("Title")}
            placeholder="e.g. Modern Portfolio & CMS Dashboard"
            required
          />
        </div>

        <div className="sm:col-span-2 space-y-1">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Description
          </label>
          <textarea
            value={form.Description}
            onChange={set("Description")}
            placeholder="Describe what this project does, its purpose, and impact..."
            rows={3}
            className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 text-sm outline-none focus:border-emerald-500 transition-all resize-none"
          />
        </div>

        <InputField
          label="Tech Stack (comma separated)"
          value={form.TechStack}
          onChange={set("TechStack")}
          placeholder="e.g. React, Tailwind, Supabase, Vite"
        />
        <InputField
          label="Key Features (comma separated)"
          value={form.Features}
          onChange={set("Features")}
          placeholder="e.g. Real-time comments, Admin portal, Dark mode"
        />
        <InputField
          label="Live Demo URL"
          value={form.Link}
          onChange={set("Link")}
          placeholder="https://yourproject.com"
        />
        <InputField
          label="GitHub Repository URL"
          value={form.Github}
          onChange={set("Github")}
          placeholder="https://github.com/username/repo"
        />

        <div className="sm:col-span-2 space-y-1">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Project Screenshot / Banner
          </label>
          <label className="flex items-center gap-4 w-full bg-zinc-50 dark:bg-zinc-800 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-4 cursor-pointer hover:border-emerald-500 transition-all">
            {preview ? (
              <img
                src={preview}
                className="h-16 w-24 object-cover rounded-lg border border-zinc-200 dark:border-zinc-700"
                alt="preview"
              />
            ) : (
              <div className="w-24 h-16 rounded-lg bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-zinc-400" />
              </div>
            )}
            <div>
              <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                {preview ? "Change screenshot" : "Click to select screenshot"}
              </p>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                PNG, JPG, WEBP supported
              </p>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={uploading}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-500 transition-all shadow-sm disabled:opacity-50"
        >
          {uploading ? "Menyimpan..." : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [uploading, setUploading] = useState(false);

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
          ? form.TechStack.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        Features: form.Features
          ? form.Features.split(",").map((s) => s.trim()).filter(Boolean)
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
        confirmButtonColor: "#10b981",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        title: "Gagal Menambahkan",
        text: err.message || "Terjadi kesalahan saat menambahkan proyek.",
        icon: "error",
        confirmButtonColor: "#10b981",
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
          ? form.TechStack.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        Features: form.Features
          ? form.Features.split(",").map((s) => s.trim()).filter(Boolean)
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
        confirmButtonColor: "#10b981",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        title: "Gagal Memperbarui",
        text: err.message || "Terjadi kesalahan saat memperbarui proyek.",
        icon: "error",
        confirmButtonColor: "#10b981",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (id, title) => {
    Swal.fire({
      title: "Hapus Proyek?",
      text: `Anda yakin ingin menghapus proyek "${title}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#71717a",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await supabase.from("projects").delete().eq("id", id);
        fetchProjects();
        broadcastRealtimeEvent("PROJECTS_UPDATED");
      }
    });
  };

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
    downloadExcelTemplate("template_proyek_portofolio", PROJECT_TEMPLATE_HEADERS, PROJECT_SAMPLE_ROWS, "#10b981");
  };

  const handleDownloadCsv = () => {
    downloadCsvTemplate("template_proyek_portofolio", PROJECT_TEMPLATE_HEADERS, PROJECT_SAMPLE_ROWS);
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

      const importedItems = [];
      const errors = [];

      parsed.data.forEach((row) => {
        const rowNum = row["No"] || row["no"] || row._rowNumber;
        const title = row["Judul_Proyek"] || row["Title"] || row["judul"] || row["Judul Proyek"];
        const desc = row["Deskripsi"] || row["Description"] || "";
        const link = row["Tautan_Demo"] || row["Link"] || "#";
        const github = row["Tautan_Github"] || row["Github"] || "https://github.com/nizamsetiawan";
        const techRaw = row["Teknologi_TechStack"] || row["TechStack"] || "";
        const img = row["Gambar_URL"] || row["Img"] || "";
        const featuresRaw = row["Fitur_Unggulan"] || row["Features"] || "";

        if (!title) {
          errors.push({ row: rowNum, reason: "Kolom 'Judul_Proyek' tidak boleh kosong." });
          return;
        }

        const techStack = techRaw ? String(techRaw).split(/[,|;]/).map((s) => s.trim()).filter(Boolean) : ["React"];
        const features = featuresRaw ? String(featuresRaw).split(/[,|;]/).map((s) => s.trim()).filter(Boolean) : [];

        importedItems.push({
          Title: title,
          Description: desc,
          Link: link,
          Github: github,
          TechStack: techStack,
          Img: img,
          Features: features,
        });
      });

      if (importedItems.length > 0) {
        // Try inserting into Supabase
        try {
          const { error } = await supabase.from("projects").insert(importedItems);
          if (error) throw error;
        } catch (supabaseErr) {
          // Fallback to localStorage
          const localProjects = JSON.parse(localStorage.getItem("projects") || "[]");
          const merged = [...importedItems.map((p, idx) => ({ ...p, id: Date.now() + idx })), ...localProjects];
          localStorage.setItem("projects", JSON.stringify(merged));
        }

        fetchProjects();
        broadcastRealtimeEvent("PROJECTS_UPDATED");
      }

      showImportResultAlert({
        successCount: importedItems.length,
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

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Manajemen Proyek Portofolio
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Tambah, edit, hapus, atau unggah massal proyek portofolio yang ditampilkan di situs.
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

          {/* Upload Button */}
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
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs sm:text-sm hover:bg-emerald-500 transition-colors shadow-sm self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Proyek</span>
          </button>
        </div>
      </div>

      {/* Modal: Create */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                Create New Project
              </h2>
              <button
                onClick={() => setShowCreate(false)}
                className="text-zinc-400 hover:text-black dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <ProjectForm
              onSubmit={handleCreate}
              onCancel={() => setShowCreate(false)}
              submitLabel="Terbitkan Proyek"
              uploading={uploading}
            />
          </div>
        </div>
      )}

      {/* Modal: Edit */}
      {editProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                Edit Project
              </h2>
              <button
                onClick={() => setEditProject(null)}
                className="text-zinc-400 hover:text-black dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <ProjectForm
              initial={editProject}
              onSubmit={handleUpdate}
              onCancel={() => setEditProject(null)}
              submitLabel="Perbarui Proyek"
              uploading={uploading}
            />
          </div>
        </div>
      )}

      {/* Project Grid */}
      {loading ? (
        <div className="text-center py-12 text-sm text-zinc-500">
          Memuat daftar proyek dari database...
        </div>
      ) : projects.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-zinc-900/40 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <FolderGit2 className="w-10 h-10 text-zinc-400 mx-auto mb-2 opacity-50" />
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Belum ada proyek yang ditambahkan.</p>
          <button
            onClick={() => setShowCreate(true)}
            className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Proyek Pertama</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              onDelete={handleDelete}
              onEdit={setEditProject}
            />
          ))}
        </div>
      )}
    </div>
  );
}
