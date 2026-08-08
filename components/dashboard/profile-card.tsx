"use client";
import React from "react";
import Image from "next/image";
import { GitHubUserProfile } from "@/lib/github/types";
import { MapPin, Building, Calendar } from "lucide-react";

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
    <div className="glass-card flex flex-col items-center justify-between gap-6 p-6 md:flex-row md:items-start text-center md:text-left transition-all duration-300 hover:border-brass/30">
      <div className="flex w-full flex-col items-center gap-6 md:flex-row md:items-start">
        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-full border-2 border-brass bg-[#0B1020] shadow-[0_0_20px_rgba(212,168,83,0.3)]">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={name}
              fill
              priority
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-display text-3xl text-brass-light">
              {username.slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-grow space-y-2">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-ivory">
              {name}
            </h2>
            <a
              href={`https://github.com/${username}`}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-sm text-muted transition-colors hover:text-brass"
            >
              @{username}
            </a>
          </div>

          {bio && <p className="max-w-md text-sm italic text-ivory/90">{bio}</p>}

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-sm text-muted md:justify-start">
            {profile?.location && (
              <div className="flex items-center gap-1.5 font-sans text-xs">
                <MapPin className="h-3.5 w-3.5 text-brass-light" />
                <span>{profile.location}</span>
              </div>
            )}
            {profile?.company && (
              <div className="flex items-center gap-1.5 font-sans text-xs">
                <Building className="h-3.5 w-3.5 text-brass-light" />
                <span>{profile.company}</span>
              </div>
            )}
            {createdAt && (
              <div className="flex items-center gap-1.5 font-sans text-xs">
                <Calendar className="h-3.5 w-3.5 text-brass-light" />
                <span>Joined {createdAt}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid w-full grid-cols-3 gap-3 md:mt-0 md:w-auto md:min-w-[320px]">
        <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-[#0B1020]/80 p-4 shadow-sm">
          <span className="font-display text-2xl font-bold text-ivory">
            {followers}
          </span>
          <span className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted">
            Followers
          </span>
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-[#0B1020]/80 p-4 shadow-sm">
          <span className="font-display text-2xl font-bold text-ivory">
            {following}
          </span>
          <span className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted">
            Following
          </span>
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-[#0B1020]/80 p-4 shadow-sm">
          <span className="font-display text-2xl font-bold text-ivory">
            {publicRepos}
          </span>
          <span className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted">
            Repos
          </span>
        </div>
      </div>
    </div>
  );
}
