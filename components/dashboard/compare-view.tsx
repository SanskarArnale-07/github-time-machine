"use client";

import React, { useState, useMemo } from "react";
import { GitHubCommit } from "@/lib/github/types";
import { 
  GitCommitHorizontal, 
  ArrowRight, 
  FolderOpen, 
  Users, 
  Code2,
  Plus,
  Minus,
  FileDiff,
  Share
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";
import Image from "next/image";

interface CompareViewProps {
  commits: GitHubCommit[];
}

export function CompareView({ commits }: CompareViewProps) {
  // Sort commits chronologically for comparison (oldest first)
  const sortedCommits = useMemo(() => {
    return [...commits].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [commits]);

  const [baseCommitIndex, setBaseCommitIndex] = useState(0);
  const [targetCommitIndex, setTargetCommitIndex] = useState(Math.max(0, sortedCommits.length - 1));

  const baseCommit = sortedCommits[baseCommitIndex];
  const targetCommit = sortedCommits[targetCommitIndex];

  // In a real app, this would fetch the actual diff from GitHub API.
  // For the UI demonstration, we compute metrics based on the commits between base and target.
  const diffMetrics = useMemo(() => {
    if (!baseCommit || !targetCommit) return null;
    
    const startIndex = Math.min(baseCommitIndex, targetCommitIndex);
    const endIndex = Math.max(baseCommitIndex, targetCommitIndex);
    const commitsBetween = sortedCommits.slice(startIndex, endIndex + 1);
    
    // Simulate metrics based on the number of commits
    const uniqueAuthors = new Set(commitsBetween.map(c => c.authorLogin)).size;
    const simulatedAdditions = commitsBetween.length * Math.floor(Math.random() * 50 + 20);
    const simulatedDeletions = commitsBetween.length * Math.floor(Math.random() * 20 + 5);
    const simulatedFiles = commitsBetween.length * Math.floor(Math.random() * 3 + 1);
    
    // Growth chart data
    let cumulativeLoc = 0;
    const growthData = commitsBetween.map((c, i) => {
      const adds = Math.floor(Math.random() * 50 + 10);
      const dels = Math.floor(Math.random() * 20 + 5);
      cumulativeLoc += (adds - dels);
      return {
        name: new Date(c.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        adds,
        dels,
        net: cumulativeLoc
      };
    });

    return {
      commitCount: commitsBetween.length,
      uniqueAuthors,
      additions: simulatedAdditions,
      deletions: simulatedDeletions,
      files: simulatedFiles,
      growthData,
      commitsBetween: commitsBetween.reverse() // Newest first for the list
    };
  }, [baseCommitIndex, targetCommitIndex, sortedCommits, baseCommit, targetCommit]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  if (!baseCommit || !targetCommit) {
    return <div className="p-12 text-center text-outline font-mono text-sm">Not enough commits to compare.</div>;
  }

  return (
    <div className="p-4 md:p-8 max-w-[1440px] mx-auto w-full font-sans">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl text-on-surface mb-2 font-bold tracking-tight">Compare Time Periods</h1>
          <p className="text-on-surface-variant text-base max-w-2xl">
            Analyze architectural shifts, metric changes, and major structural differences between two points in history.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="bg-transparent border border-outline-variant text-on-surface px-4 py-2 rounded font-mono text-sm hover:bg-surface-container transition-colors flex items-center gap-2">
            <Share className="h-4 w-4" /> Export
          </button>
        </div>
      </header>

      {/* Point Selector */}
      <section className="bg-surface-container-low border border-outline-variant rounded-lg p-6 mb-8 flex flex-col md:flex-row items-center gap-6 justify-between relative overflow-hidden">
        {/* Connection Line Background */}
        <div className="hidden md:block absolute left-1/2 top-1/2 -translate-y-1/2 w-[40%] h-px bg-outline-variant/50 z-0"></div>
        
        {/* Base Coordinate */}
        <div className="w-full md:w-[40%] bg-surface border border-outline-variant hover:border-primary/50 transition-colors rounded p-4 z-10 relative">
          <div className="flex justify-between items-center mb-2">
            <label className="block font-mono text-[11px] text-outline uppercase tracking-wider">Coordinate A (Base)</label>
          </div>
          <select 
            className="w-full bg-transparent border-none p-0 font-mono text-xl text-primary focus:ring-0 cursor-pointer appearance-none"
            value={baseCommitIndex}
            onChange={(e) => setBaseCommitIndex(Number(e.target.value))}
          >
            {sortedCommits.map((c, i) => (
              <option key={`base-${c.sha}`} value={i} className="text-base bg-surface">
                {c.shortSha || c.sha.substring(0, 7)} - {c.message.substring(0, 40)}
              </option>
            ))}
          </select>
          <div className="font-mono text-xs text-outline mt-2 flex items-center gap-2">
            <span>{formatDate(baseCommit.date)}</span>
            <span className="mx-1">•</span>
            <GitCommitHorizontal className="h-3.5 w-3.5" /> 
            <span>{baseCommit.shortSha || baseCommit.sha.substring(0, 7)}</span>
          </div>
        </div>
        
        {/* Arrow */}
        <div className="bg-surface-container border border-outline-variant rounded-full p-2 z-10 shadow-sm shrink-0 flex items-center justify-center h-10 w-10">
          <ArrowRight className="h-5 w-5 text-outline" />
        </div>
        
        {/* Target Coordinate */}
        <div className="w-full md:w-[40%] bg-surface border border-outline-variant hover:border-primary/50 transition-colors rounded p-4 z-10 relative">
          <div className="flex justify-between items-center mb-2">
            <label className="block font-mono text-[11px] text-outline uppercase tracking-wider">Coordinate B (Target)</label>
          </div>
          <select 
            className="w-full bg-transparent border-none p-0 font-mono text-xl text-primary focus:ring-0 cursor-pointer appearance-none"
            value={targetCommitIndex}
            onChange={(e) => setTargetCommitIndex(Number(e.target.value))}
          >
            {sortedCommits.map((c, i) => (
              <option key={`target-${c.sha}`} value={i} className="text-base bg-surface">
                {c.shortSha || c.sha.substring(0, 7)} - {c.message.substring(0, 40)}
              </option>
            ))}
          </select>
          <div className="font-mono text-xs text-outline mt-2 flex items-center gap-2">
            <span>{formatDate(targetCommit.date)}</span>
            <span className="mx-1">•</span>
            <GitCommitHorizontal className="h-3.5 w-3.5" /> 
            <span>{targetCommit.shortSha || targetCommit.sha.substring(0, 7)}</span>
          </div>
        </div>
      </section>

      {/* Bento Grid Layout */}
      {diffMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Metrics Column */}
          <div className="md:col-span-4 flex flex-col gap-6">
            
            <div className="bg-surface-container-low border border-outline-variant rounded-lg p-6 hover:border-outline-variant/80 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base text-on-surface">Codebase Growth</h3>
                <FolderOpen className="h-5 w-5 text-outline" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-on-surface">+{diffMetrics.commitCount}</span>
                <span className="font-mono text-sm text-[#4ade80]">Commits</span>
              </div>
              <div className="mt-6 h-32 w-full -ml-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={diffMetrics.growthData}>
                    <defs>
                      <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-diff-add, #4ade80)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--color-diff-add, #4ade80)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--surface-container-low, #1c1b1b)', borderColor: 'var(--outline-variant, #424754)', borderRadius: '4px' }}
                      itemStyle={{ color: 'var(--color-diff-add, #4ade80)', fontFamily: 'JetBrains Mono', fontSize: '12px' }}
                      labelStyle={{ display: 'none' }}
                    />
                    <Area type="monotone" dataKey="net" stroke="var(--color-diff-add, #4ade80)" fillOpacity={1} fill="url(#colorNet)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-surface-container-low border border-outline-variant rounded-lg p-6 hover:border-outline-variant/80 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base text-on-surface">Active Contributors</h3>
                <Users className="h-5 w-5 text-outline" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-on-surface">{diffMetrics.uniqueAuthors}</span>
                <span className="font-mono text-sm text-outline">Unique devs</span>
              </div>
            </div>

            <div className="bg-surface-container-low border border-outline-variant rounded-lg p-6 hover:border-outline-variant/80 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base text-on-surface">Lines Changed</h3>
                <Code2 className="h-5 w-5 text-outline" />
              </div>
              <div className="mt-2 space-y-4">
                <div>
                  <div className="flex justify-between font-mono text-xs mb-1">
                    <span className="text-outline">Additions</span>
                    <span className="text-[#4ade80]">+{diffMetrics.additions}</span>
                  </div>
                  <div className="w-full bg-surface-container-high h-1 overflow-hidden flex">
                    <div className="bg-[#4ade80] h-full w-[85%]"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between font-mono text-xs mb-1">
                    <span className="text-outline">Deletions</span>
                    <span className="text-[#f87171]">-{(diffMetrics.deletions)}</span>
                  </div>
                  <div className="w-full bg-surface-container-high h-1 overflow-hidden flex">
                    <div className="bg-[#f87171] h-full w-[40%]"></div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Diff Summary Column */}
          <div className="md:col-span-8 flex flex-col gap-6">
            <div className="bg-surface-container-low border border-outline-variant rounded-lg flex-1 flex flex-col h-[600px]">
              
              <div className="p-6 border-b border-outline-variant flex items-center justify-between bg-surface-container-low rounded-t-lg shrink-0">
                <h3 className="text-lg text-on-surface flex items-center gap-3">
                  <FileDiff className="h-5 w-5 text-outline" /> Diff Summary
                </h3>
                <div className="flex gap-2 font-mono text-xs">
                  <span className="px-2 py-1 bg-[#062C1B] text-[#4ade80] border border-[#4ade80]/20 rounded">
                    ~ {diffMetrics.files} Files Changed
                  </span>
                </div>
              </div>
              
              <div className="p-0 flex-1 overflow-auto custom-scrollbar">
                <ul className="divide-y divide-outline-variant">
                  {diffMetrics.commitsBetween.map((commit, i) => (
                    <li key={commit.sha} className="p-4 hover:bg-surface-container transition-colors flex items-start gap-4 group">
                      <div className={`mt-1 w-5 h-5 rounded flex items-center justify-center shrink-0 ${i % 3 === 0 ? 'bg-[#3B1212]' : 'bg-[#062C1B]'}`}>
                        {i % 3 === 0 ? (
                          <Minus className="h-3.5 w-3.5 text-[#f87171]" />
                        ) : (
                          <Plus className="h-3.5 w-3.5 text-[#4ade80]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-4">
                          <div className="font-mono text-sm text-on-surface group-hover:text-primary transition-colors truncate">
                            {commit.message.split('\n')[0]}
                          </div>
                          <span className="font-mono text-[11px] text-outline shrink-0">
                            {commit.shortSha || commit.sha.substring(0, 7)}
                          </span>
                        </div>
                        <p className="text-sm text-outline mt-1 flex items-center gap-2">
                          <Image src={commit.authorAvatar || ''} alt="" width={16} height={16} className="w-4 h-4 rounded-full" />
                          {commit.authorLogin}
                        </p>
                      </div>
                    </li>
                  ))}
                  
                  {diffMetrics.commitsBetween.length === 0 && (
                    <li className="p-8 text-center text-outline font-mono text-sm">
                      No differences found. The coordinates are identical.
                    </li>
                  )}
                </ul>
              </div>
              
              <div className="p-4 border-t border-outline-variant bg-surface-container-low rounded-b-lg text-center hover:bg-surface-container transition-colors cursor-pointer shrink-0">
                <button className="font-mono text-[11px] text-outline hover:text-primary transition-colors uppercase tracking-widest w-full">
                  View Full Diff on GitHub
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
