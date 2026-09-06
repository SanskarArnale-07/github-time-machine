"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  ExternalLink,
  FileText,
  Film,
  FolderGit2,
  Loader2,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Share2,
  SlidersHorizontal,
  Volume2,
  VolumeX,
  X,
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
// export-utils is large (59 KB) and only needed on user action — loaded on demand
import { Button } from "@/components/ui/button";
import { ReplayBackground } from "@/components/replay/replay-background";
import { SpaceTheme } from "@/components/space-background";
import { cleanCommitMessage } from "@/lib/github/story-generator";

// ─── Theme Colors ─────────────────────────────────────────────────────────────
const IVORY_DARK = "#F5F0E8";
const BG_PANEL = "#0B0A09";
const BORDER_PANEL = "#3A332B";

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
      <motion.section
        className="flex h-full w-full flex-col items-center justify-center text-center px-6"
        initial="initial" animate="animate" exit="exit"
      >
        <motion.span 
          variants={{
            initial: { opacity: 0, y: 10 },
            animate: { opacity: 1, y: 0, transition: { duration: 0.8 } },
            exit: { opacity: 0, transition: { duration: 0.3 } }
          }}
          className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-400"
        >
          Documentary finale
        </motion.span>
        <motion.h2 
          variants={{
            initial: { opacity: 0, y: 10 },
            animate: { opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.15 } },
            exit: { opacity: 0, transition: { duration: 0.5, delay: 0.2 } }
          }}
          className="mt-4 font-display font-bold tracking-tight text-4xl sm:text-5xl md:text-6xl drop-shadow-2xl"
          style={{ color: IVORY_DARK }}
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
            <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">Contributions</span>
            <span className="font-mono text-2xl font-bold text-white">{commitsReplayed}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">Repositories</span>
            <span className="font-mono text-2xl font-bold text-white">{repoCount}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">Active Years</span>
            <span className="font-mono text-2xl font-bold text-white">{yearsSpan}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">Primary Language</span>
            <span className="font-mono text-xl font-bold text-white pt-1 truncate">{topLanguage || "N/A"}</span>
          </div>
          <div className="flex flex-col gap-1 col-span-2 md:col-span-1">
            <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">Most Active</span>
            <span className="font-mono text-xl font-bold text-white pt-1">{mostActiveMonth || "Unknown"}</span>
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
      </motion.section>
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
  
  let description: string | undefined;

  if (isMonthSummary && event?.monthlySummary) {
    description = event.monthlySummary.whatChangedNarrative;
  } else if (isRepository) {
    description = event?.description || "A new repository entered the archive.";
  } else {
    // Commits, year milestones, and other events: show cinematic narrative
    description =
      event?.description ||
      event?.impactDescription ||
      (isCommit ? event?.title : undefined) ||
      "Another line in the story takes shape.";
  }

  return (
    <motion.section
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
        <span className="font-mono text-xs uppercase tracking-wider text-zinc-400 font-semibold">
          Chapter {chapterIndex + 1}
        </span>
        <span className="font-mono text-sm tracking-wide text-zinc-300 font-medium">{formattedDate}</span>
      </motion.div>

      {/* Center Narrative */}
      <div className="w-full max-w-4xl mx-auto px-4">
        <motion.h2
          variants={{
            initial: { opacity: 0, y: 10 },
            animate: { opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.15 } },
            exit: { opacity: 0, transition: { duration: 0.5, delay: 0.2 } }
          }}
          className="font-display font-bold tracking-tight leading-tight drop-shadow-2xl text-balance mx-auto"
          style={{
            color: IVORY_DARK,
            fontSize: "clamp(2rem, 3.2vw + 0.5rem, 4rem)",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            maxWidth: "min(100%, 780px)",
            wordBreak: "break-word",
            overflowWrap: "break-word",
          }}
        >
          {title}
        </motion.h2>
        {description && (
          <motion.p
            variants={{
              initial: { opacity: 0, y: 10 },
              animate: { opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.3 } },
              exit: { opacity: 0, transition: { duration: 0.3 } }
            }}
            className="mx-auto mt-6 max-w-2xl text-base sm:text-xl font-normal leading-relaxed text-zinc-300 drop-shadow-lg text-balance"
          >
            {description}
          </motion.p>
        )}
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
    </motion.section>
  );
}

