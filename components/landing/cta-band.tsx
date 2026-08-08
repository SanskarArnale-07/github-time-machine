"use client";

import React from "react";
import { motion } from "framer-motion";
import { Github, ShieldCheck } from "lucide-react";
import { signInWithGithub } from "@/lib/supabase/auth-actions";
import { Button } from "@/components/ui/button";

export function CtaBand() {
  return (
    <section className="py-20 bg-[#070A14] px-6 border-t border-white/5">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="glass-card-glow max-w-4xl mx-auto rounded-3xl p-10 sm:p-14 text-center relative overflow-hidden"
      >
        <div className="relative z-10 flex flex-col items-center">
          <span className="font-mono text-[11px] text-brass-light uppercase tracking-widest font-semibold mb-4">
            Begin The Documentary
          </span>

          <h2 className="font-display text-3xl sm:text-5xl text-ivory mb-6 tracking-tight">
            Press play on your own history.
          </h2>

          <p className="font-sans text-sm sm:text-base text-muted max-w-lg mb-8 leading-relaxed">
            Reconstruct years of code, watch milestones unfold, and share your developer journey.
          </p>

          <form action={signInWithGithub}>
            <Button
              size="lg"
              className="rounded-full bg-ivory px-8 py-6 font-sans text-sm font-semibold text-ink shadow-lg transition-all hover:bg-white hover:scale-105"
            >
              <Github className="mr-2 h-4 w-4 fill-current" />
              Continue with GitHub
            </Button>
          </form>

          <div className="mt-4 flex items-center gap-1.5 font-mono text-[10px] text-muted/70">
            <ShieldCheck className="h-3.5 w-3.5 text-commit-300" />
            <span>Read-only access • Nothing is ever pushed on your behalf</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
