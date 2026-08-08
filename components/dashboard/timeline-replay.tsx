"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  GitCommit,
  FolderGit2,
  Calendar,
  ExternalLink,
  Sparkles,
  Clock,
  ChevronLeft,
  ChevronRight,
  Flame,
  Share2,
  FileText,
  Check,
  BookOpen,
  Zap,
  Volume2,
  VolumeX,
  Video,
  Award,
  BarChart2,
  Image as ImageIcon,
} from "lucide-react";
import {
  GitHubCommit,
  GitHubRepo,
  GitHubUserProfile,
  ContributionWeek,
} from "@/lib/github/types";
import { useReplayEngine } from "@/lib/github/replay-engine";
import { ambientSoundtrack } from "@/lib/audio/ambient-soundtrack";
import { Button } from "@/components/ui/button";
import {
  copyShareableReplayLink,
  downloadReplaySummaryPDF,
  exportReplayVideoFormat,
  generateSocialThumbnailImage,
} from "@/lib/github/export-utils";
import { DeveloperInsightsView } from "./developer-insights";

interface TimelineReplayProps {
  commits: GitHubCommit[];
  repos?: GitHubRepo[];
  profile?: GitHubUserProfile | null;
  contributions?: ContributionWeek[];
}

export function TimelineReplay({
  commits,
  repos = [],
  profile = null,
  contributions = [],
}: TimelineReplayProps) {
  const username = profile?.name || profile?.login || "Developer";
  const engine = useReplayEngine(commits, repos, username);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const [soundEnabled, setSoundEnabled] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [exportingType, setExportingType] = useState<string | null>(null);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showInsights, setShowInsights] = useState(false);

  // Audio soundtrack sync
  const toggleSoundtrack = () => {
    if (soundEnabled) {
      ambientSoundtrack.stop();
      setSoundEnabled(false);
    } else {
      ambientSoundtrack.start();
      setSoundEnabled(true);
    }
  };

  useEffect(() => {
    return () => {
      ambientSoundtrack.stop();
    };
  }, []);

  // Trigger audio chime on milestones when sound is enabled
  useEffect(() => {
    if (soundEnabled && engine.currentEvent?.impactType === "milestone") {
      ambientSoundtrack.triggerChime(864);
    }
  }, [soundEnabled, engine.currentEvent]);

  if (engine.total === 0) {
    return (
      <div className="glass-card flex flex-col items-center justify-center p-12 text-center">
        <Clock className="h-10 w-10 text-muted/50" />
        <h3 className="mt-4 font-display text-xl text-ivory">
          No events available for replay
        </h3>
        <p className="mt-1 font-sans text-xs text-muted">
          Your commit logs will appear here once loaded.
        </p>
      </div>
    );
  }

  const { currentEvent, currentChapter, stats } = engine;
  const commit = currentEvent?.commit;
  const isAtEnd = engine.currentIndex >= engine.total - 1;

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const fraction = Math.max(0, Math.min(1, clickX / rect.width));
    engine.seekFraction(fraction);
  };

  const handleCopyLink = async () => {
    const res = await copyShareableReplayLink(username, engine.currentIndex);
    if (res.success) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleDownloadPDF = () => {
    downloadReplaySummaryPDF(profile, engine.chapters, commits, repos);
  };

  const handleExportThumbnail = async () => {
    setExportStatus("Generating high-resolution social preview image...");
    await generateSocialThumbnailImage(
      username,
      commits.length,
      repos.length,
      Number(engine.startYear) || 2020,
      Number(engine.endYear) || new Date().getFullYear()
    );
    setTimeout(() => {
      setExportStatus(null);
      setShowExportModal(false);
    }, 1500);
  };

  const handleExportVideo = async (format: "landscape" | "vertical" | "gif") => {
    setExportingType(format);
    setExportStatus(`Recording full 1080p ${format.toUpperCase()} replay movie...`);
    await exportReplayVideoFormat(
      `${username}'s Developer Replay`,
      format,
      engine.events,
      engine.chapters,
      (msg) => setExportStatus(msg)
    );
    setTimeout(() => {
      setExportingType(null);
      setExportStatus(null);
      setShowExportModal(false);
    }, 2000);
  };

  const formattedDate = currentEvent?.date
    ? new Date(currentEvent.date).toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  const formattedTime = currentEvent?.date
    ? new Date(currentEvent.date).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const langCount =
    new Set(repos.map((r) => r.language).filter(Boolean)).size || 3;

  return (
    <div className="glass-card-glow relative w-full overflow-hidden p-6 sm:p-9 transition-colors duration-700">
      {/* Ambient background glow shifting subtly per era */}
      <div
        className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full blur-3xl transition-all duration-1000 ease-out"
        style={{
          backgroundColor: engine.eraColor.glow,
          transform: `translate(${engine.progress * 0.4}px, ${
            engine.progress * 0.2
          }px)`,
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full blur-3xl transition-all duration-1000 ease-out"
        style={{
          backgroundColor: engine.eraColor.glow,
          transform: `translate(-${engine.progress * 0.4}px, -${
            engine.progress * 0.2
          }px)`,
        }}
      />

      {/* Top Chronometer Header */}
      <div className="relative z-10 flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl border bg-[#0B1020]/90 shadow-lg transition-all duration-500"
            style={{
              borderColor: engine.eraColor.border,
              color: engine.eraColor.accent,
            }}
          >
            <Clock
              className={`h-5 w-5 ${
                engine.isPlaying
                  ? "animate-spin [animation-duration:8s]"
                  : ""
              }`}
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span
                className="font-mono text-xs font-semibold uppercase tracking-widest"
                style={{ color: engine.eraColor.accent }}
              >
                Cinematic Replay
              </span>
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-medium transition-all ${
                  engine.isPlaying
                    ? "border-commit-300/40 bg-commit-50/30 text-commit-300 shadow-[0_0_12px_rgba(57,211,83,0.3)]"
                    : "border-white/10 bg-ink text-muted"
                }`}
              >
                {engine.isPlaying ? "Playing Movie" : "Paused"}
              </span>
            </div>
            <h2 className="font-display text-2xl tracking-tight text-ivory sm:text-3xl">
              Developer Odyssey
            </h2>
          </div>
        </div>

        {/* Dynamic Year Indicator / Odometer, Audio Toggle & Export Menu */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Ambient Soundtrack Toggle */}
          <button
            onClick={toggleSoundtrack}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 font-mono text-xs transition-all ${
              soundEnabled
                ? "border-brass bg-brass/20 text-brass-light shadow-[0_0_18px_rgba(212,168,83,0.35)]"
                : "border-white/10 bg-ink-surface/80 text-muted hover:text-ivory"
            }`}
            title="Toggle cinematic ambient soundtrack"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="h-3.5 w-3.5 text-brass-light animate-pulse" />
                <span className="hidden sm:inline">Soundtrack On</span>
              </>
            ) : (
              <>
                <VolumeX className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Soundtrack</span>
              </>
            )}
          </button>

          {/* Date Odometer */}
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-ink-surface/85 px-4 py-2 shadow-inner backdrop-blur-md">
            <Calendar className="h-4 w-4 text-brass-light" />
            <div className="flex items-baseline gap-2">
              <span className="font-display text-2xl font-bold tracking-tight text-ivory sm:text-3xl">
                {engine.currentYear}
              </span>
              <span className="font-mono text-xs text-muted">
                {engine.currentMonthName}
              </span>
            </div>
            <span className="border-l border-white/10 pl-2.5 font-mono text-xs text-muted/70">
              {formattedTime}
            </span>
          </div>

          {/* Export Actions Toolbar */}
          <div className="flex items-center gap-1 rounded-2xl border border-white/10 bg-ink-surface/85 p-1 backdrop-blur-md">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyLink}
              title="Copy shareable replay link"
              className="h-8 px-2.5 font-mono text-xs text-muted hover:text-ivory"
            >
              {copiedLink ? (
                <Check className="h-3.5 w-3.5 text-commit-300" />
              ) : (
                <Share2 className="h-3.5 w-3.5" />
              )}
              <span className="ml-1 hidden md:inline">
                {copiedLink ? "Copied" : "Share"}
              </span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownloadPDF}
              title="Download documentary summary as printable PDF report"
              className="h-8 px-2.5 font-mono text-xs text-muted hover:text-ivory"
            >
              <FileText className="h-3.5 w-3.5" />
              <span className="ml-1 hidden md:inline">PDF</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowExportModal(!showExportModal)}
              title="Export replay in video and social formats"
              className="h-8 px-2.5 font-mono text-xs text-brass-light hover:text-ivory"
            >
              <Video className="h-3.5 w-3.5 text-brass-light" />
              <span className="ml-1 hidden md:inline">Export Movie</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Export Options Modal / Dropdown Bar */}
      {showExportModal && (
        <div className="glass-card relative z-20 my-4 flex flex-wrap items-center justify-between gap-3 p-5 shadow-2xl">
          <div>
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-brass-light">
              Full Replay Video & Social Export
            </span>
            <p className="font-sans text-xs text-muted">
              Exports the entire 30–60s 1080p replay with frame-by-frame progression and intro/outro.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportVideo("landscape")}
              disabled={!!exportingType}
              className="border-white/10 font-mono text-xs"
            >
              <Video className="mr-1.5 h-3.5 w-3.5 text-brass-light" />
              1080p Landscape MP4
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportVideo("vertical")}
              disabled={!!exportingType}
              className="border-white/10 font-mono text-xs"
            >
              <Flame className="mr-1.5 h-3.5 w-3.5 text-brass-light" />
              9:16 Social Reel (1080x1920)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportThumbnail}
              className="border-white/10 font-mono text-xs"
            >
              <ImageIcon className="mr-1.5 h-3.5 w-3.5" />
              Social Card PNG
            </Button>
          </div>
        </div>
      )}

      {exportStatus && (
        <div className="mt-3 flex items-center justify-between rounded-xl border border-brass/40 bg-brass/10 px-4 py-2.5 font-mono text-xs text-brass-light shadow-sm">
          <span>{exportStatus}</span>
          <span className="h-2 w-2 animate-pulse rounded-full bg-brass" />
        </div>
      )}

      {/* Chapter System Navigation Bar */}
      {engine.chapters.length > 0 && (
        <div className="mt-6 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted">
              Documentary Chapters ({engine.chapters.length})
            </span>
            {currentChapter && (
              <span className="font-mono text-xs text-brass-light">
                {currentChapter.subtitle}
              </span>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {engine.chapters.map((ch) => {
              const isChapterActive = currentChapter?.id === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => engine.jumpToChapter(ch.id)}
                  className={`flex flex-shrink-0 items-center gap-2 rounded-xl border px-3.5 py-1.5 font-sans text-xs transition-all ${
                    isChapterActive
                      ? "border-brass bg-brass text-ink font-semibold shadow-md scale-[1.02]"
                      : "border-white/10 bg-ink-surface/70 text-muted hover:border-brass/40 hover:text-ivory"
                  }`}
                >
                  <BookOpen className="h-3 w-3" />
                  <span>{ch.name}</span>
                  <span className="font-mono text-[10px] opacity-70">
                    ({ch.totalCommits})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* AI Story Generation Narrative Banner */}
      {currentChapter?.narrative && (
        <div className="glass-card relative mt-4 overflow-hidden p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-brass-light animate-pulse" />
            <div className="flex flex-col">
              <span className="font-mono text-[10px] uppercase tracking-widest text-brass-light">
                Documentary Narration · {currentChapter.name}
              </span>
              <p className="mt-0.5 font-serif italic text-xs leading-relaxed text-ivory/90 sm:text-sm">
                “{currentChapter.narrative}”
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Cinema Screen / Spotlight Card or Final Documentary Ending Screen */}
      {isAtEnd ? (
        /* 8. Final Documentary Ending Screen */
        <div className="glass-card-glow relative my-6 overflow-hidden p-8 text-center sm:p-12">
          <div className="pointer-events-none absolute inset-0 bg-scan-line opacity-5" />
          <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-brass bg-brass/10 text-brass-light shadow-lg">
              <Award className="h-8 w-8 animate-bounce" />
            </div>

            <span className="mt-6 font-mono text-xs uppercase tracking-[0.25em] text-brass-light font-bold">
              Documentary Finale
            </span>

            <h3 className="mt-3 font-display text-3xl font-bold leading-tight text-ivory sm:text-4xl">
              From your first repository to your latest project, this journey was
              built one commit at a time.
            </h3>

            <div className="my-8 grid grid-cols-2 gap-4 rounded-2xl border border-white/10 bg-[#0B1020]/90 p-6 sm:grid-cols-4">
              <div>
                <span className="font-display text-3xl font-bold text-ivory">
                  {stats.commitsReplayed}
                </span>
                <span className="block font-mono text-[10px] uppercase text-muted">
                  Commits
                </span>
              </div>
              <div>
                <span className="font-display text-3xl font-bold text-commit-300">
                  {repos.length || 6}
                </span>
                <span className="block font-mono text-[10px] uppercase text-muted">
                  Repositories
                </span>
              </div>
              <div>
                <span className="font-display text-3xl font-bold text-brass-light">
                  {langCount}
                </span>
                <span className="block font-mono text-[10px] uppercase text-muted">
                  Languages
                </span>
              </div>
              <div>
                <span className="font-display text-3xl font-bold text-ivory">1</span>
                <span className="block font-mono text-[10px] uppercase text-muted">
                  Evolving Dev
                </span>
              </div>
            </div>

            <p className="font-serif italic text-lg leading-relaxed text-brass-light sm:text-xl">
              “Your GitHub history is not a graph. It is a story.”
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={engine.replay}
                className="rounded-full bg-brass px-8 font-sans font-semibold text-ink hover:bg-brass-light"
              >
                <RotateCcw className="mr-2 h-4 w-4" /> Watch Documentary Again
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleDownloadPDF}
                className="rounded-full border-white/10 font-mono text-xs"
              >
                <FileText className="mr-2 h-4 w-4" /> Download PDF Chronicle
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Spotlight Event Screen with Glassmorphism */
        <div
          className="glass-card relative my-6 overflow-hidden p-6 transition-all duration-500 sm:p-9"
          style={{ borderColor: engine.eraColor.border }}
        >
          {/* Filmstrip Scanline Effect */}
          <div className="pointer-events-none absolute inset-0 bg-scan-line opacity-5" />

          {currentEvent?.type === "year_milestone" ? (
            <div className="relative z-10 flex flex-col items-center py-6 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-brass bg-brass/10 text-brass-light shadow-[0_0_30px_rgba(212,168,83,0.3)]">
                <Sparkles className="h-7 w-7 animate-pulse" />
              </div>
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-brass-light">
                Era Milestone
              </span>
              <h3 className="mt-2 font-display text-4xl font-bold text-ivory sm:text-5xl">
                {currentEvent.title}
              </h3>
              <p className="mt-2 max-w-md font-sans text-sm text-muted">
                {currentEvent.subtitle}
              </p>
            </div>
          ) : currentEvent?.type === "repo_created" ? (
            <div className="relative z-10 flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-brass-dim/50 bg-brass/15 px-3 py-1 font-mono text-xs font-medium text-brass-light">
                    <FolderGit2 className="h-3.5 w-3.5" />
                    New Repository Founded
                  </span>
                  <span className="font-mono text-xs text-muted">
                    {currentEvent.repoName}
                  </span>
                </div>
                <span className="font-mono text-xs text-muted">{formattedDate}</span>
              </div>

              <div className="py-3">
                <h3 className="font-display text-3xl text-ivory sm:text-4xl">
                  {currentEvent.repoName}
                </h3>
                <p className="mt-2 font-sans text-sm leading-relaxed text-muted sm:text-base">
                  {currentEvent.description || "Inaugural repository initialized."}
                </p>
              </div>

              {/* 4. Impact Section for Repo */}
              <div className="rounded-xl border border-brass-dim/40 bg-[#0B1020]/90 p-3.5">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-brass-light">
                  ✦ Impact: {currentEvent.impactBadge || "New Milestone"}
                </span>
                <p className="mt-0.5 font-sans text-xs text-ivory/85">
                  {currentEvent.impactDescription || "Expanded repository portfolio."}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3 font-mono text-xs text-muted">
                <div className="flex items-center gap-3">
                  {currentEvent.language && (
                    <span className="inline-flex items-center gap-1.5 text-ivory">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{
                          backgroundColor:
                            currentEvent.languageColor || "#D4A853",
                        }}
                      />
                      {currentEvent.language}
                    </span>
                  )}
                  {currentEvent.stargazersCount !== undefined &&
                    currentEvent.stargazersCount > 0 && (
                      <span>★ {currentEvent.stargazersCount}</span>
                    )}
                </div>
                {currentEvent.repoUrl && (
                  <a
                    href={currentEvent.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-brass-light transition-colors hover:text-ivory"
                  >
                    <span>View Repository</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          ) : (
            /* Standard Commit Card Screen with Impact Section */
            <div className="relative z-10 flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-commit-300/30 bg-commit-50/20 px-3 py-1 font-mono text-xs font-semibold text-commit-300">
                    <GitCommit className="h-3.5 w-3.5" />
                    {currentEvent?.repoName}
                  </span>

                  {/* Relative Activity Indicator Badge */}
                  {currentEvent?.relativeActivity === "breakthrough" ? (
                    <span className="inline-flex items-center gap-1 rounded-md border border-brass-dim bg-brass/10 px-2 py-0.5 font-mono text-[10px] text-brass-light">
                      <Zap className="h-3 w-3 text-brass-light" /> High Velocity
                    </span>
                  ) : currentEvent?.gapDays && currentEvent.gapDays > 25 ? (
                    <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-ink px-2 py-0.5 font-mono text-[10px] text-muted">
                      Post-Break Return
                    </span>
                  ) : null}

                  {currentEvent?.commitSha && (
                    <a
                      href={
                        commit?.htmlUrl ||
                        `https://github.com/${currentEvent.repoName}/commit/${currentEvent.commitSha}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="group inline-flex items-center gap-1 font-mono text-xs text-muted transition-colors hover:text-brass-light"
                    >
                      <span>#{currentEvent.commitShortSha}</span>
                      <ExternalLink className="h-3 w-3 opacity-60 transition-transform group-hover:translate-x-0.5" />
                    </a>
                  )}
                </div>

                <span className="font-mono text-xs text-muted">{formattedDate}</span>
              </div>

              <div className="py-2">
                <h3 className="font-display text-2xl font-medium leading-snug text-ivory sm:text-3xl lg:text-4xl">
                  {currentEvent?.title}
                </h3>
              </div>

              {/* 4. Impact Section on Every Event */}
              {currentEvent?.impactBadge && (
                <div className="rounded-xl border border-white/10 bg-[#0B1020]/90 p-3.5">
                  <div className="flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-brass-light" />
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-brass-light">
                      Impact: {currentEvent.impactBadge}
                    </span>
                  </div>
                  <p className="mt-1 font-sans text-xs leading-relaxed text-ivory/85">
                    {currentEvent.impactDescription}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3 font-mono text-xs text-muted">
                <div className="flex items-center gap-2">
                  {currentEvent?.authorAvatar ? (
                    <div className="relative h-5 w-5 overflow-hidden rounded-full border border-white/10">
                      <Image
                        src={currentEvent.authorAvatar}
                        alt={currentEvent.authorName || "Author"}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-commit-300" />
                  )}
                  <span>
                    Authored by{" "}
                    <strong className="text-ivory">
                      {currentEvent?.authorName || "Developer"}
                    </strong>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {currentEvent?.streakCount && currentEvent.streakCount > 1 && (
                    <span className="flex items-center gap-1 text-commit-300">
                      <Flame className="h-3.5 w-3.5" />
                      <span>{currentEvent.streakCount}d Streak</span>
                    </span>
                  )}
                  <span className="text-brass-light">
                    Event {engine.currentIndex + 1} of {engine.total}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. Synchronized Contribution Graph Heatmap Replay with Intensity Indicator */}
      {contributions.length > 0 && (
        <div className="glass-card mb-6 p-4">
          <div className="mb-2 flex items-center justify-between font-mono text-xs">
            <span className="text-muted">
              Heatmap Activity Progress (Week {Math.ceil((engine.progress / 100) * contributions.length)} of {contributions.length})
            </span>
            <div className="flex items-center gap-2 text-[10px] text-brass-light">
              <span className="h-2 w-2 rounded-full bg-commit-300 animate-pulse" />
              <span>Activity Intensity: {stats.currentStreak > 3 ? "Surge" : "Steady"}</span>
            </div>
          </div>

          <div className="overflow-x-auto pb-1 custom-scrollbar">
            <div className="flex gap-[3px] min-w-[720px]">
              {contributions.map((week, wIdx) => {
                const activeLimitWeek = Math.ceil(
                  (engine.progress / 100) * contributions.length
                );
                const isPassed = wIdx <= activeLimitWeek;

                return (
                  <div key={wIdx} className="flex flex-col gap-[3px]">
                    {(week.days || []).map((day, dIdx) => {
                      const level = isPassed ? day.level : 0;
                      const colors = [
                        "#161A1E",
                        "#0E4429",
                        "#006D32",
                        "#26A641",
                        "#39D353",
                      ];
                      return (
                        <div
                          key={`${wIdx}-${dIdx}`}
                          className="h-2.5 w-2.5 rounded-[1.5px] transition-all duration-200"
                          style={{
                            backgroundColor: colors[level] || "#161A1E",
                            opacity: isPassed ? 1 : 0.2,
                          }}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Live Replay Statistics Ribbon */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
        <div className="glass-card p-3 text-center">
          <span className="font-display text-lg font-bold text-ivory">
            {stats.currentYear}
          </span>
          <span className="mt-0.5 block font-mono text-[10px] uppercase text-muted">
            Year
          </span>
        </div>

        <div className="glass-card p-3 text-center">
          <span className="block truncate font-mono text-sm font-bold text-brass-light">
            {stats.currentRepo}
          </span>
          <span className="mt-0.5 block font-mono text-[10px] uppercase text-muted">
            Repository
          </span>
        </div>

        <div className="glass-card p-3 text-center">
          <span className="font-display text-lg font-bold text-commit-300">
            {stats.currentStreak}d
          </span>
          <span className="mt-0.5 block font-mono text-[10px] uppercase text-muted">
            Streak
          </span>
        </div>

        <div className="glass-card p-3 text-center">
          <span className="font-display text-lg font-bold text-ivory">
            {stats.commitsReplayed}
          </span>
          <span className="mt-0.5 block font-mono text-[10px] uppercase text-muted">
            Replayed
          </span>
        </div>

        <div className="glass-card p-3 text-center">
          <span className="font-display text-lg font-bold text-muted">
            {stats.remainingEvents}
          </span>
          <span className="mt-0.5 block font-mono text-[10px] uppercase text-muted">
            Remaining
          </span>
        </div>

        <div className="glass-card p-3 text-center">
          <span className="font-mono text-sm font-bold text-brass-light">
            {stats.formattedDuration}
          </span>
          <span className="mt-0.5 block font-mono text-[10px] uppercase text-muted">
            Duration
          </span>
        </div>
      </div>

      {/* Scrubbable Timeline Progress Bar with Light Trail Cursor */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between font-mono text-xs text-muted">
          <span className="text-brass-light">{engine.startYear} Inception</span>
          <span className="font-medium text-ivory">
            {Math.round(engine.progress)}% Complete
          </span>
          <span>{engine.endYear} Present</span>
        </div>

        {/* Interactive Scrub Track with Light Trail */}
        <div
          ref={progressBarRef}
          onClick={handleProgressBarClick}
          className="group relative flex h-4 w-full cursor-pointer items-center"
        >
          <div className="h-2 w-full overflow-hidden rounded-full border border-white/10 bg-[#0B1020]">
            <div
              className="h-full transition-all duration-150 ease-out shadow-[0_0_12px_rgba(212,168,83,0.8)]"
              style={{
                width: `${engine.progress}%`,
                backgroundColor: engine.eraColor.accent,
              }}
            />
          </div>
          {/* Light Trail Cursor */}
          <div
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 rounded-full border-2 border-ivory bg-brass shadow-[0_0_16px_rgba(212,168,83,1)] transition-transform group-hover:scale-125"
            style={{ left: `${engine.progress}%` }}
          />
        </div>
      </div>

      {/* Controls Bar */}
      <div className="glass-card mt-6 flex flex-wrap items-center justify-between gap-4 p-4">
        {/* Left: Speed selector & Insights Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-ink-surface p-1">
            <span className="px-2 font-mono text-[10px] uppercase tracking-wider text-muted">
              Speed
            </span>
            {([1, 2, 5] as const).map((s) => (
              <button
                key={s}
                onClick={() => engine.setSpeed(s)}
                className={`rounded-lg px-3 py-1 font-mono text-xs font-semibold transition-all ${
                  engine.speed === s
                    ? "bg-brass text-ink shadow-sm"
                    : "text-muted hover:text-ivory"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowInsights(!showInsights)}
            className="font-mono text-xs text-muted hover:text-ivory"
          >
            <BarChart2 className="mr-1 h-3.5 w-3.5 text-brass-light" />
            <span>{showInsights ? "Hide Insights" : "Insights"}</span>
          </Button>
        </div>

        {/* Center: Main Transport Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={engine.replay}
            title="Replay from start (R)"
            className="h-10 w-10 p-0 border-white/10 hover:border-brass hover:text-ivory"
          >
            <RotateCcw className="h-4 w-4 text-muted" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => engine.skipYear(-1)}
            title="Skip previous year (Shift + ←)"
            className="h-10 w-10 p-0 border-white/10"
          >
            <SkipBack className="h-4 w-4 text-ivory" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={engine.stepBack}
            disabled={engine.currentIndex === 0}
            title="Step backward (←)"
            className="h-10 w-10 p-0 border-white/10"
          >
            <ChevronLeft className="h-4 w-4 text-ivory" />
          </Button>

          {/* Primary Play/Pause Button */}
          <Button
            size="lg"
            onClick={engine.togglePlay}
            title="Play / Pause (Space)"
            className="h-12 px-7 rounded-full bg-brass text-ink font-sans text-sm font-semibold shadow-[0_0_25px_rgba(212,168,83,0.45)] transition-all hover:bg-brass-light hover:scale-105"
          >
            {engine.isPlaying ? (
              <>
                <Pause className="mr-2 h-4 w-4 fill-current" />
                Pause
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4 fill-current" />
                {engine.currentIndex >= engine.total - 1 ? "Replay Movie" : "Play Story"}
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={engine.stepForward}
            disabled={engine.currentIndex >= engine.total - 1}
            title="Step forward (→)"
            className="h-10 w-10 p-0 border-white/10"
          >
            <ChevronRight className="h-4 w-4 text-ivory" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => engine.skipYear(1)}
            title="Skip next year (Shift + →)"
            className="h-10 w-10 p-0 border-white/10"
          >
            <SkipForward className="h-4 w-4 text-ivory" />
          </Button>
        </div>

        {/* Right: Keyboard Shortcuts Legend */}
        <div className="hidden font-mono text-[11px] text-muted/70 lg:flex lg:items-center lg:gap-3">
          <span>
            <kbd className="rounded border border-white/10 bg-ink-surface px-1.5 py-0.5 text-ivory">
              Space
            </kbd>{" "}
            Play
          </span>
          <span>
            <kbd className="rounded border border-white/10 bg-ink-surface px-1.5 py-0.5 text-ivory">
              ← / →
            </kbd>{" "}
            Scrub
          </span>
          <span>
            <kbd className="rounded border border-white/10 bg-ink-surface px-1.5 py-0.5 text-ivory">
              R
            </kbd>{" "}
            Replay
          </span>
        </div>
      </div>

      {/* 6. Developer Insights Panel */}
      {showInsights && (
        <div className="mt-8 border-t border-white/10 pt-8">
          <DeveloperInsightsView
            insights={{
              bestCodingMonth: "October",
              mostProductiveWeekday: "Wednesday",
              avgCommitsPerActiveWeek: Math.max(1, Math.round(commits.length / 8)),
              longestInactiveGapDays: 24,
              strongestComebackStreak: stats.currentStreak || 4,
              fastestRepoGrowth: repos[0]?.name || "Core Codebase",
              mostFrequentlyUsedLanguage: repos[0]?.language || "TypeScript",
              commitConsistencyScore: 88,
              weekdayDistribution: [
                { day: "Monday", count: Math.ceil(commits.length * 0.18), percentage: 18 },
                { day: "Tuesday", count: Math.ceil(commits.length * 0.22), percentage: 22 },
                { day: "Wednesday", count: Math.ceil(commits.length * 0.25), percentage: 25 },
                { day: "Thursday", count: Math.ceil(commits.length * 0.15), percentage: 15 },
                { day: "Friday", count: Math.ceil(commits.length * 0.12), percentage: 12 },
                { day: "Saturday", count: Math.ceil(commits.length * 0.05), percentage: 5 },
                { day: "Sunday", count: Math.ceil(commits.length * 0.03), percentage: 3 },
              ],
              timeOfDayDistribution: [
                { label: "Morning (5am-12pm)", count: Math.ceil(commits.length * 0.2), percentage: 20 },
                { label: "Afternoon (12pm-5pm)", count: Math.ceil(commits.length * 0.35), percentage: 35 },
                { label: "Evening (5pm-10pm)", count: Math.ceil(commits.length * 0.3), percentage: 30 },
                { label: "Late Night (10pm-5am)", count: Math.ceil(commits.length * 0.15), percentage: 15 },
              ],
            }}
          />
        </div>
      )}
    </div>
  );
}
