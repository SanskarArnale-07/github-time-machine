"use client";

import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Github,
  Play,
  GitCommit,
  Sparkles,
  FolderGit2,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Film,
  Code2,
  Zap,
  Clock,
} from "lucide-react";
import { signInWithGithub } from "@/lib/supabase/auth-actions";
import { Button } from "@/components/ui/button";
import { GitBackground } from "@/components/landing/git-background";

export function Hero() {
  const [activeCommitIdx, setActiveCommitIdx] = useState(0);

  // Animated contribution grid squares that evolve with the timeline
  const sampleSquares = useMemo(() => {
    // Brighter silvers with a dark silver (#a1a1aa) highlight for peak activity
    const colors = ["#18181b", "#3f3f46", "#71717a", "#e4e4e7", "#a1a1aa"];
    const intensity = 1 + activeCommitIdx * 0.8;
    return Array.from({ length: 48 }).map((_, i) => {
      const randomBase = (i * 7 + 3) % 10;
      const activeValue = Math.min(
        Math.floor((randomBase * intensity) / 4),
        colors.length - 1,
      );
      return {
        id: i,
        color: colors[activeValue],
        delay: (i % 8) * 0.15,
      };
    });
  }, [activeCommitIdx]);

  const timelineMilestones = [
    { year: "2025", label: "First repository founded" },
    { year: "2025", label: "First 10 commits & setup" },
    { year: "2026", label: "Longest streak (42 days)" },
    { year: "2026", label: "Major project architecture" },
  ];

  const simulatedCommits = [
    {
      repo: "weather-dashboard",
      hash: "#4a9f1b2",
      msg: "feat: implement real-time radar stream pipeline",
      narration:
        "October 2025: You stopped experimenting and started building consistently.",
      progress: "68%",
      streak: "18d",
      date: "Oct 24, 2025",
    },
    {
      repo: "rust-cli-tool",
      hash: "#7b2c9e1",
      msg: "refactor: optimize memory allocation for large files",
      narration:
        "A breakthrough moment. You began caring about deep performance.",
      progress: "75%",
      streak: "42d",
      date: "Feb 12, 2026",
    },
    {
      repo: "portfolio-v3",
      hash: "#f9d83c4",
      msg: "design: overhaul layout with glassmorphism and tailwind",
      narration: "You found your aesthetic identity as a developer.",
      progress: "82%",
      streak: "64d",
      date: "Aug 05, 2026",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCommitIdx((prev) => (prev + 1) % simulatedCommits.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [simulatedCommits.length]);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-x-hidden bg-[#0A0A0A] pt-12 px-6 sm:px-12 lg:px-16 selection:bg-white/20 selection:text-white">
      {/* 1. Cinematic Background: Git-inspired timeline */}
      <GitBackground />

      {/* 2. Hero Content Container — Premium editorial layout */}
      <div className="relative z-10 mx-auto w-full max-w-7xl pt-4 pb-8 lg:pt-6 lg:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Core Headline, Value Proposition, & CTAs */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
            {/* Top pill badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-md shadow-sm mb-5"
            >
              <Sparkles className="h-4 w-4 text-zinc-400" />
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-300">
                Developer Documentary Experience
              </span>
            </motion.div>

            {/* Display Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tighter text-white leading-[1.05]"
            >
              Your coding journey as a{" "}
              <span className="font-medium text-zinc-500 underline decoration-2 underline-offset-4 decoration-zinc-700">
                film.
              </span>
            </motion.h1>

            {/* Modern Sans-serif Subhead */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-4 max-w-xl font-sans text-base sm:text-lg leading-relaxed text-zinc-400"
            >
              Replay years of commits, repository milestones, and late-night
              refactors as an unhurried, beautifully composed developer
              documentary.
            </motion.p>

            {/* CTA Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-6 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
            >
              <form action={signInWithGithub} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto rounded-full bg-white px-6 py-6 font-sans text-sm sm:text-base font-semibold text-black shadow-[0_0_40px_rgba(255,255,255,0.1)] transition-all hover:bg-zinc-200 hover:scale-105"
                >
                  <Github className="mr-2 h-5 w-5 fill-current" />
                  Continue with GitHub
                </Button>
              </form>
            </motion.div>

            {/* Trust Line */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-4 flex items-center gap-2 font-mono text-[11px] text-zinc-500"
            >
              <ShieldCheck className="h-4 w-4 text-zinc-400" />
              <span>Read-only access • Safe authentication</span>
            </motion.div>

            {/* Horizontal Timeline Strip */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-8 w-full border-t border-white/10 pt-5"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-left">
                {timelineMilestones.map((m, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col border-l-2 border-white/10 pl-4"
                  >
                    <span className="font-mono text-sm font-bold text-white">
                      {m.year}
                    </span>
                    <span className="font-sans text-xs text-zinc-400 leading-tight mt-1.5">
                      {m.label}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column: Floating Live Preview Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 0.95 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="lg:col-span-5 relative w-full lg:scale-[0.9] lg:origin-right"
          >
            {/* Ambient halo behind preview card */}
            <div className="pointer-events-none absolute -inset-6 rounded-[3rem] bg-zinc-500/5 blur-[80px] opacity-60 animate-pulse-glow" />

            <div className="glass-card-glow relative overflow-hidden p-6 lg:p-8 shadow-2xl border border-white/10 bg-[#0A0A0A] rounded-3xl">
              {/* Top bar */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4 font-mono text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#a1a1aa] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#a1a1aa]"></span>
                  </span>
                  <span className="font-semibold text-brass-light tracking-widest uppercase">
                    Simulated Preview
                  </span>
                  <span className="ml-2 rounded bg-brass/20 px-1.5 py-0.5 text-[9px] font-bold text-brass-light tracking-widest uppercase border border-brass/30">
                    Demo Data
                  </span>
                </div>
                <span className="text-zinc-600 flex items-center gap-2 uppercase tracking-wider">
                  <span className="hidden sm:inline">Documentary Mode</span>
                  <span>&bull;</span>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={activeCommitIdx}
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      transition={{ duration: 0.5 }}
                      className="text-zinc-400 font-medium"
                    >
                      {simulatedCommits[activeCommitIdx].date}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </div>

              {/* Sample Repository & Milestone */}
              <div className="mt-6 relative flex flex-col min-h-[140px]">
                {/* Timeline vertical line */}
                <div className="absolute left-[11px] top-6 bottom-0 w-[2px] bg-gradient-to-b from-white/10 to-transparent" />

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeCommitIdx}
                    initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -15, filter: "blur(4px)" }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col gap-4 pl-10 relative"
                  >
                    {/* Timeline Node */}
                    <div className="absolute left-[-29px] top-1 h-6 w-6 rounded-full bg-[#0A0A0A] border-2 border-white/20 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-[#a1a1aa] shadow-[0_0_8px_rgba(161,161,170,0.6)]" />
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-zinc-400">
                        {simulatedCommits[activeCommitIdx].repo}
                      </span>
                      <span className="text-zinc-700 font-bold">&middot;</span>
                      <span className="font-mono text-[11px] text-zinc-600">
                        {simulatedCommits[activeCommitIdx].hash}
                      </span>
                    </div>

                    <h3 className="font-sans text-2xl lg:text-3xl font-bold tracking-tight leading-[1.15] text-white">
                      {simulatedCommits[activeCommitIdx].msg}
                    </h3>

                    <p className="font-sans text-sm sm:text-base text-zinc-500 mt-1">
                      “{simulatedCommits[activeCommitIdx].narration}”
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Mini Heatmap Grid Preview */}
              <div className="mt-6 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                <div className="flex items-center justify-between font-mono text-[11px] text-zinc-600 mb-3 uppercase tracking-wider">
                  <span>Activity Progression</span>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={activeCommitIdx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="text-[#a1a1aa]"
                    >
                      Streak: {simulatedCommits[activeCommitIdx].streak}
                    </motion.span>
                  </AnimatePresence>
                </div>
                <div className="grid grid-cols-12 gap-1.5">
                  {sampleSquares.map((sq) => (
                    <div
                      key={sq.id}
                      className="h-2.5 w-full rounded-[2px] transition-all duration-1000"
                      style={{
                        backgroundColor: sq.color,
                        boxShadow:
                          sq.color === "#a1a1aa"
                            ? "0 0 10px rgba(161,161,170,0.3)"
                            : "none",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Glowing Progress Track */}
              <div className="mt-6">
                <div className="flex justify-between font-mono text-[10px] text-zinc-600 mb-2 uppercase tracking-widest">
                  <span>Rendering</span>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={activeCommitIdx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="text-zinc-400"
                    >
                      {simulatedCommits[activeCommitIdx].progress}
                    </motion.span>
                  </AnimatePresence>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    className="h-full bg-zinc-400"
                    initial={{ width: "68%" }}
                    animate={{
                      width: simulatedCommits[activeCommitIdx].progress,
                    }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* End of Hero Content */}
    </div>
  );
}
