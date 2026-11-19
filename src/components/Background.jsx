import React, { useMemo } from "react";
import { usePortfolio } from "../context/PortfolioContext";

// Floating particle positions (pre-calculated, no JS animation lib needed)
const PARTICLE_POSITIONS = [
  { top: "8%",  left: "12%", size: 3, delay: "0s",    dur: "6s"   },
  { top: "15%", left: "78%", size: 2, delay: "1s",    dur: "8s"   },
  { top: "28%", left: "35%", size: 4, delay: "2s",    dur: "7s"   },
  { top: "42%", left: "88%", size: 2, delay: "0.5s",  dur: "9s"   },
  { top: "55%", left: "5%",  size: 3, delay: "3s",    dur: "6.5s" },
  { top: "62%", left: "55%", size: 2, delay: "1.5s",  dur: "8.5s" },
  { top: "75%", left: "22%", size: 4, delay: "2.5s",  dur: "7.5s" },
  { top: "80%", left: "70%", size: 3, delay: "0.8s",  dur: "6s"   },
  { top: "90%", left: "40%", size: 2, delay: "3.5s",  dur: "9.5s" },
  { top: "5%",  left: "50%", size: 3, delay: "4s",    dur: "7s"   },
  { top: "35%", left: "65%", size: 2, delay: "1.2s",  dur: "8s"   },
  { top: "70%", left: "92%", size: 4, delay: "2.8s",  dur: "6s"   },
  { top: "20%", left: "8%",  size: 2, delay: "0.3s",  dur: "10s"  },
  { top: "48%", left: "30%", size: 3, delay: "1.8s",  dur: "7.5s" },
  { top: "88%", left: "15%", size: 2, delay: "3.2s",  dur: "8s"   },
  { top: "12%", left: "95%", size: 3, delay: "0.6s",  dur: "6.5s" },
];

const getPatternStyle = (bgStyle, opacity) => {
  switch (bgStyle) {
    case "grid":
      return {
        backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(to right, currentColor 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
        opacity,
      };
    case "cross":
      return {
        backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(to right, currentColor 1px, transparent 1px)`,
        backgroundSize: "20px 20px",
        backgroundPosition: "10px 10px",
        opacity,
      };
    case "dots":
    default:
      return {
        backgroundImage: `radial-gradient(currentColor 1px, transparent 1px)`,
        backgroundSize: "24px 24px",
        opacity,
      };
  }
};

const AnimatedBackground = () => {
  const { config } = usePortfolio();
  const bgStyle     = config?.appearance?.bgStyle     ?? "dots";
  const bgIntensity = config?.appearance?.bgIntensity ?? "medium";

  const opacity =
    bgIntensity === "subtle" ? 0.025 :
    bgIntensity === "vivid"  ? 0.07  : 0.045;

  const isNone      = bgStyle === "none";
  const isParticles = bgStyle === "particles";
  const isWave      = bgStyle === "wave";
  const hasPattern  = !isNone && !isParticles && !isWave;

  const patternStyle = useMemo(
    () => (hasPattern ? getPatternStyle(bgStyle, opacity) : {}),
    [bgStyle, opacity, hasPattern]
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden bg-[#fafafa] dark:bg-[#09090b] transition-colors duration-300">
      {/* Soft top glow — always present */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[450px] bg-gradient-to-b from-zinc-200/50 dark:from-zinc-800/20 via-zinc-100/20 dark:via-zinc-900/10 to-transparent blur-3xl opacity-80" />

      {/* CSS pattern overlay */}
      {hasPattern && (
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={patternStyle}
        />
      )}

      {/* Wave (pure SVG animation) */}
      {isWave && (
        <>
          <style>{`
            @keyframes bg-wave-a {
              0%,100% { transform: translateX(0) translateY(0); }
              50%      { transform: translateX(-2.5%) translateY(1.2%); }
            }
            @keyframes bg-wave-b {
              0%,100% { transform: translateX(0) translateY(0); }
              50%      { transform: translateX(2.5%) translateY(-1.2%); }
            }
          `}</style>
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 1440 800"
            preserveAspectRatio="xMidYMid slice"
            style={{ opacity: opacity * 1.8 }}
            aria-hidden="true"
          >
            <path
              d="M0,200 C240,100 480,300 720,200 C960,100 1200,300 1440,200 L1440,400 C1200,500 960,300 720,400 C480,500 240,300 0,400 Z"
              className="fill-zinc-900 dark:fill-zinc-100"
              style={{ animation: "bg-wave-a 11s ease-in-out infinite" }}
            />
            <path
              d="M0,500 C240,400 480,600 720,500 C960,400 1200,600 1440,500 L1440,700 C1200,800 960,600 720,700 C480,800 240,600 0,700 Z"
              className="fill-zinc-900 dark:fill-zinc-100"
              style={{ animation: "bg-wave-b 14s ease-in-out infinite", opacity: 0.55 }}
            />
          </svg>
        </>
      )}

      {/* Floating particles (pure CSS keyframe) */}
      {isParticles && (
        <>
          <style>{`
            @keyframes bg-float {
              0%,100% { transform: translateY(0px)   scale(1);    opacity: 0.18; }
              50%      { transform: translateY(-20px) scale(1.18); opacity: 0.38; }
            }
          `}</style>
          {PARTICLE_POSITIONS.map((p, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-zinc-900 dark:bg-zinc-100"
              style={{
                top: p.top,
                left: p.left,
                width:  p.size,
                height: p.size,
                opacity: 0.12,
                animation: `bg-float ${p.dur} ${p.delay} ease-in-out infinite`,
              }}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default AnimatedBackground;
