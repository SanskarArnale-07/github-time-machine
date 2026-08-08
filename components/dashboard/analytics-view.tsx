"use client";
import React, { useMemo } from 'react';
import { AnalyticsData, GitHubCommit } from '@/lib/github/types';
import { Activity, Code, Clock, Calendar, Zap, Trophy, TrendingUp, BookOpen, Orbit } from 'lucide-react';

interface AnalyticsViewProps {
  analytics: AnalyticsData;
  commits: GitHubCommit[];
}

export function AnalyticsView({ analytics, commits }: AnalyticsViewProps) {
  const commitsByYear = useMemo(() => {
    const counts: Record<string, number> = {};
    commits.forEach(commit => {
      const year = new Date(commit.date).getFullYear().toString();
      counts[year] = (counts[year] || 0) + 1;
    });
    return Object.entries(counts).map(([year, count]) => ({ year, count })).sort((a, b) => Number(a.year) - Number(b.year));
  }, [commits]);

  const maxYearCount = Math.max(...commitsByYear.map(d => d.count), 1);

  const topLanguages = useMemo(() => {
    return (analytics.topLanguages || []).slice(0, 5);
  }, [analytics.topLanguages]);

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

        {/* Developer Evolution (Commit Volume refactored to look premium) */}
        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 shadow-sm">
          <h3 className="font-display text-2xl text-ivory mb-8 flex items-center gap-2">
            <Activity className="h-6 w-6 text-brass-light" />
            Developer Evolution
          </h3>
          {commitsByYear.length > 0 ? (
            <div className="flex items-end gap-3 h-56 pt-4">
              {commitsByYear.map(data => (
                <div key={data.year} className="flex-1 flex flex-col items-center gap-3 group relative">
                  <div className="w-full relative flex items-end justify-center h-full">
                    <div 
                      className="w-full max-w-[40px] bg-white/5 group-hover:bg-brass/30 border border-white/10 group-hover:border-brass rounded-t-md transition-all duration-500 ease-out"
                      style={{ height: `${(data.count / maxYearCount) * 100}%`, minHeight: '4px' }}
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 transform -translate-x-1/2 bg-ink text-ivory text-xs px-3 py-1.5 rounded-lg border border-white/10 shadow-xl font-mono transition-all duration-300 whitespace-nowrap z-10 pointer-events-none">
                        {data.count} commits
                      </div>
                    </div>
                  </div>
                  <span className="text-sm text-muted font-mono">{data.year.slice(-2)}'</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted text-center py-12">Not enough commit data to display timeline.</div>
          )}
        </div>
      </div>
    </div>
  );
}
