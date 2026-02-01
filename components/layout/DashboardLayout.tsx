"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { useSidebar } from "@/components/providers/SidebarProvider";
import { cn } from "@/utils";
import { SIDEBAR_WIDTH } from "@/constants";
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
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const [mounted, setMounted] = useState(false);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    setMounted(true);
  }, []);

  const title = "Dashboard";

  if (!mounted) {
    return null;
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
          "bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700",
        )}
        style={{ color: "hsl(var(--surface-muted-foreground))" }}
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
        <main className="flex-1 p-6 w-full overflow-auto">{children}</main>
        {/* Footer */}
        <footer
          className="px-6 py-3 text-xs text-center border-t"
          style={{
            borderColor: "hsl(var(--surface-border))",
            color: "hsl(var(--surface-muted-foreground))",
          }}
        >
          TESE {currentYear} © Copyright of TESE
        </footer>
      </div>
    </div>
  );
}
