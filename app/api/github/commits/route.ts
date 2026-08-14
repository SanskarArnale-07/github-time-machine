import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  fetchGitHubProfile,
  fetchAllUserCommitHistory,
  groupCommitsByYearAndMonth,
  generateContributionData,
  calculateAnalytics,
  fetchGitHubContributionsGraphQL,
} from "@/lib/github/api";

// In-memory short-duration cache for rapid responses
const cacheMap = new Map<string, { data: any; expiresAt: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const forceRefresh = url.searchParams.get("refresh") === "true";

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const metadata = user.user_metadata ?? {};
    const username: string =
      metadata.user_name ??
      metadata.preferred_username ??
      metadata.full_name ??
      "developer";

    // Check in-memory cache
    const cacheKey = `user-${username.toLowerCase()}`;
    const cached = cacheMap.get(cacheKey);
    const now = Date.now();

    if (!forceRefresh && cached && cached.expiresAt > now) {
      return NextResponse.json(cached.data, {
        headers: {
          "Cache-Control": "private, s-maxage=600, stale-while-revalidate=1200",
        },
      });
    }

    // Try to get provider token
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const providerToken: string | undefined =
      (session as any)?.provider_token ?? undefined;

    const [profile, history, graphqlContributions] = await Promise.all([
      fetchGitHubProfile(username, providerToken).catch(() => null),
      fetchAllUserCommitHistory(username, providerToken),
      providerToken ? fetchGitHubContributionsGraphQL(username, providerToken).catch(() => null) : Promise.resolve(null),
    ]);

    const yearGroups = groupCommitsByYearAndMonth(history.commits);
    const contributions = graphqlContributions || generateContributionData(history.commits);
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
      headers: {
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (error: any) {
    console.error("Error in /api/github/commits:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
