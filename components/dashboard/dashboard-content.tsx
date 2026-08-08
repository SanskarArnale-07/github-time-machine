"use client";

import React, { useState, useEffect, useCallback, lazy, Suspense } from "react";
import {
  GitCommitHorizontal,
  Layers,
  Play,
  BarChart3,
  FolderGit2,
  RotateCcw,
  Sparkles,
  Grid3X3,
} from "lucide-react";
import type {
  GitHubUserProfile,
  GitHubRepo,
  GitHubCommit,
  TimelineYearGroup,
  ContributionWeek,
  AnalyticsData,
} from "@/lib/github/types";
import { ProfileCard } from "./profile-card";
import { RepoSection } from "./repo-section";
import { TimelineSkeleton, RepoSkeleton, ProfileSkeleton } from "./loading-skeleton";
import { Button } from "@/components/ui/button";
import { CinematicBackground } from "@/components/cinematic/cinematic-background";
import { CinematicLoadingOverlay } from "@/components/cinematic/cinematic-loading-overlay";

// Lazy-load heavier replay, analytics, and timeline components for instant <1s initial interactivity
const TimelineReplay = lazy(() =>
  import("./timeline-replay").then((mod) => ({ default: mod.TimelineReplay }))
);
const TimelineView = lazy(() =>
  import("./timeline-view").then((mod) => ({ default: mod.TimelineView }))
);
const ContributionReplay = lazy(() =>
  import("./contribution-replay").then((mod) => ({ default: mod.ContributionReplay }))
);
const AnalyticsView = lazy(() =>
  import("./analytics-view").then((mod) => ({ default: mod.AnalyticsView }))
);

type TabId = "replay" | "timeline" | "repos" | "contributions" | "analytics";

interface DashboardContentProps {
  initialUsername: string;
  initialAvatar?: string;
  initialEmail?: string;
  initialProfile: GitHubUserProfile | null;
}

