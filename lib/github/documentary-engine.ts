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
  const createEvent = (
    commit: GitHubCommit,
    type: "milestone" | "volume" | "streak" | "architecture" | "language" | "repository",
    title: string,
    description: string,
    badge: string,
    chapterId: string,
    chapterName: string,
    sceneIndex: number,
    sceneDuration: number
  ): ReplayEvent => {
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
      sceneIndex: sceneIndex,
      sceneDuration: sceneDuration,
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
      primaryLanguage: repo.language || "N/A",
      highlightRepos: [repo.name],
    };
  };

  // 1. The Beginning — slow, deliberate open (7 s)
  const firstCommit = sortedCommits[0];
  const shaPrefix = firstCommit.sha.slice(0, 7);
  const dateFirst = new Date(firstCommit.date).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  chapters.push(createChapter("scene-1", "The Beginning", 0, firstCommit.date));
  events.push(createEvent(
    firstCommit,
    "repository",
    "The Beginning",
    `${dateFirst}. Commit ${shaPrefix} — the first line of code pushed to the main branch. What started as a blank repository became the foundation of something real.`,
    "First Commit",
    "scene-1",
    "The Beginning",
    1,
    7000
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
      `${dateDir}. The main branch began to take shape. Real features started landing as the codebase found its true purpose and the first patterns emerged.`,
      "First Feature",
      "scene-2",
      "Finding Direction",
      2,
      6500
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
      `${dateMom}. Development accelerated. Commits flowed across multiple branches as active collaboration and iteration took hold.`,
      "Rapid Progress",
      "scene-3",
      "Building Momentum",
      3,
      5500
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
      `${dateLR}. Consistency became a habit. A ${maxStreak}-day streak marked the longest unbroken period of contribution — proof that showing up matters.`,
      `${maxStreak}-Day Streak`,
      "scene-4",
      "The Long Run",
      4,
      5500
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
      `${dateRW}. The codebase evolved. Significant restructuring elevated the architecture — a sign that the project had grown beyond its original design.`,
      "Major Refactor",
      "scene-5",
      "The Rewrite",
      5,
      5000
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

  const peakCommit = peakWeekCommits.length > 0 ? peakWeekCommits[Math.floor(peakWeekCommits.length / 2)] : sortedCommits[Math.floor(sortedCommits.length * 0.8)];
  
  if (peakCommit && events.length < 6) {
    const datePeak = new Date(peakCommit.date).toLocaleDateString("en-US", { month: "long", year: "numeric" });
    chapters.push(createChapter("scene-6", "The Peak", events.length, peakCommit.date));
    events.push(createEvent(
      peakCommit,
      "volume",
      "The Peak",
      `${datePeak}. The most productive week in this repository's history — ${maxWeekCount} commits merged as the project reached its highest velocity.`,
      "Most Productive Week",
      "scene-6",
      "The Peak",
      6,
      5000
    ));
  }

  // 7. Today — the climax (9 s — linger on the final line)
  const latestCommit = sortedCommits[sortedCommits.length - 1];
  if (latestCommit && events.length < 7) {
    const dateToday = new Date(latestCommit.date).toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const totalCount = sortedCommits.length;
    chapters.push(createChapter("scene-7", "Today", events.length, latestCommit.date));
    events.push(createEvent(
      latestCommit,
      "milestone",
      "Today",
      `${dateToday}. ${totalCount} commits. Every line of code a decision. Every merge a step forward.\n\nFrom your first repository to your latest project.`,
      "Latest Commit",
      "scene-7",
      "Today",
      7,
      9000
    ));
  }

  return { events, chapters };
}
