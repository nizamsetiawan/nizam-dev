import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../supabase";
import {
  MessageSquare,
  Pin,
  Trash2,
  PinOff,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  UserCircle2,
} from "lucide-react";
import Swal from "sweetalert2";

const PAGE_SIZE = 10;

export default function Comments() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("portfolio_comments")
        .select("*")
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });
      setComments(data || []);
    } catch {
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [filter, search]);

  const pin = async (id, value) => {
    await supabase
      .from("portfolio_comments")
      .update({ is_pinned: value })
      .eq("id", id);
    fetchComments();
  };

  const remove = async (id, userName) => {
    Swal.fire({
      title: "Hapus Komentar?",
      text: `Apakah Anda yakin ingin menghapus catatan dari "${userName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#71717a",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await supabase.from("portfolio_comments").delete().eq("id", id);
        fetchComments();
      }
    });
  };

  const filtered = useMemo(() => {
    return comments.filter((c) => {
      const matchFilter =
        filter === "all" ||
        (filter === "pinned" && c.is_pinned) ||
        (filter === "unpinned" && !c.is_pinned);

      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        c.user_name?.toLowerCase().includes(q) ||
        c.content?.toLowerCase().includes(q);

      return matchFilter && matchSearch;
    });
  }, [comments, filter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Moderasi Buku Tamu & Komentar
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Kelola pesan dan ulasan dari pengunjung situs portofolio Anda.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {[
            { id: "all", label: "Semua" },
            { id: "pinned", label: "Disematkan" },
            { id: "unpinned", label: "Belum Disematkan" },
          ].map((item) => {
            const count = comments.filter((c) =>
              item.id === "all" ? true : item.id === "pinned" ? c.is_pinned : !c.is_pinned
            ).length;
            return (
              <button
                key={item.id}
                onClick={() => setFilter(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filter === item.id
                    ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                {item.label} ({count})
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari penulis atau isi komentar..."
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 outline-none focus:border-emerald-500"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black dark:hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-12 text-sm text-zinc-500">
          Memuat komentar dari database...
        </div>
      ) : paginated.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-zinc-900/40 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <MessageSquare className="w-10 h-10 text-zinc-400 mx-auto mb-2 opacity-50" />
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Belum ada catatan atau komentar yang sesuai.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {paginated.map((c) => (
            <div
              key={c.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4 shadow-sm ${
                c.is_pinned
                  ? "bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/30"
                  : "bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800"
              }`}
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {c.profile_image ? (
                  <img
                    src={c.profile_image}
                    alt={c.user_name}
                    className="w-9 h-9 rounded-full object-cover border border-zinc-300 dark:border-zinc-700 shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 text-zinc-400">
                    <UserCircle2 className="w-5 h-5" />
                  </div>
                )}

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      {c.user_name}
                    </h3>
                    {c.is_pinned && (
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-500/20">
                        Disematkan
                      </span>
                    )}
                    <span className="text-[11px] text-zinc-400">
                      {new Date(c.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed break-words">
                    {c.content}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end sm:self-start shrink-0">
                <button
                  onClick={() => pin(c.id, !c.is_pinned)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    c.is_pinned
                      ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                  }`}
                >
                  {c.is_pinned ? (
                    <>
                      <PinOff className="w-3.5 h-3.5" />
                      <span>Lepas Sematan</span>
                    </>
                  ) : (
                    <>
                      <Pin className="w-3.5 h-3.5" />
                      <span>Sematkan</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => remove(c.id, c.user_name)}
                  className="p-2 rounded-xl text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  title="Hapus Komentar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500">
          <div>
            Menampilkan {(page - 1) * PAGE_SIZE + 1} – {Math.min(page * PAGE_SIZE, filtered.length)} dari {filtered.length} komentar
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 disabled:opacity-30"
              title="Halaman Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>Halaman {page} dari {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 disabled:opacity-30"
              title="Halaman Selanjutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
