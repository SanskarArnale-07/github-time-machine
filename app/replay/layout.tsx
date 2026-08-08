import type { ReactNode } from "react";

/**
 * The replay is intentionally a separate composition from the archive.
 * Nothing in this layout inherits the dashboard header, container, or tabs.
 */
export default function ReplayLayout({ children }: { children: ReactNode }) {
  return <section className="replay-route-layout">{children}</section>;
}
