import React, { useEffect, useState, useCallback, memo } from "react";
import { supabase } from "../supabase";
import CardProject from "../components/CardProject";
import Certificate from "../components/Certificate";
import { CheckCircle2, ChevronDown } from "lucide-react";
import { usePortfolio } from "../context/PortfolioContext";

// ── Shared tag color palettes (cycling by index) ──
const TAG_COLORS_FILL = [
  "bg-blue-100   text-blue-700   dark:bg-blue-900/40   dark:text-blue-300   border border-blue-200   dark:border-blue-800/50",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50",
  "bg-violet-100 text-violet-700  dark:bg-violet-900/40  dark:text-violet-300  border border-violet-200  dark:border-violet-800/50",
  "bg-amber-100  text-amber-700   dark:bg-amber-900/40   dark:text-amber-300   border border-amber-200   dark:border-amber-800/50",
  "bg-rose-100   text-rose-700    dark:bg-rose-900/40    dark:text-rose-300    border border-rose-200    dark:border-rose-800/50",
  "bg-cyan-100   text-cyan-700    dark:bg-cyan-900/40    dark:text-cyan-300    border border-cyan-200    dark:border-cyan-800/50",
  "bg-orange-100 text-orange-700  dark:bg-orange-900/40  dark:text-orange-300  border border-orange-200  dark:border-orange-800/50",
  "bg-teal-100   text-teal-700    dark:bg-teal-900/40    dark:text-teal-300    border border-teal-200    dark:border-teal-800/50",
  "bg-indigo-100 text-indigo-700  dark:bg-indigo-900/40  dark:text-indigo-300  border border-indigo-200  dark:border-indigo-800/50",
  "bg-pink-100   text-pink-700    dark:bg-pink-900/40    dark:text-pink-300    border border-pink-200    dark:border-pink-800/50",
];
const TAG_COLORS_OUTLINE = [
  "border border-blue-400   text-blue-600   dark:text-blue-400",
  "border border-emerald-400 text-emerald-600 dark:text-emerald-400",
  "border border-violet-400  text-violet-600  dark:text-violet-400",
  "border border-amber-400   text-amber-600   dark:text-amber-400",
  "border border-rose-400    text-rose-600    dark:text-rose-400",
  "border border-cyan-400    text-cyan-600    dark:text-cyan-400",
  "border border-orange-400  text-orange-600  dark:text-orange-400",
  "border border-teal-400    text-teal-600    dark:text-teal-400",
  "border border-indigo-400  text-indigo-600  dark:text-indigo-400",
  "border border-pink-400    text-pink-600    dark:text-pink-400",
];
const TAG_MONO = "bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700";

const getTagClass = (style, idx) => {
  const base = "px-3 py-1 text-xs font-semibold rounded-lg transition-colors";
  const i = idx % 10;
  if (style === "colorful") return `${base} ${TAG_COLORS_FILL[i]}`;
  if (style === "outline")  return `${base} ${TAG_COLORS_OUTLINE[i]}`;
  return `${base} ${TAG_MONO}`;
};

const SAMPLE_PROJECTS = [
  {
    id: 1,
    Title: "Modern Portfolio & CMS Dashboard",
    Description: "Portofolio rekayasa web skala produksi dengan sistem komentar real-time, autentikasi Supabase, dan dasbor kontrol CRUD penuh.",
    Img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop",
    Link: "https://github.com/nizamsetiawan/nizam-dev",
    Github: "https://github.com/nizamsetiawan/nizam-dev",
    TechStack: ["React", "Tailwind CSS", "Supabase", "Vite", "PostgreSQL"],
  },
  {
    id: 2,
    Title: "Cloud Inventory & Analytics Hub",
    Description: "Dashboard analitik interaktif dengan pemantauan stok real-time, grafik tren penjualan, kontrol akses berbasis peran, dan ekspor laporan.",
    Img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop",
    Link: "#",
    Github: "https://github.com/nizamsetiawan",
    TechStack: ["React", "TypeScript", "Tailwind CSS", "Chart.js", "REST API"],
  },
  {
    id: 3,
    Title: "E-Commerce Experience Platform",
    Description: "Antarmuka toko daring performan tinggi dengan pencarian instan, manajemen keranjang yang aksesibel, dan checkout mobile mulus.",
    Img: "https://images.unsplash.com/photo-1556742049-0a67c5574f73?q=80&w=800&auto=format&fit=crop",
    Link: "#",
    Github: "https://github.com/nizamsetiawan",
    TechStack: ["React", "Tailwind CSS", "Supabase", "Stripe API"],
  }
];

