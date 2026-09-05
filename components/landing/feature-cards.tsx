"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Film, 
  BarChart3, 
  Share2, 
  Play, 
  GitCommit, 
  GitBranch, 
  Flame, 
  Clock, 
  Download,
  Sparkles
} from "lucide-react";
import { MagicCard } from "@/components/ui/magic-card";

export function FeatureCards() {
  return (
    <section id="features-section" className="relative py-20 lg:py-24 bg-transparent px-6 overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto">
        
        {/* Section Hero Copy - Kept unchanged as requested */}
        <div className="text-center mb-16 lg:mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="font-sans text-4xl lg:text-[2.75rem] font-bold text-white tracking-tighter leading-[1.1]"
          >
            Press play on your own history.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-5 text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto font-sans leading-relaxed"
          >
            Watch years of code unfold as a cinematic documentary of your developer journey.
          </motion.p>
        </div>

        {/* 3 Interactive Information-Rich Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 xl:gap-10 items-stretch">
          
          {/* =========================================================================
              CARD 1 — CINEMATIC REPLAY
              ========================================================================= */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0 }}
            className="h-full"
          >
            <MagicCard 
              className="h-full"
              gradientColor="rgba(212, 168, 83, 0.12)"
              borderSpotlightColor="rgba(212, 168, 83, 0.35)"
            >
              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-[#d4a853]/10 border border-[#d4a853]/25 text-[#d4a853] shadow-[0_0_15px_rgba(212,168,83,0.12)]">
                    <Film className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300/90 font-medium">
                    Chronological Engine
                  </span>
                </div>

                <h3 className="font-sans text-xl lg:text-2xl font-bold text-white tracking-tight">
                  Cinematic Replay
                </h3>
                <p className="font-sans text-sm text-zinc-400 mt-1.5 leading-relaxed">
                  Replay your coding journey as a chronological documentary.
                </p>
              </div>

              {/* Compact Visual Data Section (Illustrative Preview) */}
              <div className="my-6 space-y-4">
                <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                  <span>Product Preview</span>
                  <span className="text-zinc-400">Sample Timeline</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-[#091124]/50 backdrop-blur-sm border border-blue-400/15 rounded-xl p-2.5 transition-colors group-hover:border-blue-400/30">
                    <div className="font-sans text-lg font-bold text-white tracking-tight">233</div>
                    <div className="font-mono text-[9px] text-zinc-400 uppercase tracking-wider mt-0.5">Commits</div>
                  </div>
                  <div className="bg-[#091124]/50 backdrop-blur-sm border border-blue-400/15 rounded-xl p-2.5 transition-colors group-hover:border-blue-400/30">
                    <div className="font-sans text-lg font-bold text-white tracking-tight">6</div>
                    <div className="font-mono text-[9px] text-zinc-400 uppercase tracking-wider mt-0.5">Repos</div>
                  </div>
                  <div className="bg-[#091124]/50 backdrop-blur-sm border border-[#d4a853]/20 rounded-xl p-2.5 transition-colors group-hover:border-[#d4a853]/40">
                    <div className="font-sans text-lg font-bold text-[#d4a853] tracking-tight">17d</div>
                    <div className="font-mono text-[9px] text-[#d4a853]/80 uppercase tracking-wider mt-0.5">Streak</div>
                  </div>
                </div>

                {/* Horizontal Timeline Preview */}
                <div className="bg-[#091124]/40 backdrop-blur-sm border border-blue-400/10 rounded-2xl p-3.5 space-y-2">
                  <div className="flex justify-between items-center text-[9px] font-mono text-zinc-400 tracking-wider">
                    <span className="text-zinc-400">FIRST COMMIT</span>
                    <span className="text-[#d4a853] font-semibold flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      MILESTONES
                    </span>
                    <span className="text-blue-300">LATEST</span>
                  </div>

                  {/* Timeline Track with Subtle Moving/Pulsing Nodes */}
                  <div className="relative h-5 flex items-center">
                    {/* Background track */}
                    <div className="w-full h-1 rounded-full bg-gradient-to-r from-blue-500/20 via-[#d4a853]/40 to-blue-400/70" />

                    {/* Progress indicator overlay (GPU scaleX instead of layout reflow) */}
                    <motion.div 
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-1 w-full rounded-full bg-gradient-to-r from-blue-400 to-[#d4a853] origin-left"
                      initial={{ scaleX: 0.2 }}
                      animate={{ scaleX: [0.2, 0.85, 0.2] }}
                      transition={{ duration: 7, ease: "easeInOut", repeat: Infinity }}
                    />

                    {/* Node 1: First Commit */}
                    <div 
                      className="absolute left-0 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-blue-400 ring-2 ring-[#0d172e] shadow-[0_0_8px_rgba(59,130,246,0.6)]"
                      title="Initial Commit"
                    />

                    {/* Node 2: Milestone (pulsing) */}
                    <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
                      <span className="absolute w-4 h-4 rounded-full bg-[#d4a853]/30 animate-ping motion-reduce:hidden" />
                      <div 
                        className="relative w-3 h-3 rounded-full bg-[#d4a853] ring-2 ring-[#0d172e] shadow-[0_0_10px_rgba(212,168,83,0.8)]" 
                        title="Milestone Breakthrough"
                      />
                    </div>

                    {/* Node 3: Latest */}
                    <div 
                      className="absolute right-0 translate-x-1/2 w-2.5 h-2.5 rounded-full bg-blue-300 ring-2 ring-[#0d172e] shadow-[0_0_8px_rgba(147,197,253,0.8)]"
                      title="Latest Commit"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Visual Narrative Tagline */}
              <div className="pt-3 border-t border-white/5 text-center">
                <span className="font-mono text-[11px] text-zinc-400 tracking-tight italic">
                  time passes → commits accumulate → story emerges
                </span>
              </div>
            </MagicCard>
          </motion.div>


          {/* =========================================================================
              CARD 2 — DEVELOPER ANALYTICS
              ========================================================================= */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="h-full"
          >
            <MagicCard 
              className="h-full"
              gradientColor="rgba(59, 130, 246, 0.14)"
              borderSpotlightColor="rgba(59, 130, 246, 0.35)"
            >
              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-blue-500/10 border border-blue-400/25 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.12)]">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300/90 font-medium">
                    Pattern Suite
                  </span>
                </div>

                <h3 className="font-sans text-xl lg:text-2xl font-bold text-white tracking-tight">
                  Developer Analytics
                </h3>
                <p className="font-sans text-sm text-zinc-400 mt-1.5 leading-relaxed">
                  Understand how you actually build.
                </p>
              </div>

              {/* Compact Visual Analytics Section (Illustrative Insights) */}
              <div className="my-6 space-y-3.5">
                <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                  <span>Discovery Engine</span>
                  <span className="text-zinc-400">Sample Insights</span>
                </div>

                {/* Insight 1: Most Active Language + Distribution Bar */}
                <div className="bg-[#091124]/50 backdrop-blur-sm border border-blue-400/15 rounded-xl p-3 space-y-2 transition-colors group-hover:border-blue-400/30">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-wider">Most Active Language</span>
                    <span className="font-sans font-semibold text-white">Python <span className="font-mono text-zinc-400 text-[11px]">(58%)</span></span>
                  </div>

                  {/* Multi-language distribution bar */}
                  <div className="h-1.5 w-full rounded-full bg-blue-950/60 overflow-hidden flex">
                    <div className="h-full bg-[#d4a853] w-[58%]" title="Python 58%" />
                    <div className="h-full bg-[#3b82f6] w-[28%]" title="TypeScript 28%" />
                    <div className="h-full bg-[#06b6d4] w-[14%]" title="Go 14%" />
                  </div>

                  <div className="flex items-center gap-3 text-[9px] font-mono text-zinc-400">
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#d4a853]" /> Python</span>
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]" /> TypeScript</span>
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#06b6d4]" /> Go</span>
                  </div>
                </div>

                {/* Insight 2 & 3: Peak Activity & Sparkline + Longest Streak & Top Repo */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Peak Activity Sparkline */}
                  <div className="bg-[#091124]/50 backdrop-blur-sm border border-blue-400/15 rounded-xl p-2.5 flex flex-col justify-between transition-colors group-hover:border-blue-400/30">
                    <div>
                      <div className="font-mono text-[9px] text-zinc-400 uppercase tracking-wider">Peak Activity</div>
                      <div className="font-sans text-sm font-bold text-white mt-0.5">August</div>
                    </div>
                    {/* SVG Sparkline */}
                    <div className="h-7 w-full mt-2">
                      <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible">
                        <defs>
                          <linearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        {/* Area */}
                        <polygon 
                          points="0,28 10,24 22,22 35,26 48,15 62,8 75,5 88,14 100,20 100,30 0,30" 
                          fill="url(#sparkGradient)" 
                        />
                        {/* Line */}
                        <polyline 
                          fill="none" 
                          stroke="#60a5fa" 
                          strokeWidth="2" 
                          points="0,28 10,24 22,22 35,26 48,15 62,8 75,5 88,14 100,20" 
                        />
                        {/* Peak Point */}
                        <circle cx="75" cy="5" r="2.5" fill="#d4a853" className="animate-pulse" />
                      </svg>
                    </div>
                  </div>

                  {/* Longest Streak & Top Repo */}
                  <div className="bg-[#091124]/50 backdrop-blur-sm border border-blue-400/15 rounded-xl p-2.5 flex flex-col justify-between transition-colors group-hover:border-blue-400/30">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[9px] text-zinc-400 uppercase tracking-wider">Longest Streak</span>
                        <Flame className="w-3 h-3 text-[#d4a853]" />
                      </div>
                      <div className="font-sans text-sm font-bold text-[#d4a853] mt-0.5">17 days</div>
                    </div>

                    <div className="pt-2 border-t border-white/5">
                      <div className="font-mono text-[9px] text-zinc-400 uppercase tracking-wider">Top Repo</div>
                      <div className="font-mono text-[10px] text-blue-200 truncate mt-0.5 flex items-center gap-1">
                        <GitBranch className="w-2.5 h-2.5 text-blue-400 flex-shrink-0" />
                        weather-dashboard
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Visual Glimpse Tagline */}
              <div className="pt-3 border-t border-white/5 text-center">
                <span className="font-mono text-[11px] text-zinc-400 tracking-tight italic">
                  uncover cadence • identify velocity • inspect habits
                </span>
              </div>
            </MagicCard>
          </motion.div>


          {/* =========================================================================
              CARD 3 — SHAREABLE DOCUMENTARY
              ========================================================================= */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="h-full"
          >
            <MagicCard 
              className="h-full"
              gradientColor="rgba(212, 168, 83, 0.12)"
              borderSpotlightColor="rgba(212, 168, 83, 0.35)"
            >
              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-[#d4a853]/10 border border-[#d4a853]/25 text-[#d4a853] shadow-[0_0_15px_rgba(212,168,83,0.12)]">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse motion-reduce:hidden" />
                    Export Ready
                  </span>
                </div>

                <h3 className="font-sans text-xl lg:text-2xl font-bold text-white tracking-tight">
                  Shareable Documentary
                </h3>
                <p className="font-sans text-sm text-zinc-400 mt-1.5 leading-relaxed">
                  Turn your Git history into a story worth sharing.
                </p>
              </div>

              {/* Miniature Documentary Preview Card */}
              <div className="my-6 space-y-3.5">
                <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                  <span>Export Preview</span>
                  <span className="text-zinc-400">Sample Story</span>
                </div>

                {/* Documentary Film Card Canvas */}
                <div className="bg-[#091124]/50 backdrop-blur-sm border border-blue-400/20 rounded-2xl p-3.5 space-y-3 relative overflow-hidden transition-all group-hover:border-blue-400/35 shadow-inner">
                  {/* Subtle top edge glow */}
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d4a853]/30 to-transparent" />

                  {/* Year in code & badge */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <div>
                      <div className="font-mono text-[9px] text-[#d4a853] uppercase tracking-widest font-semibold">Year In Code</div>
                      <div className="font-display text-xl font-bold text-white tracking-tight">2026</div>
                    </div>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-blue-500/20 border border-blue-400/30 text-blue-200">
                      Chapter 04
                    </span>
                  </div>

                  {/* Story Highlights Strip */}
                  <div className="grid grid-cols-3 gap-1.5 text-center py-1">
                    <div>
                      <div className="font-sans text-sm font-bold text-white">233</div>
                      <div className="font-mono text-[8px] text-zinc-400 uppercase">Commits</div>
                    </div>
                    <div>
                      <div className="font-sans text-sm font-bold text-white">6</div>
                      <div className="font-mono text-[8px] text-zinc-400 uppercase">Repositories</div>
                    </div>
                    <div>
                      <div className="font-sans text-sm font-bold text-[#d4a853]">17d</div>
                      <div className="font-mono text-[8px] text-[#d4a853]/80 uppercase">Longest Streak</div>
                    </div>
                  </div>

                  {/* Miniature Player Progress Scrubber */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[8px] font-mono text-zinc-400">
                      <span>00:48</span>
                      <span className="text-zinc-400">01:15</span>
                    </div>
                    <div className="h-1 w-full bg-blue-950/80 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full w-full bg-gradient-to-r from-blue-400 via-[#d4a853] to-white origin-left"
                        initial={{ scaleX: 0.65 }}
                        animate={{ scaleX: [0.65, 0.78, 0.65] }}
                        transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
                      />
                    </div>
                  </div>
                </div>

                {/* Miniature Action Buttons: REPLAY • TIMELINE • EXPORT */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex items-center justify-center gap-1 py-2 px-1 rounded-xl bg-blue-500/10 border border-blue-400/20 text-blue-200 font-mono text-[10px] font-medium transition-all hover:bg-blue-500/20 hover:border-blue-400/40 cursor-default">
                    <Play className="w-3 h-3 text-[#d4a853] fill-[#d4a853]" />
                    <span>REPLAY</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 py-2 px-1 rounded-xl bg-blue-500/10 border border-blue-400/20 text-blue-200 font-mono text-[10px] font-medium transition-all hover:bg-blue-500/20 hover:border-blue-400/40 cursor-default">
                    <Clock className="w-3 h-3 text-blue-300" />
                    <span>TIMELINE</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 py-2 px-1 rounded-xl bg-[#d4a853]/15 border border-[#d4a853]/30 text-[#d4a853] font-mono text-[10px] font-medium transition-all hover:bg-[#d4a853]/25 hover:border-[#d4a853]/50 cursor-default">
                    <Download className="w-3 h-3" />
                    <span>EXPORT</span>
                  </div>
                </div>
              </div>

              {/* Bottom Visual Narrative Tagline */}
              <div className="pt-3 border-t border-white/5 text-center">
                <span className="font-mono text-[11px] text-zinc-400 tracking-tight italic">
                  rendered video • interactive web reel • portable memory
                </span>
              </div>
            </MagicCard>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
