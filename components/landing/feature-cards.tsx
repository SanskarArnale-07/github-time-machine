"use client";

import React from "react";
import { motion } from "framer-motion";
import { Film, BarChart3, Share2 } from "lucide-react";

const features = [
  {
    icon: Film,
    title: "Cinematic Replay",
    description:
      "Revisit the commits, pivots, and breakthroughs that shaped your journey.",
  },
  {
    icon: BarChart3,
    title: "Developer Analytics",
    description:
      "Measure consistency, momentum, focus patterns, and long-term growth.",
  },
  {
    icon: Share2,
    title: "Shareable Documentary",
    description:
      "Turn your Git history into a film, a timeline, or a beautifully designed developer story.",
  },
];

export function FeatureCards() {
  return (
    <section id="features-section" className="relative py-20 lg:py-24 bg-[#0A0A0A] px-6 border-t border-white/5 overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto">
        
        {/* Section Hero Copy */}
        <div className="text-center mb-16 lg:mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="font-sans text-4xl lg:text-[2.75rem] font-bold text-white tracking-tighter leading-[1.1]"
          >
            Press play on your own history.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-5 text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto font-sans leading-relaxed"
          >
            Watch years of code unfold as a cinematic documentary of your developer journey.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-[#111111]/80 backdrop-blur-sm border border-white/5 hover:border-[#d4a853]/30 p-8 sm:p-10 rounded-3xl transition-all duration-300 group shadow-2xl"
            >
              <div className="mb-6 inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#d4a853]/10 text-[#d4a853] group-hover:bg-[#d4a853]/20 transition-colors">
                <feature.icon className="w-5 h-5" />
              </div>

              <h3 className="font-sans text-xl lg:text-2xl font-bold text-white mb-3 tracking-tight">
                {feature.title}
              </h3>

              <p className="font-sans text-sm sm:text-base text-zinc-500 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
