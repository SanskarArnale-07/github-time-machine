"use client";

import React from "react";
import { motion } from "framer-motion";
import { Github, ShieldCheck } from "lucide-react";
import { signInWithGithub } from "@/lib/supabase/auth-actions";
import { Button } from "@/components/ui/button";

export function CtaBand() {
  return (
    <section className="py-20 lg:py-32 bg-[#0A0A0A] px-6 border-t border-white/5 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-4xl mx-auto rounded-[2.5rem] p-10 sm:p-16 text-center relative overflow-hidden border border-white/10 bg-[#111111]/80 backdrop-blur-sm shadow-2xl"
      >
        <div className="relative z-10 flex flex-col items-center">
          <span className="font-mono text-[11px] text-[#d4a853] uppercase tracking-widest font-semibold mb-3">
            Begin The Documentary
          </span>

          <h2 className="font-display font-semibold text-4xl sm:text-6xl text-white mb-5 tracking-tight leading-[1.1]">
            Press play on your own history.
          </h2>

          <p className="font-sans text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto mb-8 leading-relaxed">
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

          <div className="mt-5 flex items-center justify-center gap-2 font-mono text-[11px] text-zinc-500">
            <ShieldCheck className="h-4 w-4 text-[#d4a853]" />
            <span>Read-only GitHub access • Nothing is ever pushed on your behalf</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
