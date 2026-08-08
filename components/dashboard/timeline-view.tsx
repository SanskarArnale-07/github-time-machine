"use client";
import React, { useState, useMemo } from "react";
import { TimelineYearGroup, GitHubRepo } from "@/lib/github/types";
import { Search, GitCommit } from "lucide-react";

interface TimelineViewProps {
  yearGroups: TimelineYearGroup[];
  repos: GitHubRepo[];
  totalCommits: number;
}

export function TimelineView({
  yearGroups,
  repos,
  totalCommits,
}: TimelineViewProps) {
  const [search, setSearch] = useState("");
  const [selectedRepo, setSelectedRepo] = useState<string>("all");

  const filteredData = useMemo(() => {
    return yearGroups
      .map((yearGroup) => {
        const filteredMonths = yearGroup.months
          .map((month) => {
            const filteredCommits = month.commits.filter((commit) => {
              const matchesSearch =
                commit.message.toLowerCase().includes(search.toLowerCase()) ||
                commit.repoName.toLowerCase().includes(search.toLowerCase()) ||
                commit.sha.toLowerCase().includes(search.toLowerCase());
              const matchesRepo =
                selectedRepo === "all" || commit.repoName === selectedRepo;
              return matchesSearch && matchesRepo;
            });
            return { ...month, commits: filteredCommits };
          })
          .filter((month) => month.commits.length > 0);

        return { ...yearGroup, months: filteredMonths };
      })
      .filter((yearGroup) => yearGroup.months.length > 0);
  }, [yearGroups, search, selectedRepo]);

  const getRelativeTime = (dateString: string) => {
    try {
      const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
      const diff = new Date().getTime() - new Date(dateString).getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      if (days < 30) return rtf.format(-Math.max(1, days), "day");
      const months = Math.floor(days / 30);
      if (months < 12) return rtf.format(-months, "month");
      return rtf.format(-Math.floor(months / 12), "year");
    } catch {
      return "recently";
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="font-display text-2xl text-ivory">Commit History</h2>
          <p className="mt-1 text-xs text-muted">
            {totalCommits} commits grouped by year and month
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search commits..."
              className="w-full rounded-lg border border-ink-border bg-ink-soft py-2 pl-9 pr-4 text-sm text-ivory placeholder-muted focus:border-brass focus:outline-none md:w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="cursor-pointer rounded-lg border border-ink-border bg-ink-soft px-4 py-2 text-sm text-ivory focus:border-brass focus:outline-none"
            value={selectedRepo}
            onChange={(e) => setSelectedRepo(e.target.value)}
            aria-label="Filter by repository"
          >
            <option value="all">All repositories</option>
            {repos.map((repo) => (
              <option key={repo.name} value={repo.name}>
                {repo.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="relative ml-4 space-y-12 border-l border-ink-border pl-6 md:ml-6 md:pl-10">
        {filteredData.map((year) => (
          <div key={year.year} className="relative">
            <div className="absolute -left-[43px] top-0 flex h-10 w-10 items-center justify-center rounded-full border-2 border-brass bg-ink shadow-lg md:-left-[59px]">
              <span className="font-display text-sm font-bold text-brass">
                {year.year.toString().slice(-2)}&apos;
              </span>
            </div>

            <div className="mb-6 flex items-center gap-4">
              <h3 className="font-display text-3xl font-bold text-ivory">
                {year.year}
              </h3>
              <span className="rounded-full border border-ink-border bg-ink-soft px-3 py-1 font-mono text-xs text-muted">
                {year.months.reduce((acc, m) => acc + m.commits.length, 0)}{" "}
                commits
              </span>
            </div>

            <div className="space-y-10">
              {year.months.map((month) => (
                <div key={month.month} className="space-y-4">
                  <h4 className="font-mono text-xs uppercase tracking-wider text-brass-light">
                    {month.monthName} {year.year}
                  </h4>

                  <div className="space-y-3">
                    {month.commits.map((commit) => (
                      <div
                        key={commit.sha}
                        className="group rounded-xl border border-ink-border bg-ink-surface p-4 shadow-sm transition-colors hover:border-commit-300/50"
                      >
                        <div className="mb-2 flex flex-col justify-between gap-2 md:flex-row md:items-center">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-md border border-commit-200/20 bg-commit-100/10 px-2 py-0.5 font-mono text-xs font-medium text-commit-300">
                              {commit.repoName}
                            </span>
                            <a
                              href={commit.htmlUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="font-mono text-xs text-muted transition-colors hover:text-brass"
                            >
                              {commit.shortSha || commit.sha.slice(0, 7)}
                            </a>
                          </div>
                          <span className="flex items-center gap-1.5 font-mono text-xs text-muted">
                            <GitCommit className="h-3.5 w-3.5" />
                            {getRelativeTime(commit.date)}
                          </span>
                        </div>
                        <p className="line-clamp-2 text-sm leading-relaxed text-ivory">
                          {commit.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {filteredData.length === 0 && (
          <div className="py-12 text-center text-muted">
            No commits match your filters.
          </div>
        )}
      </div>
    </div>
  );
}
