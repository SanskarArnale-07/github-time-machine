import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /auth/callback?code=...
 *
 * Supabase redirects here after the user approves GitHub OAuth. We swap
 * the one-time `code` for a session (stored in cookies by the server
 * client), then send the user on to /dashboard.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Something went wrong (denied access, expired code, etc.) — send the
  // user back to the landing page with a flag the UI can surface later.
  return NextResponse.redirect(`${origin}/?error=auth_failed`);
}
