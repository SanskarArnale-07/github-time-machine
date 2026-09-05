"use client";
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { ContributionWeek } from "@/lib/github/types";
import { Play, Pause, RotateCcw } from "lucide-react";

interface ContributionReplayProps {
  contributions: ContributionWeek[];
}

const CELL_COLORS = ["#18181b", "#3f3f46", "#71717a", "#d4d4d8", "#ffffff"];
const MUTED_COLOR = "#18181b";

function getCellColor(level: number): string {
  return CELL_COLORS[level] ?? MUTED_COLOR;
}

export function ContributionReplay({
  contributions,
}: ContributionReplayProps) {
  // ─── UI state (React owns only what the controls need) ───────────────────
  const [isPlaying, setIsPlaying] = useState(true);
  const [sliderValue, setSliderValue] = useState(-4);

  // ─── DOM protection: Limit render to last 4 years (208 weeks) ────────────
  const renderContributions = useMemo(() => {
    return contributions.length > 208 ? contributions.slice(-208) : contributions;
  }, [contributions]);

  const maxProgress = renderContributions.length + 4;

  // ─── Animation clock lives entirely outside React ────────────────────────
  const waveRef = useRef(-4);
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(0);
  const isPlayingRef = useRef(true);
  const isInteractingRef = useRef(false);

  // ─── Cell DOM refs (indexed [weekIndex][dayIndex]) ───────────────────────
  const cellRefs = useRef<(HTMLDivElement | null)[][]>([]);

  useEffect(() => {
    cellRefs.current = renderContributions.map((week) =>
      Array((week.days || []).length).fill(null)
    );
  }, [renderContributions]);

  // ─── High-Performance Full Paint (Used on mount, scrub, and seek) ────────
  const fullPaint = useCallback(
    (wave: number) => {
      renderContributions.forEach((week, weekIndex) => {
        const hasBloomed = wave >= weekIndex;
        (week.days || []).forEach((day, dayIndex) => {
          const el = cellRefs.current[weekIndex]?.[dayIndex];
          if (!el) return;

          el.style.backgroundColor = hasBloomed ? getCellColor(day.level) : MUTED_COLOR;
          el.style.filter = "none";
          el.style.transform = "scale(1)";
          el.style.boxShadow = "none";
          el.style.zIndex = "1";
        });
      });
    },
    [renderContributions]
  );

  // ─── Incremental Window Paint (Used during rAF playback) ─────────────────
  // Instead of styling all 1,456 cells on every tick, ONLY style the active wave window
  // (3-4 weeks = ~21-28 cells). Past cells stay static with zero DOM updates.
  const paintIncrementalWave = useCallback(
    (wave: number) => {
      // 1. Reset the trailing week that just exited the active wave window
      const exitWeek = wave - 3;
      if (exitWeek >= 0 && exitWeek < renderContributions.length) {
        const week = renderContributions[exitWeek];
        (week.days || []).forEach((day, dayIndex) => {
          const el = cellRefs.current[exitWeek]?.[dayIndex];
          if (!el) return;
          el.style.backgroundColor = getCellColor(day.level);
          el.style.filter = "none";
          el.style.transform = "scale(1)";
          el.style.boxShadow = "none";
          el.style.zIndex = "1";
        });
      }

      // 2. Animate ONLY the active wave window [wave - 2, wave + 1] (~21 to 28 cells)
      const startWeek = Math.max(0, wave - 2);
      const endWeek = Math.min(renderContributions.length - 1, wave + 1);

      for (let w = startWeek; w <= endWeek; w++) {
        const week = renderContributions[w];
        const waveDistance = wave - w;
        const isWaveFront = isPlayingRef.current && (waveDistance === 0 || waveDistance === 1);
        const hasBloomed = waveDistance >= 0;

        (week.days || []).forEach((day, dayIndex) => {
          const el = cellRefs.current[w]?.[dayIndex];
          if (!el) return;

          const level = day.level;
          const active = isWaveFront && level > 0;
          const cellColor = hasBloomed ? getCellColor(level) : MUTED_COLOR;

          el.style.backgroundColor = cellColor;
          el.style.filter = active ? "brightness(1.2)" : "none";
          el.style.transform = active ? "scale(1.2)" : "scale(1)";
          el.style.boxShadow = active ? "0 0 10px rgba(255,255,255,0.6)" : "none";
          el.style.zIndex = active ? "10" : "1";
        });
      }
    },
    [renderContributions]
  );

  // ─── rAF ticker — advances wave every ~55ms touching only ~25 cells ───────
  const tick = useCallback(
    (timestamp: number) => {
      if (!isPlayingRef.current || isInteractingRef.current) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      if (timestamp - lastTickRef.current >= 55) {
        if (waveRef.current < maxProgress) {
          waveRef.current += 1;
          lastTickRef.current = timestamp;
          paintIncrementalWave(waveRef.current);
        } else {
          isPlayingRef.current = false;
          setIsPlaying(false);
          setSliderValue(waveRef.current);
          return; // stop loop
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    },
    [maxProgress, paintIncrementalWave]
  );

  // ─── Sync slider thumb every 200ms so it tracks without per-frame renders ─
  useEffect(() => {
    const id = setInterval(() => {
      if (isPlayingRef.current) {
        setSliderValue(waveRef.current);
      }
    }, 200);
    return () => clearInterval(id);
  }, []);

  // ─── Start / stop the rAF loop when isPlaying changes ───────────────────
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      // In reduced-motion mode, show full state statically without running loop
      fullPaint(maxProgress);
      setIsPlaying(false);
      isPlayingRef.current = false;
      return;
    }

    isPlayingRef.current = isPlaying;
    if (isPlaying) {
      lastTickRef.current = 0;
      rafRef.current = requestAnimationFrame(tick);
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, tick, fullPaint, maxProgress]);

  // ─── Reset on mount ───────────────────────────────────────────────────────
  useEffect(() => {
    waveRef.current = -4;
    setSliderValue(-4);
    setIsPlaying(true);
    fullPaint(-4);
  }, [renderContributions, fullPaint]);

  // ─── Slider scrub: user drags, we paint immediately at that position ──────
  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    waveRef.current = val;
    setSliderValue(val);
    fullPaint(val);
  };

  // ─── Play / Pause toggle ─────────────────────────────────────────────────
  const handlePlayPause = () => {
    if (sliderValue >= maxProgress) {
      // Restart
      waveRef.current = -4;
      setSliderValue(-4);
      fullPaint(-4);
      setIsPlaying(true);
    } else {
      setIsPlaying((p) => !p);
    }
  };

  // ─── Derived display values (stable memos) ───────────────────────────────
  const currentTotalCommits = useMemo(
    () =>
      contributions.reduce(
        (acc, week) =>
          acc + (week.days || []).reduce((sum, day) => sum + (day.count || 0), 0),
        0
      ),
    [contributions]
  );

  const currentYear = useMemo(() => {
    const last = contributions[contributions.length - 1];
    return last?.days?.[0]?.date
      ? new Date(last.days[0].date).getFullYear()
      : new Date().getFullYear();
  }, [contributions]);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="glass-card w-full overflow-hidden p-4 sm:p-6 lg:p-8">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-zinc-500">
            Contribution Graph Replay
          </span>
          <h2 className="mt-1 font-sans tracking-tight font-semibold text-2xl text-white sm:text-3xl">
            Activity bloom over time
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            A continuous canvas of your momentum, illuminated left-to-right.
          </p>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-surface px-4 py-2.5">
          <div className="text-right">
            <div className="font-sans text-2xl font-semibold text-white">
              {currentTotalCommits}
            </div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
              Contributions
            </div>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="text-right">
            <div className="font-sans text-2xl font-semibold text-white">
              {currentYear}
            </div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
              Year
            </div>
          </div>
        </div>
      </div>

      {/* Grid container with custom scrollbar styling */}
      <div className="relative mb-6 overflow-x-auto pb-4 pt-2">
        <div className="flex min-w-max gap-[3px] sm:gap-1">
          {renderContributions.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-[3px] sm:gap-1">
              {(week.days || []).map((_, dayIndex) => (
                <div
                  key={dayIndex}
                  ref={(el) => {
                    if (cellRefs.current[weekIndex]) {
                      cellRefs.current[weekIndex][dayIndex] = el;
                    }
                  }}
                  className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-[2px]"
                  style={{
                    backgroundColor: MUTED_COLOR,
                    willChange: "transform, background-color",
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Playback Controls & Scrubber */}
      <div className="flex flex-col gap-4 border-t border-white/10 pt-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <button
            onClick={handlePlayPause}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white transition-colors hover:bg-white/20 active:scale-95"
            aria-label={isPlaying ? "Pause replay" : "Play replay"}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : sliderValue >= maxProgress ? (
              <RotateCcw className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4 fill-white" />
            )}
          </button>
        </div>

        {/* Scrubber slider */}
        <div className="flex flex-1 items-center gap-3">
          <input
            type="range"
            min={-4}
            max={maxProgress}
            value={sliderValue}
            onChange={handleScrub}
            onMouseDown={() => (isInteractingRef.current = true)}
            onMouseUp={() => (isInteractingRef.current = false)}
            onTouchStart={() => (isInteractingRef.current = true)}
            onTouchEnd={() => (isInteractingRef.current = false)}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-white outline-none"
            aria-label="Timeline scrubber"
          />
        </div>
      </div>
    </div>
  );
}
