"use client";
import React from "react";
import Image from "next/image";
import { GitHubUserProfile } from "@/lib/github/types";
import { MapPin, Building, Calendar, Flame } from "lucide-react";

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
  fallbackEmail,
}: ProfileCardProps) {
  const name = profile?.name || fallbackUsername;
  const username = profile?.login || fallbackUsername;
  const avatarUrl = profile?.avatar_url || fallbackAvatar;
  const bio = profile?.bio;
  const followers = profile?.followers ?? 0;
  const following = profile?.following ?? 0;
  const publicRepos = profile?.public_repos ?? 0;
  const createdAt = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      })
    : null;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-8 md:p-10 shadow-2xl backdrop-blur-xl">
      <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-brass/10 blur-[80px]" />
      <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
        <div className="relative flex-shrink-0">
          <div className="relative h-32 w-32 overflow-hidden rounded-2xl border-4 border-white/5 bg-[#0B1020] shadow-xl">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={name}
                fill
                priority
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-display text-4xl text-brass-light">
                {username.slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
          <div className="absolute -bottom-3 -right-3 flex items-center gap-1.5 rounded-full border border-white/10 bg-ink-surface px-3 py-1.5 shadow-lg backdrop-blur-md">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="font-mono text-xs font-bold text-ivory">Active</span>
          </div>
        </div>

        <div className="flex w-full flex-col items-center md:items-start text-center md:text-left">
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-ivory sm:text-5xl">
            {name}
          </h1>
          <a
            href={`https://github.com/${username}`}
            target="_blank"
            rel="noreferrer"
            className="mt-1 font-mono text-lg text-brass hover:text-brass-light transition-colors"
          >
            @{username}
          </a>

          {bio && (
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted/90">
              {bio}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-3 text-sm text-muted">
            {profile?.location && (
              <div className="flex items-center gap-2 font-medium">
                <MapPin className="h-4 w-4 text-brass-light/70" />
                <span>{profile.location}</span>
              </div>
            )}
            {profile?.company && (
              <div className="flex items-center gap-2 font-medium">
                <Building className="h-4 w-4 text-brass-light/70" />
                <span>{profile.company}</span>
              </div>
            )}
            {createdAt && (
              <div className="flex items-center gap-2 font-medium">
                <Calendar className="h-4 w-4 text-brass-light/70" />
                <span>Joined {createdAt}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex w-full md:w-auto flex-row justify-center gap-4">
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-white/5 p-4 md:px-8 min-w-[100px] backdrop-blur-sm">
            <span className="font-display text-2xl font-bold text-ivory">{followers}</span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted">Followers</span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-white/5 p-4 md:px-8 min-w-[100px] backdrop-blur-sm">
            <span className="font-display text-2xl font-bold text-ivory">{publicRepos}</span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted">Repos</span>
          </div>
        </div>
      </div>
    </div>
  );
}
