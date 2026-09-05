import type { ReactNode } from "react";

/**
 * Public replay layout — mirrors the authenticated replay layout so the
 * cinematic theater gets the same full-viewport treatment without inheriting
 * any dashboard chrome.
 */
export default function PublicReplayLayout({ children }: { children: ReactNode }) {
  return <section className="replay-route-layout">{children}</section>;
}
