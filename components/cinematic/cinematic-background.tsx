"use client";

import React, { useMemo } from "react";

/**
 * CinematicBackground
 *
 * Requirements Met:
 * - Deep blue to navy gradient base (#070A14 to #0B1226) / deep charcoal.
 * - Soft aurora glow with gentle cosmic blue and warm amber lighting.
 * - Floating particles & subtle star dust with slow GPU-accelerated drift.
 * - Film grain overlay.
 * - Understated and cinematic — content remains the hero.
 */
export function CinematicBackground() {
  const particles = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: `${(i * 15.1 + 4) % 94}%`,
      top: `${(i * 18.3 + 5) % 92}%`,
      size: `${(i % 3) * 1.5 + 1.5}px`,
      duration: `${20 + (i % 6) * 5}s`,
      delay: `${(i % 5) * 2}s`,
      opacity: 0.15 + (i % 4) * 0.1,
      isGold: i % 3 === 0,
    }));
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#050507]"
    >
      {/* 1. Deep Base Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#050507] via-[#0a0a0f] to-[#050507]" />

      {/* 2. Slow Animated Aurora / Soft Light Blooms */}
      <div className="absolute inset-0 opacity-40 mix-blend-screen">
        <div 
          className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-indigo-900/30 blur-[130px] animate-pulse-glow" 
          style={{ animationDuration: '10s' }} 
        />
        <div 
          className="absolute top-[20%] right-[-10%] w-[60%] h-[80%] rounded-full bg-brass/15 blur-[150px] animate-pulse-glow" 
          style={{ animationDuration: '14s', animationDelay: '2s' }} 
        />
        <div 
          className="absolute bottom-[-20%] left-[20%] w-[80%] h-[60%] rounded-full bg-zinc-800/40 blur-[140px] animate-pulse-glow" 
          style={{ animationDuration: '12s', animationDelay: '1s' }} 
        />
      </div>

      {/* 3. Film Grain Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay" 
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />

      {/* 4. Floating Particles */}
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
              backgroundColor: p.isGold ? "#D4A853" : "#F5F2EA",
              opacity: p.opacity,
              boxShadow: p.isGold
                ? "0 0 10px rgba(212, 168, 83, 0.5)"
                : "0 0 10px rgba(245, 242, 234, 0.3)",
              animation: `particle-drift ${p.duration} ease-in-out infinite`,
              animationDelay: p.delay,
            }}
          />
        ))}
      </div>

      {/* 5. Deep Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#050507_120%)] opacity-90" />
    </div>
  );
}
