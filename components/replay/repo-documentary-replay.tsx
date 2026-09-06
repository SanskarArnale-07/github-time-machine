"use client";

import { useCallback, useEffect, useRef, useState, useMemo, memo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Film,
  Loader2,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Share2,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import type { GitHubCommit, GitHubRepo, ReplayEvent } from "@/lib/github/types";
import { useRepoDocumentaryEngine } from "@/lib/github/replay-engine";
import { ambientSoundtrack } from "@/lib/audio/ambient-soundtrack";
import { cleanCommitMessage } from "@/lib/github/story-generator";
import { Button } from "@/components/ui/button";
import { ReplayBackground } from "@/components/replay/replay-background";

// ─── Theme Constants ─────────────────────────────────────────────────────────
const IVORY_DARK = "#FDF8ED";
const IVORY_LIGHT = "#FFF4D6";

interface RepoDocumentaryReplayProps {
  commits: GitHubCommit[];
  repo: GitHubRepo;
}

// ─── Lightweight Cinematic Editorial Repository Block ─────────────────────────
// Sits directly on the documentary background — NO card, NO panel, NO box.
interface RepoDocumentaryInfoProps {
  event: ReplayEvent;
  repo: GitHubRepo;
  isFinal: boolean;
  commitsCount: number;
}

const RepoDocumentaryInfo = memo(function RepoDocumentaryInfo({
  event,
  repo,
  isFinal,
  commitsCount,
}: RepoDocumentaryInfoProps) {
  if (!event) return null;

  if (isFinal) {
    return (
      <section className="flex h-full w-full flex-col items-center justify-center text-center px-4 sm:px-8 max-w-4xl mx-auto">
        {/* 1. Chapter Date / Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-mono text-xs sm:text-sm uppercase tracking-[0.25em] text-amber-300/80 font-semibold mb-3 sm:mb-4"
        >
          Documentary finale
        </motion.div>

        {/* 2. Chapter Title */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="font-display font-black tracking-tight leading-[1.08] text-[#FFF4D6] drop-shadow-2xl text-balance mx-auto"
          style={{
            fontSize: "clamp(2.25rem, 4vw + 0.5rem, 4.25rem)",
            maxWidth: "min(100%, 820px)",
            wordBreak: "break-word",
            overflowWrap: "break-word",
          }}
        >
          {event.title || `The Story of ${repo.name}`}
        </motion.h2>

        {/* 3. Narrative */}
        {event.description && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-4 max-w-[660px] text-sm sm:text-base md:text-lg font-normal leading-relaxed text-zinc-300 drop-shadow-md text-balance mx-auto"
          >
            {event.description}
          </motion.p>
        )}

        {/* 4. Repository Name (Subordinate to Chapter Title) */}
        <motion.h3
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-8 sm:mt-10 font-sans font-bold tracking-tight text-white leading-tight break-words max-w-[760px] mx-auto"
          style={{
            fontSize: "clamp(1.75rem, 2.8vw + 0.25rem, 2.75rem)",
            wordBreak: "break-word",
            overflowWrap: "break-word",
          }}
        >
          {repo.name}
        </motion.h3>

        {/* 5. Repository Metadata (Minimal: Language · Date · optional SHA) */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="mt-2.5 flex flex-wrap items-center justify-center gap-2 font-mono text-xs sm:text-[13px] text-zinc-400 tracking-wider"
        >
          {repo.language && (
            <div className="flex items-center gap-1.5">
              <span
                className="h-1.5 w-1.5 rounded-full ring-1 ring-white/10 shrink-0"
                style={{ backgroundColor: event.languageColor || "#3178c6" }}
              />
              <span>{repo.language}</span>
            </div>
          )}
          {repo.language && <span>·</span>}
          <span>
            {new Date(event.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </motion.div>

        {/* 6. Milestone Label */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-4"
        >
          <span className="inline-block rounded px-2.5 py-0.5 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.16em] font-medium border border-amber-400/30 bg-amber-400/10 text-amber-200">
            {event.impactBadge || "COMPLETE ARCHIVE"}
          </span>
        </motion.div>

        {/* 7. Highlighted Commit / Climax Note */}
        {event.commit?.message && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55 }}
            className="mt-4 sm:mt-5 max-w-[580px] mx-auto text-center"
          >
            <span className="block font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-zinc-500 font-semibold mb-1">
              FINAL COMMIT
            </span>
            <p className="font-sans text-xs sm:text-sm text-zinc-300 font-normal leading-relaxed break-words line-clamp-2 text-balance">
              {cleanCommitMessage(event.commit.message)}
            </p>
          </motion.div>
        )}

        {/* Editorial Fin. */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.9 }}
          className="mt-8 font-mono text-xs uppercase tracking-widest text-muted/60"
        >
          {commitsCount} commits archived · Fin.
        </motion.div>
      </section>
    );
  }

  const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  }).toUpperCase();

  const metadataDate = new Date(event.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <section className="flex h-full w-full flex-col items-center justify-center text-center px-4 sm:px-8 max-w-4xl mx-auto">
      {/* 1. Chapter Date */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="font-mono text-xs sm:text-sm uppercase tracking-[0.25em] text-zinc-400 font-semibold mb-3 sm:mb-4"
      >
        {formattedDate}
      </motion.div>

      {/* 2. Chapter Title */}
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="font-display font-black tracking-tight leading-[1.08] text-[#FDF8ED] drop-shadow-2xl text-balance mx-auto"
        style={{
          fontSize: "clamp(2.25rem, 4vw + 0.5rem, 4.25rem)",
          maxWidth: "min(100%, 780px)",
          wordBreak: "break-word",
          overflowWrap: "break-word",
        }}
      >
        {event.title}
      </motion.h2>

      {/* 3. Narrative */}
      {event.description && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-4 max-w-[660px] text-sm sm:text-base md:text-lg font-normal leading-relaxed text-zinc-300 drop-shadow-md text-balance mx-auto"
        >
          {event.description}
        </motion.p>
      )}

      {/* 4. Repository Name (Subordinate to Chapter Title) */}
      <motion.h3
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        className="mt-8 sm:mt-10 font-sans font-bold tracking-tight text-white leading-tight break-words max-w-[760px] mx-auto"
        style={{
          fontSize: "clamp(1.75rem, 2.8vw + 0.25rem, 2.75rem)",
          wordBreak: "break-word",
          overflowWrap: "break-word",
        }}
      >
        {event.repoName || repo.name}
      </motion.h3>

      {/* 5. Repository Metadata (Minimal: Language · Date · optional SHA) */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.45 }}
        className="mt-2.5 flex flex-wrap items-center justify-center gap-2 font-mono text-xs sm:text-[13px] text-zinc-400 tracking-wider"
      >
        {(event.language || repo.language) && (
          <div className="flex items-center gap-1.5">
            <span
              className="h-1.5 w-1.5 rounded-full ring-1 ring-white/10 shrink-0"
              style={{ backgroundColor: event.languageColor || "#3178c6" }}
            />
            <span>{event.language || repo.language}</span>
          </div>
        )}
        {(event.language || repo.language) && <span>·</span>}
        <span>{metadataDate}</span>
      </motion.div>

      {/* 6. Milestone Label (Small Understated Accent) */}
      {event.impactBadge && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-4"
        >
          <span className="inline-block rounded px-2.5 py-0.5 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.16em] font-medium border border-cyan-400/30 bg-cyan-400/10 text-cyan-300">
            {event.impactBadge}
          </span>
        </motion.div>
      )}

      {/* 7. Highlighted Commit (Label + Actual Message, NO Box) */}
      {event.commit?.message && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55 }}
          className="mt-4 sm:mt-5 max-w-[580px] mx-auto text-center"
        >
          <span className="block font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-zinc-500 font-semibold mb-1">
            HIGHLIGHTED COMMIT
          </span>
          <p className="font-sans text-xs sm:text-sm text-zinc-200 font-normal leading-relaxed break-words line-clamp-2 text-balance">
            {cleanCommitMessage(event.commit.message)}
          </p>
        </motion.div>
      )}
    </section>
  );
});

