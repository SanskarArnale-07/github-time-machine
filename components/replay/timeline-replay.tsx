"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ExternalLink,
  FileText,
  FolderGit2,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Share2,
  SlidersHorizontal,
  Volume2,
  VolumeX,
} from "lucide-react";
import type {
  ContributionWeek,
  GitHubCommit,
  GitHubRepo,
  GitHubUserProfile,
  ReplayEvent,
} from "@/lib/github/types";
import { useReplayEngine } from "@/lib/github/replay-engine";
import { ambientSoundtrack } from "@/lib/audio/ambient-soundtrack";
import {
  copyShareableReplayLink,
  downloadReplaySummaryPDF,
} from "@/lib/github/export-utils";
import { Button } from "@/components/ui/button";
import { ReplayBackground } from "@/components/replay/replay-background";

interface TimelineReplayProps {
  commits: GitHubCommit[];
  repos?: GitHubRepo[];
  profile?: GitHubUserProfile | null;
  contributions?: ContributionWeek[];
}

interface ReplayMilestoneCardProps {
  event: ReplayEvent | null;
  accent: string;
  border: string;
  isFinal: boolean;
  commitsReplayed: number;
  repoCount: number;
  yearsSpan: number;
}

function ReplayMilestoneCard({
  event,
  accent,
  border,
  isFinal,
  commitsReplayed,
  repoCount,
  yearsSpan,
}: ReplayMilestoneCardProps) {
  if (isFinal) {
    return (
      <article className="replay-milestone-card relative w-[74vw] max-w-[70rem] overflow-hidden rounded-2xl border border-brass/35 bg-[#1A1714]/95 p-7 text-center shadow-[0_30px_95px_rgba(0,0,0,0.58)] backdrop-blur-xl max-sm:w-[calc(100vw-2rem)] sm:p-8">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brass to-transparent" />
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-brass-light">
          Documentary finale
        </span>
        <h2 className="mt-2 font-display text-2xl text-ivory sm:text-3xl">
          This is how a developer is built.
        </h2>
        <p className="mt-2 text-sm text-muted">
          {commitsReplayed} commits, {repoCount} repositories, and {yearsSpan} year{yearsSpan === 1 ? "" : "s"} of becoming.
        </p>
      </article>
    );
  }

  const isRepository = event?.type === "repo_created";
  const isYearMarker = event?.type === "year_milestone";
  const formattedDate = event?.date
    ? new Date(event.date).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "";
  const title = isRepository
    ? event?.repoName
    : isYearMarker
      ? event?.title
      : event?.title || "A meaningful step forward";
  const description = isRepository
    ? event?.description || "A new repository entered the archive."
    : event?.description ||
      event?.impactDescription ||
      event?.commit?.message?.split("\n")[0] ||
      "Another line in the story takes shape.";

  return (
    <article
      className="replay-milestone-card relative w-[74vw] max-w-[70rem] overflow-hidden rounded-2xl border bg-[#1A1714]/95 p-7 shadow-[0_30px_95px_rgba(0,0,0,0.6)] backdrop-blur-xl max-sm:w-[calc(100vw-2rem)] sm:p-8"
      style={{ borderColor: border }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.055),transparent_42%)]" />
      <div
        className="pointer-events-none absolute -right-14 -top-16 h-44 w-44 rounded-full blur-3xl"
        style={{ backgroundColor: accent, opacity: 0.12 }}
      />

      <div className="relative flex h-full min-h-[210px] flex-col justify-between gap-5">
        <div className="flex items-center justify-between gap-3 border-b border-[#3A332B]/70 pb-3">
          <span className="inline-flex min-w-0 items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-brass-light">
            {isRepository ? <FolderGit2 className="h-3.5 w-3.5 shrink-0" /> : <Clock3 className="h-3.5 w-3.5 shrink-0" />}
            {isRepository ? "Repository founded" : isYearMarker ? "New chapter" : event?.repoName || "Milestone"}
          </span>
          <span className="shrink-0 font-mono text-[10px] text-muted">{formattedDate}</span>
        </div>

        <div>
          <h2 className="line-clamp-2 font-display text-3xl leading-tight text-ivory sm:text-4xl">{title}</h2>
          <p className="mt-3 line-clamp-2 max-w-3xl text-[15px] leading-relaxed text-muted sm:text-base">{description}</p>
        </div>

        <div className="flex min-h-4 items-center justify-between gap-3 border-t border-[#3A332B]/70 pt-3 font-mono text-[10px] text-muted">
          {event?.language ? (
            <span className="inline-flex items-center gap-1.5 text-ivory">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: event.languageColor || accent }} />
              {event.language}
            </span>
          ) : (
            <span>{event?.commitShortSha ? `Commit ${event.commitShortSha}` : "A preserved moment"}</span>
          )}
          {event?.repoUrl ? (
            <a
              href={event.repoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-brass-light transition-colors hover:text-ivory"
            >
              View repository <ExternalLink className="h-3 w-3" />
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function TimelineReplay({ commits, repos = [], profile = null }: TimelineReplayProps) {
  const username = profile?.name || profile?.login || "Developer";
  const engine = useReplayEngine(commits, repos, username);
  const theaterRef = useRef<HTMLDivElement>(null);
  const stateWasRestored = useRef(false);
  const replayStateKey = `gtm_replay_state_${username.toLowerCase()}`;

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showChapterSelector, setShowChapterSelector] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      theaterRef.current?.requestFullscreen().catch(() => undefined);
      return;
    }

    document.exitFullscreen?.().catch(() => undefined);
  }, []);

  useEffect(() => {
    const updateFullscreenState = () => {
      setIsFullscreen(document.fullscreenElement === theaterRef.current);
    };

    document.addEventListener("fullscreenchange", updateFullscreenState);
    return () => document.removeEventListener("fullscreenchange", updateFullscreenState);
  }, []);

  useEffect(() => {
    try {
      if (localStorage.getItem("github_time_machine_sound_enabled") === "true") {
        setSoundEnabled(true);
        ambientSoundtrack.start();
      }
    } catch {
      // Local preferences are optional and should never block the replay.
    }

    return () => ambientSoundtrack.stop();
  }, []);

  useEffect(() => {
    if (!soundEnabled || !engine.currentEvent) return;

    if (engine.currentEvent.impactType === "milestone") {
      ambientSoundtrack.triggerMilestoneSwell(880);
    } else if (engine.isPlaying) {
      ambientSoundtrack.triggerSubtleClick();
    }
  }, [engine.currentEvent, engine.isPlaying, soundEnabled]);

  useEffect(() => {
    if (!soundEnabled || !engine.currentChapter) return;

    const chapterIndex = engine.chapters.findIndex((chapter) => chapter.id === engine.currentChapter?.id);
    ambientSoundtrack.setTheme(
      chapterIndex <= 1 ? "odyssey" : chapterIndex === engine.chapters.length - 1 ? "horizon" : "constellations"
    );
  }, [engine.chapters, engine.currentChapter, soundEnabled]);

  // Restore once after the events exist. A fresh session still starts on the first frame.
  useEffect(() => {
    if (stateWasRestored.current || engine.total === 0) return;
    stateWasRestored.current = true;

    try {
      const saved = sessionStorage.getItem(replayStateKey);
      if (!saved) return;
      const parsed = JSON.parse(saved) as { index?: number; speed?: 1 | 2 | 5 };
      if (typeof parsed.index === "number") engine.seek(parsed.index);
      if (parsed.speed === 1 || parsed.speed === 2 || parsed.speed === 5) engine.setSpeed(parsed.speed);
    } catch {
      // A stale replay state is safely ignored.
    }
  }, [engine, replayStateKey]);

  useEffect(() => {
    if (!stateWasRestored.current || engine.total === 0) return;

    try {
      sessionStorage.setItem(
        replayStateKey,
        JSON.stringify({ index: engine.currentIndex, speed: engine.speed })
      );
    } catch {
      // Session storage is an enhancement, not a replay dependency.
    }
  }, [engine.currentIndex, engine.speed, engine.total, replayStateKey]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target?.matches("input, textarea, select, [contenteditable='true']")) return;

      if (event.code === "KeyF") {
        event.preventDefault();
        toggleFullscreen();
      }

      if (event.key === "Escape") {
        setShowChapterSelector(false);
        setShowControls(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggleFullscreen]);

  const toggleSoundtrack = useCallback(() => {
    const nextSoundEnabled = !soundEnabled;
    setSoundEnabled(nextSoundEnabled);

    if (nextSoundEnabled) ambientSoundtrack.start();
    else ambientSoundtrack.stop();

    try {
      localStorage.setItem("github_time_machine_sound_enabled", String(nextSoundEnabled));
    } catch {
      // The soundtrack still works when local storage is unavailable.
    }
  }, [soundEnabled]);

  const copyReplayLink = useCallback(async () => {
    const result = await copyShareableReplayLink(username, engine.currentIndex);
    if (!result.success) return;

    setCopiedLink(true);
    window.setTimeout(() => setCopiedLink(false), 2200);
  }, [engine.currentIndex, username]);

  if (engine.total === 0) {
    return (
      <div className="replay-theater flex items-center justify-center px-6 text-center">
        <div className="max-w-md rounded-2xl border border-brass/25 bg-[#1A1714]/85 p-8 shadow-2xl">
          <Clock3 className="mx-auto h-9 w-9 text-brass-light" />
          <h1 className="mt-4 font-display text-2xl text-ivory">No milestones available yet</h1>
          <p className="mt-2 text-sm text-muted">Your documentary will begin once GitHub history is available.</p>
        </div>
      </div>
    );
  }

  const chapterIndex = Math.max(0, engine.chapters.findIndex((chapter) => chapter.id === engine.currentChapter?.id));
  const isFinal = engine.currentIndex >= engine.total - 1;
  const yearsSpan = Math.max(1, engine.endYear - engine.startYear + 1);

  return (
    <div ref={theaterRef} className="replay-theater">
      <div className="replay-fullscreen-background">
        <ReplayBackground />
      </div>
      <div className="replay-safe-frame">
        <header className="relative z-30 flex min-h-9 items-center justify-between gap-3">
          <a
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#3A332B] bg-[#141210]/80 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted backdrop-blur-md transition-colors hover:border-brass/50 hover:text-ivory"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Back to </span>Archive
          </a>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={toggleSoundtrack}
              className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-2.5 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors ${
                soundEnabled
                  ? "border-brass/50 bg-brass/10 text-brass-light"
                  : "border-[#3A332B] bg-[#141210]/80 text-muted hover:text-ivory"
              }`}
              aria-pressed={soundEnabled}
              title="Toggle ambient soundtrack"
            >
              {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
              <span className="hidden md:inline">{soundEnabled ? "Sound on" : "Muted"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowChapterSelector((open) => !open);
                setShowControls(false);
              }}
              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-[#3A332B] bg-[#141210]/80 px-2.5 font-mono text-[10px] uppercase tracking-[0.1em] text-muted transition-colors hover:border-brass/50 hover:text-ivory"
              aria-expanded={showChapterSelector}
            >
              <span className="hidden sm:inline">Chapter </span>{chapterIndex + 1}/{engine.chapters.length}
            </button>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#3A332B] bg-[#141210]/80 text-muted transition-colors hover:border-brass/50 hover:text-ivory"
              title="Toggle fullscreen (F)"
            >
              {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowControls((open) => !open);
                setShowChapterSelector(false);
              }}
              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-[#3A332B] bg-[#141210]/80 px-2.5 font-mono text-[10px] uppercase tracking-[0.1em] text-muted transition-colors hover:border-brass/50 hover:text-ivory"
              aria-expanded={showControls}
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-brass-light" />
              <span className="hidden sm:inline">Controls</span>
            </button>
          </div>

          {showChapterSelector ? (
            <div className="replay-popover right-0 top-11 w-[min(24rem,calc(100vw-2rem))] p-2">
              <p className="px-2 pb-2 pt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Select a chapter</p>
              <div className="max-h-[55dvh] space-y-1 overflow-y-auto pr-1">
                {engine.chapters.map((chapter, index) => (
                  <button
                    key={chapter.id}
                    type="button"
                    onClick={() => {
                      engine.jumpToChapter(chapter.id);
                      setShowChapterSelector(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition-colors ${
                      chapter.id === engine.currentChapter?.id
                        ? "bg-brass/15 text-brass-light"
                        : "text-muted hover:bg-white/5 hover:text-ivory"
                    }`}
                  >
                    <span className="font-sans text-sm">{chapter.name}</span>
                    <span className="font-mono text-[10px]">{String(index + 1).padStart(2, "0")}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {showControls ? (
            <div className="replay-popover right-0 top-11 w-[min(22rem,calc(100vw-2rem))] p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Documentary tools</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={copyReplayLink} className="border-[#3A332B] font-mono text-[10px] text-muted">
                  {copiedLink ? <Check className="mr-1.5 h-3 w-3 text-brass-light" /> : <Share2 className="mr-1.5 h-3 w-3" />}
                  {copiedLink ? "Copied" : "Share"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadReplaySummaryPDF(profile, engine.chapters, commits, repos)}
                  className="border-[#3A332B] font-mono text-[10px] text-muted"
                >
                  <FileText className="mr-1.5 h-3 w-3 text-brass-light" />
                  Chronicle
                </Button>
              </div>
            </div>
          ) : null}
        </header>

        <main className="replay-main relative z-10">
          <div className="w-full max-w-4xl text-center">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.26em] text-brass-light">
              Chapter {String(chapterIndex + 1).padStart(2, "0")} · {engine.currentYear}
            </p>
            <h1 className="replay-chapter-title mt-2 font-display text-4xl leading-none text-ivory sm:text-5xl xl:text-6xl">
              {engine.currentChapter?.name || "The Developer Journey"}
            </h1>
            {engine.currentChapter?.narrative ? (
              <p className="mx-auto mt-5 max-w-3xl text-balance font-display text-lg italic leading-relaxed text-[#D6CEC1] sm:text-xl">
                “{engine.currentChapter.narrative}”
              </p>
            ) : null}
          </div>

          <ReplayMilestoneCard
            event={engine.currentEvent}
            accent={engine.eraColor.accent}
            border={engine.eraColor.border}
            isFinal={isFinal}
            commitsReplayed={engine.stats.commitsReplayed}
            repoCount={repos.length}
            yearsSpan={yearsSpan}
          />

          <section className="replay-progress w-[74vw] max-w-[70rem] text-center max-sm:w-[calc(100vw-2rem)]">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
              Chapter {chapterIndex + 1} of {engine.chapters.length}
              <span className="mx-2 text-[#4A4035]">·</span>
              <span className="text-brass-light">{engine.currentMonthName} {engine.currentYear}</span>
            </div>
            <div className="mx-auto mt-3 h-px w-full overflow-hidden rounded-full bg-[#3A332B]">
              <div className="h-full bg-gradient-to-r from-[#8E6B35] via-brass to-brass-light transition-[width] duration-700 ease-out" style={{ width: `${engine.progress}%` }} />
            </div>
            <p className="mt-3 text-xs text-muted">
              {engine.stats.remainingEvents} meaningful milestone{engine.stats.remainingEvents === 1 ? "" : "s"} remaining
            </p>
          </section>
        </main>

        <section className="relative z-10 flex w-full items-center justify-center">
          <div className="replay-transport">
            <div className="hidden items-center gap-1 rounded-lg border border-[#3A332B] bg-[#0B0A09]/60 p-1 sm:flex">
              <span className="px-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-muted">Speed</span>
              {([1, 2, 5] as const).map((speed) => (
                <button
                  key={speed}
                  type="button"
                  onClick={() => engine.setSpeed(speed)}
                  className={`rounded-md px-2 py-1 font-mono text-[10px] font-semibold transition-colors ${
                    engine.speed === speed ? "bg-brass text-ink" : "text-muted hover:text-ivory"
                  }`}
                  aria-pressed={engine.speed === speed}
                >
                  {speed}×
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <Button variant="outline" size="sm" onClick={engine.replay} className="h-9 w-9 border-[#3A332B] p-0" title="Replay from the beginning (R)">
                <RotateCcw className="h-3.5 w-3.5 text-muted" />
              </Button>
              <Button variant="outline" size="sm" onClick={engine.stepBack} disabled={engine.currentIndex === 0} className="h-9 w-9 border-[#3A332B] p-0" title="Previous milestone">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                onClick={engine.togglePlay}
                className="h-10 min-w-[8.25rem] rounded-full bg-brass px-5 font-semibold text-ink shadow-[0_0_24px_rgba(201,168,106,0.32)] hover:bg-brass-light"
                title="Play or pause (Space)"
              >
                {engine.isPlaying ? <Pause className="mr-1.5 h-3.5 w-3.5 fill-current" /> : <Play className="mr-1.5 h-3.5 w-3.5 fill-current" />}
                {engine.isPlaying ? "Pause" : isFinal ? "Replay story" : "Play story"}
              </Button>
              <Button variant="outline" size="sm" onClick={engine.stepForward} disabled={isFinal} className="h-9 w-9 border-[#3A332B] p-0" title="Next milestone">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="hidden items-center justify-end gap-2 font-mono text-[9px] text-muted lg:flex">
              <span><kbd>Space</kbd> play</span>
              <span><kbd>← →</kbd> step</span>
              <span><kbd>F</kbd> fullscreen</span>
            </div>
          </div>
        </section>

        <p className="relative z-10 text-center font-mono text-[9px] tracking-wide text-muted/65 lg:hidden">
          Space play · ← → step · F fullscreen
        </p>
      </div>
    </div>
  );
}
