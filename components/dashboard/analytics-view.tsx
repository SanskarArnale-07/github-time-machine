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

  return (
    <div className="w-full space-y-20">
      {/* AI Documentary Insight */}
      <div className="cinematic-depth-card relative overflow-hidden rounded-3xl border border-brass/25 bg-gradient-to-br from-brass/10 via-[#1A1714]/80 to-[#0B0A09]/70 p-9 shadow-[0_26px_75px_rgba(0,0,0,0.42)] backdrop-blur-xl transition-all duration-500 hover:shadow-[0_0_48px_rgba(212,168,83,0.16)] md:p-12">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Orbit className="h-32 w-32 text-brass" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <h2 className="flex items-center gap-4 font-display text-3xl font-bold text-ivory md:text-4xl">
            <Trophy className="h-10 w-10 text-brass" />
            Documentary Insight
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted/90 italic">
            "Your coding journey reflects a steady evolution. With a peak activity in {analytics.mostActiveYear || 'recent years'}, you've shown resilience. The high volume of commits ({analytics.totalCommits || 0}) across {analytics.totalRepos || 0} repositories signifies a developer who isn't afraid to explore, learn, and consistently build."
          </p>
        </div>
      </div>

      {/* Narrative Milestone Timeline */}
      <div>
        <h3 className="mb-8 flex items-center gap-3 font-display text-3xl text-ivory">
          <Clock className="h-7 w-7 text-brass-light" />
          Narrative Milestone Timeline
        </h3>
        
        <div className="grid auto-rows-fr grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {milestones.map((milestone) => {
            const { icon: Icon } = milestone;
            return (
              <div 
                key={milestone.id}
                className="cinematic-depth-card group relative h-full min-h-[280px] overflow-hidden rounded-3xl border border-[#2A2520]/80 bg-[#0E0D0B]/65 p-8 shadow-[0_20px_55px_rgba(0,0,0,0.4)] transition-all duration-500 hover:-translate-y-1 hover:border-brass/40 hover:shadow-[0_0_42px_rgba(212,168,83,0.16)]"
                style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/5 blur-3xl transition-all duration-500 group-hover:bg-brass/20" />
                
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
