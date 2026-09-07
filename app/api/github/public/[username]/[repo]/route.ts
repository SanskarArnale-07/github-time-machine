import { NextRequest, NextResponse } from "next/server";
import { fetchSingleRepo, fetchRepoCommits } from "@/lib/github/api";
import { checkRateLimit, getClientIp } from "@/lib/rate-limiter";
import { isValidGitHubOwnerRepo } from "@/lib/github/validation";

// In-memory cache — 10 minutes TTL
const cacheMap = new Map<string, { data: unknown; expiresAt: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000;

// Track refresh burst timestamps to prevent cache-busting DoS
const refreshTracker = new Map<string, number>();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string; repo: string }> }
) {
  try {
    const clientIp = getClientIp(request.headers);

    // 1. IP Rate Limiting: Max 25 queries per 5 minutes per IP
    const rateLimit = checkRateLimit(clientIp, 25, 5 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a few minutes before trying again." },
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

    const { username, repo } = await params;

    // 2. Strict Input Validation: Prevent traversal, encoded paths, and arbitrary URLs
    if (!isValidGitHubOwnerRepo(username, repo)) {
      return NextResponse.json(
        { error: "Invalid repository identifier format." },
        { status: 400 }
      );
    }

    const url = new URL(request.url);
    const requestedRefresh = url.searchParams.get("refresh") === "true";

    const cacheKey = `public-repo-${username.toLowerCase()}-${repo.toLowerCase()}`;
    const cached = cacheMap.get(cacheKey);
    const now = Date.now();

    // 3. Cache-busting defense: allow refresh at most once every 3 minutes
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

    const token: string | undefined = process.env.GITHUB_TOKEN ?? undefined;

    // 4. Fetch repository metadata
    let repoData;
    try {
      repoData = await fetchSingleRepo(username, repo, token);
    } catch {
      return NextResponse.json(
        { error: `Repository @${username}/${repo} not found or is inaccessible.` },
        { status: 404 }
      );
    }

    // 5. Strict Data Boundary: Never serve private repositories in public mode
    if (!repoData || (repoData as any).private === true || (repoData as any).visibility === "private") {
      return NextResponse.json(
        { error: `Repository @${username}/${repo} not found or is inaccessible.` },
        { status: 404 }
      );
    }

    // 6. Fetch repository commit history
    const commits = await fetchRepoCommits(username, repo, token);

    const payload = {
      success: true,
      owner: username,
      repoName: repo,
      repo: repoData,
      commits,
      totalCommits: commits.length,
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

    if (message.includes("403") || message.includes("rate limit")) {
      return NextResponse.json(
        { error: "GitHub API rate limit reached. Please try again in a few minutes." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    console.error("Error fetching public repository documentary data:", message);
    return NextResponse.json(
      { error: "An unexpected error occurred while loading repository history." },
      { status: 500 }
    );
  }
}
