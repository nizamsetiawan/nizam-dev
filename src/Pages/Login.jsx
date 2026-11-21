import { useState } from 'react';
import { supabase } from "../supabase";
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, Eye, EyeOff, ArrowLeft, ShieldCheck } from 'lucide-react';
import Swal from "sweetalert2";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // Kredensial Administrator
    const ADMIN_EMAIL = "nizamsetiawan15@gmail.com";
    const ADMIN_PASSWORD = "setiawannizam15";

    if (cleanEmail === ADMIN_EMAIL && cleanPassword === ADMIN_PASSWORD) {
      // Set sesi admin aktif
      localStorage.setItem("admin_session", "true");
      localStorage.setItem("admin_email", ADMIN_EMAIL);

      // Coba autentikasi ke Supabase Auth di latar belakang jika tersedia
      try {
        await supabase.auth.signInWithPassword({ email: cleanEmail, password: cleanPassword });
      } catch (err) {
        // Abaikan jika user belum dibuat di Supabase Auth
      }

      Swal.fire({
        title: "Berhasil Masuk!",
        text: "Selamat datang kembali di Portal Admin, Nizam Setiawan.",
        icon: "success",
        confirmButtonColor: "#10b981",
        timer: 1600,
        showConfirmButton: false,
      });

      setTimeout(() => {
        navigate('/dashboard');
      }, 700);
      setLoading(false);
      return;
    }

    // Jika kredensial salah
    Swal.fire({
      title: "Gagal Masuk",
      text: "Alamat email atau kata sandi yang Anda masukkan salah.",
      icon: "error",
      confirmButtonColor: "#10b981",
      confirmButtonText: "Coba Lagi",
    });
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#fafafa] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-7 sm:p-8 space-y-6 shadow-xl shadow-zinc-200/50 dark:shadow-black/60">
          {/* Top Brand / Back link */}
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Beranda</span>
            </Link>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Portal Admin</span>
            </span>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              Masuk Administrator
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              Masukkan kredensial admin Anda untuk mengelola konten, proyek, dan tampilan portofolio.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Alamat Email Admin
              </label>
              <div className="flex items-center bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden focus-within:border-emerald-500 transition-colors">
                <Mail className="w-4 h-4 text-zinc-400 ml-3.5 shrink-0" />
                <input
                  type="email"
                  placeholder="nizamsetiawan15@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-transparent px-3 py-2.5 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 text-sm outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Kata Sandi
              </label>
              <div className="flex items-center bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden focus-within:border-emerald-500 transition-colors">
                <Lock className="w-4 h-4 text-zinc-400 ml-3.5 shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-transparent px-3 py-2.5 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="px-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-semibold text-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <span>Memproses autentikasi...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Masuk ke Dashboard Admin</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
