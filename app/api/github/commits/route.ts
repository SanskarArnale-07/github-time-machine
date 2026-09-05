import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  fetchGitHubProfile,
  fetchAllUserCommitHistory,
  groupCommitsByYearAndMonth,
  generateContributionData,
  calculateAnalytics,
  fetchGitHubContributionsGraphQL,
} from "@/lib/github/api";
import { checkRateLimit, getClientIp } from "@/lib/rate-limiter";

// In-memory short-duration cache for rapid responses
const cacheMap = new Map<string, { data: any; expiresAt: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache

// Track refresh burst timestamps to prevent cache-busting DoS
const refreshTracker = new Map<string, number>();

export async function GET(request: NextRequest) {
  try {
    const clientIp = getClientIp(request.headers);
    const rateLimit = checkRateLimit(clientIp, 25, 5 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a few minutes." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.resetInSeconds),
            "X-RateLimit-Limit": "25",
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    const url = new URL(request.url);
    const requestedRefresh = url.searchParams.get("refresh") === "true";

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

    // Cache-busting defense: allow refresh at most once every 2 minutes
    let forceRefresh = false;
    if (requestedRefresh) {
      const lastRefresh = refreshTracker.get(`${clientIp}-${cacheKey}`) || 0;
      if (now - lastRefresh > 2 * 60 * 1000) {
        forceRefresh = true;
        refreshTracker.set(`${clientIp}-${cacheKey}`, now);
      }
    }

    if (!forceRefresh && cached && cached.expiresAt > now) {
      return NextResponse.json(cached.data, {
        headers: {
          "Cache-Control": "private, s-maxage=600, stale-while-revalidate=1200",
          "X-RateLimit-Remaining": String(rateLimit.remaining),
        },
      });
    }

    // Try to get provider token. `session.provider_token` is only ever
    // present on the initial OAuth exchange — every request after that
    // relies on the cookie captured in /auth/callback (see comment there).
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const providerToken: string | undefined =
      (session as any)?.provider_token ??
      request.cookies.get("gh_provider_token")?.value ??
      undefined;

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
    const message = error instanceof Error ? error.message : "";
    if (message.includes("403") || message.includes("rate limit")) {
      return NextResponse.json(
        { error: "GitHub API rate limit reached. Please try again shortly." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }
    console.error("Error in /api/github/commits:", message);
    return NextResponse.json(
      { error: "Failed to retrieve authenticated commit history." },
      { status: 500 }
    );
  }
}
