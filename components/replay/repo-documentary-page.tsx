"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { GitHubCommit, GitHubRepo } from "@/lib/github/types";
import { RepoDocumentaryReplay } from "@/components/replay/repo-documentary-replay";
import { CinematicLoadingOverlay } from "@/components/cinematic/cinematic-loading-overlay";

interface RepoDocumentaryPageProps {
  initialUsername: string;
  repoFullName: string; // e.g. "owner/repo"
  isPublic?: boolean;
}

export function RepoDocumentaryPage({
  initialUsername,
  repoFullName,
  isPublic = false,
}: RepoDocumentaryPageProps) {
  const [repo, setRepo] = useState<GitHubRepo | null>(null);
  const [commits, setCommits] = useState<GitHubCommit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [backoffUntil, setBackoffUntil] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const hasAttemptedLoad = useRef(false);

  useEffect(() => {
    if (!backoffUntil) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((backoffUntil - Date.now()) / 1000));
      setTimeRemaining(remaining);
      if (remaining === 0) setBackoffUntil(null);
    }, 1000);
    return () => clearInterval(interval);
  }, [backoffUntil]);

  const cacheKey = isPublic
    ? `gtm_public_repo_${repoFullName.toLowerCase().replace(/[^a-z0-9]/g, "_")}`
    : `gtm_cache_${initialUsername.toLowerCase()}`;

  const applyReplayData = useCallback((data: {
    repo?: GitHubRepo;
    repos?: GitHubRepo[];
    commits?: GitHubCommit[];
  }) => {
    if (data.repo) {
      setRepo(data.repo);
    } else if (data.repos) {
      const foundRepo = data.repos.find(
        (r) => r.full_name.toLowerCase() === repoFullName.toLowerCase()
      );
      if (foundRepo) setRepo(foundRepo);
    }

    if (data.commits) {
      if (data.repo) {
        setCommits(data.commits);
      } else {
        setCommits(
          data.commits.filter(
            (c) => c.repoFullName?.toLowerCase() === repoFullName.toLowerCase()
          )
        );
      }
    }
  }, [repoFullName]);

  const loadCommitHistory = useCallback(async () => {
    if (backoffUntil && Date.now() < backoffUntil) return;
    setIsLoading(true);
    setError(null);

    try {
      const parts = repoFullName.split("/");
      const endpoint =
        isPublic && parts.length === 2
          ? `/api/github/public/${encodeURIComponent(parts[0])}/${encodeURIComponent(parts[1])}`
          : "/api/github/commits";

      const response = await fetch(endpoint);
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || `Failed to load data (${response.status})`);
      }

      const data = await response.json();
      applyReplayData(data);

      try {
        sessionStorage.setItem(cacheKey, JSON.stringify(data));
      } catch {
        // Storage failure should not interrupt presentation
      }

      setHasLoaded(true);
      setRetryCount(0);
    } catch (fetchError: unknown) {
      setError(fetchError instanceof Error ? fetchError.message : "Something went wrong. Please try again.");
      const newCount = retryCount + 1;
      setRetryCount(newCount);
      if (newCount >= 3) {
        setBackoffUntil(Date.now() + 30000);
        setRetryCount(0);
      }
    } finally {
      setIsLoading(false);
    }
  }, [applyReplayData, cacheKey, isPublic, repoFullName, retryCount, backoffUntil]);

  useEffect(() => {
    if (hasAttemptedLoad.current) return;
    hasAttemptedLoad.current = true;

    try {
      const cached = sessionStorage.getItem(cacheKey);
      const parsed = cached ? JSON.parse(cached) : null;
      if (parsed && (parsed.repo || parsed.commits)) {
        applyReplayData(parsed);
        setHasLoaded(true);
        return;
      }
    } catch {
      // Ignore stale or unparseable cache
    }

    loadCommitHistory();
  }, [applyReplayData, cacheKey, loadCommitHistory]);

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-[#0A0A0A]">
      <div className="relative z-10 h-full w-full">
        {error ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="rounded-xl border border-red-500/30 bg-red-950/20 px-6 py-4 text-sm text-red-300 max-w-md">
              {error}
            </div>
            {timeRemaining > 0 && (
              <p className="text-sm text-zinc-400">Please wait {timeRemaining}s before retrying.</p>
            )}
            <button
              onClick={loadCommitHistory}
              disabled={isLoading || timeRemaining > 0}
              className="rounded-full border border-brass/30 bg-brass/10 px-5 py-2 font-mono text-xs text-brass-light transition-colors hover:bg-brass/20 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              {isLoading ? "Retrying…" : timeRemaining > 0 ? `Wait ${timeRemaining}s` : "Try again"}
            </button>
          </div>
        ) : !hasLoaded ? (
          <CinematicLoadingOverlay isLoading={isLoading || !hasLoaded} />
        ) : !repo ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center px-6">
            <p className="font-display text-xl text-ivory">Repository not found or is private.</p>
            <p className="font-sans text-sm text-zinc-400 max-w-sm">
              We couldn&apos;t find public commit activity for {repoFullName}. Make sure the repository exists and is public on GitHub.
            </p>
            <a
              href="/"
              className="mt-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 font-mono text-xs text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              Back to Home
            </a>
          </div>
        ) : commits.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center px-6">
            <p className="font-display text-xl text-ivory">No public commits found.</p>
            <p className="font-sans text-sm text-zinc-400 max-w-sm">
              {repo.name} does not have any recorded commit history on its default branch.
            </p>
            <a
              href="/"
              className="mt-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 font-mono text-xs text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              Back to Home
            </a>
          </div>
        ) : (
          <RepoDocumentaryReplay
            commits={commits}
            repo={repo}
            isPublic={isPublic}
          />
        )}
      </div>
    </div>
  );
}
