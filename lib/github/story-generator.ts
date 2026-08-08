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

/**
 * Parses user commit logs and repositories to generate 7 chronological narrative chapters
 * with personalized, evocative 2-4 sentence stories and event impact analysis.
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
  if (events.length === 0) {
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
        commitConsistencyScore: 75,
        weekdayDistribution: [],
        timeOfDayDistribution: [],
      },
    };
  }

  const total = events.length;

  // Identify technology footprint
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
  const secondaryLang = topLangs[1] || "Modern Web";

  // Check for distinct language first-appearance
  const seenLanguages = new Set<string>();

  // 7 Standard Cinematic Chapters
  const chapterDefinitions = [
    {
      id: "the-beginning",
      name: "The Beginning",
      subtitle: "Inaugural Repositories & Genesis",
      narrativeTemplate: (start: number, end: number, rNames: string[]) =>
        `Your developer voyage commenced in ${start} with the inception of ${
          rNames[0] || "your first repository"
        }. Every developer remembers their first pushed commit—the initial step in turning ideas into executable code.`,
    },
    {
      id: "learning-the-basics",
      name: "Learning the Basics",
      subtitle: "Syntax Discovery & Early Experiments",
      narrativeTemplate: (start: number, end: number, rNames: string[]) =>
        `This was the season you began exploring foundational paradigms and branching into ${primaryLang}. Each commit was a test in debugging, understanding runtime environments, and establishing core instincts.`,
    },
    {
      id: "dsa-grind",
      name: "DSA Grind",
      subtitle: "Algorithmic Precision & Problem Solving",
      narrativeTemplate: (start: number, end: number, rNames: string[]) =>
        `Your DSA consistency began here with methodical commits focused on algorithmic challenges. You moved from isolated tests to consistent problem solving across multiple codebases.`,
    },
    {
      id: "first-real-projects",
      name: "First Real Projects",
      subtitle: "Full-Stack Breakthroughs & Architecture",
      narrativeTemplate: (start: number, end: number, rNames: string[]) =>
        `This repository became a turning point in your learning. Projects like ${
          rNames.slice(0, 2).join(" and ") || "your cornerstone repositories"
        } emerged with real user interfaces, modular architecture, and structured state management.`,
    },
    {
      id: "building-consistency",
      name: "Building Consistency",
      subtitle: "Unbroken Momentum & Daily Rhythm",
      narrativeTemplate: (start: number, end: number, rNames: string[]) =>
        `A defining milestone of uninterrupted velocity. You maintained an unbroken rhythm of contributions, turning programming from an occasional activity into a daily discipline.`,
    },
    {
      id: "expansion-phase",
      name: "Expansion Phase",
      subtitle: "Multi-Repository Engineering & Tooling",
      narrativeTemplate: (start: number, end: number, rNames: string[]) =>
        `After a focused foundation, your activity accelerated across ${
          repos.length || "multiple"
        } codebases. You expanded into ${secondaryLang}, CI/CD automation, and multi-file engineering.`,
    },
    {
      id: "current-era",
      name: "Current Era",
      subtitle: "Mature Craftsmanship & Future Horizons",
      narrativeTemplate: (start: number, end: number, rNames: string[]) =>
        `From your first repository to your latest project, this journey was built one commit at a time. Your GitHub history is not just a graph—it is an authentic story of developer growth.`,
    },
  ];

  const chapters: Chapter[] = [];
  const annotatedEvents = [...events];

  const numChapters = Math.min(7, Math.max(3, chapterDefinitions.length));
  const effectiveStep = Math.max(1, Math.floor(total / numChapters));

  for (let i = 0; i < numChapters; i++) {
    const startIndex = i * effectiveStep;
    const endIndex =
      i === numChapters - 1
        ? total - 1
        : Math.min(total - 1, (i + 1) * effectiveStep - 1);

    const slice = annotatedEvents.slice(startIndex, endIndex + 1);
    const startYear = slice[0]?.year || 2020;
    const endYear = slice[slice.length - 1]?.year || startYear;
    const sliceRepos = Array.from(
      new Set(slice.map((s) => s.repoName).filter(Boolean))
    ) as string[];

    const def = chapterDefinitions[i % chapterDefinitions.length];
    const narrative = def.narrativeTemplate(startYear, endYear, sliceRepos);

    const chapter: Chapter = {
      id: def.id || `chapter-${i + 1}`,
      name: def.name,
      subtitle: def.subtitle,
      narrative,
      startEventIndex: startIndex,
      endEventIndex: endIndex,
      startDate: slice[0]?.date || new Date().toISOString(),
      endDate: slice[slice.length - 1]?.date || new Date().toISOString(),
      totalCommits: slice.filter((s) => s.type === "commit").length,
      primaryLanguage: primaryLang,
      highlightRepos: sliceRepos.slice(0, 3),
    };

    chapters.push(chapter);

    // Tag events with chapter info and language colors
    for (let k = startIndex; k <= endIndex; k++) {
      if (annotatedEvents[k]) {
        annotatedEvents[k].chapterId = chapter.id;
        annotatedEvents[k].chapterName = def.name;
        annotatedEvents[k].languageColor = getLanguageColor(
          annotatedEvents[k].language
        );
      }
    }
  }

  // Detect Impact sections, major streaks, and inactive gaps
  let currentStreakCounter = 0;
  let maxStreak = 0;
  let maxGap = 0;
  const monthCounts: Record<string, number> = {};
  const weekdayCounts: Record<string, number> = {
    Sunday: 0,
    Monday: 0,
    Tuesday: 0,
    Wednesday: 0,
    Thursday: 0,
    Friday: 0,
    Saturday: 0,
  };
  const hourCounts: { Morning: number; Afternoon: number; Evening: number; LateNight: number } = {
    Morning: 0,
    Afternoon: 0,
    Evening: 0,
    LateNight: 0,
  };

  for (let idx = 0; idx < annotatedEvents.length; idx++) {
    const ev = annotatedEvents[idx];
    const d = new Date(ev.date);

    // Month & weekday tallies
    const monthKey = `${ev.year} ${ev.monthName}`;
    monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
    const weekdayName = d.toLocaleDateString("en-US", { weekday: "long" });
    if (weekdayCounts[weekdayName] !== undefined) {
      weekdayCounts[weekdayName]++;
    }

    const hour = d.getHours();
    if (hour >= 5 && hour < 12) hourCounts.Morning++;
    else if (hour >= 12 && hour < 17) hourCounts.Afternoon++;
    else if (hour >= 17 && hour < 22) hourCounts.Evening++;
    else hourCounts.LateNight++;

    if (idx === 0) {
      ev.relativeActivity = "steady";
      ev.streakCount = 1;
      ev.impactBadge = "Inaugural Commit";
      ev.impactDescription = `The first recorded commit on your timeline in ${ev.year}.`;
      ev.impactType = "milestone";
      continue;
    }

    const prevEv = annotatedEvents[idx - 1];
    const dayDiff = Math.floor(
      (ev.timestamp - prevEv.timestamp) / (1000 * 60 * 60 * 24)
    );

    // Streak detection
    if (dayDiff <= 1) {
      currentStreakCounter++;
      ev.streakCount = currentStreakCounter;
      if (currentStreakCounter > maxStreak) {
        maxStreak = currentStreakCounter;
        ev.impactBadge = `Longest streak reached (${currentStreakCounter} days)`;
        ev.impactDescription = "Maintained continuous daily commit momentum.";
        ev.impactType = "streak";
      } else if (currentStreakCounter >= 3) {
        ev.relativeActivity = "breakthrough";
        ev.impactBadge = "High Velocity Surge";
        ev.impactDescription = "Multiple consecutive days of concentrated commits.";
        ev.impactType = "volume";
      }
    } else {
      if (dayDiff > 25) {
        ev.gapDays = dayDiff;
        if (dayDiff > maxGap) maxGap = dayDiff;
        ev.impactBadge = "Strong Comeback after Inactivity";
        ev.impactDescription = `Renewed active development following a ${dayDiff}-day hiatus.`;
        ev.impactType = "comeback";
      }
      currentStreakCounter = 1;
      ev.streakCount = 1;
    }

    // Repository creation impact
    if (ev.type === "repo_created") {
      ev.impactBadge = "New Repository Founded";
      ev.impactDescription = `Initialized codebase for ${ev.repoName}.`;
      ev.impactType = "repository";
    }

    // First language exploration impact
    if (ev.language && !seenLanguages.has(ev.language)) {
      seenLanguages.add(ev.language);
      ev.impactBadge = `First ${ev.language} Project`;
      ev.impactDescription = `Initiated first project using ${ev.language} ecosystem.`;
      ev.impactType = "language";
    }

    // Default impact if none was assigned
    if (!ev.impactBadge) {
      if (ev.title.length > 50 || ev.title.includes("refactor")) {
        ev.impactBadge = "Architecture Refactor";
        ev.impactDescription = "Significant codebase restructuring and clean up.";
        ev.impactType = "milestone";
      } else {
        ev.impactBadge = "Feature Push";
        ev.impactDescription = `Pushed updates directly to ${ev.repoName || "repository"}.`;
        ev.impactType = "volume";
      }
    }
  }

  // Developer Insights calculation
  let bestCodingMonth = "N/A";
  let maxMonthCommits = 0;
  for (const [m, count] of Object.entries(monthCounts)) {
    if (count > maxMonthCommits) {
      maxMonthCommits = count;
      bestCodingMonth = m;
    }
  }

  let mostProductiveWeekday = "Tuesday";
  let maxWeekdayCount = 0;
  for (const [day, count] of Object.entries(weekdayCounts)) {
    if (count > maxWeekdayCount) {
      maxWeekdayCount = count;
      mostProductiveWeekday = day;
    }
  }

  const weekdayDistribution = Object.entries(weekdayCounts).map(([day, count]) => ({
    day,
    count,
    percentage: total > 0 ? Math.round((count / total) * 100) : 0,
  }));

  const timeOfDayDistribution = [
    { label: "Morning (5am-12pm)", count: hourCounts.Morning, percentage: total > 0 ? Math.round((hourCounts.Morning / total) * 100) : 0 },
    { label: "Afternoon (12pm-5pm)", count: hourCounts.Afternoon, percentage: total > 0 ? Math.round((hourCounts.Afternoon / total) * 100) : 0 },
    { label: "Evening (5pm-10pm)", count: hourCounts.Evening, percentage: total > 0 ? Math.round((hourCounts.Evening / total) * 100) : 0 },
    { label: "Late Night (10pm-5am)", count: hourCounts.LateNight, percentage: total > 0 ? Math.round((hourCounts.LateNight / total) * 100) : 0 },
  ];

  const avgCommitsPerActiveWeek = Math.max(1, Math.round(total / Math.max(1, Math.ceil(total / 4))));
  const commitConsistencyScore = Math.min(
    98,
    Math.max(45, Math.round(60 + maxStreak * 3 - (maxGap > 45 ? 12 : 0)))
  );

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
