"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  GitHubCommit,
  GitHubRepo,
  ReplayEvent,
  Chapter,
  ReplayStats,
} from "./types";
import { generateChaptersAndStories } from "./story-generator";
import { buildRepoDocumentaryEvents } from "./documentary-engine";

const ERA_COLORS: Record<number, { accent: string; glow: string; border: string }> = {
  0: { accent: "#D8B56C", glow: "rgba(216,181,108,0.15)", border: "rgba(216,181,108,0.38)" }, // Muted gold
  1: { accent: "#C9A86A", glow: "rgba(201,168,106,0.15)", border: "rgba(201,168,106,0.35)" }, // Aged brass
  2: { accent: "#B58A4A", glow: "rgba(181,138,74,0.14)", border: "rgba(181,138,74,0.33)" }, // Burnished amber
  3: { accent: "#9B7543", glow: "rgba(155,117,67,0.14)", border: "rgba(155,117,67,0.32)" }, // Archive bronze
  4: { accent: "#D0A15D", glow: "rgba(208,161,93,0.14)", border: "rgba(208,161,93,0.34)" }, // Faded gold
};

/**
 * Builds normalized ascending events (commits, repo creations, milestones)
 * sorted in strictly ascending chronological order.
 */
export function buildNormalizedReplayEvents(
  commits: GitHubCommit[],
  repos: GitHubRepo[],
  username: string = "Developer"
): { events: ReplayEvent[]; chapters: Chapter[] } {
  const rawEvents: ReplayEvent[] = [];

  // 1. Add commits
  for (const commit of commits) {
    const d = new Date(commit.date);
    const ts = d.getTime();
    if (isNaN(ts)) continue;

    rawEvents.push({
      id: `commit-${commit.sha}`,
      type: "commit",
      date: commit.date,
      timestamp: ts,
      year: commit.year || d.getFullYear(),
      month: commit.month ?? d.getMonth(),
      monthName: commit.monthName || d.toLocaleString("default", { month: "short" }),
      title: commit.message || "Commit",
      repoName: commit.repoName,
      repoUrl: commit.repoUrl,
      commitSha: commit.sha,
      commitShortSha: commit.shortSha || commit.sha.slice(0, 7),
      authorName: commit.authorName,
      authorAvatar: commit.authorAvatar,
      commit,
    });
  }

  // 2. Add repository creations
  for (const repo of repos) {
    if (!repo.created_at) continue;
    const d = new Date(repo.created_at);
    const ts = d.getTime();
    if (isNaN(ts)) continue;

    rawEvents.push({
      id: `repo-${repo.id || repo.name}-${ts}`,
      type: "repo_created",
      date: repo.created_at,
      timestamp: ts,
      year: d.getFullYear(),
      month: d.getMonth(),
      monthName: d.toLocaleString("default", { month: "short" }),
      title: `Founded repository: ${repo.name}`,
      description: repo.description || undefined,
      repoName: repo.name,
      repoUrl: repo.html_url,
      language: repo.language || undefined,
      stargazersCount: repo.stargazers_count,
      repo,
    });
  }

  // Sort strictly ascending (oldest first)
  rawEvents.sort((a, b) => a.timestamp - b.timestamp);

  // 3. Inject year milestone markers and month summaries
  const preProcessedEvents: ReplayEvent[] = [];
  let currentYearTracker: number | null = null;
  let currentMonthTracker: number | null = null;
  
  // Month tracking state
  let monthCommits = 0;
  let lastMonthCommits = 0;
  let monthLangs: Record<string, number> = {};
  let monthRepoCounts: Record<string, number> = {};
  let newReposCreated = 0;

  for (const event of rawEvents) {
    if (currentMonthTracker !== null && (event.year > currentYearTracker! || event.month !== currentMonthTracker)) {
      // Month ended, inject a summary event
      const topLang = Object.entries(monthLangs).sort((a, b) => b[1] - a[1])[0]?.[0] || "Code";
      const topRepo = Object.entries(monthRepoCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Unknown";
      
      let commitDeltaPct = 0;
      if (lastMonthCommits > 0) {
        commitDeltaPct = Math.round(((monthCommits - lastMonthCommits) / lastMonthCommits) * 100);
      } else if (monthCommits > 0) {
        commitDeltaPct = 100;
      }
      
      let primaryFocus: "Features" | "Refactoring" | "Bug Fixing" | "Exploration" | "Documentation" | "General" = "General";
      if (newReposCreated > 1) primaryFocus = "Exploration";
      else if (topLang === "Markdown" || topLang === "MDX") primaryFocus = "Documentation";
      else if (monthCommits > 20) primaryFocus = "Features";
      else primaryFocus = "General";

      const monthNameLong = new Date(currentYearTracker!, currentMonthTracker, 1).toLocaleString("default", { month: "long" });
      let narrative = `In ${monthNameLong} ${currentYearTracker}, you maintained a steady rhythm with a focus on ${topRepo}.`;
      if (commitDeltaPct > 50 && newReposCreated > 0) {
        narrative = `In ${monthNameLong} ${currentYearTracker}, your output surged by ${commitDeltaPct}%. You created ${newReposCreated === 1 ? "a new repository" : `${newReposCreated} new repositories`} and pushed ${monthCommits} commits.`;
      } else if (commitDeltaPct > 50) {
        narrative = `In ${monthNameLong} ${currentYearTracker}, you experienced a massive surge in activity. You pushed ${monthCommits} commits, a ${commitDeltaPct}% increase driven by deep focus on ${topRepo}.`;
      } else if (newReposCreated > 0) {
        narrative = `In ${monthNameLong} ${currentYearTracker}, you expanded your archive by creating ${newReposCreated === 1 ? "a new repository" : `${newReposCreated} new repositories`} while experimenting with ${topLang}.`;
      } else if (monthCommits > 40) {
        narrative = `In ${monthNameLong} ${currentYearTracker}, you had a highly productive month, laying down ${monthCommits} commits primarily across ${topRepo}.`;
      }

      preProcessedEvents.push({
        id: `month-summary-${currentYearTracker}-${currentMonthTracker}`,
        type: "month_summary",
        date: event.date,
        timestamp: event.timestamp - 2,
        year: currentYearTracker!,
        month: currentMonthTracker,
        monthName: new Date(currentYearTracker!, currentMonthTracker, 1).toLocaleString("default", { month: "short" }),
        title: `Month in Review`,
        monthlySummary: {
          year: currentYearTracker!,
          month: currentMonthTracker,
          monthName: new Date(currentYearTracker!, currentMonthTracker, 1).toLocaleString("default", { month: "short" }),
          totalCommits: monthCommits,
          commitDeltaPct,
          topLanguage: topLang,
          topRepo,
          newReposCreated,
          primaryFocus,
          whatChangedNarrative: narrative
        }
      });

      lastMonthCommits = monthCommits;
      monthCommits = 0;
      monthLangs = {};
      monthRepoCounts = {};
      newReposCreated = 0;
    }

    if (currentYearTracker !== null && event.year > currentYearTracker) {
      preProcessedEvents.push({
        id: `milestone-${event.year}`,
        type: "year_milestone",
        date: event.date,
        timestamp: event.timestamp - 1,
        year: event.year,
        month: event.month,
        monthName: event.monthName,
        title: `Entered Year ${event.year}`,
        subtitle: `Commencing the ${event.year} developer chapter`,
      });
    }

    currentYearTracker = event.year;
    currentMonthTracker = event.month;
    
    if (event.type === "commit") {
      monthCommits++;
      if (event.language) monthLangs[event.language] = (monthLangs[event.language] || 0) + 1;
      if (event.repoName) monthRepoCounts[event.repoName] = (monthRepoCounts[event.repoName] || 0) + 1;
    } else if (event.type === "repo_created") {
      newReposCreated++;
    }
    
    preProcessedEvents.push(event);
  }

  // 4. Generate story chapters and tag events
  const { chapters, annotatedEvents } = generateChaptersAndStories(
    preProcessedEvents,
    repos,
    username
  );

  return { events: annotatedEvents, chapters };
}

export interface ReplayEngineControls {
  // State
  events: ReplayEvent[];
  chapters: Chapter[];
  currentIndex: number;
  isPlaying: boolean;
  speed: 1 | 2 | 5;
  progress: number; // 0 to 100
  total: number;

  // Active item & metadata
  currentEvent: ReplayEvent | null;
  currentChapter: Chapter | null;
  currentYear: number;
  currentMonthName: string;
  startYear: number;
  endYear: number;
  eraColor: { accent: string; glow: string; border: string };
  isYearMilestone: boolean;

  // Real-time Replay Statistics
  stats: ReplayStats;

  // Derived slices
  visibleEvents: ReplayEvent[];
  visibleCommits: GitHubCommit[];
  visibleRepos: GitHubRepo[];
  yearProgress: number;

  // Actions
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  replay: () => void;
  seek: (index: number) => void;
  seekFraction: (fraction: number) => void;
  stepBack: () => void;
  stepForward: () => void;
  skipBy: (count: number) => void;
  skipYear: (direction: 1 | -1) => void;
  jumpToChapter: (chapterId: string) => void;
  setSpeed: (speed: 1 | 2 | 5) => void;
}

/**
 * Unified Replay Engine Hook.
 * Paced at 2.5s per commit (1x) for an unhurried, documentary feel.
 * Survives tab switches cleanly with requestAnimationFrame & delta-timing.
 */
export function useReplayEngine(
  commits: GitHubCommit[],
  repos: GitHubRepo[],
  username: string = "Developer"
): ReplayEngineControls {
  const { events, chapters } = useMemo(
    () => buildNormalizedReplayEvents(commits, repos, username),
    [commits, repos, username]
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<1 | 2 | 5>(1);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Dynamic timing function based on narrative weight
  const getEventDuration = (event: ReplayEvent | null, spd: 1 | 2 | 5, isFinal: boolean) => {
    if (!event) return 3100 / spd;

    let baseDuration = 3800; // Standard commit: 3.8s
    
    if (isFinal) {
      baseDuration = 5600;
    } else if (event.type === "repo_created") {
      baseDuration = 4600;
    } else if (event.type === "year_milestone" || event.type === "month_summary") {
      baseDuration = 6100;
    } else if (
      event.title?.toLowerCase().includes("major") || 
      event.title?.toLowerCase().includes("refactor") ||
      event.title?.toLowerCase().includes("initial")
    ) {
      baseDuration = 7100;
    }
    
    return baseDuration / spd;
  };

  const animFrameRef = useRef<number | null>(null);
  const lastAdvanceTimeRef = useRef<number | null>(null);

  const currentIndexRef = useRef(currentIndex);
  currentIndexRef.current = currentIndex;

  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const speedRef = useRef(speed);
  speedRef.current = speed;

  const total = events.length;

  // Timer counter for playback duration
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  // requestAnimationFrame playback loop
  useEffect(() => {
    if (!isPlaying || total === 0) {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      lastAdvanceTimeRef.current = null;
      return;
    }

    const tick = (now: number) => {
      if (!lastAdvanceTimeRef.current) {
        lastAdvanceTimeRef.current = now;
      }

      const elapsed = now - lastAdvanceTimeRef.current;
      const currentEvt = events[currentIndexRef.current];
      const isFin = currentIndexRef.current >= total - 1;
      const targetInterval = getEventDuration(currentEvt, speedRef.current, isFin);

      if (elapsed >= targetInterval) {
        const nextIndex = currentIndexRef.current + 1;

        if (nextIndex >= total) {
          setCurrentIndex(total - 1);
          setIsPlaying(false);
          lastAdvanceTimeRef.current = null;
          return;
        }

        setCurrentIndex(nextIndex);
        lastAdvanceTimeRef.current = now;
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [isPlaying, total]);

  // Controls
  const play = useCallback(() => {
    if (currentIndex >= total - 1) {
      setCurrentIndex(0);
    }
    setIsPlaying(true);
  }, [currentIndex, total]);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, pause, play]);

  const replay = useCallback(() => {
    setIsPlaying(false);
    setCurrentIndex(0);
    setElapsedSeconds(0);
    setTimeout(() => setIsPlaying(true), 50);
  }, []);

  const seek = useCallback(
    (index: number) => {
      const target = Math.max(0, Math.min(total - 1, index));
      setCurrentIndex(target);
    },
    [total]
  );

  const seekFraction = useCallback(
    (fraction: number) => {
      if (total <= 1) return;
      const target = Math.round(fraction * (total - 1));
      seek(target);
    },
    [total, seek]
  );

  const stepBack = useCallback(() => {
    seek(currentIndex - 1);
  }, [currentIndex, seek]);

  const stepForward = useCallback(() => {
    seek(currentIndex + 1);
  }, [currentIndex, seek]);

  const skipBy = useCallback(
    (count: number) => {
      seek(currentIndex + count);
    },
    [currentIndex, seek]
  );

  const skipYear = useCallback(
    (direction: 1 | -1) => {
      if (total === 0) return;
      const currentEv = events[currentIndex];
      const targetYear = currentEv ? currentEv.year + direction : null;
      if (targetYear === null) return;

      if (direction === 1) {
        const nextYearIndex = events.findIndex(
          (e, idx) => idx > currentIndex && e.year >= targetYear
        );
        seek(nextYearIndex !== -1 ? nextYearIndex : total - 1);
      } else {
        const prevYearIndex = events.findLastIndex(
          (e, idx) => idx < currentIndex && e.year <= targetYear
        );
        seek(prevYearIndex !== -1 ? prevYearIndex : 0);
      }
    },
    [currentIndex, events, seek, total]
  );

  const jumpToChapter = useCallback(
    (chapterId: string) => {
      const ch = chapters.find((c) => c.id === chapterId);
      if (ch) {
        seek(ch.startEventIndex);
      }
    },
    [chapters, seek]
  );

  // Keyboard navigation
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

      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        if (e.shiftKey) {
          skipYear(-1);
        } else {
          stepBack();
        }
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        if (e.shiftKey) {
          skipYear(1);
        } else {
          stepForward();
        }
      } else if (e.code === "KeyJ") {
        e.preventDefault();
        skipBy(-5); // Jump back 5 commits (~10-12s)
      } else if (e.code === "KeyL") {
        e.preventDefault();
        skipBy(5); // Jump forward 5 commits
      } else if (e.code === "KeyR") {
        e.preventDefault();
        replay();
      } else if (e.code === "Digit1") {
        setSpeed(1);
      } else if (e.code === "Digit2") {
        setSpeed(2);
      } else if (e.code === "Digit5") {
        setSpeed(5);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay, stepBack, stepForward, skipBy, skipYear, replay]);

  // Active event & derived properties
  const currentEvent = total > 0 ? events[currentIndex] || events[0] : null;
  const startYear = total > 0 ? events[0]?.year || 2020 : new Date().getFullYear();
  const endYear = total > 0 ? events[total - 1]?.year || startYear : new Date().getFullYear();
  const currentYear = currentEvent ? currentEvent.year : startYear;
  const currentMonthName = currentEvent ? currentEvent.monthName : "";
  const progress = total > 1 ? (currentIndex / (total - 1)) * 100 : 100;

  // Active Chapter
  const currentChapter = useMemo(() => {
    if (!currentEvent || chapters.length === 0) return null;
    return (
      chapters.find(
        (c) =>
          currentIndex >= c.startEventIndex && currentIndex <= c.endEventIndex
      ) || chapters[0]
    );
  }, [chapters, currentIndex, currentEvent]);

  // Era color
  const eraColor = useMemo(() => {
    if (!currentEvent) return ERA_COLORS[0];
    const yearDiff = Math.abs(currentEvent.year - startYear);
    const paletteIndex = yearDiff % 5;
    return ERA_COLORS[paletteIndex] || ERA_COLORS[0];
  }, [currentEvent, startYear]);

  const isYearMilestone = currentEvent?.type === "year_milestone";

  // Synchronized slices
  const visibleEvents = useMemo(() => {
    return events.slice(0, currentIndex + 1);
  }, [events, currentIndex]);

  const visibleCommits = useMemo(() => {
    const commitsList: GitHubCommit[] = [];
    for (let i = 0; i <= currentIndex; i++) {
      if (events[i]?.commit) {
        commitsList.push(events[i].commit!);
      }
    }
    return commitsList;
  }, [events, currentIndex]);

  const visibleRepos = useMemo(() => {
    const currentTs = currentEvent?.timestamp ?? Date.now();
    return repos.filter((r) => {
      const createdTs = new Date(r.created_at).getTime();
      return isNaN(createdTs) || createdTs <= currentTs;
    });
  }, [repos, currentEvent]);

  const yearProgress = useMemo(() => {
    if (!currentEvent) return 1;
    const sameYearEvents = events.filter((e) => e.year === currentEvent.year);
    const indexInYear = sameYearEvents.findIndex((e) => e.id === currentEvent.id);
    return sameYearEvents.length > 1
      ? Math.max(0, indexInYear / (sameYearEvents.length - 1))
      : 1;
  }, [events, currentEvent]);

  // Replay Stats calculation
  const formattedMinutes = Math.floor(elapsedSeconds / 60)
    .toString()
    .padStart(2, "0");
  const formattedSecs = (elapsedSeconds % 60).toString().padStart(2, "0");
  const formattedDuration = `${formattedMinutes}:${formattedSecs}`;

  const stats: ReplayStats = {
    currentYear,
    currentRepo: currentEvent?.repoName || (repos[0]?.name ?? "Codebase"),
    currentStreak: currentEvent?.streakCount || 1,
    commitsReplayed: visibleCommits.length,
    remainingEvents: Math.max(0, total - (currentIndex + 1)),
    elapsedSeconds,
    formattedDuration,
  };

  return {
    events,
    chapters,
    currentIndex,
    isPlaying,
    speed,
    progress,
    total,
    currentEvent,
    currentChapter,
    currentYear,
    currentMonthName,
    startYear,
    endYear,
    eraColor,
    isYearMilestone,
    stats,
    visibleEvents,
    visibleCommits,
    visibleRepos,
    yearProgress,
    play,
    pause,
    togglePlay,
    replay,
    seek,
    seekFraction,
    stepBack,
    stepForward,
    skipBy,
    skipYear,
    jumpToChapter,
    setSpeed,
  };
}

/**
 * Unified Repo Documentary Engine Hook.
 * Works exactly like useReplayEngine but builds specifically the 7 documentary milestones.
 */
export function useRepoDocumentaryEngine(
  commits: GitHubCommit[],
  repo: GitHubRepo
): ReplayEngineControls {
  const { events, chapters } = useMemo(
    () => buildRepoDocumentaryEvents(commits, repo),
    [commits, repo]
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<1 | 2 | 5>(1);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const getEventDuration = (event: ReplayEvent | null, spd: 1 | 2 | 5, isFinal: boolean) => {
    if (!event) return 2000 / spd;
    let baseDuration = 6000; // scenes in documentary should be longer
    if (isFinal) {
      baseDuration = 7500;
    }
    return baseDuration / spd;
  };

  const animFrameRef = useRef<number | null>(null);
  const lastAdvanceTimeRef = useRef<number | null>(null);

  const currentIndexRef = useRef(currentIndex);
  currentIndexRef.current = currentIndex;

  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const speedRef = useRef(speed);
  speedRef.current = speed;

  const total = events.length;

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying || total === 0) {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      lastAdvanceTimeRef.current = null;
      return;
    }

    const tick = (now: number) => {
      if (!lastAdvanceTimeRef.current) {
        lastAdvanceTimeRef.current = now;
      }

      const elapsed = now - lastAdvanceTimeRef.current;
      const currentEvt = events[currentIndexRef.current];
      const isFin = currentIndexRef.current >= total - 1;
      const targetInterval = getEventDuration(currentEvt, speedRef.current, isFin);

      if (elapsed >= targetInterval) {
        const nextIndex = currentIndexRef.current + 1;

        if (nextIndex >= total) {
          setCurrentIndex(total - 1);
          setIsPlaying(false);
          lastAdvanceTimeRef.current = null;
          return;
        }

        setCurrentIndex(nextIndex);
        lastAdvanceTimeRef.current = now;
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [isPlaying, total]);

  const play = useCallback(() => {
    if (currentIndex >= total - 1) {
      setCurrentIndex(0);
    }
    setIsPlaying(true);
  }, [currentIndex, total]);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) pause();
    else play();
  }, [isPlaying, pause, play]);

  const replay = useCallback(() => {
    setIsPlaying(false);
    setCurrentIndex(0);
    setElapsedSeconds(0);
    setTimeout(() => setIsPlaying(true), 50);
  }, []);

  const seek = useCallback(
    (index: number) => {
      const target = Math.max(0, Math.min(total - 1, index));
      setCurrentIndex(target);
    },
    [total]
  );

  const seekFraction = useCallback(
    (fraction: number) => {
      if (total <= 1) return;
      const target = Math.round(fraction * (total - 1));
      seek(target);
    },
    [total, seek]
  );

  const stepBack = useCallback(() => {
    seek(currentIndex - 1);
  }, [currentIndex, seek]);

  const stepForward = useCallback(() => {
    seek(currentIndex + 1);
  }, [currentIndex, seek]);

  const skipBy = useCallback(
    (count: number) => {
      seek(currentIndex + count);
    },
    [currentIndex, seek]
  );

  const skipYear = useCallback(
    (direction: 1 | -1) => {
      if (total === 0) return;
      const currentEv = events[currentIndex];
      const targetYear = currentEv ? currentEv.year + direction : null;
      if (targetYear === null) return;
      if (direction === 1) {
        const nextYearIndex = events.findIndex(
          (e, idx) => idx > currentIndex && e.year >= targetYear
        );
        seek(nextYearIndex !== -1 ? nextYearIndex : total - 1);
      } else {
        const prevYearIndex = events.findLastIndex(
          (e, idx) => idx < currentIndex && e.year <= targetYear
        );
        seek(prevYearIndex !== -1 ? prevYearIndex : 0);
      }
    },
    [currentIndex, events, seek, total]
  );

  const jumpToChapter = useCallback(
    (chapterId: string) => {
      const ch = chapters.find((c) => c.id === chapterId);
      if (ch) {
        seek(ch.startEventIndex);
      }
    },
    [chapters, seek]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT" ||
        target?.isContentEditable
      ) return;

      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        stepBack();
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        stepForward();
      } else if (e.code === "KeyR") {
        e.preventDefault();
        replay();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay, stepBack, stepForward, replay]);

  const currentEvent = total > 0 ? events[currentIndex] || events[0] : null;
  const startYear = total > 0 ? events[0]?.year || 2020 : new Date().getFullYear();
  const endYear = total > 0 ? events[total - 1]?.year || startYear : new Date().getFullYear();
  const currentYear = currentEvent ? currentEvent.year : startYear;
  const currentMonthName = currentEvent ? currentEvent.monthName : "";
  const progress = total > 1 ? (currentIndex / (total - 1)) * 100 : 100;

  const currentChapter = useMemo(() => {
    if (!currentEvent || chapters.length === 0) return null;
    return (
      chapters.find(
        (c) =>
          currentIndex >= c.startEventIndex && currentIndex <= c.endEventIndex
      ) || chapters[0]
    );
  }, [chapters, currentIndex, currentEvent]);

  const eraColor = useMemo(() => {
    if (!currentEvent) return ERA_COLORS[0];
    const yearDiff = Math.abs(currentEvent.year - startYear);
    const paletteIndex = yearDiff % 5;
    return ERA_COLORS[paletteIndex] || ERA_COLORS[0];
  }, [currentEvent, startYear]);

  const isYearMilestone = currentEvent?.type === "year_milestone";

  const visibleEvents = useMemo(() => events.slice(0, currentIndex + 1), [events, currentIndex]);

  const visibleCommits = useMemo(() => {
    const commitsList: GitHubCommit[] = [];
    for (let i = 0; i <= currentIndex; i++) {
      if (events[i]?.commit) {
        commitsList.push(events[i].commit!);
      }
    }
    return commitsList;
  }, [events, currentIndex]);

  const visibleRepos = useMemo(() => {
    return [repo];
  }, [repo]);

  const yearProgress = useMemo(() => {
    if (!currentEvent) return 1;
    const sameYearEvents = events.filter((e) => e.year === currentEvent.year);
    const indexInYear = sameYearEvents.findIndex((e) => e.id === currentEvent.id);
    return sameYearEvents.length > 1
      ? Math.max(0, indexInYear / (sameYearEvents.length - 1))
      : 1;
  }, [events, currentEvent]);

  const formattedMinutes = Math.floor(elapsedSeconds / 60)
    .toString()
    .padStart(2, "0");
  const formattedSecs = (elapsedSeconds % 60).toString().padStart(2, "0");
  const formattedDuration = `${formattedMinutes}:${formattedSecs}`;

  const stats: ReplayStats = {
    currentYear,
    currentRepo: repo.name,
    currentStreak: currentEvent?.streakCount || 1,
    commitsReplayed: visibleCommits.length,
    remainingEvents: Math.max(0, total - (currentIndex + 1)),
    elapsedSeconds,
    formattedDuration,
  };

  return {
    events,
    chapters,
    currentIndex,
    isPlaying,
    speed,
    progress,
    total,
    currentEvent,
    currentChapter,
    currentYear,
    currentMonthName,
    startYear,
    endYear,
    eraColor,
    isYearMilestone,
    stats,
    visibleEvents,
    visibleCommits,
    visibleRepos,
    yearProgress,
    play,
    pause,
    togglePlay,
    replay,
    seek,
    seekFraction,
    stepBack,
    stepForward,
    skipBy,
    skipYear,
    jumpToChapter,
    setSpeed,
  };
}
