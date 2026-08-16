"use client";
import React, { useState, useMemo } from "react";
import { TimelineYearGroup, GitHubRepo, GitHubCommit } from "@/lib/github/types";
import { Search, GitCommit, BookOpen, ChevronDown } from "lucide-react";

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

  // Group commits by day for a journal feel, and group repetitive commits
  const groupCommitsByDay = (commits: GitHubCommit[]) => {
    const groups: Record<string, { repoName: string; sha: string; htmlUrl: string; messages: string[]; shortSha: string; count: number }[]> = {};
    commits.forEach(commit => {
      const date = new Date(commit.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (!groups[date]) groups[date] = [];

      // Group similar commits in the same repo (e.g. repetitive "Update" or same prefix)
      const isRepetitive = (msg1: string, msg2: string) => {
        const m1 = msg1.toLowerCase();
        const m2 = msg2.toLowerCase();
        if (m1 === m2) return true;
        if (m1.startsWith("update") && m2.startsWith("update")) return true;
        if (m1.startsWith("fix") && m2.startsWith("fix")) return true;
        return msg1.substring(0, 10) === msg2.substring(0, 10);
      };

      const similarCommit = groups[date].find(g => 
        g.repoName === commit.repoName && isRepetitive(g.messages[0], commit.message)
      );

      if (similarCommit) {
        similarCommit.count += 1;
        similarCommit.messages.push(commit.message);
      } else {
        groups[date].push({
          repoName: commit.repoName,
          sha: commit.sha,
          shortSha: commit.shortSha || commit.sha.slice(0, 7),
          htmlUrl: commit.htmlUrl,
          messages: [commit.message],
          count: 1
        });
      }
    });
    return Object.entries(groups);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div className="mb-2 md:mb-0">
          <h2 className="font-sans tracking-tight text-3xl font-semibold text-white">Developer Journal</h2>
          <p className="mt-1 text-sm sm:text-base text-zinc-400 max-w-xl leading-relaxed">
            {totalCommits} entries across time. Merge commits are hidden and repetitive updates are grouped for a focused narrative.
          </p>
        </div>

        <div className="flex w-full md:w-auto flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 sm:w-64 sm:flex-none">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search entries..."
              className="h-10 w-full rounded-full border border-white/10 bg-surface py-2 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 transition-all m-0"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="relative">
            <select
              className="h-10 w-full sm:w-auto cursor-pointer rounded-full border border-white/10 bg-surface pl-4 pr-10 py-2 text-sm text-white focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 transition-all m-0 appearance-none"
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
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          </div>
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
              {year.months.map((month) => {
                const uniqueRepos = Array.from(new Set(month.commits.map(c => c.repoName)));
                const topRepos = uniqueRepos.slice(0, 2).join(" and ") || "various projects";
                
                return (
                <div key={month.month} className="space-y-8">
                  {/* Monthly Chapter Card */}
                  <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent p-6 shadow-xl backdrop-blur-sm">
                    <div className="absolute top-0 right-0 p-4 sm:p-6 opacity-5 sm:opacity-10">
                      <BookOpen className="h-14 w-14 sm:h-24 sm:w-24 text-brass" />
                    </div>
                    <div className="relative z-10">
                      <h4 className="font-display text-2xl font-bold text-brass-light">
                        Chapter: {month.monthName}
                      </h4>
                      <p className="mt-2 text-sm leading-relaxed text-muted max-w-xl">
                        {month.commits.length} meaningful contributions focused on {topRepos}. This chapter highlights sustained momentum in building and refining core systems.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {groupCommitsByDay(month.commits).map(([date, dayCommits]) => (
                      <div key={date} className="relative">
                        <div className="mb-3 flex items-center gap-3">
                          <div className="absolute -left-12 h-2 w-2 rounded-full bg-brass-dim hidden md:block border-2 border-ink box-content" style={{ transform: 'translateX(-50%)' }} />
                          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-muted">
                            {date}
                          </span>
                        </div>
                        
                        <div className="space-y-4 pl-4 md:pl-0 border-l-2 md:border-l-0 border-ink-border ml-1 md:ml-0">
                          {dayCommits.map((group) => (
                            <div
                              key={group.sha}
                              className="group rounded-xl border border-transparent bg-white/[0.02] p-4 transition-all hover:border-white/10 hover:bg-white/[0.04]"
                            >
                              <div className="mb-2 flex flex-col justify-between gap-2 md:flex-row md:items-center">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="rounded-full bg-commit-300/10 px-2.5 py-1 font-mono text-[10px] font-medium text-commit-300 border border-commit-300/20">
                                    {group.repoName}
                                  </span>
                                  <a
                                    href={group.htmlUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center min-h-[32px] px-1 -mx-1 font-mono text-xs text-muted transition-colors hover:text-brass rounded"
                                  >
                                    {group.shortSha}
                                  </a>
                                  {group.count > 1 && (
                                    <span className="rounded-full bg-brass/10 px-2 py-0.5 font-mono text-[10px] text-brass-light border border-brass/20">
                                      +{group.count - 1} similar
                                    </span>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm leading-relaxed text-ivory/90">
                                {group.messages[0]}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )})}
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
