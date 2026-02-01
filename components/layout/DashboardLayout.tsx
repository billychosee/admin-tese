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
  "/categories": "Categories",
  "/creators": "Content Creators",
  "/videos": "Videos",
  "/featured": "Featured Creators",
  "/transactions": "Transactions",
  "/devices": "Devices & Sessions",
  "/notifications": "Notifications",
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
  const collapseBtnBg = "bg-[hsl(var(--surface))]";
  const collapseBtnBorder = "border-[hsl(var(--surface-border))]";
  const collapseBtnHover = "hover:bg-[hsl(var(--surface-hover))]";

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
      {/* Collapse Button - positioned at top, next to navbar */}
      <button
        onClick={toggleSidebar}
        className={cn(
          "fixed top-5 z-40 rounded-full p-2 transition-all duration-300 border-2",
          isCollapsed ? "left-[64px]" : "left-[244px]",
          collapseBtnBg,
          collapseBtnBorder,
          collapseBtnHover,
        )}
        style={{ color: "hsl(var(--text-secondary))" }}
      >
        {isCollapsed ? (
          <Icons.ChevronRight size={18} />
        ) : (
          <Icons.ChevronLeft size={18} />
        )}
      </button>
      <div
        className={cn(
          "min-h-screen transition-all duration-300 w-full flex flex-col",
          isCollapsed ? "ml-[80px]" : "ml-[260px]",
        )}
      >
        <TopBar title={title} />
        <main
          className="flex-1 p-6 w-full overflow-auto"
          style={{ backgroundColor: "hsl(var(--background))" }}
        >
          {children}
        </main>
        {/* Footer */}
        <footer
          className="px-6 py-3 text-xs text-center border-t"
          style={{
            borderColor: "hsl(var(--surface-border))",
            color: "hsl(var(--text-muted))",
            backgroundColor: "hsl(var(--surface))",
          }}
        >
          TESE {displayYear} © Copyright of TESE
        </footer>
      </div>
    </div>
  );
}
