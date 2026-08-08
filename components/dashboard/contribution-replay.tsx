"use client";
import React, { useState, useEffect, useRef } from "react";
import { ContributionWeek, GitHubCommit } from "@/lib/github/types";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContributionReplayProps {
  contributions: ContributionWeek[];
  commits: GitHubCommit[];
}

export function ContributionReplay({
  contributions,
  commits,
}: ContributionReplayProps) {
  const [visibleWeeks, setVisibleWeeks] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<1 | 2 | 5>(2);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying && visibleWeeks < contributions.length) {
      const delay = speed === 1 ? 180 : speed === 2 ? 120 : 60;
      timerRef.current = setTimeout(() => {
        setVisibleWeeks((prev) => prev + 1);
      }, delay);
    } else if (isPlaying && visibleWeeks >= contributions.length) {
      setIsPlaying(false);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, visibleWeeks, contributions.length, speed]);

  const togglePlay = () => {
    if (visibleWeeks >= contributions.length) {
      setVisibleWeeks(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setVisibleWeeks(0);
  };

  const getCellColor = (level: number) => {
    switch (level) {
      case 0:
        return "#161A1E";
      case 1:
        return "#0E4429";
      case 2:
        return "#006D32";
      case 3:
        return "#26A641";
      case 4:
        return "#39D353";
      default:
        return "#161A1E";
    }
  };

  const currentVisibleCommits = contributions
    .slice(0, visibleWeeks)
    .reduce((acc, week) => {
      return acc + (week.days || []).reduce((sum, day) => sum + (day.count || 0), 0);
    }, 0);

  const currentYear =
    contributions.length > 0 &&
    visibleWeeks > 0 &&
    visibleWeeks <= contributions.length &&
    contributions[visibleWeeks - 1]?.days?.[0]?.date
      ? new Date(contributions[visibleWeeks - 1].days[0].date).getFullYear()
      : new Date().getFullYear();

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-ink-border bg-ink-surface p-6 shadow-sm sm:p-8">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-brass-light">
            Contribution Graph Replay
          </span>
          <h2 className="mt-1 font-display text-2xl text-ivory sm:text-3xl">
            Activity bloom over time
          </h2>
          <p className="mt-1 text-sm text-muted">
            Watch your contribution graph animate week by week across the past year.
          </p>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-ink-border bg-ink/60 px-4 py-2.5">
          <div className="text-right">
            <div className="font-display text-2xl font-bold text-brass-light">
              {currentVisibleCommits}
            </div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted">
              Contributions
            </div>
          </div>
          <div className="h-8 w-px bg-ink-border" />
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

      <div className="relative overflow-x-auto pb-4">
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
                  const isVisible = weekIndex < visibleWeeks;
                  const level = day.level;
                  const active = isVisible && level > 0;
                  return (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className="h-[11px] w-[11px] rounded-[2px] transition-all duration-500 ease-out sm:h-[13px] sm:w-[13px]"
                      style={{
                        backgroundColor: getCellColor(isVisible ? level : 0),
                        transform: active ? "scale(1.15)" : "scale(0.85)",
                        boxShadow: active ? `0 0 8px ${getCellColor(level)}` : "none",
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

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-ink-border pt-6">
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

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            title="Reset to beginning"
            className="h-9 px-3 text-muted hover:text-ivory"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>

          <div className="flex items-center rounded-lg border border-ink-border bg-ink-soft p-1">
            {([1, 2, 5] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`rounded px-2.5 py-1 font-mono text-xs font-semibold transition-colors ${
                  speed === s
                    ? "bg-brass text-ink shadow-sm"
                    : "text-muted hover:text-ivory"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          <Button
            size="sm"
            onClick={togglePlay}
            className={`font-sans text-xs font-semibold ${
              !isPlaying
                ? "bg-brass text-ink hover:bg-brass-light"
                : "border border-ink-border bg-ink-surface text-ivory hover:bg-ink-soft"
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="mr-1.5 h-3.5 w-3.5 fill-current" /> Pause
              </>
            ) : (
              <>
                <Play className="mr-1.5 h-3.5 w-3.5 fill-current" />
                {visibleWeeks >= contributions.length
                  ? "Replay Again"
                  : "Play Graph"}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