export function DashboardContent({
  initialUsername,
  initialAvatar,
  initialEmail,
  initialProfile,
}: DashboardContentProps) {
  const [profile, setProfile] = useState<GitHubUserProfile | null>(initialProfile);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [commits, setCommits] = useState<GitHubCommit[]>([]);
  const [yearGroups, setYearGroups] = useState<TimelineYearGroup[]>([]);
  const [contributions, setContributions] = useState<ContributionWeek[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("replay");

  // Client-side cache key
  const cacheKey = `gtm_cache_${initialUsername.toLowerCase()}`;

  // Progressive hydration: check client-side sessionStorage cache first for instant sub-second render
  useEffect(() => {
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.commits) {
          if (parsed.profile) setProfile(parsed.profile);
          if (parsed.repos) setRepos(parsed.repos);
          if (parsed.commits) setCommits(parsed.commits);
          if (parsed.yearGroups) setYearGroups(parsed.yearGroups);
          if (parsed.contributions) setContributions(parsed.contributions);
          if (parsed.analytics) setAnalytics(parsed.analytics);
          setHasLoaded(true);
        }
      }
    } catch {}
  }, [cacheKey]);

  const loadCommitHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/github/commits");
      if (!res.ok) {
        throw new Error(`Failed to load data (${res.status})`);
      }

      const data = await res.json();
      if (data.profile) setProfile(data.profile);
      if (data.repos) setRepos(data.repos);
      if (data.commits) setCommits(data.commits);
      if (data.yearGroups) setYearGroups(data.yearGroups);
      if (data.contributions) setContributions(data.contributions);
      if (data.analytics) setAnalytics(data.analytics);

      // Save to client cache for next time
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify(data));
      } catch {}

      setHasLoaded(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [cacheKey]);

  const tabs: { id: TabId; label: string; icon: typeof Play }[] = [
    { id: "replay", label: "Documentary Replay", icon: Play },
    { id: "timeline", label: "Chronicle Timeline", icon: Layers },
    { id: "repos", label: "Repositories", icon: FolderGit2 },
    { id: "contributions", label: "Heatmap Bloom", icon: Grid3X3 },
    { id: "analytics", label: "Analytics Suite", icon: BarChart3 },
  ];

  return (
    <div className="relative min-h-screen">
      {/* 1. Cinematic Background (Deep Navy, Cosmic Blue, Warm Amber, Particle Field) */}
      <CinematicBackground />

      {/* 2. Fast 1.2s Cinematic Loading Overlay */}
      <CinematicLoadingOverlay isLoading={isLoading} />

      {/* Landing / Pre-loaded state */}
      {!hasLoaded ? (
        <div className="flex flex-col gap-8">
          {isLoading ? (
            <ProfileSkeleton />
          ) : (
            <ProfileCard
              profile={profile}
              fallbackUsername={initialUsername}
              fallbackAvatar={initialAvatar}
              fallbackEmail={initialEmail}
            />
          )}

          <div className="glass-card-glow relative overflow-hidden px-8 py-16 text-center sm:px-12 sm:py-20">
            {/* Ambient lighting */}
            <div className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full bg-brass/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-cosmic-blue/20 blur-3xl" />

            <div className="relative mx-auto flex max-w-lg flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-brass/50 bg-[#0B1020]/90 shadow-[0_0_35px_rgba(212,168,83,0.35)]">
                <GitCommitHorizontal className="h-8 w-8 text-brass-light animate-pulse" />
              </div>

              <h2 className="mt-6 font-display text-3xl text-ivory sm:text-4xl">
                Your developer story begins here
              </h2>

              <p className="mt-3 text-balance text-sm leading-relaxed text-muted sm:text-base">
                Reconstruct commit logs across repositories and replay your developer
                growth as a cinematic personal documentary.
              </p>

              {error && (
                <div className="mt-4 rounded-xl border border-red-500/30 bg-red-950/20 px-4 py-2.5 text-sm text-red-300">
                  {error}
                </div>
              )}

              <Button
                size="lg"
                onClick={loadCommitHistory}
                disabled={isLoading}
                className="mt-8 rounded-full bg-brass px-8 py-6 font-sans text-sm font-semibold text-ink shadow-[0_0_30px_rgba(212,168,83,0.4)] transition-all hover:bg-brass-light hover:scale-105"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink border-t-transparent" />
                    Synthesizing story...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Play Developer Story
                  </span>
                )}
              </Button>

              <p className="mt-3 font-mono text-xs text-muted/70">
                Aggregates public & authenticated commits across codebases
              </p>
            </div>
          </div>

          {isLoading && (
            <div className="flex flex-col gap-8">
              <RepoSkeleton />
              <TimelineSkeleton />
            </div>
          )}
        </div>
      ) : (
        /* Loaded state — progressive full documentary dashboard */
        <div className="flex flex-col gap-8">
          <ProfileCard
            profile={profile}
            fallbackUsername={initialUsername}
            fallbackAvatar={initialAvatar}
            fallbackEmail={initialEmail}
          />

          {/* Quick stats ribbon */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Total commits", value: commits.length, color: "text-ivory" },
              { label: "Repositories", value: repos.length, color: "text-commit-300" },
              { label: "Years active", value: yearGroups.length || 1, color: "text-brass-light" },
              { label: "Languages", value: analytics?.topLanguages?.length ?? 1, color: "text-ivory" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="glass-card px-4 py-3.5"
              >
                <p className={`font-display text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="mt-0.5 font-mono text-[10px] uppercase text-muted">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Tab navigation bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div className="glass-card flex items-center gap-1 p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-brass text-ink font-semibold shadow-md"
                      : "text-muted hover:text-ivory"
                  }`}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={loadCommitHistory}
              disabled={isLoading}
              className="font-mono text-xs text-muted hover:text-ivory"
            >
              <RotateCcw className={`mr-1.5 h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
              Refresh Cache
            </Button>
          </div>

          {/* Tab content wrapped in Suspense for smooth lazy loading */}
          <Suspense fallback={<TimelineSkeleton />}>
            {activeTab === "replay" && (
              <TimelineReplay
                commits={commits}
                repos={repos}
                profile={profile}
                contributions={contributions}
              />
            )}
            {activeTab === "timeline" && (
              <TimelineView
                yearGroups={yearGroups}
                repos={repos}
                totalCommits={commits.length}
              />
            )}
            {activeTab === "repos" && <RepoSection repos={repos} />}
            {activeTab === "contributions" && (
              <ContributionReplay contributions={contributions} commits={commits} />
            )}
            {activeTab === "analytics" && analytics && (
              <AnalyticsView analytics={analytics} commits={commits} />
            )}
          </Suspense>
        </div>
      )}
    </div>
  );
}
