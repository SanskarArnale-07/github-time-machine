import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /auth/callback?code=...
 *
 * Supabase redirects here after the user approves GitHub OAuth. We swap
 * the one-time `code` for a session (stored in cookies by the server
 * client), then send the user on to /dashboard.
 */
// Allowed relative paths for post-login redirect to prevent open redirects
function getSafeRedirectUrl(nextParam: string | null, origin: string): string {
  if (!nextParam) {
    return `${origin}/dashboard`;
  }

  // Must start with exactly one '/' and not contain backslashes, double slashes, @ authority, or embedded schemes
  if (
    !nextParam.startsWith("/") ||
    nextParam.startsWith("//") ||
    nextParam.includes("\\") ||
    nextParam.includes("@") ||
    nextParam.includes(":")
  ) {
    return `${origin}/dashboard`;
  }

  try {
    const parsed = new URL(nextParam, origin);
    if (parsed.origin !== origin) {
      return `${origin}/dashboard`;
    }

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return `${origin}/dashboard`;
    }

    // Only allow verified internal application routes
    const allowedPrefixes = ["/dashboard", "/replay", "/repo", "/terms", "/privacy"];
    const isAllowedPath =
      parsed.pathname === "/" ||
      allowedPrefixes.some(
        (prefix) => parsed.pathname === prefix || parsed.pathname.startsWith(`${prefix}/`)
      );

    if (!isAllowedPath) {
      return `${origin}/dashboard`;
    }

    return `${origin}${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return `${origin}/dashboard`;
  }
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next");
  const redirectTarget = getSafeRedirectUrl(rawNext, origin);

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Auth error in callback:", error.message || "Exchange failed");
    }

    if (!error) {
      const response = NextResponse.redirect(redirectTarget);

      // IMPORTANT: Supabase only includes `provider_token` in THIS one-time
      // exchange response. It is never re-issued on subsequent session
      // refreshes (supabase.auth.getSession() returns it as undefined from
      // here on). Without capturing it now, every later request loses access
      // to GitHub's real token entirely — meaning the accurate GraphQL
      // contribution calendar is never even attempted, and every dashboard
      // load silently falls back to the (capped, rate-limited) unauthenticated
      // REST path. This was the actual cause of contribution counts never
      // matching the real GitHub total, regardless of any fetch-pagination fix.
      const providerToken = data.session?.provider_token;
      if (providerToken) {
        response.cookies.set("gh_provider_token", providerToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 30, // 30 days — GitHub OAuth App tokens don't expire on their own
        });
      }

      return response;
    }
  }

  // Something went wrong (denied access, expired code, etc.) — send the
  // user back to the landing page with a flag the UI can surface later.
  return NextResponse.redirect(`${origin}/?error=auth_failed`);
}
