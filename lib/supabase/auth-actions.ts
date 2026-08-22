"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

/**
 * Starts the GitHub OAuth flow. Supabase redirects the browser to GitHub,
 * then back to /auth/callback, which exchanges the code for a session
 * and forwards the user to /dashboard.
 */
export async function signInWithGithub() {
  const supabase = await createClient();
  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") || headersList.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const origin = `${protocol}://${host}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: `${origin}/auth/callback`,
      scopes: "read:user",
      queryParams: {
        prompt: "consent",
      },
    },
  });

  if (error) {
    console.error("Error initiating OAuth:", error.message);
    redirect("/?error=oauth_init_failed");
  }

  if (data?.url) {
    redirect(data.url);
  }
}
