import { NextRequest, NextResponse } from "next/server";
import {
  fetchGitHubProfile,
  fetchAllUserCommitHistory,
  groupCommitsByYearAndMonth,
  generateContributionData,
  calculateAnalytics,
  fetchGitHubContributionsGraphQL,
} from "@/lib/github/api";
import { checkRateLimit, getClientIp } from "@/lib/rate-limiter";

// In-memory cache — 10 minutes TTL
const cacheMap = new Map<string, { data: unknown; expiresAt: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

// Track refresh burst timestamps to prevent cache-busting DoS attacks
const refreshTracker = new Map<string, number>();

// Validate GitHub username format: 1–39 alphanumeric / hyphens, no leading/trailing hyphens
const VALID_USERNAME = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const clientIp = getClientIp(request.headers);

    // 1. IP Rate Limiting: Max 20 queries per 5 minutes per IP
    const rateLimit = checkRateLimit(clientIp, 20, 5 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a few minutes before trying again." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.resetInSeconds),
            "X-RateLimit-Limit": "20",
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    const { username } = await params;

    if (!username || !VALID_USERNAME.test(username)) {
      return NextResponse.json({ error: "Invalid GitHub username format." }, { status: 400 });
    }

    const url = new URL(request.url);
    const requestedRefresh = url.searchParams.get("refresh") === "true";

    const cacheKey = `public-${username.toLowerCase()}`;
    const cached = cacheMap.get(cacheKey);
    const now = Date.now();

    // 2. Cache-busting defense: allow refresh at most once every 3 minutes per user/IP
    let forceRefresh = false;
    if (requestedRefresh) {
      const lastRefresh = refreshTracker.get(`${clientIp}-${cacheKey}`) || 0;
      if (now - lastRefresh > 3 * 60 * 1000) {
        forceRefresh = true;
        refreshTracker.set(`${clientIp}-${cacheKey}`, now);
      }
    }

    if (!forceRefresh && cached && cached.expiresAt > now) {
      return NextResponse.json(cached.data, {
        headers: {
          "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
          "X-RateLimit-Remaining": String(rateLimit.remaining),
        },
      });
    }

    // Server-side GitHub token (never exposed to browser)
    const token: string | undefined = process.env.GITHUB_TOKEN ?? undefined;

    // Validate the username exists before making heavier multi-repo requests
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
      headers: {
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
        "X-RateLimit-Remaining": String(rateLimit.remaining),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "";

    // Surface rate limits safely without leaking internals
    if (message.includes("403") || message.includes("rate limit")) {
      return NextResponse.json(
        { error: "GitHub API rate limit reached. Please try again in a few minutes." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    console.error("Error fetching public GitHub replay timeline:", message);
    return NextResponse.json(
      { error: "An unexpected error occurred while loading GitHub history." },
      { status: 500 }
    );
  }
}
