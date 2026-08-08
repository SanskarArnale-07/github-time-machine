"use client";

import Image from "next/image";
import {
  Users,
  GitFork,
  BookOpen,
  Calendar,
  ExternalLink,
  MapPin,
  Building2,
  Sparkles,
} from "lucide-react";
import { GitHubUserProfile } from "@/lib/github/types";

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
  const username = profile?.login || fallbackUsername;
  const name = profile?.name || username;
  const avatarUrl = profile?.avatar_url || fallbackAvatar;
  const bio = profile?.bio;
  const followers = profile?.followers ?? 0;
  const following = profile?.following ?? 0;
  const publicRepos = profile?.public_repos ?? 0;
  const profileUrl = profile?.html_url || `https://github.com/${username}`;

  // Calculate account age
  const createdAt = profile?.created_at ? new Date(profile.created_at) : null;
  const formattedCreationDate = createdAt
    ? createdAt.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Historic";

  const yearsAgo = createdAt
    ? Math.max(1, new Date().getFullYear() - createdAt.getFullYear())
    : null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-ink-border bg-ink-surface/90 p-6 shadow-2xl backdrop-blur-md transition-all duration-300 hover:border-brass/30 sm:p-8">
      {/* Decorative vintage watermark grid accent */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-brass/5 blur-3xl" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* User Identity Column */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          {/* Avatar with Vintage Brass Halo */}
          <div className="relative flex-shrink-0">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-brass-dim via-brass-light/40 to-commit-300/30 opacity-70 blur-[3px]" />
            <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-ink-border bg-ink sm:h-28 sm:w-28">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={`${username}'s GitHub avatar`}
                  width={112}
                  height={112}
                  priority
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-display text-4xl text-brass-light">
                  {username.slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>
            <div
              title="Verified Time Traveler"
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-ink-border bg-ink text-commit-300 shadow-md"
            >
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            </div>
          </div>

          {/* Name, Username, Bio */}
          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-display text-2xl tracking-tight text-ivory sm:text-3xl lg:text-4xl">
                {name}
              </h1>
              <a
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1 rounded-full border border-ink-border bg-ink/60 px-3 py-0.5 font-mono text-xs text-brass-light transition-colors hover:border-brass hover:text-ivory"
              >
                <span>@{username}</span>
                <ExternalLink className="h-3 w-3 opacity-60 transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>

            {bio ? (
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
                “{bio}”
              </p>
            ) : fallbackEmail ? (
              <p className="mt-1 font-mono text-xs text-muted/70">{fallbackEmail}</p>
            ) : null}

            {/* Location & Company badges if available */}
            <div className="mt-3 flex flex-wrap items-center gap-3 font-mono text-xs text-muted/80">
              {profile?.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-brass-light/70" />
                  {profile.location}
                </span>
              )}
              {profile?.company && (
                <span className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5 text-brass-light/70" />
                  {profile.company}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:flex lg:items-center lg:gap-4">
          <div className="flex flex-col rounded-xl border border-ink-border bg-ink/50 px-4 py-3 text-center transition-all hover:border-brass/40">
            <span className="font-display text-2xl font-bold text-ivory">
              {publicRepos}
            </span>
            <span className="mt-0.5 flex items-center justify-center gap-1 font-mono text-[11px] uppercase tracking-wider text-muted">
              <BookOpen className="h-3 w-3 text-brass-light" />
              Repos
            </span>
          </div>

          <div className="flex flex-col rounded-xl border border-ink-border bg-ink/50 px-4 py-3 text-center transition-all hover:border-brass/40">
            <span className="font-display text-2xl font-bold text-ivory">
              {followers}
            </span>
            <span className="mt-0.5 flex items-center justify-center gap-1 font-mono text-[11px] uppercase tracking-wider text-muted">
              <Users className="h-3 w-3 text-commit-300" />
              Followers
            </span>
          </div>

          <div className="flex flex-col rounded-xl border border-ink-border bg-ink/50 px-4 py-3 text-center transition-all hover:border-brass/40">
            <span className="font-display text-2xl font-bold text-ivory">
              {following}
            </span>
            <span className="mt-0.5 flex items-center justify-center gap-1 font-mono text-[11px] uppercase tracking-wider text-muted">
              <GitFork className="h-3 w-3 text-brass-light" />
              Following
            </span>
          </div>

          <div className="col-span-2 flex flex-col rounded-xl border border-brass-dim/40 bg-gradient-to-b from-brass-dim/20 to-ink/60 px-4 py-3 text-center sm:col-span-1">
            <span className="font-mono text-xs font-semibold text-brass-light">
              {formattedCreationDate}
            </span>
            <span className="mt-0.5 flex items-center justify-center gap-1 font-mono text-[11px] uppercase tracking-wider text-muted">
              <Calendar className="h-3 w-3 text-brass" />
              {yearsAgo ? `${yearsAgo}y Voyage` : "Established"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
