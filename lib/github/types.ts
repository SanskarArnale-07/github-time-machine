export interface GitHubUserProfile {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  company: string | null;
  location: string | null;
  blog: string | null;
  twitter_username: string | null;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  pushed_at: string;
  created_at: string;
  default_branch: string;
  private: boolean;
  fork: boolean;
}

export interface GitHubCommit {
  sha: string;
  shortSha: string;
  message: string;
  authorName: string;
  authorLogin: string;
  authorAvatar: string | null;
  date: string;
  repoName: string;
  repoFullName: string;
  repoUrl: string;
  htmlUrl: string;
  year: number;
  month: number;
  monthName: string;
}

export interface TimelineMonthGroup {
  month: number;
  monthName: string;
  year: number;
  commits: GitHubCommit[];
}

export interface TimelineYearGroup {
  year: number;
  totalCommits: number;
  months: TimelineMonthGroup[];
}

export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface ContributionWeek {
  days: ContributionDay[];
}

export interface AnalyticsData {
  totalCommits: number;
  totalRepos: number;
  mostActiveYear: number | null;
  mostActiveMonth: string | null;
  longestStreak: number;
  avgCommitsPerWeek: number;
  topLanguages: { name: string; count: number; percentage: number }[];
  lateNightPercentage: number;
  weekendPercentage: number;
  commitsByYear: Record<number, number>;
}

export interface ReplayState {
  isPlaying: boolean;
  currentIndex: number;
  speed: 1 | 2 | 5;
  total: number;
}

export type ReplayEventType =
  | "commit"
  | "repo_created"
  | "year_milestone"
  | "major_streak"
  | "inactive_period";

export interface ReplayEvent {
  id: string;
  type: ReplayEventType;
  date: string;
  timestamp: number;
  year: number;
  month: number;
  monthName: string;
  title: string;
  subtitle?: string;
  description?: string;
  repoName?: string;
  repoUrl?: string;
  commitSha?: string;
  commitShortSha?: string;
  authorName?: string;
  authorAvatar?: string | null;
  language?: string;
  languageColor?: string;
  stargazersCount?: number;
  streakCount?: number;
  gapDays?: number;
  relativeActivity?: "high" | "medium" | "steady" | "breakthrough";
  chapterId?: string;
  chapterName?: string;
  impactBadge?: string;
  impactDescription?: string;
  impactType?: "milestone" | "streak" | "language" | "comeback" | "volume" | "repository";
  commit?: GitHubCommit;
  repo?: GitHubRepo;
}

export interface Chapter {
  id: string;
  name: string;
  subtitle: string;
  narrative: string;
  startEventIndex: number;
  endEventIndex: number;
  startDate: string;
  endDate: string;
  totalCommits: number;
  primaryLanguage?: string;
  highlightRepos: string[];
}

export interface ReplayStats {
  currentYear: number;
  currentRepo: string;
  currentStreak: number;
  commitsReplayed: number;
  remainingEvents: number;
  elapsedSeconds: number;
  formattedDuration: string;
}

export interface DeveloperInsights {
  bestCodingMonth: string;
  mostProductiveWeekday: string;
  avgCommitsPerActiveWeek: number;
  longestInactiveGapDays: number;
  strongestComebackStreak: number;
  fastestRepoGrowth: string;
  mostFrequentlyUsedLanguage: string;
  commitConsistencyScore: number; // 0 to 100
  weekdayDistribution: { day: string; count: number; percentage: number }[];
  timeOfDayDistribution: { label: string; count: number; percentage: number }[];
}
