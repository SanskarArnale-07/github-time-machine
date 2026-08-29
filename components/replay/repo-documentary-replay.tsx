"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Film,
  GitBranch,
  GitCommit,
  Loader2,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Share2,
  User,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import type { GitHubCommit, GitHubRepo, ReplayEvent } from "@/lib/github/types";
import { useRepoDocumentaryEngine } from "@/lib/github/replay-engine";
import { ambientSoundtrack } from "@/lib/audio/ambient-soundtrack";
import {
  copyRepoDocumentaryLink,
  downloadRepoDocumentaryPDF,
  exportRepoDocumentaryVideo,
} from "@/lib/github/export-utils";
import { Button } from "@/components/ui/button";
import { ReplayBackground } from "@/components/replay/replay-background";

// ─── Theme Colors ─────────────────────────────────────────────────────────────
const GOLD_RGB = "216,181,108";
const ZINC_RGB = "161,161,170";
const IVORY_DARK = "#FDF8ED";
const IVORY_LIGHT = "#FFF4D6";

interface RepoDocumentaryReplayProps {
  commits: GitHubCommit[];
  repo: GitHubRepo;
}

// ─── GitHub Detail Strip ─────────────────────────────────────────────────────
// Shows authentic-looking git metadata derived from real commit data
function GitHubDetailStrip({
  event,
  visibleCommitCount,
  isFinal,
}: {
  event: ReplayEvent;
  visibleCommitCount: number;
  isFinal: boolean;
}) {
  // Heuristically infer branch count from commit messages seen so far
  const branchKeywords = ["feat/", "fix/", "chore/", "release/", "hotfix/", "dev/", "feature/"];
  const inferredBranches = Math.max(
    1,
    branchKeywords.filter((kw) => event.commit?.message?.toLowerCase().includes(kw)).length + 1
  );

  // Infer PR-like activity from merge commit messages
  const hasMerge = event.commit?.message?.toLowerCase().includes("merge");
  const prCount = hasMerge ? Math.ceil(visibleCommitCount / 4) : Math.max(1, Math.floor(visibleCommitCount / 6));

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 1.1, ease: "easeOut" }}
      className="mt-16 flex items-center gap-16 font-mono text-[72px] sm:text-[100px] tracking-wider"
      style={{ color: isFinal ? `rgba(${GOLD_RGB},0.7)` : `rgba(${ZINC_RGB},0.65)` }}
    >
      <span className="flex items-center gap-1.5">
        <GitCommit className="h-16 w-16 opacity-70" />
        {visibleCommitCount} commit{visibleCommitCount !== 1 ? "s" : ""}
      </span>
      <span className="opacity-40">·</span>
      <span className="flex items-center gap-1.5">
        <GitBranch className="h-16 w-16 opacity-70" />
        ~{inferredBranches} branch{inferredBranches !== 1 ? "es" : ""}
      </span>
      <span className="opacity-40">·</span>
      <span className="flex items-center gap-1.5">
        <User className="h-16 w-16 opacity-70" />
        ~{prCount} PR{prCount !== 1 ? "s" : ""}
      </span>
    </motion.div>
  );
}

// ─── Scene Arc Dots ──────────────────────────────────────────────────────────
function SceneArcDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center gap-1.5 mt-1">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-500"
          style={{
            width: i === current ? "14px" : "6px",
            height: "6px",
            backgroundColor: i === current
              ? "rgba(255,255,255,0.9)"
              : i < current
              ? "rgba(255,255,255,0.25)"
              : "rgba(255,255,255,0.1)",
          }}
        />
      ))}
    </div>
  );
}

