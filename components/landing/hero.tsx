"use client";

import { motion } from "framer-motion";
import { Github } from "lucide-react";
import { signInWithGithub } from "@/lib/supabase/auth-actions";
import { Button } from "@/components/ui/button";
import { ContributionField } from "@/components/landing/contribution-field";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

export function Hero() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-ink pt-20">
      <div className="absolute inset-0 z-0 opacity-40">
        <ContributionField />
      </div>
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col items-center text-center max-w-4xl px-6"
      >
        <motion.div variants={itemVariants} className="mb-8 rounded-full border border-brass-dim/30 bg-brass-dim/10 px-4 py-1.5 backdrop-blur-sm">
          <span className="font-sans text-xs text-brass-light tracking-wide">
            Every commit, every year, replayed
          </span>
        </motion.div>

        <motion.h1 variants={itemVariants} className="font-display text-5xl md:text-7xl text-ivory tracking-tight mb-6 leading-tight">
          Your GitHub journey has a <span className="italic text-brass-light">story.</span>
        </motion.h1>

        <motion.p variants={itemVariants} className="font-sans text-lg md:text-xl text-muted max-w-2xl mb-10 leading-relaxed">
          Rediscover the late-night pushes, the open-source breakthroughs, and the evolution of your code over the years.
        </motion.p>

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4 mb-6 w-full sm:w-auto">
          <form action={signInWithGithub} className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto font-sans bg-ivory text-ink hover:bg-ivory/90 rounded-full px-8">
              <Github className="mr-2 w-4 h-4" />
              Continue with GitHub
            </Button>
          </form>
          <Button size="lg" variant="outline" className="w-full sm:w-auto font-sans rounded-full border-white/10 text-ivory hover:bg-white/5">
            See a sample replay
          </Button>
        </motion.div>

        <motion.p variants={itemVariants} className="font-mono text-xs text-muted/60">
          Read-only access · nothing is ever pushed on your behalf
        </motion.p>
      </motion.div>
      
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-ink to-transparent z-0 pointer-events-none" />
    </div>
  );
}
