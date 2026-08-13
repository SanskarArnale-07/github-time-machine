"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ExternalLink,
  FileText,
  FolderGit2,
  Image,
  Instagram,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Share2,
  SlidersHorizontal,
  Volume2,
  VolumeX,
  Download,
  Film,
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
import { cleanCommitMessage } from "@/lib/github/story-generator";

interface TimelineReplayProps {
  commits: GitHubCommit[];
  repos?: GitHubRepo[];
  profile?: GitHubUserProfile | null;
  contributions?: ContributionWeek[];
}

interface ReplayMilestoneCardProps {
  event: ReplayEvent | null;
  accent: string;
  isFinal: boolean;
  commitsReplayed: number;
  repoCount: number;
  yearsSpan: number;
  chapterIndex: number;
  chapterName: string;
  topLanguage?: string;
  mostActiveMonth?: string;
}

function ExportDialog({ isOpen, onClose, onCopyLink }: { isOpen: boolean, onClose: () => void, onCopyLink: () => void }) {
  const [processing, setProcessing] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0A0A0A] p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-zinc-500 hover:text-white">
           ✕
        </button>
        <h3 className="font-sans font-semibold tracking-tight text-2xl text-white mb-2">Export Documentary</h3>
        <p className="text-sm text-zinc-400 mb-6">Choose a format to export your GitHub documentary.</p>
        
        {processing ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent mb-4" />
            <p className="text-white font-mono text-sm uppercase tracking-widest">{processing}</p>
            <p className="text-zinc-500 text-xs mt-2">Connecting to rendering server...</p>
            <p className="text-zinc-600 text-[10px] mt-4 max-w-[200px] leading-relaxed">
              (Note: Client-side video encoding is mocked for this sprint. A backend queue like Remotion is required for real video exports.)
            </p>
            <Button onClick={() => setProcessing(null)} variant="outline" className="mt-6 text-xs border-white/10 text-zinc-400 hover:text-white hover:bg-white/5">Cancel</Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
             <Button onClick={() => setProcessing("Rendering MP4 (1080p)...")} className="flex flex-col h-auto py-4 items-center justify-center gap-2 bg-black border border-white/10 hover:border-white/20 hover:bg-white/5 text-white transition-all">
               <Film className="h-6 w-6 text-white" />
               <span className="text-xs">MP4 Video</span>
             </Button>
             <Button onClick={() => setProcessing("Rendering GIF...")} className="flex flex-col h-auto py-4 items-center justify-center gap-2 bg-black border border-white/10 hover:border-white/20 hover:bg-white/5 text-white transition-all">
               <Image className="h-6 w-6 text-white" />
               <span className="text-xs">GIF Preview</span>
             </Button>
             <Button onClick={() => setProcessing("Rendering Vertical (9:16)...")} className="flex flex-col h-auto py-4 items-center justify-center gap-2 bg-black border border-white/10 hover:border-white/20 hover:bg-white/5 text-white transition-all">
               <Instagram className="h-6 w-6 text-white" />
               <span className="text-xs">Vertical Social</span>
             </Button>
             <Button onClick={onCopyLink} className="flex flex-col h-auto py-4 items-center justify-center gap-2 bg-black border border-white/10 hover:border-white/20 hover:bg-white/5 text-white transition-all">
               <Share2 className="h-6 w-6 text-white" />
               <span className="text-xs">Shareable Link</span>
             </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function ReplayMilestoneCard({
  event,
  accent,
  isFinal,
  commitsReplayed,
  repoCount,
  yearsSpan,
  chapterIndex,
  chapterName,
  topLanguage,
  mostActiveMonth,
}: ReplayMilestoneCardProps) {
  if (isFinal) {
    return (
      <motion.article 
        className="flex h-full w-full flex-col items-center justify-center text-center px-6"
        initial="initial" animate="animate" exit="exit"
      >
        <motion.span 
          variants={{
            initial: { opacity: 0, y: 10 },
            animate: { opacity: 1, y: 0, transition: { duration: 0.8 } },
            exit: { opacity: 0, transition: { duration: 0.3 } }
          }}
          className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500"
        >
          Documentary finale
        </motion.span>
        <motion.h2 
          variants={{
            initial: { opacity: 0, y: 10 },
            animate: { opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.15 } },
            exit: { opacity: 0, transition: { duration: 0.5, delay: 0.2 } }
          }}
          className="mt-4 font-sans font-semibold tracking-tight text-4xl text-white sm:text-5xl md:text-6xl drop-shadow-2xl"
        >
          This is how a developer is built.
        </motion.h2>
        <motion.div 
          variants={{
            initial: { opacity: 0, scale: 0.95 },
            animate: { opacity: 1, scale: 1, transition: { duration: 0.8, delay: 0.4 } },
            exit: { opacity: 0, transition: { duration: 0.3 } }
          }}
          className="mt-12 grid grid-cols-2 md:grid-cols-5 gap-6 text-left max-w-4xl mx-auto border-t border-white/10 pt-8"
        >
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500">Contributions</span>
            <span className="font-mono text-2xl text-white">{commitsReplayed}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500">Repositories</span>
            <span className="font-mono text-2xl text-white">{repoCount}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500">Active Years</span>
            <span className="font-mono text-2xl text-white">{yearsSpan}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500">Primary Language</span>
            <span className="font-mono text-xl text-white pt-1 truncate">{topLanguage || "TypeScript"}</span>
          </div>
          <div className="flex flex-col gap-1 col-span-2 md:col-span-1">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500">Most Active</span>
            <span className="font-mono text-xl text-white pt-1">{mostActiveMonth || "October"}</span>
          </div>
        </motion.div>
        
        <motion.p
          variants={{
            initial: { opacity: 0 },
            animate: { opacity: 1, transition: { duration: 1.5, delay: 2.5 } },
            exit: { opacity: 0 }
          }}
          className="mt-24 font-sans text-2xl text-zinc-600"
        >
          To be continued...
        </motion.p>
      </motion.article>
    );
  }

  const isRepository = event?.type === "repo_created";
  const isYearMarker = event?.type === "year_milestone";
  const isMonthSummary = event?.type === "month_summary";
  const formattedDate = event?.date
    ? new Date(event.date).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "";
  const isCommit = !!event?.commit && !isRepository && !isYearMarker && !isMonthSummary;

  const title = isRepository
    ? event?.repoName
    : isYearMarker || isMonthSummary
      ? event?.title
      : isCommit && event?.commit?.message
        ? cleanCommitMessage(event.commit.message)
        : event?.title || event?.commit?.repoName || event?.repoName || "A meaningful step forward";
  
  let description = event?.description ||
      event?.impactDescription ||
      (isCommit ? event?.title : undefined) ||
      "Another line in the story takes shape.";
      
  if (isRepository) description = event?.description || "A new repository entered the archive.";
  if (isMonthSummary && event?.monthlySummary) {
    description = event.monthlySummary.whatChangedNarrative;
  }

  return (
    <motion.article 
      className="flex h-full w-full flex-col items-center justify-center text-center px-4 sm:px-8"
      initial="initial" animate="animate" exit="exit"
    >
      {/* Top Metadata */}
      <motion.div 
        variants={{
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0, transition: { duration: 0.8 } },
          exit: { opacity: 0, transition: { duration: 0.3 } }
        }}
        className="flex flex-col items-center gap-3 mb-8"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          Chapter {chapterIndex + 1}
        </span>
        <span className="font-mono text-sm tracking-widest text-zinc-400">{formattedDate}</span>
      </motion.div>

      {/* Center Narrative */}
      <div className="max-w-5xl">
        <motion.h2 
          variants={{
            initial: { opacity: 0, y: 10 },
            animate: { opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.15 } },
            exit: { opacity: 0, transition: { duration: 0.5, delay: 0.2 } }
          }}
          className="font-sans font-semibold tracking-tight text-4xl leading-tight text-white sm:text-5xl md:text-6xl lg:text-7xl drop-shadow-2xl"
        >
          {title}
        </motion.h2>
        <motion.p 
          variants={{
            initial: { opacity: 0, y: 10 },
            animate: { opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.3 } },
            exit: { opacity: 0, transition: { duration: 0.3 } }
          }}
          className="mx-auto mt-6 max-w-3xl text-xl sm:text-2xl font-light leading-relaxed text-zinc-300 drop-shadow-lg text-balance"
        >
          {description}
        </motion.p>
      </div>

      {/* Bottom Stats / Documentary Footer */}
      <motion.div 
        variants={{
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.45 } },
          exit: { opacity: 0, transition: { duration: 0.3 } }
        }}
        className="mt-12 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 font-mono text-xs uppercase tracking-widest text-muted/60"
      >
        {isMonthSummary && event?.monthlySummary ? (
          <>
            <span>{event.monthlySummary.totalCommits} Commits</span>
            <span>·</span>
            <span>{event.monthlySummary.primaryFocus}</span>
            <span>·</span>
            <span>{event.monthlySummary.topLanguage}</span>
          </>
        ) : (
          <>
            <span>{event?.repoName || "Archive"}</span>
            {event?.language && (
              <>
                <span>·</span>
                <span>{event.language}</span>
              </>
            )}
            <span>·</span>
            <span>{isRepository ? "Repository Founded" : isYearMarker ? "New Chapter" : event?.commit ? "Commit" : "Milestone"}</span>
            {event?.repoUrl && (
              <>
                <span>·</span>
                <a
                  href={event.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-brass-light/70 transition-colors hover:text-ivory hover:underline"
                >
                  View Source
                </a>
              </>
            )}
          </>
        )}
      </motion.div>
    </motion.article>
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
  const previousChapterIdRef = useRef<string | null>(null);

  const [volume, setVolume] = useState(0.22);

  // HUD Auto-hide state
  const [isHUDVisible, setIsHUDVisible] = useState(true);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastMousePos = useRef({ x: 0, y: 0 });

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
        const savedVol = localStorage.getItem("github_time_machine_volume");
        if (savedVol) {
          const v = parseFloat(savedVol);
          setVolume(v);
          ambientSoundtrack.setVolume(v);
        }
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

  const [showExport, setShowExport] = useState(false);

  const copyReplayLink = useCallback(async () => {
    const result = await copyShareableReplayLink(username, engine.currentIndex);
    if (!result.success) return;

    setCopiedLink(true);
    window.setTimeout(() => setCopiedLink(false), 2200);
  }, [engine.currentIndex, username]);

  const handleCopyFromExport = useCallback(() => {
    copyReplayLink();
    setShowExport(false);
  }, [copyReplayLink]);

  useEffect(() => {
    if (!engine.currentChapter) return;
    
    if (previousChapterIdRef.current !== engine.currentChapter.id) {
      if (soundEnabled && previousChapterIdRef.current !== null) {
        ambientSoundtrack.triggerProjectorClick();
      }
      
      previousChapterIdRef.current = engine.currentChapter.id;
    }
  }, [engine.currentChapter, soundEnabled]);

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

  const topLanguage = repos.length ? Object.entries(repos.reduce((acc, r) => {
    if (r.language) acc[r.language] = (acc[r.language] || 0) + 1;
    return acc;
  }, {} as Record<string, number>)).sort((a,b) => b[1] - a[1])[0]?.[0] || "TypeScript" : "TypeScript";

  const mostActiveMonth = engine.events.filter(e => e.type === "month_summary").sort((a,b) => (b.monthlySummary?.totalCommits || 0) - (a.monthlySummary?.totalCommits || 0))[0]?.monthName || "October";

  return (
    <div ref={theaterRef} className="replay-theater" onMouseMove={handleMouseMove}>
      {/* Persistent Chapter HUD */}
      <AnimatePresence>
        {engine.currentChapter && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`absolute bottom-24 right-6 sm:bottom-28 sm:right-8 z-30 flex flex-col items-end text-right transition-all duration-300 ease-in-out ${isHUDVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">
              Chapter {chapterIndex + 1}
            </span>
            <span className="mt-1 font-sans font-semibold tracking-tight text-lg text-white sm:text-xl">
              {engine.currentChapter.name}
            </span>
            <span className="mt-1 font-mono text-[10px] uppercase tracking-widest text-zinc-400">
              {engine.currentMonthName} {engine.currentYear}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {!isFullscreen && (
        <div className="replay-fullscreen-background">
          <ReplayBackground />
        </div>
      )}
      <div className={`replay-safe-frame absolute inset-0 flex flex-col items-center justify-center overflow-hidden ${isFullscreen ? 'bg-black' : ''} ${!isHUDVisible && isFullscreen ? 'cursor-none' : ''}`}>
        <header className={`absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 sm:px-8 pt-4 pb-0 transition-all duration-300 ease-in-out ${isHUDVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"} ${isFullscreen ? 'hidden' : ''}`}>
          <a
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/60 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-400 backdrop-blur-md transition-colors hover:border-white/20 hover:text-white"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Exit</span>
          </a>

          <div className="flex items-center gap-2 relative">
            <button
              type="button"
              onClick={() => setShowExport(true)}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 font-mono text-[10px] uppercase tracking-[0.1em] text-white backdrop-blur-md transition-colors hover:bg-white/10"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button
              type="button"
              onClick={() => setShowControls(!showControls)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/60 text-zinc-400 backdrop-blur-md transition-colors hover:border-white/20 hover:text-white"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
            </button>
            
            {showControls && (
              <div className="absolute right-0 top-12 w-64 rounded-xl border border-[#3A332B] bg-[#0B0A09]/95 p-4 shadow-2xl backdrop-blur-xl">
                <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Controls</p>
                <div className="grid grid-cols-2 gap-2">
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
                    <FileText className="mr-1.5 h-3 w-3 text-white" />
                    Chronicle
                  </Button>
                </div>
                <div className="mt-4 border-t border-white/10 pt-4">
                  <div className="flex items-center justify-between font-mono text-[10px] text-zinc-400 mb-2">
                    <span>Volume</span>
                    <span>{Math.round(volume * 100)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.01" 
                    value={volume}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      setVolume(v);
                      ambientSoundtrack.setVolume(v);
                      try { localStorage.setItem("github_time_machine_volume", v.toString()); } catch {}
                    }}
                    className="w-full accent-white"
                  />
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="relative z-10 flex w-full flex-1 items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={engine.currentEvent?.id || engine.currentIndex}
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
              animate={{ opacity: 1, scale: 1.0, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(4px)" }}
              transition={{ 
                opacity: { duration: 0.4, ease: "easeInOut" },
                filter: { duration: 0.4, ease: "easeInOut" },
                scale: { duration: 0.6, ease: "easeOut" } 
              }}
            >
              <ReplayMilestoneCard
                event={engine.currentEvent}
                accent={engine.eraColor.accent}
                isFinal={isFinal}
                commitsReplayed={engine.stats.commitsReplayed}
                repoCount={repos.length}
                yearsSpan={yearsSpan}
                chapterIndex={chapterIndex}
                chapterName={engine.currentChapter?.name || "The Developer Journey"}
                topLanguage={topLanguage}
                mostActiveMonth={mostActiveMonth}
              />
            </motion.div>
          </AnimatePresence>
        </main>

        <section className={`absolute bottom-0 left-0 right-0 z-50 w-full border-t border-white/10 bg-black/80 backdrop-blur-xl transition-all duration-300 ease-in-out ${isHUDVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full pointer-events-none"}`}>
          <div className="group relative h-1.5 w-full bg-zinc-900 cursor-pointer" onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            engine.seek(Math.floor(percentage * engine.total));
          }}>
            {/* Chapter markers */}
            {engine.chapters.map((chapter, i) => {
              const leftPercent = (chapter.startEventIndex / Math.max(1, engine.total)) * 100;
              return (
                <div 
                  key={chapter.id}
                  className="group/marker absolute top-0 bottom-0 w-px bg-white/20 z-30 hover:bg-white hover:w-0.5 transition-all"
                  style={{ left: `${leftPercent}%` }}
                >
                  <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 transition-opacity group-hover/marker:opacity-100 bg-zinc-900 border border-white/10 px-2 py-1 rounded text-[10px] font-mono whitespace-nowrap text-white z-50 shadow-xl">
                    Chapter {i + 1}: {chapter.name}
                  </div>
                </div>
              );
            })}
            
            {/* Month markers */}
            {engine.events.map((ev, i) => {
              if (ev.type !== "month_summary") return null;
              const leftPercent = (i / Math.max(1, engine.total)) * 100;
              return (
                <div 
                  key={ev.id}
                  className="absolute top-1/2 -translate-y-1/2 h-1 w-px bg-white/10 z-10"
                  style={{ left: `${leftPercent}%` }}
                />
              );
            })}
            
            {/* Progress fill */}
            <div className="absolute left-0 top-0 bottom-0 bg-white transition-[width] duration-300 ease-out z-20" style={{ width: `${engine.progress}%` }}>
              {/* Glowing playhead */}
              <div className="absolute right-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 translate-x-1/2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
            </div>
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
                {engine.currentMonthName} {engine.currentYear}
              </span>
              <span className="mt-1 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                {engine.stats.commitsReplayed} Milestones Replayed
              </span>
            </div>

            <div className="flex w-1/3 items-center justify-end gap-1">
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

        <ExportDialog isOpen={showExport} onClose={() => setShowExport(false)} onCopyLink={handleCopyFromExport} />
      </div>
    </div>
  );
}
