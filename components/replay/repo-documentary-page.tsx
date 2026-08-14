"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { GitHubCommit, GitHubRepo } from "@/lib/github/types";
import { ReplayBackground } from "@/components/replay/replay-background";
import { RepoDocumentaryReplay } from "@/components/replay/repo-documentary-replay";

interface RepoDocumentaryPageProps {
  initialUsername: string;
  repoFullName: string; // e.g. "owner/repo"
}

export function RepoDocumentaryPage({
  initialUsername,
  repoFullName,
}: RepoDocumentaryPageProps) {
  const [repo, setRepo] = useState<GitHubRepo | null>(null);
  const [commits, setCommits] = useState<GitHubCommit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasAttemptedLoad = useRef(false);

  const cacheKey = `gtm_cache_${initialUsername.toLowerCase()}`;

  const applyReplayData = useCallback((data: {
    repos?: GitHubRepo[];
    commits?: GitHubCommit[];
  }) => {
    if (data.repos) {
      const foundRepo = data.repos.find(r => r.full_name === repoFullName);
      if (foundRepo) setRepo(foundRepo);
    }
    if (data.commits) {
      setCommits(data.commits.filter(c => c.repoFullName === repoFullName));
    }
  }, [repoFullName]);

  const loadCommitHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/github/commits");
      if (!response.ok) throw new Error(`Failed to load data (${response.status})`);

      const data = await response.json();
      applyReplayData(data);

      try {
        sessionStorage.setItem(cacheKey, JSON.stringify(data));
      } catch {
        // Cache failure should not interrupt.
      }

      setHasLoaded(true);
    } catch (fetchError: unknown) {
      setError(fetchError instanceof Error ? fetchError.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [applyReplayData, cacheKey]);

  useEffect(() => {
    if (hasAttemptedLoad.current) return;
    hasAttemptedLoad.current = true;

    try {
      const cached = sessionStorage.getItem(cacheKey);
      const parsed = cached ? JSON.parse(cached) : null;
      if (parsed?.commits) {
        applyReplayData(parsed);
        setHasLoaded(true);
        return;
      }
    } catch {
      // Ignore stale cache
    }

    loadCommitHistory();
  }, [applyReplayData, cacheKey, loadCommitHistory]);

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-[#0A0A0A]">
      <div className="relative z-10 h-full w-full">
        {error ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="rounded-xl border border-red-500/30 bg-red-950/20 px-6 py-4 text-sm text-red-300">
              {error}
            </div>
            <button
              onClick={loadCommitHistory}
              disabled={isLoading}
              className="rounded-full border border-brass/30 bg-brass/10 px-5 py-2 font-mono text-xs text-brass-light transition-colors hover:bg-brass/20"
            >
              {isLoading ? "Retrying…" : "Try again"}
            </button>
          </div>
        ) : !hasLoaded ? (
          <div className="flex h-full flex-col items-center justify-center gap-6">
            <div className="flex flex-col items-center gap-4">
              <div className="h-16 w-16 animate-pulse rounded-full border-2 border-brass/40" />
              <div className="h-4 w-48 animate-pulse rounded-md bg-white/5" />
              <div className="h-3 w-32 animate-pulse rounded-md bg-white/5" />
            </div>
          </div>
        ) : !repo ? (
          <div className="flex h-full flex-col items-center justify-center gap-6 text-white">
            <p>Repository not found in archive.</p>
          </div>
        ) : (
          <RepoDocumentaryReplay
            commits={commits}
            repo={repo}
          />
        )}
      </div>
    </div>
  );
}
