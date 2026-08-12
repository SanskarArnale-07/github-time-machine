"use client";
import React, { useMemo } from 'react';
import { AnalyticsData, GitHubCommit } from '@/lib/github/types';
import { Trophy, Orbit, Rocket, Zap, Flag, Clock } from 'lucide-react';

interface AnalyticsViewProps {
  analytics: AnalyticsData;
  commits: GitHubCommit[];
}

export function AnalyticsView({ analytics, commits }: AnalyticsViewProps) {
  const milestones = useMemo(() => {
    const list: { id: string; title: string; narrative: string; date: string; icon: any; accent: string }[] = [];
    
    if (commits.length > 0) {
      const sorted = [...commits].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const firstCommit = sorted[0];
      list.push({
        id: "first-commit",
        title: "The Spark",
        narrative: `The genesis of the journey. First documented code forged in ${firstCommit.repoName}.`,
        date: new Date(firstCommit.date).toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        icon: Rocket,
        accent: "text-brass-light"
      });
      
      if (analytics.topLanguages && analytics.topLanguages.length > 0) {
        const topLang = analytics.topLanguages[0].name;
        list.push({
          id: "first-major",
          title: "First Breakthrough",
          narrative: `A breakthrough moment. Adopted ${topLang} to build something substantial and defining.`,
          date: "Key Milestone",
          icon: Trophy,
          accent: "text-brass-light"
        });
      }

      if (analytics.longestStreak > 0) {
        list.push({
          id: "streak",
          title: "The Grind",
          narrative: `An era of unbreakable flow. Maintained relentless focus for a ${analytics.longestStreak}-day coding streak.`,
          date: "Momentum Peak",
          icon: Zap,
          accent: "text-brass-light"
        });
      }
      
      const latestCommit = sorted[sorted.length - 1];
      list.push({
        id: "latest",
        title: "Present Chapter",
        narrative: `The continuing saga. Pushing boundaries and exploring new frontiers in ${latestCommit.repoName}.`,
        date: new Date(latestCommit.date).toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        icon: Flag,
        accent: "text-brass"
      });
    }
    return list;
  }, [commits, analytics]);

  const activeDays = useMemo(() => {
    return new Set(commits.map(c => new Date(c.date).toDateString())).size;
  }, [commits]);

  return (
    <div className="w-full space-y-20">
      {/* Developer Trajectory Narrator */}
      <div className="cinematic-depth-card relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-[#141210]/90 to-[#0B0A09]/95 p-9 shadow-[0_26px_75px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-500 hover:border-white/10 md:p-12">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03]">
          <Orbit className="h-48 w-48 text-white" />
        </div>
        <div className="relative z-10 max-w-4xl">
          <h2 className="flex items-center gap-4 font-display text-3xl font-bold text-ivory md:text-4xl">
            <Trophy className="h-8 w-8 text-brass-light" />
            Developer Trajectory
          </h2>
          <p className="mt-8 text-2xl leading-relaxed text-ivory font-serif italic border-l-4 border-brass/50 pl-6">
            “Your output accelerated sharply, with sustained repository creation and increasing architectural complexity in {analytics.topLanguages?.[0]?.name || 'your primary stacks'}.”
          </p>
          
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="flex flex-col gap-2 rounded-2xl bg-[#080706]/60 p-6 border border-white/5">
              <span className="text-xs font-mono text-muted uppercase tracking-wider">Momentum</span>
              <span className="text-lg font-display text-ivory mt-1">Sustained Growth</span>
              <span className="text-sm text-muted/70">{analytics.totalCommits} commits across {analytics.longestStreak} day streak peak</span>
            </div>
            <div className="flex flex-col gap-2 rounded-2xl bg-[#080706]/60 p-6 border border-white/5">
              <span className="text-xs font-mono text-muted uppercase tracking-wider">Archive Depth</span>
              <span className="text-lg font-display text-ivory mt-1">Foundational</span>
              <span className="text-sm text-muted/70">Projects spanning {activeDays} active days of engineering</span>
            </div>
            <div className="flex flex-col gap-2 rounded-2xl bg-[#080706]/60 p-6 border border-white/5">
              <span className="text-xs font-mono text-muted uppercase tracking-wider">Evolution</span>
              <span className="text-lg font-display text-ivory mt-1">{analytics.topLanguages?.[0]?.name || 'Polyglot'} Focused</span>
              <span className="text-sm text-muted/70">Refining expertise in core ecosystems over time</span>
            </div>
          </div>
        </div>
      </div>

      {/* Narrative Milestone Timeline */}
      <div>
        <h3 className="mb-8 flex items-center gap-3 font-display text-3xl text-ivory">
          <Clock className="h-7 w-7 text-brass-light" />
          Narrative Milestone Timeline
        </h3>
        
        <div className="grid auto-rows-fr grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
          {milestones.map((milestone) => {
            const { icon: Icon } = milestone;
            return (
              <div 
                key={milestone.id}
                className="cinematic-depth-card group relative h-full min-h-[280px] overflow-hidden rounded-3xl border border-white/5 bg-[#0E0D0B]/80 p-8 shadow-[0_20px_55px_rgba(0,0,0,0.4)] transition-all duration-500 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_0_42px_rgba(255,255,255,0.05)]"
                style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/5 blur-3xl transition-all duration-500 group-hover:bg-brass/10" />
                
                <div className="relative z-10 flex h-full flex-col items-start gap-6" style={{ transform: 'translateZ(30px)' }}>
                  <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-brass/15 bg-brass/5 shadow-inner ${milestone.accent}`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted">
                      {milestone.date}
                    </span>
                    <h4 className="mt-2 font-display text-xl font-bold text-ivory">
                      {milestone.title}
                    </h4>
                    <p className="mt-3 text-sm leading-relaxed text-muted/80">
                      {milestone.narrative}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
