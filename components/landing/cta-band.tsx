"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Github, ShieldCheck, Sparkles, GitCommit, ArrowRight } from "lucide-react";
import { signInWithGithub } from "@/lib/supabase/auth-actions";
import { Button } from "@/components/ui/button";

/**
 * CtaBand — "The Entrance to the Time Machine"
 * 
 * Cinematic split composition:
 * Left: Editorial headline, supporting value proposition, GitHub CTA, trust reassurance, and legal links.
 * Right: Chronological archive timeline preview (abstract illustrative progression from 2023 to 2026).
 */
export function CtaBand() {
  const timelineMilestones = [
    {
      year: "2023",
      label: "First commit",
      meta: "Origin • Repository founded",
      badge: "Origin",
      color: "bg-blue-400",
      glow: "shadow-[0_0_12px_rgba(96,165,250,0.6)]",
    },
    {
      year: "2024",
      label: "Major project",
      meta: "Growth • Core architecture built",
      badge: "Growth",
      color: "bg-[#38bdf8]",
      glow: "shadow-[0_0_12px_rgba(56,189,248,0.6)]",
    },
    {
      year: "2025",
      label: "Breakthrough",
      meta: "Breakthrough • Longest streak unlocked",
      badge: "Momentum",
      color: "bg-[#d4a853]",
      glow: "shadow-[0_0_14px_rgba(212,168,83,0.8)]",
      isHighlight: true,
    },
    {
      year: "2026",
      label: "Current chapter",
      meta: "Today • Ready to render as a film",
      badge: "Today",
      color: "bg-blue-200",
      glow: "shadow-[0_0_12px_rgba(191,219,254,0.7)]",
    },
  ];

  return (
    <section 
      id="archive-entrance"
      className="py-20 lg:py-32 bg-transparent px-6 relative overflow-hidden"
    >
      {/* ── Bespoke Archive Atmosphere ───────────────────────────────────────── */}
      {/* Not the generic landing or replay background: tailored deep navy/dark cosmos */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden -z-10"
      >
        {/* Soft asymmetric cosmic aura on the left */}
        <div
          className="absolute -left-20 top-1/4 h-[520px] w-[520px] rounded-full opacity-35"
          style={{
            background:
              "radial-gradient(circle, rgba(37, 99, 235, 0.22) 0%, rgba(30, 58, 138, 0.08) 50%, transparent 75%)",
            filter: "blur(90px)",
          }}
        />

        {/* Warm champagne time-warp glow on the right behind the timeline */}
        <div
          className="absolute -right-20 bottom-1/4 h-[540px] w-[540px] rounded-full opacity-30"
          style={{
            background:
              "radial-gradient(circle, rgba(212, 168, 83, 0.18) 0%, rgba(99, 102, 241, 0.08) 45%, transparent 70%)",
            filter: "blur(90px)",
          }}
        />

        {/* Faint longitudinal timeline grid wires */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, #93c5fd 1px, transparent 0)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* ── Main Entrance Panel (Cinematic Split Composition) ─────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="max-w-6xl mx-auto rounded-[2.25rem] p-8 sm:p-12 lg:p-16 relative overflow-hidden border border-blue-400/20 bg-[#050a17]/90 backdrop-blur-2xl shadow-[0_30px_90px_rgba(2,6,23,0.85),0_0_50px_rgba(30,58,138,0.18)]"
      >
        {/* Specular top-edge glass highlight */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-300/35 to-transparent z-20"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* ── LEFT COLUMN: The Editorial Entrance ────────────────────────── */}
          <div className="lg:col-span-6 xl:col-span-7 flex flex-col items-start text-left">
            
            {/* Archive Entrance Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d4a853]/25 bg-[#d4a853]/10 px-3.5 py-1.5 backdrop-blur-md mb-6 shadow-[0_0_16px_rgba(212,168,83,0.12)]">
              <Sparkles className="h-3.5 w-3.5 text-[#d4a853]" />
              <span className="font-mono text-[11px] text-[#d4a853] uppercase tracking-widest font-semibold">
                The Archive Entrance
              </span>
            </div>

            {/* Editorial Statement */}
            <h2 className="font-sans text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.06]">
              YOUR CODE{" "}
              <br className="hidden sm:inline" />
              HAS A HISTORY.
            </h2>

            {/* Supporting Sentence */}
            <p className="mt-5 text-base sm:text-lg text-zinc-300 font-sans leading-relaxed max-w-xl">
              GitHub Time Machine transforms years of commits, late-night breakthroughs,
              and quiet milestones into a chronological developer documentary.
            </p>

            {/* Primary Action Button */}
            <form action={signInWithGithub} className="mt-8 w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto rounded-full bg-white px-8 py-6 font-sans text-sm sm:text-base font-semibold text-black shadow-[0_0_35px_rgba(255,255,255,0.25),0_0_50px_rgba(59,130,246,0.3)] transition-all duration-300 hover:bg-zinc-100 hover:scale-[1.03] hover:shadow-[0_0_50px_rgba(255,255,255,0.4)]"
              >
                <Github className="mr-2.5 h-5 w-5 fill-current" />
                Continue with GitHub
              </Button>
            </form>

            {/* Read-only Reassurance (Trust Factor) */}
            <div className="mt-4 flex items-center gap-2 font-mono text-xs text-zinc-400">
              <ShieldCheck className="h-4 w-4 text-[#d4a853] flex-shrink-0" />
              <span>Read-only GitHub access • Nothing is ever pushed on your behalf</span>
            </div>

            {/* Trust & Legal Links */}
            <div className="mt-8 flex items-center gap-4 text-xs font-mono text-zinc-500 pt-5 border-t border-white/5 w-full">
              <Link 
                href="/privacy" 
                className="hover:text-zinc-300 transition-colors underline underline-offset-4 decoration-zinc-700"
              >
                Privacy Policy
              </Link>
              <span className="text-zinc-700">•</span>
              <Link 
                href="/terms" 
                className="hover:text-zinc-300 transition-colors underline underline-offset-4 decoration-zinc-700"
              >
                Terms of Service
              </Link>
            </div>
          </div>

          {/* ── RIGHT COLUMN: Time Machine Chronological Timeline Preview ──── */}
          <div className="lg:col-span-6 xl:col-span-5 w-full">
            <div className="rounded-2xl border border-blue-400/15 bg-[#081126]/80 p-6 sm:p-7 relative overflow-hidden backdrop-blur-xl shadow-[0_16px_40px_rgba(2,6,23,0.5)]">
              
              {/* Header inside Preview Box */}
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/5 text-[10px] font-mono uppercase tracking-wider">
                <span className="text-blue-300/80 font-medium">Timeline Preview</span>
                <span className="text-zinc-500">Illustrative Sequence</span>
              </div>

              {/* Vertical Chronological Track */}
              <div className="relative pl-6 sm:pl-8 space-y-6">
                
                {/* Continuous Vertical Timeline Line */}
                <div 
                  aria-hidden="true" 
                  className="absolute left-[11px] sm:left-[15px] top-3 bottom-3 w-[2px] bg-gradient-to-b from-blue-500/20 via-[#d4a853]/40 to-blue-400/80" 
                />

                {/* Ambient Traveling Light Packet (GPU translateY instead of top) */}
                <motion.div
                  aria-hidden="true"
                  className="absolute left-[10px] sm:left-[14px] top-3 w-1 h-12 rounded-full bg-gradient-to-b from-transparent via-[#d4a853] to-transparent motion-reduce:hidden"
                  initial={{ y: 0, opacity: 0 }}
                  animate={{ y: [0, 240, 0], opacity: [0, 1, 0] }}
                  transition={{ duration: 7, ease: "easeInOut", repeat: Infinity }}
                />

                {/* Timeline Milestone Stations */}
                {timelineMilestones.map((item, idx) => (
                  <div key={idx} className="relative group">
                    {/* Node on vertical axis */}
                    <div 
                      className={`absolute -left-[20px] sm:-left-[24px] top-1 w-3 h-3 rounded-full ${item.color} ${item.glow} ring-2 ring-[#081126] transition-transform duration-300 group-hover:scale-125`}
                    >
                      {item.isHighlight && (
                        <span className="absolute -inset-1 rounded-full bg-[#d4a853]/40 animate-ping motion-reduce:hidden" />
                      )}
                    </div>

                    {/* Milestone content */}
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-white tracking-wider">
                          {item.year}
                        </span>
                        <span className="text-zinc-600 font-mono text-[10px]">────</span>
                        <span className={`font-sans text-sm font-semibold ${item.isHighlight ? "text-[#d4a853]" : "text-zinc-200"}`}>
                          {item.label}
                        </span>
                      </div>
                      <span className="font-mono text-[9px] px-2 py-0.5 rounded bg-blue-500/10 border border-blue-400/20 text-blue-300/80">
                        {item.badge}
                      </span>
                    </div>

                    <p className="font-mono text-[11px] text-zinc-400 mt-1 pl-0 leading-tight">
                      {item.meta}
                    </p>
                  </div>
                ))}
              </div>

              {/* Bottom Visual Concept Axis */}
              <div className="mt-8 pt-4 border-t border-white/5 text-center">
                <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
                  time ─── activity ─── milestones ─── story
                </span>
              </div>
            </div>
          </div>

        </div>
      </motion.div>
    </section>
  );
}
