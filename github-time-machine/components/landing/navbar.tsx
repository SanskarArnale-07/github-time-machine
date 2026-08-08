"use client";

import { motion } from "framer-motion";
import { GitCommitHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 sm:px-8"
    >
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md border border-ink-border bg-ink-surface">
          <GitCommitHorizontal className="h-4 w-4 text-commit-300" />
        </div>
        <span className="font-mono text-sm tracking-tight text-ivory">
          time-machine
          <span className="text-brass-light">.git</span>
        </span>
      </div>

      <Button variant="ghost" size="sm" className="font-mono">
        Continue with GitHub
      </Button>
    </motion.header>
  );
}
