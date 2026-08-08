"use client";

import { useState, useCallback } from "react";
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
import { TimelineView } from "./timeline-view";
import { TimelineReplay } from "./timeline-replay";
import { ContributionReplay } from "./contribution-replay";
import { AnalyticsView } from "./analytics-view";
import {
  ProfileSkeleton,
  RepoSkeleton,
  TimelineSkeleton,
} from "./loading-skeleton";
import { Button } from "@/components/ui/button";

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

      setHasLoaded(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const tabs: { id: TabId; label: string; icon: typeof Play }[] = [
    { id: "replay", label: "Replay", icon: Play },
    { id: "timeline", label: "Timeline", icon: Layers },
    { id: "repos", label: "Repositories", icon: FolderGit2 },
    { id: "contributions", label: "Contributions", icon: Grid3X3 },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  // Landing state — show profile + load button
  if (!hasLoaded) {
    return (
      <div className="flex flex-col gap-10">
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

        <div className="relative overflow-hidden rounded-3xl border border-ink-border bg-gradient-to-b from-ink-surface via-ink-soft to-ink px-8 py-16 text-center sm:px-12 sm:py-20">
          {/* Glow accents */}
          <div className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full bg-brass/8 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-commit-300/6 blur-3xl" />

          <div className="relative mx-auto flex max-w-lg flex-col items-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-brass-dim/50 bg-ink-surface">
              <GitCommitHorizontal className="h-7 w-7 text-brass-light" />
            </div>

            <h2 className="mt-6 font-display text-3xl text-ivory sm:text-4xl">
              Begin your journey
            </h2>

            <p className="mt-3 text-balance text-sm leading-relaxed text-muted sm:text-base">
              Fetch your repositories, reconstruct commit logs across the years,
              and replay your developer growth through a cinematic timeline.
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
              className="mt-8 bg-brass font-sans text-sm font-semibold text-ink hover:bg-brass-light"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink border-t-transparent" />
                  Loading history...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Load commit history
                </span>
              )}
            </Button>

            <p className="mt-3 text-xs text-muted/60">
              Aggregates commits across your repositories
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
    );
  }

  // Loaded state — full dashboard
  return (
    <div className="flex flex-col gap-8">
      <ProfileCard
        profile={profile}
        fallbackUsername={initialUsername}
        fallbackAvatar={initialAvatar}
        fallbackEmail={initialEmail}
      />

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total commits", value: commits.length, color: "text-ivory" },
          { label: "Repositories", value: repos.length, color: "text-commit-300" },
          { label: "Years active", value: yearGroups.length, color: "text-brass-light" },
          { label: "Languages", value: analytics?.topLanguages?.length ?? 0, color: "text-ivory" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-ink-border bg-ink-surface/80 px-4 py-3"
          >
            <p className={`font-display text-2xl ${stat.color}`}>{stat.value}</p>
            <p className="mt-0.5 text-xs text-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tab navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-border pb-3">
        <div className="flex items-center gap-1 rounded-lg border border-ink-border bg-ink-surface p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-brass text-ink"
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
          className="text-xs text-muted"
        >
          <RotateCcw className={`mr-1.5 h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "replay" && <TimelineReplay commits={commits} />}
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
      </div>
    </div>
  );
}
