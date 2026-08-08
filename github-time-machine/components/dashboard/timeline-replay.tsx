"use client";

import { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  FastForward,
  GitCommit,
  ExternalLink,
  Clock,
  Sparkles,
  Calendar,
  Layers,
} from "lucide-react";
import { GitHubCommit } from "@/lib/github/types";
import { Button } from "@/components/ui/button";

interface TimelineReplayProps {
  commits: GitHubCommit[];
}

export function TimelineReplay({ commits }: TimelineReplayProps) {
  // Chronological order for replay (from earliest commit to latest)
  const chronologicalCommits = useRef<GitHubCommit[]>([]);

  useEffect(() => {
    chronologicalCommits.current = [...commits].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [commits]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<1 | 2 | 5>(1);

  // Speed intervals in milliseconds
  const intervalMap: Record<1 | 2 | 5, number> = {
    1: 1400,
    2: 700,
    5: 280,
  };

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Stop playback when reaching the end
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= (chronologicalCommits.current.length || 1) - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, intervalMap[speed]);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speed]);

  const activeList = chronologicalCommits.current.length > 0
    ? chronologicalCommits.current
    : commits;

  const currentCommit = activeList[currentIndex] || activeList[0];
  const total = activeList.length;
  const progressPercent = total > 1 ? (currentIndex / (total - 1)) * 100 : 100;

  const handlePlayToggle = () => {
    if (!isPlaying && currentIndex >= total - 1) {
      setCurrentIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleStepBack = () => {
    setIsPlaying(false);
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    setCurrentIndex((prev) => Math.min(total - 1, prev + 1));
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsPlaying(false);
    setCurrentIndex(Number(e.target.value));
  };

  if (!currentCommit || total === 0) {
    return null;
  }

  const commitDate = new Date(currentCommit.date);
  const formattedFullDate = commitDate.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const formattedTime = commitDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="relative overflow-hidden rounded-2xl border border-brass/30 bg-ink-surface/95 p-6 shadow-[0_0_50px_rgba(217,142,57,0.08)] backdrop-blur-xl sm:p-8">
      {/* Top Chronometer Header */}
      <div className="flex flex-col gap-4 border-b border-ink-border pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-brass-dim/60 bg-brass/10 text-brass-light">
            <Clock className="h-5 w-5 animate-spin [animation-duration:12s]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-brass-light">
                Chronological Time Machine
              </span>
              <span className="inline-flex items-center rounded-full border border-commit-300/30 bg-commit-50/20 px-2 py-0.5 font-mono text-[10px] text-commit-300">
                {isPlaying ? "Replaying History..." : "Replay Paused"}
              </span>
            </div>
            <h2 className="font-display text-xl text-ivory sm:text-2xl">
              Playback Odyssey
            </h2>
          </div>
        </div>

        {/* Vintage Odometer / Date Display */}
        <div className="flex items-center gap-3 rounded-xl border border-ink-border bg-ink/80 px-4 py-2 font-mono">
          <Calendar className="h-4 w-4 text-brass-light" />
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-brass-light">
              {currentCommit.year}
            </span>
            <span className="text-xs text-muted">
              {currentCommit.monthName.slice(0, 3)} {commitDate.getDate()}
            </span>
          </div>
          <span className="border-l border-ink-border pl-2 text-xs text-muted/80">
            {formattedTime}
          </span>
        </div>
      </div>

      {/* Spotlight Commit Card Display */}
      <div className="relative my-8 overflow-hidden rounded-xl border-2 border-brass-light/40 bg-gradient-to-b from-ink/90 via-ink-soft to-ink-surface p-6 sm:p-8">
        {/* Glow pulse behind commit card */}
        <div className="pointer-events-none absolute -left-10 -top-10 h-36 w-36 rounded-full bg-brass/15 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 -right-10 h-36 w-36 rounded-full bg-commit-300/10 blur-2xl" />

        <div className="relative flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-border/80 pb-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-ink-border bg-ink-surface px-2.5 py-1 font-mono text-xs text-commit-300">
                <GitCommit className="h-3.5 w-3.5" />
                {currentCommit.repoName}
              </span>
              <a
                href={currentCommit.htmlUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-1 font-mono text-xs text-muted transition-colors hover:text-brass-light"
              >
                <span>#{currentCommit.shortSha}</span>
                <ExternalLink className="h-3 w-3 opacity-60 transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>

            <span className="font-mono text-xs text-muted">
              {formattedFullDate}
            </span>
          </div>

          <div className="py-2">
            <h3 className="font-display text-2xl leading-snug text-ivory sm:text-3xl">
              {currentCommit.message}
            </h3>
          </div>

          <div className="flex items-center justify-between pt-2 font-mono text-xs text-muted">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-brass-light" />
              <span>Authored by <strong className="text-ivory">{currentCommit.authorName}</strong></span>
            </div>
            <div className="flex items-center gap-1 text-brass-light">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Event {currentIndex + 1} of {total}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scrubbable Progress Bar & Controls */}
      <div className="flex flex-col gap-6">
        {/* Progress bar with timestamp indicators */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between font-mono text-xs text-muted">
            <span className="text-brass-light">
              {activeList[0]?.year} Initial Commit
            </span>
            <span className="font-semibold text-ivory">
              {Math.round(progressPercent)}% Journey
            </span>
            <span>
              {activeList[total - 1]?.year} Present
            </span>
          </div>

          <div className="relative flex items-center">
            <input
              type="range"
              min={0}
              max={total - 1}
              value={currentIndex}
              onChange={handleSliderChange}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-ink border border-ink-border accent-brass-light focus:outline-none"
            />
          </div>
        </div>

        {/* Playback Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-ink-border bg-ink/60 p-4">
          {/* Transport buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              title="Jump to beginning"
              className="h-10 w-10 p-0 border-ink-border"
            >
              <RotateCcw className="h-4 w-4 text-muted" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleStepBack}
              disabled={currentIndex === 0}
              title="Previous commit"
              className="h-10 w-10 p-0 border-ink-border"
            >
              <SkipBack className="h-4 w-4 text-ivory" />
            </Button>
            <Button
              onClick={handlePlayToggle}
              className="h-11 px-6 font-mono text-sm font-semibold tracking-wide bg-brass hover:bg-brass-light text-ink shadow-[0_0_20px_rgba(217,142,57,0.4)]"
            >
              {isPlaying ? (
                <>
                  <Pause className="mr-2 h-4 w-4 fill-current" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4 fill-current" />
                  {currentIndex >= total - 1 ? "Replay" : "Play"}
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleStepForward}
              disabled={currentIndex >= total - 1}
              title="Next commit"
              className="h-10 w-10 p-0 border-ink-border"
            >
              <SkipForward className="h-4 w-4 text-ivory" />
            </Button>
          </div>

          {/* Speed Controls */}
          <div className="flex items-center gap-1.5 rounded-lg border border-ink-border bg-ink-surface p-1">
            <span className="px-2 font-mono text-[11px] uppercase tracking-wider text-muted">
              Speed
            </span>
            {([1, 2, 5] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`rounded px-3 py-1 font-mono text-xs font-semibold transition-all ${
                  speed === s
                    ? "bg-brass text-ink shadow-sm"
                    : "text-muted hover:text-ivory"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
