"use client";

import React from "react";
import { motion } from "framer-motion";

export function CinematicBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-black"
    >
      {/* 1. Subtle GitHub-style grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.15]" 
        style={{ 
          backgroundImage: "linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 0%, black 40%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 0%, black 40%, transparent 100%)"
        }} 
      />

      {/* 2. Vercel-style stark top center glow */}
      <div 
        className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[80%] max-w-[1200px] h-[600px] rounded-[100%] bg-white/[0.04] blur-[120px]" 
      />
      <div 
        className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[40%] max-w-[600px] h-[400px] rounded-[100%] bg-white/[0.06] blur-[100px]" 
      />

      {/* 3. Subtle triangular geometry (like the reference image) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute top-[5%] left-1/2 -translate-x-1/2 opacity-30"
      >
        <svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g filter="url(#glow)">
            <path d="M200 100 L300 273.2 L100 273.2 Z" fill="black" stroke="white" strokeWidth="1.5" strokeOpacity="0.4" />
          </g>
          <defs>
            <filter id="glow" x="0" y="0" width="400" height="400" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feGaussianBlur stdDeviation="20" result="effect1_foregroundBlur"/>
              <feComposite in="SourceGraphic" in2="effect1_foregroundBlur" operator="over"/>
            </filter>
          </defs>
        </svg>
      </motion.div>

      {/* 4. Film Grain Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay" 
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />

      {/* 5. Deep Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,black_100%)] opacity-80" />
    </div>
  );
}
