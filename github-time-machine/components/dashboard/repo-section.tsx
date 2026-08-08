"use client";
import React, { useState, useMemo } from "react";
import { GitHubRepo } from "@/lib/github/types";
import { Star, GitFork, Clock, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RepoSectionProps {
  repos: GitHubRepo[];
}

export function RepoSection({ repos }: RepoSectionProps) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"stars" | "updated" | "created">("stars");
  const [selectedLang, setSelectedLang] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const languages = useMemo(() => {
    const langs = new Set<string>();
    repos.forEach((repo) => {
      if (repo.language) langs.add(repo.language);
    });
    return Array.from(langs);
  }, [repos]);

  const filteredAndSortedRepos = useMemo(() => {
    const result = repos.filter((repo) => {
      const matchesSearch =
        repo.name.toLowerCase().includes(search.toLowerCase()) ||
        (repo.description &&
          repo.description.toLowerCase().includes(search.toLowerCase()));
      const matchesLang = selectedLang ? repo.language === selectedLang : true;
      return matchesSearch && matchesLang;
    });

    result.sort((a, b) => {
      if (sortBy === "stars") return b.stargazers_count - a.stargazers_count;
      if (sortBy === "updated")
        return (
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

    return result;
  }, [repos, search, sortBy, selectedLang]);

  const displayedRepos = showAll
    ? filteredAndSortedRepos
    : filteredAndSortedRepos.slice(0, 12);

  const getLanguageColor = (lang: string) => {
    const colors: Record<string, string> = {
      TypeScript: "#3178c6",
      JavaScript: "#f1e05a",
      Python: "#3572A5",
      Rust: "#dea584",
      Go: "#00ADD8",
      Java: "#b07219",
      CSS: "#563d7c",
      HTML: "#e34c26",
    };
    return colors[lang] || "#8b949e";
  };

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
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="font-display text-2xl text-ivory">Repositories</h2>
          <p className="mt-1 text-xs text-muted">
            Explore and filter your GitHub projects
          </p>
        </div>

        <div className="flex w-full flex-wrap items-center gap-3 md:w-auto">
          <div className="relative flex-grow md:flex-grow-0">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search repositories..."
              className="w-full rounded-lg border border-ink-border bg-ink-soft py-2 pl-9 pr-4 text-sm text-ivory placeholder-muted focus:border-brass focus:outline-none md:w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="cursor-pointer rounded-lg border border-ink-border bg-ink-soft px-4 py-2 text-sm text-ivory focus:border-brass focus:outline-none"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            aria-label="Sort repositories"
          >
            <option value="stars">Most stars</option>
            <option value="updated">Recently updated</option>
            <option value="created">Recently created</option>
          </select>
        </div>
      </div>

      {languages.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedLang(null)}
            className={`rounded-full border px-3 py-1 text-xs font-mono transition-colors ${
              !selectedLang
                ? "border-brass bg-brass font-semibold text-ink"
                : "border-ink-border bg-transparent text-muted hover:border-muted hover:text-ivory"
            }`}
          >
            All Languages
          </button>
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLang(lang)}
              className={`rounded-full border px-3 py-1 text-xs font-mono transition-colors ${
                selectedLang === lang
                  ? "border-brass bg-ink-soft font-semibold text-ivory"
                  : "border-ink-border bg-transparent text-muted hover:border-muted hover:text-ivory"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      )}

      {filteredAndSortedRepos.length === 0 ? (
        <div className="rounded-xl border border-ink-border bg-ink-surface p-12 text-center">
          <p className="text-base text-muted">
            No repositories found matching your criteria.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {displayedRepos.map((repo) => (
              <div
                key={repo.id}
                className="group flex flex-col justify-between rounded-xl border border-ink-border bg-ink-surface p-5 transition-colors hover:border-brass-dim"
              >
                <div>
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="line-clamp-1 font-sans text-lg font-semibold text-ivory transition-colors group-hover:text-brass"
                  >
                    {repo.name}
                  </a>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
                    {repo.description || "No description provided."}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-ink-border/50 pt-3 text-xs text-muted">
                  <div className="flex items-center gap-3">
                    {repo.language && (
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{
                            backgroundColor: getLanguageColor(repo.language),
                          }}
                        />
                        <span>{repo.language}</span>
                      </div>
                    )}
                    {(repo.stargazers_count > 0 || sortBy === "stars") && (
                      <div className="flex items-center gap-1 font-mono text-[11px]">
                        <Star className="h-3 w-3 text-brass-light" />
                        <span>{repo.stargazers_count}</span>
                      </div>
                    )}
                    {repo.forks_count > 0 && (
                      <div className="flex items-center gap-1 font-mono text-[11px]">
                        <GitFork className="h-3 w-3 text-commit-300" />
                        <span>{repo.forks_count}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 font-mono text-[10px]">
                    <Clock className="h-3 w-3" />
                    <span>{getRelativeTime(repo.updated_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!showAll && filteredAndSortedRepos.length > 12 && (
            <div className="mt-8 flex justify-center">
              <Button
                onClick={() => setShowAll(true)}
                variant="outline"
                className="font-mono text-xs"
              >
                Show all {filteredAndSortedRepos.length} repositories
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