const SAMPLE_CERTIFICATES = [
  { id: 1, Img: "https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?q=80&w=600&auto=format&fit=crop" },
  { id: 2, Img: "https://images.unsplash.com/photo-1589330694653-dad6d3240a2b?q=80&w=600&auto=format&fit=crop" },
  { id: 3, Img: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=600&auto=format&fit=crop" },
  { id: 4, Img: "https://images.unsplash.com/photo-1523289333742-be1143f6b766?q=80&w=600&auto=format&fit=crop" }
];

const Portofolio = () => {
  const { config, accent, containerClass, cardRadiusClass } = usePortfolio();
  const [projects, setProjects] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  const sections = config?.sections || {};
  const skillTagStyle = config?.appearance?.skillTagStyle ?? "colorful";

  const [showAllProjects, setShowAllProjects] = useState(false);
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [showAllCerts, setShowAllCerts] = useState(false);

  const INITIAL_PROJECTS = 6;
  const INITIAL_SKILLS = 4;
  const INITIAL_CERTS = 8;

  // If projects, skills, and certificates are all disabled, don't render this block
  if (sections.projects === false && sections.skills === false && sections.certificates === false) {
    return null;
  }

  const skillsCategories = config?.skillsCategories || [];

  const fetchData = useCallback(async () => {
    try {
      const [projectsResponse, certificatesResponse] = await Promise.all([
        supabase.from("projects").select("*").order("id", { ascending: false }),
        supabase.from("certificates").select("*").order("id", { ascending: false }),
      ]);

      const projectData = projectsResponse.data && projectsResponse.data.length > 0
        ? projectsResponse.data
        : SAMPLE_PROJECTS;

      const certificateData = certificatesResponse.data && certificatesResponse.data.length > 0
        ? certificatesResponse.data
        : SAMPLE_CERTIFICATES;

      setProjects(projectData);
      setCertificates(certificateData);

      localStorage.setItem("projects", JSON.stringify(projectData));
      localStorage.setItem("certificates", JSON.stringify(certificateData));
      window.dispatchEvent(new Event("portfolioDataUpdated"));
    } catch (err) {
      console.warn("Using local projects due to offline/placeholder Supabase:", err.message);
      setProjects(SAMPLE_PROJECTS);
      setCertificates(SAMPLE_CERTIFICATES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const visibleProjects = showAllProjects ? projects : projects.slice(0, INITIAL_PROJECTS);
  const visibleSkills = showAllSkills ? skillsCategories : skillsCategories.slice(0, INITIAL_SKILLS);
  const visibleCerts = showAllCerts ? certificates : certificates.slice(0, INITIAL_CERTS);

  return (
    <div id="Portofolio" className={`py-20 px-4 sm:px-6 lg:px-8 ${containerClass} mx-auto space-y-24 border-t border-zinc-200 dark:border-zinc-800/80`}>
      {/* SECTION 1: PROJECTS (Toggleable) */}
      {sections.projects !== false && (
        <div>
          <div className="space-y-2 mb-8">
            <div className={`text-xs font-semibold uppercase tracking-wider ${accent.text}`}>
              Hasil Karya Terpilih
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              Proyek Portofolio
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
              Koleksi aplikasi web yang mendemonstrasikan arsitektur kode bersih, kemudahan penggunaan, dan kapabilitas full-stack modern.
            </p>
          </div>

          {/* Project Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleProjects.map((project, idx) => (
              <CardProject
                key={project.id || idx}
                Img={project.Img}
                Title={project.Title}
                Description={project.Description}
                Link={project.Link}
                Github={project.Github}
                TechStack={project.TechStack}
                id={project.id}
              />
            ))}
          </div>

          {projects.length > INITIAL_PROJECTS && (
            <div className="pt-8 text-center">
              <button
                onClick={() => setShowAllProjects(!showAllProjects)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-all shadow-sm active:scale-95"
              >
                <span>
                  {showAllProjects
                    ? "Tampilkan Lebih Sedikit"
                    : `Lihat Semua Proyek (${projects.length})`}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    showAllProjects ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: TECHNICAL SKILLS MATRIX (Toggleable) */}
      {sections.skills !== false && skillsCategories.length > 0 && (
        <div id="Skills" className="space-y-8 pt-4">
          <div className="space-y-2 mb-8">
            <div className={`text-xs font-semibold uppercase tracking-wider ${accent.text}`}>
              Kompetensi Inti
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              Keahlian Teknis & Matriks Spesialisasi
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
              Daftar terstruktur bahasa pemrograman, framework, alat pengembang, dan metodologi rekayasa web.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visibleSkills.map((cat, idx) => (
              <div
                key={cat.id || idx}
                className={`p-5 sm:p-6 ${cardRadiusClass} bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700/80 transition-colors space-y-3 shadow-sm`}
              >
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <CheckCircle2 className={`w-4 h-4 ${accent.text}`} />
                    {cat.category}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{cat.description}</p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {cat.skills.map((skill, sIdx) => (
                    <span
                      key={skill}
                      className={getTagClass(skillTagStyle, sIdx)}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {skillsCategories.length > INITIAL_SKILLS && (
            <div className="pt-4 text-center">
              <button
                onClick={() => setShowAllSkills(!showAllSkills)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-all shadow-sm active:scale-95"
              >
                <span>
                  {showAllSkills
                    ? "Tampilkan Lebih Sedikit"
                    : `Lihat Semua Matriks Keahlian (${skillsCategories.length})`}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    showAllSkills ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: CERTIFICATES & CREDENTIALS (Toggleable) */}
      {sections.certificates !== false && certificates.length > 0 && (
        <div id="Certificates" className="space-y-8 pt-4">
          <div className="space-y-2 mb-8">
            <div className={`text-xs font-semibold uppercase tracking-wider ${accent.text}`}>
              Kredensial Resmi
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              Sertifikat & Akreditasi
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
              Pelatihan bersertifikat, kursus profesional, dan validasi kompetensi teknis.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {visibleCerts.map((cert, idx) => (
              <Certificate key={cert.id || idx} ImgSertif={cert.Img} />
            ))}
          </div>

          {certificates.length > INITIAL_CERTS && (
            <div className="pt-4 text-center">
              <button
                onClick={() => setShowAllCerts(!showAllCerts)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-all shadow-sm active:scale-95"
              >
                <span>
                  {showAllCerts
                    ? "Tampilkan Lebih Sedikit"
                    : `Lihat Semua Sertifikat (${certificates.length})`}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    showAllCerts ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default memo(Portofolio);
