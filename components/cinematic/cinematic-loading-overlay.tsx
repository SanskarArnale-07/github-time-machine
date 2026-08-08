"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, GitCommitHorizontal } from "lucide-react";

interface CinematicLoadingOverlayProps {
  isLoading: boolean;
}

/**
 * Fast, crisp cinematic loading screen lasting maximum 1.0-1.5s
 * with prompt: "Reconstructing your developer journey"
 */
export function CinematicLoadingOverlay({
  isLoading,
}: CinematicLoadingOverlayProps) {
  const [percent, setPercent] = useState(25);

  useEffect(() => {
    if (!isLoading) {
      setPercent(25);
      return;
    }

    const timer = setInterval(() => {
      setPercent((prev) => {
        if (prev >= 95) return 95;
        return prev + 24;
      });
    }, 180);

    return () => clearInterval(timer);
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#070A14]/90 backdrop-blur-2xl transition-opacity duration-300">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute h-[350px] w-[350px] rounded-full bg-brass/15 blur-[120px] animate-pulse-glow" />
      <div className="pointer-events-none absolute h-[400px] w-[400px] rounded-full bg-cosmic-blue/20 blur-[140px]" />

      <div className="relative z-10 mx-auto flex max-w-md flex-col items-center px-6 text-center">
        {/* Animated glowing icon */}
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-brass/50 bg-[#0B1226]/90 shadow-[0_0_40px_rgba(212,168,83,0.35)]">
          <GitCommitHorizontal className="h-8 w-8 text-brass-light animate-pulse" />
        </div>

        <span className="mt-6 font-mono text-[10px] uppercase tracking-[0.25em] text-brass-light font-bold">
          Developer Documentary
        </span>

        <h3 className="mt-2 font-display text-2xl text-ivory sm:text-3xl">
          Reconstructing your developer journey
        </h3>

        <div className="mt-6 w-full max-w-xs">
          <div className="h-1.5 w-full overflow-hidden rounded-full border border-white/10 bg-[#070A14]">
            <div
              className="h-full bg-gradient-to-r from-brass via-commit-300 to-cosmic-cyan transition-all duration-200 ease-out shadow-[0_0_12px_rgba(212,168,83,0.8)]"
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between font-mono text-[10px] text-muted">
            <span className="flex items-center gap-1 text-brass-light">
              <Sparkles className="h-3 w-3" /> Synthesizing Timeline
            </span>
            <span>{percent}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
