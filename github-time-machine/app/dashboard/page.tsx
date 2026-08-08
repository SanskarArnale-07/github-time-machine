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

  // Retrieve session provider token if available
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const providerToken = (session as any)?.provider_token;

  let initialProfile = null;
  try {
    initialProfile = await fetchGitHubProfile(username, providerToken);
  } catch {
    // If profile call fails during server render, DashboardContent will manage fallback
    initialProfile = null;
  }

  return (
    <main className="flex min-h-screen flex-col bg-ink text-ivory antialiased">
      {/* Vintage App Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-ink-border bg-ink/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-border bg-ink-surface shadow-sm">
              <GitCommitHorizontal className="h-5 w-5 text-commit-300" />
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-sm font-semibold tracking-tight text-ivory">
                time-machine<span className="text-brass-light">.git</span>
              </span>
              <span className="font-mono text-[10px] text-muted/70">
                temporal commit replay
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <section className="mx-auto w-full max-w-6xl flex-1 px-6 py-10 sm:px-8">
        <DashboardContent
          initialUsername={username}
          initialAvatar={avatarUrl}
          initialEmail={email}
          initialProfile={initialProfile}
        />
      </section>

      {/* Vintage Footer */}
      <footer className="border-t border-ink-border py-8 text-center font-mono text-xs text-muted/60">
        <p>GitHub Time Machine · Crafted for developer odysseys</p>
      </footer>
    </main>
  );
}
