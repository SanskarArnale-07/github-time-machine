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
        return "#211E1A";
      case 1:
        return "#4A3923";
      case 2:
        return "#77532A";
      case 3:
        return "#A87838";
      case 4:
        return "#D8B56C";
      default:
        return "#211E1A";
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
    <div className="w-full overflow-hidden rounded-2xl border border-[#2A2520] bg-[#1A1714] p-6 shadow-sm sm:p-8">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-brass-light">
            Contribution Graph Replay
          </span>
          <h2 className="mt-1 font-display text-2xl text-ivory sm:text-3xl">
            Activity bloom over time
          </h2>
          <p className="mt-1 text-sm text-muted">
            A continuous canvas of your momentum, illuminated left-to-right.
          </p>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-[#2A2520] bg-[#0B0A09]/60 px-4 py-2.5">
          <div className="text-right">
            <div className="font-display text-2xl font-bold text-brass-light">
              {currentTotalCommits}
            </div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted">
              Contributions
            </div>
          </div>
          <div className="h-8 w-px bg-[#2A2520]" />
          <div className="text-right">
            <div className="font-display text-2xl font-bold text-ivory">
              {currentYear}
            </div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted">
              Year
            </div>
          </div>
        </div>
      </div>

      <div className="relative overflow-x-auto rounded-xl border border-[#2A2520]/80 bg-[#0B0A09]/45 p-4 pb-5 shadow-inner">
        <div className="flex min-w-[760px]">
          {/* Day labels */}
          <div className="flex flex-col gap-[3px] pr-2 pt-5 font-mono text-[10px] text-muted">
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
                    <div className="absolute -top-5 font-mono text-[10px] text-muted whitespace-nowrap">
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
                  const mutedColor = "#211E1A";
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
                            ? `0 0 ${active ? 14 : 9}px rgba(216,181,108,${glowOpacity})`
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

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[#2A2520] pt-6">
        <div className="flex items-center gap-2 font-mono text-xs text-muted">
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
