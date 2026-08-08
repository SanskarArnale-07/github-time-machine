"use client";

import { useState } from "react";
import {
  GitCommitHorizontal,
  Layers,
  Play,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  FolderGit2,
  Calendar,
  Compass,
} from "lucide-react";
import {
  GitHubUserProfile,
  GitHubRepo,
  GitHubCommit,
  TimelineYearGroup,
} from "@/lib/github/types";
import { ProfileCard } from "./profile-card";
import { TimelineView } from "./timeline-view";
import { TimelineReplay } from "./timeline-replay";
import { Button } from "@/components/ui/button";

interface DashboardContentProps {
  initialUsername: string;
  initialAvatar?: string;
  initialEmail?: string;
  initialProfile: GitHubUserProfile | null;
  initialRepos?: GitHubRepo[];
  initialCommits?: GitHubCommit[];
  initialYearGroups?: TimelineYearGroup[];
}

export function DashboardContent({
  initialUsername,
  initialAvatar,
  initialEmail,
  initialProfile,
  initialRepos = [],
  initialCommits = [],
  initialYearGroups = [],
}: DashboardContentProps) {
  const [profile, setProfile] = useState<GitHubUserProfile | null>(initialProfile);
  const [repos, setRepos] = useState<GitHubRepo[]>(initialRepos);
  const [commits, setCommits] = useState<GitHubCommit[]>(initialCommits);
  const [yearGroups, setYearGroups] = useState<TimelineYearGroup[]>(initialYearGroups);

  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(initialCommits.length > 0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Tab view: 'timeline' | 'replay'
  const [activeTab, setActiveTab] = useState<"timeline" | "replay">("replay");

  const handleLoadCommitHistory = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/github/commits");
      if (!res.ok) {
        throw new Error(`Failed to load commit history (${res.status})`);
      }

      const data = await res.json();
      if (data.profile) setProfile(data.profile);
      if (data.repos) setRepos(data.repos);
      if (data.commits) setCommits(data.commits);
      if (data.yearGroups) setYearGroups(data.yearGroups);

      setHasLoaded(true);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        err.message || "Failed to load commits from GitHub. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const totalCommits = commits.length;
  const totalRepos = repos.length;
  const activeYears = yearGroups.length;

  return (
    <div className="flex flex-col gap-10">
      {/* User Profile Card */}
      <ProfileCard
        profile={profile}
        fallbackUsername={initialUsername}
        fallbackAvatar={initialAvatar}
        fallbackEmail={initialEmail}
      />

      {/* Main Time Machine Section */}
      {!hasLoaded ? (
        /* Invitation State with "Load commit history" button */
        <div className="relative overflow-hidden rounded-3xl border border-brass-dim/40 bg-gradient-to-b from-ink-surface to-ink p-8 text-center shadow-2xl sm:p-14">
          <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-brass/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-commit-300/10 blur-3xl" />

          <div className="relative mx-auto flex max-w-xl flex-col items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-brass bg-ink-surface shadow-[0_0_30px_rgba(217,142,57,0.3)]">
              <Compass className="h-8 w-8 text-brass-light animate-pulse" />
            </div>

            <span className="mt-6 font-mono text-xs uppercase tracking-[0.25em] text-brass-light">
              Temporal Index Ready
            </span>

            <h2 className="mt-2 font-display text-3xl text-ivory sm:text-4xl">
              Commence Your Journey
            </h2>

            <p className="mt-3 text-balance font-sans text-sm leading-relaxed text-muted sm:text-base">
              Fetch your repositories, reconstruct commit logs across past years,
              and replay your developer growth through the vintage chronometer.
            </p>

            {errorMessage && (
              <div className="mt-4 rounded-xl border border-red-500/40 bg-red-950/30 px-4 py-2 font-mono text-xs text-red-300">
                {errorMessage}
              </div>
            )}

            <div className="mt-8 flex flex-col items-center gap-3">
              <Button
                size="lg"
                onClick={handleLoadCommitHistory}
                disabled={isLoading}
                className="group relative h-14 overflow-hidden rounded-full bg-brass px-10 font-mono text-base font-semibold text-ink shadow-[0_0_30px_rgba(217,142,57,0.5)] transition-all hover:bg-brass-light hover:scale-[1.02]"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink border-t-transparent" />
                    Aligning Temporal Cores...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-ink" />
                    Load Commit History
                  </span>
                )}
              </Button>

              <span className="font-mono text-[11px] text-muted/70">
                Aggregates commits, branches, and timeline milestones
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Loaded State with Statistics, Tabs, Replay Player & Timeline */
        <div className="flex flex-col gap-8">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="flex flex-col rounded-2xl border border-ink-border bg-ink-surface/80 p-4 transition-all hover:border-brass/30">
              <span className="font-mono text-xs uppercase tracking-wider text-muted">
                Total Commits
              </span>
              <span className="mt-1 font-display text-3xl font-bold text-ivory">
                {totalCommits}
              </span>
            </div>

            <div className="flex flex-col rounded-2xl border border-ink-border bg-ink-surface/80 p-4 transition-all hover:border-brass/30">
              <span className="font-mono text-xs uppercase tracking-wider text-muted">
                Active Repositories
              </span>
              <span className="mt-1 font-display text-3xl font-bold text-commit-300">
                {totalRepos}
              </span>
            </div>

            <div className="flex flex-col rounded-2xl border border-ink-border bg-ink-surface/80 p-4 transition-all hover:border-brass/30">
              <span className="font-mono text-xs uppercase tracking-wider text-muted">
                Years Spanned
              </span>
              <span className="mt-1 font-display text-3xl font-bold text-brass-light">
                {activeYears}
              </span>
            </div>

            <div className="flex flex-col rounded-2xl border border-ink-border bg-ink-surface/80 p-4 transition-all hover:border-brass/30">
              <span className="font-mono text-xs uppercase tracking-wider text-muted">
                Chronology State
              </span>
              <span className="mt-1 flex items-center gap-1.5 font-mono text-sm font-semibold text-commit-300">
                <CheckCircle2 className="h-4 w-4" />
                Synchronized
              </span>
            </div>
          </div>

          {/* Navigation Controls and View Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-border pb-4">
            {/* View Switcher Tabs */}
            <div className="flex items-center gap-2 rounded-xl border border-ink-border bg-ink-surface p-1">
              <button
                onClick={() => setActiveTab("replay")}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 font-mono text-xs font-semibold transition-all ${
                  activeTab === "replay"
                    ? "bg-brass text-ink shadow-md"
                    : "text-muted hover:text-ivory"
                }`}
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                Timeline Replay Mode
              </button>
              <button
                onClick={() => setActiveTab("timeline")}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 font-mono text-xs font-semibold transition-all ${
                  activeTab === "timeline"
                    ? "bg-brass text-ink shadow-md"
                    : "text-muted hover:text-ivory"
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                Grouped Timeline View
              </button>
            </div>

            {/* Refresh / Re-fetch Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLoadCommitHistory}
              disabled={isLoading}
              className="font-mono text-xs text-muted hover:text-ivory"
            >
              <RotateCcw
                className={`mr-2 h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh History
            </Button>
          </div>

          {/* Tab Content Display */}
          {activeTab === "replay" ? (
            <TimelineReplay commits={commits} />
          ) : (
            <TimelineView
              yearGroups={yearGroups}
              repos={repos}
              totalCommits={totalCommits}
            />
          )}
        </div>
      )}
    </div>
  );
}
