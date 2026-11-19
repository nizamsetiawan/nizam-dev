import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Home, Compass } from "lucide-react";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 flex items-center justify-center px-4 transition-colors">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Subtle Icon Box */}
        <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mx-auto shadow-sm">
          <Compass className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold tracking-widest text-emerald-600 dark:text-emerald-400 uppercase">
            Error 404
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Halaman yang Anda tuju mungkin telah dipindahkan, diubah tautannya, atau tidak lagi tersedia di situs ini.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Halaman Sebelumnya</span>
          </button>

          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-sm"
          >
            <Home className="w-4 h-4" />
            <span>Beranda Portofolio</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
