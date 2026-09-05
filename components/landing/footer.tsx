"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export function Footer() {
  return (
    <footer className="relative py-12 px-6 border-t border-blue-400/10 bg-transparent overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6"
      >
        {/* Brand & Tagline */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-1">
          <span className="font-display font-semibold text-sm text-zinc-100 tracking-tight">
            GitHub Time Machine
          </span>
          <span className="font-mono text-xs text-blue-200/60 tracking-wide">
            Replay your work. Remember your journey.
          </span>
        </div>

        {/* Navigation Links & Copyright */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
          <nav aria-label="Footer Navigation" className="flex items-center gap-6">
            <Link
              href="/terms"
              className="font-mono text-xs text-blue-200/70 hover:text-white transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="font-mono text-xs text-blue-200/70 hover:text-white transition-colors"
            >
              Privacy
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-blue-200/70 hover:text-white transition-colors"
            >
              GitHub
            </a>
          </nav>

          <span className="font-mono text-[11px] text-blue-200/50">
            © 2026 GitHub Time Machine
          </span>
        </div>
      </motion.div>
    </footer>
  );
}
