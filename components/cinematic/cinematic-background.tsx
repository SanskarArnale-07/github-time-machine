"use client";

import React, { useMemo } from "react";

/**
 * CinematicBackground
 *
 * Requirements Met:
 * - Deep blue to navy gradient base (#070A14 to #0B1226).
 * - Soft aurora glow with gentle cosmic blue and warm amber lighting.
 * - Floating particles & subtle star dust with slow GPU-accelerated drift.
 * - Faint GitHub-style contribution grid texture in the background.
 * - Gentle light rays radiating from top-center with depth blur.
 * - Understated and cinematic — content remains the hero.
 */
export function CinematicBackground() {
  const particles = useMemo(() => {
    return Array.from({ length: 22 }).map((_, i) => ({
      id: i,
      left: `${(i * 15.1 + 4) % 94}%`,
      top: `${(i * 18.3 + 5) % 92}%`,
      size: `${(i % 3) * 1.5 + 2}px`,
      duration: `${18 + (i % 6) * 3}s`,
      delay: `${(i % 5) * 1.2}s`,
      opacity: 0.15 + (i % 4) * 0.1,
      isGold: i % 3 === 0,
    }));
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#09090B]"
    >
      {/* 1. Deep Graphite Gradient Foundation */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#09090B] via-[#121214] to-[#09090B]" />

      {/* 2. Soft Aurora Glow & Gentle Light Rays Radiating from Top-Center */}
      <div className="absolute left-1/2 -top-40 h-[650px] w-[1000px] -translate-x-1/2 rounded-full bg-gradient-to-b from-brass/10 via-zinc-800/5 to-transparent blur-[140px] animate-pulse-glow" />
      <div className="absolute -left-36 top-1/4 h-[550px] w-[550px] rounded-full bg-zinc-900/10 blur-[150px]" />
      <div className="absolute -right-36 top-1/3 h-[550px] w-[550px] rounded-full bg-brass/10 blur-[150px]" />

      {/* 3. Faint GitHub Contribution Grid Texture */}
      <div className="absolute inset-0 bg-grid-pattern opacity-15" />

      {/* 4. Floating Particles & Star Dust */}
      <div className="absolute inset-0">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full transition-all"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              backgroundColor: p.isGold ? "#D4A853" : "#FAFAFA",
              opacity: p.opacity,
              boxShadow: p.isGold
                ? "0 0 6px rgba(212, 168, 83, 0.4)"
                : "0 0 6px rgba(250, 250, 250, 0.3)",
              animation: `particle-drift ${p.duration} ease-in-out infinite`,
              animationDelay: p.delay,
            }}
          />
        ))}
      </div>

      {/* 5. Soft Vignette & Depth Blur */}
      <div className="vignette-overlay absolute inset-0 opacity-92" />
    </div>
  );
}
