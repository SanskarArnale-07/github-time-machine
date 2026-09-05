"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    try {
      setLoading(true);

      // 1. Call server-side logout endpoint to clear httpOnly gh_provider_token cookie
      await fetch("/api/auth/logout", {
        method: "POST",
      }).catch((err) => {
        console.error("Server logout request failed:", err);
      });

      // 2. Clear client-side Supabase authentication state
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      // 3. Clear storage and navigate to home
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/";
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="font-mono"
      onClick={handleLogout}
      disabled={loading}
    >
      <LogOut className="mr-2 h-3.5 w-3.5" />
      {loading ? "Signing out..." : "Sign out"}
    </Button>
  );
}

