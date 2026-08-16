"use client";
import React from "react";
import Image from "next/image";
import { GitHubUserProfile } from "@/lib/github/types";
import { Calendar, Flame, Users, BookOpen } from "lucide-react";

interface ProfileCardProps {
  profile: GitHubUserProfile | null;
  fallbackUsername: string;
  fallbackAvatar?: string;
  fallbackEmail?: string;
}

export function ProfileCard({
  profile,
  fallbackUsername,
  fallbackAvatar,
}: ProfileCardProps) {
  const name = profile?.name || fallbackUsername;
  const username = profile?.login || fallbackUsername;
  const avatarUrl = profile?.avatar_url || fallbackAvatar;
  const followers = profile?.followers ?? 0;
  const publicRepos = profile?.public_repos ?? 0;
  const createdAt = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      })
    : null;

  return (
    <div className="relative flex items-center justify-between overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-[#C9A86A]/[0.03] to-transparent p-4 md:p-6 shadow-lg backdrop-blur-md">
      <div className="flex items-center gap-4">
        <div className="relative h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-full border-2 border-white/10 bg-[#0B0A09] shadow-md">
          {avatarUrl ? (
            <Image src={avatarUrl} alt={name} fill priority className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-display text-xl text-brass-light">
              {username.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="absolute bottom-0 right-0 rounded-full bg-orange-500 p-0.5 border border-[#0B0A09]" aria-label="Active developer">
            <Flame className="h-2.5 w-2.5 text-white" aria-hidden="true" />
          </div>
        </div>

        <div className="flex flex-col min-w-0 flex-1">
          <h1 className="font-display text-lg sm:text-xl font-bold tracking-tight text-ivory truncate w-full" title={name}>
            {name}
          </h1>
          <a
            href={`https://github.com/${username}`}
            target="_blank"
            rel="noreferrer"
            aria-label={`View @${username} on GitHub (opens in new tab)`}
            className="py-1 font-mono text-xs text-brass hover:text-brass-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/60 rounded-sm"
          >
            @{username}
          </a>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] sm:text-xs text-muted font-mono">
            {createdAt && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-brass-light/70" />
                <span>Joined {createdAt}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <BookOpen className="h-3 w-3 text-brass-light/70" />
              <span>{publicRepos} repos</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3 text-brass-light/70" />
              <span>{followers} followers</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
