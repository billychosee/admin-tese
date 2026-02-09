"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
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
  const borderColor = "border-[hsl(var(--surface-border))]";

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
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Mobile */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-[260px] transition-transform duration-300 lg:hidden flex flex-col border-r",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          sidebarBg,
          borderColor,
        )}
      >
        <Header collapsed={false} isDark={isDark} />
        <Nav pathname={pathname} isCollapsed={false} />
        <Logout onLogout={handleLogout} collapsed={false} />
      </aside>

      {/* Desktop */}
      <aside
        className={cn(
          "hidden lg:flex fixed left-0 top-0 z-30 h-screen flex-col border-r transition-all duration-300",
          isCollapsed ? "w-[80px]" : "w-[260px]",
          sidebarBg,
          borderColor,
        )}
      >
        <Header collapsed={isCollapsed} isDark={isDark} />
        <Nav pathname={pathname} isCollapsed={isCollapsed} />
        <Logout onLogout={handleLogout} collapsed={isCollapsed} />
      </aside>
    </>
  );
}

/* ---------------- HEADER ---------------- */

function Header({ collapsed, isDark }: any) {
  return (
    <div className="h-20 flex items-center justify-center border-b">
      {collapsed ? (
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
  );
}

/* ---------------- NAV ---------------- */

function Nav({
  pathname,
  isCollapsed,
}: {
  pathname: string;
  isCollapsed: boolean;
}) {
  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1] as const,
      },
    }),
  };

  return (
    <nav className="flex-1 mt-6 px-4 overflow-y-auto">
      <ul className="space-y-2">
        {SIDEBAR_ITEMS.map((item, index) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = Icons[item.icon as keyof typeof Icons];

          return (
            <motion.li
              key={item.id}
              custom={index}
              initial="hidden"
              animate="visible"
              variants={variants}
            >
              <Link
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-4 py-3 rounded-2xl overflow-hidden",
                  "transition-all duration-300 ease-out active:scale-[0.97]",
                  isActive
                    ? "bg-white shadow-sm"
                    : "hover:bg-[hsl(var(--surface-hover))]",
                )}
              >
                {/* Animated left bar */}
                <motion.span
                  className={cn(
                    "absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r bg-[hsl(var(--primary))]",
                  )}
                  initial={{ height: 0, opacity: 0 }}
                  animate={
                    isActive
                      ? { height: "1.5rem", opacity: 1 }
                      : { height: 0, opacity: 0 }
                  }
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />

                <motion.div
                  className={cn(
                    "flex items-center transition-all duration-300",
                    isCollapsed ? "w-full justify-center" : "pl-4",
                    isActive
                      ? "text-[hsl(var(--primary))]"
                      : "text-[hsl(var(--text-secondary))]",
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {Icon && <Icon size={20} />}
                </motion.div>

                {!isCollapsed && (
                  <motion.span
                    className={cn(
                      "text-xs font-medium uppercase tracking-widest transition-colors duration-300",
                      isActive
                        ? "text-[hsl(var(--text-primary))]"
                        : "text-[hsl(var(--text-secondary))]",
                    )}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </Link>
            </motion.li>
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
      <motion.button
        onClick={onLogout}
        className={cn(
          "flex items-center gap-4 px-4 py-3 rounded-2xl w-full",
          "transition-all duration-300",
          "text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--danger)/0.1)]",
          collapsed && "justify-center",
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.3 }}>
          <Icons.LogOut size={20} />
        </motion.div>
        {!collapsed && (
          <motion.span
            className="text-xs font-black uppercase tracking-widest"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            Logout
          </motion.span>
        )}
      </motion.button>
    </div>
  );
}
