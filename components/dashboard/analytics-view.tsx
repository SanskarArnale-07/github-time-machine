"use client";
import React, { useMemo } from 'react';
import { AnalyticsData, GitHubCommit } from '@/lib/github/types';
import { Activity, Code, Clock, Calendar, Zap, Trophy, TrendingUp, BookOpen, Orbit } from 'lucide-react';

interface AnalyticsViewProps {
  analytics: AnalyticsData;
  commits: GitHubCommit[];
}

export function AnalyticsView({ analytics, commits }: AnalyticsViewProps) {
  const topLanguages = useMemo(() => {
    return (analytics.topLanguages || []).slice(0, 5);
  }, [analytics.topLanguages]);

  const milestones = useMemo(() => {
    const repoFirstCommits = new Map<string, GitHubCommit>();
    commits.forEach(commit => {
      const commitDate = new Date(commit.date);
      if (!repoFirstCommits.has(commit.repoName) || commitDate < new Date(repoFirstCommits.get(commit.repoName)!.date)) {
        repoFirstCommits.set(commit.repoName, commit);
      }
    });

    return Array.from(repoFirstCommits.values())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  }, [commits]);

  return (
    <div className="space-y-12 w-full">
      {/* AI Documentary Insight */}
      <div className="relative overflow-hidden rounded-3xl border border-brass/20 bg-gradient-to-br from-brass/5 to-transparent p-8 md:p-10 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Orbit className="h-32 w-32 text-brass" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <h2 className="font-display text-3xl font-bold text-ivory flex items-center gap-3">
            <Trophy className="h-8 w-8 text-brass" />
            Documentary Insight
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted/90 italic">
            "Your coding journey reflects a steady evolution. With a peak activity in {analytics.mostActiveYear || 'recent years'}, you've shown resilience. The high volume of commits ({analytics.totalCommits || 0}) across {analytics.totalRepos || 0} repositories signifies a developer who isn't afraid to explore, learn, and consistently build."
          </p>
        </div>
      </div>

      {/* Momentum Analysis */}
      <div>
        <h3 className="font-display text-2xl text-ivory mb-6 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-brass-light" />
          Momentum Analysis
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 shadow-sm hover:bg-white/[0.04] transition-colors">
            <Activity className="w-6 h-6 text-brass mb-3" />
            <span className="font-display text-3xl text-ivory font-bold">{analytics.totalCommits || 0}</span>
            <span className="text-xs text-muted uppercase tracking-wider mt-2 block">Total Commits</span>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 shadow-sm hover:bg-white/[0.04] transition-colors">
            <Trophy className="w-6 h-6 text-brass mb-3" />
            <span className="font-display text-3xl text-ivory font-bold">{analytics.longestStreak || 0}</span>
            <span className="text-xs text-muted uppercase tracking-wider mt-2 block">Longest Streak</span>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 shadow-sm hover:bg-white/[0.04] transition-colors">
            <Zap className="w-6 h-6 text-brass mb-3" />
            <span className="font-display text-3xl text-ivory font-bold">
              {analytics.avgCommitsPerWeek || 0}
            </span>
            <span className="text-xs text-muted uppercase tracking-wider mt-2 block">Avg Commits/Week</span>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 shadow-sm hover:bg-white/[0.04] transition-colors">
            <Clock className="w-6 h-6 text-brass mb-3" />
            <span className="font-display text-xl md:text-2xl text-ivory font-bold line-clamp-1">{analytics.mostActiveMonth || '-'}</span>
            <span className="text-xs text-muted uppercase tracking-wider mt-2 block">Best Month</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Learning Timeline (Top Languages redefined) */}
        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 shadow-sm">
          <h3 className="font-display text-2xl text-ivory mb-8 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-brass-light" />
            Learning Timeline
          </h3>
          <div className="space-y-6">
            {topLanguages.length > 0 ? topLanguages.map(lang => (
              <div key={lang.name}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-ivory font-semibold text-base">{lang.name}</span>
                  <span className="text-brass-light font-mono text-sm">{lang.percentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-ink-soft rounded-full h-3 overflow-hidden border border-ink-border/50">
                  <div 
                    className="bg-gradient-to-r from-brass to-brass-light h-full rounded-full" 
                    style={{ width: `${lang.percentage}%` }}
                  />
                </div>
              </div>
            )) : (
              <div className="text-muted text-center py-8">Not enough language data available.</div>
            )}
          </div>
        </div>

        {/* Developer Evolution (Milestone Timeline) */}
        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 shadow-sm">
          <h3 className="font-display text-2xl text-ivory mb-8 flex items-center gap-2">
            <Activity className="h-6 w-6 text-brass-light" />
            Evolution Story
          </h3>
          {milestones.length > 0 ? (
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
              {milestones.map((milestone, idx) => {
                const date = new Date(milestone.date);
                return (
                  <div key={milestone.sha} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/20 bg-ink-surface text-brass-light shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-transform group-hover:scale-110">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white/[0.03] border border-white/5 p-4 rounded-xl shadow-sm hover:border-brass/30 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs text-brass font-bold">
                          {date.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                        </span>
                      </div>
                      <div className="font-semibold text-ivory text-sm truncate">First commit in {milestone.repoName}</div>
                      <div className="text-muted text-xs truncate mt-1">{milestone.message}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-muted text-center py-12">Not enough commit data to display timeline.</div>
          )}
        </div>
      </div>
    </div>
  );
}
