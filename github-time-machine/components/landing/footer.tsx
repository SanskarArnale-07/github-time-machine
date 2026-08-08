import { GitCommitHorizontal } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 border-t border-ink-border px-6 py-8 text-xs text-muted/70 sm:flex-row sm:px-8">
      <div className="flex items-center gap-2 font-mono">
        <GitCommitHorizontal className="h-3.5 w-3.5" />
        time-machine.git
      </div>
      <p>Built for developers who forgot how far they've come.</p>
    </footer>
  );
}
