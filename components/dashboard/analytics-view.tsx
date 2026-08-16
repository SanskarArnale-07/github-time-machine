"use client";

import { useState, useMemo, useEffect, useTransition } from "react";
import { 
  Activity, 
  Code2, 
  Calendar,
  Clock,
  Zap,
  TrendingUp,
  Star
} from "lucide-react";
import { AnalyticsData, GitHubCommit } from "@/lib/github/types";
import Image from "next/image";

interface AnalyticsViewProps {
  analytics: AnalyticsData;
  commits: GitHubCommit[];
}

export function AnalyticsView({ analytics, commits }: AnalyticsViewProps) {
  const [, startTransition] = useTransition();

  // Defer heavy date parsing off the initial paint — computed in a
  // low-priority transition so the first frame renders instantly.
  const [activeDays, setActiveDays] = useState<number | null>(null);
  const [sortedCommits, setSortedCommits] = useState<GitHubCommit[]>([]);

  useEffect(() => {
    startTransition(() => {
      const days = new Set(commits.map(c => new Date(c.date).toDateString())).size;
      setActiveDays(days);

      const sorted = [...commits].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      setSortedCommits(sorted);
    });
  }, [commits]);

  const firstCommit = sortedCommits[0];
  const latestCommit = sortedCommits[sortedCommits.length - 1];

  return (
    <div className="flex flex-col gap-12">
      <section className="panel-card">
        <h2 className="section-label mb-6 border-b border-white/[0.06] pb-3">Overview</h2>
        <OverviewTab analytics={analytics} activeDays={activeDays} />
      </section>

      <section className="panel-card">
        <h2 className="section-label mb-6 border-b border-white/[0.06] pb-3">Activity</h2>
        <ActivityTab analytics={analytics} commits={commits} />
      </section>

      <section className="panel-card">
        <h2 className="section-label mb-6 border-b border-white/[0.06] pb-3">Languages</h2>
        <LanguagesTab analytics={analytics} />
      </section>

      <section className="panel-card">
        <h2 className="section-label mb-6 border-b border-white/[0.06] pb-3">Milestones</h2>
        <MilestonesTab analytics={analytics} firstCommit={firstCommit} latestCommit={latestCommit} />
      </section>

      <section className="panel-card">
        <h2 className="section-label mb-6 border-b border-white/[0.06] pb-3">Scores</h2>
        <ScoresTab analytics={analytics} />
      </section>
    </div>
  );
}

