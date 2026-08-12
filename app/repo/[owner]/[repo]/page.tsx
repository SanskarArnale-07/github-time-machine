import { redirect } from "next/navigation";
import { GitCommitHorizontal, Play } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/dashboard/logout-button";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { fetchGitHubProfile } from "@/lib/github/api";
import Link from "next/link";

export default async function RepositoryTimelinePage({
  params,
}: {
  params: { owner: string; repo: string };
}) {
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

  const fullRepoName = `${params.owner}/${params.repo}`;

  return (
    <main className="relative flex min-h-screen flex-col bg-[#0B0A09]">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0B0A09]/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3.5 sm:px-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#1A1714] text-ivory hover:text-brass-light hover:bg-[#201D19] transition-colors">
              <span className="sr-only">Back to Dashboard</span>
              &larr;
            </Link>
            <div className="flex items-center gap-2">
              <GitCommitHorizontal className="h-4 w-4 text-commit-300" />
              <span className="font-mono text-sm font-medium text-ivory">
                {params.owner}/<span className="text-brass-light">{params.repo}</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href={`/repo/${params.owner}/${params.repo}/replay`}
              className="group flex items-center gap-2 rounded-full bg-brass/10 px-4 py-1.5 font-mono text-xs text-brass-light hover:bg-brass/20 transition-colors"
            >
              <Play className="h-3 w-3 fill-current group-hover:scale-110 transition-transform" />
              Play Documentary
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <DashboardContent
        initialUsername={username}
        initialAvatar={avatarUrl}
        initialEmail={email}
        initialProfile={initialProfile}
        repoFilter={fullRepoName}
      />
    </main>
  );
}