// ─── Documentary Card ────────────────────────────────────────────────────────
function RepoDocumentaryCard({
  event,
  visibleCommitCount,
  isFinal,
}: {
  event: ReplayEvent;
  visibleCommitCount: number;
  isFinal: boolean;
}) {
  if (!event) return null;

  // Opening scene gets a slower, more deliberate entry
  const isOpening = event.chapterId === "scene-1";
  const scene = event.sceneIndex ?? 1;
  const fadeDuration = isOpening ? 1.8 : isFinal ? 1.6 : 1.1;

  // Progressive entry direction — each scene feels geometrically distinct
  const titleInitial: { opacity: number; y?: number; x?: number; scale?: number } = (() => {
    if (scene === 1) return { opacity: 0, y: 20, scale: 0.96 };          // rise up
    if (scene === 2) return { opacity: 0, y: 12, scale: 0.98 };          // gentle rise
    if (scene === 3) return { opacity: 0, x: -18, scale: 0.98 };         // enter from left
    if (scene === 4) return { opacity: 0, x: 18, scale: 0.98 };          // enter from right
    if (scene === 5) return { opacity: 0, y: -10, scale: 0.97 };         // drop in
    if (scene === 6) return { opacity: 0, scale: 0.94, y: 8 };           // expand from small
    return { opacity: 0, y: 6, scale: 0.99 };                            // final: subtle
  })();


  // Split the final description so the climax sentence can be styled separately
  const [mainDesc, climaxLine] = isFinal
    ? (event.description ?? "").split("\n\n")
    : [event.description ?? "", null];

  return (
    <div className="relative flex w-full h-full flex-col items-start justify-center text-left px-10 sm:px-20 lg:px-32 max-w-[1600px] mx-auto z-10">
      {/* Soft illumination behind text */}
      <div className={`absolute inset-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] -z-10 bg-[radial-gradient(ellipse_at_center,rgba(${GOLD_RGB},0.08)_0%,rgba(0,0,0,0.4)_40%,transparent_70%)] pointer-events-none blur-2xl`} />

      {/* Date */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: fadeDuration, delay: 0.2 }}
        className="mb-8 font-mono text-[64px] sm:text-[86px] tracking-widest"
        style={{ color: isFinal ? `rgba(${GOLD_RGB},0.88)` : "rgba(212,212,216,0.85)" }}
      >
        {new Date(event.date).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
      </motion.div>

      {/* Chapter Title */}
      <motion.h2
        initial={titleInitial as { opacity: number; y?: number; x?: number; scale?: number }}
        animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
        transition={{ duration: fadeDuration, delay: 0.4, ease: "easeOut" }}
        className="font-display font-black tracking-tight text-6xl leading-tight sm:text-7xl md:text-8xl lg:text-9xl"
        style={{
          color: isFinal ? IVORY_LIGHT : IVORY_DARK,
          textShadow: isFinal
            ? `0 4px 32px rgba(0,0,0,0.95), 0 0 80px rgba(${GOLD_RGB},0.55)`
            : `0 4px 24px rgba(0,0,0,0.92), 0 0 60px rgba(${GOLD_RGB},0.35)`,
        }}
      >
        {event.title}
      </motion.h2>

      {/* Narrative Paragraph */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: fadeDuration, delay: 0.65, ease: "easeOut" }}
        className="mt-12 w-full max-w-[95%] lg:max-w-[85%] text-left text-[115px] sm:text-[144px] font-medium leading-[1.35] text-balance tracking-wide"
        style={{
          color: isFinal ? `rgba(${IVORY_LIGHT},0.97)` : "rgba(255,255,255,0.97)",
          textShadow: "0 2px 16px rgba(0,0,0,0.95)",
        }}
      >
        {mainDesc}
      </motion.p>

      {/* Climax line — final scene only, delayed, gold-tinted */}
      {climaxLine && (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 1.2, ease: "easeOut" }}
          className="mt-12 w-full max-w-[95%] lg:max-w-[85%] text-left text-[130px] sm:text-[172px] font-semibold leading-[1.35] text-balance tracking-wide"
          style={{
            color: `rgba(${GOLD_RGB},0.92)`,
            textShadow: `0 2px 24px rgba(0,0,0,0.98), 0 0 40px rgba(${GOLD_RGB},0.30)`,
          }}
        >
          {climaxLine}
        </motion.p>
      )}

      {/* Milestone Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, filter: "blur(5px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 1, delay: 0.85, ease: "easeOut" }}
        className="mt-12 w-full max-w-[95%] lg:max-w-[90%] rounded-[60px] p-20 sm:p-24 shadow-[0_0_80px_rgba(255,255,255,0.08)] backdrop-blur-md text-left relative overflow-hidden"
        style={{
          backgroundColor: "rgba(5,5,5,0.62)",
          border: isFinal
            ? `1px solid rgba(${GOLD_RGB},0.28)`
            : "1px solid rgba(255,255,255,0.18)",
        }}
      >
        {/* Final scene: subtle gold shimmer on card */}
        {isFinal && (
          <div className={`absolute inset-0 pointer-events-none rounded-2xl bg-[radial-gradient(ellipse_at_top_left,rgba(${GOLD_RGB},0.06),transparent_60%)]`} />
        )}

        <div className="flex items-start justify-between border-b border-white/5 pb-4 mb-4">
          <div>
            <h3 className="font-sans text-[144px] sm:text-[216px] leading-tight font-semibold" style={{ color: isFinal ? IVORY_LIGHT : "#ffffff" }}>
              {event.repoName}
            </h3>
            <div className="mt-8 flex items-center gap-12 font-mono text-[86px] sm:text-[108px] text-zinc-400">
              {event.language && (
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-10 w-10 rounded-full"
                    style={{ backgroundColor: event.languageColor || "#8b949e" }}
                  />
                  {event.language}
                </div>
              )}
              <span>·</span>
              <span>{new Date(event.date).toLocaleDateString()}</span>
            </div>
          </div>
          <div
            className="rounded-full px-10 py-5 font-mono text-[64px] sm:text-[86px] uppercase tracking-wider"
            style={{
              border: isFinal ? `1px solid rgba(${GOLD_RGB},0.35)` : "1px solid rgba(255,255,255,0.18)",
              backgroundColor: isFinal ? `rgba(${GOLD_RGB},0.1)` : "rgba(255,255,255,0.08)",
              color: isFinal ? `rgba(${GOLD_RGB},0.9)` : "rgba(228,228,231,0.9)",
            }}
          >
            {event.impactBadge}
          </div>
        </div>

        <div>
          <span className="font-mono text-[64px] sm:text-[86px] uppercase tracking-widest text-zinc-300 block mb-8">
            Highlighted Commit
          </span>
          <p className="font-mono text-[115px] sm:text-[144px] text-zinc-100 break-words line-clamp-2 leading-[1.4]">
            {event.commit?.message || "Repository created."}
          </p>
        </div>

        {/* GitHub Detail Strip */}
        <GitHubDetailStrip
          event={event}
          visibleCommitCount={visibleCommitCount}
          isFinal={isFinal}
        />
      </motion.div>

      {/* Final scene: "fin." watermark */}
      {isFinal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 1.5 }}
          className="absolute bottom-10 right-12 font-mono text-[32px] sm:text-[40px] tracking-[0.25em] uppercase pointer-events-none select-none"
          style={{ color: `rgba(${GOLD_RGB},0.25)` }}
        >
          fin.
        </motion.div>
      )}
    </div>
  );
}

