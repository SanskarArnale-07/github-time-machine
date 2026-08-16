"use client";

import Link from "next/link";
import { GitCommitHorizontal, Search, Bell } from "lucide-react";
import { LogoutButton } from "@/components/dashboard/logout-button";

interface TopNavBarProps {
  repoName?: string;
  avatarUrl?: string | null;
  username?: string;
}

export function TopNavBar({ repoName, avatarUrl, username }: TopNavBarProps) {
  return (
    <header className="sticky top-0 z-50 w-full h-16 border-b border-outline-variant bg-surface-container-lowest/80 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-outline-variant bg-surface-container-low group-hover:border-primary transition-colors">
            <GitCommitHorizontal className="h-4 w-4 text-primary" />
          </div>
          <span className="font-mono text-sm font-semibold text-on-surface">
            chronos<span className="text-outline">.src</span>
          </span>
        </Link>
        
        {repoName && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-low border border-outline-variant">
            <span className="font-mono text-xs text-on-surface-variant">
              {repoName}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-outline group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search commits, files, users..." 
            className="w-64 h-9 bg-surface-container border border-outline-variant rounded-md pl-9 pr-4 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-surface border border-outline-variant rounded text-outline">⌘</kbd>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-surface border border-outline-variant rounded text-outline">K</kbd>
          </div>
        </div>

        <button className="h-9 w-9 flex items-center justify-center rounded-full border border-outline-variant hover:bg-surface-container hover:text-primary transition-colors text-outline">
          <Bell className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3 border-l border-outline-variant pl-4">
          <div className="flex items-center gap-2">
            {avatarUrl && (
              <img src={avatarUrl} alt="Avatar" className="h-8 w-8 rounded-full border border-outline-variant object-cover" />
            )}
            {username && (
              <span className="text-sm font-medium text-on-surface hidden lg:block">{username}</span>
            )}
          </div>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
