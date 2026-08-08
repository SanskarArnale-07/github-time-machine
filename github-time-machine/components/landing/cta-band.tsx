"use client";

import { motion } from "framer-motion";
import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaBand() {
  return (
    <section className="relative mx-auto w-full max-w-6xl px-6 pb-28 sm:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7 }}
        className="relative overflow-hidden rounded-3xl border border-ink-border bg-gradient-to-b from-ink-surface to-ink px-8 py-16 text-center sm:py-20"
      >
        <div className="pointer-events-none absolute inset-0 bg-radial-fade" />

        <p className="relative font-mono text-xs uppercase tracking-[0.2em] text-brass-light">
          it's ready when you are
        </p>
        <h2 className="relative mx-auto mt-4 max-w-lg text-balance font-display text-3xl text-ivory sm:text-4xl">
          Press play on your own history.
        </h2>
        <div className="relative mt-9 flex justify-center">
          <Button size="lg" className="font-medium">
            <Github className="mr-2 h-[18px] w-[18px]" />
            Continue with GitHub
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
