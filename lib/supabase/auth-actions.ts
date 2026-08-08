"use client";

import { createClient } from "@/lib/supabase/client";

/**
 * Starts the GitHub OAuth flow. Supabase redirects the browser to GitHub,
 * then back to /auth/callback, which exchanges the code for a session
 * and forwards the user to /dashboard.
 */
export async function signInWithGithub() {
  const supabase = await createClient();

  await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      queryParams: {
        prompt: "consent", // or 'select_account'
      },
    },
  });
}
