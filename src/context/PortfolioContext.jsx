import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../supabase";

const DEFAULT_CONFIG = {
  profile: {
    name: "Eki Zulfar Rachman",
    initials: "EZ",
    role: "Software Engineer & Spesialis Frontend",
    location: "Indonesia (WIB / UTC+7) • Siap Remote & Hybrid",
    availabilityLabel: "Tersedia Segera",
    isAvailable: true,
    statusText: "Tersedia untuk Pekerjaan Penuh Waktu & Kontrak",
    photoUrl: "/Photo.jpeg",
    resumeUrl: "/Resume.pdf",
    contactEmail: "ekizulfarrachman@gmail.com",
  },
  hero: {
    headlinePrefix: "Membangun aplikasi web yang bersih, cepat, dan",
    headlineAccent: "berdampak tinggi",
    headlineSuffix: "dengan arsitektur modern.",
    bio: "Rekayasa perangkat lunak dengan fokus pada performa frontend, sistem komponen modern, dan integrasi backend cloud yang andal serta mudah digunakan.",
    primaryCtaText: "Jelajahi Proyek",
    secondaryCtaText: "Hubungi Saya",
  },
  metrics: [
    { value: "3+ Tahun", label: "Pengalaman Web", subtext: "Teknologi & UI Modern" },
    { value: "15+", label: "Proyek Selesai", subtext: "Produksi & Open Source" },
    { value: "100%", label: "Desain Responsif", subtext: "Optimal di Semua Layar" },
    { value: "< 24 Jam", label: "Waktu Respon", subtext: "Komunikasi Cepat" },
  ],
  socials: {
    github: "https://github.com/EkiZR",
    linkedin: "https://linkedin.com/in/ekizr",
    email: "ekizulfarrachman@gmail.com",
    twitter: "",
    instagram: "",
  },
  socialLinksList: [
    {
      id: "soc-1",
      platform: "GitHub",
      handle: "@EkiZR",
      url: "https://github.com/EkiZR",
      description: "Repositori kode open-source, portofolio, dan kontribusi publik.",
      icon: "Github",
    },
    {
      id: "soc-2",
      platform: "LinkedIn",
      handle: "Eki Zulfar Rachman",
      url: "https://linkedin.com/in/ekizr",
      description: "Jaringan profesional, riwayat karir formal, dan rekomendasi.",
      icon: "Linkedin",
    },
    {
      id: "soc-3",
      platform: "Email Langsung",
      handle: "ekizulfarrachman@gmail.com",
      url: "mailto:ekizulfarrachman@gmail.com",
      description: "Saluran utama untuk tawaran pekerjaan, proyek, atau kolaborasi.",
      icon: "Mail",
    },
    {
      id: "soc-4",
      platform: "X / Twitter",
      handle: "@EkiZR",
      url: "https://twitter.com",
      description: "Opini teknologi seputar ekosistem web modern dan produktivitas.",
      icon: "Twitter",
    },
  ],
  services: [
    {
      id: "srv-1",
      title: "Pengembangan Frontend Modern",
      description: "Membangun antarmuka web interaktif, performa tinggi, dan ramah SEO menggunakan React.js, Vite, dan Tailwind CSS.",
      icon: "Layout",
    },
    {
      id: "srv-2",
      title: "Panel Admin & Sistem CMS Dinamis",
      description: "Arsitektur dashboard kontrol lengkap dengan autentikasi aman, formulir CRUD real-time, dan pratinjau responsif.",
      icon: "Database",
    },
    {
      id: "srv-3",
      title: "Integrasi Supabase & Cloud Backend",
      description: "Pengelolaan database PostgreSQL, Row Level Security (RLS), autentikasi pengguna, dan penyimpanan berkas media cloud.",
      icon: "Cloud",
    },
    {
      id: "srv-4",
      title: "Audit Performa Web & Aksesibilitas",
      description: "Optimasi Core Web Vitals, waktu pemuatan halaman di bawah 1 detik, serta standar HTML semantik yang ramah pembaca layar.",
      icon: "Zap",
    },
  ],
  about: {
    tag: "Latar Belakang",
    title: "Tentang Saya",
    description: "Ringkasan singkat mengenai identitas saya, filosofi rekayasa perangkat lunak, dan dedikasi dalam membangun produk digital.",
    paragraph1: "Saya adalah seorang web developer yang berfokus pada penciptaan produk digital yang responsif, tangguh, dan mudah diakses. Ketertarikan saya berawal dari cara sistem jaringan menghubungkan banyak orang, yang kemudian berkembang menjadi kecintaan dalam merancang aplikasi web modern.",
    paragraph2: "Dibandingkan mengejar tren visual yang berlebihan atau animasi yang memberatkan pengguna, saya memprioritaskan performa, kejelasan kode, dan nilai fungsional nyata. Baik saat mengembangkan dashboard admin yang dinamis maupun mengonfigurasi basis data cloud dengan Supabase, saya selalu berkomitmen menghasilkan sistem yang andal dan mudah dirawat.",
    paragraph3: "Saya terus memperdalam keahlian di ekosistem JavaScript/TypeScript modern, arsitektur serverless, serta interaksi antarmuka yang membuat data kompleks menjadi sederhana dan nyaman dijelajahi.",
  },
  principles: [
    {
      title: "Kode Bersih & Mudah Dirawat",
      text: "Menulis kode modular yang terdokumentasi dengan baik, menggunakan komponen reusable dan alur state yang terprediksi.",
    },
    {
      title: "Performa Tinggi & SEO",
      text: "Mengejar skor Lighthouse 95+ dengan teknik pemuatan cerdas, optimasi aset, dan struktur HTML semantik.",
    },
    {
      title: "Arsitektur Pragmatis",
      text: "Memilih alat yang tepat untuk kebutuhan yang ada, mengutamakan solusi yang sederhana, kokoh, dan berorientasi jangka panjang.",
    },
  ],
  experiences: [
    {
      id: "exp-1",
      role: "Frontend Developer & Web Specialist",
      company: "Freelance / Independen",
      period: "2023 — Sekarang",
      location: "Indonesia (Remote / Hybrid)",
      description: "Merancang dan membangun aplikasi web kustom untuk klien, berfokus pada antarmuka responsif, optimasi performa SEO, integrasi cloud Supabase, dan dashboard interaktif.",
      skills: ["React.js", "Vite", "Tailwind CSS", "Supabase", "REST API", "Git"],
    },
    {
      id: "exp-2",
      role: "Kreator & Pengembang Open Source",
      company: "Portofolio V5 & Proyek Komunitas",
      period: "2024 — Sekarang",
      location: "GitHub",
      description: "Mengembangkan template portofolio dan sistem CMS berbasis open source. Menerapkan keamanan Row Level Security (RLS), panel admin full CRUD, dan komunikasi data real-time.",
      skills: ["PostgreSQL", "Realtime WebSockets", "Framer Motion", "UI/UX Design"],
    },
    {
      id: "exp-3",
      role: "Pendidikan Teknik Jaringan & Telekomunikasi",
      company: "Pelatihan Akademik & Praktik",
      period: "2021 — 2024",
      location: "Indonesia",
      description: "Membangun fondasi kuat dalam arsitektur jaringan komputer, protokol komunikasi data klien-server, dan pemecahan masalah sistematis.",
      skills: ["Jaringan Komputer", "Protokol Sistem", "Linux", "Troubleshooting"],
    },
  ],
  education: [
    {
      id: "edu-1",
      degree: "Pendidikan Vokasi / Teknik Komputer & Jaringan",
      institution: "Institusi Pendidikan Teknik",
      period: "2021 — 2024",
      description: "Mempelajari dasar-dasar jaringan komputer, sistem operasi, algoritma pemrograman, dan rekayasa web.",
      grade: "Predikat Memuaskan",
    },
  ],
  skillsCategories: [
    {
      id: "cat-1",
      category: "Rekayasa Frontend",
      description: "Teknologi utama untuk membangun antarmuka pengguna yang cepat dan responsif.",
      skills: ["React.js", "JavaScript (ES6+)", "TypeScript", "Tailwind CSS", "Vite", "HTML5 & CSS3", "Framer Motion", "Material UI"],
    },
    {
      id: "cat-2",
      category: "Backend & Basis Data",
      description: "Pengelolaan data, layanan cloud, dan arsitektur integrasi API.",
      skills: ["Supabase", "PostgreSQL", "Node.js", "Express.js", "RESTful API", "Row Level Security (RLS)", "Realtime WebSockets"],
    },
    {
      id: "cat-3",
      category: "DevOps & Alat Pengembang",
      description: "Kontrol versi, alur deployment, dan lingkungan kerja pengembang.",
      skills: ["Git & GitHub", "Vercel", "npm / yarn", "Postman", "Dasar Linux", "ESLint / Prettier", "VS Code"],
    },
    {
      id: "cat-4",
      category: "Standar & Praktik Terbaik",
      description: "Metodologi dan standar kualitas yang diterapkan dalam setiap proyek.",
      skills: ["Desain Responsif", "Performa Web (Core Web Vitals)", "Component-Driven Dev", "HTML Semantik", "Arsitektur Kode Bersih"],
    },
  ],
  faq: [
    {
      id: "faq-1",
      question: "Apakah Anda siap menerima tawaran pekerjaan Full-time atau Kontrak?",
      answer: "Ya, saya sangat terbuka untuk peluang kerja Penuh Waktu (Full-time), Kontrak (Contract), maupun proyek Freelance terarah baik secara Remote maupun On-site/Hybrid.",
    },
    {
      id: "faq-2",
      question: "Apa teknologi utama yang Anda kuasai?",
      answer: "Fokus utama saya mencakup ekosistem React.js, Tailwind CSS, Vite, TypeScript/JavaScript modern, serta backend cloud Supabase (PostgreSQL, Auth, Storage, Edge Functions).",
    },
    {
      id: "faq-3",
      question: "Berapa lama estimasi pengerjaan sebuah situs web atau aplikasi?",
      answer: "Waktu pengerjaan bervariasi bergantung pada skala. Portofolio atau landing page berkinerja tinggi rata-rata memerlukan 3–7 hari kerja, sedangkan aplikasi web dengan dashboard dinamis memerlukan 2–4 minggu.",
    },
    {
      id: "faq-4",
      question: "Bagaimana alur komunikasi selama proses pengerjaan?",
      answer: "Komunikasi dilakukan secara transparan melalui email, WhatsApp, atau Discord dengan pembaruan progress berkala melalui staging link interaktif.",
    },
  ],
  contact: {
    tag: "Mulai Terhubung",
    title: "Mari Berkolaborasi & Membangun Bersama",
    description: "Apakah Anda memiliki peluang karir, tawaran proyek, atau ingin berdiskusi seputar teknologi, kotak masuk saya selalu terbuka untuk Anda.",
    responseTime: "Perkiraan waktu respon: kurang dari 24 jam",
    locationNote: "Indonesia (WIB / UTC+7) • Siap Bekerja Remote",
  },
  sections: {
    hero: true,
    about: true,
    experiences: true,
    services: true,
    projects: true,
    skills: true,
    education: true,
    certificates: true,
    socialHub: true,
    faq: true,
    contact: true,
    guestbook: true,
  },
  elements: {
    heroStatusBadge: true,
    heroMetrics: true,
    heroResumeBtn: true,
    heroContactBtn: true,
    heroTechPills: false, // Default false to eliminate redundancy with Skills matrix!
    aboutPhoto: true,
    aboutInfoCard: true,
    aboutPrinciples: true,
    contactDirectEmail: true,
    contactForm: true,
  },
  appearance: {
    accentColor: "emerald",       // emerald | blue | violet | amber | rose | zinc
    defaultTheme: "dark",         // dark | light
    fontSizeScale: "normal",      // compact | normal | large
    containerWidth: "6xl",        // 5xl | 6xl | 7xl | full
    borderRadius: "xl",           // none | md | xl | 2xl
    layoutDensity: "comfortable", // compact | comfortable | spacious
    bgStyle: "dots",              // none | dots | grid | cross | wave | particles
    bgIntensity: "medium",        // subtle | medium | vivid
    skillTagStyle: "colorful",    // mono | colorful | outline
  },
  footer: {
    note: "Dirancang dengan standar rekayasa web modern",
  },
};

