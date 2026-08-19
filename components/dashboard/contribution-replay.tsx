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
  // waveRef = the single source of truth for the wave column index
  const waveRef = useRef(-4);
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(0);
  const isPlayingRef = useRef(true);
  const isInteractingRef = useRef(false);

  // ─── Cell DOM refs (indexed [weekIndex][dayIndex]) ───────────────────────
  // We paint directly into these elements; React never re-renders them.
  const cellRefs = useRef<(HTMLDivElement | null)[][]>([]);

  // ─── Core paint function — called by rAF, touches DOM directly ───────────
  const paintFrame = useCallback(
    (wave: number) => {
      renderContributions.forEach((week, weekIndex) => {
        const waveDistance = wave - weekIndex;
        const isWave = isPlayingRef.current && waveDistance >= -1 && waveDistance <= 1;
        const hasBloomed = waveDistance >= 0;
        const isFading = waveDistance > 1 && waveDistance <= 5;

        (week.days || []).forEach((day, dayIndex) => {
          const el = cellRefs.current[weekIndex]?.[dayIndex];
          if (!el) return;

          const level = day.level;
          const active = isWave && level > 0;
          const cellColor = hasBloomed ? getCellColor(level) : MUTED_COLOR;
          const glowOpacity = active
            ? 0.7
            : isFading && level > 0
            ? Math.max(0.12, 0.45 - waveDistance * 0.06)
            : 0;

          el.style.backgroundColor = cellColor;
          el.style.filter = active ? "brightness(1.25)" : "brightness(1)";
          el.style.transform = active
            ? "scale(1.2)"
            : hasBloomed && level > 0
            ? "scale(1.04)"
            : "scale(1)";
          el.style.boxShadow =
            glowOpacity > 0
              ? `0 0 ${active ? 14 : 9}px rgba(255,255,255,${glowOpacity})`
              : "none";
          el.style.zIndex = active ? "10" : "1";
        });
      });
    },
    [renderContributions]
  );

  // ─── rAF ticker — advances wave every ~55ms without touching React ────────
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
          paintFrame(waveRef.current);
          // Sync slider without scheduling a React re-render on every tick —
          // we use a batched 200ms interval below instead.
        } else {
          isPlayingRef.current = false;
          setIsPlaying(false);
          setSliderValue(waveRef.current);
          return; // stop loop
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    },
    [maxProgress, paintFrame]
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
  }, [isPlaying, tick]);

  // ─── Reset on mount ───────────────────────────────────────────────────────
  useEffect(() => {
    waveRef.current = -4;
    setSliderValue(-4);
    setIsPlaying(true);
    paintFrame(-4);
  }, [renderContributions, paintFrame]);

  // ─── Slider scrub: user drags, we paint immediately at that position ──────
  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    waveRef.current = val;
    setSliderValue(val);
    paintFrame(val);
  };

  // ─── Play / Pause toggle ─────────────────────────────────────────────────
  const handlePlayPause = () => {
    if (sliderValue >= maxProgress) {
      // Restart
      waveRef.current = -4;
      setSliderValue(-4);
      paintFrame(-4);
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
    <div className="glass-card w-full overflow-hidden p-4 sm:p-5 lg:p-6">
      <div className="mb-8 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
            Contribution Graph Replay
          </span>
          <h2 className="mt-0 font-sans tracking-tight font-semibold text-2xl text-white sm:text-3xl">
            Activity bloom over time
          </h2>
          <p className="mt-0 text-sm text-zinc-400">
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

        {/* Right-edge fade signals horizontal scrollability on mobile */}
        <div className="relative overflow-x-auto rounded-xl border border-white/10 bg-surface p-4 pb-5 shadow-inner [mask-image:linear-gradient(to_right,black_85%,transparent_100%)] sm:[mask-image:none]">
          <div className="flex min-w-[760px]">
          {/* Day labels */}
          <div className="flex flex-col gap-[3px] pr-2 pt-5 font-mono text-[10px] text-zinc-500">
            <div className="h-[11px]" />
            <div className="h-[11px] leading-[11px]">Mon</div>
            <div className="h-[11px]" />
            <div className="h-[11px] leading-[11px]">Wed</div>
            <div className="h-[11px]" />
            <div className="h-[11px] leading-[11px]">Fri</div>
            <div className="h-[11px]" />
          </div>

          <div className="flex flex-1 gap-[3px] pt-5">
            {renderContributions.map((week, weekIndex) => (
              <div key={weekIndex} className="relative flex flex-col gap-[3px]">
                {/* Month labels */}
                {weekIndex % 4 === 0 &&
                  weekIndex < renderContributions.length &&
                  week.days?.[0]?.date && (
                    <div className="absolute -top-5 font-mono text-[10px] text-zinc-500 whitespace-nowrap">
                      {new Date(week.days[0].date).toLocaleString("default", {
                        month: "short",
                      })}
                    </div>
                  )}

                {(week.days || []).map((day, dayIndex) => (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    ref={(el) => {
                      if (!cellRefs.current[weekIndex]) {
                        cellRefs.current[weekIndex] = [];
                      }
                      cellRefs.current[weekIndex][dayIndex] = el;
                    }}
                    className="h-[11px] w-[11px] rounded-[2px] transition-[background-color,box-shadow,transform,filter] duration-700 ease-out sm:h-[13px] sm:w-[13px]"
                    style={{ backgroundColor: MUTED_COLOR }}
                    title={`${day.count} contribution${day.count === 1 ? "" : "s"} on ${day.date}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-white/10 pt-6">
        <div className="flex flex-1 items-center gap-4">
          <button
            onClick={handlePlayPause}
            className="flex h-11 w-11 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label={isPlaying ? "Pause replay" : sliderValue >= maxProgress ? "Restart replay" : "Play replay"}
          >
            {isPlaying ? <Pause size={14} /> : sliderValue >= maxProgress ? <RotateCcw size={14} /> : <Play size={14} />}
          </button>

          <input
            type="range"
            min="-4"
            max={maxProgress}
            value={sliderValue}
            onChange={handleScrub}
            onMouseEnter={() => { isInteractingRef.current = true; }}
            onMouseLeave={() => { isInteractingRef.current = false; }}
            onTouchStart={() => { isInteractingRef.current = true; }}
            onTouchEnd={() => { isInteractingRef.current = false; }}
            onMouseDown={() => setIsPlaying(false)}
            aria-label="Scrub timeline"
            className="flex-1 sm:w-48 sm:flex-initial py-3 bg-transparent cursor-pointer appearance-none outline-none focus:ring-2 focus:ring-white/50 [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-white/20 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:mt-[-6px] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 sm:[&::-webkit-slider-thumb]:h-3 sm:[&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(255,255,255,0.8)] [&::-webkit-slider-thumb]:transition-transform hover:[&::-webkit-slider-thumb]:scale-125"
          />
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-zinc-500">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((l) => (
              <div
                key={l}
                className="h-[10px] w-[10px] rounded-sm"
                style={{ backgroundColor: getCellColor(l) }}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
