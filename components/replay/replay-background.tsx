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
}

/**
 * Replay Theater Background Layer.
 * Wraps the global SpaceBackground with replay-specific configuration.
 */
export const ReplayBackground = memo(function ReplayBackground({
  theme = "default",
  isFinal,
}: ReplayBackgroundProps) {
  // On finale scene, shift to milestone theme if default
  const effectiveTheme: SpaceTheme = isFinal && theme === "default" ? "milestone" : theme;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 h-full w-full select-none overflow-hidden"
    >
      <SpaceBackground theme={effectiveTheme} variant="absolute" />
    </div>
  );
});
