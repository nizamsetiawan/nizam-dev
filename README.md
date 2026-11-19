# nizam-dev

Modern, high-performance personal portfolio website and full dynamic CMS admin portal built with React, Vite, Tailwind CSS, and Supabase.

## 🚀 Fitur Unggulan

- **100% Dynamic CMS:** Seluruh konten (profil, hero, linimasa karir, pendidikan, proyek, keahlian, sertifikat, layanan, sosial, FAQ) dapat dikelola langsung dari Portal Admin (`/dashboard`).
- **Pola Latar Spektrum Dinamis:** Pilihan pola latar belakang interaktif (Dots, Grid, Cross, Wave, Particles) dengan tingkat intensitas yang dapat dikonfigurasi secara real-time.
- **Tag Keahlian Berwarna:** Palet 10 warna cerdas dengan opsi gaya (Colorful, Outline, Mono) yang dapat disorot pada linimasa karir, kartu proyek, dan matriks keahlian.
- **Ekspor & Impor Massal Excel & CSV:** Unduh template tabel Excel (`.xls`) berheader hijau zamrud (`#10b981`) dan kolom penomoran (`No`), serta impor berkas dengan validasi error detail per baris.
- **Opsi "Lihat Semua" (Expandable):** Pembatasan tampilan awal yang rapi dengan tombol ekspansi halus jika data proyek, karir, keahlian, sertifikat, atau pendidikan berjumlah banyak.
- **Log Pengunjung Lengkap:** Pelacakan otomatis alamat IP, negara/lokasi, jenis perangkat, sistem operasi, browser, resolusi layar, dan waktu kunjungan.
- **Pratinjau Langsung (Live Preview):** Simulator perangkat desktop, tablet, dan ponsel di dalam dashboard admin.
- **Desain Modern 2026:** Dukungan Dark Mode sebagai bawaan, tipografi bersih, aksen zamrud (`#10b981`), dan 100% berbahasa Indonesia.

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons, SweetAlert2
- **Backend / Storage:** Supabase (PostgreSQL & Storage) + LocalStorage Fallback
- **Animasi:** Pure CSS Keyframes & SVG

## 💻 Menjalankan Secara Lokal

```bash
# Instal dependensi
npm install

# Jalankan server pengembangan
npm run dev

# Bangun untuk produksi
npm run build
```