// ─── Main Replay Component ────────────────────────────────────────────────────
export function RepoDocumentaryReplay({ commits, repo }: RepoDocumentaryReplayProps) {
  const engine = useRepoDocumentaryEngine(commits, repo);
  const theaterRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // HUD Auto-hide state
  const [isHUDVisible, setIsHUDVisible] = useState(true);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const lastMouseMoveTimeRef = useRef<number>(0);

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
    const { copyRepoDocumentaryLink } = await import("@/lib/github/export-utils");
    const result = await copyRepoDocumentaryLink(repo.full_name, engine.currentIndex);
    setLinkCopied(result.success);
    setTimeout(() => setLinkCopied(false), 2000);
  }, [repo.full_name, engine.currentIndex]);

  const handleExportPDF = useCallback(async () => {
    const { downloadRepoDocumentaryPDF } = await import("@/lib/github/export-utils");
    downloadRepoDocumentaryPDF(repo, engine.events, engine.chapters);
    setIsExportOpen(false);
  }, [repo, engine.events, engine.chapters]);

  const handleExportVideo = useCallback(() => {
    setIsExporting(true);
    setExportProgress("Initializing...");

    import("@/lib/github/export-utils").then(({ exportRepoDocumentaryVideo }) => {
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
    const now = performance.now();
    if (now - lastMouseMoveTimeRef.current < 120) return;
    lastMouseMoveTimeRef.current = now;

    const isActuallyMoving =
      Math.abs(e.clientX - lastMousePos.current.x) > 3 ||
      Math.abs(e.clientY - lastMousePos.current.y) > 3;

    if (!isActuallyMoving) return;

    lastMousePos.current = { x: e.clientX, y: e.clientY };
    setIsHUDVisible(true);

    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (engine.isPlaying) {
      hideTimerRef.current = setTimeout(() => {
        setIsHUDVisible(false);
      }, 1200);
    }
  };

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

  if (engine.total === 0) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-[#0A0A0A] text-white">
        <p>No documentary scenes available for this repository.</p>
      </div>
    );
  }

  const isFinal = engine.currentIndex >= engine.total - 1;
  const sceneIndex = engine.currentEvent?.sceneIndex ?? engine.currentIndex + 1;

  // Compute dynamic space theme for background
  const currentTitle = (engine.currentEvent?.title || "").toLowerCase();
  let spaceTheme: "default" | "architecture" | "performance" | "beginning" | "refactor" | "milestone" | "streak" = "default";
  if (isFinal) {
    spaceTheme = "milestone";
  } else if (sceneIndex === 1) {
    spaceTheme = "beginning";
  } else if (currentTitle.includes("perf") || currentTitle.includes("optimiz") || currentTitle.includes("speed")) {
    spaceTheme = "performance";
  } else if (currentTitle.includes("refactor") || currentTitle.includes("clean") || currentTitle.includes("rewrite")) {
    spaceTheme = "refactor";
  } else if (currentTitle.includes("architect") || currentTitle.includes("foundation") || currentTitle.includes("core")) {
    spaceTheme = "architecture";
  }

  const chapterGlowMap: Record<"default" | "architecture" | "performance" | "beginning" | "refactor" | "milestone" | "streak", string> = {
    default: "radial-gradient(ellipse 65% 55% at 50% 50%, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.065) 35%, rgba(56, 189, 248, 0.02) 65%, transparent 78%)",
    architecture: "radial-gradient(ellipse 65% 55% at 50% 50%, rgba(79, 70, 229, 0.14) 0%, rgba(109, 40, 217, 0.08) 35%, rgba(30, 27, 75, 0.03) 65%, transparent 78%)",
    performance: "radial-gradient(ellipse 65% 55% at 50% 50%, rgba(6, 182, 212, 0.13) 0%, rgba(59, 130, 246, 0.07) 35%, rgba(14, 116, 144, 0.025) 65%, transparent 78%)",
    beginning: "radial-gradient(ellipse 65% 55% at 50% 50%, rgba(129, 140, 248, 0.15) 0%, rgba(168, 85, 247, 0.08) 35%, rgba(99, 102, 241, 0.03) 65%, transparent 78%)",
    refactor: "radial-gradient(ellipse 65% 55% at 50% 50%, rgba(139, 92, 246, 0.11) 0%, rgba(76, 29, 149, 0.06) 35%, rgba(55, 48, 163, 0.02) 65%, transparent 78%)",
    milestone: "radial-gradient(ellipse 65% 55% at 50% 50%, rgba(147, 51, 234, 0.16) 0%, rgba(59, 130, 246, 0.09) 35%, rgba(216, 180, 254, 0.03) 65%, transparent 78%)",
    streak: "radial-gradient(ellipse 65% 55% at 50% 50%, rgba(56, 189, 248, 0.14) 0%, rgba(99, 102, 241, 0.075) 35%, rgba(14, 165, 233, 0.025) 65%, transparent 78%)",
  };

  return (
    <div
      ref={theaterRef}
      className={`relative flex h-full w-full flex-col overflow-hidden bg-[#04060a] selection:bg-white/20 ${!isHUDVisible && isFullscreen ? "cursor-none" : ""}`}
      style={{ isolation: "isolate" }}
      onMouseMove={handleMouseMove}
    >
      <ReplayBackground
        theme={spaceTheme}
        progress={engine.progress}
        isFinal={isFinal}
        sceneIndex={sceneIndex}
        isPaused={!engine.isPlaying}
      />

      {/* Top Header */}
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

        {/* Export Menu */}
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
                      <span className="block font-mono text-xs text-zinc-500">Printable developer yearbook</span>
                    </div>
                  </button>
                  <div className="border-t border-white/5 my-1" />
                  <div className="px-3 py-2">
                    <button
                      type="button"
                      onClick={handleExportVideo}
                      disabled={isExporting}
                      className="flex w-full items-center gap-3 rounded-lg px-1 py-1 text-left transition-colors hover:bg-white/5 disabled:opacity-50 disabled:pointer-events-none"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
                        {isExporting ? <Loader2 className="h-4 w-4 animate-spin text-zinc-400" /> : <Film className="h-4 w-4 text-zinc-400" />}
                      </div>
                      <div>
                        <span className="block text-[15px] font-medium text-zinc-200">
                          {isExporting ? "Rendering..." : "Export Video"}
                        </span>
                        <span className="block font-mono text-xs text-zinc-500">
                          {exportProgress || `${exportDuration} cinematic MP4`}
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

      {/* Main Content Area — Centered in Viewport, Sitting Directly on Space Background */}
      <main
        className="relative z-10 flex flex-1 items-center justify-center w-full h-full pb-20 overflow-hidden"
        aria-label="Documentary scene"
        aria-live="polite"
        aria-atomic="true"
      >
        {/* Subtle space-time radial glow behind currently active scene */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden -z-10"
        >
          <motion.div
            key={engine.currentEvent?.id || engine.currentIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{
              opacity: isFinal ? [0.85, 1, 0.85] : [0.7, 0.95, 0.7],
              scale: [1, 1.04, 1],
            }}
            transition={{
              opacity: { duration: 7, repeat: Infinity, ease: "easeInOut" },
              scale: { duration: 9, repeat: Infinity, ease: "easeInOut" },
            }}
            className="h-[520px] w-[750px] sm:h-[640px] sm:w-[900px] md:h-[750px] md:w-[1100px] rounded-full transition-all duration-1000"
            style={{
              background: chapterGlowMap[spaceTheme],
              filter: "blur(65px)",
            }}
          />
        </div>

        <AnimatePresence mode="popLayout">
          {engine.currentEvent && (
            <motion.div
              key={engine.currentEvent.id || engine.currentIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                opacity: { duration: 0.35, ease: "easeInOut" },
              }}
              className="absolute inset-0 flex items-center justify-center w-full h-full"
            >
              <RepoDocumentaryInfo
                event={engine.currentEvent}
                repo={repo}
                isFinal={isFinal}
                commitsCount={commits.length}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Fixed Bottom Control Dock */}
      <section
        role="toolbar"
        aria-label="Playback controls"
        className={`absolute bottom-0 left-0 right-0 z-50 w-full border-t border-white/10 bg-[#06080C]/95 backdrop-blur-sm transition-[opacity,transform] duration-300 ease-in-out ${isHUDVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full pointer-events-none"}`}
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
          {hoverIndex !== null && engine.events[hoverIndex] && (
            <div
              className="pointer-events-none absolute bottom-4 z-40 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/10 bg-black/90 px-3 py-2 font-mono text-xs text-zinc-200 shadow-xl"
              style={{ left: `${hoverX}px` }}
            >
              {engine.events[hoverIndex].title}
            </div>
          )}
          {engine.events.map((ev, i) => {
            const leftPercent = engine.total > 1 ? (i / (engine.total - 1)) * 100 : 0;
            return (
              <div
                key={ev.id || i}
                className="absolute top-0 bottom-0 w-0.5 bg-white/20 z-30 pointer-events-none"
                style={{ left: `${leftPercent}%` }}
              />
            );
          })}
          <div
            className="absolute left-0 top-0 bottom-0 bg-white transition-[width] duration-300 ease-out z-20"
            style={{ width: `${engine.progress}%` }}
          >
            <div className="absolute right-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 translate-x-1/2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-8">
          <div className="flex w-1/3 items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={engine.replay}
              aria-label="Restart documentary from beginning"
              className="h-9 w-9 text-zinc-400 hover:bg-white/5 hover:text-white"
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
              className="h-9 w-9 text-zinc-400 hover:bg-white/5 hover:text-white disabled:opacity-30"
              title="Previous (Left Arrow)"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <button
              type="button"
              onClick={engine.togglePlay}
              aria-label={engine.isPlaying ? "Pause" : "Play"}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-zinc-950 shadow-md transition-all duration-200 hover:scale-105 hover:bg-zinc-100 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              title="Play/Pause (Space)"
            >
              {engine.isPlaying ? (
                <Pause className="h-4 w-4" style={{ fill: "#000000", stroke: "#000000", color: "#000000" }} />
              ) : (
                <Play className="h-4 w-4 ml-0.5" style={{ fill: "#000000", stroke: "#000000", color: "#000000" }} />
              )}
            </button>
            <Button
              variant="ghost"
              size="icon"
              onClick={engine.stepForward}
              disabled={engine.currentIndex >= engine.total - 1}
              aria-label="Next scene"
              className="h-9 w-9 text-zinc-400 hover:bg-white/5 hover:text-white disabled:opacity-30"
              title="Next (Right Arrow)"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex w-1/3 flex-col items-center justify-center">
            <span className="font-mono text-xs uppercase tracking-widest text-zinc-400">
              Scene {engine.currentIndex + 1} of {engine.total}
            </span>
          </div>

          <div className="flex w-1/3 items-center justify-end gap-2">
            <div className="flex items-center rounded-lg border border-white/10 bg-white/5 p-0.5">
              {([1, 2, 5] as const).map((spd) => (
                <button
                  key={spd}
                  onClick={() => engine.setSpeed(spd)}
                  className={`px-2 py-1 font-mono text-[11px] rounded transition-colors ${
                    engine.speed === spd
                      ? "bg-white/20 text-white font-medium"
                      : "text-zinc-400 hover:text-white"
                  }`}
                  title={`${spd}x Speed`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSoundtrack}
              aria-label={soundEnabled ? "Mute audio" : "Unmute audio"}
              className="h-9 w-9 text-zinc-400 hover:bg-white/5 hover:text-white"
              title={soundEnabled ? "Mute" : "Unmute"}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              className="h-9 w-9 text-zinc-400 hover:bg-white/5 hover:text-white"
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
