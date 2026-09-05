import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchUserRepositories } from "@/lib/github/api";
import { checkRateLimit, getClientIp } from "@/lib/rate-limiter";

const ALLOWED_SORTS = new Set(["updated", "stars", "created"]);

export async function GET(request: NextRequest) {
  try {
    const clientIp = getClientIp(request.headers);
    const rateLimit = checkRateLimit(clientIp, 30, 5 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a few minutes." },
        { status: 429, headers: { "Retry-After": String(rateLimit.resetInSeconds) } }
      );
    }

    const url = new URL(request.url);
    const rawSort = url.searchParams.get("sort") || "updated";
    const sortParam = ALLOWED_SORTS.has(rawSort) ? rawSort : "updated";

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
      "octocat";

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const providerToken: string | undefined =
      (session as any)?.provider_token ??
      request.cookies.get("gh_provider_token")?.value ??
      undefined;

    let repos = await fetchUserRepositories(username, providerToken);

    if (sortParam === "stars") {
      repos.sort((a, b) => b.stargazers_count - a.stargazers_count);
    } else if (sortParam === "created") {
      repos.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } else {
      repos.sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    }

    return NextResponse.json(repos);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("403") || message.includes("rate limit")) {
      return NextResponse.json(
        { error: "GitHub API rate limit reached. Please try again shortly." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }
    console.error("Error in /api/github/repos:", message);
    return NextResponse.json(
      { error: "Failed to retrieve repositories." },
      { status: 500 }
    );
  }
}
