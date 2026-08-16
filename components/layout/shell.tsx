import React from "react";
import { TopNavBar } from "./top-nav-bar";
import { SideNavBar } from "./side-nav-bar";

interface ShellProps {
  children: React.ReactNode;
  repoName?: string;
  avatarUrl?: string | null;
  username?: string;
  baseUrl?: string;
}

export function Shell({ children, repoName, avatarUrl, username, baseUrl = "/dashboard" }: ShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface font-sans selection:bg-primary/30 selection:text-white">
      <TopNavBar repoName={repoName} avatarUrl={avatarUrl} username={username} />
      <div className="flex flex-1 overflow-hidden h-[calc(100vh-64px)]">
        <SideNavBar baseUrl={baseUrl} />
        <main className="flex-1 flex flex-col min-w-0 relative h-full">
          {children}
        </main>
      </div>
    </div>
  );
}
