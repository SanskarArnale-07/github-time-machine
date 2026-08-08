"use client";

import { useState } from "react";
import {
  GitCommit,
  ExternalLink,
  Calendar,
  Search,
  Filter,
  Layers,
  FolderGit2,
} from "lucide-react";
import { TimelineYearGroup, GitHubCommit, GitHubRepo } from "@/lib/github/types";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRepo, setSelectedRepo] = useState<string>("ALL");

  // Filter commits based on search and repository selection
  const filteredGroups = yearGroups
    .map((yearGroup) => {
      const filteredMonths = yearGroup.months
        .map((monthGroup) => {
          const filteredCommits = monthGroup.commits.filter((commit) => {
            const matchesSearch =
              !searchTerm ||
              commit.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
              commit.repoName.toLowerCase().includes(searchTerm.toLowerCase()) ||
              commit.shortSha.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesRepo =
              selectedRepo === "ALL" ||
              commit.repoName.toLowerCase() === selectedRepo.toLowerCase();

            return matchesSearch && matchesRepo;
          });

          return {
            ...monthGroup,
            commits: filteredCommits,
          };
        })
        .filter((monthGroup) => monthGroup.commits.length > 0);

      const totalFiltered = filteredMonths.reduce(
        (sum, m) => sum + m.commits.length,
        0
      );

      return {
        ...yearGroup,
        totalCommits: totalFiltered,
        months: filteredMonths,
      };
    })
    .filter((yearGroup) => yearGroup.months.length > 0);

  const distinctRepos = Array.from(
    new Set(repos.map((r) => r.name))
  ).filter(Boolean);

  return (
    <div className="flex flex-col gap-8">
      {/* Search and Repository Filter Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-ink-border bg-ink-surface/80 p-5 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search commits by message, SHA, or repository..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-ink-border bg-ink/90 py-2.5 pl-10 pr-4 font-mono text-sm text-ivory placeholder-muted focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass"
          />
        </div>

        {/* Repository selector */}
        <div className="flex items-center gap-2">
          <FolderGit2 className="h-4 w-4 text-brass-light" />
          <select
            value={selectedRepo}
            onChange={(e) => setSelectedRepo(e.target.value)}
            aria-label="Filter timeline by repository"
            className="rounded-xl border border-ink-border bg-ink/90 px-3 py-2 font-mono text-xs text-ivory focus:border-brass focus:outline-none"
          >
            <option value="ALL">All Repositories ({repos.length})</option>
            {distinctRepos.map((repo) => (
              <option key={repo} value={repo}>
                {repo}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredGroups.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-ink-border bg-ink-surface/50 p-12 text-center">
          <Layers className="h-10 w-10 text-muted/50" />
          <h3 className="mt-4 font-display text-xl text-ivory">
            No matching commits found
          </h3>
          <p className="mt-1 font-mono text-xs text-muted">
            Try adjusting your search query or selecting &quot;All Repositories&quot;.
          </p>
        </div>
      ) : (
        /* Year by Year Chronological Timeline */
        <div className="relative flex flex-col gap-12">
          {/* Vertical connecting line */}
          <div className="absolute bottom-6 left-6 top-6 -z-0 w-[2px] bg-gradient-to-b from-brass via-commit-300 to-ink-border sm:left-8" />

          {filteredGroups.map((yearGroup) => (
            <div key={yearGroup.year} className="relative z-10 flex flex-col gap-6">
              {/* Year Badge Divider */}
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-brass bg-ink shadow-[0_0_20px_rgba(217,142,57,0.3)] sm:h-14 sm:w-14">
                  <span className="font-display text-xl font-bold text-brass-light sm:text-2xl">
                    {yearGroup.year}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <h3 className="font-display text-2xl text-ivory">
                    Year {yearGroup.year}
                  </h3>
                  <span className="font-mono text-xs text-brass-light/80">
                    ({yearGroup.totalCommits} commits)
                  </span>
                </div>
              </div>

              {/* Month Sections */}
              <div className="ml-6 flex flex-col gap-6 border-l-2 border-transparent pl-4 sm:ml-8 sm:pl-6">
                {yearGroup.months.map((monthGroup) => (
                  <div
                    key={`${yearGroup.year}-${monthGroup.month}`}
                    className="flex flex-col gap-3"
                  >
                    {/* Month Label */}
                    <div className="inline-flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-commit-300" />
                      <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
                        {monthGroup.monthName} {yearGroup.year}
                      </span>
                      <div className="h-[1px] flex-1 bg-ink-border/60" />
                    </div>

                    {/* Commit Cards List */}
                    <div className="flex flex-col gap-3">
                      {monthGroup.commits.map((commit) => {
                        const dateObj = new Date(commit.date);
                        const formattedDate = dateObj.toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        );
                        const formattedTime = dateObj.toLocaleTimeString(
                          "en-US",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        );

                        return (
                          <div
                            key={commit.sha}
                            className="group relative flex flex-col gap-3 rounded-xl border border-ink-border bg-ink-surface/70 p-4 transition-all duration-200 hover:border-brass/40 hover:bg-ink-surface sm:flex-row sm:items-center sm:justify-between"
                          >
                            {/* Left: Commit info & message */}
                            <div className="flex flex-col gap-1.5 sm:max-w-2xl">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1 rounded border border-commit-100/40 bg-commit-50/20 px-2 py-0.5 font-mono text-[11px] text-commit-300">
                                  <GitCommit className="h-3 w-3" />
                                  {commit.repoName}
                                </span>
                                <a
                                  href={commit.htmlUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-mono text-[11px] text-muted transition-colors hover:text-brass-light"
                                >
                                  #{commit.shortSha}
                                </a>
                              </div>

                              <p className="font-sans text-sm font-medium leading-snug text-ivory group-hover:text-brass-light transition-colors">
                                {commit.message}
                              </p>
                            </div>

                            {/* Right: Date and GitHub link */}
                            <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-center">
                              <div className="flex flex-col font-mono text-[11px] text-muted sm:text-right">
                                <span>{formattedDate}</span>
                                <span className="text-[10px] text-muted/60">
                                  {formattedTime}
                                </span>
                              </div>
                              <a
                                href={commit.htmlUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="View on GitHub"
                                className="rounded-lg border border-ink-border bg-ink/70 p-1.5 text-muted transition-all hover:border-brass hover:text-ivory"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
