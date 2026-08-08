"use client";

import { motion } from "framer-motion";
import { Clock, Code2, GitBranch, Zap } from "lucide-react";

const features = [
  {
    icon: Clock,
    command: "git log --stat",
    title: "Travel through time",
    description: "Watch your activity graph build itself month by month, year by year. See the chapters of your career unfold.",
  },
  {
    icon: Code2,
    command: "git diff --shortstat",
    title: "Language evolution",
    description: "Discover how your tech stack changed over time. From your first HTML files to full-stack applications.",
  },
  {
    icon: GitBranch,
    command: "git rev-list --count",
    title: "Open source impact",
    description: "Highlight your contributions to the community. See the ripple effect of your pull requests.",
  },
  {
    icon: Zap,
    command: "git commit -m 'insight'",
    title: "Cinematic insights",
    description: "Your stats presented like a film. Deep analytics paired with elegant typography and motion.",
  }
];

export function FeatureCards() {
  return (
    <section className="py-24 bg-ink px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: idx * 0.1, ease: "easeOut" }}
              className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-brass-dim/30 transition-colors group"
            >
              <div className="mb-6 inline-flex items-center justify-center w-12 h-12 rounded-full bg-brass-dim/10 text-brass-light group-hover:bg-brass-dim/20 transition-colors">
                <feature.icon className="w-5 h-5" />
              </div>
              <div className="font-mono text-xs text-commit-300 mb-3">
                $ {feature.command}
              </div>
              <h3 className="font-display text-2xl text-ivory mb-3">
                {feature.title}
              </h3>
              <p className="font-sans text-muted leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
