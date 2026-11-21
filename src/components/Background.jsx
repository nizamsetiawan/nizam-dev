import React, { useMemo, useState, useEffect } from "react";
import { usePortfolio } from "../context/PortfolioContext";

// Pre-calculated floating cosmic particle positions (no heavy JS loop)
const PARTICLE_POSITIONS = [
  { top: "6%",  left: "10%", size: 3, delay: "0s",    dur: "7s",   color: "primary" },
  { top: "14%", left: "82%", size: 4, delay: "1.2s",  dur: "9s",   color: "secondary" },
  { top: "25%", left: "32%", size: 5, delay: "2.4s",  dur: "8s",   color: "primary" },
  { top: "38%", left: "90%", size: 3, delay: "0.8s",  dur: "10s",  color: "accent" },
  { top: "52%", left: "6%",  size: 4, delay: "3.2s",  dur: "7.5s", color: "secondary" },
  { top: "60%", left: "50%", size: 3, delay: "1.6s",  dur: "9.5s", color: "primary" },
  { top: "72%", left: "20%", size: 5, delay: "2.8s",  dur: "8.5s", color: "accent" },
  { top: "82%", left: "75%", size: 4, delay: "0.5s",  dur: "6.5s", color: "primary" },
  { top: "92%", left: "42%", size: 3, delay: "3.8s",  dur: "11s",  color: "secondary" },
  { top: "4%",  left: "58%", size: 4, delay: "4.2s",  dur: "8s",   color: "primary" },
  { top: "32%", left: "70%", size: 3, delay: "1.4s",  dur: "9s",   color: "secondary" },
  { top: "68%", left: "94%", size: 5, delay: "3.0s",  dur: "7s",   color: "primary" },
  { top: "18%", left: "6%",  size: 3, delay: "0.4s",  dur: "11s",  color: "accent" },
  { top: "46%", left: "28%", size: 4, delay: "2.0s",  dur: "8.5s", color: "primary" },
  { top: "86%", left: "14%", size: 3, delay: "3.5s",  dur: "9s",   color: "secondary" },
  { top: "10%", left: "94%", size: 4, delay: "0.7s",  dur: "7.5s", color: "primary" },
  { top: "78%", left: "48%", size: 3, delay: "2.1s",  dur: "10s",  color: "accent" },
  { top: "22%", left: "45%", size: 4, delay: "1.9s",  dur: "8.5s", color: "primary" },
  { top: "64%", left: "12%", size: 3, delay: "0.9s",  dur: "9.2s", color: "secondary" },
  { top: "84%", left: "88%", size: 5, delay: "3.6s",  dur: "7.8s", color: "primary" },
];

const getPatternStyle = (bgStyle, opacity) => {
  switch (bgStyle) {
    case "grid":
    case "cybergrid":
      return {
        backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(to right, currentColor 1px, transparent 1px)`,
        backgroundSize: "44px 44px",
        opacity,
      };
    case "cross":
      return {
        backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(to right, currentColor 1px, transparent 1px)`,
        backgroundSize: "22px 22px",
        backgroundPosition: "11px 11px",
        opacity,
      };
    case "dots":
    case "aurora":
    case "spectrum":
    default:
      return {
        backgroundImage: `radial-gradient(currentColor 1px, transparent 1px)`,
        backgroundSize: "28px 28px",
        opacity: bgStyle === "aurora" || bgStyle === "spectrum" ? opacity * 0.75 : opacity,
      };
  }
};

