"use client";
import React, { useState, useMemo } from "react";
import { GitHubRepo } from "@/lib/github/types";
import { Star, GitFork, Clock, Search, FolderGit2 } from "lucide-react";
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

  // Cinematic cover generator
  const getCoverGradient = (name: string, lang: string) => {
    const color1 = getLanguageColor(lang);
    // Simple hash for pseudo-random but consistent secondary color
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color2 = `hsl(${Math.abs(hash) % 360}, 60%, 20%)`;
    return `linear-gradient(135deg, ${color1}40, ${color2})`;
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
    <div className="space-y-8">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="font-display text-3xl font-bold text-ivory">Project Cinematic</h2>
          <p className="mt-2 text-sm text-muted">
            Explore and filter your crafted repositories
          </p>
        </div>

        <div className="flex w-full flex-wrap items-center gap-3 md:w-auto">
          <div className="relative flex-grow md:flex-grow-0">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search cinematic projects..."
              className="w-full rounded-full border border-ink-border bg-ink-soft/50 py-2.5 pl-10 pr-4 text-sm text-ivory placeholder-muted focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass/50 md:w-64 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="cursor-pointer rounded-full border border-ink-border bg-ink-soft/50 px-5 py-2.5 text-sm text-ivory focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass/50 transition-all"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            aria-label="Sort repositories"
          >
            <option value="stars">Highest Rated (Stars)</option>
            <option value="updated">Recently Directed (Updated)</option>
            <option value="created">Newest Release (Created)</option>
          </select>
        </div>
      </div>

      {languages.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedLang(null)}
            className={`rounded-full border px-4 py-1.5 text-xs font-mono transition-all duration-300 ${
              !selectedLang
                ? "border-brass bg-brass font-bold text-ink shadow-[0_0_15px_rgba(212,168,83,0.3)]"
                : "border-white/10 bg-white/5 text-muted hover:border-white/20 hover:text-ivory"
            }`}
          >
            All Languages
          </button>
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLang(lang)}
              className={`rounded-full border px-4 py-1.5 text-xs font-mono transition-all duration-300 ${
                selectedLang === lang
                  ? "border-white/30 bg-white/10 font-bold text-ivory shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                  : "border-white/10 bg-white/5 text-muted hover:border-white/20 hover:text-ivory"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      )}

      {filteredAndSortedRepos.length === 0 ? (
        <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-16 text-center shadow-sm backdrop-blur-md">
          <FolderGit2 className="mx-auto h-12 w-12 text-muted/30 mb-4" />
          <p className="text-lg font-display text-muted">
            No projects found matching your criteria.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {displayedRepos.map((repo) => (
              <div
                key={repo.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] transition-all duration-500 hover:border-white/20 hover:shadow-2xl hover:shadow-black/50"
              >
                {/* Cinematic Cover Background */}
                <div 
                  className="absolute inset-0 opacity-20 transition-opacity duration-500 group-hover:opacity-40"
                  style={{ background: getCoverGradient(repo.name, repo.language || '') }}
                />
                
                {/* Content */}
                <div className="relative z-10 flex flex-col h-full p-6 md:p-8">
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <a
                        href={repo.html_url}
                        target="_blank"
                        rel="noreferrer"
                        className="line-clamp-2 font-display text-2xl font-bold text-ivory transition-colors group-hover:text-brass-light"
                      >
                        {repo.name}
                      </a>
                      <div className="flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 backdrop-blur-md border border-white/10">
                        <Star className="h-3.5 w-3.5 text-brass" />
                        <span className="font-mono text-xs font-bold text-ivory">{repo.stargazers_count}</span>
                      </div>
                    </div>
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted/90 group-hover:text-muted transition-colors">
                      {repo.description || "No description provided. The code speaks for itself."}
                    </p>
                  </div>

                  <div className="mt-auto pt-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {repo.language && (
                        <div className="flex items-center gap-2 font-mono text-xs font-medium text-ivory">
                          <span
                            className="h-3 w-3 rounded-full shadow-sm"
                            style={{ backgroundColor: getLanguageColor(repo.language) }}
                          />
                          {repo.language}
                        </div>
                      )}
                      {repo.forks_count > 0 && (
                        <div className="flex items-center gap-1.5 font-mono text-xs text-muted">
                          <GitFork className="h-4 w-4 text-commit-300" />
                          <span>{repo.forks_count}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{getRelativeTime(repo.updated_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!showAll && filteredAndSortedRepos.length > 12 && (
            <div className="mt-12 flex justify-center">
              <Button
                onClick={() => setShowAll(true)}
                variant="outline"
                className="rounded-full px-8 py-6 font-mono text-xs tracking-wider transition-all hover:bg-white/5 border-white/10"
              >
                View all {filteredAndSortedRepos.length} projects
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
