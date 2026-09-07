/**
 * Site URL and Canonical Link Helpers
 * 
 * Safely resolves the canonical production base URL without trusting
 * arbitrary host headers, ensuring clean SEO and sharing metadata.
 */

export function getSiteUrl(): string {
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

export function getOpenGraphImageUrl(params: {
  type: "profile" | "repo";
  username?: string;
  name?: string;
  owner?: string;
  repo?: string;
}): string {
  const base = getSiteUrl();
  const searchParams = new URLSearchParams();
  searchParams.set("type", params.type);
  if (params.username) searchParams.set("username", params.username);
  if (params.name) searchParams.set("name", params.name);
  if (params.owner) searchParams.set("owner", params.owner);
  if (params.repo) searchParams.set("repo", params.repo);
  return `${base}/api/og?${searchParams.toString()}`;
}
