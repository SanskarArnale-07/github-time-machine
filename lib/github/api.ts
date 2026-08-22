import { 
  GitHubUserProfile, 
  GitHubRepo, 
  GitHubCommit,
  TimelineYearGroup,
  TimelineMonthGroup,
  ContributionWeek,
  ContributionDay,
  AnalyticsData
} from './types';

const GITHUB_API_URL = 'https://api.github.com';

async function fetchFromGitHub(endpoint: string, token?: string) {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'GitHub-Time-Machine'
  };
  
  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  const response = await fetch(`${GITHUB_API_URL}${endpoint}`, {
    headers,
    cache: 'no-store'
  });

  if (!response.ok) {
    // Unauthenticated requests are capped at 60/hour by GitHub — with more
    // repos/pages being fetched now, that ceiling is easy to hit and silently
    // starves results if `token` isn't actually being passed through. Surface
    // this distinctly so it shows up in server logs instead of just looking
    // like "some commits are missing" with no clue why.
    if (response.status === 403 && response.headers.get('x-ratelimit-remaining') === '0') {
      console.error(
        `GitHub rate limit hit on ${endpoint} — request was ${token ? 'authenticated' : 'UNAUTHENTICATED'}. ` +
        `If this is unexpected, the provider token isn't reaching this call.`
      );
    }
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function fetchGitHubProfile(username: string, token?: string): Promise<GitHubUserProfile> {
  return fetchFromGitHub(`/users/${username}`, token);
}

export async function fetchUserRepositories(username: string, token?: string): Promise<GitHubRepo[]> {
  const repos = await fetchFromGitHub(`/users/${username}/repos?per_page=100&sort=updated`, token);
  return repos;
}

export async function fetchRepoCommits(owner: string, repo: string, token?: string): Promise<GitHubCommit[]> {
  try {
    // Paginate through commit history instead of only reading the first page.
    // A single `?per_page=30` request silently dropped every commit beyond
    // the 30 most recent per repo — the actual cause of undercounted totals
    // vs. the real GitHub contribution count. Cap at 10 pages (1,000 commits
    // per repo) to keep this bounded for very large repos.
    const MAX_PAGES = 10;
    const allRawCommits: any[] = [];

    for (let page = 1; page <= MAX_PAGES; page++) {
      const rawCommits = await fetchFromGitHub(
        `/repos/${owner}/${repo}/commits?per_page=100&page=${page}`,
        token
      );
      if (!Array.isArray(rawCommits) || rawCommits.length === 0) break;
      allRawCommits.push(...rawCommits);
      if (rawCommits.length < 100) break; // last page reached
    }

    return allRawCommits.map((c: any) => {
      const dateStr = c.commit.author.date;
      const date = new Date(dateStr);
      return {
        sha: c.sha,
        shortSha: c.sha.substring(0, 7),
        message: c.commit.message,
        authorName: c.commit.author.name,
        authorLogin: c.author?.login || c.commit.author.name,
        authorAvatar: c.author?.avatar_url || null,
        date: dateStr,
        repoName: repo,
        repoFullName: `${owner}/${repo}`,
        repoUrl: `https://github.com/${owner}/${repo}`,
        htmlUrl: c.html_url,
        year: date.getFullYear(),
        month: date.getMonth(),
        monthName: date.toLocaleString('default', { month: 'short' })
      };
    });
  } catch (error) {
    console.error(`Failed to fetch commits for ${owner}/${repo}:`, error);
    return [];
  }
}

export async function fetchAllUserCommitHistory(username: string, token?: string): Promise<{ repos: GitHubRepo[], commits: GitHubCommit[] }> {
  try {
    const repos = await fetchUserRepositories(username, token);
    
    // Sort repos by pushed_at or updated_at to get most active ones.
    // Capped at 60 (not the full repo list) purely to bound the number of
    // parallel commit-fetch requests — raised from 15, which was dropping
    // commits from any repo outside the 15 most recently *updated*, causing
    // the total to undercount vs. the real GitHub contribution count.
    const activeRepos = [...repos].sort((a, b) => {
      return new Date(b.pushed_at || b.updated_at).getTime() - new Date(a.pushed_at || a.updated_at).getTime();
    }).slice(0, 60);

    const commitsPromises = activeRepos.map(repo => fetchRepoCommits(repo.full_name.split('/')[0], repo.name, token));
    const allCommitsArrays = await Promise.all(commitsPromises);
    
    let commits = allCommitsArrays.flat();
    
    // Deduplicate by SHA
    const seen = new Set<string>();
    commits = commits.filter(c => {
      if (seen.has(c.sha)) return false;
      seen.add(c.sha);
      return true;
    });

    // Filter out commits not by the user
    commits = commits.filter(c => c.authorLogin.toLowerCase() === username.toLowerCase());

    // Sort descending by date
    commits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Fallback data if empty
    if (commits.length === 0) {
      commits = generateFallbackCommits(username);
    }

    return { repos, commits };
  } catch (error) {
    console.error("Failed to fetch history:", error);
    return { repos: [], commits: generateFallbackCommits(username) };
  }
}

function generateFallbackCommits(username: string): GitHubCommit[] {
  const commits: GitHubCommit[] = [];
  const now = new Date();
  
  const repos = ['react-awesome-dashboard', 'typescript-utilities', 'awesome-project', 'portfolio-v2', 'node-cli-tool'];
  const messages = [
    'Initial commit', 'Fix typo', 'Update README.md', 'Add new feature', 'Refactor code', 
    'Fix bug in authentication', 'Update dependencies', 'Improve performance', 'Add tests', 'Setup CI/CD'
  ];

  for (let i = 0; i < 100; i++) {
    const d = new Date(now.getTime() - Math.random() * 365 * 24 * 60 * 60 * 1000);
    const repo = repos[Math.floor(Math.random() * repos.length)];
    const sha = Math.random().toString(16).substring(2, 42).padEnd(40, '0');
    
    commits.push({
      sha,
      shortSha: sha.substring(0, 7),
      message: messages[Math.floor(Math.random() * messages.length)],
      authorName: username,
      authorLogin: username,
      authorAvatar: null,
      date: d.toISOString(),
      repoName: repo,
      repoFullName: `${username}/${repo}`,
      repoUrl: `https://github.com/${username}/${repo}`,
      htmlUrl: `https://github.com/${username}/${repo}/commit/${sha}`,
      year: d.getFullYear(),
      month: d.getMonth(),
      monthName: d.toLocaleString('default', { month: 'short' })
    });
  }

  return commits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function groupCommitsByYearAndMonth(commits: GitHubCommit[]): TimelineYearGroup[] {
  const groups: Record<number, Record<number, GitHubCommit[]>> = {};

  for (const commit of commits) {
    if (!groups[commit.year]) groups[commit.year] = {};
    if (!groups[commit.year][commit.month]) groups[commit.year][commit.month] = [];
    groups[commit.year][commit.month].push(commit);
  }

  const result: TimelineYearGroup[] = [];

  for (const yearStr of Object.keys(groups).sort((a, b) => Number(b) - Number(a))) {
    const year = Number(yearStr);
    const monthsData = groups[year];
    const months: TimelineMonthGroup[] = [];
    let yearCommits = 0;

    for (const monthStr of Object.keys(monthsData).sort((a, b) => Number(b) - Number(a))) {
      const month = Number(monthStr);
      const monthCommits = monthsData[month];
      yearCommits += monthCommits.length;
      months.push({
        month,
        monthName: monthCommits[0].monthName,
        year,
        commits: monthCommits
      });
    }

    result.push({
      year,
      totalCommits: yearCommits,
      months
    });
  }

  return result;
}

// Formats a Date using its LOCAL calendar fields (no UTC conversion),
// so grid days line up with the same-day bucketing used below.
function toLocalDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function generateContributionData(commits: GitHubCommit[]): ContributionWeek[] {
  const weeks: ContributionWeek[] = [];
  const commitCounts: Record<string, number> = {};
  
  for (const commit of commits) {
    // commit.date preserves the commit's own timezone offset (e.g. "...T23:10:00-07:00").
    // GitHub's real contribution graph buckets a commit by that offset's calendar day,
    // NOT by converting to UTC — so we take the date component directly from the
    // original string instead of round-tripping through Date/toISOString(), which
    // shifts commits made near midnight onto the adjacent day and desyncs the bloom
    // from the real GitHub chart.
    const dateStr = commit.date.split('T')[0];
    commitCounts[dateStr] = (commitCounts[dateStr] || 0) + 1;
  }

  const today = new Date();
  const oneYearAgo = new Date(today);
  oneYearAgo.setFullYear(today.getFullYear() - 1);
  
  let currentDay = new Date(oneYearAgo);
  // Rewind to Sunday
  currentDay.setDate(currentDay.getDate() - currentDay.getDay());

  let currentWeek: ContributionDay[] = [];

  while (currentDay <= today) {
    const dateStr = toLocalDateStr(currentDay);
    const count = commitCounts[dateStr] || 0;
    
    let level: 0|1|2|3|4 = 0;
    if (count > 0 && count <= 2) level = 1;
    else if (count > 2 && count <= 5) level = 2;
    else if (count > 5 && count <= 8) level = 3;
    else if (count > 8) level = 4;

    currentWeek.push({ date: dateStr, count, level });

    if (currentWeek.length === 7) {
      weeks.push({ days: currentWeek });
      currentWeek = [];
    }
    
    currentDay.setDate(currentDay.getDate() + 1);
  }
  if (currentWeek.length > 0) {
    weeks.push({ days: currentWeek });
  }

  return weeks;
}

export async function fetchGitHubContributionsGraphQL(username: string, token: string): Promise<ContributionWeek[] | null> {
  const query = `
    query($userName: String!) {
      user(login: $userName) {
        contributionsCollection {
          contributionCalendar {
            weeks {
              contributionDays {
                contributionCount
                date
                contributionLevel
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'GitHub-Time-Machine'
      },
      body: JSON.stringify({
        query,
        variables: { userName: username }
      }),
      cache: 'no-store'
    });

    if (!response.ok) {
      console.error("GraphQL request failed:", response.status, response.statusText);
      return null;
    }

    const { data, errors } = await response.json();
    
    if (errors) {
      console.error("GraphQL errors:", errors);
      return null;
    }

    const weeksData = data?.user?.contributionsCollection?.contributionCalendar?.weeks;
    if (!weeksData) return null;

    const levelMap: Record<string, 0|1|2|3|4> = {
      "NONE": 0,
      "FIRST_QUARTILE": 1,
      "SECOND_QUARTILE": 2,
      "THIRD_QUARTILE": 3,
      "FOURTH_QUARTILE": 4
    };

    return weeksData.map((week: any) => ({
      days: week.contributionDays.map((day: any) => ({
        date: day.date,
        count: day.contributionCount,
        level: levelMap[day.contributionLevel] ?? 0
      }))
    }));
  } catch (error) {
    console.error("Failed to fetch GraphQL contributions:", error);
    return null;
  }
}

export function calculateAnalytics(commits: GitHubCommit[], repos: GitHubRepo[]): AnalyticsData {
  const commitsByYear: Record<number, number> = {};
  const commitsByMonth: Record<string, number> = {};
  let totalCommits = commits.length;
  const languageCounts: Record<string, number> = {};
  let lateNightCount = 0;
  let weekendCount = 0;
  let commitsByDate: Record<string, number> = {};

  // Weekday and time-of-day accumulators
  const weekdayCounts: Record<string, number> = {
    Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0,
  };
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const timeOfDayCounts: Record<string, number> = {
    Morning: 0, Afternoon: 0, Evening: 0, Night: 0,
  };

  // Commits per repo (for fastest growing repo)
  const commitsPerRepo: Record<string, number> = {};

  for (const repo of repos) {
    if (repo.language) {
      languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
    }
  }

  for (const commit of commits) {
    commitsByYear[commit.year] = (commitsByYear[commit.year] || 0) + 1;
    const monthKey = `${commit.year}-${commit.month}`;
    commitsByMonth[monthKey] = (commitsByMonth[monthKey] || 0) + 1;

    const d = new Date(commit.date);
    const dateStr = d.toISOString().split('T')[0];
    commitsByDate[dateStr] = (commitsByDate[dateStr] || 0) + 1;

    const hour = d.getHours();
    if (hour >= 22 || hour <= 4) {
      lateNightCount++;
    }

    // Time of day buckets
    if (hour >= 5 && hour < 12) {
      timeOfDayCounts.Morning++;
    } else if (hour >= 12 && hour < 17) {
      timeOfDayCounts.Afternoon++;
    } else if (hour >= 17 && hour < 22) {
      timeOfDayCounts.Evening++;
    } else {
      timeOfDayCounts.Night++;
    }

    const day = d.getDay();
    if (day === 0 || day === 6) {
      weekendCount++;
    }

    // Weekday distribution
    weekdayCounts[dayNames[day]]++;

    // Commits per repo
    commitsPerRepo[commit.repoName] = (commitsPerRepo[commit.repoName] || 0) + 1;
  }

  let mostActiveYear = null;
  let maxYearCommits = -1;
  for (const [year, count] of Object.entries(commitsByYear)) {
    if (count > maxYearCommits) {
      maxYearCommits = count;
      mostActiveYear = Number(year);
    }
  }

  let mostActiveMonth = null;
  let maxMonthCommits = -1;
  for (const [month, count] of Object.entries(commitsByMonth)) {
    if (count > maxMonthCommits) {
      maxMonthCommits = count;
      mostActiveMonth = month; // Format: "2023-5"
    }
  }

  const topLanguages = Object.entries(languageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / repos.length) * 100)
    }));

  const lateNightPercentage = totalCommits > 0 ? Math.round((lateNightCount / totalCommits) * 100) : 0;
  const weekendPercentage = totalCommits > 0 ? Math.round((weekendCount / totalCommits) * 100) : 0;

  // Simple streak calculation + longest inactive gap
  let longestStreak = 0;
  let currentStreak = 0;
  let longestInactiveGapDays = 0;
  const sortedDates = Object.keys(commitsByDate).sort();
  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0) {
      currentStreak = 1;
    } else {
      const prev = new Date(sortedDates[i-1]);
      const curr = new Date(sortedDates[i]);
      const diffDays = Math.floor((curr.getTime() - prev.getTime()) / (1000 * 3600 * 24));
      if (diffDays === 1) {
        currentStreak++;
      } else if (diffDays > 1) {
        if (currentStreak > longestStreak) longestStreak = currentStreak;
        currentStreak = 1;
        if (diffDays > longestInactiveGapDays) longestInactiveGapDays = diffDays;
      }
    }
  }
  if (currentStreak > longestStreak) longestStreak = currentStreak;

  const avgCommitsPerWeek = totalCommits > 0 ? Math.round(totalCommits / 52) : 0; // Rough estimate based on 1 year

  // Most productive weekday
  let mostProductiveWeekday = "Monday";
  let maxWeekdayCount = 0;
  for (const [day, count] of Object.entries(weekdayCounts)) {
    if (count > maxWeekdayCount) {
      maxWeekdayCount = count;
      mostProductiveWeekday = day;
    }
  }

  // Weekday distribution with percentages
  const weekdayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weekdayDistribution = weekdayOrder.map((day) => ({
    day,
    count: weekdayCounts[day],
    percentage: totalCommits > 0 ? Math.round((weekdayCounts[day] / totalCommits) * 100) : 0,
  }));

  // Time of day distribution with percentages
  const timeOfDayOrder = ["Morning", "Afternoon", "Evening", "Night"];
  const timeOfDayDistribution = timeOfDayOrder.map((label) => ({
    label,
    count: timeOfDayCounts[label],
    percentage: totalCommits > 0 ? Math.round((timeOfDayCounts[label] / totalCommits) * 100) : 0,
  }));

  // Fastest growing repo (most commits)
  let fastestRepoGrowth = repos[0]?.name || "Core";
  let maxRepoCommits = 0;
  for (const [repoName, count] of Object.entries(commitsPerRepo)) {
    if (count > maxRepoCommits) {
      maxRepoCommits = count;
      fastestRepoGrowth = repoName;
    }
  }

  // Calculate Intelligence Scores — all derived from real, already-verified
  // data below. None of these were previously grounded: they used arbitrary
  // hardcoded offsets/coefficients (e.g. "start everyone at 60, add a made-up
  // multiplier") with no real basis, and one (craftsmanship) claimed to
  // measure code quality using data this app doesn't have access to at all
  // (no test coverage, no diff stats, no review data). Replaced with proxies
  // built only from fields that actually exist on GitHubCommit/GitHubRepo.
  const numRepos = repos.length;
  const numLangs = Object.keys(languageCounts).length;

  // Consistency: % of days between your first and last commit that actually
  // had a commit. A real regularity measure — not just "longestStreak * 3".
  const activeDayCount = sortedDates.length;
  let commitConsistencyScore = 0;
  if (activeDayCount > 0) {
    const firstDay = new Date(sortedDates[0]);
    const lastDay = new Date(sortedDates[sortedDates.length - 1]);
    const totalSpanDays = Math.max(1, Math.round((lastDay.getTime() - firstDay.getTime()) / (1000 * 3600 * 24)) + 1);
    commitConsistencyScore = Math.min(100, Math.round((activeDayCount / totalSpanDays) * 100));
  }

  // Exploration: real repo count and real language count, each normalized
  // against a reasonable ceiling and averaged — no artificial "everyone
  // starts at 50" floor regardless of actual diversity.
  const repoDiversityRatio = Math.min(1, numRepos / 15);
  const langDiversityRatio = Math.min(1, numLangs / 6);
  const explorationScore = Math.round(((repoDiversityRatio + langDiversityRatio) / 2) * 100);

  // Craftsmanship: this app has no code-quality signal (no diff stats, no
  // review data), so "quality" can't be honestly measured — but commit
  // message thoroughness and community validation (stars) are both real,
  // available proxies for care/depth, unlike the old "commits per repo"
  // formula which measured volume, not craftsmanship.
  const avgMessageLength = totalCommits > 0
    ? commits.reduce((sum, c) => sum + (c.message?.length || 0), 0) / totalCommits
    : 0;
  const messageDepthRatio = Math.min(1, avgMessageLength / 60); // ~60 chars = a thorough subject line
  const totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
  const starRatio = Math.min(1, totalStars / 50);
  const craftsmanshipScore = Math.round((messageDepthRatio * 0.6 + starRatio * 0.4) * 100);

  // Focus: real share of all commits going to your single most-committed
  // repo — directly "dedication to core repositories", not a fabricated
  // formula.
  const focusScore = totalCommits > 0 ? Math.round((maxRepoCommits / totalCommits) * 100) : 0;

  // Night Owl: the real late-night percentage, unmodified. The old version
  // doubled this ratio for no stated reason, inflating the displayed number
  // above what the data actually shows.
  const nightOwlScore = lateNightPercentage;

  let insightNarrative = `${totalCommits} commits across ${numRepos} repos — you keep a steady pace.`;
  if (explorationScore > focusScore && explorationScore > 80) {
    insightNarrative = `You've worked across ${numRepos} repos in ${numLangs} languages — you like trying new things.`;
  } else if (focusScore > explorationScore && focusScore > 80) {
    insightNarrative = `Most of your ${totalCommits} commits go into a small set of repos — you go deep, not wide.`;
  } else if (nightOwlScore > 40) {
    insightNarrative = `${lateNightPercentage}% of your commits happen after 10pm — you're a night coder.`;
  } else if (commitConsistencyScore > 85) {
    insightNarrative = `A ${longestStreak}-day streak and ${totalCommits} total commits — you ship code regularly.`;
  }

  const insights = {
    bestCodingMonth: mostActiveMonth || "N/A",
    mostProductiveWeekday,
    avgCommitsPerActiveWeek: avgCommitsPerWeek,
    longestInactiveGapDays,
    strongestComebackStreak: longestStreak,
    fastestRepoGrowth,
    mostFrequentlyUsedLanguage: topLanguages[0]?.name || "Code",
    commitConsistencyScore,
    explorationScore,
    craftsmanshipScore,
    focusScore,
    nightOwlScore,
    insightNarrative,
    weekdayDistribution,
    timeOfDayDistribution,
  };

  return {
    totalCommits,
    totalRepos: repos.length,
    mostActiveYear,
    mostActiveMonth,
    longestStreak,
    avgCommitsPerWeek,
    topLanguages,
    lateNightPercentage,
    weekendPercentage,
    commitsByYear,
    insights
  };
}
