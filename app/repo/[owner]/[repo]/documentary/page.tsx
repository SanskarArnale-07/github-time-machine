import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { RepoDocumentaryPage } from "@/components/replay/repo-documentary-page";
import { isValidGitHubOwnerRepo } from "@/lib/github/validation";

interface Props {
  params: Promise<{ owner: string; repo: string }>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { owner, repo } = await props.params;
  return {
    title: `${owner}/${repo} — GitHub Time Machine`,
    description: `A cinematic documentary replaying the history and milestones of ${owner}/${repo}.`,
  };
}

export default async function RepositoryDocumentaryRoute(props: Props) {
  const { owner, repo } = await props.params;

  // Strict identifier validation: reject traversal or malformed requests
  if (!isValidGitHubOwnerRepo(owner, repo)) {
    notFound();
  }

  let username = "developer";
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const metadata = user.user_metadata ?? {};
      username =
        metadata.user_name ??
        metadata.preferred_username ??
        metadata.full_name ??
        "developer";
    }
  } catch {
    // Unauthenticated visitor is welcomed in public mode
  }

  const fullRepoName = `${owner}/${repo}`;

  return (
    <div className="h-[100dvh] w-full overflow-hidden">
      <RepoDocumentaryPage
        initialUsername={username}
        repoFullName={fullRepoName}
        isPublic={true}
      />
    </div>
  );
}
