"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, AlertCircle, Compass, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isValidGitHubUsername, isValidGitHubOwnerRepo } from "@/lib/github/validation";

const EXAMPLES = [
  "@torvalds",
  "facebook/react",
  "microsoft/vscode",
];

export function PublicTimeMachineView() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleExplore = (targetInput?: string) => {
    const raw = (targetInput ?? input).trim();
    if (!raw) {
      setError("Please enter a GitHub username or repository.");
      return;
    }

    const returnToParam = encodeURIComponent("/dashboard#public");

    // Format 1: @username
    if (raw.startsWith("@")) {
      const username = raw.slice(1).trim();
      if (!username) {
        setError("Please enter a valid GitHub username.");
        return;
      }

      // Handle accidental @owner/repo
      if (username.includes("/")) {
        const parts = username.split("/");
        if (parts.length === 2 && parts[0] && parts[1]) {
          const owner = parts[0].trim();
          const repo = parts[1].trim();
          if (isValidGitHubOwnerRepo(owner, repo)) {
            router.push(`/repo/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/documentary?returnTo=${returnToParam}`);
            return;
          }
        }
        setError("Invalid repository format. Expected owner/repository (e.g. facebook/react).");
        return;
      }

      if (!isValidGitHubUsername(username)) {
        setError("Invalid GitHub username. Usernames may only contain alphanumeric characters and single hyphens.");
        return;
      }

      router.push(`/replay/${encodeURIComponent(username)}?returnTo=${returnToParam}`);
      return;
    }

    // Format 2: owner/repository
    if (raw.includes("/")) {
      const parts = raw.split("/");
      if (parts.length === 2 && parts[0] && parts[1]) {
        const owner = parts[0].trim();
        const repo = parts[1].trim();
        if (isValidGitHubOwnerRepo(owner, repo)) {
          router.push(`/repo/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/documentary?returnTo=${returnToParam}`);
          return;
        }
      }
      setError("Invalid repository format. Expected owner/repository (e.g. facebook/react).");
      return;
    }

    // Format 3: username (without leading @)
    if (!isValidGitHubUsername(raw)) {
      setError("Invalid GitHub username or repository. Use @username, username, or owner/repository.");
      return;
    }

    router.push(`/replay/${encodeURIComponent(raw)}?returnTo=${returnToParam}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleExplore();
  };

  const handleSelectExample = (example: string) => {
    setInput(example);
    setError(null);
  };

  return (
    <div className="w-full max-w-3xl mx-auto pt-2 pb-8">
      {/* Container card with observatory / deep space styling */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.12] bg-[#0B0F17]/90 backdrop-blur-md p-6 sm:p-8 lg:p-10 shadow-[0_16px_48px_-12px_rgba(0,0,0,0.9),0_0_32px_-4px_rgba(30,58,138,0.25)]">
        {/* Subtle top edge highlight */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
        {/* Ambient atmospheric glow */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 h-60 w-60 rounded-full bg-indigo-600/10 blur-3xl" />

        <div className="relative z-10 flex flex-col items-start">
          {/* Section pill - clear distinction between personal and public archive */}
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-950/30 px-3 py-1 font-mono text-[11px] font-semibold tracking-wider text-cyan-300 uppercase mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse" />
            Public Archive Discovery
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-md">
            PUBLIC TIME MACHINE
          </h2>

          <p className="mt-1 text-sm sm:text-base text-zinc-400 leading-relaxed font-normal">
            Explore a public GitHub history.
          </p>

          {/* Search form */}
          <form onSubmit={handleSubmit} className="mt-6 w-full flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row items-stretch gap-3">
              <div className="relative flex-1">
                <Search
                  className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Search GitHub username or repository..."
                  aria-label="Search GitHub username or repository"
                  className="h-12 w-full rounded-xl border border-white/15 bg-black/50 pl-11 pr-4 font-mono text-sm text-white placeholder:text-zinc-500 transition-all focus:border-cyan-400/80 focus:bg-black/70 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />
              </div>
              <Button
                type="submit"
                className="h-12 rounded-xl bg-white px-8 font-mono text-sm font-semibold tracking-wider text-black hover:bg-zinc-200 transition-all shadow-sm hover:scale-[1.01] active:scale-[0.99] flex-shrink-0"
              >
                EXPLORE
              </Button>
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-center gap-2 rounded-lg border border-rose-500/20 bg-rose-950/20 px-3.5 py-2 font-mono text-xs text-rose-300 animate-in fade-in duration-150"
              >
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}
          </form>

          {/* Clickable example suggestions */}
          <div className="mt-6 w-full flex flex-wrap items-center gap-2 pt-4 border-t border-white/[0.08]">
            <span className="font-mono text-xs text-zinc-400 mr-1">Examples:</span>
            {EXAMPLES.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => handleSelectExample(example)}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-xs text-zinc-300 transition-all hover:border-cyan-400/40 hover:bg-cyan-950/25 hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
              >
                {example}
              </button>
            ))}
          </div>

          {/* Format guide note */}
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-mono text-zinc-400">
            <span>Supported formats:</span>
            <span className="text-zinc-300">@username</span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-300">username</span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-300">owner/repository</span>
          </div>
        </div>
      </div>
    </div>
  );
}