function OverviewTab({ analytics, activeDays }: { analytics: AnalyticsData; activeDays: number | null }) {
  const maxYearCommits = Math.max(...Object.values(analytics.commitsByYear));

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Commits" value={analytics.totalCommits} icon={<Code2 size={16} />} />
        <StatCard label="Total Repos" value={analytics.totalRepos} icon={<Code2 size={16} />} />
        <StatCard label="Longest Streak" value={`${analytics.longestStreak}d`} icon={<Zap size={16} />} />
        <StatCard label="Active Days" value={activeDays ?? "—"} icon={<Activity size={16} />} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col gap-4">
          <h3 className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">Commits by Year</h3>
          <div className="flex flex-col gap-3">
            {Object.entries(analytics.commitsByYear).map(([year, count]) => (
              <div key={year} className="flex items-center gap-3">
                <span className="text-xs text-zinc-400 w-10">{year}</span>
                <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white/80 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${maxYearCommits > 0 ? (count / maxYearCommits) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-xs text-zinc-400 tabular-nums min-w-[2.5rem] text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">Top Languages</h3>
          <div className="flex flex-col gap-3">
            {analytics.topLanguages.slice(0, 5).map(lang => (
              <div key={lang.name} className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-300">{lang.name}</span>
                  <span className="text-zinc-500">{lang.percentage}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white/80 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${lang.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 p-4 bg-white/[0.02] rounded-lg border border-white/[0.04]">
        <p className="text-sm text-zinc-400 italic">"{analytics.insights.insightNarrative.split('.')[0]}."</p>
      </div>
    </div>
  );
}

function ActivityTab({ analytics, commits }: { analytics: AnalyticsData; commits: GitHubCommit[] }) {
  // Compute commits by year directly from commits (avoids stale API cache)
  const yearData = useMemo(() => {
    const byYear: Record<number, number> = {};
    for (const c of commits) {
      byYear[c.year] = (byYear[c.year] || 0) + 1;
    }
    return Object.entries(byYear)
      .map(([y, c]) => ({ year: Number(y), count: c }))
      .sort((a, b) => a.year - b.year);
  }, [commits]);

  const maxYearCommits = Math.max(...yearData.map(d => d.count), 1);
  const peakYear = yearData.reduce((best, d) => d.count > best.count ? d : best, yearData[0]);

  // Compute weekday & time-of-day from commits directly
  const { weekdayData, timeOfDayData } = useMemo(() => {
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayCounts: Record<string, number> = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    const timeCounts = { Morning: 0, Afternoon: 0, Evening: 0, Night: 0 };

    for (const c of commits) {
      const d = new Date(c.date);
      dayCounts[dayNames[d.getDay()]]++;
      const h = d.getHours();
      if (h >= 5 && h < 12) timeCounts.Morning++;
      else if (h >= 12 && h < 17) timeCounts.Afternoon++;
      else if (h >= 17 && h < 22) timeCounts.Evening++;
      else timeCounts.Night++;
    }

    const total = commits.length || 1;
    const weekdayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const weekdayData = weekdayOrder.map(day => ({
      day,
      count: dayCounts[day],
      pct: Math.round((dayCounts[day] / total) * 100),
    }));

    const timeOrder = ["Morning", "Afternoon", "Evening", "Night"] as const;
    const timeLabels: Record<string, string> = { Morning: "5am – 12pm", Afternoon: "12pm – 5pm", Evening: "5pm – 10pm", Night: "10pm – 5am" };
    const timeOfDayData = timeOrder.map(label => ({
      label,
      sublabel: timeLabels[label],
      count: timeCounts[label],
      pct: Math.round((timeCounts[label] / total) * 100),
    }));

    return { weekdayData, timeOfDayData };
  }, [commits]);

  const maxWeekdayCount = Math.max(...weekdayData.map(d => d.count), 1);
  const maxTimePct = Math.max(...timeOfDayData.map(t => t.pct), 1);

  // Weekend + late night from commits
  const weekendCommits = commits.filter(c => {
    const day = new Date(c.date).getDay();
    return day === 0 || day === 6;
  }).length;

  const lateNightCommits = commits.filter(c => {
    const hour = new Date(c.date).getHours();
    return hour >= 22 || hour <= 4;
  }).length;

  const totalCommits = commits.length;
  const weekendPct = totalCommits > 0 ? Math.round((weekendCommits / totalCommits) * 100) : 0;
  const lateNightPct = totalCommits > 0 ? Math.round((lateNightCommits / totalCommits) * 100) : 0;

  return (
    <div className="flex flex-col gap-10">
      {/* Activity Timeline — Vertical Bars */}
      <div className="flex flex-col gap-4">
        <h3 className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">Commits by Year</h3>
        {yearData.length > 0 ? (
          <div className="overflow-x-auto pb-2">
            <div className="flex gap-1.5 min-w-max" style={{ height: "120px" }}>
              {yearData.map(({ year, count }) => {
                const heightPct = (count / maxYearCommits) * 100;
                const isPeak = peakYear && year === peakYear.year;
                return (
                  <div
                    key={year}
                    className="flex-1 flex flex-col justify-end bg-white/[0.04] rounded-t"
                    style={{ maxWidth: "80px" }}
                    title={`${year}: ${count} commits`}
                  >
                    <div
                      className={`w-full rounded-t transition-all duration-700 ease-out ${isPeak ? 'bg-white' : 'bg-white/30'}`}
                      style={{ height: `${heightPct}%`, minHeight: count > 0 ? "4px" : "0px" }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex gap-1.5 min-w-max mt-2">
              {yearData.map(({ year, count }) => (
                <div key={year} className="flex-1 flex flex-col items-center" style={{ maxWidth: "80px" }}>
                  <span className={`text-[10px] ${peakYear && year === peakYear.year ? 'text-white' : 'text-zinc-500'}`}>{year}</span>
                  <span className="text-[9px] text-zinc-600">{count}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-zinc-600">No commit data yet.</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Time of Day — Horizontal Bars */}
        <div className="flex flex-col gap-4">
          <h3 className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">Time of Day</h3>
          <div className="flex flex-col gap-3">
            {timeOfDayData.map(time => (
              <div key={time.label} className="flex items-center gap-3">
                <div className="w-16 sm:w-20 shrink-0">
                  <span className="text-xs text-zinc-300 block">{time.label}</span>
                  <span className="text-[9px] text-zinc-600">{time.sublabel}</span>
                </div>
                <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white/60 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${maxTimePct > 0 ? (time.pct / maxTimePct) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-[10px] text-zinc-500 min-w-[3.5rem] text-right shrink-0 tabular-nums">{time.count} · {time.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Day of Week — Vertical Bars */}
        <div className="flex flex-col gap-4">
          <h3 className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">Day of Week</h3>
          <div>
            <div className="flex gap-2" style={{ height: "96px" }}>
              {weekdayData.map(day => {
                const heightPct = maxWeekdayCount > 0 ? (day.count / maxWeekdayCount) * 100 : 0;
                return (
                  <div key={day.day} className="flex-1 flex flex-col justify-end bg-white/[0.04] rounded-t" title={`${day.day}: ${day.count} commits`}>
                    <div
                      className="w-full bg-white/50 rounded-t transition-all duration-700 ease-out"
                      style={{ height: `${heightPct}%`, minHeight: day.count > 0 ? "3px" : "0px" }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2 mt-2">
              {weekdayData.map(day => (
                <div key={day.day} className="flex-1 flex flex-col items-center">
                  <span className="text-[10px] text-zinc-500">{day.day}</span>
                  <span className="text-[9px] text-zinc-600">{day.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Weekend + Night — Real counts */}
      <div className="grid grid-cols-2 gap-4 border-t border-white/[0.06] pt-6">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-1">Weekend Commits</p>
          <p className="text-2xl text-white">{weekendPct}%</p>
          <p className="text-xs text-zinc-500">{weekendCommits} of {totalCommits} on Sat/Sun</p>
        </div>
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-1">Late Night</p>
          <p className="text-2xl text-white">{lateNightPct}%</p>
          <p className="text-xs text-zinc-500">{lateNightCommits} of {totalCommits} after 10pm</p>
        </div>
      </div>
    </div>
  );
}

function LanguagesTab({ analytics }: { analytics: AnalyticsData }) {
  if (!analytics.topLanguages || analytics.topLanguages.length === 0) {
    return <div className="text-sm text-zinc-500">No language data available.</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      {analytics.topLanguages.map((lang, idx) => (
        <div key={lang.name} className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-200">{lang.name}</span>
              {idx === 0 && (
                <span className="px-1.5 py-0.5 bg-white/10 text-[9px] font-mono uppercase tracking-wider text-white rounded">
                  Primary
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-xs text-zinc-500">
              <span>{lang.count} repos</span>
              <span className="w-12 text-right">{lang.percentage}%</span>
            </div>
          </div>
          <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-700 ease-out ${idx === 0 ? 'bg-white' : 'bg-white/60'}`}
              style={{ width: `${lang.percentage}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function MilestonesTab({ analytics, firstCommit, latestCommit }: { analytics: AnalyticsData, firstCommit: GitHubCommit | undefined, latestCommit: GitHubCommit | undefined }) {
  const formatMonth = (str: string | null) => {
    if (!str || str === "N/A") return "-";
    const parts = str.split("-");
    if (parts.length !== 2) return "-";
    const [year, month] = parts;
    const d = new Date(Number(year), Number(month) - 1);
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  const activeYearCommits = analytics.mostActiveYear ? analytics.commitsByYear[analytics.mostActiveYear] : 0;
  const totalCommits = analytics.totalCommits;
  const bestMonthKey = analytics.insights.bestCodingMonth;
  
  // Try to find the commit count for the best month by scanning commits
  // Since we don't pass commits directly to MilestonesTab yet, we can pass them or just use a generic subtext
  // Actually, wait, commits is not passed to MilestonesTab. Let me pass it or just use simple math.
  // It's better to pass commits or just use what we have. Let's use what we have and make subtexts realistic.

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <MilestoneCard 
        title="First Commit" 
        value={firstCommit ? new Date(firstCommit.date).toLocaleDateString() : "-"} 
        subtext={firstCommit ? `In ${firstCommit.repoName}` : "-"}
        icon={<Clock size={16} />}
      />
      <MilestoneCard 
        title="Latest Commit" 
        value={latestCommit ? new Date(latestCommit.date).toLocaleDateString() : "-"} 
        subtext={latestCommit ? `In ${latestCommit.repoName}` : "-"}
        icon={<TrendingUp size={16} />}
      />
      <MilestoneCard 
        title="Longest Streak" 
        value={analytics.longestStreak > 0 ? `${analytics.longestStreak} Days` : "-"} 
        subtext={analytics.longestStreak > 0 ? `Max consecutive days coded` : "-"}
        icon={<Zap size={16} />}
      />
      <MilestoneCard 
        title="Most Active Year" 
        value={analytics.mostActiveYear?.toString() || "-"} 
        subtext={activeYearCommits > 0 ? `${activeYearCommits} commits in ${analytics.mostActiveYear}` : "-"}
        icon={<Calendar size={16} />}
      />
      <MilestoneCard 
        title="Best Month" 
        value={formatMonth(bestMonthKey)} 
        subtext={bestMonthKey && bestMonthKey !== "N/A" ? "Peak monthly activity" : "-"}
        icon={<Star size={16} />}
      />
      <MilestoneCard 
        title="Fastest Growth" 
        value={analytics.insights.fastestRepoGrowth || "-"} 
        subtext={analytics.insights.fastestRepoGrowth ? `Most committed repository` : "-"}
        icon={<TrendingUp size={16} />}
      />
    </div>
  );
}

function MilestoneCard({ title, value, subtext, icon }: { title: string, value: string, subtext: string, icon: React.ReactNode }) {
  return (
    <div className="p-5 border border-white/[0.06] rounded-xl bg-white/[0.02] flex flex-col gap-3">
      <div className="flex items-center gap-2 text-zinc-500">
        {icon}
        <span className="font-mono text-[10px] uppercase tracking-widest">{title}</span>
      </div>
      <div>
        <p className="text-xl text-white font-medium">{value}</p>
        <p className="text-xs text-zinc-500 mt-1 truncate" title={subtext}>{subtext}</p>
      </div>
    </div>
  );
}

function ScoresTab({ analytics }: { analytics: AnalyticsData }) {
  const scores = [
    { label: "Consistency", score: analytics.insights.commitConsistencyScore, desc: "Commit regularity across time" },
    { label: "Exploration", score: analytics.insights.explorationScore, desc: "Variety of repos and languages" },
    { label: "Craftsmanship", score: analytics.insights.craftsmanshipScore, desc: "Quality and depth of contributions" },
    { label: "Focus", score: analytics.insights.focusScore, desc: "Dedication to core repositories" },
    { label: "Night Owl", score: analytics.insights.nightOwlScore, desc: "Frequency of late-night coding" },
  ];

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap justify-center gap-6 md:gap-8">
        {scores.map(s => (
          <ScoreRing key={s.label} label={s.label} score={s.score} description={s.desc} />
        ))}
      </div>
      
      <div className="mt-4 p-5 bg-white/[0.02] rounded-xl border border-white/[0.04]">
        <p className="text-sm text-zinc-300 leading-relaxed">
          {analytics.insights.insightNarrative}
        </p>
      </div>
    </div>
  );
}

function ScoreRing({ label, score, description }: { label: string; score: number; description: string }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            className="stroke-zinc-800 fill-none"
            strokeWidth="4"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            className="stroke-white fill-none transition-all duration-1000 ease-out"
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-semibold text-white">{Math.round(score)}</span>
        </div>
      </div>
      <div>
        <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-300 block mb-1">{label}</span>
        <span className="text-[10px] text-zinc-500 leading-tight block">{description}</span>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string, value: string | number, icon: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5 text-zinc-500">
        {icon}
        <span className="font-mono text-[10px] uppercase tracking-widest">{label}</span>
      </div>
      <span className="text-3xl font-semibold text-white">{value}</span>
    </div>
  );
}
