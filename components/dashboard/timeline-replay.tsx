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

  // HUD Auto-hide state
  const [isHUDVisible, setIsHUDVisible] = useState(true);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseMove = () => {
    setIsHUDVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    
    // Only auto-hide if playing
    if (engine.isPlaying) {
      hideTimerRef.current = setTimeout(() => {
        setIsHUDVisible(false);
      }, 1000);
    }
  };

  useEffect(() => {
    if (!engine.isPlaying) {
      setIsHUDVisible(true);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    } else {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(() => {
        setIsHUDVisible(false);
      }, 1000);
    }
    
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [engine.isPlaying]);

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
      onMouseMove={handleMouseMove}
      className={`relative flex flex-col overflow-hidden font-sans transition-opacity duration-1000 ease-in-out ${
        isFullscreen ? "fixed inset-0 z-[100] bg-[#0A0A0A] h-screen w-screen" : "h-full w-full bg-transparent"
      } ${!isHUDVisible ? "cursor-none" : ""}`}
    >
      <div className="relative flex h-full w-full flex-col justify-between p-4 pb-28 sm:p-6 sm:pb-32 lg:p-8 lg:pb-32">

      {/* Top Header: Always Minimal & Readable */}
      <div className={`relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/65 pb-6 transition-all duration-300 ease-in-out ${isHUDVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"} ${isFullscreen ? 'w-[85%] mx-auto' : ''}`}>
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
              {!isFullscreen && (
                <span
                  className={`inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[9px] font-medium transition-all ${
                    engine.isPlaying
                      ? "border-brass/45 bg-brass/10 text-brass-light shadow-[0_0_10px_rgba(212,168,83,0.2)]"
                      : "border-zinc-800 bg-zinc-950 text-zinc-500"
                  }`}
                >
                  {engine.isPlaying ? "Playing 1x" : "Paused"}
                </span>
              )}
            </div>
            <h2 className={`font-display tracking-tight text-white mt-1 ${isFullscreen ? 'text-5xl lg:text-6xl font-bold' : 'text-4xl sm:text-5xl font-semibold'}`}>
              {currentChapter?.name || "The Developer Journey"}
            </h2>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Ambient Soundtrack Toggle (Muted by default) */}
          {!isFullscreen && (
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
          )}

          {/* Date Odometer */}
          <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950/80 px-3.5 py-1.5 shadow-inner">
            <Calendar className="h-3.5 w-3.5 text-brass-light" />
            <span className="font-display text-lg font-bold tracking-tight text-white">
              {engine.currentYear}
            </span>
            <span className="font-mono text-xs text-zinc-500">
              {engine.currentMonthName}
            </span>
          </div>

          {/* Fullscreen Toggle */}
          {!isFullscreen && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              title="Toggle Fullscreen Replay Theater (F)"
              className="h-8 w-8 p-0 text-zinc-500 hover:text-ivory"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          )}

          {/* Controls Drawer Toggle */}
          {!isFullscreen && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowControlsDrawer(!showControlsDrawer)}
              className="h-8 border-zinc-800 px-2.5 font-mono text-xs text-zinc-500 hover:text-ivory"
            >
              <Sliders className="mr-1 h-3 w-3 text-brass-light" />
              <span>{showControlsDrawer ? "Hide Controls" : "Controls"}</span>
            </Button>
          )}
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
      <div className="flex-1 flex flex-col justify-center items-center py-6 gap-8">
        {currentChapter?.narrative && (
          <div className={`text-center max-w-3xl mx-auto px-4 relative z-10 ${isFullscreen ? 'mt-4' : ''}`}>
            <p className="font-serif italic text-zinc-300 text-base sm:text-lg md:text-xl leading-relaxed drop-shadow-md">
              “{currentChapter.narrative}”
            </p>
          </div>
        )}

      {/* 2. Main Hero Replay Cinema Stage (Centered and scaled at 80% width) */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full flex-1">
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
          /* Minimalist, Clean Replay Card */
          <div
            className={`relative w-full ${isFullscreen ? 'max-w-4xl flex flex-col items-center text-center justify-center' : 'max-w-3xl glass-card cinematic-depth-card shadow-2xl border-zinc-800 bg-[#161618]/95 p-6 sm:p-8'} mx-auto overflow-hidden transition-all duration-500 ease-in-out flex flex-col`}
            style={!isFullscreen ? { borderColor: engine.eraColor.border, maxHeight: "300px" } : {}}
          >
            {!isFullscreen && <div className="pointer-events-none absolute inset-0 bg-scan-line opacity-5" />}

            {currentEvent?.type === "repo_created" ? (
              <div className={`relative z-10 flex flex-col gap-4 select-text ${isFullscreen ? 'items-center' : ''}`}>
                <div className={`flex flex-wrap items-center gap-2 ${!isFullscreen ? 'justify-between border-b border-zinc-800/80 pb-3' : ''}`}>
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-brass-dim/50 bg-brass/10 px-3 py-1 font-mono text-xs font-medium text-brass-light">
                    <FolderGit2 className="h-3.5 w-3.5" />
                    New Repository Founded
                  </span>
                  {!isFullscreen && <span className="font-mono text-xs text-zinc-500">{formattedDate}</span>}
                </div>

                <div className={`py-2 ${isFullscreen ? 'text-center mt-6' : ''}`}>
                  <h3 className={`font-display font-semibold text-white ${isFullscreen ? 'text-4xl sm:text-5xl lg:text-7xl font-bold' : 'text-2xl sm:text-3xl lg:text-4xl'}`}>
                    {currentEvent.repoName}
                  </h3>
                  <p className={`font-sans leading-relaxed text-zinc-400 ${isFullscreen ? 'mt-6 text-lg sm:text-xl max-w-2xl mx-auto' : 'mt-2 text-xs sm:text-sm'}`}>
                    {currentEvent.description || "Inaugural repository initialized."}
                  </p>
                </div>

                {!isFullscreen && (
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
                )}
              </div>
            ) : (
              /* Summarized Chapter Commit Card: Repo Badge, Date, Title, 1-sentence summary */
              <div className={`relative z-10 flex flex-col select-text ${isFullscreen ? 'items-center gap-8' : 'gap-5'}`}>
                <div className={`flex flex-wrap items-center gap-3 transition-all duration-500 ease-in-out ${!isFullscreen ? 'justify-between border-b border-zinc-800/60 pb-4' : 'justify-center'}`}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-zinc-700/60 bg-zinc-800/50 px-3 py-1 font-mono text-xs font-semibold text-zinc-200 shadow-sm">
                      <FolderGit2 className="h-3.5 w-3.5 text-brass-light" />
                      {currentEvent?.repoName}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800/80 bg-zinc-900/50 px-2 py-1 font-mono text-[10px] uppercase text-zinc-400">
                      <GitCommit className="h-3 w-3" />
                      {commit?.sha?.substring(0, 7) || "commit"}
                    </span>
                  </div>
                  {!isFullscreen && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                      <span className="font-mono text-xs text-zinc-300 font-medium">{formattedDate}</span>
                    </div>
                  )}
                </div>

                <div className={`transition-all duration-500 ease-in-out ${isFullscreen ? 'py-4' : 'py-2'}`}>
                  <h3 className={`font-display font-medium leading-snug tracking-tight text-white ${isFullscreen ? 'text-4xl sm:text-5xl lg:text-6xl font-bold max-w-4xl text-center' : 'text-2xl sm:text-3xl line-clamp-2'}`}>
                    {currentEvent?.title}
                  </h3>
                </div>

                {/* GitHub Description / Summary */}
                <div className={`font-sans leading-relaxed transition-all duration-500 ease-in-out text-zinc-400 ${isFullscreen ? 'text-lg sm:text-xl max-w-2xl text-center mx-auto' : 'text-sm md:text-base line-clamp-2'}`}>
                  {currentEvent?.description || currentEvent?.impactDescription || (commit?.message ? commit.message.split('\n')[0] : "Codebase updated.")}
                </div>

                {commit?.message && (
                  <div className="mt-2 transition-all duration-200 ease-in-out">
                    <button 
                      onClick={() => setShowDetails(!showDetails)}
                      className="font-mono text-[10px] text-zinc-500 hover:text-ivory uppercase tracking-wider"
                    >
                      {showDetails ? "Hide Raw Log" : "View Raw Log"}
                    </button>
                    <AnimatePresence>
                      {showDetails && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.4, ease: "easeInOut" }}
                          className="mt-3 overflow-hidden"
                        >
                          <pre className="whitespace-pre-wrap rounded bg-zinc-950/50 p-3 border border-zinc-800/50 font-mono text-[10px] text-zinc-400 line-clamp-2">
                            {commit.message}
                          </pre>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

        {/* 3. Cinematic Chapter Timeline & Indicator */}
        <div className={`mt-2 flex flex-col items-center justify-center text-center transition-opacity duration-500 ease-in-out w-full max-w-3xl mx-auto`}>
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500 mb-3 transition-all duration-500 ease-in-out">
            Chapter {engine.chapters.findIndex(c => c.id === currentChapter?.id) + 1} of {engine.chapters.length}
            <span className="mx-2 text-zinc-700">•</span>
            <span className="text-brass-light transition-all duration-500 ease-in-out">{currentEvent?.monthName} {currentEvent?.year}</span>
          </div>
          
          {/* Timeline Progress Bar */}
          <div className="w-full h-1 bg-zinc-800/50 rounded-full overflow-hidden mb-3">
            <div 
              className="h-full bg-brass transition-all duration-1000 ease-out" 
              style={{ width: `${(engine.currentIndex / Math.max(1, engine.total - 1)) * 100}%` }}
            />
          </div>

          <div className="font-sans text-xs text-zinc-400 transition-all duration-500 ease-in-out">
            {engine.total - engine.currentIndex - 1} meaningful milestones remaining
          </div>
        </div>

      </div>

      {/* Persistent Cinematic Control Dock */}
      <div className={`fixed bottom-0 left-0 w-full bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-12 pb-6 px-4 z-50 transition-all duration-300 ease-in-out ${isHUDVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full pointer-events-none"}`}>
        <div className="glass-card flex flex-wrap items-center justify-between gap-4 p-3.5 mx-auto max-w-5xl shadow-2xl border-white/5 bg-[#0B0A09]/90 backdrop-blur-xl">
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
    </div>
  );
}
