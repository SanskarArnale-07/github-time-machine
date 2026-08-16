"use client";

import React, { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { useRouter } from 'next/navigation';
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

// Lazy-load heavier analytics and timeline components for instant <1s initial interactivity
const TimelineView = lazy(() =>
  import("./timeline-view").then((mod) => ({ default: mod.TimelineView }))
);
const ContributionReplay = lazy(() =>
  import("./contribution-replay").then((mod) => ({ default: mod.ContributionReplay }))
);
const AnalyticsView = lazy(() =>
  import("./analytics-view").then((mod) => ({ default: mod.AnalyticsView }))
);

type TabId = "timeline" | "repos" | "contributions" | "analytics";

interface DashboardContentProps {
  initialUsername: string;
  initialAvatar?: string;
  initialEmail?: string;
  initialProfile: GitHubUserProfile | null;
  repoFilter?: string;
}

export function DashboardContent({
  initialUsername,
  initialAvatar,
  initialEmail,
  initialProfile,
  repoFilter,
}: DashboardContentProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<GitHubUserProfile | null>(initialProfile);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [commits, setCommits] = useState<GitHubCommit[]>([]);
  const [yearGroups, setYearGroups] = useState<TimelineYearGroup[]>([]);
  const [contributions, setContributions] = useState<ContributionWeek[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("timeline");

  const handleTabKeyDown = (e: React.KeyboardEvent, currentId: TabId) => {
    const ids = tabs.map(t => t.id);
    const idx = ids.indexOf(currentId);
    if (e.key === "ArrowRight") {
      e.preventDefault();
      setActiveTab(ids[(idx + 1) % ids.length]);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setActiveTab(ids[(idx - 1 + ids.length) % ids.length]);
    } else if (e.key === "Home") {
      e.preventDefault();
      setActiveTab(ids[0]);
    } else if (e.key === "End") {
      e.preventDefault();
      setActiveTab(ids[ids.length - 1]);
    }
  };

  // Read tab from hash on mount to support linking directly to a specific tab
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "");
      if (["timeline", "repos", "contributions", "analytics"].includes(hash)) {
        setActiveTab(hash as TabId);
      }
    }
  }, []);

  // Client-side cache key
  const cacheKey = `gtm_cache_${initialUsername.toLowerCase()}`;

  // Progressive hydration: check client-side sessionStorage cache first
  useEffect(() => {
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.commits) {
          if (parsed.profile) setProfile(parsed.profile);
          if (parsed.repos) {
            if (repoFilter) setRepos(parsed.repos.filter((r: GitHubRepo) => r.full_name === repoFilter));
            else setRepos(parsed.repos);
          }
          if (parsed.commits) {
            if (repoFilter) setCommits(parsed.commits.filter((c: GitHubCommit) => c.repoFullName === repoFilter));
            else setCommits(parsed.commits);
          }
          if (parsed.yearGroups) setYearGroups(parsed.yearGroups);
          if (parsed.contributions) setContributions(parsed.contributions);
          if (parsed.analytics) setAnalytics(parsed.analytics);
          setHasLoaded(true);
          return;
        }
      }
    } catch {}
  }, [cacheKey, repoFilter]); // Note: We don't auto-fetch in this effect anymore to avoid dependency cycle with loadCommitHistory

  const loadCommitHistory = useCallback(async (forceRefresh: boolean = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const endpoint = forceRefresh ? "/api/github/commits?refresh=true" : "/api/github/commits";
      const res = await fetch(endpoint);
      if (!res.ok) {
        throw new Error(`Failed to load data (${res.status})`);
      }

      const data = await res.json();
      
      const applyData = (parsed: any) => {
        if (parsed.profile) setProfile(parsed.profile);
        if (parsed.repos) {
          if (repoFilter) setRepos(parsed.repos.filter((r: GitHubRepo) => r.full_name === repoFilter));
          else setRepos(parsed.repos);
        }
        if (parsed.commits) {
          if (repoFilter) setCommits(parsed.commits.filter((c: GitHubCommit) => c.repoFullName === repoFilter));
          else setCommits(parsed.commits);
        }
        if (parsed.yearGroups) setYearGroups(parsed.yearGroups);
        if (parsed.contributions) setContributions(parsed.contributions);
        if (parsed.analytics) setAnalytics(parsed.analytics);
      };

      applyData(data);

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
  }, [cacheKey, repoFilter]);

  // SWR: Auto-fetch in background to reconcile stale cache
  const hasAttemptedFetch = React.useRef(false);
  useEffect(() => {
    if (!isLoading && !hasAttemptedFetch.current) {
      hasAttemptedFetch.current = true;
      loadCommitHistory();
    }
  }, [isLoading, loadCommitHistory]);

  const tabs: { id: TabId; label: string; icon: typeof Play }[] = [
    { id: "timeline", label: "Chronicle Timeline", icon: Layers },
    { id: "repos", label: "Repositories", icon: FolderGit2 },
    { id: "contributions", label: "Heatmap Bloom", icon: Grid3X3 },
    { id: "analytics", label: "Analytics Suite", icon: BarChart3 },
  ];

  const isEmptyState = hasLoaded && repos.length === 0 && commits.length === 0;

  return (
    <div className="relative min-h-screen">
      {/* 1. Cinematic Background (Deep Navy, Cosmic Blue, Warm Amber, Particle Field) */}
      <CinematicBackground />

      {/* 2. Fast 1.2s Cinematic Loading Overlay */}
      <CinematicLoadingOverlay isLoading={isLoading && !hasLoaded} />

      {/* Empty / Onboarding state */}
      {isEmptyState ? (
        <div className="flex flex-col gap-8">
          <ProfileCard
            profile={profile}
            fallbackUsername={initialUsername}
            fallbackAvatar={initialAvatar}
            fallbackEmail={initialEmail}
          />

          <div className="glass-card-glow relative overflow-hidden px-4 py-10 text-center sm:px-12 sm:py-20">
            {/* Ambient lighting */}
            <div className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full bg-brass/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-zinc-600/20 blur-3xl" />

            <div className="relative mx-auto flex max-w-lg flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-brass/50 bg-[#0B0A09]/90 shadow-[0_0_35px_rgba(212,168,83,0.35)]">
                <GitCommitHorizontal className="h-8 w-8 text-brass-light animate-pulse" />
              </div>

              <h2 className="mt-6 font-display text-2xl text-ivory sm:text-3xl sm:text-4xl">
                Begin your developer documentary
              </h2>

              <p className="mt-3 text-balance text-sm leading-relaxed text-muted sm:text-base">
                We couldn't find any repositories or commits. Push some code to GitHub to reconstruct your timeline and replay your growth as a cinematic personal documentary.
              </p>

              {error && (
                <div className="mt-4 rounded-xl border border-red-500/30 bg-red-950/20 px-4 py-2.5 text-sm text-red-300">
                  {error}
                </div>
              )}

              <Button
                size="lg"
                onClick={() => loadCommitHistory()}
                disabled={isLoading}
                className="mt-8 rounded-full bg-brass px-8 py-6 font-sans text-sm font-semibold text-ink shadow-[0_0_30px_rgba(212,168,83,0.4)] transition-all hover:bg-brass-light hover:scale-105"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink border-t-transparent" />
                    Scanning GitHub...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Check again
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      ) : !hasLoaded ? (
        /* Loading Skeletons while fetching initial data */
        <div className="flex flex-col gap-8">
          <ProfileSkeleton />
          <RepoSkeleton />
          <TimelineSkeleton />
        </div>
      ) : (
        /* Loaded state — progressive full documentary dashboard */
        <div className="flex flex-col gap-3 py-2 sm:gap-4 sm:py-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 px-1 min-w-0">
              {(profile?.avatar_url || initialAvatar) && (
                <img
                  src={profile?.avatar_url || initialAvatar}
                  alt=""
                  aria-hidden="true"
                  className="h-8 w-8 flex-shrink-0 rounded-full border border-white/10"
                />
              )}
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-sans text-sm font-medium text-ivory truncate">
                  {profile?.name || initialUsername}
                </span>
                <span className="font-mono text-xs text-muted flex-shrink-0">
                  @{profile?.login || initialUsername}
                </span>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                sessionStorage.removeItem(cacheKey);
                loadCommitHistory(true);
              }}
              disabled={isLoading}
              aria-label={isLoading ? "Syncing with GitHub" : "Sync with GitHub"}
              className="rounded-full border-white/10 bg-white/5 font-mono text-xs text-zinc-300 hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white/40"
            >
              {isLoading ? (
                <span className="flex items-center gap-2" aria-hidden="true">
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  Syncing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <RotateCcw className="h-3 w-3" aria-hidden="true" />
                  Sync with GitHub
                </span>
              )}
            </Button>
          </div>

          {/* Cinematic Movie Title Card Hero */}
          <div className="relative z-10 mt-2 mb-4">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-surface p-4 sm:p-6 lg:p-8 shadow-[0_0_40px_rgba(0,0,0,0.8)]">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent" />
              <div className="relative z-10 flex flex-col items-start justify-center">
                <div className="max-w-4xl pb-1">
                  <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400 mb-2">Current Chapter</p>
                  <h2 className="font-sans text-2xl sm:text-4xl md:text-6xl font-semibold text-white tracking-tighter leading-tight drop-shadow-2xl mb-4">
                    The {analytics?.mostActiveYear || new Date().getFullYear()} Chapter
                  </h2>
                  <p className="text-base md:text-lg text-zinc-400 leading-relaxed border-l-2 border-white/20 pl-5 max-w-3xl">
                    {commits.length < 50
                      ? `You are at the beginning of an exciting journey. With ${commits.length} initial contributions, you are laying down the foundation for future technical exploration and growth. Every great documentary starts with a single step.`
                      : `You've been forging ahead, deeply engaged in expanding your technical repertoire. With a surge of ${commits.length} contributions lately, the focus has shifted towards refining core logic and embracing new architectural patterns. The journey is accelerating.`}
                  </p>
                  <div className="mt-8 flex flex-col sm:flex-row flex-wrap gap-4 items-stretch sm:items-center">
                    <Button 
                      onClick={() => router.push("/replay")}
                      className="rounded-full bg-white text-black hover:bg-zinc-200 font-medium px-8 py-4 text-base transition-all hover:scale-[1.02] w-full sm:w-auto justify-center"
                    >
                      <Play className="mr-2 h-4 w-4 fill-current" />
                      Start Documentary
                    </Button>
                    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300">
                      <Sparkles className="h-4 w-4" />
                      Latest Milestone: Over {repos.length} repositories
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tab navigation bar */}
          <div className="mt-1 flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
            <div
              role="tablist"
              aria-label="Dashboard sections"
              className="glass-card flex items-center gap-1 p-1.5 overflow-x-auto overflow-y-hidden scrollbar-hide border border-white/5 bg-surface rounded-full"
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls={`panel-${tab.id}`}
                  tabIndex={activeTab === tab.id ? 0 : -1}
                  onClick={() => setActiveTab(tab.id)}
                  onKeyDown={(e) => handleTabKeyDown(e, tab.id)}
                  className={`flex min-h-[44px] items-center gap-2 rounded-full px-3.5 sm:px-5 py-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? "bg-white text-black shadow-sm"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <tab.icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div aria-live="polite" className="sr-only">
            {`Navigated to ${tabs.find((t) => t.id === activeTab)?.label} section.`}
          </div>

          {/* Tab content wrapped in Suspense for smooth lazy loading */}
          <div
            id={`panel-${activeTab}`}
            role="tabpanel"
            aria-labelledby={`tab-${activeTab}`}
            className="mt-4 pb-12"
          >
            <Suspense fallback={<TimelineSkeleton />}>
            {activeTab === "timeline" && (
              <TimelineView
                yearGroups={yearGroups}
                repos={repos}
                totalCommits={commits.length}
              />
            )}
            {activeTab === "repos" && <RepoSection repos={repos} commits={commits} />}
            {activeTab === "contributions" && (
              <ContributionReplay contributions={contributions} />
            )}
            {activeTab === "analytics" && analytics && (
              <AnalyticsView analytics={analytics} commits={commits} />
            )}
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
}
