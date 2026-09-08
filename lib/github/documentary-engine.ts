"use client";

import { GitHubCommit, GitHubRepo, ReplayEvent, Chapter } from "./types";
import { getLanguageColor } from "./story-generator";

interface CandidateScene {
  commit: GitHubCommit;
  type: "milestone" | "volume" | "streak" | "architecture" | "language" | "repository";
  title: string;
  description: string;
  badge: string;
  duration: number;
}

export function buildRepoDocumentaryEvents(
  commits: GitHubCommit[],
  repo: GitHubRepo
): { events: ReplayEvent[]; chapters: Chapter[] } {
  const events: ReplayEvent[] = [];
  const chapters: Chapter[] = [];
  
  if (commits.length === 0) return { events, chapters };

  // 1. Filter out invalid dates and sort strictly ascending by epoch timestamp
  const validCommits = commits.filter(c => !isNaN(new Date(c.date).getTime()));
  if (validCommits.length === 0) return { events, chapters };

  const sortedCommits = [...validCommits].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
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

  // ── Precompute patterns across all commits ──────────────────────────────
  // Week grouping
  const weekMap = new Map<string, GitHubCommit[]>();
  sortedCommits.forEach(c => {
    const d = new Date(c.date);
    const weekKey = `${d.getFullYear()}-W${Math.ceil(d.getDate() / 7)}-M${d.getMonth()}`;
    if (!weekMap.has(weekKey)) weekMap.set(weekKey, []);
    weekMap.get(weekKey)!.push(c);
  });

  // Calendar day streaks
  const dayMap = new Map<string, GitHubCommit>();
  sortedCommits.forEach(c => {
    const dayKey = new Date(c.date).toISOString().slice(0, 10);
    dayMap.set(dayKey, c);
  });
  const uniqueDays = Array.from(dayMap.keys()).sort();

  let maxStreakDays = 1;
  let currentStreakDays = 1;
  let bestStreakEndCommit: GitHubCommit | null = null;
  let bestStreakCommits: GitHubCommit[] = [];
  let currentStreakCommits: GitHubCommit[] = [dayMap.get(uniqueDays[0])!];

  for (let i = 1; i < uniqueDays.length; i++) {
    const prevDate = new Date(uniqueDays[i - 1]);
    const currDate = new Date(uniqueDays[i]);
    const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      currentStreakDays++;
      currentStreakCommits.push(dayMap.get(uniqueDays[i])!);
      if (currentStreakDays > maxStreakDays) {
        maxStreakDays = currentStreakDays;
        bestStreakEndCommit = dayMap.get(uniqueDays[i]) || null;
        bestStreakCommits = [...currentStreakCommits];
      }
    } else {
      currentStreakDays = 1;
      currentStreakCommits = [dayMap.get(uniqueDays[i])!];
    }
  }

  // Peak week
  let maxWeekCount = 0;
  let peakWeekCommits: GitHubCommit[] = [];
  for (const [_, weekCommits] of weekMap.entries()) {
    if (weekCommits.length > maxWeekCount) {
      maxWeekCount = weekCommits.length;
      peakWeekCommits = weekCommits;
    }
  }

  // ── Candidate Scene Generation ──────────────────────────────────────────
  const candidateScenes: CandidateScene[] = [];
  const usedCommitShas = new Set<string>();

  // 1. The Beginning — always anchored to the repository's inaugural commit
  const firstCommit = sortedCommits[0];
  usedCommitShas.add(firstCommit.sha);
  const shaPrefix = firstCommit.sha.slice(0, 7);
  const dateFirst = new Date(firstCommit.date).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  candidateScenes.push({
    commit: firstCommit,
    type: "repository",
    title: "The Beginning",
    description: `${dateFirst}. Commit ${shaPrefix} — the first line of code pushed to the main branch. What started as a blank repository became the foundation of something real.`,
    badge: "First Commit",
    duration: 7000,
  });

  // 7. Today — climax anchored to the latest commit (if more than 1 commit)
  let todayCandidate: CandidateScene | null = null;
  if (sortedCommits.length > 1) {
    const latestCommit = sortedCommits[sortedCommits.length - 1];
    usedCommitShas.add(latestCommit.sha);
    const dateToday = new Date(latestCommit.date).toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const totalCount = sortedCommits.length;
    todayCandidate = {
      commit: latestCommit,
      type: "milestone",
      title: "Today",
      description: `${dateToday}. ${totalCount} commits. Every line of code a decision. Every merge a step forward.\n\nFrom your first repository to your latest project.`,
      badge: "Latest Commit",
      duration: 9000,
    };
  }

  // Intermediate candidates (slots between first and latest)
  // Max intermediate candidates = 5 (so total scenes <= 7)
  const maxIntermediate = Math.min(5, sortedCommits.length - (todayCandidate ? 2 : 1));

  if (maxIntermediate > 0) {
    const intermediateCandidates: CandidateScene[] = [];

    // Milestone: The Rewrite (refactor/architecture)
    const rewriteCommit = sortedCommits.find(c => {
      if (usedCommitShas.has(c.sha)) return false;
      const msg = c.message.toLowerCase();
      return msg.includes("refactor") || msg.includes("rewrite") || msg.includes("architecture");
    });
    if (rewriteCommit) {
      usedCommitShas.add(rewriteCommit.sha);
      const dateRW = new Date(rewriteCommit.date).toLocaleDateString("en-US", { month: "long", year: "numeric" });
      intermediateCandidates.push({
        commit: rewriteCommit,
        type: "architecture",
        title: "The Rewrite",
        description: `${dateRW}. The codebase evolved. Significant restructuring elevated the architecture — a sign that the project had grown beyond its original design.`,
        badge: "Major Refactor",
        duration: 5000,
      });
    }

    // Milestone: The Long Run (>= 3 consecutive active days)
    if (maxStreakDays >= 3 && bestStreakCommits.length > 0) {
      const streakCommit = [...bestStreakCommits].reverse().find(c => !usedCommitShas.has(c.sha));
      if (streakCommit) {
        usedCommitShas.add(streakCommit.sha);
        const dateLR = new Date(streakCommit.date).toLocaleDateString("en-US", { month: "long", year: "numeric" });
        intermediateCandidates.push({
          commit: streakCommit,
          type: "streak",
          title: "The Long Run",
          description: `${dateLR}. Consistency became a habit. A ${maxStreakDays}-day streak marked the longest unbroken period of contribution — proof that showing up matters.`,
          badge: `${maxStreakDays}-Day Streak`,
          duration: 5500,
        });
      }
    }

    // Milestone: The Peak (most productive week)
    if (peakWeekCommits.length > 0) {
      const peakCommit = peakWeekCommits.find(c => !usedCommitShas.has(c.sha));
      if (peakCommit) {
        usedCommitShas.add(peakCommit.sha);
        const datePeak = new Date(peakCommit.date).toLocaleDateString("en-US", { month: "long", year: "numeric" });
        intermediateCandidates.push({
          commit: peakCommit,
          type: "volume",
          title: "The Peak",
          description: `${datePeak}. The most productive week in this repository's history — ${maxWeekCount} commits merged as the project reached its highest velocity.`,
          badge: "Most Productive Week",
          duration: 5000,
        });
      }
    }

    // Milestone: Building Momentum (cadence week >= 3 commits)
    for (const [_, weekCommits] of weekMap.entries()) {
      if (weekCommits.length >= 3) {
        const momentumCommit = weekCommits.find(c => !usedCommitShas.has(c.sha));
        if (momentumCommit) {
          usedCommitShas.add(momentumCommit.sha);
          const dateMom = new Date(momentumCommit.date).toLocaleDateString("en-US", { month: "long", year: "numeric" });
          intermediateCandidates.push({
            commit: momentumCommit,
            type: "volume",
            title: "Building Momentum",
            description: `${dateMom}. Development accelerated. Commits flowed across multiple branches as active collaboration and iteration took hold.`,
            badge: "Rapid Progress",
            duration: 5500,
          });
          break;
        }
      }
    }

    // Milestone: Finding Direction (first meaningful feature commit)
    const featureCommit = sortedCommits.find(c => {
      if (usedCommitShas.has(c.sha)) return false;
      const msg = c.message.toLowerCase();
      return !msg.includes("initial commit") && (msg.includes("feat") || msg.includes("add") || msg.length > 25);
    });
    if (featureCommit) {
      usedCommitShas.add(featureCommit.sha);
      const dateDir = new Date(featureCommit.date).toLocaleDateString("en-US", { month: "long", year: "numeric" });
      intermediateCandidates.push({
        commit: featureCommit,
        type: "milestone",
        title: "Finding Direction",
        description: `${dateDir}. The main branch began to take shape. Real features started landing as the codebase found its true purpose and the first patterns emerged.`,
        badge: "First Feature",
        duration: 6500,
      });
    }

    // Fallback fill for remaining available intermediate slots
    while (intermediateCandidates.length < maxIntermediate) {
      const unusedCommit = sortedCommits.find(c => !usedCommitShas.has(c.sha));
      if (!unusedCommit) break;
      usedCommitShas.add(unusedCommit.sha);

      // Choose an appropriate narrative based on position
      const commitIdx = sortedCommits.indexOf(unusedCommit);
      const relPos = commitIdx / sortedCommits.length;

      let title = "The Sprint";
      let badge = "Intensive Sprint";
      let type: CandidateScene["type"] = "volume";
      let desc = `${new Date(unusedCommit.date).toLocaleDateString("en-US", { month: "long", year: "numeric" })}. High-velocity execution took hold. Focused iterations and concentrated effort transformed the repository during an intense burst of building.`;

      if (relPos < 0.35) {
        title = "Finding Direction";
        badge = "First Feature";
        type = "milestone";
        desc = `${new Date(unusedCommit.date).toLocaleDateString("en-US", { month: "long", year: "numeric" })}. The main branch began to take shape. Real features started landing as the codebase found its true purpose and the first patterns emerged.`;
      } else if (relPos > 0.65) {
        title = "The Peak";
        badge = "High Velocity";
        type = "volume";
        desc = `${new Date(unusedCommit.date).toLocaleDateString("en-US", { month: "long", year: "numeric" })}. Focused execution reached high momentum with continuous pushes and refinements.`;
      }

      intermediateCandidates.push({
        commit: unusedCommit,
        type,
        title,
        description: desc,
        badge,
        duration: 5500,
      });
    }

    candidateScenes.push(...intermediateCandidates);
  }

  if (todayCandidate) {
    candidateScenes.push(todayCandidate);
  }

  // ── 2. Enforce strict chronological ordering (OLDEST FIRST) ─────────────
  // Critical Invariant: scene[i].date <= scene[i + 1].date
  candidateScenes.sort((a, b) => new Date(a.commit.date).getTime() - new Date(b.commit.date).getTime());

  // ── 3. Build chronological scenes and chapters ──────────────────────────
  candidateScenes.forEach((scene, index) => {
    const sceneIndex = index + 1;
    const chapterId = `scene-${sceneIndex}`;
    chapters.push(createChapter(chapterId, scene.title, index, scene.commit.date));
    events.push(createEvent(
      scene.commit,
      scene.type,
      scene.title,
      scene.description,
      scene.badge,
      chapterId,
      scene.title,
      sceneIndex,
      scene.duration
    ));
  });

  return { events, chapters };
}
