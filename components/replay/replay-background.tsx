"use client";

import React, { memo } from "react";
import { SpaceBackground, SpaceTheme } from "@/components/space-background";

export interface ReplayBackgroundProps {
  theme?: SpaceTheme;
  progress?: number; // 0 to 100
  isFinal?: boolean;
  sceneIndex?: number;
  chapterIndex?: number;
  currentChapterId?: string;
  isPaused?: boolean;
}

/**
 * Replay Theater Background Layer.
 * 
 * Performance Optimizations:
 * - Reduced star density (0.4x) during replay preserves GPU fillrate for chapter animations.
 * - Passes isPaused flag to stop the canvas RAF loop completely when documentary is paused.
 * - Scene timing, audio, and replay engine state remain 100% untouched.
 */
export const ReplayBackground = memo(function ReplayBackground({
  theme = "default",
  isFinal,
  isPaused = false,
}: ReplayBackgroundProps) {
  // On finale scene, shift to milestone theme if default
  const effectiveTheme: SpaceTheme = isFinal && theme === "default" ? "milestone" : theme;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 h-full w-full select-none overflow-hidden"
    >
      <SpaceBackground 
        theme={effectiveTheme} 
        variant="absolute" 
        starMultiplier={0.25}
        isPaused={isPaused}
        className="z-0"
      />
    </div>
  );
});
