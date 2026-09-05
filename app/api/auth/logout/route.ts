import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/auth/logout
 *
 * Secure server-side logout:
 * 1. Signs out of Supabase auth session.
 * 2. Explicitly expires and clears the httpOnly `gh_provider_token` cookie
 *    using the exact same path and security attributes.
 * Prevents subsequent users on shared/same browsers from inheriting the token.
 */
export async function POST() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (error) {
    console.error(
      "Supabase signOut error:",
      error instanceof Error ? error.message : "Unknown error"
    );
  }

  const response = NextResponse.json({ success: true, message: "Logged out successfully" });

  // Delete the gh_provider_token cookie with matching attributes
  response.cookies.set("gh_provider_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });

  return response;
}
