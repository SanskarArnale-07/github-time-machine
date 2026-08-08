"use client";

import React from "react";
import { motion } from "framer-motion";
import { Film, BarChart3, Share2 } from "lucide-react";

const features = [
  {
    icon: Film,
    title: "Cinematic Replay",
    description:
      "Relive every milestone, repository genesis, and late-night streak as an unhurried, personal developer documentary.",
  },
  {
    icon: BarChart3,
    title: "Developer Analytics",
    description:
      "Deep cadence analysis, peak productivity hours, consistency scoring, and multi-year language evolution.",
  },
  {
    icon: Share2,
    title: "Shareable Documentary",
    description:
      "Export full 1080p documentary videos, vertical social reels, social preview cards, and printable PDF chronicles.",
  },
];

export function FeatureCards() {
  return (
    <section id="features-section" className="py-16 bg-[#070A14] px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="glass-card p-6 sm:p-8 transition-all duration-300 hover:border-brass/40 group hover:-translate-y-1 shadow-lg"
            >
              <div className="mb-5 inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-brass/10 text-brass-light group-hover:bg-brass/20 transition-colors shadow-sm">
                <feature.icon className="w-5 h-5" />
              </div>

              <h3 className="font-display text-xl font-bold text-ivory mb-2">
                {feature.title}
              </h3>

              <p className="font-sans text-xs sm:text-sm text-muted leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
