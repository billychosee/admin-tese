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
  const { isCollapsed, isMobileOpen, closeMobileSidebar } = useSidebar();
  const { theme } = useTheme();
  const { addToast } = useToast();
  const isDark = theme === "dark";

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

  const handleLogout = () => {
    document.cookie = `${AUTH_TOKEN_KEY}=; path=/; max-age=0`;
    localStorage.removeItem(AUTH_TOKEN_KEY);

    addToast({
      type: "info",
      title: "Signed Out",
      message: "You have been securely logged out",
    });

    router.push("/login");
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-[260px] transition-transform duration-300 lg:hidden flex flex-col border-r",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          sidebarBg,
          borderColor,
        )}
      >
        <div className="h-16 flex items-center justify-center border-b">
          <Image
            src={isDark ? "/Tese-Light-logo.png" : "/Tese-Dark-Logo.png"}
            alt="TESE"
            width={120}
            height={32}
          />
        </div>

        <Nav pathname={pathname} isCollapsed={false} />

        <Logout onLogout={handleLogout} collapsed={false} />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex fixed left-0 top-0 z-30 h-screen flex-col border-r transition-all duration-300",
          isCollapsed ? "w-[80px]" : "w-[260px]",
          sidebarBg,
          borderColor,
        )}
      >
        <div className="h-20 flex items-center justify-center border-b">
          {isCollapsed ? (
            <Image src="/Tese-Icon.png" alt="TESE" width={32} height={32} />
          ) : (
            <Image
              src={isDark ? "/Tese-Light-logo.png" : "/Tese-Dark-Logo.png"}
              alt="TESE"
              width={130}
              height={36}
            />
          )}
        </div>

        <Nav pathname={pathname} isCollapsed={isCollapsed} />

        <Logout onLogout={handleLogout} collapsed={isCollapsed} />
      </aside>
    </>
  );
}

/* ---------------- NAV COMPONENT ---------------- */

function Nav({
  pathname,
  isCollapsed,
}: {
  pathname: string;
  isCollapsed: boolean;
}) {
  return (
    <nav className="flex-1 mt-6 px-4 overflow-y-auto">
      <ul className="space-y-2">
        {SIDEBAR_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = Icons[item.icon as keyof typeof Icons];

          return (
            <li key={item.id}>
              <Link
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-4 py-3 rounded-2xl transition",
                  isActive
                    ? "bg-white shadow-sm"
                    : "hover:bg-[hsl(var(--surface-hover))]",
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-[hsl(var(--primary))] rounded-r" />
                )}

                <div
                  className={cn(
                    "flex items-center",
                    isCollapsed ? "w-full justify-center" : "pl-4",
                    isActive
                      ? "text-[hsl(var(--primary))]"
                      : "text-[hsl(var(--text-secondary))]",
                  )}
                >
                  {Icon && <Icon size={20} />}
                </div>

                {!isCollapsed && (
                  <span
                    className={cn(
                      "text-xs font-medium uppercase tracking-widest",
                      isActive
                        ? "text-[hsl(var(--text-primary))]"
                        : "text-[hsl(var(--text-secondary))]",
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
  );
}

/* ---------------- LOGOUT ---------------- */

function Logout({
  onLogout,
  collapsed,
}: {
  onLogout: () => void;
  collapsed: boolean;
}) {
  return (
    <div className="p-4 mt-auto border-t border-[hsl(var(--surface-border))]">
      <button
        onClick={onLogout}
        className={cn(
          "flex items-center gap-4 px-4 py-3 rounded-2xl w-full transition",
          "text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--danger)/0.1)]",
          collapsed && "justify-center",
        )}
      >
        <Icons.LogOut size={20} />
        {!collapsed && (
          <span className="text-xs font-black uppercase tracking-widest">
            Logout
          </span>
        )}
      </button>
    </div>
  );
}
