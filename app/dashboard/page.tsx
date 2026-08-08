import { redirect } from "next/navigation";
import { GitCommitHorizontal } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/dashboard/logout-button";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { fetchGitHubProfile } from "@/lib/github/api";

export default async function DashboardPage() {
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

  // Attempt to pre-fetch profile on the server
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
    <main className="flex min-h-screen flex-col bg-ink">
      {/* Top navigation */}
      <header className="sticky top-0 z-30 border-b border-ink-border bg-ink/90 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3.5 sm:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-ink-border bg-ink-surface">
              <GitCommitHorizontal className="h-4 w-4 text-commit-300" />
            </div>
            <span className="text-sm font-medium text-ivory">
              time-machine<span className="text-brass-light">.git</span>
            </span>
          </div>
          <LogoutButton />
        </div>
      </header>

      {/* Main content */}
      <section className="mx-auto w-full max-w-6xl flex-1 px-6 py-8 sm:px-8">
        <DashboardContent
          initialUsername={username}
          initialAvatar={avatarUrl}
          initialEmail={email}
          initialProfile={initialProfile}
        />
      </section>

      {/* Footer */}
      <footer className="border-t border-ink-border py-6 text-center text-xs text-muted/50">
        GitHub Time Machine · Built for developers who forgot how far they've come
      </footer>
    </main>
  );
}
