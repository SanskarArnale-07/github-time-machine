"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, GitCommitHorizontal, Clock } from "lucide-react";

interface CinematicLoadingOverlayProps {
  isLoading: boolean;
  onComplete?: () => void;
}

export function CinematicLoadingOverlay({
  isLoading,
  onComplete,
}: CinematicLoadingOverlayProps) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [percent, setPercent] = useState(12);

  const loadingMessages = [
    "Reconstructing your developer timeline…",
    "Analyzing years of commits and repositories…",
    "Synthesizing your developer documentary…",
    "Calibrating the cinematic time machine…",
  ];

  useEffect(() => {
    if (!isLoading) {
      setPhaseIndex(0);
      setPercent(12);
      return;
    }

    const phaseTimer = setInterval(() => {
      setPhaseIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 750);

    const progressTimer = setInterval(() => {
      setPercent((prev) => {
        if (prev >= 96) {
          return 96;
        }
        return prev + Math.floor(Math.random() * 14 + 8);
      });
    }, 200);

    return () => {
      clearInterval(phaseTimer);
      clearInterval(progressTimer);
    };
  }, [isLoading, loadingMessages.length]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#070A14]/90 backdrop-blur-2xl transition-opacity duration-700">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute h-[400px] w-[400px] rounded-full bg-brass/15 blur-[120px] animate-pulse-glow" />
      <div className="pointer-events-none absolute h-[500px] w-[500px] rounded-full bg-cosmic-blue/20 blur-[140px]" />

      <div className="relative z-10 mx-auto flex max-w-lg flex-col items-center px-6 text-center">
        {/* Animated glowing badge */}
        <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border-2 border-brass/50 bg-ink-surface/90 shadow-[0_0_50px_rgba(212,168,83,0.35)]">
          <GitCommitHorizontal className="h-10 w-10 text-brass-light animate-pulse" />
          <div className="absolute -inset-1 rounded-3xl border border-brass/30 animate-ping opacity-30" />
        </div>

        <span className="mt-8 font-mono text-xs uppercase tracking-[0.25em] text-brass-light font-bold">
          Developer Documentary
        </span>

        <h3 className="mt-2 min-h-[50px] font-display text-2xl text-ivory sm:text-3xl transition-all duration-300">
          {loadingMessages[phaseIndex]}
        </h3>

        <div className="mt-8 w-full max-w-md">
          <div className="h-2 w-full overflow-hidden rounded-full border border-ink-border bg-ink">
            <div
              className="h-full bg-gradient-to-r from-brass via-commit-300 to-cosmic-cyan transition-all duration-300 ease-out shadow-[0_0_15px_rgba(212,168,83,0.8)]"
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="mt-3 flex justify-between font-mono text-xs text-muted">
            <span className="flex items-center gap-1 text-brass-light">
              <Sparkles className="h-3 w-3" /> Initializing Frames
            </span>
            <span>{percent}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
