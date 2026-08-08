"use client";

import React from "react";
import {
  Sparkles,
  Calendar,
  Flame,
  Clock,
  Code2,
  TrendingUp,
  Zap,
  Award,
} from "lucide-react";
import { DeveloperInsights } from "@/lib/github/types";

interface DeveloperInsightsProps {
  insights: DeveloperInsights;
}

export function DeveloperInsightsView({ insights }: DeveloperInsightsProps) {
  const maxWeekdayCount = Math.max(
    ...insights.weekdayDistribution.map((d) => d.count),
    1
  );

  return (
    <div className="w-full space-y-8">
      {/* Top Header */}
      <div className="flex flex-col gap-1">
        <span className="font-mono text-xs font-semibold uppercase tracking-wider text-brass-light">
          Developer Insights & Consistency Score
        </span>
        <h2 className="font-display text-2xl text-ivory sm:text-3xl">
          Habits, Cadence & Trajectory
        </h2>
        <p className="font-sans text-xs text-muted">
          Deep behavioral metrics computed across your authentic commits and coding sessions.
        </p>
      </div>

      {/* Primary Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {/* Consistency Score */}
        <div className="flex flex-col justify-between rounded-2xl border border-ink-border bg-ink-surface p-5 shadow-sm transition-colors hover:border-brass-dim">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
              Consistency Score
            </span>
            <Award className="h-4 w-4 text-brass-light" />
          </div>
          <div className="my-2">
            <span className="font-display text-3xl font-bold text-brass-light sm:text-4xl">
              {insights.commitConsistencyScore}
            </span>
            <span className="font-mono text-xs text-muted"> / 100</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full border border-ink-border bg-ink">
            <div
              className="h-full bg-brass transition-all duration-700"
              style={{ width: `${insights.commitConsistencyScore}%` }}
            />
          </div>
        </div>

        {/* Best Coding Month */}
        <div className="flex flex-col justify-between rounded-2xl border border-ink-border bg-ink-surface p-5 shadow-sm transition-colors hover:border-brass-dim">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
              Peak Month
            </span>
            <Calendar className="h-4 w-4 text-commit-300" />
          </div>
          <div className="my-2">
            <span className="line-clamp-1 font-display text-2xl font-bold text-ivory sm:text-3xl">
              {insights.bestCodingMonth}
            </span>
            <span className="font-sans text-xs text-muted">Highest commit density</span>
          </div>
          <span className="font-mono text-[10px] text-commit-300">
            ★ All-Time Milestone
          </span>
        </div>

        {/* Most Productive Weekday */}
        <div className="flex flex-col justify-between rounded-2xl border border-ink-border bg-ink-surface p-5 shadow-sm transition-colors hover:border-brass-dim">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
              Power Day
            </span>
            <Zap className="h-4 w-4 text-brass-light" />
          </div>
          <div className="my-2">
            <span className="font-display text-2xl font-bold text-ivory sm:text-3xl">
              {insights.mostProductiveWeekday}
            </span>
            <span className="font-sans text-xs text-muted">Most frequent pushes</span>
          </div>
          <span className="font-mono text-[10px] text-brass-light">
            Weekly Peak Rhythm
          </span>
        </div>

        {/* Strongest Comeback Streak */}
        <div className="flex flex-col justify-between rounded-2xl border border-ink-border bg-ink-surface p-5 shadow-sm transition-colors hover:border-brass-dim">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
              Comeback Streak
            </span>
            <Flame className="h-4 w-4 text-commit-300" />
          </div>
          <div className="my-2">
            <span className="font-display text-3xl font-bold text-commit-300 sm:text-4xl">
              {insights.strongestComebackStreak}d
            </span>
            <span className="font-sans text-xs text-muted">Max continuous streak</span>
          </div>
          <span className="font-mono text-[10px] text-muted">
            After {insights.longestInactiveGapDays}d pause
          </span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Weekday Distribution */}
        <div className="rounded-2xl border border-ink-border bg-ink-surface p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg text-ivory">
                Activity by Weekday
              </h3>
              <p className="font-sans text-xs text-muted">
                Your historical rhythm across the 7 days of the week
              </p>
            </div>
            <Clock className="h-4 w-4 text-muted" />
          </div>

          <div className="flex items-end gap-2 pt-6 sm:gap-3">
            {insights.weekdayDistribution.map((item) => {
              const heightPercent = Math.max(
                10,
                Math.round((item.count / maxWeekdayCount) * 100)
              );
              const isPeak = item.day === insights.mostProductiveWeekday;

              return (
                <div
                  key={item.day}
                  className="group flex flex-1 flex-col items-center gap-2"
                >
                  <div className="relative flex h-36 w-full items-end justify-center rounded-lg bg-ink p-1">
                    <div
                      className={`w-full rounded-md transition-all duration-500 ${
                        isPeak
                          ? "bg-brass shadow-[0_0_12px_rgba(212,168,83,0.4)]"
                          : "bg-ink-border group-hover:bg-commit-300/40"
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className="absolute -top-7 hidden font-mono text-[10px] text-ivory group-hover:block">
                      {item.count}
                    </span>
                  </div>
                  <span
                    className={`font-mono text-[10px] ${
                      isPeak ? "font-bold text-brass-light" : "text-muted"
                    }`}
                  >
                    {item.day.slice(0, 3)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Time of Day Distribution */}
        <div className="rounded-2xl border border-ink-border bg-ink-surface p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg text-ivory">
                Time-of-Day Cadence
              </h3>
              <p className="font-sans text-xs text-muted">
                When your coding energy peaks throughout the day
              </p>
            </div>
            <Sparkles className="h-4 w-4 text-muted" />
          </div>

          <div className="space-y-4 pt-2">
            {insights.timeOfDayDistribution.map((item) => (
              <div key={item.label} className="space-y-1.5">
                <div className="flex justify-between font-sans text-xs">
                  <span className="text-ivory">{item.label}</span>
                  <span className="font-mono text-muted">
                    {item.percentage}% ({item.count})
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full border border-ink-border bg-ink">
                  <div
                    className="h-full bg-gradient-to-r from-brass to-commit-300 transition-all duration-700"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
