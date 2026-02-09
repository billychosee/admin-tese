"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { useSidebar } from "@/components/providers/SidebarProvider";
import { cn } from "@/utils";
import { Icons } from "@/components/ui/Icons";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/channels": "Channels",
  "/payouts": "Payouts",
  "/categories": "Categories",
  "/creators": "Content Creators",
  "/videos": "Videos",
  "/featured": "Featured Creators",
  "/transactions": "Transactions",
  "/devices": "Devices & Sessions",
  "/notifications": "Notifications",
  "/profile": "Profile",
  "/playlists": "Playlists",
  "/settings": "Settings",
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const [mounted, setMounted] = useState(false);
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
    setCurrentYear(new Date().getFullYear());
  }, []);

  // Use page title from mapping
  const title = pageTitles[pathname] || "Dashboard";

  // Use fixed year during SSR to avoid hydration mismatch
  const serverYear = 2025;
  const displayYear = currentYear || serverYear;

  // CSS Variables
  const sidebarBg = "bg-[hsl(var(--surface-muted))]";
  const skeletonBg = "bg-[hsl(var(--surface-muted))]";

  if (!mounted) {
    return (
      <div className="min-h-screen flex">
        <div
          className={cn(
            "w-[260px] h-screen border-r",
            sidebarBg,
            "border-[hsl(var(--surface-border))]",
          )}
        />
        <div className="flex-1 ml-[260px]">
          <div className="h-16" />
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              <div className={cn("h-8 rounded w-1/4", skeletonBg)} />
              <div className={cn("h-32 rounded", skeletonBg)} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar />

      {/* Main content area */}
      <div
        className={cn(
          "min-h-screen transition-all duration-300 w-full flex flex-col",
          // Desktop: account for sidebar width
          "lg:ml-[260px]",
          isCollapsed && "lg:ml-[80px]",
        )}
      >
        <TopBar title={title} />

        <main
          className="flex-1 p-4 lg:p-6 w-full overflow-auto"
          style={{ backgroundColor: "hsl(var(--background))" }}
        >
          {children}
        </main>

        {/* Footer */}
        <footer
          className="px-4 lg:px-6 py-3 text-xs text-center lg:text-left border-t"
          style={{
            borderColor: "hsl(var(--surface-border))",
            color: "hsl(var(--text-muted))",
            backgroundColor: "hsl(var(--surface))",
          }}
        >
          <span className="lg:hidden">TESE {displayYear} ©</span>
          <span className="hidden lg:inline">
            TESE {displayYear} © Copyright of TESE
          </span>
        </footer>
      </div>

      {/* Rounded collapse button on the fine line between sidebar and main content */}
      <div
        className={cn(
          "hidden lg:block lg:fixed lg:top-[3.5%] lg:-translate-y-1/2 lg:z-50 lg:rounded-full lg:p-1.5 lg:transition-all lg:duration-300 lg:shadow-lg",
          // Position exactly on the sidebar edge: 260px expanded, 80px collapsed
          isCollapsed ? "lg:left-[64px]" : "lg:left-[244px]",
          "bg-[hsl(var(--primary))] text-white hover:opacity-90",
        )}
      >
        <button
          onClick={toggleSidebar}
          className="w-full h-full flex items-center justify-center rounded-full transition-opacity"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <Icons.ChevronRight size={20} />
          ) : (
            <Icons.ChevronLeft size={20} />
          )}
        </button>
      </div>
    </div>
  );
}
