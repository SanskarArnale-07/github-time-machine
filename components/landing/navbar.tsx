"use client";

import { motion } from "framer-motion";
import { GitCommitHorizontal } from "lucide-react";
import { signInWithGithub } from "@/lib/supabase/auth-actions";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <motion.nav 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 bg-ink/80 backdrop-blur-md border-b border-white/5"
    >
      <div className="flex items-center gap-2">
        <GitCommitHorizontal className="w-5 h-5 text-commit-300" />
        <span className="font-mono text-sm text-ivory">time-machine.git</span>
      </div>
      <form action={signInWithGithub}>
        <Button variant="ghost" className="font-sans text-sm text-muted hover:text-ivory">
          Sign in
        </Button>
      </form>
    </motion.nav>
  );
}
