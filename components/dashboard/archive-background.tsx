"use client";

import React, { memo } from "react";

/**
 * ArchiveBackground
 *
 * Dedicated visual atmosphere for the Developer Chronicle / Dashboard.
 * Evokes a Developer Archive, Historical Timeline, Digital Observatory,
 * and Code Database rather than outer space or generic SaaS.
 *
 * Visual ingredients:
 * - Base: Ultra-deep graphite & near-black (#06080D -> #0A0D15) with subtle deep navy undertone
 * - Archival data grid: Faint horizontal timeline lines & vertical epoch divisions
 * - Discrete data nodes: Sparse tiny markers hinting at historical commit timestamps
 * - Observatory illumination: Soft, deeply muted blue/indigo radial glows
 * - Subtle timeline trace: A whisper-slow light drift along an archival timeline axis
 * - Edge vignette: Deep graphite frame focusing attention on developer analytics & timelines
 *
 * Performance:
 * - 100% CSS & lightweight inline SVGs — zero canvas overhead, zero layout thrashing
 * - Respects prefers-reduced-motion automatically
 * - pointer-events: none across all layers
 */
export const ArchiveBackground = memo(function ArchiveBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full select-none overflow-hidden bg-[#06080D]"
      style={{ isolation: "isolate" }}
    >
      {/* ── 1. Base Gradient Foundation (Graphite, Deep Navy Undertone) ── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(130% 100% at 50% 0%, #0A111E 0%, #070B13 42%, #05070C 85%, #030408 100%)",
        }}
      />

      {/* ── 2. Observatory Radial Lighting (Soft Indigo & Archival Blue) ── */}
      {/* Upper central glow behind the header & Current Chapter card */}
      <div
        className="absolute -top-16 left-1/2 h-[520px] w-[920px] -translate-x-1/2 rounded-full opacity-60 blur-[110px]"
        style={{
          background:
            "radial-gradient(circle, rgba(30, 58, 138, 0.22) 0%, rgba(30, 27, 75, 0.12) 48%, transparent 75%)",
        }}
      />

      {/* Mid-left lateral glow behind Timeline & Metrics */}
      <div
        className="absolute top-[38%] -left-32 h-[580px] w-[580px] rounded-full opacity-40 blur-[130px]"
        style={{
          background:
            "radial-gradient(circle, rgba(49, 46, 129, 0.15) 0%, rgba(30, 64, 175, 0.06) 50%, transparent 70%)",
        }}
      />

      {/* Lower-right subtle sapphire glow behind Repositories & Heatmap */}
      <div
        className="absolute top-[62%] -right-28 h-[620px] w-[620px] rounded-full opacity-35 blur-[140px]"
        style={{
          background:
            "radial-gradient(circle, rgba(30, 58, 138, 0.16) 0%, rgba(17, 24, 39, 0.08) 55%, transparent 72%)",
        }}
      />

      {/* ── 3. Faint Archival Dot Matrix (Code Database Coordinate Pattern) ── */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #93C5FD 1px, transparent 1px)",
          backgroundSize: "36px 36px",
          maskImage:
            "radial-gradient(ellipse 85% 70% at 50% 35%, black 25%, transparent 85%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 85% 70% at 50% 35%, black 25%, transparent 85%)",
        }}
      />

      {/* ── 4. Chronological Grid (Horizontal Timeline Lines & Vertical Divisions) ── */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.045]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="archive-timeline-grid"
            width="280"
            height="140"
            patternUnits="userSpaceOnUse"
          >
            {/* Subtle horizontal timeline track line */}
            <line
              x1="0"
              y1="140"
              x2="280"
              y2="140"
              stroke="#60A5FA"
              strokeWidth="1"
              strokeDasharray="4 6"
            />
            {/* Subtle vertical epoch division line */}
            <line
              x1="280"
              y1="0"
              x2="280"
              y2="140"
              stroke="#94A3B8"
              strokeWidth="0.8"
              strokeOpacity="0.6"
            />
            {/* Intersection coordinate point */}
            <circle cx="280" cy="140" r="1.5" fill="#93C5FD" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#archive-timeline-grid)" />
      </svg>

      {/* ── 5. Primary Historical Timeline Axes (Discrete Horizontal Strata) ── */}
      {/* Axis 1: Sub-header timeline horizon */}
      <div className="absolute top-[185px] inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-400/[0.08] to-transparent" />

      {/* Axis 2: Mid-page chronicle line with subtle warm accent touch */}
      <div
        className="absolute top-[520px] inset-x-0 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, rgba(147, 197, 253, 0.06) 45%, rgba(251, 191, 36, 0.04) 55%, transparent)",
        }}
      />

      {/* Axis 3: Lower historical archive boundary */}
      <div className="absolute top-[880px] inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-400/[0.05] to-transparent" />

      {/* ── 6. Sparse Tiny Data Nodes (Historical Commit Markers) ── */}
      {/* Node 1: Near left margin */}
      <div className="absolute top-[183px] left-[14%] flex items-center justify-center">
        <div className="h-1.5 w-1.5 rounded-full bg-blue-400/30" />
        <div className="absolute h-4 w-4 rounded-full bg-blue-400/10 animate-ping opacity-40 [animation-duration:6s]" />
      </div>

      {/* Node 2: Near right margin */}
      <div className="absolute top-[183px] right-[18%] flex items-center justify-center">
        <div className="h-1.5 w-1.5 rounded-full bg-indigo-300/30" />
      </div>

      {/* Node 3: Mid-page anchor */}
      <div className="absolute top-[518px] left-[26%] flex items-center justify-center">
        <div className="h-1.5 w-1.5 rounded-full bg-blue-300/25" />
      </div>

      {/* Node 4: Mid-page gold historical milestone node */}
      <div className="absolute top-[518px] right-[28%] flex items-center justify-center">
        <div className="h-1.5 w-1.5 rounded-full bg-amber-400/25" />
        <div className="absolute h-3 w-3 rounded-full bg-amber-400/10" />
      </div>

      {/* Node 5: Lower tier node */}
      <div className="absolute top-[878px] left-[42%] flex items-center justify-center">
        <div className="h-1.5 w-1.5 rounded-full bg-blue-400/20" />
      </div>

      {/* ── 7. Subtle Ambient Timeline Light Drift (Whisper-Slow Motion) ── */}
      <div className="absolute top-[184px] inset-x-0 h-px overflow-hidden opacity-60">
        <div
          className="h-full w-48 bg-gradient-to-r from-transparent via-blue-400/30 to-transparent"
          style={{
            animation: "archiveTimelinePulse 24s ease-in-out infinite",
          }}
        />
      </div>

      <div className="absolute top-[519px] inset-x-0 h-px overflow-hidden opacity-50">
        <div
          className="h-full w-36 bg-gradient-to-r from-transparent via-indigo-300/25 to-transparent"
          style={{
            animation: "archiveTimelinePulse 32s ease-in-out infinite reverse",
            animationDelay: "4s",
          }}
        />
      </div>

      {/* ── 8. Archival Vignette (Maintains Text Focus & Contrast) ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 90% 85% at 50% 45%, transparent 48%, rgba(6, 8, 13, 0.45) 75%, rgba(4, 6, 10, 0.92) 100%)",
        }}
      />

      {/* Keyframe animations for subtle ambient timeline drift */}
      <style>{`
        @keyframes archiveTimelinePulse {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          50% {
            opacity: 0.8;
          }
          90% {
            opacity: 0.5;
          }
          100% {
            transform: translateX(100vw);
            opacity: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          @keyframes archiveTimelinePulse {
            0%, 100% {
              transform: translateX(50vw);
              opacity: 0.2;
            }
          }
        }
      `}</style>
    </div>
  );
});
