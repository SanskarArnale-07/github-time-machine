"use client";

import { createClient } from "@/lib/supabase/client";

/**
 * Starts the GitHub OAuth flow. Supabase redirects the browser to GitHub,
 * then back to /auth/callback, which exchanges the code for a session
 * and forwards the user to /dashboard.
 */
export async function signInWithGithub() {
  const supabase = createClient();

  await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
}
