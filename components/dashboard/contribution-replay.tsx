"use client";
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { ContributionWeek } from "@/lib/github/types";
import { Play, Pause, RotateCcw } from "lucide-react";

interface ContributionReplayProps {
  contributions: ContributionWeek[];
}

const CELL_COLORS = ["#18181b", "#3f3f46", "#71717a", "#d4d4d8", "#ffffff"];
const MUTED_COLOR = "#18181b";

function getCellColor(level: number, count?: number): string {
  if ((!level || level === 0) && count && count > 0) {
    if (count <= 2) return CELL_COLORS[1];
    if (count <= 5) return CELL_COLORS[2];
    if (count <= 8) return CELL_COLORS[3];
    return CELL_COLORS[4];
  }
  return CELL_COLORS[level] ?? MUTED_COLOR;
}

export function ContributionReplay({
  contributions,
}: ContributionReplayProps) {
  // ─── UI state (React owns only buttons/finished status) ───────────────────
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFinished, setIsFinished] = useState(false);

  // ─── DOM protection: Limit render to last 4 years (208 weeks) ────────────
  const renderContributions = useMemo(() => {
    return contributions.length > 208 ? contributions.slice(-208) : contributions;
  }, [contributions]);

  const totalWeeks = renderContributions.length;
  const minProgress = -2;
  const maxProgress = Math.max(1, totalWeeks + 2);

  // ─── Cumulative Stats Pre-computation (O(1) lookup during 60 FPS animation) ─
  const cumulativeData = useMemo(() => {
    let sum = 0;
    const totals: number[] = [];
    const years: number[] = [];
    const defaultYear = new Date().getFullYear();

    for (let i = 0; i < renderContributions.length; i++) {
      const week = renderContributions[i];
      const weekSum = (week.days || []).reduce((acc, d) => acc + (d.count || 0), 0);
      sum += weekSum;
      totals.push(sum);

      const firstDate = week.days?.[0]?.date;
      years.push(firstDate ? new Date(firstDate).getFullYear() : defaultYear);
    }

    return {
      totals,
      years,
      finalTotal: sum,
      finalYear: years[years.length - 1] ?? defaultYear,
      firstYear: years[0] ?? defaultYear,
    };
  }, [renderContributions]);

  // ─── Animation Clock & Direct DOM Refs (Zero React re-renders during playback) ─
  const waveRef = useRef(minProgress);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const isPlayingRef = useRef(true);
  const isInteractingRef = useRef(false);
  const lastBloomedWeekRef = useRef(-3);

  // Direct element references for zero-lag 60fps updates
  const sliderRef = useRef<HTMLInputElement>(null);
  const commitsCountRef = useRef<HTMLDivElement>(null);
  const yearCountRef = useRef<HTMLDivElement>(null);

  // ─── Cell DOM refs (indexed [weekIndex][dayIndex]) ───────────────────────
  const cellRefs = useRef<(HTMLDivElement | null)[][]>([]);

  // ─── Live Dynamic Counter Updates (Pure DOM, 0 React Overhead) ────────────
  const updateLiveCounters = useCallback(
    (wave: number) => {
      if (totalWeeks === 0) return;

      let commits = 0;
      let year = cumulativeData.firstYear;

      if (wave <= minProgress) {
        commits = 0;
        year = cumulativeData.firstYear;
      } else if (wave >= totalWeeks) {
        commits = cumulativeData.finalTotal;
        year = cumulativeData.finalYear;
      } else {
        const weekIdx = Math.max(0, Math.min(totalWeeks - 1, Math.floor(wave)));
        commits = cumulativeData.totals[weekIdx] ?? 0;
        year = cumulativeData.years[weekIdx] ?? cumulativeData.finalYear;
      }

      if (commitsCountRef.current) {
        commitsCountRef.current.textContent = String(commits);
      }
      if (yearCountRef.current) {
        yearCountRef.current.textContent = String(year);
      }
    },
    [totalWeeks, minProgress, cumulativeData]
  );

  // ─── High-Performance Full Paint (Used on mount, scrub, and seek) ────────
  const fullPaint = useCallback(
    (wave: number) => {
      renderContributions.forEach((week, weekIndex) => {
        const hasBloomed = wave >= weekIndex;
        (week.days || []).forEach((day, dayIndex) => {
          const el = cellRefs.current[weekIndex]?.[dayIndex];
          if (!el) return;

          el.style.backgroundColor = hasBloomed ? getCellColor(day.level, day.count) : MUTED_COLOR;
          el.style.transform = "scale(1)";
          el.style.boxShadow = "none";
          el.style.zIndex = "1";
        });
      });
      lastBloomedWeekRef.current = Math.floor(wave);
      updateLiveCounters(wave);
    },
    [renderContributions, updateLiveCounters]
  );

  // ─── 60 FPS Fluid Replay Engine ──────────────────────────────────────────
  // Paced smoothly across ~4.2 seconds regardless of dataset size
  const animDuration = useMemo(() => {
    return Math.min(5.2, Math.max(3.2, (totalWeeks / 52) * 3.5));
  }, [totalWeeks]);

  const speed = (maxProgress - minProgress) / animDuration; // weeks per second

  const tick = useCallback(
    (timestamp: number) => {
      if (!isPlayingRef.current || isInteractingRef.current) {
        lastTimeRef.current = timestamp;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp;
      }

      const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = timestamp;

      waveRef.current += speed * dt;
      const currentWave = waveRef.current;

      // Update slider directly in DOM without React re-render!
      if (sliderRef.current) {
        sliderRef.current.value = String(currentWave);
      }

      // Check if finished
      if (currentWave >= maxProgress) {
        waveRef.current = maxProgress;
        fullPaint(maxProgress);
        if (sliderRef.current) sliderRef.current.value = String(maxProgress);
        isPlayingRef.current = false;
        setIsPlaying(false);
        setIsFinished(true);
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
        return;
      }

      // ─── Incremental 60 FPS Bloom Wave ──────────────────────────────────
      // Bloom newly crossed weeks with a luminous glowing wavefront
      const currentIntWeek = Math.floor(currentWave);
      const prevIntWeek = lastBloomedWeekRef.current;

      if (currentIntWeek > prevIntWeek) {
        for (let w = Math.max(0, prevIntWeek + 1); w <= Math.min(totalWeeks - 1, currentIntWeek); w++) {
          const week = renderContributions[w];
          (week.days || []).forEach((day, dayIndex) => {
            const el = cellRefs.current[w]?.[dayIndex];
            if (!el) return;
            const level = day.level;
            el.style.backgroundColor = getCellColor(level, day.count);
            if (level > 0 || (day.count && day.count > 0)) {
              el.style.transform = "scale(1.22)";
              el.style.boxShadow = "0 0 10px rgba(255, 255, 255, 0.7)";
              el.style.zIndex = "10";
            }
          });
        }
        lastBloomedWeekRef.current = currentIntWeek;
        updateLiveCounters(currentWave);
      }

      // Settle wavefront glow for weeks that were bloomed 2+ columns ago
      const trailWeek = currentIntWeek - 2;
      if (trailWeek >= 0 && trailWeek < totalWeeks) {
        const week = renderContributions[trailWeek];
        (week.days || []).forEach((_, dayIndex) => {
          const el = cellRefs.current[trailWeek]?.[dayIndex];
          if (!el) return;
          if (el.style.transform !== "scale(1)" && el.style.transform !== "") {
            el.style.transform = "scale(1)";
            el.style.boxShadow = "none";
            el.style.zIndex = "1";
          }
        });
      }

      rafRef.current = requestAnimationFrame(tick);
    },
    [speed, maxProgress, totalWeeks, renderContributions, fullPaint, updateLiveCounters]
  );

  // ─── Mount & Playback Lifecycle ──────────────────────────────────────────
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      fullPaint(maxProgress);
      setIsPlaying(false);
      setIsFinished(true);
      isPlayingRef.current = false;
      return;
    }

    // Initialize to beginning and autoplay smoothly
    waveRef.current = minProgress;
    lastBloomedWeekRef.current = minProgress - 1;
    fullPaint(minProgress);
    if (sliderRef.current) sliderRef.current.value = String(minProgress);
    setIsFinished(false);
    setIsPlaying(true);
    isPlayingRef.current = true;
    lastTimeRef.current = 0;
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [renderContributions, fullPaint, minProgress, maxProgress, tick]);

  // ─── Slider Scrub Handlers ───────────────────────────────────────────────
  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    waveRef.current = val;
    lastBloomedWeekRef.current = Math.floor(val);
    fullPaint(val);
    if (val >= maxProgress - 0.5) {
      setIsFinished(true);
    } else {
      setIsFinished(false);
    }
  };

  const handleScrubStart = () => {
    isInteractingRef.current = true;
    if (isPlaying) {
      setIsPlaying(false);
      isPlayingRef.current = false;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    }
  };

  const handleScrubEnd = () => {
    isInteractingRef.current = false;
  };

  // ─── Play / Pause / Replay Handler (Guaranteed Never Stuck) ───────────────
  const handlePlayPause = () => {
    // If finished or at/near the end: REPLAY cleanly from the start
    if (isFinished || waveRef.current >= maxProgress - 0.5) {
      waveRef.current = minProgress;
      lastBloomedWeekRef.current = minProgress - 1;
      fullPaint(minProgress);
      if (sliderRef.current) sliderRef.current.value = String(minProgress);
      setIsFinished(false);
      setIsPlaying(true);
      isPlayingRef.current = true;
      lastTimeRef.current = 0;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    if (isPlaying) {
      // Pause
      setIsPlaying(false);
      isPlayingRef.current = false;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    } else {
      // Resume
      setIsPlaying(true);
      isPlayingRef.current = true;
      lastTimeRef.current = 0;
      rafRef.current = requestAnimationFrame(tick);
    }
  };

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
            <div
              ref={commitsCountRef}
              className="font-sans text-2xl font-semibold text-white tabular-nums"
            >
              {cumulativeData.finalTotal}
            </div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
              Contributions
            </div>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="text-right">
            <div
              ref={yearCountRef}
              className="font-sans text-2xl font-semibold text-white tabular-nums"
            >
              {cumulativeData.finalYear}
            </div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
              Year
            </div>
          </div>
        </div>
      </div>

      {/* Grid container with smooth scroll */}
      <div className="relative mb-6 overflow-x-auto pb-4 pt-2">
        <div className="flex min-w-max gap-[3px] sm:gap-1">
          {renderContributions.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-[3px] sm:gap-1">
              {(week.days || []).map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  ref={(el) => {
                    if (!cellRefs.current[weekIndex]) {
                      cellRefs.current[weekIndex] = [];
                    }
                    cellRefs.current[weekIndex][dayIndex] = el;
                  }}
                  className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-[2px] transition-[transform,box-shadow,background-color] duration-200 ease-out"
                  style={{
                    backgroundColor: MUTED_COLOR,
                    willChange: "transform, background-color, box-shadow",
                  }}
                  title={`${day.count || 0} contribution${day.count === 1 ? "" : "s"} on ${day.date}`}
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
            type="button"
            onClick={handlePlayPause}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white transition-colors hover:bg-white/20 active:scale-95"
            aria-label={isPlaying ? "Pause replay" : isFinished ? "Restart replay" : "Play replay"}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : isFinished ? (
              <RotateCcw className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4 fill-white" />
            )}
          </button>
        </div>

        {/* Scrubber slider with fluid sub-pixel positioning */}
        <div className="flex flex-1 items-center gap-3">
          <input
            ref={sliderRef}
            type="range"
            min={minProgress}
            max={maxProgress}
            step="0.1"
            defaultValue={minProgress}
            onChange={handleScrub}
            onMouseDown={handleScrubStart}
            onMouseUp={handleScrubEnd}
            onTouchStart={handleScrubStart}
            onTouchEnd={handleScrubEnd}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-white outline-none transition-opacity hover:opacity-100"
            aria-label="Timeline scrubber"
          />
        </div>
      </div>
    </div>
  );
}
