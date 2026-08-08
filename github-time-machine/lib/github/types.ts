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
  pushed_at: string | null;
  created_at: string;
  default_branch?: string;
  private: boolean;
}

export interface GitHubCommit {
  sha: string;
  shortSha: string;
  message: string;
  authorName: string;
  authorLogin?: string;
  authorAvatar?: string;
  date: string; // ISO 8601
  repoName: string;
  repoFullName: string;
  repoUrl: string;
  htmlUrl: string;
  year: number;
  month: number; // 0-11
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

export interface ReplayPlaybackState {
  isPlaying: boolean;
  currentIndex: number;
  speed: 1 | 2 | 5;
  total: number;
}
