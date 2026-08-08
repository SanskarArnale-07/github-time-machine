import { redirect } from "next/navigation";
import Image from "next/image";
import { GitCommitHorizontal } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/dashboard/logout-button";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Belt and suspenders — middleware already blocks this route, but a
  // Server Component should never trust that alone.
  if (!user) {
    redirect("/");
  }

  const metadata = user.user_metadata ?? {};
  const avatarUrl: string | undefined = metadata.avatar_url;
  const username: string =
    metadata.user_name ?? metadata.preferred_username ?? metadata.full_name ?? "there";
  const email: string | undefined = user.email;

  return (
    <main className="flex min-h-screen flex-col bg-ink">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 sm:px-8">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-ink-border bg-ink-surface">
            <GitCommitHorizontal className="h-4 w-4 text-commit-300" />
          </div>
          <span className="font-mono text-sm tracking-tight text-ivory">
            time-machine<span className="text-brass-light">.git</span>
          </span>
        </div>
        <LogoutButton />
      </header>

      <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-6 py-16 sm:px-8">
        <div className="flex flex-col items-center rounded-2xl border border-ink-border bg-ink-surface/60 px-10 py-12 text-center">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={`${username}'s GitHub avatar`}
              width={88}
              height={88}
              className="rounded-full border border-ink-border"
            />
          ) : (
            <div className="flex h-[88px] w-[88px] items-center justify-center rounded-full border border-ink-border bg-ink text-2xl text-muted">
              {username.slice(0, 1).toUpperCase()}
            </div>
          )}

          <p className="mt-6 font-mono text-xs uppercase tracking-[0.2em] text-brass-light">
            signed in
          </p>
          <h1 className="mt-3 font-display text-3xl text-ivory sm:text-4xl">
            Welcome back, {username}.
          </h1>
          {email && <p className="mt-2 text-sm text-muted">{email}</p>}

          <p className="mt-8 max-w-sm text-balance text-sm leading-relaxed text-muted/80">
            This is a placeholder dashboard. Your commit history, timeline
            replay, and analytics will live here in a later step.
          </p>
        </div>
      </section>
    </main>
  );
}
