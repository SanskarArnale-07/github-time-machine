import {
  GitHubCommit,
  GitHubRepo,
  Chapter,
  ReplayEvent,
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
 * Parses user commit logs and repositories to generate 4-6 chronological narrative chapters
 * with personalized, evocative 2-4 sentence stories.
 */
export function generateChaptersAndStories(
  events: ReplayEvent[],
  repos: GitHubRepo[],
  username: string
): { chapters: Chapter[]; annotatedEvents: ReplayEvent[] } {
  if (events.length === 0) {
    return { chapters: [], annotatedEvents: [] };
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

  // Check for DSA / algorithm keywords in messages
  const dsaKeywords = ["leetcode", "dsa", "algorithm", "problem", "solution", "tree", "graph", "dp", "sort", "matrix", "binary"];
  const dsaEventIndex = events.findIndex(e =>
    dsaKeywords.some(k => e.title.toLowerCase().includes(k))
  );

  // Split events into proportional chapter milestones
  const partitionCounts = Math.min(6, Math.max(3, Math.ceil(total / 8)));
  const chunkSize = Math.max(1, Math.floor(total / 6));

  const chapterDefinitions: { name: string; subtitle: string; narrativeTemplate: (startYear: number, endYear: number, repoNames: string[]) => string }[] = [
    {
      name: "The Beginning",
      subtitle: "Inaugural Repositories & First Commits",
      narrativeTemplate: (start, end, rNames) =>
        `Your developer voyage commenced in ${start} with the inception of ${rNames[0] || "your first repository"}. Every developer remembers their first pushed commit—the initial step in turning ideas into executable code.`,
    },
    {
      name: "Learning Phase",
      subtitle: "Foundational Syntax & Experimentation",
      narrativeTemplate: (start, end, rNames) =>
        `You began experimenting with foundational paradigms, exploring ${primaryLang} and architectural building blocks. Each commit represented a cycle of iteration, debugging, and expanding your technical intuition.`,
    },
    {
      name: "DSA Grind",
      subtitle: "Algorithmic Precision & Problem Solving",
      narrativeTemplate: (start, end, rNames) =>
        `A dedicated era of methodical problem-solving and algorithmic challenges. You moved from isolated tests to consistent code execution, honing data structure mastery across recurring sessions.`,
    },
    {
      name: "First Projects",
      subtitle: "Full-Stack Breakthroughs & Applications",
      narrativeTemplate: (start, end, rNames) =>
        `Your focus shifted toward building complete, standalone applications. Repositories like ${rNames.slice(0, 2).join(" and ") || "your core projects"} emerged with concrete interfaces, state management, and real user workflows.`,
    },
    {
      name: "Consistency Streak",
      subtitle: "Unbroken Momentum & Habit Formation",
      narrativeTemplate: (start, end, rNames) =>
        `A defining milestone of uninterrupted velocity. You maintained a disciplined rhythm of contributions, turning engineering from an occasional activity into an instinctive daily craft.`,
    },
    {
      name: "Expansion Phase",
      subtitle: "Multi-Repository Architecture & Mastery",
      narrativeTemplate: (start, end, rNames) =>
        `Your GitHub footprint broadened into mature multi-repository architectures. With active development spanning ${repos.length || "multiple"} repositories and ${primaryLang}, your trajectory reached full developer velocity.`,
    },
  ];

  const chapters: Chapter[] = [];
  const annotatedEvents = [...events];

  const numChapters = Math.min(6, Math.max(3, Math.floor(total / 4) + 1));
  const effectiveStep = Math.max(1, Math.floor(total / numChapters));

  for (let i = 0; i < numChapters; i++) {
    const startIndex = i * effectiveStep;
    const endIndex = i === numChapters - 1 ? total - 1 : Math.min(total - 1, (i + 1) * effectiveStep - 1);

    const slice = annotatedEvents.slice(startIndex, endIndex + 1);
    const startYear = slice[0]?.year || 2020;
    const endYear = slice[slice.length - 1]?.year || startYear;
    const sliceRepos = Array.from(new Set(slice.map(s => s.repoName).filter(Boolean))) as string[];

    const def = chapterDefinitions[i % chapterDefinitions.length];
    const chapterId = `chapter-${i + 1}`;
    const narrative = def.narrativeTemplate(startYear, endYear, sliceRepos);

    const chapter: Chapter = {
      id: chapterId,
      name: def.name,
      subtitle: def.subtitle,
      narrative,
      startEventIndex: startIndex,
      endEventIndex: endIndex,
      startDate: slice[0]?.date || new Date().toISOString(),
      endDate: slice[slice.length - 1]?.date || new Date().toISOString(),
      totalCommits: slice.filter(s => s.type === "commit").length,
      primaryLanguage: primaryLang,
      highlightRepos: sliceRepos.slice(0, 3),
    };

    chapters.push(chapter);

    // Tag events with chapter info and language colors
    for (let k = startIndex; k <= endIndex; k++) {
      if (annotatedEvents[k]) {
        annotatedEvents[k].chapterId = chapterId;
        annotatedEvents[k].chapterName = def.name;
        annotatedEvents[k].languageColor = getLanguageColor(annotatedEvents[k].language);
      }
    }
  }

  // Detect major streaks and inactive gaps between events
  let currentStreakCounter = 0;
  for (let idx = 0; idx < annotatedEvents.length; idx++) {
    const ev = annotatedEvents[idx];
    if (idx === 0) {
      ev.relativeActivity = "steady";
      ev.streakCount = 1;
      continue;
    }

    const prevEv = annotatedEvents[idx - 1];
    const dayDiff = Math.floor((ev.timestamp - prevEv.timestamp) / (1000 * 60 * 60 * 24));

    if (dayDiff <= 1) {
      currentStreakCounter++;
      ev.relativeActivity = currentStreakCounter > 3 ? "breakthrough" : "high";
    } else {
      if (dayDiff > 25) {
        ev.gapDays = dayDiff;
        ev.relativeActivity = "steady";
      }
      currentStreakCounter = 1;
    }
    ev.streakCount = currentStreakCounter;
  }

  return { chapters, annotatedEvents };
}
