"use client";

import { motion } from "framer-motion";
import { GitCommitHorizontal } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-8 bg-ink border-t border-white/5 px-6">
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div className="flex items-center gap-2">
          <GitCommitHorizontal className="w-4 h-4 text-commit-300" />
          <span className="font-mono text-xs text-muted">time-machine.git</span>
        </div>
        
        <p className="font-sans text-xs text-muted">
          Your code is poetry. Let's read it.
        </p>
      </motion.div>
    </footer>
  );
}
