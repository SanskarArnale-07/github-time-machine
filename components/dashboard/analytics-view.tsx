"use client";
import React, { useMemo } from 'react';
import { AnalyticsData, GitHubCommit } from '@/lib/github/types';
import { Activity, Code, Clock, Calendar, Zap, Trophy } from 'lucide-react';

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
    <div className="space-y-8 w-full">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-ink-surface border border-ink-border rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm hover:border-brass-dim transition-colors">
          <Activity className="w-5 h-5 text-brass mb-2" />
          <span className="font-display text-2xl text-ivory font-bold">{analytics.totalCommits || 0}</span>
          <span className="text-xs text-muted uppercase tracking-wide mt-1">Total Commits</span>
        </div>
        <div className="bg-ink-surface border border-ink-border rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm hover:border-brass-dim transition-colors">
          <Code className="w-5 h-5 text-brass mb-2" />
          <span className="font-display text-2xl text-ivory font-bold">{analytics.totalRepos || 0}</span>
          <span className="text-xs text-muted uppercase tracking-wide mt-1">Total Repos</span>
        </div>
        <div className="bg-ink-surface border border-ink-border rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm hover:border-brass-dim transition-colors">
          <Trophy className="w-5 h-5 text-brass mb-2" />
          <span className="font-display text-2xl text-ivory font-bold">{analytics.longestStreak || 0}</span>
          <span className="text-xs text-muted uppercase tracking-wide mt-1">Longest Streak</span>
        </div>
        <div className="bg-ink-surface border border-ink-border rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm hover:border-brass-dim transition-colors">
          <Zap className="w-5 h-5 text-brass mb-2" />
          <span className="font-display text-2xl text-ivory font-bold">
            {analytics.avgCommitsPerWeek || 0}
          </span>
          <span className="text-xs text-muted uppercase tracking-wide mt-1">Avg Commits/Week</span>
        </div>
        <div className="bg-ink-surface border border-ink-border rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm hover:border-brass-dim transition-colors">
          <Calendar className="w-5 h-5 text-brass mb-2" />
          <span className="font-display text-2xl text-ivory font-bold">{analytics.mostActiveYear || '-'}</span>
          <span className="text-xs text-muted uppercase tracking-wide mt-1">Best Year</span>
        </div>
        <div className="bg-ink-surface border border-ink-border rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm hover:border-brass-dim transition-colors">
          <Clock className="w-5 h-5 text-brass mb-2" />
          <span className="font-display text-xl text-ivory font-bold line-clamp-1">{analytics.mostActiveMonth || '-'}</span>
          <span className="text-xs text-muted uppercase tracking-wide mt-1">Best Month</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Languages */}
        <div className="bg-ink-surface border border-ink-border rounded-2xl p-6 shadow-sm">
          <h3 className="font-display text-xl text-ivory mb-6">Top Languages</h3>
          <div className="space-y-5">
            {topLanguages.length > 0 ? topLanguages.map(lang => (
              <div key={lang.name}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-ivory font-medium">{lang.name}</span>
                  <span className="text-muted font-mono">{lang.percentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-ink-soft rounded-full h-2 overflow-hidden border border-ink-border">
                  <div 
                    className="bg-brass h-full rounded-full" 
                    style={{ width: `${lang.percentage}%` }}
                  />
                </div>
              </div>
            )) : (
              <div className="text-muted text-center py-8">Not enough language data available.</div>
            )}
          </div>
        </div>

        {/* Coding Patterns */}
        <div className="bg-ink-surface border border-ink-border rounded-2xl p-6 shadow-sm">
          <h3 className="font-display text-xl text-ivory mb-6">Coding Patterns</h3>
          <div className="flex flex-row justify-around items-center h-full pb-8">
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-32 h-32 flex items-center justify-center rounded-full bg-ink-soft before:absolute before:inset-2 before:bg-ink-surface before:rounded-full" style={{ background: `conic-gradient(#dda15e ${analytics.lateNightPercentage || 0}%, #2A2F35 0)` }}>
                <div className="relative z-10 flex flex-col items-center">
                  <span className="font-display text-2xl text-ivory">{Math.round(analytics.lateNightPercentage || 0)}%</span>
                </div>
              </div>
              <span className="text-sm text-muted font-medium">Late Night Coding</span>
            </div>
            
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-32 h-32 flex items-center justify-center rounded-full bg-ink-soft before:absolute before:inset-2 before:bg-ink-surface before:rounded-full" style={{ background: `conic-gradient(#26A641 ${analytics.weekendPercentage || 0}%, #2A2F35 0)` }}>
                <div className="relative z-10 flex flex-col items-center">
                  <span className="font-display text-2xl text-ivory">{Math.round(analytics.weekendPercentage || 0)}%</span>
                </div>
              </div>
              <span className="text-sm text-muted font-medium">Weekend Coding</span>
            </div>
          </div>
        </div>
      </div>

      {/* Commits By Year */}
      <div className="bg-ink-surface border border-ink-border rounded-2xl p-6 shadow-sm">
        <h3 className="font-display text-xl text-ivory mb-8">Commit Volume by Year</h3>
        {commitsByYear.length > 0 ? (
          <div className="flex items-end gap-2 md:gap-4 h-48 pt-4">
            {commitsByYear.map(data => (
              <div key={data.year} className="flex-1 flex flex-col items-center gap-3 group">
                <div className="w-full relative flex items-end justify-center h-full">
                  <div 
                    className="w-full max-w-[40px] bg-ink-soft group-hover:bg-brass/20 border border-ink-border group-hover:border-brass/50 rounded-t-sm transition-all duration-300 relative"
                    style={{ height: `${(data.count / maxYearCount) * 100}%`, minHeight: '4px' }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-ink text-ivory text-xs px-2 py-1 rounded shadow-lg font-mono transition-opacity whitespace-nowrap z-10">
                      {data.count}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-muted font-mono">{data.year.slice(-2)}'</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-muted text-center py-12">Not enough commit data to display timeline.</div>
        )}
      </div>
    </div>
  );
}
