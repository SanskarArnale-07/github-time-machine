/**
 * Site URL and Canonical Link Helpers
 * 
 * Safely resolves the canonical production base URL without trusting
 * arbitrary host headers, ensuring clean SEO and sharing metadata.
 */

export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, "");
  }
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "");
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/+$/, "")}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/+$/, "")}`;
  }
  return "https://github-time-machine-sage.vercel.app";
}

export function getCanonicalUrl(path: string): string {
  const base = getSiteUrl();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

export interface OpenGraphImageParams {
  type: "profile" | "repo";
  username?: string;
  name?: string;
  owner?: string;
  repo?: string;
  avatar?: string;
  bio?: string;
  repos?: number | string;
  followers?: number | string;
  joined?: string;
  desc?: string;
  stars?: number | string;
  forks?: number | string;
  language?: string;
}

export function getOpenGraphImageUrl(params: OpenGraphImageParams): string {
  const base = getSiteUrl();
  const searchParams = new URLSearchParams();
  searchParams.set("type", params.type);
  if (params.username) searchParams.set("username", params.username);
  if (params.name) searchParams.set("name", params.name);
  if (params.owner) searchParams.set("owner", params.owner);
  if (params.repo) searchParams.set("repo", params.repo);
  if (params.avatar) searchParams.set("avatar", params.avatar);
  if (params.bio) searchParams.set("bio", params.bio);
  if (params.repos !== undefined) searchParams.set("repos", String(params.repos));
  if (params.followers !== undefined) searchParams.set("followers", String(params.followers));
  if (params.joined) searchParams.set("joined", params.joined);
  if (params.desc) searchParams.set("desc", params.desc);
  if (params.stars !== undefined) searchParams.set("stars", String(params.stars));
  if (params.forks !== undefined) searchParams.set("forks", String(params.forks));
  if (params.language) searchParams.set("language", params.language);
  return `${base}/api/og?${searchParams.toString()}`;
}
