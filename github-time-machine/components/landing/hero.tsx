"use client";
import { motion } from "framer-motion";
import { Github, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContributionField } from "@/components/landing/contribution-field";
import { signInWithGithub } from "@/lib/supabase/auth-actions";
const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const item = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6 py-24">
      <ContributionField />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center"
      >
        <motion.div
          variants={item}
          className="mb-7 inline-flex items-center gap-2 rounded-full border border-ink-border bg-ink-surface/80 px-4 py-1.5 font-mono text-xs text-muted backdrop-blur-sm"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-commit-300 shadow-[0_0_8px_2px_rgba(57,211,83,0.6)]" />
          every commit, every year, replayed
        </motion.div>

        <motion.h1
          variants={item}
          className="text-balance font-display text-5xl leading-[1.05] text-ivory sm:text-6xl md:text-7xl"
        >
          Your GitHub journey
          <br />
          has a <span className="italic text-brass-light">story.</span>
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-6 max-w-xl text-balance font-sans text-base leading-relaxed text-muted sm:text-lg"
        >
          Time Machine turns years of commits, repos, and late-night pushes into
          a cinematic replay of how you became the developer you are — one
          contribution graph square at a time.
        </motion.p>

        <motion.div
          variants={item}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
        >
          <form action={signInWithGithub}>
            <Button size="lg" className="group font-medium" type="submit">
              <Github className="mr-2 h-[18px] w-[18px]" />
              Continue with GitHub
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Button>
          </form>

          <Button size="lg" variant="outline" className="font-mono text-sm">
            see a sample replay
          </Button>
        </motion.div>

        <motion.p
          variants={item}
          className="mt-5 font-mono text-xs text-muted/70"
        >
          read-only access · nothing is ever pushed on your behalf
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 font-mono text-[11px] text-muted/60"
      >
        scroll to explore
      </motion.div>
    </section>
  );
}
