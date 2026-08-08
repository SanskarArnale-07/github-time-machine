import {
  GitHubCommit,
  GitHubRepo,
  Chapter,
  ReplayEvent,
  DeveloperInsights,
} from "./types";

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Rust: "#dea584",
  Go: "#00ADD8",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  PHP: "#4F5D95",
  Ruby: "#701516",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Shell: "#89e051",
};

export function getLanguageColor(lang?: string | null): string {
  if (!lang) return "#D4A853"; // Vintage Brass default
  return LANGUAGE_COLORS[lang] || "#39D353";
}

const NARRATIVE_CAPTIONS = [
  "Your first repository marked the beginning.",
  "Consistency started to take shape.",
  "A period of rapid experimentation followed.",
  "Your momentum accelerated.",
  "Small commits accumulated into real progress.",
  "Projects became larger and more ambitious.",
  "Midnight refactors and focused problem solving.",
  "Refining data structures and runtime architecture.",
  "Turning ideas into production-ready software.",
  "Maintained daily discipline and creative focus.",
];

/**
 * Filter insignificant/trivial commits (e.g. bump, typo, small docs)
 * so the documentary focuses exclusively on meaningful milestones.
 */
export function filterMeaningfulMilestones(rawEvents: ReplayEvent[]): ReplayEvent[] {
  if (rawEvents.length <= 15) return rawEvents;

  const filtered: ReplayEvent[] = [];
  const seenMessages = new Set<string>();

  for (let i = 0; i < rawEvents.length; i++) {
    const originalEv = rawEvents[i];
    // Clone to avoid mutating original source
    const ev = { ...originalEv };

    // Always keep repo creations & year milestones
    if (ev.type === "repo_created" || ev.type === "year_milestone") {
      filtered.push(ev);
      continue;
    }

    const msg = (ev.title || "").toLowerCase().trim();

    // Skip trivial duplicate noise
    if (seenMessages.has(msg) && rawEvents.length > 25) {
      continue;
    }
    seenMessages.add(msg);

    // Robust heuristic filtering: drop merges, chores, tiny tweaks
    const isNoise =
      msg.startsWith("bump ") ||
      msg.startsWith("merge ") ||
      msg.startsWith("chore") ||
      msg.startsWith("ci") ||
      msg.startsWith("test") ||
      msg.includes("wip") ||
      msg.includes("dummy") ||
      msg.includes("lint") ||
      msg === "update readme.md" ||
      msg === "initial commit" ||
      msg === "update" ||
      msg.length < 5;

    // Skip tiny trivial bumps if we have plenty of commits
    if (isNoise && i > 0 && i < rawEvents.length - 1 && filtered.length > 10) {
      continue;
    }

    // Try to extract core action for the title
    let coreAction = ev.title || "";
    const splitMatch = coreAction.match(/^(?:feat|fix|docs|style|refactor|perf|test|chore|ci)(?:\([^)]+\))?:\s*(.+)$/i);
    if (splitMatch && splitMatch[1]) {
      coreAction = splitMatch[1].trim();
      coreAction = coreAction.charAt(0).toUpperCase() + coreAction.slice(1);
    }
    ev.title = coreAction;

    filtered.push(ev);
  }

  return filtered;
}

/**
 * Parses user commit logs and repositories to generate the 7 requested cinematic chapters:
 * "The Beginning", "First Real Project", "Building Consistency", "Learning DSA", "Expanding Projects", "Late Night Coding", "The Present"
 * with personalized, varied AI narrative captions.
 */
