"use client";

import { useState, useMemo, useEffect, useTransition } from "react";
import { 
  Activity, 
  Code2, 
  Calendar,
  Clock,
  Zap,
  TrendingUp,
  Star,
  Sun,
  Sunset,
  Moon,
  Sunrise,
} from "lucide-react";
import { AnalyticsData, GitHubCommit } from "@/lib/github/types";

interface AnalyticsViewProps {
  analytics: AnalyticsData;
  commits: GitHubCommit[];
}

export function AnalyticsView({ analytics, commits }: AnalyticsViewProps) {
  const [, startTransition] = useTransition();
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
    <div className="flex flex-col gap-10">
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
  const maxYearCommits = Math.max(...Object.values(analytics.commitsByYear), 1);
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
                  <div className="h-full bg-white/80 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${maxYearCommits > 0 ? (count / maxYearCommits) * 100 : 0}%` }} />
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
                  <div className="h-full bg-white/80 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${lang.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4 p-4 bg-white/[0.02] rounded-lg border border-white/[0.04]">
        <p className="text-sm text-zinc-400 italic">"{analytics.insights.insightNarrative.split(".")[0]}."</p>
      </div>
    </div>
  );
}

/* ── Commits by Year — vertical bar chart ───────────────────────────────────── */
// Bar width: fixed 48px per column (centred), so a single year never fills the
// entire container. scaleY animation avoids layout-heavy height transitions.
const BAR_W = 48;

