"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/utils";
import { useSidebar } from "@/components/providers/SidebarProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import { Icons } from "@/components/ui/Icons";
import { useToast } from "@/components/ui/Toast";
import { SIDEBAR_ITEMS, AUTH_TOKEN_KEY } from "@/constants";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isCollapsed } = useSidebar();
  const { theme } = useTheme();
  const { addToast } = useToast();
  const isDark = theme === "dark";

  // CSS Variable Palette
  const sidebarBg = "bg-[hsl(var(--surface-muted))]";
  const activeItemBackground = isDark
    ? "bg-[hsl(var(--surface-hover))]"
    : "bg-[hsl(var(--surface))]";
  const activeIconColor = "text-[hsl(var(--primary))]";
  const inactiveTextColor = "text-[hsl(var(--text-secondary))]";
  const borderColor = "border-[hsl(var(--surface-border))]";
  const hoverBg = "hover:bg-[hsl(var(--surface-hover))]";
  const logoutHover =
    "hover:bg-[hsl(var(--danger)/0.1)] hover:text-[hsl(var(--danger))]";

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-30 h-screen transition-all duration-300 ease-in-out flex flex-col border-r shadow-sm",
        isCollapsed ? "w-[80px]" : "w-[260px]",
        sidebarBg,
        borderColor,
      )}
    >
      {/* Header: TESE Logo */}
      <div
        className={cn(
          "flex h-20 items-center justify-center px-6 border-b transition-colors",
          borderColor,
        )}
      >
        <div className="relative flex items-center justify-center">
          {isCollapsed ? (
            <Image
              src="/Tese-Icon.png"
              alt="TESE Icon"
              width={32}
              height={32}
              className="rounded-lg"
            />
          ) : (
            <Image
              src={isDark ? "/Tese-Light-logo.png" : "/Tese-Dark-Logo.png"}
              alt="TESE Logo"
              width={130}
              height={35}
              className="object-contain"
            />
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-6 px-4">
        <ul className="space-y-2" role="list">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = Icons[item.icon as keyof typeof Icons];

            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-4 py-3 rounded-2xl transition-all duration-200",
                    isActive ? cn(activeItemBackground, "shadow-sm") : hoverBg,
                  )}
                >
                  {/* Left Accent Bar for Active State */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-[hsl(var(--primary))]" />
                  )}

                  <div
                    className={cn(
                      "flex items-center transition-colors",
                      isCollapsed ? "w-full justify-center" : "pl-4",
                      isActive ? activeIconColor : inactiveTextColor,
                      "group-hover:text-[hsl(var(--primary))]",
                    )}
                  >
                    {Icon && (
                      <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    )}
                  </div>

                  {!isCollapsed && (
                    <span
                      className={cn(
                        "text-xs font-semibold uppercase tracking-widest transition-colors",
                        isActive
                          ? "text-[hsl(var(--text-primary))]"
                          : inactiveTextColor,
                        "group-hover:text-[hsl(var(--primary))]",
                      )}
                    >
                      {item.label}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer: Logout */}
      <div className={cn("p-4 mt-auto border-t", borderColor)}>
        <button
          onClick={() => {
            document.cookie = `${AUTH_TOKEN_KEY}=; path=/; max-age=0`;
            localStorage.removeItem(AUTH_TOKEN_KEY);
            addToast({
              type: "info",
              title: "Signed Out",
              message: "You have been securely logged out",
            });
            router.push("/login");
          }}
          className={cn(
            "flex items-center gap-4 px-4 py-3 rounded-2xl w-full transition-all group",
            "text-[hsl(var(--text-secondary))]",
            logoutHover,
            isCollapsed && "justify-center",
          )}
        >
          <Icons.LogOut size={20} />
          {!isCollapsed && (
            <span className="text-xs font-black uppercase tracking-widest text-[hsl(var(--text-secondary))]">
              Logout
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}
