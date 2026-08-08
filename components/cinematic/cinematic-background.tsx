"use client";

import React, { useMemo } from "react";

/**
 * CinematicBackground
 *
 * Layers a deep navy canvas (#0B1020) with blurred cosmic blue and warm amber radial orbs,
 * a faint GitHub-style grid pattern, an animated floating particle field, and a subtle vignette.
 * Provides the Interstellar-style developer documentary atmosphere without competing with copy.
 */
export function CinematicBackground() {
  // Generate stable deterministic particles
  const particles = useMemo(() => {
    return Array.from({ length: 28 }).map((_, i) => ({
      id: i,
      left: `${(i * 13.7 + 5) % 95}%`,
      top: `${(i * 19.3 + 8) % 90}%`,
      size: `${(i % 3) * 1.5 + 2}px`,
      duration: `${14 + (i % 8) * 3}s`,
      delay: `${(i % 5) * 1.5}s`,
      opacity: 0.2 + (i % 4) * 0.15,
      isGold: i % 3 === 0,
    }));
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#0B1020]"
    >
      {/* 1. Large Blurred Cosmic Blue & Warm Amber Radial Orbs */}
      <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-cosmic-blue/20 blur-[130px] transition-transform duration-1000 animate-pulse-glow" />
      <div className="absolute -right-40 top-1/4 h-[550px] w-[550px] rounded-full bg-brass/15 blur-[140px] transition-transform duration-1000" />
      <div className="absolute -bottom-40 left-1/3 h-[600px] w-[600px] rounded-full bg-cosmic-indigo/15 blur-[150px]" />
      <div className="absolute top-2/3 right-1/4 h-[400px] w-[400px] rounded-full bg-commit-300/10 blur-[120px]" />

      {/* 2. Faint GitHub Grid Texture */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40" />

      {/* 3. Subtle Animated Particle Field / Star Dust */}
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
              backgroundColor: p.isGold ? "#D4A853" : "#60A5FA",
              opacity: p.opacity,
              boxShadow: p.isGold
                ? "0 0 8px rgba(212, 168, 83, 0.8)"
                : "0 0 8px rgba(96, 165, 250, 0.8)",
              animation: `particle-drift ${p.duration} ease-in-out infinite`,
              animationDelay: p.delay,
            }}
          />
        ))}
      </div>

      {/* 4. Cinematic Soft Vignette around screen edges */}
      <div className="vignette-overlay absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#070A14] via-transparent to-[#0B1020]/60" />
    </div>
  );
}
