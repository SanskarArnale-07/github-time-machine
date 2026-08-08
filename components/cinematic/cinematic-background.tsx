"use client";

import React, { useMemo } from "react";

/**
 * CinematicBackground
 *
 * Layers a deep navy canvas (#0B1020) to charcoal gradient with:
 * - Subtle floating star particles
 * - Soft animated light rays radiating from top-center
 * - Faint GitHub-style contribution grid texture
 * - Soft edge vignette and GPU-friendly keyframe animations.
 */
export function CinematicBackground() {
  // Generate stable deterministic particles
  const particles = useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      left: `${(i * 14.3 + 4) % 94}%`,
      top: `${(i * 17.7 + 6) % 92}%`,
      size: `${(i % 3) * 1.5 + 2}px`,
      duration: `${16 + (i % 6) * 3}s`,
      delay: `${(i % 5) * 1.5}s`,
      opacity: 0.18 + (i % 4) * 0.12,
      isGold: i % 3 === 0,
    }));
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#0B1020]"
    >
      {/* 1. Soft light rays radiating from top-center */}
      <div className="absolute left-1/2 -top-40 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-b from-cosmic-blue/20 via-brass/10 to-transparent blur-[140px] animate-pulse-glow" />

      {/* 2. Ambient cosmic gradients in navy and warm amber */}
      <div className="absolute -left-40 top-1/3 h-[500px] w-[500px] rounded-full bg-cosmic-indigo/15 blur-[140px]" />
      <div className="absolute -right-40 top-1/2 h-[500px] w-[500px] rounded-full bg-brass/15 blur-[150px]" />

      {/* 3. Faint GitHub Grid Texture */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />

      {/* 4. Subtle Floating Particles / Star Dust */}
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
                ? "0 0 6px rgba(212, 168, 83, 0.7)"
                : "0 0 6px rgba(96, 165, 250, 0.7)",
              animation: `particle-drift ${p.duration} ease-in-out infinite`,
              animationDelay: p.delay,
            }}
          />
        ))}
      </div>

      {/* 5. Cinematic Edge Vignette */}
      <div className="vignette-overlay absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#070A14] via-transparent to-[#0B1020]/50" />
    </div>
  );
}
