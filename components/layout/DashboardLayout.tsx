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
  "/payouts": "Payouts",
  "/categories": "Categories",
  "/creators": "Content Creators",
  "/videos": "Videos",
  "/featured": "Featured Creators",
  "/transactions": "Transactions",
  "/devices": "Devices & Sessions",
  "/notifications": "Notifications",
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

      {/* Desktop collapse button - hidden on mobile */}
      <button
        onClick={toggleSidebar}
        className={cn(
          "hidden lg:fixed lg:top-5 lg:z-40 lg:rounded-full lg:p-2 lg:transition-all lg:duration-300 lg:border-2",
          isCollapsed ? "lg:left-[64px]" : "lg:left-[244px]",
          collapseBtnBg,
          collapseBtnBorder,
          collapseBtnHover,
        )}
        style={{ color: "hsl(var(--text-secondary))" }}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <Icons.ChevronRight size={18} />
        ) : (
          <Icons.ChevronLeft size={18} />
        )}
      </button>
    </div>
  );
}
