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

const ERA_COLORS: Record<number, { accent: string; glow: string; border: string }> = {
  0: { accent: "#D4A853", glow: "rgba(212,168,83,0.16)", border: "rgba(212,168,83,0.35)" }, // Vintage Brass
  1: { accent: "#39D353", glow: "rgba(57,211,83,0.16)", border: "rgba(57,211,83,0.35)" }, // GitHub Emerald
  2: { accent: "#38BDF8", glow: "rgba(56,189,248,0.16)", border: "rgba(56,189,248,0.35)" }, // Cosmic Cyan
  3: { accent: "#818CF8", glow: "rgba(129,140,248,0.16)", border: "rgba(129,140,248,0.35)" }, // Indigo
  4: { accent: "#F472B6", glow: "rgba(244,114,182,0.16)", border: "rgba(244,114,182,0.35)" }, // Rose
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

  // 3. Inject year milestone markers
  const preProcessedEvents: ReplayEvent[] = [];
  let currentYearTracker: number | null = null;

  for (const event of rawEvents) {
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
  isFullscreen: boolean;

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
  toggleFullscreen: () => void;
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
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 1x = 2500ms (2.5 seconds per event), 2x = 1250ms, 5x = 500ms
  const speedIntervalMap: Record<1 | 2 | 5, number> = {
    1: 2500, // Cinematic 2.5s per commit
    2: 1250, // 1.25s
    5: 500,  // 0.5s
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
      const targetInterval = speedIntervalMap[speedRef.current];

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

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

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
      } else if (e.code === "KeyF") {
        e.preventDefault();
        toggleFullscreen();
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
  }, [togglePlay, stepBack, stepForward, skipBy, skipYear, replay, toggleFullscreen]);

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
    isFullscreen,
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
    toggleFullscreen,
  };
}
