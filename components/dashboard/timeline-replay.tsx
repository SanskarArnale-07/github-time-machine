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
  Volume2,
  VolumeX,
  Video,
  Award,
  Maximize2,
  Minimize2,
  Sliders,
  Music,
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

  // Audio is MUTED by default per user requirement
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [exportingType, setExportingType] = useState<string | null>(null);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showControlsDrawer, setShowControlsDrawer] = useState(false);

  // Load user's saved audio preference from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("github_time_machine_sound_enabled");
      if (saved === "true") {
        setSoundEnabled(true);
        ambientSoundtrack.start();
      }
    } catch {}

    return () => {
      ambientSoundtrack.stop();
    };
  }, []);

  // Audio toggle with localStorage memory
  const toggleSoundtrack = () => {
    if (soundEnabled) {
      ambientSoundtrack.stop();
      setSoundEnabled(false);
      try {
        localStorage.setItem("github_time_machine_sound_enabled", "false");
      } catch {}
    } else {
      ambientSoundtrack.start();
      setSoundEnabled(true);
      try {
        localStorage.setItem("github_time_machine_sound_enabled", "true");
      } catch {}
    }
  };

  // Trigger audio chime on milestones when sound is enabled
  useEffect(() => {
    if (soundEnabled && engine.currentEvent?.impactType === "milestone") {
      ambientSoundtrack.triggerChime(880);
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
    setExportStatus("Generating social preview image...");
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

  const handleExportVideo = async (
    format: "landscape" | "vertical" | "gif",
    withAudio: boolean = false
  ) => {
    setExportingType(format);
    setExportStatus(
      `Rendering 1080p 30fps documentary ${withAudio ? "with music" : "(no audio)"}...`
    );
    await exportReplayVideoFormat(
      `${username}'s Developer Replay`,
      format,
      engine.events,
      engine.chapters,
      (msg) => setExportStatus(msg),
      withAudio
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

  const langCount =
    new Set(repos.map((r) => r.language).filter(Boolean)).size || 3;

  return (
    <div
      className={`relative w-full transition-all duration-700 ${
        engine.isFullscreen
          ? "fixed inset-0 z-50 overflow-y-auto bg-[#0B1020] p-6 sm:p-12"
          : "glass-card-glow p-6 sm:p-10"
      }`}
    >
      {/* 1. Ambient background glow shifting subtly per era */}
      <div
        className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full blur-3xl transition-all duration-1000 ease-out"
        style={{
          backgroundColor: engine.eraColor.glow,
          transform: `translate(${engine.progress * 0.3}px, ${
            engine.progress * 0.15
          }px)`,
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-20 -right-20 h-96 w-96 rounded-full blur-3xl transition-all duration-1000 ease-out"
        style={{
          backgroundColor: engine.eraColor.glow,
          transform: `translate(-${engine.progress * 0.3}px, -${
            engine.progress * 0.15
          }px)`,
        }}
      />

      {/* Top Minimalist Header */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl border bg-[#0B1020]/90 shadow-md transition-all duration-500"
            style={{
              borderColor: engine.eraColor.border,
              color: engine.eraColor.accent,
            }}
          >
            <Clock
              className={`h-4 w-4 ${
                engine.isPlaying
                  ? "animate-spin [animation-duration:10s]"
                  : ""
              }`}
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span
                className="font-mono text-[11px] font-semibold uppercase tracking-widest"
                style={{ color: engine.eraColor.accent }}
              >
                Developer Odyssey
              </span>
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.2 font-mono text-[9px] font-medium transition-all ${
                  engine.isPlaying
                    ? "border-commit-300/40 bg-commit-50/20 text-commit-300 shadow-[0_0_10px_rgba(57,211,83,0.3)]"
                    : "border-white/10 bg-ink text-muted"
                }`}
              >
                {engine.isPlaying ? "Playing 1x" : "Paused"}
              </span>
            </div>
            <h2 className="font-display text-xl tracking-tight text-ivory sm:text-2xl">
              {currentChapter?.name || "The Developer Journey"}
            </h2>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Ambient Soundtrack Toggle (Muted by default) */}
          <button
            onClick={toggleSoundtrack}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 font-mono text-xs transition-all ${
              soundEnabled
                ? "border-brass bg-brass/20 text-brass-light shadow-[0_0_15px_rgba(212,168,83,0.3)]"
                : "border-white/10 bg-ink-surface/70 text-muted hover:text-ivory"
            }`}
            title="Toggle nostalgic ambient piano soundtrack (Default: Muted)"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="h-3.5 w-3.5 text-brass-light animate-pulse" />
                <span className="hidden sm:inline">Piano Music On</span>
              </>
            ) : (
              <>
                <VolumeX className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Muted</span>
              </>
            )}
          </button>

          {/* Date Odometer */}
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-ink-surface/80 px-3.5 py-1.5 shadow-inner">
            <Calendar className="h-3.5 w-3.5 text-brass-light" />
            <span className="font-display text-lg font-bold tracking-tight text-ivory">
              {engine.currentYear}
            </span>
            <span className="font-mono text-xs text-muted">
              {engine.currentMonthName}
            </span>
          </div>

          {/* Fullscreen Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={engine.toggleFullscreen}
            title="Toggle Fullscreen Replay Theater (F)"
            className="h-8 w-8 p-0 text-muted hover:text-ivory"
          >
            {engine.isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>

          {/* Controls / Options Drawer Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowControlsDrawer(!showControlsDrawer)}
            className="h-8 border-white/10 px-2.5 font-mono text-xs text-muted hover:text-ivory"
          >
            <Sliders className="mr-1 h-3 w-3 text-brass-light" />
            <span>{showControlsDrawer ? "Hide Controls" : "Controls"}</span>
          </Button>
        </div>
      </div>

      {/* Collapsible Options Drawer */}
      {showControlsDrawer && (
        <div className="glass-card relative z-20 my-4 flex flex-wrap items-center justify-between gap-4 p-4 shadow-xl">
          {/* Chapter Quick Jump */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 font-mono text-[10px] uppercase text-muted">
              Chapters:
            </span>
            {engine.chapters.map((ch) => (
              <button
                key={ch.id}
                onClick={() => engine.jumpToChapter(ch.id)}
                className={`rounded-lg border px-2.5 py-1 font-sans text-xs transition-all ${
                  currentChapter?.id === ch.id
                    ? "border-brass bg-brass text-ink font-semibold"
                    : "border-white/10 bg-ink-surface/60 text-muted hover:text-ivory"
                }`}
              >
                {ch.name}
              </button>
            ))}
          </div>

          {/* Export & Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="h-8 border-white/10 font-mono text-xs text-muted hover:text-ivory"
            >
              {copiedLink ? (
                <Check className="mr-1 h-3 w-3 text-commit-300" />
              ) : (
                <Share2 className="mr-1 h-3 w-3" />
              )}
              <span>{copiedLink ? "Link Copied" : "Share"}</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPDF}
              className="h-8 border-white/10 font-mono text-xs text-muted hover:text-ivory"
            >
              <FileText className="mr-1 h-3 w-3" />
              <span>PDF Chronicle</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExportModal(!showExportModal)}
              className="h-8 border-brass/40 font-mono text-xs text-brass-light hover:text-ivory"
            >
              <Video className="mr-1 h-3 w-3 text-brass-light" />
              <span>Export Movie</span>
            </Button>
          </div>
        </div>
      )}

      {/* Export Options Modal / Dropdown */}
      {showExportModal && (
        <div className="glass-card relative z-20 my-3 flex flex-wrap items-center justify-between gap-3 p-5 shadow-2xl">
          <div>
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-brass-light">
              Export 1080p Cinematic Documentary
            </span>
            <p className="font-sans text-xs text-muted">
              Renders the entire replay at 1080p 30fps with 80% card frame, true 1x pacing, and intro/outro.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportVideo("landscape", false)}
              disabled={!!exportingType}
              className="border-white/10 font-mono text-xs"
            >
              <Video className="mr-1.5 h-3.5 w-3.5 text-brass-light" />
              1080p Video (Default / No Audio)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportVideo("landscape", true)}
              disabled={!!exportingType}
              className="border-brass/40 font-mono text-xs text-brass-light"
            >
              <Music className="mr-1.5 h-3.5 w-3.5 text-brass-light" />
              1080p Video (With Piano Music)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportVideo("vertical", false)}
              disabled={!!exportingType}
              className="border-white/10 font-mono text-xs"
            >
              <Flame className="mr-1.5 h-3.5 w-3.5 text-brass-light" />
              9:16 Social Reel
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
        <div className="my-3 flex items-center justify-between rounded-xl border border-brass/40 bg-brass/10 px-4 py-2.5 font-mono text-xs text-brass-light shadow-sm">
          <span>{exportStatus}</span>
          <span className="h-2 w-2 animate-pulse rounded-full bg-brass" />
        </div>
      )}

      {/* AI Narration Caption Bar */}
      {currentChapter?.narrative && (
        <div className="my-4 flex items-center gap-2.5 rounded-xl border border-white/5 bg-ink/60 px-4 py-2.5 backdrop-blur-sm">
          <Sparkles className="h-3.5 w-3.5 flex-shrink-0 text-brass-light animate-pulse" />
          <p className="font-serif italic text-xs text-ivory/85 sm:text-sm">
            “{currentChapter.narrative}”
          </p>
        </div>
      )}

      {/* 2. Main Hero Replay Cinema Stage (De-cluttered by 50%) */}
      {isAtEnd ? (
        /* Final Documentary Ending Screen */
        <div className="glass-card-glow relative my-6 overflow-hidden p-8 text-center sm:p-12">
          <div className="pointer-events-none absolute inset-0 bg-scan-line opacity-5" />
          <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-brass bg-brass/10 text-brass-light shadow-lg">
              <Award className="h-7 w-7 animate-bounce" />
            </div>

            <span className="mt-5 font-mono text-[11px] uppercase tracking-[0.25em] text-brass-light font-bold">
              Documentary Finale
            </span>

            <h3 className="mt-3 font-display text-2xl font-bold leading-tight text-ivory sm:text-4xl">
              From your first repository to your latest project, this journey was
              built one commit at a time.
            </h3>

            <div className="my-6 grid grid-cols-2 gap-3 rounded-2xl border border-white/10 bg-[#0B1020]/90 p-5 sm:grid-cols-4">
              <div>
                <span className="font-display text-2xl font-bold text-ivory">
                  {stats.commitsReplayed}
                </span>
                <span className="block font-mono text-[9px] uppercase text-muted">
                  Commits
                </span>
              </div>
              <div>
                <span className="font-display text-2xl font-bold text-commit-300">
                  {repos.length || 6}
                </span>
                <span className="block font-mono text-[9px] uppercase text-muted">
                  Repositories
                </span>
              </div>
              <div>
                <span className="font-display text-2xl font-bold text-brass-light">
                  {langCount}
                </span>
                <span className="block font-mono text-[9px] uppercase text-muted">
                  Languages
                </span>
              </div>
              <div>
                <span className="font-display text-2xl font-bold text-ivory">1</span>
                <span className="block font-mono text-[9px] uppercase text-muted">
                  Evolving Dev
                </span>
              </div>
            </div>

            <p className="font-serif italic text-base leading-relaxed text-brass-light sm:text-lg">
              “Your GitHub history is not a graph. It is a story.”
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button
                size="lg"
                onClick={engine.replay}
                className="rounded-full bg-brass px-7 font-sans font-semibold text-ink hover:bg-brass-light"
              >
                <RotateCcw className="mr-2 h-4 w-4" /> Watch Story Again
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
        /* Minimalist, Clean Replay Card (40-50% Visual Clutter Reduction) */
        <div
          className="glass-card relative my-5 overflow-hidden p-6 sm:p-10 transition-all duration-700 ease-out"
          style={{ borderColor: engine.eraColor.border }}
        >
          {/* Subtle Zoom & Light Trail Background */}
          <div className="pointer-events-none absolute inset-0 bg-scan-line opacity-5" />

          {currentEvent?.type === "repo_created" ? (
            <div className="relative z-10 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-brass-dim/50 bg-brass/15 px-3 py-1 font-mono text-xs font-medium text-brass-light">
                  <FolderGit2 className="h-3.5 w-3.5" />
                  New Repository Founded
                </span>
                <span className="font-mono text-xs text-muted">{formattedDate}</span>
              </div>

              <div className="py-2">
                <h3 className="font-display text-2xl font-bold text-ivory sm:text-3xl lg:text-4xl">
                  {currentEvent.repoName}
                </h3>
                <p className="mt-2 font-sans text-xs leading-relaxed text-muted sm:text-sm">
                  {currentEvent.description || "Inaugural repository initialized."}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-white/10 pt-3 font-mono text-xs text-muted">
                {currentEvent.language && (
                  <span className="inline-flex items-center gap-1.5 text-ivory">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor:
                          currentEvent.languageColor || "#D4A853",
                      }}
                    />
                    {currentEvent.language}
                  </span>
                )}
                {currentEvent.repoUrl && (
                  <a
                    href={currentEvent.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-brass-light hover:text-ivory"
                  >
                    <span>View Repository</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          ) : (
            /* Clean Commit View with Only: Repo Name, Commit Message, Date, and Subtle Progress */
            <div className="relative z-10 flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-commit-300/30 bg-commit-50/20 px-2.5 py-0.5 font-mono text-xs font-semibold text-commit-300">
                    <GitCommit className="h-3.5 w-3.5" />
                    {currentEvent?.repoName}
                  </span>

                  {currentEvent?.commitSha && (
                    <a
                      href={
                        commit?.htmlUrl ||
                        `https://github.com/${currentEvent.repoName}/commit/${currentEvent.commitSha}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="group inline-flex items-center gap-1 font-mono text-xs text-muted hover:text-brass-light"
                    >
                      <span>#{currentEvent.commitShortSha}</span>
                      <ExternalLink className="h-3 w-3 opacity-60 group-hover:translate-x-0.5" />
                    </a>
                  )}
                </div>

                <span className="font-mono text-xs text-muted">{formattedDate}</span>
              </div>

              {/* Prominent Serif Commit Headline */}
              <div className="py-2">
                <h3 className="font-display text-2xl font-medium leading-relaxed tracking-tight text-ivory sm:text-3xl lg:text-4xl">
                  {currentEvent?.title}
                </h3>
              </div>

              {/* Subtle Author & Event Indicator */}
              <div className="flex items-center justify-between border-t border-white/10 pt-3 font-mono text-xs text-muted">
                <div className="flex items-center gap-2">
                  {currentEvent?.authorAvatar ? (
                    <div className="relative h-4 w-4 overflow-hidden rounded-full border border-white/10">
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
                  <span>{currentEvent?.authorName || "Developer"}</span>
                </div>

                <span className="text-brass-light">
                  {engine.currentIndex + 1} / {engine.total}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Minimalist Timeline Scrubber with Subtle Light Trail */}
      <div className="my-5 flex flex-col gap-1.5">
        <div className="flex items-center justify-between font-mono text-[11px] text-muted">
          <span>{engine.startYear} Inception</span>
          <span className="text-ivory font-medium">
            {Math.round(engine.progress)}%
          </span>
          <span>{engine.endYear} Present</span>
        </div>

        <div
          ref={progressBarRef}
          onClick={handleProgressBarClick}
          className="group relative flex h-3 w-full cursor-pointer items-center"
        >
          <div className="h-1.5 w-full overflow-hidden rounded-full border border-white/10 bg-[#0B1020]">
            <div
              className="h-full transition-all duration-200 ease-out shadow-[0_0_10px_rgba(212,168,83,0.7)]"
              style={{
                width: `${engine.progress}%`,
                backgroundColor: engine.eraColor.accent,
              }}
            />
          </div>
          {/* Subtle Light Trail Cursor */}
          <div
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-2 border-ivory bg-brass shadow-[0_0_12px_rgba(212,168,83,0.9)] transition-transform group-hover:scale-125"
            style={{ left: `${engine.progress}%` }}
          />
        </div>
      </div>

      {/* 4. Streamlined Centerpiece Controls Bar */}
      <div className="glass-card mt-5 flex flex-wrap items-center justify-between gap-4 p-3.5">
        {/* Speed Controls dropdown/pill */}
        <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-ink-surface p-1">
          <span className="px-2 font-mono text-[10px] uppercase text-muted">
            Speed
          </span>
          {([1, 2, 5] as const).map((s) => (
            <button
              key={s}
              onClick={() => engine.setSpeed(s)}
              className={`rounded-lg px-2.5 py-0.5 font-mono text-xs font-semibold transition-all ${
                engine.speed === s
                  ? "bg-brass text-ink shadow-sm"
                  : "text-muted hover:text-ivory"
              }`}
            >
              {s}x
            </button>
          ))}
        </div>

        {/* Primary Play/Pause Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={engine.replay}
            title="Replay from start (R)"
            className="h-9 w-9 p-0 border-white/10 hover:border-brass hover:text-ivory"
          >
            <RotateCcw className="h-3.5 w-3.5 text-muted" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={engine.stepBack}
            disabled={engine.currentIndex === 0}
            title="Step backward (←)"
            className="h-9 w-9 p-0 border-white/10"
          >
            <ChevronLeft className="h-4 w-4 text-ivory" />
          </Button>

          {/* Hero Play Story Button */}
          <Button
            size="lg"
            onClick={engine.togglePlay}
            title="Play / Pause (Space)"
            className="h-11 px-7 rounded-full bg-brass text-ink font-sans text-sm font-semibold shadow-[0_0_25px_rgba(212,168,83,0.45)] transition-all hover:bg-brass-light hover:scale-105"
          >
            {engine.isPlaying ? (
              <>
                <Pause className="mr-2 h-4 w-4 fill-current" />
                Pause
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4 fill-current" />
                {engine.currentIndex >= engine.total - 1 ? "Replay Story" : "Play Story"}
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={engine.stepForward}
            disabled={engine.currentIndex >= engine.total - 1}
            title="Step forward (→)"
            className="h-9 w-9 p-0 border-white/10"
          >
            <ChevronRight className="h-4 w-4 text-ivory" />
          </Button>
        </div>

        {/* Keyboard Shortcuts Guide */}
        <div className="hidden font-mono text-[10px] text-muted/70 md:flex md:items-center md:gap-2.5">
          <span>
            <kbd className="rounded border border-white/10 bg-ink-surface px-1 py-0.2 text-ivory">
              Space
            </kbd>{" "}
            Play
          </span>
          <span>
            <kbd className="rounded border border-white/10 bg-ink-surface px-1 py-0.2 text-ivory">
              ← / →
            </kbd>{" "}
            Step
          </span>
          <span>
            <kbd className="rounded border border-white/10 bg-ink-surface px-1 py-0.2 text-ivory">
              F
            </kbd>{" "}
            Fullscreen
          </span>
        </div>
      </div>
    </div>
  );
}
