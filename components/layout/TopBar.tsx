"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/utils";
import { useTheme } from "@/components/providers/ThemeProvider";
import { Icons } from "@/components/ui/Icons";

interface TopBarProps {
  title: string;
}

export function TopBar({ title }: TopBarProps) {
  const { theme, toggleTheme } = useTheme();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setShowProfileMenu(false);
      }
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      className="sticky top-0 z-20 flex h-16 items-center justify-between px-8 backdrop-blur-md transition-all duration-300"
      style={{
        backgroundColor: "hsl(var(--surface) / 0.85)", // Slightly more transparent for glass effect
        borderBottom: "1px solid hsl(var(--surface-border) / 0.5)",
      }}
    >
      {/* Left side - Search only */}
      <div className="relative hidden lg:block">
        <Icons.Search
          className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40"
          size={16}
        />
        <input
          type="search"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-9 w-64 rounded-full pl-10 pr-4 text-xs font-medium outline-none transition-all focus:ring-2 focus:ring-primary/20"
          style={{
            border: "1px solid hsl(var(--surface-border))",
            backgroundColor: "hsl(var(--surface-muted) / 0.3)",
            color: "hsl(var(--surface-foreground))",
          }}
        />
      </div>

      {/* Right side - Theme toggle, notifications, divider, profile */}
      <div className="flex items-center gap-5">
        <button
          onClick={toggleTheme}
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          style={{ color: "hsl(var(--surface-muted-foreground))" }}
        >
          {theme === "dark" ? (
            <Icons.Sun size={20} />
          ) : (
            <Icons.Moon size={20} />
          )}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            style={{ color: "hsl(var(--surface-muted-foreground))" }}
          >
            <Icons.Bell size={20} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-[hsl(var(--surface))] bg-red-500" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-3 border-b border-[hsl(var(--surface-border))]">
                <h3 className="text-sm font-bold">Notifications</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                <NotificationItem
                  title="New creator registered"
                  time="2m ago"
                />
                <NotificationItem title="Security Alert" time="1h ago" />
              </div>
              <button className="w-full py-2 text-xs font-semibold text-primary-500 hover:bg-slate-50 dark:hover:bg-slate-900 border-t border-[hsl(var(--surface-border))]">
                View All
              </button>
            </div>
          )}
        </div>

        <div className="h-4 w-[1px] bg-[hsl(var(--surface-border))]" />

        {/* Profile Section */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 rounded-full py-1 pl-1 pr-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-md shadow-primary/20">
              <span className="text-[11px] font-bold">TA</span>
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold leading-none">TESE Admin</p>
              <p className="mt-1 text-[10px] text-slate-500 font-medium">
                admin@tese.com
              </p>
            </div>
            <Icons.ChevronDown
              size={14}
              className={cn(
                "transition-transform opacity-50",
                showProfileMenu && "rotate-180",
              )}
            />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] shadow-2xl py-2 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-[hsl(var(--surface-border))] mb-1">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                  Account
                </p>
              </div>
              <DropdownLink
                icon={<Icons.User size={15} />}
                label="Profile"
                href="/profile"
              />
              <DropdownLink
                icon={<Icons.Settings size={15} />}
                label="Settings"
              />
              <div className="my-1 border-t border-[hsl(var(--surface-border))]" />
              <DropdownLink
                icon={<Icons.LogOut size={15} />}
                label="Sign out"
                extraClass="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10"
              />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// Helper components for cleaner code
function NotificationItem({ title, time }: { title: string; time: string }) {
  return (
    <div className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer border-b border-[hsl(var(--surface-border)) / 0.5]">
      <p className="text-xs font-medium">{title}</p>
      <p className="text-[10px] text-slate-500 mt-0.5">{time}</p>
    </div>
  );
}

function DropdownLink({
  icon,
  label,
  extraClass,
  href,
}: {
  icon: any;
  label: string;
  extraClass?: string;
  href?: string;
}) {
  const content = (
    <>
      {icon}
      <span>{label}</span>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          "flex w-full items-center gap-3 px-4 py-2 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors",
          extraClass,
        )}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      className={cn(
        "flex w-full items-center gap-3 px-4 py-2 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors",
        extraClass,
      )}
    >
      {content}
    </button>
  );
}