export function RepoDocumentaryReplay({ commits, repo }: RepoDocumentaryReplayProps) {
  const engine = useRepoDocumentaryEngine(commits, repo);
  const theaterRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);

  // HUD Auto-hide state
  const [isHUDVisible, setIsHUDVisible] = useState(true);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // Progress bar scrub/hover state
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState(0);
  const scrubTrackRef = useRef<HTMLDivElement>(null);

  // Export state
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportProgress, setExportProgress] = useState<string | null>(null);
  const [exportDuration, setExportDuration] = useState<"30s" | "60s" | "full">("full");
  const [linkCopied, setLinkCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  // Close export menu on outside click
  useEffect(() => {
    if (!isExportOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setIsExportOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isExportOpen]);

  const handleCopyLink = useCallback(async () => {
    const result = await copyRepoDocumentaryLink(repo.full_name, engine.currentIndex);
    setLinkCopied(result.success);
    setTimeout(() => setLinkCopied(false), 2000);
  }, [repo.full_name, engine.currentIndex]);

  const handleExportPDF = useCallback(() => {
    downloadRepoDocumentaryPDF(repo, engine.events, engine.chapters);
    setIsExportOpen(false);
  }, [repo, engine.events, engine.chapters]);

  const handleExportVideo = useCallback(() => {
    setIsExporting(true);
    setExportProgress("Initializing...");

    exportRepoDocumentaryVideo(
      repo,
      engine.events,
      engine.chapters,
      (msg) => setExportProgress(msg),
      soundEnabled,
      exportDuration
    ).finally(() => {
      setIsExporting(false);
      setExportProgress(null);
    });

    setIsExportOpen(false);
  }, [repo, engine.events, engine.chapters, soundEnabled, exportDuration]);

  const indexFromClientX = useCallback(
    (clientX: number) => {
      const track = scrubTrackRef.current;
      if (!track) return 0;
      const rect = track.getBoundingClientRect();
      const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return Math.round(percentage * (engine.total - 1));
    },
    [engine.total]
  );

  const handleTrackHover = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const track = scrubTrackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      setHoverX(Math.max(0, Math.min(rect.width, e.clientX - rect.left)));
      setHoverIndex(indexFromClientX(e.clientX));
      if (isScrubbing) {
        engine.seek(indexFromClientX(e.clientX));
      }
    },
    [engine, indexFromClientX, isScrubbing]
  );

  useEffect(() => {
    if (!isScrubbing) return;
    const handleMove = (e: MouseEvent) => {
      engine.seek(indexFromClientX(e.clientX));
      const track = scrubTrackRef.current;
      if (track) {
        const rect = track.getBoundingClientRect();
        setHoverX(Math.max(0, Math.min(rect.width, e.clientX - rect.left)));
        setHoverIndex(indexFromClientX(e.clientX));
      }
    };
    const handleUp = () => setIsScrubbing(false);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [isScrubbing, engine, indexFromClientX]);

  const handleMouseMove = (e: React.MouseEvent) => {
    // Prevent phantom mousemoves from CSS animations from resetting the timer
    const isActuallyMoving =
      Math.abs(e.clientX - lastMousePos.current.x) > 2 ||
      Math.abs(e.clientY - lastMousePos.current.y) > 2;

    if (!isActuallyMoving) return;

    lastMousePos.current = { x: e.clientX, y: e.clientY };

    setIsHUDVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);

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

  // Audio state
  useEffect(() => {
    try {
      if (localStorage.getItem("github_time_machine_sound_enabled") === "true") {
        // See timeline-replay.tsx for why this doesn't call start() directly:
        // browsers block AudioContext.resume() outside a genuine user gesture,
        // so starting it here would leave the toggle showing "on" with no
        // actual sound until the user manually re-clicked it.
        setSoundEnabled(true);

        const startOnFirstInteraction = () => {
          ambientSoundtrack.start();
          window.removeEventListener("pointerdown", startOnFirstInteraction);
          window.removeEventListener("keydown", startOnFirstInteraction);
        };
        window.addEventListener("pointerdown", startOnFirstInteraction, { once: true });
        window.addEventListener("keydown", startOnFirstInteraction, { once: true });

        return () => {
          window.removeEventListener("pointerdown", startOnFirstInteraction);
          window.removeEventListener("keydown", startOnFirstInteraction);
          ambientSoundtrack.stop();
        };
      }
    } catch {
      // Ignore
    }
    return () => ambientSoundtrack.stop();
  }, []);

  // Progress the soundtrack through its three themes as the replay advances,
  // instead of staying on whichever one start() happened to pick at random —
  // otherwise a full session plays through on a single theme the whole time.
  useEffect(() => {
    if (!soundEnabled || engine.total === 0) return;
    const progress = engine.currentIndex / Math.max(1, engine.total - 1);
    ambientSoundtrack.setTheme(
      progress < 0.33 ? "odyssey" : progress > 0.75 ? "horizon" : "constellations"
    );
  }, [engine.currentIndex, engine.total, soundEnabled]);

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

  // "F" toggles fullscreen. Lives here (not in the engine hook) because it needs theaterRef.
  useEffect(() => {
    const handleFullscreenKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT" ||
        target?.isContentEditable
      ) return;

      if (e.code === "KeyF") {
        e.preventDefault();
        toggleFullscreen();
      }
    };
    window.addEventListener("keydown", handleFullscreenKey);
    return () => window.removeEventListener("keydown", handleFullscreenKey);
  }, [toggleFullscreen]);

  const toggleSoundtrack = useCallback(() => {
    const nextSoundEnabled = !soundEnabled;
    setSoundEnabled(nextSoundEnabled);

    if (nextSoundEnabled) ambientSoundtrack.start();
    else ambientSoundtrack.stop();

    try {
      localStorage.setItem("github_time_machine_sound_enabled", String(nextSoundEnabled));
    } catch {}
  }, [soundEnabled]);

  // If there's an issue with events loading
  if (engine.total === 0) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-[#0A0A0A] text-white">
        <p>No documentary scenes available for this repository.</p>
      </div>
    );
  }

  const isFinal = engine.currentIndex >= engine.total - 1;

  // Extract sceneIndex from engine — set by documentary-engine.ts on each event
  const sceneIndex = engine.currentEvent?.sceneIndex ?? engine.currentIndex + 1;

  // Visible commit count for detail strip (use visibleCommits from engine)
  const visibleCommitCount = Math.max(1, engine.visibleCommits?.length ?? engine.currentIndex + 1);

  return (
    <div
      ref={theaterRef}
      className={`relative flex h-full w-full flex-col overflow-hidden bg-black selection:bg-white/20 ${!isHUDVisible && isFullscreen ? "cursor-none" : ""}`}
      onMouseMove={handleMouseMove}
    >
      <ReplayBackground
        progress={engine.progress}
        isFinal={isFinal}
        sceneIndex={sceneIndex}
      />

      <header
        className={`absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-6 transition-all duration-300 ease-in-out ${isHUDVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"} ${isFullscreen ? "hidden" : ""}`}
      >
        <a
          href="/dashboard#repos"
          aria-label="Back to repository archive"
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/60 px-4 py-2 font-mono text-xs uppercase tracking-[0.15em] text-zinc-400 backdrop-blur-md transition-colors hover:border-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span>Back to Archive</span>
        </a>

        {/* Export Menu — Top Right */}
        <div ref={exportRef} className="relative">
          <button
            type="button"
            onClick={() => setIsExportOpen((prev) => !prev)}
            className={`inline-flex items-center gap-2 rounded-full border bg-black/60 px-4 py-2 font-mono text-xs uppercase tracking-[0.15em] backdrop-blur-md transition-colors ${
              isExportOpen
                ? "border-white/20 text-white"
                : "border-white/10 text-zinc-400 hover:border-white/20 hover:text-white"
            }`}
            aria-label={isExportOpen ? "Close export menu" : "Open export menu"}
            title="Export Documentary"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export</span>
          </button>
          <AnimatePresence>
            {isExportOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute top-12 right-0 z-[60] w-64 overflow-hidden rounded-xl border border-white/10 bg-[#0A0A0A]/96 shadow-2xl backdrop-blur-2xl"
              >
                <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
                  <span className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-400">Export</span>
                  <button
                    type="button"
                    onClick={() => setIsExportOpen(false)}
                    className="text-zinc-500 transition-colors hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="p-2">
                  {/* Copy Link */}
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-white/5"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
                      {linkCopied ? <Check className="h-4 w-4 text-emerald-400" /> : <Share2 className="h-4 w-4 text-zinc-400" />}
                    </div>
                    <div>
                      <span className="block text-[15px] font-medium text-zinc-200">
                        {linkCopied ? "Link Copied!" : "Copy Link"}
                      </span>
                      <span className="block font-mono text-xs text-zinc-500">Share this documentary</span>
                    </div>
                  </button>
                  {/* Export PDF */}
                  <button
                    type="button"
                    onClick={handleExportPDF}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-white/5"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
                      <FileText className="h-4 w-4 text-zinc-400" />
                    </div>
                    <div>
                      <span className="block text-[15px] font-medium text-zinc-200">Export PDF</span>
                      <span className="block font-mono text-xs text-zinc-500">Printable documentary report</span>
                    </div>
                  </button>
                  {/* Export Video */}
                  <div className="flex w-full flex-col gap-1 rounded-lg px-3 py-2.5 transition-colors hover:bg-white/5">
                    <button
                      type="button"
                      onClick={handleExportVideo}
                      disabled={isExporting}
                      className="flex w-full items-center gap-3 text-left disabled:opacity-50 disabled:pointer-events-none"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
                        {isExporting ? <Loader2 className="h-4 w-4 animate-spin text-zinc-400" /> : <Film className="h-4 w-4 text-zinc-400" />}
                      </div>
                      <div className="flex-1">
                        <span className="block text-[15px] font-medium text-zinc-200">
                          {isExporting ? "Rendering..." : "Export Video"}
                        </span>
                        <span className="block font-mono text-xs text-zinc-500">
                          {exportProgress || "1080p cinematic MP4"}
                        </span>
                      </div>
                    </button>

                    {!isExporting && (
                      <div className="flex gap-2 pl-11 pt-2">
                        {(["30s", "60s", "full"] as const).map((dur) => (
                          <button
                            key={dur}
                            onClick={(e) => {
                              e.stopPropagation();
                              setExportDuration(dur);
                            }}
                            className={`px-2 py-1 text-xs font-mono rounded uppercase transition-colors ${
                              exportDuration === dur
                                ? "bg-white/20 text-white"
                                : "bg-white/5 text-zinc-400 hover:bg-white/10"
                            }`}
                          >
                            {dur}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Main Content Area */}
      <main
        className="relative z-10 flex flex-1 items-center justify-center w-full h-full"
        aria-label="Documentary scene"
        aria-live="polite"
        aria-atomic="true"
      >
        <AnimatePresence mode="wait">
          {engine.currentEvent && (() => {
            // Progressive enter scale: opening breathes in wide, middle scenes snap, finale subtle
            const enterScale = sceneIndex === 1 ? 0.94 : sceneIndex <= 3 ? 0.96 : isFinal ? 0.98 : 0.97;
            // Progressive exit push: grows with scene, peaks at scene 6, climax is still
            const exitScale = isFinal ? 1.01 : Math.min(1.06, 1.02 + sceneIndex * 0.005);
            return (
              <motion.div
                key={engine.currentEvent.id}
                initial={{ opacity: 0, scale: enterScale }}
                animate={{ opacity: 1, scale: 1.02 }}
                exit={{
                  opacity: 0,
                  scale: exitScale,
                  transition: { 
                    opacity: { duration: 0.85, ease: "easeIn" },
                    scale: { duration: 0.85, ease: "easeIn" }
                  },
                }}
                transition={{
                  opacity: { duration: isFinal ? 1.6 : 1.1, ease: "easeOut" },
                  scale: { duration: ((engine.currentEvent.sceneDuration || 6000) / 1000) + 1, ease: "linear" },
                }}
                className="absolute inset-0 flex items-center justify-center w-full h-full"
              >
                <RepoDocumentaryCard
                  event={engine.currentEvent}
                  visibleCommitCount={visibleCommitCount}
                  isFinal={isFinal}
                />
              </motion.div>
            );
          })()}
        </AnimatePresence>

      </main>

      {/* Fixed Bottom Control Dock */}
      <section
        role="toolbar"
        aria-label="Playback controls"
        className={`absolute bottom-0 left-0 right-0 z-50 w-full border-t border-white/10 bg-black/80 backdrop-blur-xl transition-all duration-300 ease-in-out ${isHUDVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full pointer-events-none"}`}
      >
        <div
          ref={scrubTrackRef}
          role="progressbar"
          aria-label="Playback progress"
          aria-valuemin={0}
          aria-valuemax={engine.total - 1}
          aria-valuenow={engine.currentIndex}
          tabIndex={0}
          className="group relative h-1.5 w-full cursor-pointer bg-zinc-900 hover:h-2.5 transition-[height] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          onMouseDown={(e) => {
            setIsScrubbing(true);
            engine.seek(indexFromClientX(e.clientX));
          }}
          onMouseMove={handleTrackHover}
          onMouseLeave={() => !isScrubbing && setHoverIndex(null)}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") { e.preventDefault(); engine.stepBack(); }
            if (e.key === "ArrowRight") { e.preventDefault(); engine.stepForward(); }
            if (e.key === "Home") { e.preventDefault(); engine.seek(0); }
            if (e.key === "End") { e.preventDefault(); engine.seek(engine.total - 1); }
          }}
        >
          {/* Hover/scrub tooltip */}
          {hoverIndex !== null && engine.events[hoverIndex] && (
            <div
              className="pointer-events-none absolute bottom-4 z-40 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/10 bg-black/90 px-3 py-2 font-mono text-xs text-zinc-200 shadow-xl"
              style={{ left: `${hoverX}px` }}
            >
              {engine.events[hoverIndex].title}
            </div>
          )}
          {/* Markers */}
          {engine.events.map((ev, i) => {
            const leftPercent = (i / Math.max(1, engine.total - 1)) * 100;
            return (
              <div
                key={ev.id}
                className="absolute top-0 bottom-0 w-px bg-white/20 z-30"
                style={{ left: `${leftPercent}%` }}
              />
            );
          })}
          {/* Progress fill — goes gold on final scene */}
          <div
            className="absolute left-0 top-0 bottom-0 transition-[width] duration-300 ease-out z-20"
            style={{
              width: `${engine.progress}%`,
              backgroundColor: isFinal ? `rgba(${GOLD_RGB},0.85)` : "white",
            }}
          />
          {/* Scrub handle */}
          <div
            className="pointer-events-none absolute top-1/2 z-30 h-3 w-3 -translate-y-1/2 -translate-x-1/2 rounded-full bg-white opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100"
            style={{ left: `${engine.progress}%`, opacity: isScrubbing ? 1 : undefined }}
          />
        </div>

        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-8">
          <div className="flex w-1/3 items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={engine.replay}
              aria-label="Restart from beginning"
              className="h-10 w-10 text-muted hover:bg-white/5 hover:text-ivory focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-1 focus-visible:ring-offset-black"
              title="Replay (R)"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={engine.stepBack}
              disabled={engine.currentIndex === 0}
              aria-label="Previous scene"
              className="h-10 w-10 text-muted hover:bg-white/5 hover:text-ivory focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-1 focus-visible:ring-offset-black"
              title="Previous"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              onClick={engine.togglePlay}
              aria-label={engine.isPlaying ? "Pause" : "Play"}
              aria-pressed={engine.isPlaying}
              className="group relative flex h-12 w-12 items-center justify-center rounded-full bg-white text-black shadow-md transition-all duration-200 hover:scale-105 hover:bg-zinc-200 active:scale-95 focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              title="Play/Pause (Space)"
            >
              <AnimatePresence>
                {engine.isPlaying ? (
                  <motion.div
                    key="pause"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <Pause className="h-5 w-5 fill-black" strokeWidth={1} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="play"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute inset-0 flex items-center justify-center pl-1"
                  >
                    <Play className="h-5 w-5 fill-black" strokeWidth={1} />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={engine.stepForward}
              disabled={isFinal}
              aria-label="Next scene"
              className="h-10 w-10 text-zinc-400 hover:bg-white/5 hover:text-white focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-1 focus-visible:ring-offset-black"
              title="Next"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Center: Chapter name + scene arc dots */}
          <div className="flex w-1/3 flex-col items-center justify-center text-center">
            <span className="font-mono text-[15px] uppercase tracking-[0.2em] text-white">
              {engine.currentEvent?.chapterName || "Documentary"}
            </span>
            <SceneArcDots total={engine.total} current={engine.currentIndex} />
          </div>

          <div className="flex w-1/3 items-center justify-end gap-1">
            {/* Desktop: full speed selector */}
            <div className="mr-4 hidden items-center gap-1 rounded-md border border-white/10 bg-black/50 p-1 sm:flex">
              {([1, 2, 5] as const).map((speed) => (
                <button
                  key={speed}
                  onClick={() => engine.setSpeed(speed)}
                  className={`rounded px-2.5 py-1 font-mono text-xs font-semibold transition-colors ${
                    engine.speed === speed ? "bg-white/10 text-white" : "text-zinc-500 hover:text-white"
                  }`}
                >
                  {speed}×
                </button>
              ))}
            </div>
            {/* Mobile: tap-to-cycle speed button */}
            <button
              type="button"
              onClick={() => {
                const speeds = [1, 2, 5] as const;
                const nextSpeed = speeds[(speeds.indexOf(engine.speed) + 1) % speeds.length];
                engine.setSpeed(nextSpeed);
              }}
              className="mr-1 inline-flex h-10 min-w-10 items-center justify-center rounded-md border border-white/10 bg-black/50 px-2.5 font-mono text-xs font-semibold text-zinc-300 transition-colors hover:bg-white/10 hover:text-white sm:hidden"
              title="Playback speed"
            >
              {engine.speed}×
            </button>
            <button
              type="button"
              onClick={toggleSoundtrack}
              aria-label={soundEnabled ? "Mute soundtrack" : "Unmute soundtrack"}
              aria-pressed={soundEnabled}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-md border backdrop-blur-md transition-colors mr-1 sm:mr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-1 focus-visible:ring-offset-black ${
                soundEnabled
                  ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
                  : "border-transparent text-zinc-500 hover:bg-white/5 hover:text-white"
              }`}
              title="Mute/Unmute"
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              aria-pressed={isFullscreen}
              className="h-10 w-10 text-muted hover:bg-white/5 hover:text-ivory focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-1 focus-visible:ring-offset-black"
              title="Fullscreen (F)"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
