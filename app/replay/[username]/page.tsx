import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fetchGitHubProfile } from "@/lib/github/api";
import { ReplayPage } from "@/components/replay/replay-page";
import { isValidGitHubUsername } from "@/lib/github/validation";

import { getCanonicalUrl, getOpenGraphImageUrl } from "@/lib/site-url";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  if (!isValidGitHubUsername(username)) {
    return {
      title: "GitHub Time Machine",
      robots: { index: false, follow: false },
    };
  }

  const token: string | undefined = process.env.GITHUB_TOKEN ?? undefined;
  let name: string | undefined = undefined;
  try {
    const profile = await fetchGitHubProfile(username, token);
    if (profile?.name) {
      name = profile.name;
    }
  } catch {
    // Fallback to username
  }

  const displayName = name ? `${name} (@${username})` : `@${username}`;
  const title = `${name || username} — GitHub Time Machine`;
  const possessive = username.endsWith("s") || username.endsWith("S") ? `${username}'` : `${username}'s`;
  const description = `A cinematic replay of ${possessive} public GitHub journey.`;
  const canonicalUrl = getCanonicalUrl(`/replay/${username}`);
  const ogImageUrl = getOpenGraphImageUrl({
    type: "profile",
    username,
    name,
  });

  return {
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
      type: "website",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${displayName} — GitHub Time Machine`,
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
