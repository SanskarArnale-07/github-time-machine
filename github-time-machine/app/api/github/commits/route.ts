import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  fetchAllUserCommitHistory,
  groupCommitsByYearAndMonth,
  fetchGitHubProfile,
} from "@/lib/github/api";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in with GitHub." },
        { status: 401 }
      );
    }

    const metadata = user.user_metadata ?? {};
    const username: string =
      metadata.user_name ??
      metadata.preferred_username ??
      metadata.full_name ??
      "octocat";

    // Attempt to get provider_token if Supabase stored it
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const providerToken = (session as any)?.provider_token;

    const [profile, history] = await Promise.all([
      fetchGitHubProfile(username, providerToken).catch(() => null),
      fetchAllUserCommitHistory(username, providerToken),
    ]);

    const yearGroups = groupCommitsByYearAndMonth(history.commits);

    return NextResponse.json({
      success: true,
      username,
      profile,
      repos: history.repos,
      commits: history.commits,
      yearGroups,
      totalCommits: history.commits.length,
    });
  } catch (error: any) {
    console.error("Error in /api/github/commits:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch commit history" },
      { status: 500 }
    );
  }
}
