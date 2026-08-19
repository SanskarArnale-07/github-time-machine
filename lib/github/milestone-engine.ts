import { GitHubCommit, GitHubRepo } from "./types";

export interface DeveloperMilestone {
  id: string;
  type: 
    | 'beginning'
    | 'first_breakthrough'
    | 'first_100_commits'
    | 'longest_streak'
    | 'most_active_month'
    | 'most_active_repository'
    | 'language_expansion'
    | 'biggest_refactor'
    | 'longest_break'
    | 'return_comeback'
    | 'major_project'
    | 'latest_chapter';
  title: string;
  date: string;
  repository?: string | null;
  commit?: GitHubCommit | null;
  description: string;
  numericData?: number | null;
}

export function detectDeveloperMilestones(
  rawCommits: GitHubCommit[],
  repositories: GitHubRepo[]
): DeveloperMilestone[] {
  const milestones: DeveloperMilestone[] = [];

  if (!rawCommits || rawCommits.length === 0) {
    return milestones;
  }

  // Ensure commits are sorted chronologically
  const commits = [...rawCommits].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // 1. The Beginning
  const firstCommit = commits[0];
  milestones.push({
    id: 'beginning',
    type: 'beginning',
    title: 'The Beginning',
    date: firstCommit.date,
    repository: firstCommit.repoName,
    commit: firstCommit,
    description: `The very first commit, marking the start of the journey in ${firstCommit.repoName}.`
  });

  // 2. First Breakthrough
  let breakthrough = commits.slice(1).find(c => {
    const msg = c.message.toLowerCase();
    return msg.includes('feat') || msg.includes('add') || msg.includes('implement') || msg.includes('release') || msg.length > 50;
  });
  if (!breakthrough && commits.length > 1) {
    breakthrough = commits[1];
  }
  if (breakthrough) {
    const cleanMsg = breakthrough.message.split('\n')[0].substring(0, 45);
    milestones.push({
      id: 'first_breakthrough',
      type: 'first_breakthrough',
      title: 'First Breakthrough',
      date: breakthrough.date,
      repository: breakthrough.repoName,
      commit: breakthrough,
      description: `A meaningful leap forward with "${cleanMsg}".`
    });
  }

  // 3. First 100 Commits
  if (commits.length >= 100) {
    const hundredth = commits[99];
    milestones.push({
      id: 'first_100_commits',
      type: 'first_100_commits',
      title: 'First 100 Commits',
      date: hundredth.date,
      repository: hundredth.repoName,
      commit: hundredth,
      description: 'Reached the 100 commits milestone, showing consistent dedication.',
      numericData: 100
    });
  }

  // Track daily streaks, breaks, and repo stats
  let longestStreak = 0;
  let currentStreak = 0;
  let longestStreakEndDate = '';

  let longestBreak = 0;
  let longestBreakStartDate = '';
  let longestBreakEndDate = '';
  let longestBreakCommit: GitHubCommit | undefined;

  const commitDays = Array.from(
    new Set(commits.map(c => new Date(c.date).toISOString().substring(0, 10)))
  ).sort();

  for (let i = 0; i < commitDays.length; i++) {
    if (i === 0) {
      currentStreak = 1;
      longestStreak = 1;
      longestStreakEndDate = commitDays[i];
      continue;
    }

    // Parse at UTC midnight to avoid timezone shifts
    const currDate = new Date(`${commitDays[i]}T00:00:00Z`);
    const prevDate = new Date(`${commitDays[i - 1]}T00:00:00Z`);
    const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      currentStreak++;
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
        longestStreakEndDate = commitDays[i];
      }
    } else if (diffDays > 1) {
      currentStreak = 1;
      if (diffDays > longestBreak) {
        longestBreak = diffDays;
        longestBreakStartDate = commitDays[i - 1];
        longestBreakEndDate = commitDays[i];
        
        longestBreakCommit = commits.find(c => {
          const cDate = new Date(c.date).toISOString().substring(0, 10);
          return cDate === longestBreakEndDate;
        });
      }
    }
  }

  // 4. Longest Streak
  if (longestStreak >= 3) {
    const streakCommit = commits.find(c => new Date(c.date).toISOString().substring(0, 10) === longestStreakEndDate) || commits[commits.length - 1];
    milestones.push({
      id: 'longest_streak',
      type: 'longest_streak',
      title: 'Longest Streak',
      date: streakCommit.date,
      repository: streakCommit.repoName,
      commit: streakCommit,
      description: `Coded for ${longestStreak} consecutive days, showing incredible momentum.`,
      numericData: longestStreak
    });
  }

  // 5. Most Active Month
  const monthCounts: Record<string, number> = {};
  const monthFirstCommit: Record<string, GitHubCommit> = {};
  
  for (const c of commits) {
    const monthKey = new Date(c.date).toISOString().substring(0, 7); // YYYY-MM
    monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
    if (!monthFirstCommit[monthKey]) {
      monthFirstCommit[monthKey] = c;
    }
  }

  let mostActiveMonthKey = '';
  let maxMonthCommits = 0;
  for (const [key, count] of Object.entries(monthCounts)) {
    if (count > maxMonthCommits) {
      maxMonthCommits = count;
      mostActiveMonthKey = key;
    }
  }

  if (mostActiveMonthKey && maxMonthCommits > 0) {
    const monthCommit = monthFirstCommit[mostActiveMonthKey];
    
    // Format YYYY-MM into a readable string like "January 2023"
    const [year, month] = mostActiveMonthKey.split('-');
    const dateObj = new Date(Number(year), Number(month) - 1);
    const readableMonth = dateObj.toLocaleString('default', { month: 'long', year: 'numeric' });

    milestones.push({
      id: 'most_active_month',
      type: 'most_active_month',
      title: 'Most Active Month',
      date: monthCommit.date,
      repository: monthCommit.repoName,
      commit: monthCommit,
      description: `Peaked at ${maxMonthCommits} commits in ${readableMonth}, making it the most active month.`,
      numericData: maxMonthCommits
    });
  }

  // 6. Most Active Repository & 11. Major Project
  interface RepoStats {
    commits: number;
    activeDays: Set<string>;
    firstCommit?: GitHubCommit;
    lastCommit?: GitHubCommit;
  }
  const repoStats: Record<string, RepoStats> = {};

  for (const c of commits) {
    if (!repoStats[c.repoName]) {
      repoStats[c.repoName] = { commits: 0, activeDays: new Set() };
    }
    repoStats[c.repoName].commits++;
    repoStats[c.repoName].activeDays.add(new Date(c.date).toISOString().substring(0, 10));
    if (!repoStats[c.repoName].firstCommit) repoStats[c.repoName].firstCommit = c;
    repoStats[c.repoName].lastCommit = c;
  }

  let mostActiveRepo = '';
  let maxRepoCommits = 0;
  
  let majorProjectRepo = '';
  let maxRepoScore = 0;

  for (const [repo, stats] of Object.entries(repoStats)) {
    if (stats.commits > maxRepoCommits) {
      maxRepoCommits = stats.commits;
      mostActiveRepo = repo;
    }
    
    const score = stats.commits * stats.activeDays.size;
    if (score > maxRepoScore) {
      maxRepoScore = score;
      majorProjectRepo = repo;
    }
  }

  if (mostActiveRepo) {
    const latestCommit = repoStats[mostActiveRepo].lastCommit;
    milestones.push({
      id: 'most_active_repository',
      type: 'most_active_repository',
      title: 'Most Active Repository',
      date: latestCommit?.date || new Date().toISOString(),
      repository: mostActiveRepo,
      commit: latestCommit,
      description: `Dedicated ${maxRepoCommits} commits to ${mostActiveRepo}, making it the most active repository.`,
      numericData: maxRepoCommits
    });
  }

  if (majorProjectRepo && maxRepoScore > 0) {
    const stats = repoStats[majorProjectRepo];
    if (stats.activeDays.size >= 2) {
      milestones.push({
        id: 'major_project',
        type: 'major_project',
        title: 'Major Project',
        date: stats.lastCommit?.date || new Date().toISOString(),
        repository: majorProjectRepo,
        commit: stats.lastCommit,
        description: `${majorProjectRepo} emerged as a major project with sustained activity over ${stats.activeDays.size} days.`,
        numericData: stats.activeDays.size
      });
    }
  }

  // 7. Language Expansion
  const repoLangMap: Record<string, string | null> = {};
  if (repositories) {
    for (const r of repositories) {
      repoLangMap[r.name] = r.language;
    }
  }

  let firstLang = null;
  let languageExpansionCommit: GitHubCommit | undefined = undefined;

  for (const c of commits) {
    const lang = repoLangMap[c.repoName];
    if (lang && !firstLang) {
      firstLang = lang;
    } else if (lang && firstLang && lang !== firstLang) {
      languageExpansionCommit = c;
      break;
    }
  }

  if (languageExpansionCommit && firstLang) {
    const newLang = repoLangMap[languageExpansionCommit.repoName];
    milestones.push({
      id: 'language_expansion',
      type: 'language_expansion',
      title: 'Language Expansion',
      date: languageExpansionCommit.date,
      repository: languageExpansionCommit.repoName,
      commit: languageExpansionCommit,
      description: `Expanded technical horizons by writing ${newLang}, transitioning from ${firstLang}.`
    });
  }

  // 8. Biggest Refactor
  let biggestRefactorCommit: GitHubCommit | undefined = undefined;
  let maxRefactorLength = 0;

  for (const c of commits) {
    const msgLower = c.message.toLowerCase();
    if (msgLower.includes('refactor') || msgLower.includes('rewrite') || msgLower.includes('restructure') || msgLower.includes('optimiz')) {
      if (c.message.length > maxRefactorLength) {
        maxRefactorLength = c.message.length;
        biggestRefactorCommit = c;
      }
    }
  }

  if (biggestRefactorCommit) {
    const cleanMsg = biggestRefactorCommit.message.split('\n')[0].substring(0, 45);
    milestones.push({
      id: 'biggest_refactor',
      type: 'biggest_refactor',
      title: 'Biggest Refactor',
      date: biggestRefactorCommit.date,
      repository: biggestRefactorCommit.repoName,
      commit: biggestRefactorCommit,
      description: `Undertook a major refactor: "${cleanMsg}".`
    });
  }

  // 9. Longest Break & 10. Return / Comeback
  if (longestBreak >= 14 && longestBreakCommit) {
    milestones.push({
      id: 'longest_break',
      type: 'longest_break',
      title: 'Longest Break',
      date: new Date(`${longestBreakStartDate}T00:00:00Z`).toISOString(),
      description: `Took a well-deserved break for ${longestBreak} days.`,
      numericData: longestBreak
    });

    milestones.push({
      id: 'return_comeback',
      type: 'return_comeback',
      title: 'The Comeback',
      date: longestBreakCommit.date,
      repository: longestBreakCommit.repoName,
      commit: longestBreakCommit,
      description: `Returned to coding after ${longestBreak} days with renewed focus.`,
      numericData: longestBreak
    });
  }

  // 12. Latest Chapter
  let latestChapterCommit: GitHubCommit | undefined = undefined;
  const noiseKeywords = ['bump', 'merge', 'chore', 'ci', 'test', 'wip', 'dummy', 'lint', 'update readme.md', 'initial commit'];
  
  for (let i = commits.length - 1; i >= 0; i--) {
    const c = commits[i];
    const msgLower = c.message.toLowerCase();
    
    let isNoise = false;
    for (const k of noiseKeywords) {
      if (msgLower.startsWith(k) || msgLower.includes(` ${k} `) || msgLower.includes(`(${k})`)) {
        isNoise = true;
        break;
      }
    }
    
    if (msgLower === 'update' || msgLower.length < 5) {
      isNoise = true;
    }

    if (!isNoise) {
      latestChapterCommit = c;
      break;
    }
  }

  if (!latestChapterCommit && commits.length > 0) {
    latestChapterCommit = commits[commits.length - 1];
  }

  if (latestChapterCommit) {
    const cleanMsg = latestChapterCommit.message.split('\n')[0].substring(0, 45);
    milestones.push({
      id: 'latest_chapter',
      type: 'latest_chapter',
      title: 'Latest Chapter',
      date: latestChapterCommit.date,
      repository: latestChapterCommit.repoName,
      commit: latestChapterCommit,
      description: `Most recent major update: "${cleanMsg}".`
    });
  }

  return milestones;
}
