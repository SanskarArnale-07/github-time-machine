import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { RepoDocumentaryPage } from "@/components/replay/repo-documentary-page";
import { isValidGitHubOwnerRepo } from "@/lib/github/validation";

import { getCanonicalUrl, getOpenGraphImageUrl } from "@/lib/site-url";

interface Props {
  params: Promise<{ owner: string; repo: string }>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { owner, repo } = await props.params;
  if (!isValidGitHubOwnerRepo(owner, repo)) {
    return {
      title: "GitHub Time Machine",
      robots: { index: false, follow: false },
    };
  }

  const title = `${owner}/${repo} — GitHub Time Machine`;
  const description = `A cinematic replay of the public development history of ${owner}/${repo}.`;
  const canonicalUrl = getCanonicalUrl(`/repo/${owner}/${repo}/documentary`);
  const ogImageUrl = getOpenGraphImageUrl({
    type: "repo",
    owner,
    repo,
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
          alt: `${owner}/${repo} — GitHub Time Machine`,
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
