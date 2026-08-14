"use client";

import { GitHubCommit, GitHubRepo, ReplayEvent, Chapter } from "./types";
import { getLanguageColor } from "./story-generator";

export function buildRepoDocumentaryEvents(
  commits: GitHubCommit[],
  repo: GitHubRepo
): { events: ReplayEvent[]; chapters: Chapter[] } {
  const events: ReplayEvent[] = [];
  const chapters: Chapter[] = [];
  
  if (commits.length === 0) return { events, chapters };

  // Sort commits chronologically
  const sortedCommits = [...commits].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Helpers
  const createEvent = (commit: GitHubCommit, type: "milestone" | "volume" | "streak" | "architecture" | "language" | "repository", title: string, description: string, badge: string, chapterId: string, chapterName: string, sceneIndex: number): ReplayEvent => {
    const d = new Date(commit.date);
    return {
      id: `doc-${repo.name}-scene${sceneIndex}-${commit.sha}-${type}`,
      type: "commit",
      date: commit.date,
      timestamp: d.getTime(),
      year: commit.year || d.getFullYear(),
      month: commit.month ?? d.getMonth(),
      monthName: commit.monthName || d.toLocaleString("default", { month: "short" }),
      title: title,
      description: description,
      repoName: commit.repoName,
      repoUrl: commit.repoUrl,
      commitSha: commit.sha,
      commitShortSha: commit.shortSha || commit.sha.slice(0, 7),
      authorName: commit.authorName,
      authorAvatar: commit.authorAvatar,
      commit: commit,
      impactType: type,
      impactBadge: badge,
      impactDescription: description,
      chapterId,
      chapterName,
      language: repo.language || undefined,
      languageColor: getLanguageColor(repo.language),
    };
  };

  const createChapter = (id: string, name: string, eventIndex: number, date: string): Chapter => {
    return {
      id,
      name,
      subtitle: "",
      narrative: "",
      startEventIndex: eventIndex,
      endEventIndex: eventIndex,
      startDate: date,
      endDate: date,
      totalCommits: 1,
      primaryLanguage: repo.language || "TypeScript",
      highlightRepos: [repo.name],
    };
  };

  // 1. The Beginning
  const firstCommit = sortedCommits[0];
  const dateFirst = new Date(firstCommit.date).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  chapters.push(createChapter("scene-1", "The Beginning", 0, firstCommit.date));
  events.push(createEvent(
    firstCommit, 
    "repository", 
    "The Beginning", 
    `${dateFirst}. The repository began to take shape. What started as a small experiment became a focused project.`, 
    "First Commit", 
    "scene-1", 
    "The Beginning",
    1
  ));

  // 2. Finding Direction
  let meaningfulCommit = sortedCommits.find(c => {
    const msg = c.message.toLowerCase();
    return c.sha !== firstCommit.sha && 
           !msg.includes("initial commit") && 
           (msg.includes("feat") || msg.includes("add") || msg.length > 25);
  });
  if (!meaningfulCommit && sortedCommits.length > 1) meaningfulCommit = sortedCommits[1];
  
  if (meaningfulCommit) {
    const dateDir = new Date(meaningfulCommit.date).toLocaleDateString("en-US", { month: "long", year: "numeric" });
    chapters.push(createChapter("scene-2", "Finding Direction", 1, meaningfulCommit.date));
    events.push(createEvent(
      meaningfulCommit,
      "milestone",
      "Finding Direction",
      `${dateDir}. The foundation was laid. Real features started merging as the codebase found its true purpose.`,
      "First Feature",
      "scene-2",
      "Finding Direction",
      2
    ));
  }

  // 3. Building Momentum
  const weekMap = new Map<string, GitHubCommit[]>();
  sortedCommits.forEach(c => {
    const d = new Date(c.date);
    const weekKey = `${d.getFullYear()}-W${Math.ceil(d.getDate() / 7)}-M${d.getMonth()}`;
    if (!weekMap.has(weekKey)) weekMap.set(weekKey, []);
    weekMap.get(weekKey)!.push(c);
  });

  let momentumCommit = sortedCommits[Math.floor(sortedCommits.length * 0.25)];
  for (const [_, weekCommits] of weekMap.entries()) {
    if (weekCommits.length >= 3 && weekCommits[0].sha !== firstCommit.sha) {
      momentumCommit = weekCommits[Math.floor(weekCommits.length / 2)];
      break;
    }
  }

  if (momentumCommit && events.length < 3) {
    const dateMom = new Date(momentumCommit.date).toLocaleDateString("en-US", { month: "long", year: "numeric" });
    chapters.push(createChapter("scene-3", "Building Momentum", events.length, momentumCommit.date));
    events.push(createEvent(
      momentumCommit,
      "volume",
      "Building Momentum",
      `${dateMom}. Development accelerated. Multiple commits flowed in as active development took hold.`,
      "Rapid Progress",
      "scene-3",
      "Building Momentum",
      3
    ));
  }

  // 4. The Long Run
  let maxStreak = 1;
  let currentStreak = 1;
  let bestStreakEndCommit = sortedCommits[0];
  let lastDate = new Date(sortedCommits[0].date);

  for (let i = 1; i < sortedCommits.length; i++) {
    const d = new Date(sortedCommits[i].date);
    const diffDays = Math.floor((d.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) {
      currentStreak++;
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
        bestStreakEndCommit = sortedCommits[i];
      }
    } else {
      currentStreak = 1;
    }
    lastDate = d;
  }

  if (bestStreakEndCommit && events.length < 4) {
    const dateLR = new Date(bestStreakEndCommit.date).toLocaleDateString("en-US", { month: "long", year: "numeric" });
    chapters.push(createChapter("scene-4", "The Long Run", events.length, bestStreakEndCommit.date));
    events.push(createEvent(
      bestStreakEndCommit,
      "streak",
      "The Long Run",
      `${dateLR}. Consistency became a habit. A sustained period of progress marked the longest contribution streak.`,
      `${maxStreak}-Day Streak`,
      "scene-4",
      "The Long Run",
      4
    ));
  }

  // 5. The Rewrite
  let rewriteCommit = sortedCommits.find(c => {
    const msg = c.message.toLowerCase();
    return msg.includes("refactor") || msg.includes("rewrite") || msg.includes("architecture");
  });
  if (!rewriteCommit && sortedCommits.length > 4) {
    rewriteCommit = sortedCommits[Math.floor(sortedCommits.length * 0.6)];
  }

  if (rewriteCommit && events.length < 5) {
    const dateRW = new Date(rewriteCommit.date).toLocaleDateString("en-US", { month: "long", year: "numeric" });
    chapters.push(createChapter("scene-5", "The Rewrite", events.length, rewriteCommit.date));
    events.push(createEvent(
      rewriteCommit,
      "architecture",
      "The Rewrite",
      `${dateRW}. The codebase evolved. Significant restructuring and architectural changes elevated the project's capabilities.`,
      "Major Refactor",
      "scene-5",
      "The Rewrite",
      5
    ));
  }

  // 6. The Peak
  let maxWeekCount = 0;
  let peakWeekCommits: GitHubCommit[] = [];
  for (const [_, weekCommits] of weekMap.entries()) {
    if (weekCommits.length > maxWeekCount) {
      maxWeekCount = weekCommits.length;
      peakWeekCommits = weekCommits;
    }
  }

  let peakCommit = peakWeekCommits.length > 0 ? peakWeekCommits[Math.floor(peakWeekCommits.length / 2)] : sortedCommits[Math.floor(sortedCommits.length * 0.8)];
  
  if (peakCommit && events.length < 6) {
    const datePeak = new Date(peakCommit.date).toLocaleDateString("en-US", { month: "long", year: "numeric" });
    chapters.push(createChapter("scene-6", "The Peak", events.length, peakCommit.date));
    events.push(createEvent(
      peakCommit,
      "volume",
      "The Peak",
      `${datePeak}. The highest commit density achieved. The strongest momentum pushed the project to its peak productivity.`,
      "Most Productive Week",
      "scene-6",
      "The Peak",
      6
    ));
  }

  // 7. Today
  const latestCommit = sortedCommits[sortedCommits.length - 1];
  if (latestCommit && events.length < 7) {
    const dateToday = new Date(latestCommit.date).toLocaleDateString("en-US", { month: "long", year: "numeric" });
    chapters.push(createChapter("scene-7", "Today", events.length, latestCommit.date));
    events.push(createEvent(
      latestCommit,
      "milestone",
      "Today",
      `${dateToday}. The current repository state. A final chapter that represents the culmination of all previous milestones.`,
      "Latest Commit",
      "scene-7",
      "Today",
      7
    ));
  }

  return { events, chapters };
}
