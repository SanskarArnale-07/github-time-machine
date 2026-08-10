import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ReplayPage } from "@/components/replay/replay-page";
import { fetchGitHubProfile } from "@/lib/github/api";

export default async function RepoDocumentaryRoute({
  params,
}: {
  params: Promise<{ owner: string; name: string }>;
}) {
  const resolvedParams = await params;
  const repoFilter = `${resolvedParams.owner}/${resolvedParams.name}`;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const metadata = user.user_metadata ?? {};
  const avatarUrl: string | undefined = metadata.avatar_url;
  const username: string =
    metadata.user_name ??
    metadata.preferred_username ??
    metadata.full_name ??
    "developer";
  const email: string | undefined = user.email;

  // Pre-fetch profile on the server
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const providerToken = (session as any)?.provider_token;

  let initialProfile = null;
  try {
    initialProfile = await fetchGitHubProfile(username, providerToken);
  } catch {
    initialProfile = null;
  }

  return (
    <div className="h-[100dvh] w-full overflow-hidden">
      <ReplayPage
        initialUsername={username}
        initialAvatar={avatarUrl}
        initialEmail={email}
        initialProfile={initialProfile}
        repoFilter={repoFilter}
      />
    </div>
  );
}