function CommitsByYearChart({ yearData, peakYear }: {
  yearData: { year: number; count: number }[];
  peakYear: { year: number; count: number } | undefined;
}) {
  const maxCount = Math.max(...yearData.map(d => d.count), 1);
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const CHART_H = 128; // px — bar column height

  return (
    <div className="flex flex-col gap-3">
      {/* Scrollable row of fixed-width columns */}
      <div
        className="flex items-end gap-3 overflow-x-auto pb-1"
        style={{ height: CHART_H }}
      >
        {yearData.map(({ year, count }) => {
          const scalePct = count / maxCount; // 0–1
          const barH = Math.max(scalePct * (CHART_H - 4), count > 0 ? 4 : 0);
          const isPeak = peakYear?.year === year;
          const isHovered = hoveredYear === year;

          const barBg = isPeak
            ? "linear-gradient(to top, rgba(255,255,255,0.90), rgba(255,255,255,0.35))"
            : isHovered
              ? "linear-gradient(to top, rgba(255,255,255,0.55), rgba(255,255,255,0.15))"
              : "linear-gradient(to top, rgba(255,255,255,0.32), rgba(255,255,255,0.08))";

          return (
            <div
              key={year}
              className="relative flex flex-col justify-end flex-shrink-0 cursor-default"
              style={{ width: BAR_W, height: "100%" }}
              onMouseEnter={() => setHoveredYear(year)}
              onMouseLeave={() => setHoveredYear(null)}
            >
              {/* Hover tooltip */}
              {isHovered && (
                <div className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 z-20 pointer-events-none whitespace-nowrap">
                  <div className="rounded-md border border-white/10 bg-[#0d1117] px-2.5 py-1.5 shadow-xl">
                    <p className="font-mono text-[11px] text-white font-semibold text-center">{count}</p>
                    <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider text-center">commits</p>
                  </div>
                </div>
              )}

              {/* Track — full height, dimmed */}
              <div
                className="w-full rounded-sm overflow-hidden"
                style={{ height: CHART_H, background: "rgba(255,255,255,0.04)" }}
              >
                {/* Fill — opacity fade-in, no transforms */}
                <div
                  className="w-full rounded-sm"
                  style={{
                    height: barH,
                    marginTop: CHART_H - barH,
                    background: barBg,
                    boxShadow: isPeak ? "0 0 10px rgba(255,255,255,0.15)" : undefined,
                    opacity: mounted ? 1 : 0,
                    transition: "opacity 0.5s ease-out",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Labels row — same fixed-width columns */}
      <div className="flex gap-3">
        {yearData.map(({ year, count }) => (
          <div
            key={year}
            className="flex flex-col items-center gap-0.5 flex-shrink-0"
            style={{ width: BAR_W }}
          >
            <span className={`font-mono text-[10px] ${peakYear?.year === year ? "text-white" : "text-zinc-500"}`}>
              {year}
            </span>
            <span className="font-mono text-[9px] text-zinc-600 tabular-nums">{count}</span>
          </div>
        ))}
      </div>

      {yearData.length === 1 && (
        <p className="font-mono text-[10px] text-zinc-600">First year on record — history starts here.</p>
      )}
    </div>
  );
}

/* ── Time of Day — horizontal bars with icons ──────────────────────────────── */
const TIME_ICONS: Record<string, React.ReactNode> = {
  Morning: <Sunrise size={13} className="text-zinc-400 shrink-0" />,
  Afternoon: <Sun size={13} className="text-zinc-400 shrink-0" />,
  Evening: <Sunset size={13} className="text-zinc-400 shrink-0" />,
  Night: <Moon size={13} className="text-zinc-400 shrink-0" />,
};

function TimeOfDayBars({ data, maxPct }: {
  data: { label: string; sublabel: string; count: number; pct: number }[];
  maxPct: number;
}) {
  const [mounted, setMounted] = useState(false);
  const peakLabel = data.length > 0 ? data.reduce((best, d) => d.pct > best.pct ? d : best, data[0]).label : "";

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 120);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex flex-col gap-3.5">
      {data.map(time => {
        const barPct = mounted && maxPct > 0 ? (time.pct / maxPct) * 100 : 0;
        const isPeak = time.label === peakLabel;
        return (
          <div key={time.label} className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 w-[5.5rem] shrink-0">
              {TIME_ICONS[time.label]}
              <div>
                <span className="text-[11px] text-zinc-300 block leading-none">{time.label}</span>
                <span className="text-[9px] text-zinc-600 leading-none">{time.sublabel}</span>
              </div>
            </div>
            <div className="flex-1 h-[5px] bg-white/[0.05] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${barPct}%`,
                  background: isPeak
                    ? "linear-gradient(to right, rgba(255,255,255,0.85), rgba(255,255,255,0.4))"
                    : "linear-gradient(to right, rgba(255,255,255,0.45), rgba(255,255,255,0.15))",
                }}
              />
            </div>
            <span className="text-[10px] text-zinc-500 min-w-[4rem] text-right shrink-0 tabular-nums font-mono">
              {time.count} · {time.pct}%
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ── Day of Week — vertical bars (scaleY, no absolute fills) ────────────────── */
function DayOfWeekBars({ data }: {
  data: { day: string; count: number; pct: number }[];
}) {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  const peakDay = data.length > 0 ? data.reduce((best, d) => d.count > best.count ? d : best, data[0]).day : "";
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 150);
    return () => clearTimeout(t);
  }, []);

  const CHART_H = 88; // px

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end gap-2" style={{ height: CHART_H }}>
        {data.map(({ day, count }) => {
          const scalePct = count / maxCount;
          const barH = Math.max(scalePct * (CHART_H - 4), count > 0 ? 3 : 0);
          const isPeak = day === peakDay;
          const isHovered = hoveredDay === day;

          const barBg = isPeak
            ? "linear-gradient(to top, rgba(255,255,255,0.82), rgba(255,255,255,0.28))"
            : isHovered
              ? "linear-gradient(to top, rgba(255,255,255,0.52), rgba(255,255,255,0.10))"
              : "linear-gradient(to top, rgba(255,255,255,0.28), rgba(255,255,255,0.06))";

          return (
            <div
              key={day}
              className="relative flex-1 flex flex-col justify-end cursor-default"
              style={{ height: "100%" }}
              onMouseEnter={() => setHoveredDay(day)}
              onMouseLeave={() => setHoveredDay(null)}
            >
              {/* Hover count tooltip */}
              {isHovered && (
                <div className="absolute bottom-[calc(100%+5px)] left-1/2 -translate-x-1/2 z-20 pointer-events-none whitespace-nowrap">
                  <div className="rounded border border-white/10 bg-[#0d1117] px-2 py-1 shadow-xl">
                    <p className="font-mono text-[10px] text-white text-center">{count}</p>
                  </div>
                </div>
              )}

              {/* Track — full height, very dim */}
              <div
                className="w-full rounded-sm overflow-hidden"
                style={{ height: CHART_H, background: "rgba(255,255,255,0.04)" }}
              >
                {/* Fill — opacity fade-in, no transforms */}
                <div
                  className="w-full rounded-sm"
                  style={{
                    height: barH,
                    marginTop: CHART_H - barH,
                    background: barBg,
                    opacity: mounted ? 1 : 0,
                    transition: "opacity 0.45s ease-out",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-2">
        {data.map(({ day, count }) => (
          <div key={day} className="flex-1 flex flex-col items-center gap-0.5">
            <span className={`font-mono text-[10px] ${day === peakDay ? "text-white" : "text-zinc-500"}`}>{day}</span>
            <span className="font-mono text-[9px] text-zinc-700 tabular-nums">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Activity Tab ────────────────────────────────────────────────────────────── */
function ActivityTab({ analytics, commits }: { analytics: AnalyticsData; commits: GitHubCommit[] }) {
  const yearData = useMemo(() => {
    const byYear: Record<number, number> = {};
    for (const c of commits) { byYear[c.year] = (byYear[c.year] || 0) + 1; }
    return Object.entries(byYear)
      .map(([y, c]) => ({ year: Number(y), count: c }))
      .sort((a, b) => a.year - b.year);
  }, [commits]);

  const peakYear = yearData.length > 0
    ? yearData.reduce((best, d) => d.count > best.count ? d : best, yearData[0])
    : undefined;

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
      day, count: dayCounts[day], pct: Math.round((dayCounts[day] / total) * 100),
    }));

    const timeOrder = ["Morning", "Afternoon", "Evening", "Night"] as const;
    const timeLabels: Record<string, string> = {
      Morning: "5am–12pm", Afternoon: "12pm–5pm", Evening: "5pm–10pm", Night: "10pm–5am",
    };
    const timeOfDayData = timeOrder.map(label => ({
      label, sublabel: timeLabels[label], count: timeCounts[label],
      pct: Math.round((timeCounts[label] / total) * 100),
    }));

    return { weekdayData, timeOfDayData };
  }, [commits]);

  const maxTimePct = Math.max(...timeOfDayData.map(t => t.pct), 1);

  const weekendCommits = commits.filter(c => { const d = new Date(c.date).getDay(); return d === 0 || d === 6; }).length;
  const lateNightCommits = commits.filter(c => { const h = new Date(c.date).getHours(); return h >= 22 || h <= 4; }).length;
  const totalCommits = commits.length;
  const weekendPct = totalCommits > 0 ? Math.round((weekendCommits / totalCommits) * 100) : 0;
  const lateNightPct = totalCommits > 0 ? Math.round((lateNightCommits / totalCommits) * 100) : 0;

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">Commits by Year</h3>
          {peakYear && (
            <span className="font-mono text-[10px] text-zinc-600">
              Peak: <span className="text-zinc-400">{peakYear.year}</span>
            </span>
          )}
        </div>
        {yearData.length > 0 ? (
          <CommitsByYearChart yearData={yearData} peakYear={peakYear} />
        ) : (
          <p className="text-sm text-zinc-600">No commit data yet.</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col gap-4">
          <h3 className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">Time of Day</h3>
          <TimeOfDayBars data={timeOfDayData} maxPct={maxTimePct} />
        </div>
        <div className="flex flex-col gap-4">
          <h3 className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">Day of Week</h3>
          <DayOfWeekBars data={weekdayData} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t border-white/[0.06] pt-6">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-1">Weekend Commits</p>
          <p className="text-2xl text-white tabular-nums">{weekendPct}%</p>
          <p className="text-xs text-zinc-500">{weekendCommits} of {totalCommits} on Sat/Sun</p>
        </div>
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-1">Late Night</p>
          <p className="text-2xl text-white tabular-nums">{lateNightPct}%</p>
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
                <span className="px-1.5 py-0.5 bg-white/10 text-[9px] font-mono uppercase tracking-wider text-white rounded">Primary</span>
              )}
            </div>
            <div className="flex items-center gap-4 text-xs text-zinc-500">
              <span>{lang.count} repos</span>
              <span className="w-12 text-right">{lang.percentage}%</span>
            </div>
          </div>
          <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${idx === 0 ? "bg-white" : "bg-white/60"}`}
              style={{ width: `${lang.percentage}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function MilestonesTab({ analytics, firstCommit, latestCommit }: {
  analytics: AnalyticsData;
  firstCommit: GitHubCommit | undefined;
  latestCommit: GitHubCommit | undefined;
}) {
  const formatMonth = (str: string | null) => {
    if (!str || str === "N/A") return "-";
    const parts = str.split("-");
    if (parts.length !== 2) return "-";
    const [year, month] = parts;
    const d = new Date(Number(year), Number(month));
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  const activeYearCommits = analytics.mostActiveYear ? analytics.commitsByYear[analytics.mostActiveYear] : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <MilestoneCard title="First Commit"
        value={firstCommit ? new Date(firstCommit.date).toLocaleDateString() : "-"}
        subtext={firstCommit ? `In ${firstCommit.repoName}` : "-"}
        icon={<Clock size={16} />} />
      <MilestoneCard title="Latest Commit"
        value={latestCommit ? new Date(latestCommit.date).toLocaleDateString() : "-"}
        subtext={latestCommit ? `In ${latestCommit.repoName}` : "-"}
        icon={<TrendingUp size={16} />} />
      <MilestoneCard title="Most Active Year"
        value={analytics.mostActiveYear?.toString() || "-"}
        subtext={activeYearCommits > 0 ? `${activeYearCommits} commits in ${analytics.mostActiveYear}` : "-"}
        icon={<Calendar size={16} />} />
      <MilestoneCard title="Best Month"
        value={formatMonth(analytics.insights.bestCodingMonth)}
        subtext={analytics.insights.bestCodingMonth && analytics.insights.bestCodingMonth !== "N/A" ? "Peak monthly activity" : "-"}
        icon={<Star size={16} />} />
      <MilestoneCard title="Fastest Growth"
        value={analytics.insights.fastestRepoGrowth || "-"}
        subtext={analytics.insights.fastestRepoGrowth ? "Most committed repository" : "-"}
        icon={<TrendingUp size={16} />} />
    </div>
  );
}

function MilestoneCard({ title, value, subtext, icon }: { title: string; value: string; subtext: string; icon: React.ReactNode }) {
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
        {scores.map(s => <ScoreRing key={s.label} label={s.label} score={s.score} description={s.desc} />)}
      </div>
      <div className="mt-4 p-5 bg-white/[0.02] rounded-xl border border-white/[0.04]">
        <p className="text-sm text-zinc-300 leading-relaxed">{analytics.insights.insightNarrative}</p>
      </div>
    </div>
  );
}

function ScoreRing({ label, score, description }: { label: string; score: number; description: string }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const explanations: Record<string, string> = {
    Consistency: "How regularly you commit. Higher values indicate consistent activity throughout the year.",
    Exploration: "How diverse your work is across repositories and languages.",
    Craftsmanship: "The depth and care behind your contributions. Reflects commit quality and stars earned.",
    Focus: "How concentrated your work is on fewer repos. Higher values mean core-project dedication.",
    "Night Owl": "Percentage of commits after 10pm. Higher = more late-night coding sessions.",
  };

  const getScoreLevel = (s: number) => {
    if (s >= 90) return "Exceptional";
    if (s >= 75) return "Strong";
    if (s >= 60) return "Solid";
    if (s >= 40) return "Developing";
    return "Building";
  };

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      {/* Ring container — all positioning is relative to this div */}
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} className="stroke-zinc-800 fill-none" strokeWidth="4" />
          <circle
            cx="50" cy="50" r={radius}
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

        {/* Info button anchored at top-right — tooltip floats above it */}
        <div className="absolute -top-1 -right-1">
          <button
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="h-5 w-5 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold text-zinc-400 hover:bg-white/20 hover:text-white transition-colors flex items-center justify-center"
            aria-label={`Info for ${label}`}
          >
            ?
          </button>
          {showTooltip && (
            <div className="absolute bottom-full right-0 mb-2 z-50 w-52 rounded-lg border border-white/10 bg-black/95 p-3 shadow-2xl text-left pointer-events-none">
              <p className="text-[11px] text-zinc-300 leading-relaxed mb-2">{explanations[label] || description}</p>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">Level:</span>
                <span className="font-mono text-[10px] font-semibold text-white">{getScoreLevel(score)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-300 block mb-1">{label}</span>
        <span className="text-[10px] text-zinc-500 leading-tight block">{description}</span>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
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
