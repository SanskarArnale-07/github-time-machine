import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fetchGitHubProfile } from "@/lib/github/api";
import { ReplayPage } from "@/components/replay/replay-page";
import { isValidGitHubUsername } from "@/lib/github/validation";

import { getCanonicalUrl, getOpenGraphImageUrl, getSiteUrl } from "@/lib/site-url";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const siteUrl = getSiteUrl();

  if (!isValidGitHubUsername(username)) {
    return {
      metadataBase: new URL(siteUrl),
      title: "GitHub Time Machine",
      robots: { index: false, follow: false },
    };
  }

  const token: string | undefined = process.env.GITHUB_TOKEN ?? undefined;
  let profile = null;
  try {
    profile = await fetchGitHubProfile(username, token);
  } catch {
    // If profile fetch fails, proceed with graceful username-based metadata
  }

  const name = profile?.name || undefined;
  const displayName = name ? `${name} (@${username})` : `@${username}`;
  const title = `${displayName} — Developer Documentary | GitHub Time Machine`;

  let description: string;
  if (profile?.bio && profile.bio.trim().length > 0) {
    const cleanBio = profile.bio.trim().replace(/\r?\n|\r/g, " ");
    description = `${cleanBio} — Replay @${username}'s developer journey, commits, and open source evolution on GitHub Time Machine.`;
  } else if (profile && (profile.public_repos !== undefined || profile.followers !== undefined)) {
    const repoStr = `${profile.public_repos ?? 0} public repositories`;
    const followerStr = `${(profile.followers ?? 0).toLocaleString()} followers`;
    description = `A cinematic developer documentary of @${username}'s journey — ${repoStr}, ${followerStr}. Replay commits, milestones, and open source evolution.`;
  } else {
    const possessive = username.endsWith("s") || username.endsWith("S") ? `${username}'` : `${username}'s`;
    description = `A cinematic replay of ${possessive} public GitHub journey, milestones, and open source evolution.`;
  }

  const joinedYear = profile?.created_at ? new Date(profile.created_at).getFullYear() : undefined;
  const canonicalUrl = getCanonicalUrl(`/replay/${username}`);
  const ogImageUrl = getOpenGraphImageUrl({
    type: "profile",
    username,
    name,
    avatar: profile?.avatar_url || undefined,
    bio: profile?.bio ? profile.bio.slice(0, 140) : undefined,
    repos: profile?.public_repos,
    followers: profile?.followers,
    joined: joinedYear ? String(joinedYear) : undefined,
  });

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "GitHub Time Machine",
      type: "profile",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${displayName} — Developer Documentary`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

/**
 * Public (no auth required) profile replay page.
 * Open to any visitor to view a developer's public GitHub journey.
 */
export default async function PublicReplayPage({ params }: Props) {
  const { username } = await params;

  // Reject malformed usernames before making any API call
  if (!isValidGitHubUsername(username)) {
    notFound();
  }

  const token: string | undefined = process.env.GITHUB_TOKEN ?? undefined;

  // Pre-fetch profile server-side so the cinematic intro can show the avatar
  // and display name immediately without a client-side flash.
  let initialProfile = null;
  try {
    initialProfile = await fetchGitHubProfile(username, token);
  } catch {
    // If the user doesn't exist, 404
    notFound();
  }

  return (
    <div className="h-[100dvh] w-full overflow-hidden">
      <ReplayPage
        initialUsername={username}
        initialProfile={initialProfile}
        publicUsername={username}
      />
    </div>
  );
}
