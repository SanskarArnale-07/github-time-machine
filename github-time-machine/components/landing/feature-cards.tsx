"use client";

import { motion } from "framer-motion";
import { Film, GitCompare, TrendingUp, History } from "lucide-react";

const features = [
  {
    command: "git log --all",
    icon: Film,
    title: "The full timeline",
    description:
      "Every commit you've ever made, laid out like frames of film — scrub from your first repo to your latest push.",
  },
  {
    command: "git diff",
    icon: GitCompare,
    title: "See what changed",
    description:
      "Watch your code style, languages, and habits shift over time with visual diffs across your whole history.",
  },
  {
    command: "git blame --growth",
    icon: TrendingUp,
    title: "Know your growth",
    description:
      "Track how your skills evolved commit by commit — the languages you picked up, and when you got good.",
  },
  {
    command: "git reflog",
    icon: History,
    title: "Rediscover forgotten moments",
    description:
      "Surface the 2am fixes, the abandoned side projects, and the milestones you didn't realize you'd made.",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] },
  }),
};

export function FeatureCards() {
  return (
    <section className="relative mx-auto w-full max-w-6xl px-6 py-24 sm:px-8 sm:py-32">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7 }}
        className="mx-auto mb-16 max-w-2xl text-center"
      >
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-brass-light">
          how it works
        </span>
        <h2 className="mt-4 text-balance font-display text-3xl text-ivory sm:text-4xl">
          Four ways to relive your history
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {features.map((feature, i) => (
          <motion.div
            key={feature.command}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="group relative overflow-hidden rounded-2xl border border-ink-border bg-ink-surface/60 p-7 transition-colors duration-300 hover:border-commit-300/40"
          >
            <div
              className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
              style={{ backgroundColor: "rgba(57,211,83,0.15)" }}
            />

            <div className="relative flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-ink-border bg-ink text-commit-300">
                <feature.icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
              </div>
              <code className="font-mono text-[11px] text-muted/70">
                {feature.command}
              </code>
            </div>

            <h3 className="relative mt-6 font-display text-xl text-ivory">
              {feature.title}
            </h3>
            <p className="relative mt-2.5 text-sm leading-relaxed text-muted">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