const AnimatedBackground = () => {
  const { config, accent } = usePortfolio();
  const bgStyle = config?.appearance?.bgStyle ?? "aurora";
  const bgIntensity = config?.appearance?.bgIntensity ?? "medium";

  // Cursor position for subtle interactive spotlight
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    let animId;
    const handlePointerMove = (e) => {
      cancelAnimationFrame(animId);
      animId = requestAnimationFrame(() => {
        setMousePos({ x: e.clientX, y: e.clientY });
      });
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  const opacityMultiplier =
    bgIntensity === "subtle" ? 0.65 :
    bgIntensity === "vivid"  ? 1.5 : 1.0;

  const baseOpacity =
    bgIntensity === "subtle" ? 0.025 :
    bgIntensity === "vivid"  ? 0.075 : 0.045;

  const isNone = bgStyle === "none";
  const isAurora = bgStyle === "aurora";
  const isSpectrum = bgStyle === "spectrum";
  const isCybergrid = bgStyle === "cybergrid";
  const isParticles = bgStyle === "particles";
  const isWave = bgStyle === "wave";
  const hasPattern = !isNone && bgStyle !== "particles";

  const patternStyle = useMemo(
    () => (hasPattern ? getPatternStyle(bgStyle, baseOpacity) : {}),
    [bgStyle, baseOpacity, hasPattern]
  );

  const accentHex = accent?.hex || "#10b981";

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden bg-[#fafafa] dark:bg-[#09090b] transition-colors duration-500">
      {/* Dynamic Keyframes for Spectrum & Aurora animations */}
      <style>{`
        @keyframes aurora-orb-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%      { transform: translate(120px, 80px) scale(1.15); }
          66%      { transform: translate(-80px, 140px) scale(0.92); }
        }
        @keyframes aurora-orb-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%      { transform: translate(-140px, -60px) scale(1.2); }
          66%      { transform: translate(100px, -110px) scale(0.88); }
        }
        @keyframes aurora-orb-3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%      { transform: translate(90px, -90px) scale(0.95); }
          66%      { transform: translate(-110px, 50px) scale(1.12); }
        }
        @keyframes spectrum-wave-1 {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes spectrum-wave-2 {
          0%   { transform: translateX(0); }
          100% { transform: translateX(50%); }
        }
        @keyframes spectrum-pulse {
          0%, 100% { opacity: 0.35; transform: scaleY(1); }
          50%      { opacity: 0.75; transform: scaleY(1.35); }
        }
        @keyframes cyber-scan {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        @keyframes cosmic-twinkle {
          0%, 100% { opacity: 0.15; transform: translateY(0px) scale(1); }
          50%      { opacity: 0.65; transform: translateY(-18px) scale(1.25); }
        }
      `}</style>

      {/* ── 1. EFEK AURORA SPECTRUM MESH (Paling Populer & Modern) ── */}
      {isAurora && (
        <div
          className="absolute inset-0 overflow-hidden transition-opacity duration-700"
          style={{ opacity: 0.42 * opacityMultiplier }}
        >
          {/* Orb Aksen Utama (Sesuai tema yang dipilih admin: Emerald, Blue, Violet, dll) */}
          <div
            className="absolute -top-[10%] left-[15%] w-[680px] h-[680px] rounded-full blur-[110px] mix-blend-screen dark:mix-blend-lighten pointer-events-none"
            style={{
              backgroundColor: accentHex,
              animation: "aurora-orb-1 22s ease-in-out infinite",
            }}
          />

          {/* Orb Spektrum Indigo / Deep Violet */}
          <div
            className="absolute top-[25%] -right-[5%] w-[620px] h-[620px] rounded-full blur-[120px] mix-blend-screen dark:mix-blend-lighten pointer-events-none"
            style={{
              backgroundColor: "#6366f1",
              animation: "aurora-orb-2 26s ease-in-out infinite",
            }}
          />

          {/* Orb Spektrum Cyan / Teal Elektrik */}
          <div
            className="absolute top-[55%] left-[25%] w-[580px] h-[580px] rounded-full blur-[115px] mix-blend-screen dark:mix-blend-lighten pointer-events-none"
            style={{
              backgroundColor: "#06b6d4",
              animation: "aurora-orb-3 20s ease-in-out infinite",
            }}
          />

          {/* Orb Spektrum Magenta / Rose Hangat */}
          <div
            className="absolute -bottom-[10%] right-[20%] w-[540px] h-[540px] rounded-full blur-[130px] mix-blend-screen dark:mix-blend-lighten pointer-events-none opacity-60"
            style={{
              backgroundColor: "#ec4899",
              animation: "aurora-orb-1 30s ease-in-out infinite reverse",
            }}
          />
        </div>
      )}

      {/* ── 2. EFEK SPEKTRUM GELOMBANG AUDIO / FREKUENSI DIGITAL ── */}
      {isSpectrum && (
        <div
          className="absolute inset-0 overflow-hidden transition-opacity duration-700"
          style={{ opacity: 0.48 * opacityMultiplier }}
        >
          {/* Ambient Spectrum Glow di Header */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] blur-[120px] opacity-75"
            style={{
              background: `radial-gradient(circle, ${accentHex} 0%, rgba(99,102,241,0.5) 45%, transparent 75%)`,
            }}
          />

          {/* Sinyal Frekuensi Gelombang Berjalan */}
          <div className="absolute top-[18%] left-0 right-0 h-[220px] opacity-60 overflow-hidden">
            <svg
              className="w-[200%] h-full"
              viewBox="0 0 2880 220"
              preserveAspectRatio="none"
              style={{ animation: "spectrum-wave-1 25s linear infinite" }}
            >
              <defs>
                <linearGradient id="spectrumGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={accentHex} stopOpacity="0.1" />
                  <stop offset="25%" stopColor={accentHex} stopOpacity="0.85" />
                  <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.85" />
                  <stop offset="75%" stopColor="#8b5cf6" stopOpacity="0.85" />
                  <stop offset="100%" stopColor={accentHex} stopOpacity="0.1" />
                </linearGradient>
              </defs>
              <path
                d="M 0,110 Q 180,30 360,110 T 720,110 T 1080,110 T 1440,110 T 1800,110 T 2160,110 T 2520,110 T 2880,110"
                fill="none"
                stroke="url(#spectrumGradient1)"
                strokeWidth="2.5"
              />
              <path
                d="M 0,110 Q 180,180 360,110 T 720,110 T 1080,110 T 1440,110 T 1800,110 T 2160,110 T 2520,110 T 2880,110"
                fill="none"
                stroke="url(#spectrumGradient1)"
                strokeWidth="1.5"
                opacity="0.6"
              />
            </svg>
          </div>

          {/* Equalizer Frequency Bar Spektrum di bagian bawah */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-end gap-2 sm:gap-3 opacity-30">
            {[45, 75, 120, 90, 60, 110, 140, 85, 130, 95, 65, 100, 150, 80, 55].map((h, i) => (
              <div
                key={i}
                className="w-1 sm:w-1.5 rounded-full"
                style={{
                  height: `${h}px`,
                  backgroundColor: i % 2 === 0 ? accentHex : "#8b5cf6",
                  animation: `spectrum-pulse ${1.4 + (i % 5) * 0.3}s ease-in-out infinite`,
                  animationDelay: `${(i * 0.12).toFixed(2)}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── 3. EFEK CYBERGRID 3D PERSPECTIVE DENGAN SCANLINE ── */}
      {isCybergrid && (
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ opacity: 0.38 * opacityMultiplier }}
        >
          {/* Horizon Line Glow */}
          <div
            className="absolute top-1/3 left-0 right-0 h-0.5"
            style={{
              backgroundColor: accentHex,
              boxShadow: `0 0 25px 3px ${accentHex}`,
            }}
          />
          {/* Vertical Scanner Line */}
          <div
            className="absolute left-0 right-0 h-48 bg-gradient-to-b from-transparent via-emerald-500/10 to-transparent pointer-events-none"
            style={{ animation: "cyber-scan 8s linear infinite" }}
          />
        </div>
      )}

      {/* ── 4. CSS PATTERN GRID / DOTS / CROSS ── */}
      {hasPattern && (
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={patternStyle}
        />
      )}

      {/* ── 5. EFEK GELOMBANG ORGANIK (WAVE) ── */}
      {isWave && (
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 1440 800"
          preserveAspectRatio="xMidYMid slice"
          style={{ opacity: baseOpacity * 2 * opacityMultiplier }}
          aria-hidden="true"
        >
          <path
            d="M0,200 C240,100 480,300 720,200 C960,100 1200,300 1440,200 L1440,400 C1200,500 960,300 720,400 C480,500 240,300 0,400 Z"
            className="fill-zinc-900 dark:fill-zinc-100"
            style={{ animation: "aurora-orb-1 16s ease-in-out infinite" }}
          />
          <path
            d="M0,500 C240,400 480,600 720,500 C960,400 1200,600 1440,500 L1440,700 C1200,800 960,600 720,700 C480,800 240,600 0,700 Z"
            className="fill-zinc-900 dark:fill-zinc-100"
            style={{ animation: "aurora-orb-2 20s ease-in-out infinite", opacity: 0.55 }}
          />
        </svg>
      )}

      {/* ── 6. EFEK PARTIKEL KOSMIK BERKILAU (PARTICLES) ── */}
      {isParticles && (
        <>
          {PARTICLE_POSITIONS.map((p, i) => {
            const dotColor =
              p.color === "primary" ? accentHex :
              p.color === "secondary" ? "#3b82f6" : "#a855f7";
            return (
              <div
                key={i}
                className="absolute rounded-full pointer-events-none"
                style={{
                  top: p.top,
                  left: p.left,
                  width: p.size,
                  height: p.size,
                  backgroundColor: dotColor,
                  boxShadow: `0 0 ${p.size * 2}px ${dotColor}`,
                  animation: `cosmic-twinkle ${p.dur} ${p.delay} ease-in-out infinite`,
                }}
              />
            );
          })}
        </>
      )}

      {/* ── 7. INTERACTIVE CURSOR SPOTLIGHT (Menyorot lembut saat kursor digerakkan) ── */}
      {mousePos.x > 0 && mousePos.y > 0 && (
        <div
          className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
          style={{
            background: `radial-gradient(550px circle at ${mousePos.x}px ${mousePos.y}px, ${accentHex}14, transparent 70%)`,
          }}
        />
      )}

      {/* Soft Ambient Top Glow standar */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[350px] bg-gradient-to-b from-zinc-300/30 dark:from-zinc-800/25 via-zinc-200/10 dark:via-zinc-900/10 to-transparent blur-3xl opacity-70" />
    </div>
  );
};

export default AnimatedBackground;
