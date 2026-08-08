"use client";

import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Github, Play, GitCommit, Sparkles, FolderGit2, Calendar, ArrowRight, ShieldCheck } from "lucide-react";
import { signInWithGithub } from "@/lib/supabase/auth-actions";
import { Button } from "@/components/ui/button";
import { GitBackground } from "@/components/landing/git-background";

export function Hero() {
  // Sample animated contribution grid squares
  const sampleSquares = useMemo(() => {
    const colors = ["#161A1E", "#0E4429", "#006D32", "#26A641", "#39D353"];
    return Array.from({ length: 48 }).map((_, i) => ({
      id: i,
      color: colors[(i * 7 + 3) % colors.length],
      delay: (i % 8) * 0.15,
    }));
  }, []);

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
      narration: "October 2025: You stopped experimenting and started building consistently.",
      progress: "68%",
    },
    {
      repo: "rust-cli-tool",
      hash: "#7b2c9e1",
      msg: "refactor: optimize memory allocation for large files",
      narration: "A breakthrough moment. You began caring about deep performance.",
      progress: "75%",
    },
    {
      repo: "portfolio-v3",
      hash: "#f9d83c4",
      msg: "design: overhaul layout with glassmorphism and tailwind",
      narration: "You found your aesthetic identity as a developer.",
      progress: "82%",
    }
  ];

  const [activeCommitIdx, setActiveCommitIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCommitIdx((prev) => (prev + 1) % simulatedCommits.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [simulatedCommits.length]);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#09090B] pt-24 pb-16 px-6 sm:px-12 lg:px-16">
      {/* 1. Cinematic Background: Git-inspired timeline */}
      <GitBackground />

      {/* 2. Hero Content Container — Premium editorial layout */}
      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Core Headline, Value Proposition, & CTAs */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
            {/* Top pill badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/90 px-3.5 py-1 backdrop-blur-md shadow-sm mb-6"
            >
              <Sparkles className="h-3.5 w-3.5 text-brass-light" />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-brass-light">
                Developer Documentary Experience
              </span>
            </motion.div>

            {/* Serif Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-ivory leading-[1.1]"
            >
              Your coding journey as a <span className="italic text-brass font-normal">film.</span>
            </motion.h1>

            {/* Modern Sans-serif Subhead */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 max-w-xl font-sans text-base sm:text-lg leading-relaxed text-zinc-400"
            >
              Replay years of commits, repository milestones, and late-night refactors as an unhurried, beautifully composed developer documentary.
            </motion.p>

            {/* CTA Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
            >
              <form action={signInWithGithub} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto rounded-full bg-ivory px-8 py-6 font-sans text-sm font-semibold text-ink shadow-[0_0_30px_rgba(250,250,250,0.15)] transition-all hover:bg-white hover:scale-102"
                >
                  <Github className="mr-2 h-4 w-4 fill-current" />
                  Continue with GitHub
                </Button>
              </form>

              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  const demoBtn = document.getElementById("features-section");
                  demoBtn?.scrollIntoView({ behavior: "smooth" });
                }}
                className="w-full sm:w-auto rounded-full border-zinc-800 bg-zinc-900/20 px-6 py-6 font-sans text-sm text-ivory hover:bg-zinc-900/80 hover:border-zinc-700"
              >
                <Play className="mr-2 h-3.5 w-3.5 text-brass-light" />
                Explore Experience
              </Button>
            </motion.div>

            {/* Trust Line */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-4 flex items-center gap-1.5 font-mono text-[10px] text-zinc-500"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-brass" />
              <span>Read-only access • Safe authentication</span>
            </motion.div>

            {/* Horizontal Timeline Strip */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-12 w-full border-t border-zinc-800/80 pt-6"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
                {timelineMilestones.map((m, idx) => (
                  <div key={idx} className="flex flex-col border-l border-zinc-800/60 pl-3">
                    <span className="font-mono text-xs font-bold text-brass-light">
                      {m.year}
                    </span>
                    <span className="font-sans text-[11px] text-zinc-500 leading-tight mt-1">
                      {m.label}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column: Floating Live Preview Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="lg:col-span-5 relative w-full"
          >
            {/* Ambient halo behind preview card */}
            <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-brass/5 blur-3xl opacity-50" />

            <div className="glass-card relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-950/95 p-6 shadow-2xl backdrop-blur-2xl">
              {/* Top bar */}
              <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-brass animate-pulse" />
                  <span className="font-semibold text-brass">Documentary Sample</span>
                </div>
                <span className="text-zinc-500">October 2025</span>
              </div>

              {/* Sample Repository & Milestone */}
              <div className="mt-5 flex flex-col gap-3 min-h-[140px]">
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={activeCommitIdx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col gap-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-brass/20 bg-brass/5 px-2.5 py-0.5 font-mono text-xs text-brass-light">
                        <FolderGit2 className="h-3 w-3" />
                        {simulatedCommits[activeCommitIdx].repo}
                      </span>
                      <span className="font-mono text-[10px] text-zinc-500">{simulatedCommits[activeCommitIdx].hash}</span>
                    </div>

                    <h3 className="font-display text-xl font-medium leading-snug text-ivory">
                      {simulatedCommits[activeCommitIdx].msg}
                    </h3>

                    <p className="font-serif italic text-xs text-zinc-400">
                      “{simulatedCommits[activeCommitIdx].narration}”
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Mini Heatmap Grid Preview */}
              <div className="mt-5 rounded-xl border border-zinc-850 bg-zinc-950/90 p-3">
                <div className="flex items-center justify-between font-mono text-[10px] text-zinc-500 mb-2">
                  <span>Activity Progression</span>
                  <span className="text-brass-light">Streak: 18d</span>
                </div>
                <div className="grid grid-cols-12 gap-1">
                  {sampleSquares.map((sq) => (
                    <div
                      key={sq.id}
                      className="h-2.5 w-full rounded-[1.5px] transition-all duration-300"
                      style={{ backgroundColor: sq.color === "#39D353" ? "#D4A853" : sq.color }}
                    />
                  ))}
                </div>
              </div>

              {/* Glowing Progress Track */}
              <div className="mt-5">
                <div className="flex justify-between font-mono text-[10px] text-zinc-500 mb-1.5">
                  <span>Progress</span>
                  <span className="text-ivory transition-all duration-500">{simulatedCommits[activeCommitIdx].progress}</span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full border border-zinc-850 bg-zinc-900">
                  <motion.div
                    className="h-full bg-gradient-to-r from-brass-dim via-brass to-brass-light shadow-[0_0_10px_rgba(212,168,83,0.5)]"
                    initial={{ width: "68%" }}
                    animate={{ width: simulatedCommits[activeCommitIdx].progress }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
