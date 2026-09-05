import { NextRequest, NextResponse } from "next/server";
import {
  fetchGitHubProfile,
  fetchAllUserCommitHistory,
  groupCommitsByYearAndMonth,
  generateContributionData,
  calculateAnalytics,
  fetchGitHubContributionsGraphQL,
} from "@/lib/github/api";

// In-memory cache — same TTL as the authenticated endpoint
const cacheMap = new Map<string, { data: unknown; expiresAt: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

// Validate GitHub username format: 1–39 alphanumeric / hyphens, no leading/trailing hyphens
const VALID_USERNAME = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    if (!username || !VALID_USERNAME.test(username)) {
      return NextResponse.json({ error: "Invalid GitHub username." }, { status: 400 });
    }

    const url = new URL(request.url);
    const forceRefresh = url.searchParams.get("refresh") === "true";

    const cacheKey = `public-${username.toLowerCase()}`;
    const cached = cacheMap.get(cacheKey);
    const now = Date.now();

    if (!forceRefresh && cached && cached.expiresAt > now) {
      return NextResponse.json(cached.data, {
        headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200" },
      });
    }

    // Use a server-side GitHub PAT (read-only) if available — raises rate limit
    // from 60 req/hr to 5,000 req/hr. Falls back to unauthenticated gracefully.
    const token: string | undefined = process.env.GITHUB_TOKEN ?? undefined;

    // Validate the username actually exists before kicking off the heavier fetch
    let profile;
    try {
      profile = await fetchGitHubProfile(username, token);
    } catch {
      return NextResponse.json(
        { error: `GitHub user @${username} not found or profile is inaccessible.` },
        { status: 404 }
      );
    }

    const [history, graphqlContributions] = await Promise.all([
      fetchAllUserCommitHistory(username, token),
      token
        ? fetchGitHubContributionsGraphQL(username, token).catch(() => null)
        : Promise.resolve(null),
    ]);

    const yearGroups = groupCommitsByYearAndMonth(history.commits);
    const contributions =
      graphqlContributions ?? generateContributionData(history.commits);
    const analytics = calculateAnalytics(history.commits, history.repos);

    const payload = {
      success: true,
      username,
      profile,
      repos: history.repos,
      commits: history.commits,
      yearGroups,
      contributions,
      analytics,
      totalCommits: history.commits.length,
      cachedAt: now,
    };

    cacheMap.set(cacheKey, { data: payload, expiresAt: now + CACHE_TTL_MS });

    return NextResponse.json(payload, {
      headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";

    // Surface GitHub rate-limit errors with a friendly status
    if (message.includes("403")) {
      return NextResponse.json(
        { error: "GitHub API rate limit reached. Please try again shortly." },
        { status: 429 }
      );
    }

    console.error("Error in /api/github/public/[username]:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
