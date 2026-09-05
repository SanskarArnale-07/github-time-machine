import { notFound } from "next/navigation";
import { fetchGitHubProfile } from "@/lib/github/api";
import { ReplayPage } from "@/components/replay/replay-page";
import type { Metadata } from "next";

// Validate GitHub username format
const VALID_USERNAME = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `@${username} — GitHub Time Machine`,
    description: `Replay ${username}'s entire GitHub journey as a cinematic timeline.`,
  };
}

/**
 * Public (no auth required) replay page.
 * Launched by the browser extension when a user clicks "Replay this GitHub"
 * on any GitHub profile. Uses the server-side GITHUB_TOKEN for data fetching.
 *
 * The existing /replay route (auth-gated, your own data) is completely untouched.
 */
export default async function PublicReplayPage({ params }: Props) {
  const { username } = await params;

  // Reject malformed usernames before making any API call
  if (!VALID_USERNAME.test(username)) {
    notFound();
  }

  const token: string | undefined = process.env.GITHUB_TOKEN ?? undefined;

  // Pre-fetch profile server-side so the cinematic intro can show the avatar
  // and display name immediately without a client-side flash.
  let initialProfile = null;
  try {
    initialProfile = await fetchGitHubProfile(username, token);
  } catch {
    // If the user doesn't exist, 404. This avoids rendering an empty replay.
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