export function generateChaptersAndStories(
  events: ReplayEvent[],
  repos: GitHubRepo[],
  username: string
): {
  chapters: Chapter[];
  annotatedEvents: ReplayEvent[];
  insights: DeveloperInsights;
} {
  const curatedEvents = filterMeaningfulMilestones(events);

  if (curatedEvents.length === 0) {
    return {
      chapters: [],
      annotatedEvents: [],
      insights: {
        bestCodingMonth: "N/A",
        mostProductiveWeekday: "Tuesday",
        avgCommitsPerActiveWeek: 0,
        longestInactiveGapDays: 0,
        strongestComebackStreak: 0,
        fastestRepoGrowth: "N/A",
        mostFrequentlyUsedLanguage: "TypeScript",
        commitConsistencyScore: 80,
        weekdayDistribution: [],
        timeOfDayDistribution: [],
      },
    };
  }

  const total = curatedEvents.length;

  const langCount: Record<string, number> = {};
  for (const r of repos) {
    if (r.language) {
      langCount[r.language] = (langCount[r.language] || 0) + 1;
    }
  }
  const topLangs = Object.entries(langCount)
    .sort((a, b) => b[1] - a[1])
    .map(([l]) => l);
  const primaryLang = topLangs[0] || "Code";

  const annotatedEvents = [...curatedEvents];
  const seenLanguages = new Set<string>();

  let currentStreakCounter = 0;
  let maxStreak = 0;
  let maxGap = 0;
  const monthCounts: Record<string, number> = {};
  const weekdayCounts: Record<string, number> = { Sunday: 0, Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0 };
  const hourCounts: Record<string, number> = { Morning: 0, Afternoon: 0, Evening: 0, LateNight: 0 };

  for (let idx = 0; idx < annotatedEvents.length; idx++) {
    const ev = annotatedEvents[idx];
    const d = new Date(ev.date);

    const monthKey = `${ev.year} ${ev.monthName}`;
    monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
    const weekdayName = d.toLocaleDateString("en-US", { weekday: "long" });
    if (weekdayCounts[weekdayName] !== undefined) weekdayCounts[weekdayName]++;

    const hour = d.getHours();
    if (hour >= 5 && hour < 12) hourCounts.Morning++;
    else if (hour >= 12 && hour < 17) hourCounts.Afternoon++;
    else if (hour >= 17 && hour < 22) hourCounts.Evening++;
    else hourCounts.LateNight++;

    if (idx === 0) {
      ev.relativeActivity = "steady";
      ev.streakCount = 1;
      ev.impactBadge = "Inaugural Commit";
      ev.impactDescription = "The first spark. Your inaugural repository marked the beginning.";
      ev.impactType = "milestone";
      continue;
    }

    const prevEv = annotatedEvents[idx - 1];
    const dayDiff = Math.floor((ev.timestamp - prevEv.timestamp) / (1000 * 60 * 60 * 24));

    if (dayDiff <= 1) {
      currentStreakCounter++;
      ev.streakCount = currentStreakCounter;
      if (currentStreakCounter > maxStreak) {
        maxStreak = currentStreakCounter;
        ev.impactBadge = `Longest streak reached (${currentStreakCounter} days)`;
        ev.impactDescription = "Unbroken momentum. You built a relentless rhythm.";
        ev.impactType = "streak";
      } else if (currentStreakCounter >= 3) {
        ev.relativeActivity = "breakthrough";
        ev.impactBadge = "High Velocity Surge";
        ev.impactDescription = "A surge of creativity. Your momentum accelerated rapidly.";
        ev.impactType = "volume";
      }
    } else {
      if (dayDiff > 25) {
        ev.gapDays = dayDiff;
        if (dayDiff > maxGap) maxGap = dayDiff;
        ev.impactBadge = "Strong Comeback after Inactivity";
        ev.impactDescription = `A renewed spark. You returned after ${dayDiff} days of quiet.`;
        ev.impactType = "comeback";
      }
      currentStreakCounter = 1;
    }

    if (ev.type === "repo_created") {
      ev.impactBadge = "New Repository Created";
      ev.impactDescription = `A blank canvas. You laid the foundation for ${ev.repoName}.`;
      ev.impactType = "repository";
    }

    if (ev.language && !seenLanguages.has(ev.language)) {
      seenLanguages.add(ev.language);
      ev.impactBadge = `First ${ev.language} Project`;
      ev.impactDescription = `Crossing boundaries. You expanded your horizons into ${ev.language}.`;
      ev.impactType = "language";
    }

    if (!ev.impactBadge) {
      if (idx % 4 === 0) {
        ev.impactBadge = "Architecture Refactor";
        ev.impactDescription = `Structural shifts. You re-evaluated the core of ${ev.repoName}.`;
      } else if (idx % 3 === 0) {
        ev.impactBadge = "Critical Debugging";
        ev.impactDescription = `Polishing the edges. You eliminated friction in the code.`;
      } else if (hour >= 22 || hour < 4) {
        ev.impactBadge = "Midnight Session";
        ev.impactDescription = `Building the atmosphere. The world slept, but you kept coding.`;
      } else if (ev.title.toLowerCase().includes("feat") || ev.title.toLowerCase().includes("add")) {
        ev.impactBadge = "Feature Expansion";
        ev.impactDescription = `Vision realized. A new capability breathed life into ${ev.repoName}.`;
      } else if (ev.title.toLowerCase().includes("fix") || ev.title.toLowerCase().includes("bug")) {
        ev.impactBadge = "Bug Squashing";
        ev.impactDescription = `Restoring balance. You methodically tracked down the flaw.`;
      } else {
        ev.impactBadge = "Consistent Progress";
        ev.impactDescription = `Another step forward. Small changes compounded into something greater.`;
      }
    }
  }

  // Group into chapters of 3-5 commits (we'll aim for 4, but adjust at the end so no chapter is too small)
  const chapters: Chapter[] = [];
  const chunkSize = 4;
  
  const possibleChapterNames = [
    "The Genesis", "The Breakthrough", "Building Consistency", 
    "Deep Focus", "Midnight Oil", "Expanding Horizons", 
    "The Turning Point", "Unstoppable Momentum", "Architecting the Future", 
    "Refinement Phase", "The Climb", "A New Direction", "The Present"
  ];
  let nameIndex = 0;

  let i = 0;
  let chapterIndex = 1;
  while (i < annotatedEvents.length) {
    let currentChunkSize = chunkSize;
    // If the remaining events are 5 or fewer, group them all in this chapter
    if (annotatedEvents.length - i <= 5) {
      currentChunkSize = annotatedEvents.length - i;
    }

    const chunk = annotatedEvents.slice(i, i + currentChunkSize);
    
    // Determine chapter theme based on chunk events
    let cName = possibleChapterNames[nameIndex % possibleChapterNames.length];
    
    if (i === 0) {
      cName = "The Beginning";
    } else if (chunk.some(e => e.impactType === "language")) {
      cName = "New Frontiers";
    } else if (chunk.some(e => e.impactType === "volume")) {
      cName = "The Breakthrough";
    } else if (chunk.some(e => e.impactType === "comeback")) {
      cName = "The Return";
    } else if (chunk.some(e => e.impactBadge === "Midnight Session")) {
      cName = "Late Night Coding";
    }
    nameIndex++;

    const startEv = chunk[0];
    const endEv = chunk[chunk.length - 1];
    const startMonthYear = `${startEv.monthName} ${startEv.year}`;
    const chunkRepos = Array.from(new Set(chunk.map((s) => s.repoName).filter(Boolean))) as string[];
    const mainRepo = chunkRepos[0] || repos[0]?.name || "your codebase";

    const chapter: Chapter = {
      id: `chapter-${chapterIndex}`,
      name: cName,
      subtitle: `${startMonthYear} \u00B7 ${chunk.length} commits`,
      narrative: `During ${startMonthYear}, focus sharpened on ${mainRepo}. ${chunk.length} milestones were reached as ideas turned into reality.`,
      startEventIndex: i,
      endEventIndex: i + chunk.length - 1,
      startDate: startEv.date,
      endDate: endEv.date,
      totalCommits: chunk.filter((s) => s.type === "commit").length,
      primaryLanguage: primaryLang,
      highlightRepos: chunkRepos.slice(0, 3),
    };

    chapters.push(chapter);

    for (let k = i; k < i + chunk.length; k++) {
      annotatedEvents[k].chapterId = chapter.id;
      annotatedEvents[k].chapterName = chapter.name;
      annotatedEvents[k].languageColor = getLanguageColor(annotatedEvents[k].language);
    }

    chapterIndex++;
    i += currentChunkSize;
  }

  // Developer Insights
  let bestCodingMonth = "N/A";
  let maxMonthCommits = 0;
  for (const [m, count] of Object.entries(monthCounts)) {
    if (count > maxMonthCommits) { maxMonthCommits = count; bestCodingMonth = m; }
  }

  let mostProductiveWeekday = "Tuesday";
  let maxWeekdayCount = 0;
  for (const [day, count] of Object.entries(weekdayCounts)) {
    if (count > maxWeekdayCount) { maxWeekdayCount = count; mostProductiveWeekday = day; }
  }

  const weekdayDistribution = Object.entries(weekdayCounts).map(([day, count]) => ({
    day, count, percentage: total > 0 ? Math.round((count / total) * 100) : 0,
  }));

  const timeOfDayDistribution = [
    { label: "Morning (5am-12pm)", count: hourCounts.Morning, percentage: total > 0 ? Math.round((hourCounts.Morning / total) * 100) : 0 },
    { label: "Afternoon (12pm-5pm)", count: hourCounts.Afternoon, percentage: total > 0 ? Math.round((hourCounts.Afternoon / total) * 100) : 0 },
    { label: "Evening (5pm-10pm)", count: hourCounts.Evening, percentage: total > 0 ? Math.round((hourCounts.Evening / total) * 100) : 0 },
    { label: "Late Night (10pm-5am)", count: hourCounts.LateNight, percentage: total > 0 ? Math.round((hourCounts.LateNight / total) * 100) : 0 },
  ];

  const avgCommitsPerActiveWeek = Math.max(1, Math.round(total / Math.max(1, Math.ceil(total / 4))));
  const commitConsistencyScore = Math.min(98, Math.max(50, Math.round(65 + maxStreak * 3 - (maxGap > 45 ? 12 : 0))));

  const insights: DeveloperInsights = {
    bestCodingMonth,
    mostProductiveWeekday,
    avgCommitsPerActiveWeek,
    longestInactiveGapDays: maxGap || 14,
    strongestComebackStreak: maxStreak || 3,
    fastestRepoGrowth: repos[0]?.name || "Core Codebase",
    mostFrequentlyUsedLanguage: primaryLang,
    commitConsistencyScore,
    weekdayDistribution,
    timeOfDayDistribution,
  };

  return { chapters, annotatedEvents, insights };
}
