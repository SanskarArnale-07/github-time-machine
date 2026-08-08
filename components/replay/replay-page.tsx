"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type {
  ContributionWeek,
  GitHubCommit,
  GitHubRepo,
  GitHubUserProfile,
} from "@/lib/github/types";
import { ReplayBackground } from "@/components/replay/replay-background";
import { TimelineReplay } from "@/components/replay/timeline-replay";

interface ReplayPageProps {
  initialUsername: string;
  initialAvatar?: string;
  initialEmail?: string;
  initialProfile: GitHubUserProfile | null;
}

export function ReplayPage({
  initialUsername,
  initialAvatar: _initialAvatar,
  initialEmail: _initialEmail,
  initialProfile,
}: ReplayPageProps) {
  const [profile, setProfile] = useState<GitHubUserProfile | null>(initialProfile);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [commits, setCommits] = useState<GitHubCommit[]>([]);
  const [contributions, setContributions] = useState<ContributionWeek[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasAttemptedLoad = useRef(false);

  const cacheKey = `gtm_cache_${initialUsername.toLowerCase()}`;

  const applyReplayData = useCallback((data: {
    profile?: GitHubUserProfile;
    repos?: GitHubRepo[];
    commits?: GitHubCommit[];
    contributions?: ContributionWeek[];
  }) => {
    if (data.profile) setProfile(data.profile);
    if (data.repos) setRepos(data.repos);
    if (data.commits) setCommits(data.commits);
    if (data.contributions) setContributions(data.contributions);
  }, []);

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
        // Cache failure should not interrupt the documentary.
      }

      setHasLoaded(true);
    } catch (fetchError: unknown) {
      setError(fetchError instanceof Error ? fetchError.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [applyReplayData, cacheKey]);

  // Resolve cache and network fallback together so a warm cache never triggers
  // a redundant request or causes a second layout pass.
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
      // Ignore stale or malformed cache and use the API below.
    }

    loadCommitHistory();
  }, [applyReplayData, cacheKey, loadCommitHistory]);

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden">
      <ReplayBackground />

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
            <div className="mt-8 flex w-full max-w-3xl flex-col gap-3 px-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="h-12 w-full animate-pulse rounded-xl bg-white/[0.03]"
                  style={{ animationDelay: `${index * 120}ms` }}
                />
              ))}
            </div>
          </div>
        ) : (
          <TimelineReplay
            commits={commits}
            repos={repos}
            profile={profile}
            contributions={contributions}
          />
        )}
      </div>
    </div>
  );
}
