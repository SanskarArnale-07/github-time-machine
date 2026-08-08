import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  fetchGitHubProfile,
  fetchAllUserCommitHistory,
  groupCommitsByYearAndMonth,
  generateContributionData,
  calculateAnalytics,
} from "@/lib/github/api";

export async function GET() {
  try {
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
      "octocat";

    // Try to get the provider token for authenticated API access
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const providerToken: string | undefined =
      (session as any)?.provider_token ?? undefined;

    const [profile, history] = await Promise.all([
      fetchGitHubProfile(username, providerToken).catch(() => null),
      fetchAllUserCommitHistory(username, providerToken),
    ]);

    const yearGroups = groupCommitsByYearAndMonth(history.commits);
    const contributions = generateContributionData(history.commits);
    const analytics = calculateAnalytics(history.commits, history.repos);

    return NextResponse.json({
      success: true,
      username,
      profile,
      repos: history.repos,
      commits: history.commits,
      yearGroups,
      contributions,
      analytics,
      totalCommits: history.commits.length,
    });
  } catch (error: any) {
    console.error("Error in /api/github/commits:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
