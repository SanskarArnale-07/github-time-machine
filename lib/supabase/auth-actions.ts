"use client";

import { createClient } from "@/lib/supabase/client";

const getURL = () => {
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_VERCEL_URL ??
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

  url = url.startsWith("http") ? url : `https://${url}`;
  url = url.replace(/\/$/, "");
  return url;
};

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
      redirectTo: `${getURL()}/auth/callback`,
      queryParams: {
        prompt: "consent",
      },
    },
  });
}