export function TimelineReplay({ commits, repos = [], profile = null, contributions = [] }: TimelineReplayProps) {
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
  
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  const volumeSliderRef = useRef<HTMLInputElement>(null);

  const [volume, setVolume] = useState(0.22);

  // Export state
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportProgress, setExportProgress] = useState<string | null>(null);
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

  const handleExportPDF = useCallback(async () => {
    const { downloadReplaySummaryPDF } = await import("@/lib/github/export-utils");
    downloadReplaySummaryPDF(profile, engine.chapters, commits, repos, contributions);
    setIsExportOpen(false);
  }, [profile, engine.chapters, commits, repos, contributions]);

  const handleExportVideo = useCallback(() => {
    setIsExporting(true);
    setExportProgress("Initializing...");
    
    // Fire and forget - runs in background with its own global toast
    import("@/lib/github/export-utils").then(({ exportReplayVideoFormat }) => {
      exportReplayVideoFormat(
        `${username}'s Developer Documentary`,
        "landscape",
        engine.events,
        engine.chapters,
        (msg) => setExportProgress(msg),
        soundEnabled
      ).finally(() => {
        setIsExporting(false);
        setExportProgress(null);
      });
    });
    
    // Immediately close the export modal so they aren't trapped
    setIsExportOpen(false);
  }, [username, engine.events, engine.chapters, soundEnabled]);

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
        // Reflect the remembered preference in the UI immediately, but don't
        // call ambientSoundtrack.start() here — browsers block AudioContext
        // from actually producing sound unless resume() happens inside a
        // genuine user gesture (click/keydown/tap). Starting it from a mount
        // effect leaves the toggle showing "on" while nothing plays. Instead,
        // wait for the first real interaction anywhere on the page and start
        // it then, which does count as a valid gesture.
        setSoundEnabled(true);
        const savedVol = localStorage.getItem("github_time_machine_volume");
        if (savedVol) {
          const v = parseFloat(savedVol);
          setVolume(v);
          ambientSoundtrack.setVolume(v);
        }

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
        if (showControls) {
          setShowControls(false);
          settingsButtonRef.current?.focus();
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggleFullscreen, showControls]);

  useEffect(() => {
    if (showControls && volumeSliderRef.current) {
      volumeSliderRef.current.focus();
    }
  }, [showControls]);

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
    const { copyShareableReplayLink } = await import("@/lib/github/export-utils");
    const result = await copyShareableReplayLink(username, engine.currentIndex);
    if (result.success) {
      setCopiedLink(true);
      window.setTimeout(() => setCopiedLink(false), 2200);
      return;
    }
    // Clipboard write failed silently (insecure context, denied permission,
    // some in-app browsers) — fall back to a visible prompt so the link is
    // never just lost with no way to grab it.
    window.prompt("Copy this link:", result.url);
  }, [engine.currentIndex, username]);

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
  }, {} as Record<string, number>)).sort((a,b) => b[1] - a[1])[0]?.[0] || "N/A" : "N/A";

  const mostActiveMonth = engine.events.filter(e => e.type === "month_summary").sort((a,b) => (b.monthlySummary?.totalCommits || 0) - (a.monthlySummary?.totalCommits || 0))[0]?.monthName || 
    (commits.length > 0 ? new Date(commits[0].date).toLocaleString("default", { month: "short" }) : "N/A");

  // Derive subtle space theme variation from the current chapter / event
  const currentEvent = engine.currentEvent;
  const currentChapter = engine.currentChapter;
  const currentTitle = (currentEvent?.title || "").toLowerCase();
  const currentMsg = (currentEvent?.commit?.message || "").toLowerCase();

  let spaceTheme: SpaceTheme = "default";
  if (isFinal || currentEvent?.type === "year_milestone" || currentEvent?.type === "month_summary") {
    spaceTheme = "milestone";
  } else if (currentEvent?.type === "major_streak" || (currentEvent?.streakCount && currentEvent.streakCount > 5)) {
    spaceTheme = "streak";
  } else if (currentEvent?.type === "repo_created" || chapterIndex === 0) {
    spaceTheme = "beginning";
  } else if (
    currentTitle.includes("perf") ||
    currentTitle.includes("optimiz") ||
    currentTitle.includes("speed") ||
    currentTitle.includes("fast") ||
    currentTitle.includes("cache") ||
    currentMsg.includes("perf") ||
    currentMsg.includes("optimiz")
  ) {
    spaceTheme = "performance";
  } else if (
    currentTitle.includes("refactor") ||
    currentTitle.includes("clean") ||
    currentTitle.includes("simplify") ||
    currentTitle.includes("rewrite") ||
    currentMsg.includes("refactor")
  ) {
    spaceTheme = "refactor";
  } else if (
    currentTitle.includes("architect") ||
    currentTitle.includes("initial") ||
    currentTitle.includes("core") ||
    currentTitle.includes("schema") ||
    currentChapter?.name.toLowerCase().includes("foundation") ||
    currentChapter?.name.toLowerCase().includes("architecture")
  ) {
    spaceTheme = "architecture";
  }

  const chapterGlowMap: Record<SpaceTheme, string> = {
    default: "radial-gradient(ellipse 65% 55% at 50% 50%, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.065) 35%, rgba(56, 189, 248, 0.02) 65%, transparent 78%)",
    architecture: "radial-gradient(ellipse 65% 55% at 50% 50%, rgba(79, 70, 229, 0.14) 0%, rgba(109, 40, 217, 0.08) 35%, rgba(30, 27, 75, 0.03) 65%, transparent 78%)",
    performance: "radial-gradient(ellipse 65% 55% at 50% 50%, rgba(6, 182, 212, 0.13) 0%, rgba(59, 130, 246, 0.07) 35%, rgba(14, 116, 144, 0.025) 65%, transparent 78%)",
    beginning: "radial-gradient(ellipse 65% 55% at 50% 50%, rgba(129, 140, 248, 0.15) 0%, rgba(168, 85, 247, 0.08) 35%, rgba(99, 102, 241, 0.03) 65%, transparent 78%)",
    refactor: "radial-gradient(ellipse 65% 55% at 50% 50%, rgba(139, 92, 246, 0.11) 0%, rgba(76, 29, 149, 0.06) 35%, rgba(55, 48, 163, 0.02) 65%, transparent 78%)",
    milestone: "radial-gradient(ellipse 65% 55% at 50% 50%, rgba(147, 51, 234, 0.16) 0%, rgba(59, 130, 246, 0.09) 35%, rgba(216, 180, 254, 0.03) 65%, transparent 78%)",
    streak: "radial-gradient(ellipse 65% 55% at 50% 50%, rgba(56, 189, 248, 0.14) 0%, rgba(99, 102, 241, 0.075) 35%, rgba(14, 165, 233, 0.025) 65%, transparent 78%)",
  };

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
            className={`absolute right-6 sm:right-8 z-30 flex flex-col items-end text-right transition-all duration-300 ease-in-out ${isHUDVisible ? "bottom-[calc(theme(spacing.24)+env(safe-area-inset-bottom))] sm:bottom-28 opacity-100" : "bottom-6 sm:bottom-8 opacity-70 pointer-events-none"}`}
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

      <div className="replay-fullscreen-background">
        <ReplayBackground
          theme={spaceTheme}
          progress={engine.progress}
          chapterIndex={chapterIndex}
          isFinal={isFinal}
          isPaused={!engine.isPlaying}
        />
      </div>
      <div className={`replay-safe-frame absolute inset-0 flex flex-col items-center justify-center overflow-hidden bg-transparent ${!isHUDVisible && isFullscreen ? 'cursor-none' : ''}`}>
        <header className={`absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 sm:px-8 pt-4 pb-0 transition-all duration-300 ease-in-out ${isHUDVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"} ${isFullscreen ? 'hidden' : ''}`}>
          <a
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/60 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-400 backdrop-blur-md transition-colors hover:border-white/20 hover:text-white"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Exit</span>
          </a>

          <div className="flex items-center gap-2 relative">
            {/* Export Button */}
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
                        onClick={() => {
                          copyReplayLink();
                          setIsExportOpen(false);
                        }}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-white/5"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
                          {copiedLink ? <Check className="h-4 w-4 text-emerald-400" /> : <Share2 className="h-4 w-4 text-zinc-400" />}
                        </div>
                        <div>
                          <span className="block text-sm font-medium text-zinc-200">
                            {copiedLink ? "Link Copied!" : "Copy Link"}
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
                          <span className="block font-mono text-[10px] text-zinc-500">Printable developer yearbook</span>
                        </div>
                      </button>
                      {/* Export Video */}
                      <button
                        type="button"
                        onClick={handleExportVideo}
                        disabled={isExporting}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-white/5 disabled:opacity-50 disabled:pointer-events-none"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
                          {isExporting ? <Loader2 className="h-4 w-4 animate-spin text-zinc-400" /> : <Film className="h-4 w-4 text-zinc-400" />}
                        </div>
                        <div>
                          <span className="block text-sm font-medium text-zinc-200">
                            {isExporting ? "Rendering..." : "Export Video"}
                          </span>
                          <span className="block font-mono text-[10px] text-zinc-500">
                            {exportProgress || "1080p cinematic MP4"}
                          </span>
                        </div>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button
              ref={settingsButtonRef}
              type="button"
              onClick={() => setShowControls(!showControls)}
              aria-label="Open playback settings"
              aria-expanded={showControls}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/60 text-zinc-400 backdrop-blur-md transition-colors hover:border-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
            </button>
            
            {showControls && (
              <div 
                role="dialog"
                aria-modal="true"
                aria-label="Playback settings"
                className={`absolute right-0 top-12 w-64 rounded-xl border border-[${BORDER_PANEL}] bg-[${BG_PANEL}]/95 p-4 shadow-2xl backdrop-blur-xl`}
              >
                <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Controls</p>
                <div className="mt-0 border-t border-white/10 pt-4">
                  <div className="flex items-center justify-between font-mono text-[10px] text-zinc-400 mb-2">
                    <span>Volume</span>
                    <span>{Math.round(volume * 100)}%</span>
                  </div>
                  <input 
                    ref={volumeSliderRef}
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

        <main
          className="relative z-10 flex w-full flex-1 items-center justify-center overflow-hidden"
          aria-label="Documentary scene"
          aria-live="polite"
          aria-atomic="true"
        >
          {/* Subtle space-time field radial glow behind the currently active chapter */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden -z-10"
          >
            <motion.div
              key={engine.currentChapter?.id || chapterIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{
                opacity: isFinal ? [0.85, 1, 0.85] : [0.70, 0.95, 0.70],
                scale: [1, 1.05, 1],
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
            <motion.div
              key={engine.currentEvent?.id || engine.currentIndex}
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1.0 }}
              exit={{ opacity: 0 }}
              transition={{ 
                opacity: { duration: 0.4, ease: "easeInOut" },
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

        <section
          role="toolbar"
          aria-label="Playback controls"
          className={`absolute bottom-0 left-0 right-0 z-50 w-full border-t border-white/10 bg-black/80 backdrop-blur-xl transition-all duration-300 ease-in-out ${isHUDVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full pointer-events-none"}`}
        >
          <div
            className="group relative h-1.5 w-full bg-zinc-900 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            role="progressbar"
            aria-label="Playback progress"
            aria-valuemin={0}
            aria-valuemax={engine.total}
            aria-valuenow={engine.currentIndex}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft") { e.preventDefault(); engine.stepBack(); }
              if (e.key === "ArrowRight") { e.preventDefault(); engine.stepForward(); }
              if (e.key === "Home") { e.preventDefault(); engine.seek(0); }
              if (e.key === "End") { e.preventDefault(); engine.seek(engine.total - 1); }
            }}
            onClick={(e) => {
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
              <Button variant="ghost" size="icon" onClick={engine.replay} aria-label="Restart from beginning" className="h-10 w-10 text-muted hover:bg-white/5 hover:text-ivory focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-1 focus-visible:ring-offset-black" title="Replay (R)">
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={engine.stepBack} disabled={engine.currentIndex === 0} aria-label="Previous scene" className="h-10 w-10 text-muted hover:bg-white/5 hover:text-ivory focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-1 focus-visible:ring-offset-black" title="Previous">
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
              <Button variant="ghost" size="icon" onClick={engine.stepForward} disabled={isFinal} aria-label="Next scene" className="h-10 w-10 text-zinc-400 hover:bg-white/5 hover:text-white focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-1 focus-visible:ring-offset-black" title="Next">
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
              <Button variant="ghost" size="icon" onClick={toggleFullscreen} aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"} aria-pressed={isFullscreen} className="h-10 w-10 text-muted hover:bg-white/5 hover:text-ivory focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-1 focus-visible:ring-offset-black" title="Fullscreen (F)">
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
