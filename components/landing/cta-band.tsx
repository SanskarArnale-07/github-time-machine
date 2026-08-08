"use client";

import { motion } from "framer-motion";
import { Github } from "lucide-react";
import { signInWithGithub } from "@/lib/supabase/auth-actions";
import { Button } from "@/components/ui/button";

export function CtaBand() {
  return (
    <section className="py-24 bg-ink px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-5xl mx-auto rounded-3xl p-12 md:p-20 text-center relative overflow-hidden bg-gradient-to-br from-white/[0.05] to-white/[0.01] border border-white/10"
      >
        <div className="absolute inset-0 bg-brass-dim/5 mix-blend-overlay" />
        
        <div className="relative z-10 flex flex-col items-center">
          <span className="font-mono text-xs text-muted mb-6 uppercase tracking-widest">
            Ready to rewind
          </span>
          
          <h2 className="font-display text-4xl md:text-5xl text-ivory mb-10 tracking-tight">
            Press play on your own history.
          </h2>
          
          <form action={signInWithGithub}>
            <Button size="lg" className="font-sans bg-ivory text-ink hover:bg-ivory/90 rounded-full px-8">
              <Github className="mr-2 w-4 h-4" />
              Continue with GitHub
            </Button>
          </form>
        </div>
      </motion.div>
    </section>
  );
}
