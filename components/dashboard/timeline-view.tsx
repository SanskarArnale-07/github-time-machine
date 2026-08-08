"use client";
import React, { useState, useMemo } from "react";
import { TimelineYearGroup, GitHubRepo, GitHubCommit } from "@/lib/github/types";
import { Search, GitCommit, BookOpen } from "lucide-react";

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
              // Hide merge commits
              const isMerge = commit.message.toLowerCase().startsWith("merge") || commit.message.toLowerCase().includes("pull request");
              if (isMerge) return false;

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

  // Group commits by day for a journal feel
  const groupCommitsByDay = (commits: GitHubCommit[]) => {
    const groups: Record<string, GitHubCommit[]> = {};
    commits.forEach(commit => {
      const date = new Date(commit.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (!groups[date]) groups[date] = [];
      groups[date].push(commit);
    });
    return Object.entries(groups);
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="font-display text-3xl font-bold text-ivory">Developer Journal</h2>
          <p className="mt-2 text-sm text-muted">
            {totalCommits} entries across time. Merge commits are hidden for a focused narrative.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search entries..."
              className="w-full rounded-full border border-ink-border bg-ink-soft/50 py-2.5 pl-10 pr-4 text-sm text-ivory placeholder-muted focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass/50 md:w-64 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="cursor-pointer rounded-full border border-ink-border bg-ink-soft/50 px-5 py-2.5 text-sm text-ivory focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass/50 transition-all"
            value={selectedRepo}
            onChange={(e) => setSelectedRepo(e.target.value)}
            aria-label="Filter by repository"
          >
            <option value="all">All Chronicles</option>
            {repos.map((repo) => (
              <option key={repo.name} value={repo.name}>
                {repo.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="relative mx-auto max-w-4xl space-y-16">
        {/* Continuous journal line */}
        <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-brass/50 via-ink-border to-transparent hidden md:block" />

        {filteredData.map((year) => (
          <div key={year.year} className="relative z-10">
            <div className="mb-12 flex items-center gap-6">
              <div className="hidden md:flex h-16 w-16 items-center justify-center rounded-full border-4 border-ink bg-brass shadow-[0_0_20px_rgba(212,168,83,0.4)]">
                <span className="font-display text-xl font-bold text-ink">
                  {year.year.toString().slice(-2)}&apos;
                </span>
              </div>
              <div>
                <h3 className="font-display text-4xl font-black text-ivory tracking-tight">
                  {year.year}
                </h3>
                <span className="text-sm font-mono text-brass-light uppercase tracking-widest mt-1 block">
                  {year.months.reduce((acc, m) => acc + m.commits.length, 0)} Documented Entries
                </span>
              </div>
            </div>

            <div className="space-y-16 md:pl-20">
              {year.months.map((month) => (
                <div key={month.month} className="space-y-8">
                  {/* Monthly Chapter Card */}
                  <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent p-6 shadow-xl backdrop-blur-sm">
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                      <BookOpen className="h-24 w-24 text-brass" />
                    </div>
                    <div className="relative z-10">
                      <h4 className="font-display text-2xl font-bold text-brass-light">
                        Chapter: {month.monthName}
                      </h4>
                      <p className="mt-2 text-sm leading-relaxed text-muted max-w-xl">
                        A focused period of development encompassing {month.commits.length} key contributions. The primary focus during this chapter included advancements in {month.commits[0]?.repoName || "various projects"} and foundational code improvements.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {groupCommitsByDay(month.commits).map(([date, dayCommits]) => (
                      <div key={date} className="relative">
                        <div className="mb-3 flex items-center gap-3">
                          <div className="h-2 w-2 rounded-full bg-brass-dim hidden md:block -ml-[93px] border-2 border-ink box-content" />
                          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-muted">
                            {date}
                          </span>
                        </div>
                        
                        <div className="space-y-3 pl-4 md:pl-0 border-l-2 md:border-l-0 border-ink-border ml-1 md:ml-0">
                          {dayCommits.map((commit) => (
                            <div
                              key={commit.sha}
                              className="group rounded-xl border border-transparent bg-white/[0.02] p-4 transition-all hover:border-white/10 hover:bg-white/[0.04]"
                            >
                              <div className="mb-2 flex flex-col justify-between gap-2 md:flex-row md:items-center">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="rounded-full bg-commit-300/10 px-2.5 py-1 font-mono text-[10px] font-medium text-commit-300 border border-commit-300/20">
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
                              </div>
                              <p className="text-sm leading-relaxed text-ivory/90">
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
            </div>
          </div>
        ))}

        {filteredData.length === 0 && (
          <div className="py-20 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-muted/30 mb-4" />
            <p className="font-display text-xl text-muted">No journal entries found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
