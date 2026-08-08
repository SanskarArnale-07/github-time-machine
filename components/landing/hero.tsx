"use client";

import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Github, Play, GitCommit, Sparkles, FolderGit2, Calendar, ArrowRight, ShieldCheck, Film, Code2, Zap, Clock } from "lucide-react";
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
    <div className="relative min-h-screen flex flex-col items-center overflow-x-hidden bg-[#050507] pt-24 px-6 sm:px-12 lg:px-16 selection:bg-brass/20 selection:text-brass-light">
      {/* 1. Cinematic Background: Git-inspired timeline */}
      <GitBackground />

      {/* 2. Hero Content Container — Premium editorial layout */}
      <div className="relative z-10 mx-auto w-full max-w-7xl pt-12 pb-32 lg:pt-24 lg:pb-40">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
          
          {/* Left Column: Core Headline, Value Proposition, & CTAs */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
            {/* Top pill badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-zinc-800/80 bg-zinc-900/50 px-4 py-1.5 backdrop-blur-md shadow-sm mb-8"
            >
              <Sparkles className="h-4 w-4 text-brass-light" />
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-brass-light">
                Developer Documentary Experience
              </span>
            </motion.div>

            {/* Serif Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-5xl sm:text-6xl lg:text-[5.5rem] font-semibold tracking-tight text-ivory leading-[1.05]"
            >
              Your coding journey as a <span className="italic text-brass font-normal">film.</span>
            </motion.h1>

            {/* Modern Sans-serif Subhead */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-8 max-w-xl font-sans text-lg sm:text-xl leading-relaxed text-zinc-400"
            >
              Replay years of commits, repository milestones, and late-night refactors as an unhurried, beautifully composed developer documentary.
            </motion.p>

            {/* CTA Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto"
            >
              <form action={signInWithGithub} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto rounded-full bg-ivory px-8 py-7 font-sans text-base font-semibold text-ink shadow-[0_0_40px_rgba(245,242,234,0.15)] transition-all hover:bg-white hover:scale-105"
                >
                  <Github className="mr-3 h-5 w-5 fill-current" />
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
                className="w-full sm:w-auto rounded-full border-zinc-700/50 bg-zinc-900/40 px-8 py-7 font-sans text-base text-ivory backdrop-blur-md hover:bg-zinc-800/80 hover:border-zinc-600 transition-all"
              >
                <Play className="mr-3 h-4 w-4 text-brass-light fill-brass-light" />
                Explore Experience
              </Button>
            </motion.div>

            {/* Trust Line */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-6 flex items-center gap-2 font-mono text-[11px] text-zinc-500"
            >
              <ShieldCheck className="h-4 w-4 text-brass" />
              <span>Read-only access • Safe authentication</span>
            </motion.div>

            {/* Horizontal Timeline Strip */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-16 w-full border-t border-zinc-800/60 pt-8"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-left">
                {timelineMilestones.map((m, idx) => (
                  <div key={idx} className="flex flex-col border-l-2 border-zinc-800/60 pl-4">
                    <span className="font-mono text-sm font-bold text-brass-light">
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
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="lg:col-span-5 relative w-full"
          >
            {/* Ambient halo behind preview card */}
            <div className="pointer-events-none absolute -inset-6 rounded-[3rem] bg-brass/10 blur-[80px] opacity-60 animate-pulse-glow" />

            <div className="glass-card-glow relative overflow-hidden p-8 shadow-2xl">
              {/* Top bar */}
              <div className="flex items-center justify-between border-b border-zinc-800/60 pb-4 font-mono text-xs">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brass opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-brass"></span>
                  </span>
                  <span className="font-semibold text-brass tracking-wider uppercase">Live Preview</span>
                </div>
                <span className="text-zinc-500">Documentary Mode</span>
              </div>

              {/* Sample Repository & Milestone */}
              <div className="mt-8 flex flex-col gap-4 min-h-[160px]">
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={activeCommitIdx}
                    initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -15, filter: "blur(4px)" }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-2 rounded-lg border border-brass/20 bg-brass/10 px-3 py-1 font-mono text-xs text-brass-light shadow-sm">
                        <FolderGit2 className="h-3.5 w-3.5" />
                        {simulatedCommits[activeCommitIdx].repo}
                      </span>
                      <span className="font-mono text-[11px] text-zinc-500 bg-zinc-900/50 px-2 py-1 rounded">{simulatedCommits[activeCommitIdx].hash}</span>
                    </div>

                    <h3 className="font-display text-2xl font-medium leading-snug text-ivory">
                      {simulatedCommits[activeCommitIdx].msg}
                    </h3>

                    <p className="font-serif italic text-sm text-zinc-400 mt-2">
                      “{simulatedCommits[activeCommitIdx].narration}”
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Mini Heatmap Grid Preview */}
              <div className="mt-8 rounded-2xl border border-zinc-800/50 bg-zinc-950/80 p-5 shadow-inner">
                <div className="flex items-center justify-between font-mono text-xs text-zinc-500 mb-3">
                  <span>Activity Progression</span>
                  <span className="text-brass-light font-medium">Streak: 18d</span>
                </div>
                <div className="grid grid-cols-12 gap-1.5">
                  {sampleSquares.map((sq) => (
                    <div
                      key={sq.id}
                      className="h-3 w-full rounded-[2px] transition-all duration-300 hover:scale-110"
                      style={{ backgroundColor: sq.color === "#39D353" ? "#D4A853" : sq.color, boxShadow: sq.color === "#39D353" ? "0 0 10px rgba(212,168,83,0.3)" : "none" }}
                    />
                  ))}
                </div>
              </div>

              {/* Glowing Progress Track */}
              <div className="mt-8">
                <div className="flex justify-between font-mono text-xs text-zinc-500 mb-2">
                  <span>Rendering Timeline</span>
                  <span className="text-ivory font-medium transition-all duration-500">{simulatedCommits[activeCommitIdx].progress}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full border border-zinc-800/80 bg-zinc-950">
                  <motion.div
                    className="h-full bg-gradient-to-r from-brass-dim via-brass to-brass-light shadow-[0_0_15px_rgba(212,168,83,0.6)]"
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

      {/* 3. Below the fold: How it works & Features */}
      <div id="features-section" className="relative z-10 mx-auto w-full max-w-7xl pb-32">
        <div className="text-center mb-20">
          <h2 className="font-display text-4xl lg:text-5xl font-semibold text-ivory mb-6">Designed like a masterpiece.</h2>
          <p className="font-sans text-lg text-zinc-400 max-w-2xl mx-auto">
            We don't just show you graphs. We analyze your commit history and turn it into a beautifully narrated, cinematic timeline of your evolution as a developer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="glass-card p-10 flex flex-col items-center text-center group hover:border-brass/30 transition-all duration-500">
            <div className="h-14 w-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform duration-500">
              <Film className="h-6 w-6 text-brass" />
            </div>
            <h3 className="font-display text-2xl text-ivory mb-3">Cinematic Playback</h3>
            <p className="font-sans text-zinc-400 text-sm leading-relaxed">
              Watch your repositories grow over time with smooth animations, dynamic lighting, and an editorial presentation style.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="glass-card p-10 flex flex-col items-center text-center group hover:border-brass/30 transition-all duration-500">
            <div className="h-14 w-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform duration-500">
              <Code2 className="h-6 w-6 text-brass" />
            </div>
            <h3 className="font-display text-2xl text-ivory mb-3">Commit AI Narration</h3>
            <p className="font-sans text-zinc-400 text-sm leading-relaxed">
              Our engine understands the context of your code. It generates poetic insights and narrations for your most pivotal commits.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="glass-card p-10 flex flex-col items-center text-center group hover:border-brass/30 transition-all duration-500">
            <div className="h-14 w-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform duration-500">
              <Clock className="h-6 w-6 text-brass" />
            </div>
            <h3 className="font-display text-2xl text-ivory mb-3">Time Travel</h3>
            <p className="font-sans text-zinc-400 text-sm leading-relaxed">
              Scrub through the years using a precision timeline. Relive the weekends you built your best projects, pixel by pixel.
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-32 text-center glass-card-glow p-16 rounded-[3rem] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,168,83,0.08)_0%,transparent_70%)]" />
          <h2 className="font-display text-4xl lg:text-5xl font-semibold text-ivory mb-6 relative z-10">Ready to watch your story?</h2>
          <p className="font-sans text-lg text-zinc-400 mb-10 max-w-xl mx-auto relative z-10">
            Connect your GitHub account in seconds. We only request read access to your public activity.
          </p>
          <form action={signInWithGithub} className="relative z-10">
            <Button
              size="lg"
              className="rounded-full bg-brass hover:bg-brass-light px-10 py-7 font-sans text-base font-semibold text-ink shadow-[0_0_30px_rgba(212,168,83,0.4)] transition-all hover:scale-105"
            >
              <Github className="mr-3 h-5 w-5 fill-current" />
              Generate My Documentary
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
