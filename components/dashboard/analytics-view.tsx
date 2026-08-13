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
        accent: "text-white"
      });
      
      if (analytics.topLanguages && analytics.topLanguages.length > 0) {
        const topLang = analytics.topLanguages[0].name;
        list.push({
          id: "first-major",
          title: "First Breakthrough",
          narrative: `A breakthrough moment. Adopted ${topLang} to build something substantial and defining.`,
          date: "Key Milestone",
          icon: Trophy,
          accent: "text-white"
        });
      }

      if (analytics.longestStreak > 0) {
        list.push({
          id: "streak",
          title: "The Grind",
          narrative: `An era of unbreakable flow. Maintained relentless focus for a ${analytics.longestStreak}-day coding streak.`,
          date: "Momentum Peak",
          icon: Zap,
          accent: "text-white"
        });
      }
      
      const latestCommit = sorted[sorted.length - 1];
      list.push({
        id: "latest",
        title: "Present Chapter",
        narrative: `The continuing saga. Pushing boundaries and exploring new frontiers in ${latestCommit.repoName}.`,
        date: new Date(latestCommit.date).toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        icon: Flag,
        accent: "text-white"
      });
    }
    return list;
  }, [commits, analytics]);

  const activeDays = useMemo(() => {
    return new Set(commits.map(c => new Date(c.date).toDateString())).size;
  }, [commits]);

  return (
    <div className="w-full space-y-16">
      {/* Developer Trajectory Narrator */}
      <div className="cinematic-depth-card relative overflow-hidden rounded-3xl border border-white/10 bg-[#0A0A0A] p-8 md:p-12 transition-all duration-300">
        <div className="absolute top-0 right-0 p-12 opacity-[0.02]">
          <Orbit className="h-48 w-48 text-white" />
        </div>
        <div className="relative z-10 max-w-4xl">
          <h2 className="flex items-center gap-4 font-sans text-3xl font-semibold tracking-tight text-white md:text-4xl">
            <Trophy className="h-8 w-8 text-white" />
            Developer Trajectory
          </h2>
          <p className="mt-8 text-2xl leading-relaxed text-zinc-300 font-sans font-light border-l-2 border-white/20 pl-6">
            “Your output accelerated sharply, with sustained repository creation and increasing architectural complexity in {analytics.topLanguages?.[0]?.name || 'your primary stacks'}.”
          </p>
          
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="flex flex-col gap-2 rounded-2xl bg-black/50 p-6 border border-white/5">
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Momentum</span>
              <span className="text-lg font-sans font-semibold tracking-tight text-white mt-1">Sustained Growth</span>
              <span className="text-sm text-zinc-400">{analytics.totalCommits} commits across {analytics.longestStreak} day streak peak</span>
            </div>
            <div className="flex flex-col gap-2 rounded-2xl bg-black/50 p-6 border border-white/5">
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Archive Depth</span>
              <span className="text-lg font-sans font-semibold tracking-tight text-white mt-1">Foundational</span>
              <span className="text-sm text-zinc-400">Projects spanning {activeDays} active days of engineering</span>
            </div>
            <div className="flex flex-col gap-2 rounded-2xl bg-black/50 p-6 border border-white/5">
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Evolution</span>
              <span className="text-lg font-sans font-semibold tracking-tight text-white mt-1">{analytics.topLanguages?.[0]?.name || 'Polyglot'} Focused</span>
              <span className="text-sm text-zinc-400">Refining expertise in core ecosystems over time</span>
            </div>
          </div>
        </div>
      </div>

      {/* Narrative Milestone Timeline */}
      <div>
        <h3 className="mb-8 flex items-center gap-3 font-sans text-3xl font-semibold tracking-tight text-white">
          <Clock className="h-7 w-7 text-white" />
          Narrative Milestone Timeline
        </h3>
        
        <div className="grid auto-rows-fr grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
          {milestones.map((milestone) => {
            const { icon: Icon } = milestone;
            return (
              <div 
                key={milestone.id}
                className="cinematic-depth-card group relative h-full min-h-[280px] overflow-hidden rounded-3xl border border-white/5 bg-[#0A0A0A] p-8 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                
                <div className="relative z-10 flex h-full flex-col items-start gap-6">
                  <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 ${milestone.accent}`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                      {milestone.date}
                    </span>
                    <h4 className="mt-2 font-sans text-xl font-semibold tracking-tight text-white">
                      {milestone.title}
                    </h4>
                    <p className="mt-3 text-sm leading-relaxed text-zinc-400">
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
