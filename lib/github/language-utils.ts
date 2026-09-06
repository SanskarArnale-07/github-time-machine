import type { GitHubCommit, GitHubRepo } from "./types";

export interface LanguageMixItem {
  name: string;
  percentage: number;
  commitCount: number;
}

export interface AggregateLanguageStats {
  mostUsedLanguage: string;
  languageMix?: LanguageMixItem[];
  hasReliablePercentages: boolean;
}

/**
 * Builds a fast, case-insensitive repository-to-language lookup map
 * from the user's public repositories.
 */
export function buildRepoLanguageMap(repos: GitHubRepo[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const repo of repos) {
    if (repo.language) {
      if (repo.name) {
        map.set(repo.name.toLowerCase(), repo.language);
      }
      if (repo.full_name) {
        map.set(repo.full_name.toLowerCase(), repo.language);
      }
    }
  }
  return map;
}

/**
 * Calculates aggregate language usage and distribution across the developer's
 * public GitHub activity.
 *
 * Rules:
 * 1. Counts commits across repositories with identified languages.
 * 2. If commit activity is available (total commits with a language > 0):
 *    - The language with the highest commit activity is the `mostUsedLanguage`.
 *    - `languageMix` contains the distribution with real, rounded percentages.
 *    - `hasReliablePercentages` is true.
 * 3. If no commit language activity is available (0 commits or all commits in repos without a language):
 *    - Falls back to repository counts to pick `mostUsedLanguage` (or "N/A" if no repo languages).
 *    - `languageMix` is undefined (percentages are not fabricated).
 *    - `hasReliablePercentages` is false.
 */
export function calculateAggregateLanguageStats(
  commits: GitHubCommit[],
  repos: GitHubRepo[]
): AggregateLanguageStats {
  const repoLangMap = buildRepoLanguageMap(repos);

  // 1. Tally commits per language
  const commitCountsByLang: Record<string, number> = {};
  let totalLanguageCommits = 0;

  for (const commit of commits) {
    const lang =
      (commit.repoFullName && repoLangMap.get(commit.repoFullName.toLowerCase())) ||
      (commit.repoName && repoLangMap.get(commit.repoName.toLowerCase()));

    if (lang) {
      commitCountsByLang[lang] = (commitCountsByLang[lang] || 0) + 1;
      totalLanguageCommits++;
    }
  }

  // 2. If we have commit activity for at least one language:
  if (totalLanguageCommits > 0) {
    const sortedLangs = Object.entries(commitCountsByLang).sort((a, b) => {
      // Sort by commit count descending, then alphabetically
      if (b[1] !== a[1]) return b[1] - a[1];
      return a[0].localeCompare(b[0]);
    });

    const mostUsedLanguage = sortedLangs[0][0];

    const rawMix = sortedLangs.map(([name, count]) => ({
      name,
      commitCount: count,
      percentage: Math.round((count / totalLanguageCommits) * 100),
    }));

    // Filter to top languages with percentage > 0 (up to 5)
    const languageMix = rawMix
      .filter((item) => item.percentage > 0)
      .slice(0, 5);

    return {
      mostUsedLanguage,
      languageMix,
      hasReliablePercentages: true,
    };
  }

  // 3. Fallback when no commit language data is available (e.g., 0 commits loaded)
  const repoCountsByLang: Record<string, number> = {};
  for (const repo of repos) {
    if (repo.language) {
      repoCountsByLang[repo.language] = (repoCountsByLang[repo.language] || 0) + 1;
    }
  }

  const sortedRepoLangs = Object.entries(repoCountsByLang).sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return a[0].localeCompare(b[0]);
  });

  const fallbackLanguage = sortedRepoLangs[0]?.[0] || "N/A";

  return {
    mostUsedLanguage: fallbackLanguage,
    languageMix: undefined,
    hasReliablePercentages: false,
  };
}

/**
 * Returns the primary language for a single repository documentary.
 */
export function getSingleRepoLanguage(
  repo?: GitHubRepo,
  commits: GitHubCommit[] = []
): string {
  if (repo?.language) {
    return repo.language;
  }
  // If repo object lacks language, try checking any commit from that repo
  if (commits.length > 0) {
    const repoLangMap = buildRepoLanguageMap(repo ? [repo] : []);
    const lang =
      (commits[0].repoFullName && repoLangMap.get(commits[0].repoFullName.toLowerCase())) ||
      (commits[0].repoName && repoLangMap.get(commits[0].repoName.toLowerCase()));
    if (lang) return lang;
  }
  return "N/A";
}
