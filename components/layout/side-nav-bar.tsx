"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Clock, LayoutDashboard, BarChart3, GitCompare, Settings } from "lucide-react";

export function SideNavBar({ baseUrl = "/dashboard" }: { baseUrl?: string }) {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "timeline";

  const navItems = [
    { id: "repos", label: "Repositories", icon: LayoutDashboard },
    { id: "timeline", label: "Timeline", icon: Clock },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "compare", label: "Compare", icon: GitCompare },
  ];

  return (
    <aside className="w-64 flex flex-col border-r border-outline-variant bg-surface-container-lowest shrink-0 hidden md:flex min-h-[calc(100vh-64px)]">
      <div className="flex-1 py-6 px-4 space-y-1">
        <div className="text-xs font-mono text-outline mb-4 px-3 uppercase tracking-wider">
          Navigation
        </div>
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          const href = `${baseUrl}?tab=${item.id}`;

          return (
            <Link
              key={item.label}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-surface-bright text-primary font-medium shadow-sm border-l-2 border-primary"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface border-l-2 border-transparent"
              }`}
            >
              <item.icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-outline"}`} />
              {item.label}
            </Link>
          );
        })}
      </div>
      <div className="p-4 border-t border-outline-variant space-y-1">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors">
          <Settings className="h-4 w-4 text-outline" />
          Settings
        </button>
      </div>
    </aside>
  );
}
