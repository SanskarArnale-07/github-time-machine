"use client";

import React, { useMemo } from "react";

/**
 * CinematicBackground
 *
 * Requirements Met:
 * - Warm charcoal gradient base (#0B0A09 to #141210).
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
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#0B0A09]"
    >
      {/* 1. Deep Base Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0B0A09] via-[#141210] to-[#0B0A09]" />

      {/* 2. Slow Animated Aurora / Dual Lighting */}
      <div className="absolute inset-0 opacity-40 mix-blend-screen">
        {/* Amber behind hero (top right) — slightly larger, slower */}
        <div 
          className="absolute top-[-10%] right-[-10%] w-[65%] h-[75%] rounded-full bg-amber-500/15 blur-[150px] animate-pulse-glow" 
          style={{ animationDuration: '16s' }} 
        />
        {/* Subtle atmospheric haze (bottom left) — replaces blue sphere */}
        <div 
          className="absolute bottom-[-10%] left-[-10%] w-[70%] h-[60%] rounded-full bg-zinc-700/[0.08] blur-[200px] animate-pulse-glow" 
          style={{ animationDuration: '12s', animationDelay: '2s' }} 
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
              backgroundColor: p.isGold ? "#C9A86A" : "#F5F1EA",
              opacity: p.opacity,
              boxShadow: p.isGold
                ? "0 0 10px rgba(201, 168, 106, 0.5)"
                : "0 0 10px rgba(245, 241, 234, 0.3)",
              animation: `particle-drift ${p.duration} ease-in-out infinite`,
              animationDelay: p.delay,
            }}
          />
        ))}
      </div>

      {/* 5. Deep Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#0B0A09_120%)] opacity-90" />
    </div>
  );
}
