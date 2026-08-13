"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { ContributionWeek } from "@/lib/github/types";

interface ContributionReplayProps {
  contributions: ContributionWeek[];
}

export function ContributionReplay({
  contributions,
}: ContributionReplayProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [waveProgress, setWaveProgress] = useState(-4);

  // Reset and auto-play bloom on every mount (tab revisit)
  useEffect(() => {
    setWaveProgress(-4);
    setIsPlaying(true);
  }, []);
  useEffect(() => {
    if (isPlaying) {
      if (waveProgress < contributions.length + 4) {
        timerRef.current = setTimeout(() => {
          setWaveProgress((prev) => prev + 1);
        }, 55);
      } else {
        setIsPlaying(false);
      }
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, waveProgress, contributions.length]);


  const getCellColor = (level: number) => {
    switch (level) {
      case 0:
        return "#18181b"; // zinc-900
      case 1:
        return "#3f3f46"; // zinc-700
      case 2:
        return "#71717a"; // zinc-500
      case 3:
        return "#d4d4d8"; // zinc-300
      case 4:
        return "#ffffff"; // white
      default:
        return "#18181b";
    }
  };

  const currentTotalCommits = useMemo(
    () =>
      contributions.reduce((acc, week) => {
        return acc + (week.days || []).reduce((sum, day) => sum + (day.count || 0), 0);
      }, 0),
    [contributions]
  );

  const currentYear =
    contributions.length > 0 && contributions[contributions.length - 1]?.days?.[0]?.date
      ? new Date(contributions[contributions.length - 1].days[0].date).getFullYear()
      : new Date().getFullYear();

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0A] p-6 shadow-sm sm:p-8">
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

        <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-[#0A0A0A] px-4 py-2.5">
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

      <div className="relative overflow-x-auto rounded-xl border border-white/10 bg-[#0A0A0A] p-4 pb-5 shadow-inner">
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

          <div className="flex flex-1 gap-[3px]">
            {contributions.map((week, weekIndex) => (
              <div key={weekIndex} className="relative flex flex-col gap-[3px]">
                {/* Month labels */}
                {weekIndex % 4 === 0 &&
                  weekIndex < contributions.length &&
                  week.days?.[0]?.date && (
                    <div className="absolute -top-5 font-mono text-[10px] text-zinc-500 whitespace-nowrap">
                      {new Date(week.days[0].date).toLocaleString("default", {
                        month: "short",
                      })}
                    </div>
                  )}

                {(week.days || []).map((day, dayIndex) => {
                  const level = day.level;
                  const waveDistance = waveProgress - weekIndex;
                  const isWave = isPlaying && waveDistance >= -1 && waveDistance <= 1;
                  const hasBloomed = waveDistance >= 0;
                  const isFading = waveDistance > 1 && waveDistance <= 5;
                  const active = isWave && level > 0;
                  const mutedColor = "#18181b";
                  const cellColor = hasBloomed ? getCellColor(level) : mutedColor;
                  const glowOpacity = active ? 0.7 : isFading && level > 0 ? Math.max(0.12, 0.45 - waveDistance * 0.06) : 0;
                  
                  return (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className="h-[11px] w-[11px] rounded-[2px] transition-[background-color,box-shadow,transform,filter] duration-700 ease-out sm:h-[13px] sm:w-[13px]"
                      style={{
                        backgroundColor: cellColor,
                        filter: active ? "brightness(1.25)" : "brightness(1)",
                        transform: active ? "scale(1.2)" : hasBloomed && level > 0 ? "scale(1.04)" : "scale(1)",
                        boxShadow:
                          glowOpacity > 0
                            ? `0 0 ${active ? 14 : 9}px rgba(255,255,255,${glowOpacity})`
                            : "none",
                        zIndex: active ? 10 : 1,
                      }}
                      title={`${day.count} contribution${day.count === 1 ? "" : "s"} on ${day.date}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
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
