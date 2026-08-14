import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RepoDocumentaryPage } from "@/components/replay/repo-documentary-page";

export default async function RepositoryDocumentaryRoute(props: {
  params: Promise<{ owner: string; repo: string }>;
}) {
  const params = await props.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const metadata = user.user_metadata ?? {};
  const username: string =
    metadata.user_name ??
    metadata.preferred_username ??
    metadata.full_name ??
    "developer";
  
  const fullRepoName = `${params.owner}/${params.repo}`;

  return (
    <div className="h-[100dvh] w-full overflow-hidden">
      <RepoDocumentaryPage
        initialUsername={username}
        repoFullName={fullRepoName}
      />
    </div>
  );
}
