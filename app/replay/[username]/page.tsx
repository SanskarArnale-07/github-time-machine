import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fetchGitHubProfile } from "@/lib/github/api";
import { ReplayPage } from "@/components/replay/replay-page";
import { isValidGitHubUsername } from "@/lib/github/validation";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  if (!isValidGitHubUsername(username)) {
    return { title: "GitHub Time Machine" };
  }

  const token: string | undefined = process.env.GITHUB_TOKEN ?? undefined;
  let displayName = `@${username}`;
  try {
    const profile = await fetchGitHubProfile(username, token);
    if (profile?.name) {
      displayName = `${profile.name} (@${username})`;
    }
  } catch {
    // Fallback to @username
  }

  return {
    title: `${displayName} — GitHub Time Machine`,
    description: `Replay ${username}'s entire GitHub journey as a cinematic timeline.`,
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
