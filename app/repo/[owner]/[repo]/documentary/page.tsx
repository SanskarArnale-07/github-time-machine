import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { RepoDocumentaryPage } from "@/components/replay/repo-documentary-page";
import { isValidGitHubOwnerRepo, getSafeReturnUrl } from "@/lib/github/validation";
import { fetchSingleRepo } from "@/lib/github/api";

import { getCanonicalUrl, getOpenGraphImageUrl, getSiteUrl } from "@/lib/site-url";

interface Props {
  params: Promise<{ owner: string; repo: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { owner, repo } = await props.params;
  const siteUrl = getSiteUrl();

  if (!isValidGitHubOwnerRepo(owner, repo)) {
    return {
      metadataBase: new URL(siteUrl),
      title: "GitHub Time Machine",
      robots: { index: false, follow: false },
    };
  }

  const token: string | undefined = process.env.GITHUB_TOKEN ?? undefined;
  let repoData = null;
  try {
    repoData = await fetchSingleRepo(owner, repo, token);
    if (repoData && ((repoData as any).private || (repoData as any).visibility === "private")) {
      repoData = null;
    }
  } catch {
    // If fetch fails or rate limited, continue with clean fallback metadata
  }

  const title = `${owner}/${repo} — Repository Documentary | GitHub Time Machine`;

  let description: string;
  if (repoData?.description && repoData.description.trim().length > 0) {
    const cleanDesc = repoData.description.trim().replace(/\r?\n|\r/g, " ");
    description = `${cleanDesc} — Replay the development history, milestones, and evolution of ${owner}/${repo} on GitHub Time Machine.`;
  } else if (repoData && (repoData.stargazers_count !== undefined || repoData.language)) {
    const langStr = repoData.language ? ` (${repoData.language})` : "";
    const starsStr = repoData.stargazers_count !== undefined ? `${repoData.stargazers_count.toLocaleString()} stars` : "";
    const forksStr = repoData.forks_count !== undefined ? `${repoData.forks_count.toLocaleString()} forks` : "";
    const statsStr = [starsStr, forksStr].filter(Boolean).join(", ");
    description = `A cinematic documentary of ${owner}/${repo}${langStr}${statsStr ? ` — ${statsStr}` : ""}. Replay commits, milestones, and open source evolution.`;
  } else {
    description = `A cinematic documentary replaying the public development history and milestones of ${owner}/${repo} on GitHub Time Machine.`;
  }

  const canonicalUrl = getCanonicalUrl(`/repo/${owner}/${repo}/documentary`);
  const ownerAvatar = repoData?.owner?.avatar_url || `https://github.com/${owner}.png`;

  const ogImageUrl = getOpenGraphImageUrl({
    type: "repo",
    owner,
    repo,
    avatar: ownerAvatar,
    desc: repoData?.description ? repoData.description.slice(0, 140) : undefined,
    stars: repoData?.stargazers_count,
    forks: repoData?.forks_count,
    language: repoData?.language || undefined,
  });

  return {
    metadataBase: new URL(siteUrl),
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
          alt: `${owner}/${repo} — Repository Documentary`,
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

  const token: string | undefined = process.env.GITHUB_TOKEN ?? undefined;

  let initialRepo = null;
  try {
    initialRepo = await fetchSingleRepo(owner, repo, token);
    if (!initialRepo || (initialRepo as any).private === true || (initialRepo as any).visibility === "private") {
      notFound();
    }
  } catch {
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
  const rawSearchParams = props.searchParams ? await props.searchParams : {};
  const returnToRaw = typeof rawSearchParams.returnTo === "string" ? rawSearchParams.returnTo : undefined;
  const safeReturnTo = returnToRaw ? getSafeReturnUrl(returnToRaw, "") : undefined;

  return (
    <div className="h-[100dvh] w-full overflow-hidden">
      <RepoDocumentaryPage
        initialUsername={username}
        repoFullName={fullRepoName}
        isPublic={true}
        initialRepo={initialRepo}
        returnTo={safeReturnTo}
      />
    </div>
  );
}
