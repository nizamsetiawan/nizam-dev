import { useEffect, useState, useRef } from "react";
import { supabase } from "../../supabase";
import { Award, Upload, Trash2, ImageIcon, X, CheckCircle2, Loader2, Plus } from "lucide-react";
import { broadcastRealtimeEvent } from "../../utils/realtimeSync";
import { usePortfolio } from "../../context/PortfolioContext";
import Swal from "sweetalert2";

export default function Certificates() {
  const { accent, cardRadiusClass, buttonRadiusClass } = usePortfolio();
  const [certs, setCerts] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]); // Array of { id, file, preview }
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const fetchCerts = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("certificates")
        .select("*")
        .order("created_at", { ascending: false });
      setCerts(data || []);
    } catch {
      setCerts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCerts();
  }, []);

  const handleFiles = (incomingFiles) => {
    if (!incomingFiles || incomingFiles.length === 0) return;

    const validNewItems = [];
    const oversized = [];

    Array.from(incomingFiles).forEach((f) => {
      if (!f.type.startsWith("image/")) return;

      if (f.size > 10 * 1024 * 1024) {
        oversized.push(f.name);
        return;
      }

      validNewItems.push({
        id: "cert-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
        file: f,
        preview: URL.createObjectURL(f),
      });
    });

    if (oversized.length > 0) {
      Swal.fire({
        title: "Ukuran Gambar Terlalu Besar",
        text: `${oversized.length} berkas dilewati karena melebihi batas 10MB: ${oversized.slice(0, 3).join(", ")}`,
        icon: "warning",
      });
    }

    if (validNewItems.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validNewItems]);
    }
  };

  const handleRemoveSelected = (id) => {
    setSelectedFiles((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.preview) URL.revokeObjectURL(target.preview);
      return prev.filter((item) => item.id !== id);
    });
  };

  const handleClearAll = () => {
    selectedFiles.forEach((item) => {
      if (item.preview) URL.revokeObjectURL(item.preview);
    });
    setSelectedFiles([]);
  };

  const handleUploadAll = async (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(`0 / ${selectedFiles.length}`);

    let uploadedCount = 0;
    const certRecords = [];
    const errors = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const item = selectedFiles[i];
      try {
        const ext = item.file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const filePath = `certificates/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("certificate-images")
          .upload(filePath, item.file, { upsert: true });

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("certificate-images").getPublicUrl(filePath);

        certRecords.push({ Img: publicUrl });
        uploadedCount++;
        setUploadProgress(`${uploadedCount} / ${selectedFiles.length}`);
      } catch (err) {
        errors.push({ name: item.file.name, error: err.message });
      }
    }

    if (certRecords.length > 0) {
      try {
        const { error: insertError } = await supabase
          .from("certificates")
          .insert(certRecords);

        if (insertError) throw insertError;

        handleClearAll();
        fetchCerts();
        broadcastRealtimeEvent("CERTS_UPDATED");

        Swal.fire({
          title: "Sertifikat Berhasil Diunggah!",
          text: `${certRecords.length} berkas sertifikat baru telah ditambahkan ke galeri kredensial Anda.`,
          icon: "success",
          confirmButtonColor: accent.hex || "#10b981",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (err) {
        Swal.fire({
          title: "Gagal Menyimpan ke Database",
          text: err.message,
          icon: "error",
        });
      }
    } else if (errors.length > 0) {
      Swal.fire({
        title: "Gagal Mengunggah Berkas",
        text: errors.map((e) => `${e.name}: ${e.error}`).join("\n"),
        icon: "error",
      });
    }

    setUploading(false);
    setUploadProgress("");
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Hapus Sertifikat?",
      text: "Sertifikat ini akan dihapus permanen dari galeri.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#71717a",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await supabase.from("certificates").delete().eq("id", id);
        fetchCerts();
        broadcastRealtimeEvent("CERTS_UPDATED");
        Swal.fire({
          title: "Sertifikat Dihapus",
          icon: "success",
          confirmButtonColor: accent.hex || "#10b981",
          timer: 1200,
          showConfirmButton: false,
        });
      }
    });
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Sertifikat &amp; Kredensial
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Unggah dan kelola sertifikat kursus, pelatihan, dan akreditasi profesional secara massal (Multi-upload &amp; Drag-and-drop).
        </p>
      </div>

      {/* Drag & Drop Multi-Upload Box */}
      <form
        onSubmit={handleUploadAll}
        className={`p-6 ${cardRadiusClass} bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm`}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
            <Upload className={`w-4 h-4 ${accent.text}`} />
            <span>Unggah Berkas Sertifikat (Multi-Upload)</span>
          </h2>
          {selectedFiles.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs text-rose-500 hover:underline"
            >
              Hapus Semua Pilihan ({selectedFiles.length})
            </button>
          )}
        </div>

        {/* Dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDragging(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
            isDragging
              ? `${accent.border} ${accent.bgSubtle} scale-[1.01]`
              : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 bg-zinc-50/50 dark:bg-zinc-900/50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />

          <div className={`w-12 h-12 rounded-2xl ${accent.bgSubtle} ${accent.border} border flex items-center justify-center`}>
            <ImageIcon className={`w-6 h-6 ${accent.text}`} />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              Seret &amp; Taruh Berkas Gambar di Sini, atau <span className={`${accent.text} underline`}>Pilih Berkas</span>
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Mendukung banyak gambar sekaligus (PNG, JPG, WEBP, maks. 10MB per gambar)
            </p>
          </div>
        </div>

        {/* Selected Files Preview Grid */}
        {selectedFiles.length > 0 && (
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              <span>Berkas yang siap diunggah ({selectedFiles.length} berkas):</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {selectedFiles.map((item, idx) => (
                <div
                  key={item.id}
                  className="relative group rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 aspect-[4/3] bg-zinc-100 dark:bg-zinc-800"
                >
                  <img
                    src={item.preview}
                    alt={item.file.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveSelected(item.id);
                      }}
                      className="p-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-lg"
                      title="Batalkan berkas ini"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="absolute bottom-1 left-1 right-1 px-1.5 py-0.5 rounded bg-black/60 text-[10px] text-white truncate font-mono">
                    {item.file.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        {selectedFiles.length > 0 && (
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={uploading}
              className={`inline-flex items-center gap-2 px-6 py-3 ${buttonRadiusClass} ${accent.bg} text-white font-semibold text-xs sm:text-sm hover:opacity-90 transition-all shadow-md active:scale-95 disabled:opacity-50`}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mengunggah ({uploadProgress})...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Unggah {selectedFiles.length} Sertifikat Sekarang</span>
                </>
              )}
            </button>
          </div>
        )}
      </form>

      {/* Grid of uploaded certs */}
      {loading ? (
        <div className="text-center py-12 text-sm text-zinc-500">
          Memuat daftar sertifikat...
        </div>
      ) : certs.length === 0 ? (
        <div className={`p-12 text-center bg-white dark:bg-zinc-900/40 ${cardRadiusClass} border border-zinc-200 dark:border-zinc-800`}>
          <Award className="w-10 h-10 text-zinc-400 mx-auto mb-3 opacity-50" />
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Belum ada sertifikat yang diunggah.
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            Gunakan area unggah di atas untuk menambahkan sertifikat Anda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {certs.map((c) => (
            <div
              key={c.id}
              className={`group relative overflow-hidden ${cardRadiusClass} bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm`}
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-950">
                <img
                  src={c.Img}
                  alt="Sertifikat"
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <button
                onClick={() => handleDelete(c.id)}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-600/90 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm"
                title="Hapus Sertifikat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
