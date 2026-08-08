"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
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
  Share2,
  FileText,
  Check,
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
}: TimelineReplayProps) {
  const username = profile?.name || profile?.login || "Developer";
  const engine = useReplayEngine(commits, repos, username);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  // Audio is MUTED by default per user requirement
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [exportingType, setExportingType] = useState<string | null>(null);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showControlsDrawer, setShowControlsDrawer] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

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

  // Milestone chime and gentle click on events
  useEffect(() => {
    if (soundEnabled && engine.currentEvent?.impactType === "milestone") {
      ambientSoundtrack.triggerMilestoneSwell(880);
    } else if (soundEnabled && engine.isPlaying) {
      ambientSoundtrack.triggerSubtleClick();
    }
  }, [soundEnabled, engine.currentEvent, engine.isPlaying]);

  // Sync Audio Theme with Chapter Progress
  useEffect(() => {
    if (soundEnabled && engine.currentChapter) {
      const idx = engine.chapters.findIndex(c => c.id === engine.currentChapter?.id);
      if (idx <= 1) {
        ambientSoundtrack.setTheme("odyssey");
      } else if (idx === engine.chapters.length - 1) {
        ambientSoundtrack.setTheme("horizon");
      } else {
        ambientSoundtrack.setTheme("constellations");
      }
    }
  }, [soundEnabled, engine.currentChapter, engine.chapters]);

  // Handle Fullscreen API natively
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT" ||
        target?.isContentEditable
      ) {
        return;
      }
      if (e.code === "KeyF") {
        e.preventDefault();
        toggleFullscreen();
      }
      if (e.key === "Escape" || e.key === "Esc") {
        setShowDetails(false);
      }
      if (e.code === "Space") {
        e.preventDefault();
        engine.togglePlay();
      }
      if (e.code === "ArrowLeft") {
        e.preventDefault();
        engine.stepBack();
      }
      if (e.code === "ArrowRight") {
        e.preventDefault();
        engine.stepForward();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [engine, showDetails]);

  if (engine.total === 0) {
    return (
      <div className="glass-card flex flex-col items-center justify-center p-12 text-center">
        <Clock className="h-10 w-10 text-muted/50" />
        <h3 className="mt-4 font-display text-xl text-ivory">
          No milestones available for replay
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
      `Rendering 1080p 30fps documentary ${withAudio ? "with soundtrack" : "(no audio)"}...`
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

  const yearsSpan = Math.max(1, engine.endYear - engine.startYear + 1);

  return (
    <div
      ref={containerRef}
      className={`relative transition-opacity duration-1000 ${
        isFullscreen
          ? "bg-[#09090B] flex flex-col items-center justify-center fixed inset-0 z-[100] h-screen w-screen overflow-hidden font-sans"
          : "glass-card-glow relative w-full p-8 sm:p-12 overflow-y-auto"
      }`}
    >
      {/* 16:9 Cinematic Inner Container for Fullscreen */}
      <div className={`${
        isFullscreen
          ? "relative w-full aspect-video max-h-screen max-w-[calc(100vh*16/9)] mx-auto flex flex-col items-center justify-center px-12 py-8"
          : "relative w-full"
      }`}>
      {/* 1. Ambient cosmic glow */}
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

      {/* Top Header: Always Minimal & Readable */}
      <div className={`relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/65 pb-6 ${isFullscreen ? 'w-[85%] mx-auto' : ''}`}>
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center justify-center rounded-xl border bg-zinc-950/80 shadow-md transition-all duration-500 ${isFullscreen ? 'h-12 w-12' : 'h-10 w-10'}`}
            style={{
              borderColor: engine.eraColor.border,
              color: engine.eraColor.accent,
            }}
          >
            <Clock
              className={`${isFullscreen ? 'h-5 w-5' : 'h-4 w-4'} ${
                engine.isPlaying
                  ? "animate-spin [animation-duration:12s]"
                  : ""
              }`}
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span
                className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em]"
                style={{ color: engine.eraColor.accent }}
              >
                Developer Odyssey
              </span>
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[9px] font-medium transition-all ${
                  engine.isPlaying
                    ? "border-brass/45 bg-brass/10 text-brass-light shadow-[0_0_10px_rgba(212,168,83,0.2)]"
                    : "border-zinc-800 bg-zinc-950 text-zinc-500"
                }`}
              >
                {engine.isPlaying ? "Playing 1x" : "Paused"}
              </span>
            </div>
            <h2 className={`font-display tracking-tight text-ivory ${isFullscreen ? 'text-3xl sm:text-4xl mt-1' : 'text-xl sm:text-2xl font-semibold'}`}>
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
                ? "border-brass bg-brass/10 text-brass-light shadow-[0_0_15px_rgba(212,168,83,0.15)]"
                : "border-zinc-800 bg-zinc-950/50 text-zinc-500 hover:text-ivory"
            }`}
            title="Toggle inspiring ambient piano soundtrack (Default: Muted)"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="h-3.5 w-3.5 text-brass-light animate-pulse" />
                <span className="hidden sm:inline">Piano On</span>
              </>
            ) : (
              <>
                <VolumeX className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Muted</span>
              </>
            )}
          </button>

          {/* Date Odometer */}
          <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950/80 px-3.5 py-1.5 shadow-inner">
            <Calendar className="h-3.5 w-3.5 text-brass-light" />
            <span className="font-display text-lg font-bold tracking-tight text-ivory">
              {engine.currentYear}
            </span>
            <span className="font-mono text-xs text-zinc-500">
              {engine.currentMonthName}
            </span>
          </div>

          {/* Fullscreen Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            title="Toggle Fullscreen Replay Theater (F)"
            className="h-8 w-8 p-0 text-zinc-500 hover:text-ivory"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>

          {/* Controls Drawer Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowControlsDrawer(!showControlsDrawer)}
            className="h-8 border-zinc-800 px-2.5 font-mono text-xs text-zinc-500 hover:text-ivory"
          >
            <Sliders className="mr-1 h-3 w-3 text-brass-light" />
            <span>{showControlsDrawer ? "Hide Controls" : "Controls"}</span>
          </Button>
        </div>
      </div>

      {/* Secondary Controls: Automatically tucked away or hidden during playback */}
      {showControlsDrawer && (
        <div className="glass-card relative z-20 my-4 flex flex-wrap items-center justify-between gap-4 p-4 shadow-xl">
          {/* Chapter Quick Selector */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 font-mono text-[10px] uppercase text-zinc-500">
              Chapters:
            </span>
            {engine.chapters.map((ch) => (
              <button
                key={ch.id}
                onClick={() => engine.jumpToChapter(ch.id)}
                className={`rounded-lg border px-2.5 py-1 font-sans text-xs transition-all ${
                  currentChapter?.id === ch.id
                    ? "border-brass bg-brass text-ink font-semibold"
                    : "border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:text-ivory"
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
              className="h-8 border-zinc-800 font-mono text-xs text-zinc-450 hover:text-ivory"
            >
              {copiedLink ? (
                <Check className="mr-1 h-3 w-3 text-brass-light" />
              ) : (
                <Share2 className="mr-1 h-3 w-3" />
              )}
              <span>{copiedLink ? "Link Copied" : "Share"}</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPDF}
              className="h-8 border-zinc-800 font-mono text-xs text-zinc-450 hover:text-ivory"
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
              1080p Video (No Audio)
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
              <Video className="mr-1.5 h-3.5 w-3.5 text-brass-light" />
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

      {/* Varied AI Narration Caption Bar - Editorial placement above the card */}
      {currentChapter?.narrative && (
        <div className={`text-center max-w-3xl mx-auto mb-6 px-4 relative z-10 ${isFullscreen ? 'mt-4' : ''}`}>
          <p className="font-serif italic text-zinc-400 text-base sm:text-lg md:text-xl leading-relaxed">
            “{currentChapter.narrative}”
          </p>
        </div>
      )}

      {/* 2. Main Hero Replay Cinema Stage (Centered and scaled at 80% width) */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full my-4 flex-1">
        {isAtEnd ? (
          /* Netflix-style Ending Scene */
          <div className="glass-card-glow relative w-[80%] max-w-4xl p-8 text-center sm:p-12 border-zinc-800 bg-zinc-900/90 shadow-2xl">
            <div className="pointer-events-none absolute inset-0 bg-scan-line opacity-5" />
            <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-brass bg-brass/10 text-brass-light shadow-lg">
                <Award className="h-7 w-7 animate-bounce" />
              </div>

              <span className="mt-5 font-mono text-[10px] uppercase tracking-[0.25em] text-brass-light font-bold">
                Documentary Finale
              </span>

              {/* Ending Narrative Highlight */}
              <h3 className="mt-4 font-display text-2xl font-semibold leading-relaxed text-ivory sm:text-3xl">
                {stats.commitsReplayed} commits. {repos.length || 6} repositories. {yearsSpan} year{yearsSpan > 1 ? "s" : ""} of growth.
              </h3>

              <p className="mt-2 font-display text-xl font-medium text-brass-light sm:text-2xl">
                This is how a developer is built.
              </p>

              <div className="my-6 flex items-center gap-3 rounded-2xl border border-zinc-850 bg-zinc-950/80 px-6 py-3 font-mono text-xs text-zinc-500">
                <span>@{username}</span>
                <span>·</span>
                <span className="text-brass">time-machine.git</span>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
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
                  className="rounded-full border-zinc-800 font-mono text-xs"
                >
                  <FileText className="mr-2 h-4 w-4" /> Download PDF Chronicle
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Minimalist, Clean Replay Card (Centered at 80% Frame with Details panel) */
          <div
            className={`glass-card relative w-[80%] max-w-4xl overflow-hidden transition-opacity duration-1000 ease-in-out shadow-2xl flex flex-col justify-between border-zinc-800 bg-[#161618]/95 ${
              isFullscreen ? 'p-12 min-h-[360px] sm:min-h-[400px]' : 'p-8 sm:p-10 min-h-[280px] sm:min-h-[320px]'
            }`}
            style={{ borderColor: engine.eraColor.border }}
          >
            <div className="pointer-events-none absolute inset-0 bg-scan-line opacity-5" />

            {currentEvent?.type === "repo_created" ? (
              <div className="relative z-10 flex flex-col gap-4 select-text">
                <div className="flex items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-brass-dim/50 bg-brass/10 px-3 py-1 font-mono text-xs font-medium text-brass-light">
                    <FolderGit2 className="h-3.5 w-3.5" />
                    New Repository Founded
                  </span>
                  <span className="font-mono text-xs text-zinc-500">{formattedDate}</span>
                </div>

                <div className="py-2">
                  <h3 className="font-display text-2xl font-semibold text-ivory sm:text-3xl lg:text-4xl">
                    {currentEvent.repoName}
                  </h3>
                  <p className="mt-2 font-sans text-xs leading-relaxed text-zinc-400 sm:text-sm">
                    {currentEvent.description || "Inaugural repository initialized."}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-zinc-800/80 pt-3 font-mono text-xs text-zinc-500">
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
              /* Summarized Chapter Commit Card: Repo Badge, Date, Title, 1-sentence summary */
              <div className="relative z-10 flex flex-col gap-5 select-text">
                <div className="flex items-center justify-between gap-3 border-b border-zinc-800/50 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-zinc-700/50 bg-zinc-800/40 px-3 py-1 font-mono text-xs font-semibold text-zinc-300">
                      <FolderGit2 className="h-3.5 w-3.5" />
                      {currentEvent?.repoName}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-zinc-400">{formattedDate}</span>
                    {currentEvent?.commitSha && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDetails(true)}
                        className="h-7 font-mono text-[10px] text-zinc-500 hover:text-ivory px-2"
                      >
                        Details
                      </Button>
                    )}
                  </div>
                </div>

                <div className="py-3">
                  <h3 className={`font-display font-medium leading-snug tracking-tight text-ivory line-clamp-2 ${isFullscreen ? 'text-4xl' : 'text-2xl sm:text-3xl'}`}>
                    {currentEvent?.title}
                  </h3>
                </div>

                {/* 1-sentence summary */}
                <div className="text-sm font-sans text-zinc-400 leading-relaxed">
                  {currentEvent?.impactDescription || (commit?.message ? commit.message.split('\n')[0] : "Codebase updated.")}
                </div>
              </div>
            )}

            {/* Slide-up details drawer inside the commit card */}
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="absolute inset-0 z-30 bg-[#121214] p-6 sm:p-8 flex flex-col border-t border-zinc-800 select-text"
                >
                  <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
                    <span className="font-mono text-[10px] text-brass-light font-bold uppercase tracking-wider">Documentary logs</span>
                    <button
                      onClick={() => setShowDetails(false)}
                      className="text-[10px] text-zinc-500 hover:text-ivory font-mono border border-zinc-800 px-2 py-0.5 rounded bg-zinc-900"
                    >
                      Close [Esc]
                    </button>
                  </div>
                  <div className="mt-4 flex-1 overflow-y-auto pr-1 text-left custom-scrollbar leading-relaxed font-sans text-xs sm:text-sm text-zinc-300">
                    <div className="font-mono text-[10px] text-zinc-500 mb-1.5">PATH: {currentEvent?.repoName}/{currentEvent?.commitShortSha}</div>
                    <h4 className="font-display font-medium text-ivory text-base sm:text-lg mb-3 leading-snug">{currentEvent?.title}</h4>
                    {commit?.message && (
                      <pre className="whitespace-pre-wrap rounded-lg bg-zinc-950 p-3.5 border border-zinc-850 font-mono text-[10px] sm:text-xs text-zinc-400 max-h-[160px] overflow-y-auto">
                        {commit.message}
                      </pre>
                    )}
                    <div className="mt-4 border-t border-zinc-850 pt-4 grid grid-cols-2 gap-3 text-[10px] sm:text-xs text-zinc-500 font-mono">
                      <div>
                        <span className="block text-zinc-650 font-semibold uppercase text-[9px]">Author</span>
                        <span className="text-zinc-300">{currentEvent?.authorName || "Developer"}</span>
                      </div>
                      <div>
                        <span className="block text-zinc-650 font-semibold uppercase text-[9px]">Timestamp</span>
                        <span className="text-zinc-300">{formattedDate}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* 3. Minimalist Timeline Scrubber */}
      <div className={`my-5 flex flex-col gap-1.5 ${isFullscreen ? 'w-[85%] mx-auto' : ''}`}>
        <div className="flex items-center justify-between font-mono text-[11px] text-muted">
          <span>{engine.startYear}</span>
          <span className="text-ivory font-medium tracking-wide">
            {currentEvent ? `${currentEvent.monthName} ${currentEvent.year}` : "Timeline"}
          </span>
          <span>{engine.endYear}</span>
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

      {/* 4. Streamlined Centerpiece Playback Bar */}
      <div className="glass-card mt-5 flex flex-wrap items-center justify-between gap-4 p-3.5">
        {/* Speed Controls */}
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

        {/* Primary Transport Controls */}
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
    </div>
  );
}
