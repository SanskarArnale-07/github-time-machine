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
      className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 bg-[#071426]/75 backdrop-blur-xl border-b border-blue-400/10"
    >
      <div className="flex items-center gap-2">
        <GitCommitHorizontal className="w-5 h-5 text-[#d4a853]" />
        <span className="font-mono text-sm text-[#f5f5f7] tracking-tight">time-machine.git</span>
      </div>
      <form action={signInWithGithub}>
        <Button variant="ghost" className="font-sans text-sm text-blue-200/70 hover:text-white hover:bg-blue-500/10">
          Sign in
        </Button>
      </form>
    </motion.nav>
  );
}
