"use client";
import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { GitHubRepo, GitHubCommit } from "@/lib/github/types";
import { Star, GitFork, Clock, Search, FolderGit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface RepoSectionProps {
  repos: GitHubRepo[];
  commits?: GitHubCommit[];
}

export function RepoSection({ repos, commits = [] }: RepoSectionProps) {
  const router = useRouter();
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
    const searchLower = search.toLowerCase();
    const result = repos.filter((repo) => {
      // Basic repo search
      let matchesSearch =
        repo.name.toLowerCase().includes(searchLower) ||
        (repo.description && repo.description.toLowerCase().includes(searchLower));

      // Deep search into commits if a search query exists and basic search didn't match
      if (!matchesSearch && searchLower.length > 2 && commits.length > 0) {
        matchesSearch = commits.some(c => 
          c.repoName === repo.name && 
          (c.message.toLowerCase().includes(searchLower) || 
           c.year.toString().includes(searchLower) || 
           c.monthName.toLowerCase().includes(searchLower))
        );
      }

      const matchesLang = selectedLang ? repo.language === selectedLang : true;
      return (searchLower === "" || matchesSearch) && matchesLang;
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
  }, [repos, commits, search, sortBy, selectedLang]);

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

  const generateUniqueRepoInsight = (name: string, lang: string) => {
    const insights = [
      "A foundational piece demonstrating robust architecture.",
      "An exploratory dive into modern methodologies.",
      "Consistent iterative improvements over time.",
      "A testament to disciplined coding practices.",
      "An experimental sandbox pushing technical boundaries.",
      "A cornerstone project with meticulous attention to detail."
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % insights.length;
    const insight = insights[index];
    if (lang) {
      return `Key ${lang} project: ${insight}`;
    }
    return insight;
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
    <div className="space-y-10">
      <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
        <div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-ivory">The Archive</h2>
          <p className="mt-2 text-sm sm:text-base text-muted">
            Project Chapters
          </p>
        </div>

        <div className="flex w-full flex-wrap items-center gap-4 md:w-auto">
          <div className="relative flex-grow md:flex-grow-0">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search cinematic projects..."
              className="w-full rounded-full border border-ink-border bg-ink-soft/50 py-3 pl-12 pr-5 text-base text-ivory placeholder-muted focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass/50 md:w-72 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="cursor-pointer rounded-full border border-ink-border bg-ink-soft/50 px-6 py-3 text-base text-ivory focus:border-brass focus:outline-none focus:ring-1 focus:ring-brass/50 transition-all"
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
          <div 
            className="mt-16 pb-24 relative"
            style={{ 
              WebkitMaskImage: displayedRepos.length > 6 ? "linear-gradient(to bottom, black 85%, transparent 100%)" : "none",
              maskImage: displayedRepos.length > 6 ? "linear-gradient(to bottom, black 85%, transparent 100%)" : "none"
            }}
          >
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
              {displayedRepos.map((repo, index) => (
                <motion.div
                  key={repo.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.4, delay: (index % 3) * 0.1, ease: "easeOut" }}
                  className="cinematic-depth-card group relative flex min-h-[260px] flex-col justify-between overflow-hidden rounded-2xl border border-white/5 bg-[#0E0D0B]/80 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.5)] transition-all duration-300 ease-out hover:-translate-y-[4px] hover:scale-[1.01] hover:border-white/20 hover:shadow-[0_12px_35px_rgba(0,0,0,0.6),0_0_20px_rgba(255,255,255,0.05)]"
                  style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
                >
                {/* Cinematic Cover Background (subtle) */}
                <div 
                  className="absolute inset-0 opacity-[0.12] transition-opacity duration-500 group-hover:opacity-25"
                  style={{ background: getCoverGradient(repo.name, repo.language || '') }}
                />
                <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brass/0 blur-3xl transition-colors duration-500 group-hover:bg-brass/15" />
                
                {/* Content */}
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <a
                        href={repo.html_url}
                        target="_blank"
                        rel="noreferrer"
                        className="line-clamp-1 font-display text-xl font-bold text-ivory transition-colors group-hover:text-brass-light"
                      >
                        {repo.name}
                      </a>
                      <div className="flex items-center gap-1 rounded-md bg-white/5 px-2 py-0.5 border border-white/5">
                        <Star className="h-3 w-3 text-brass" />
                        <span className="font-mono text-[10px] text-ivory">{repo.stargazers_count}</span>
                      </div>
                    </div>
                    <p className="mt-4 line-clamp-3 text-base leading-relaxed text-muted/90 italic">
                      {repo.description && repo.description.length > 10 ? repo.description : generateUniqueRepoInsight(repo.name, repo.language || '')}
                    </p>
                  </div>

                  <div className="mt-7 flex flex-col gap-3">
                    <div className="flex items-center justify-between border-t border-white/5 pt-3">
                      <div className="flex items-center gap-3">
                        {repo.language && (
                          <div className="flex items-center gap-1.5 font-mono text-[10px] text-muted">
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: getLanguageColor(repo.language) }}
                            />
                            {repo.language}
                          </div>
                        )}
                        {repo.forks_count > 0 && (
                          <div className="flex items-center gap-1 font-mono text-[10px] text-muted">
                            <GitFork className="h-3 w-3" />
                            <span>{repo.forks_count}</span>
                          </div>
                        )}
                      </div>
                      <div className="font-mono text-[10px] text-muted">
                        {getRelativeTime(repo.updated_at)}
                      </div>
                    </div>
                    <Button onClick={() => router.push(`/repo/${repo.full_name}`)} variant="outline" size="sm" className="w-full h-9 text-xs font-medium border-white/20 text-muted/90 hover:border-white/40 hover:text-white bg-transparent hover:bg-white/5 transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,255,255,0.07)]">
                      <Clock className="mr-1.5 h-3.5 w-3.5" />
                      View Timeline
                    </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
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
