import { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import { Award, Upload, Trash2, ImageIcon } from "lucide-react";
import Swal from "sweetalert2";

export default function Certificates() {
  const [certs, setCerts] = useState([]);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

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

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;

    if (f.size > 5 * 1024 * 1024) {
      Swal.fire({
        title: "Ukuran Berkas Terlalu Besar",
        text: "Maksimal ukuran gambar sertifikat adalah 5MB.",
        icon: "warning",
        confirmButtonColor: "#10b981",
      });
      return;
    }

    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const filePath = `certificates/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("certificate-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("certificate-images").getPublicUrl(filePath);

      const { error: insertError } = await supabase
        .from("certificates")
        .insert([{ Img: publicUrl }]);

      if (insertError) throw insertError;

      setFile(null);
      setPreview(null);
      fetchCerts();

      Swal.fire({
        title: "Sertifikat Berhasil Diunggah!",
        text: "Sertifikat telah ditambahkan ke galeri kredensial Anda.",
        icon: "success",
        confirmButtonColor: "#10b981",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        title: "Gagal Mengunggah",
        text: err.message || "Terjadi kesalahan saat mengunggah sertifikat.",
        icon: "error",
        confirmButtonColor: "#10b981",
      });
    } finally {
      setUploading(false);
    }
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
        Swal.fire({
          title: "Sertifikat Dihapus",
          icon: "success",
          confirmButtonColor: "#10b981",
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
          Unggah dan kelola sertifikat kursus, pelatihan, dan akreditasi profesional.
        </p>
      </div>

      {/* Upload Box */}
      <form
        onSubmit={handleUpload}
        className="p-6 rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm"
      >
        <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
          Unggah Sertifikat Baru
        </h2>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <label className="flex-1 w-full flex items-center gap-4 bg-zinc-50 dark:bg-zinc-800 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-4 cursor-pointer hover:border-emerald-500 transition-all">
            {preview ? (
              <img
                src={preview}
                alt="preview"
                className="h-16 w-24 object-cover rounded-lg border border-zinc-200 dark:border-zinc-700"
              />
            ) : (
              <div className="w-24 h-16 rounded-lg bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-zinc-400" />
              </div>
            )}
            <div>
              <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                {preview ? "Ganti gambar sertifikat" : "Pilih gambar sertifikat untuk diunggah"}
              </p>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                PNG, JPG, WEBP (Maks. 5MB)
              </p>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          <button
            type="submit"
            disabled={!file || uploading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-emerald-600 text-white font-semibold text-xs sm:text-sm hover:bg-emerald-500 transition-colors shadow-sm disabled:opacity-40"
          >
            <Upload className="w-4 h-4" />
            <span>{uploading ? "Mengunggah..." : "Unggah Sertifikat"}</span>
          </button>
        </div>
      </form>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-12 text-sm text-zinc-500">
          Memuat daftar sertifikat...
        </div>
      ) : certs.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-zinc-900/40 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <Award className="w-10 h-10 text-zinc-400 mx-auto mb-3 opacity-50" />
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Belum ada sertifikat yang diunggah.
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            Gunakan formulir di atas untuk menambahkan sertifikat pertama Anda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {certs.map((c) => (
            <div
              key={c.id}
              className="group relative overflow-hidden rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                <img
                  src={c.Img}
                  alt="Sertifikat"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="p-2 flex justify-end bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  onClick={() => handleDelete(c.id)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-semibold transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
