"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/";
  }

  return (
    <Button variant="outline" size="sm" className="font-mono" onClick={handleLogout}>
      <LogOut className="mr-2 h-3.5 w-3.5" />
      Sign out
    </Button>
  );
}