const PortfolioContext = createContext();

export const PortfolioProvider = ({ children }) => {
  const [config, setConfig] = useState(() => {
    try {
      const saved = localStorage.getItem("portfolio_dynamic_config_id");
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_CONFIG,
          ...parsed,
          sections: { ...DEFAULT_CONFIG.sections, ...(parsed.sections || {}) },
          elements: { ...DEFAULT_CONFIG.elements, ...(parsed.elements || {}) },
          appearance: { ...DEFAULT_CONFIG.appearance, ...(parsed.appearance || {}) },
        };
      }
    } catch (e) {
      console.warn("Gagal memuat konfigurasi portofolio:", e);
    }
    return DEFAULT_CONFIG;
  });

  // Apply root font scale dynamically
  useEffect(() => {
    const scale = config?.appearance?.fontSizeScale || "normal";
    if (scale === "compact") {
      document.documentElement.style.fontSize = "15px";
    } else if (scale === "large") {
      document.documentElement.style.fontSize = "17px";
    } else {
      document.documentElement.style.fontSize = "16px";
    }
  }, [config?.appearance?.fontSizeScale]);

  // Synchronize Tab Favicon (Monogram Initials) and Document Title (Full Name) dynamically
  useEffect(() => {
    const profile = config?.profile || {};
    const initials = (profile.initials || "NZ").trim().toUpperCase();
    const name = profile.name || "Nizam";
    const role = profile.role || "Software Engineer";

    // 1. Dynamic Tab Title
    if (name) {
      document.title = role ? `${name} — ${role}` : name;
    }

    // 2. Dynamic Tab Icon (SVG Favicon with Navbar Monogram style)
    const fontSize = initials.length > 2 ? 22 : 28;
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect width="64" height="64" rx="18" fill="%2309090b"/>
      <rect x="2" y="2" width="60" height="60" rx="16" fill="none" stroke="%2327272a" stroke-width="3"/>
      <text x="50%" y="54%" dominant-baseline="central" text-anchor="middle" fill="%23ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="${fontSize}" letter-spacing="-0.5">${initials}</text>
    </svg>`;

    const faviconUri = `data:image/svg+xml,${svgContent.replace(/\n\s+/g, " ")}`;

    let link = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.type = "image/svg+xml";
    link.href = faviconUri;
  }, [config?.profile?.initials, config?.profile?.name, config?.profile?.role]);

  useEffect(() => {
    const loadFromSupabase = async () => {
      try {
        const { data } = await supabase
          .from("portfolio_settings")
          .select("config")
          .single();

        if (data && data.config) {
          setConfig((prev) => {
            const merged = {
              ...prev,
              ...data.config,
              sections: { ...prev.sections, ...(data.config.sections || {}) },
              elements: { ...prev.elements, ...(data.config.elements || {}) },
              appearance: { ...prev.appearance, ...(data.config.appearance || {}) },
            };
            localStorage.setItem("portfolio_dynamic_config_id", JSON.stringify(merged));
            return merged;
          });
        }
      } catch (err) {
        // Fallback to local storage
      }
    };

    loadFromSupabase();
  }, []);

  const updateConfig = async (newConfig) => {
    setConfig(newConfig);
    localStorage.setItem("portfolio_dynamic_config_id", JSON.stringify(newConfig));
    window.dispatchEvent(new Event("portfolioConfigUpdated"));

    try {
      await supabase.from("portfolio_settings").upsert({
        id: "main_config",
        config: newConfig,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      // Graceful fallback
    }
  };

  const resetToDefaults = () => {
    updateConfig(DEFAULT_CONFIG);
  };

  const getAccentColor = () => {
    const color = config?.appearance?.accentColor || "emerald";
    switch (color) {
      case "blue":
        return {
          text: "text-blue-600 dark:text-blue-400",
          hoverText: "hover:text-blue-700 dark:hover:text-blue-300",
          bg: "bg-blue-600 dark:bg-blue-500",
          bgSubtle: "bg-blue-500/10",
          border: "border-blue-500/30",
          dot: "bg-blue-500",
          ping: "bg-blue-400",
          ring: "focus:ring-blue-500",
          badge: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60",
          name: "Biru Kobalt",
          hex: "#3b82f6",
        };
      case "violet":
        return {
          text: "text-violet-600 dark:text-violet-400",
          hoverText: "hover:text-violet-700 dark:hover:text-violet-300",
          bg: "bg-violet-600 dark:bg-violet-500",
          bgSubtle: "bg-violet-500/10",
          border: "border-violet-500/30",
          dot: "bg-violet-500",
          ping: "bg-violet-400",
          ring: "focus:ring-violet-500",
          badge: "bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800/60",
          name: "Violet Modern",
          hex: "#8b5cf6",
        };
      case "amber":
        return {
          text: "text-amber-600 dark:text-amber-400",
          hoverText: "hover:text-amber-700 dark:hover:text-amber-300",
          bg: "bg-amber-600 dark:bg-amber-500",
          bgSubtle: "bg-amber-500/10",
          border: "border-amber-500/30",
          dot: "bg-amber-500",
          ping: "bg-amber-400",
          ring: "focus:ring-amber-500",
          badge: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60",
          name: "Amber Hangat",
          hex: "#f59e0b",
        };
      case "rose":
        return {
          text: "text-rose-600 dark:text-rose-400",
          hoverText: "hover:text-rose-700 dark:hover:text-rose-300",
          bg: "bg-rose-600 dark:bg-rose-500",
          bgSubtle: "bg-rose-500/10",
          border: "border-rose-500/30",
          dot: "bg-rose-500",
          ping: "bg-rose-400",
          ring: "focus:ring-rose-500",
          badge: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60",
          name: "Mawar Elegan",
          hex: "#f43f5e",
        };
      case "zinc":
        return {
          text: "text-zinc-900 dark:text-zinc-100",
          hoverText: "hover:text-zinc-700 dark:hover:text-zinc-300",
          bg: "bg-zinc-900 dark:bg-zinc-100",
          bgSubtle: "bg-zinc-500/10",
          border: "border-zinc-500/30",
          dot: "bg-zinc-700 dark:bg-zinc-300",
          ping: "bg-zinc-500",
          ring: "focus:ring-zinc-500",
          badge: "bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-800",
          name: "Monokrom Zinc",
          hex: "#71717a",
        };
      case "emerald":
      default:
        return {
          text: "text-emerald-600 dark:text-emerald-400",
          hoverText: "hover:text-emerald-700 dark:hover:text-emerald-300",
          bg: "bg-emerald-600 dark:bg-emerald-500",
          bgSubtle: "bg-emerald-500/10",
          border: "border-emerald-500/30",
          dot: "bg-emerald-500",
          ping: "bg-emerald-400",
          ring: "focus:ring-emerald-500",
          badge: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60",
          name: "Hijau Zamrud (Emerald)",
          hex: "#10b981",
        };
    }
  };

  const getContainerClass = () => {
    const w = config?.appearance?.containerWidth || "6xl";
    switch (w) {
      case "5xl":
        return "max-w-5xl";
      case "7xl":
        return "max-w-7xl";
      case "full":
        return "max-w-[1400px]";
      case "6xl":
      default:
        return "max-w-6xl";
    }
  };

  const getCardRadiusClass = () => {
    const r = config?.appearance?.borderRadius || "xl";
    switch (r) {
      case "none":
        return "rounded-none";
      case "md":
        return "rounded-xl";
      case "2xl":
        return "rounded-3xl";
      case "xl":
      default:
        return "rounded-2xl";
    }
  };

  const getButtonRadiusClass = () => {
    const r = config?.appearance?.borderRadius || "xl";
    switch (r) {
      case "none":
        return "rounded-none";
      case "md":
        return "rounded-md";
      case "2xl":
        return "rounded-2xl";
      case "xl":
      default:
        return "rounded-xl";
    }
  };

  return (
    <PortfolioContext.Provider
      value={{
        config,
        updateConfig,
        resetToDefaults,
        accent: getAccentColor(),
        containerClass: getContainerClass(),
        cardRadiusClass: getCardRadiusClass(),
        buttonRadiusClass: getButtonRadiusClass(),
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error("usePortfolio harus digunakan di dalam PortfolioProvider");
  }
  return context;
};
