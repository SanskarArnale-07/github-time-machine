import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchUserRepositories } from "@/lib/github/api";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const sortParam = url.searchParams.get("sort") || "updated";

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
      (session as any)?.provider_token ?? undefined;

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
  } catch (error: any) {
    console.error("Error in /api/github/repos:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
