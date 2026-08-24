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
import {
  copyRepoDocumentaryLink,
  downloadRepoDocumentaryPDF,
  exportRepoDocumentaryVideo,
} from "@/lib/github/export-utils";
import { Button } from "@/components/ui/button";
import { ReplayBackground } from "@/components/replay/replay-background";

interface RepoDocumentaryReplayProps {
  commits: GitHubCommit[];
  repo: GitHubRepo;
}

function RepoDocumentaryCard({ event }: { event: ReplayEvent }) {
  if (!event) return null;

  return (
    <div className="flex w-full flex-col items-center justify-center text-center px-4 sm:px-8 max-w-4xl mx-auto">
      {/* Date */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="mb-6 font-mono text-sm tracking-widest text-zinc-400"
      >
        {new Date(event.date).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
      </motion.div>

      {/* Chapter Title */}
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="font-display font-semibold tracking-tight text-4xl leading-tight sm:text-5xl md:text-6xl drop-shadow-2xl"
        style={{ color: "#D4A853" }}
      >
        {event.title}
      </motion.h2>

      {/* Narrative Paragraph */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="mx-auto mt-8 max-w-2xl text-lg sm:text-xl font-light leading-relaxed text-zinc-300 drop-shadow-lg text-balance"
      >
        {event.description}
      </motion.p>

      {/* Milestone Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="mt-16 w-full max-w-lg rounded-2xl border border-white/10 bg-[#0A0A0A]/50 p-6 shadow-2xl backdrop-blur-sm text-left"
      >
        <div className="flex items-start justify-between border-b border-white/5 pb-4 mb-4">
          <div>
            <h3 className="font-sans text-xl font-semibold text-white">{event.repoName}</h3>
            <div className="mt-2 flex items-center gap-3 font-mono text-xs text-zinc-500">
              {event.language && (
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: event.languageColor || "#8b949e" }}
                  />
                  {event.language}
                </div>
              )}
              <span>·</span>
              <span>{new Date(event.date).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-zinc-300">
            {event.impactBadge}
          </div>
        </div>
        
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 block mb-1">Highlighted Commit</span>
          <p className="font-mono text-sm text-zinc-300 break-words line-clamp-2">
            {event.commit?.message || "Repository created."}
          </p>
        </div>
      </motion.div>
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

  return (
    <div ref={theaterRef} className={`relative flex h-full w-full flex-col overflow-hidden bg-black selection:bg-white/20 ${!isHUDVisible && isFullscreen ? 'cursor-none' : ''}`} onMouseMove={handleMouseMove}>
      

      <header className={`absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-6 transition-all duration-300 ease-in-out ${isHUDVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"} ${isFullscreen ? 'hidden' : ''}`}>
        <a
          href="/dashboard#repos"
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/60 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-400 backdrop-blur-md transition-colors hover:border-white/20 hover:text-white"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span>Back to Archive</span>
        </a>
        {/* Export Menu — Top Right */}
        <div ref={exportRef} className="relative">
          <button
            type="button"
            onClick={() => setIsExportOpen((prev) => !prev)}
            className={`inline-flex items-center gap-2 rounded-full border bg-black/60 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.15em] backdrop-blur-md transition-colors ${
              isExportOpen
                ? "border-white/20 text-white"
                : "border-white/10 text-zinc-400 hover:border-white/20 hover:text-white"
            }`}
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
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">Export</span>
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
                      <span className="block text-sm font-medium text-zinc-200">
                        {linkCopied ? "Link Copied!" : "Copy Link"}
                      </span>
                      <span className="block font-mono text-[10px] text-zinc-500">Share this documentary</span>
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
                      <span className="block text-sm font-medium text-zinc-200">Export PDF</span>
                      <span className="block font-mono text-[10px] text-zinc-500">Printable documentary report</span>
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
                        <span className="block text-sm font-medium text-zinc-200">
                          {isExporting ? "Rendering..." : "Export Video"}
                        </span>
                        <span className="block font-mono text-[10px] text-zinc-500">
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
                            className={`px-2 py-1 text-[10px] font-mono rounded uppercase transition-colors ${
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
      <main className="relative z-10 flex flex-1 items-center justify-center w-full h-full">
        <AnimatePresence mode="popLayout">
          {engine.currentEvent && (
            <motion.div
              key={engine.currentEvent.id}
              initial={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
              animate={{ opacity: 1, scale: 1.0, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(4px)", transition: { duration: 0.6 } }}
              transition={{ 
                opacity: { duration: 1.2, ease: "easeInOut" },
                filter: { duration: 1.2, ease: "easeInOut" },
                scale: { duration: 1.5, ease: "easeOut" } 
              }}
              className="absolute inset-0 flex items-center justify-center w-full h-full"
            >
              <RepoDocumentaryCard event={engine.currentEvent} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Fixed Bottom Control Dock */}
      <section className={`absolute bottom-0 left-0 right-0 z-50 w-full border-t border-white/10 bg-black/80 backdrop-blur-xl transition-all duration-300 ease-in-out ${isHUDVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full pointer-events-none"}`}>
        <div
          ref={scrubTrackRef}
          className="group relative h-1.5 w-full cursor-pointer bg-zinc-900 hover:h-2.5 transition-[height] duration-150"
          onMouseDown={(e) => {
            setIsScrubbing(true);
            engine.seek(indexFromClientX(e.clientX));
          }}
          onMouseMove={handleTrackHover}
          onMouseLeave={() => !isScrubbing && setHoverIndex(null)}
        >
          {/* Hover/scrub tooltip */}
          {hoverIndex !== null && engine.events[hoverIndex] && (
            <div
              className="pointer-events-none absolute bottom-4 z-40 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/10 bg-black/90 px-2.5 py-1.5 font-mono text-[10px] text-zinc-200 shadow-xl"
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
          {/* Progress fill */}
          <div className="absolute left-0 top-0 bottom-0 bg-white transition-[width] duration-300 ease-out z-20" style={{ width: `${engine.progress}%` }} />
          {/* Scrub handle */}
          <div
            className="pointer-events-none absolute top-1/2 z-30 h-3 w-3 -translate-y-1/2 -translate-x-1/2 rounded-full bg-white opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100"
            style={{ left: `${engine.progress}%`, opacity: isScrubbing ? 1 : undefined }}
          />
        </div>
        
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-8">
          <div className="flex w-1/3 items-center gap-2">
            <Button variant="ghost" size="icon" onClick={engine.replay} className="h-10 w-10 text-muted hover:bg-white/5 hover:text-ivory" title="Replay (R)">
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={engine.stepBack} disabled={engine.currentIndex === 0} className="h-10 w-10 text-muted hover:bg-white/5 hover:text-ivory" title="Previous">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              onClick={engine.togglePlay}
              className="group relative flex h-12 w-12 items-center justify-center rounded-full bg-white text-black shadow-md transition-all duration-200 hover:scale-105 hover:bg-zinc-200 active:scale-95"
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
            <Button variant="ghost" size="icon" onClick={engine.stepForward} disabled={isFinal} className="h-10 w-10 text-zinc-400 hover:bg-white/5 hover:text-white" title="Next">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex w-1/3 flex-col items-center justify-center text-center">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-white">
              {engine.currentEvent?.chapterName || "Documentary"}
            </span>
            <span className="mt-1 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
              Scene {engine.currentIndex + 1} of {engine.total}
            </span>
          </div>

          <div className="flex w-1/3 items-center justify-end gap-1">
            {/* Desktop: full speed selector */}
            <div className="mr-4 hidden items-center gap-1 rounded-md border border-white/10 bg-black/50 p-1 sm:flex">
              {([1, 2, 5] as const).map((speed) => (
                <button
                  key={speed}
                  onClick={() => engine.setSpeed(speed)}
                  className={`rounded px-2 py-1 font-mono text-[10px] font-semibold transition-colors ${
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
              className="mr-1 inline-flex h-10 min-w-10 items-center justify-center rounded-md border border-white/10 bg-black/50 px-2 font-mono text-[10px] font-semibold text-zinc-300 transition-colors hover:bg-white/10 hover:text-white sm:hidden"
              title="Playback speed"
            >
              {engine.speed}×
            </button>
            <button
              type="button"
              onClick={toggleSoundtrack}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-md border backdrop-blur-md transition-colors mr-1 sm:mr-2 ${
                soundEnabled
                  ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
                  : "border-transparent text-zinc-500 hover:bg-white/5 hover:text-white"
              }`}
              title="Mute/Unmute"
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
            <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="h-10 w-10 text-muted hover:bg-white/5 hover:text-ivory" title="Fullscreen (F)">
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
