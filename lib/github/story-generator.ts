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
 * Parses user commit logs and repositories to generate the 7 requested cinematic chapters
 * with personalized, emotionally evocative AI-style narrative summaries.
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
        commitConsistencyScore: 80,
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

  const seenLanguages = new Set<string>();

  // 7 Standard Cinematic Chapters from User Spec
  const chapterDefinitions = [
    {
      id: "the-beginning",
      name: "The Beginning",
      subtitle: "Inaugural Repositories & First Commits",
      narrativeTemplate: (startMonthYear: string, rName: string) =>
        `${startMonthYear}: Your developer journey commenced with the inception of ${
          rName || "your first repository"
        }. Those initial commits laid the groundwork for everything that followed.`,
    },
    {
      id: "first-real-project",
      name: "First Real Project",
      subtitle: "Foundational Code & Breakthroughs",
      narrativeTemplate: (startMonthYear: string, rName: string) =>
        `${startMonthYear}: You stopped experimenting and started building. ${
          rName || "Your cornerstone repository"
        } marked the beginning of a concrete, functional project architecture in ${primaryLang}.`,
    },
    {
      id: "building-consistency",
      name: "Building Consistency",
      subtitle: "Unbroken Momentum & Habit Formation",
      narrativeTemplate: (startMonthYear: string, rName: string) =>
        `${startMonthYear}: You maintained an unbroken rhythm of contributions across multiple weeks, turning programming from an occasional activity into an instinctive daily craft.`,
    },
    {
      id: "dsa-era",
      name: "DSA Era",
      subtitle: "Algorithmic Precision & Practice",
      narrativeTemplate: (startMonthYear: string, rName: string) =>
        `${startMonthYear}: This was the season of algorithmic focus. You moved from isolated tests to consistent problem solving, refining data structures and runtime efficiency.`,
    },
    {
      id: "project-expansion",
      name: "Project Expansion",
      subtitle: "Multi-Repository Architecture",
      narrativeTemplate: (startMonthYear: string, rName: string) =>
        `${startMonthYear}: After establishing your core foundation, your activity accelerated across ${
          repos.length || "multiple"
        } repositories, branching into ${secondaryLang} and advanced tooling.`,
    },
    {
      id: "late-night-builder",
      name: "Late Night Builder",
      subtitle: "Midnight Refactors & Velocity",
      narrativeTemplate: (startMonthYear: string, rName: string) =>
        `${startMonthYear}: Concentrated velocity after twilight. Late-night pushes and architectural cleanups demonstrated deep focus and creative autonomy.`,
    },
    {
      id: "present-day",
      name: "Present Day",
      subtitle: "Mature Craftsmanship & Future Horizons",
      narrativeTemplate: (startMonthYear: string, rName: string) =>
        `From your first repository to your latest project, this journey was built one commit at a time. Your GitHub history is not just a graph. It is an evolving story.`,
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
    const startEv = slice[0] || annotatedEvents[0];
    const startMonthYear = `${startEv.monthName} ${startEv.year}`;
    const sliceRepos = Array.from(
      new Set(slice.map((s) => s.repoName).filter(Boolean))
    ) as string[];

    const def = chapterDefinitions[i % chapterDefinitions.length];
    const narrative = def.narrativeTemplate(
      startMonthYear,
      sliceRepos[0] || repos[0]?.name || "your codebase"
    );

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

  // Detect Impact sections on every event
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
      ev.impactDescription = `The first recorded commit on your developer timeline in ${ev.year}.`;
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
        ev.impactDescription = "Multiple consecutive days of focused problem solving.";
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
      ev.impactBadge = "New Repository Created";
      ev.impactDescription = `Initialized codebase for ${ev.repoName}.`;
      ev.impactType = "repository";
    }

    // Language debut impact
    if (ev.language && !seenLanguages.has(ev.language)) {
      seenLanguages.add(ev.language);
      ev.impactBadge = `First ${ev.language} Project`;
      ev.impactDescription = `Began first project exploration in the ${ev.language} ecosystem.`;
      ev.impactType = "language";
    }

    // Default impact if none was assigned
    if (!ev.impactBadge) {
      if (ev.title.length > 50 || ev.title.toLowerCase().includes("refactor")) {
        ev.impactBadge = "Architecture Refactor";
        ev.impactDescription = "Significant codebase restructuring and clean up.";
        ev.impactType = "milestone";
      } else if (ev.title.toLowerCase().includes("fix") || ev.title.toLowerCase().includes("bug")) {
        ev.impactBadge = "Critical Debugging Fix";
        ev.impactDescription = "Resolved edge case and restored stability.";
        ev.impactType = "volume";
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

  const weekdayDistribution = Object.entries(weekdayCounts).map(
    ([day, count]) => ({
      day,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    })
  );

  const timeOfDayDistribution = [
    {
      label: "Morning (5am-12pm)",
      count: hourCounts.Morning,
      percentage:
        total > 0 ? Math.round((hourCounts.Morning / total) * 100) : 0,
    },
    {
      label: "Afternoon (12pm-5pm)",
      count: hourCounts.Afternoon,
      percentage:
        total > 0 ? Math.round((hourCounts.Afternoon / total) * 100) : 0,
    },
    {
      label: "Evening (5pm-10pm)",
      count: hourCounts.Evening,
      percentage:
        total > 0 ? Math.round((hourCounts.Evening / total) * 100) : 0,
    },
    {
      label: "Late Night (10pm-5am)",
      count: hourCounts.LateNight,
      percentage:
        total > 0 ? Math.round((hourCounts.LateNight / total) * 100) : 0,
    },
  ];

  const avgCommitsPerActiveWeek = Math.max(
    1,
    Math.round(total / Math.max(1, Math.ceil(total / 4)))
  );
  const commitConsistencyScore = Math.min(
    98,
    Math.max(50, Math.round(65 + maxStreak * 3 - (maxGap > 45 ? 12 : 0)))
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
