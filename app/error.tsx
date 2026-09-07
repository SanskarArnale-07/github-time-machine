"use client";

import { useEffect } from "react";
import Link from "next/link";
import { GitCommitHorizontal, RotateCcw, ArrowLeft } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log privately on the client/console without exposing details in the UI
    console.error("Time Machine archive retrieval exception:", error?.digest || "unknown");
  }, [error]);

  return (
    <main className="relative min-h-[100dvh] w-full flex flex-col items-center justify-between px-6 py-10 overflow-hidden bg-[#070B14] text-[#F8FAFC]">
      {/* Ambient background glows */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(59,75,140,0.35)_0%,transparent_70%)] blur-3xl" 
      />
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(212,168,83,0.12)_0%,transparent_70%)] blur-2xl" 
      />

      {/* Top Header Bar */}
      <header className="relative z-10 w-full max-w-5xl flex items-center justify-between">
        <Link 
          href="/" 
          className="flex items-center gap-2.5 group transition-opacity hover:opacity-90"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] shadow-[0_0_12px_#D4AF37]" />
          <span className="font-mono text-xs tracking-[0.22em] font-bold uppercase text-[#F1F5F9]">
            GitHub Time Machine
          </span>
        </Link>
        <div className="font-mono text-[11px] tracking-[0.2em] text-[#E5C07B] uppercase px-3 py-1 rounded-full border border-[#D4AF37]/30 bg-[#0B1226]/80">
          ARCHIVE EXCEPTION
        </div>
      </header>

      {/* Center Cinematic Content */}
      <section className="relative z-10 my-auto flex flex-col items-center text-center max-w-2xl px-2 py-8">
        {/* Glowing Anomaly Icon */}
        <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#D4AF37]/40 bg-[#0B1226]/90 shadow-[0_0_36px_rgba(212,168,83,0.25)]">
          <GitCommitHorizontal className="h-8 w-8 text-[#E5C07B]" />
        </div>

        {/* Eyebrow Label */}
        <span className="font-mono text-xs uppercase tracking-[0.28em] text-[#D4AF37] font-semibold mb-3">
          Temporal Interruption
        </span>

        {/* Main Headline */}
        <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-[#F8FAFC] leading-tight mb-4">
          AN UNEXPECTED PROBLEM OCCURRED IN THE ARCHIVE
        </h1>

        {/* Supporting Explanation */}
        <p className="text-sm sm:text-base text-slate-300 max-w-lg leading-relaxed mb-8">
          The Time Machine encountered an unexpected problem while retrieving and reconstructing this archive. You can attempt to reconnect or return to the gateway.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto justify-center">
          {/* Try Again button calling reset() */}
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-full px-8 py-3.5 text-sm font-semibold tracking-wide uppercase transition-all duration-200 bg-[#D4AF37] text-[#070B14] hover:bg-[#E5C07B] hover:shadow-[0_0_24px_rgba(212,168,83,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#070B14]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>TRY AGAIN</span>
          </button>

          {/* Return button */}
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-full px-8 py-3.5 text-sm font-semibold tracking-wide uppercase transition-all duration-200 border border-white/20 bg-white/5 text-[#F8FAFC] hover:bg-white/10 hover:border-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070B14]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>RETURN TO TIME MACHINE</span>
          </Link>
        </div>
      </section>

      {/* Bottom Status Strip */}
      <footer className="relative z-10 w-full max-w-5xl flex items-center justify-between border-t border-white/10 pt-4 text-[11px] font-mono tracking-wider text-slate-500 uppercase">
        <span>Public GitHub Archive · Fault Isolation</span>
        <span className="text-[#D4AF37]/80">time-machine.git</span>
      </footer>
    </main>
  );
}
