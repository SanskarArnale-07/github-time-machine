"use client";

import React from "react";
import { motion } from "framer-motion";
import { Github, ShieldCheck } from "lucide-react";
import { signInWithGithub } from "@/lib/supabase/auth-actions";
import { Button } from "@/components/ui/button";

export function CtaBand() {
  return (
    <section className="py-20 lg:py-32 bg-transparent px-6 relative overflow-hidden">
      {/* Dedicated subtle radial space-time aura behind the CTA card */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden -z-10"
      >
        <div
          className="h-[520px] w-[520px] sm:h-[680px] sm:w-[680px] md:h-[820px] md:w-[920px] rounded-full"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(37, 99, 235, 0.22) 0%, rgba(99, 102, 241, 0.12) 35%, rgba(16, 27, 69, 0.05) 65%, transparent 78%)",
            filter: "blur(75px)",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="max-w-4xl mx-auto rounded-[2.5rem] p-10 sm:p-16 text-center relative overflow-hidden border border-blue-400/20 bg-[#0d1830]/75 backdrop-blur-2xl shadow-[0_24px_64px_rgba(2,6,23,0.65)]"
      >
        {/* Subtle specular top-edge glass highlight */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-200/30 to-transparent"
        />

        <div className="relative z-10 flex flex-col items-center">
          <span className="font-mono text-[11px] text-[#d4a853] uppercase tracking-widest font-semibold mb-3">
            Begin The Documentary
          </span>

          <h2 className="font-display font-semibold text-4xl sm:text-6xl text-white mb-5 tracking-tight leading-[1.1]">
            Press play on your own history.
          </h2>

          <p className="font-sans text-base sm:text-lg text-zinc-300 max-w-2xl mx-auto mb-8 leading-relaxed">
            Watch years of commits, milestones, and breakthroughs unfold as a cinematic documentary of your developer journey.
          </p>

          <form action={signInWithGithub}>
            <Button
              size="lg"
              className="rounded-full bg-white px-8 py-6 font-sans text-sm sm:text-base font-semibold text-black transition-all hover:bg-zinc-200 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
            >
              <Github className="mr-2 h-5 w-5 fill-current" />
              Continue with GitHub
            </Button>
          </form>

          <div className="mt-5 flex items-center justify-center gap-2 font-mono text-[11px] text-zinc-400">
            <ShieldCheck className="h-4 w-4 text-[#d4a853]" />
            <span>Read-only GitHub access • Nothing is ever pushed on your behalf</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
