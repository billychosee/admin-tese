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
            className="relative flex h-10 w-10 items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            style={{ color: "hsl(var(--surface-muted-foreground))" }}
          >
            <Icons.Bell size={20} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-[hsl(var(--surface))] bg-red-500" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-3 border-b border-[hsl(var(--surface-border))] bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-widest">Notifications</h3>
                <button className="text-[10px] text-emerald-500 font-medium hover:text-emerald-600">
                  Mark all read
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto">
                <NotificationItem
                  icon={<Icons.Users size={16} className="text-emerald-500" />}
                  title="New creator registered"
                  description="John Doe has joined as a new creator"
                  time="2m ago"
                />
                <NotificationItem
                  icon={<Icons.Shield size={16} className="text-amber-500" />}
                  title="Security Alert"
                  description="Unusual login detected from new device"
                  time="1h ago"
                />
                <NotificationItem
                  icon={<Icons.DollarSign size={16} className="text-blue-500" />}
                  title="Payment received"
                  description="You received $250.00 from video revenue"
                  time="3h ago"
                />
                <NotificationItem
                  icon={<Icons.Star size={16} className="text-purple-500" />}
                  title="Featured video"
                  description="Your video is now trending #5"
                  time="5h ago"
                />
              </div>
              <Link
                href="/notifications"
                className="block w-full py-3 text-xs font-semibold text-center text-emerald-500 hover:bg-slate-50 dark:hover:bg-slate-800 border-t border-[hsl(var(--surface-border))] transition-colors"
              >
                View All
              </Link>
            </div>
          )}
        </div>

        <div className="h-4 w-[1px] bg-[hsl(var(--surface-border))]" />

        {/* Profile Section */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 rounded-2xl py-1.5 pl-1.5 pr-4 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/20">
              <span className="text-[11px] font-bold">TA</span>
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold leading-none">TESE Admin</p>
              <p className="mt-1 text-[10px] text-slate-400 font-medium">
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
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-[hsl(var(--surface-border))] bg-[hsl(var(--surface))] shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-3 border-b border-[hsl(var(--surface-border))] bg-slate-50/50 dark:bg-slate-800/50">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                  Account
                </p>
              </div>
              <div className="py-2">
                <DropdownLink
                  icon={<Icons.User size={18} />}
                  label="Profile"
                  href="/profile"
                />
                <DropdownLink
                  icon={<Icons.Settings size={18} />}
                  label="Settings"
                />
              </div>
              <div className="border-t border-[hsl(var(--surface-border))] py-2">
                <DropdownLink
                  icon={<Icons.LogOut size={18} />}
                  label="Sign out"
                  extraClass="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// Helper components for cleaner code
function NotificationItem({
  icon,
  title,
  description,
  time,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  time: string;
}) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer border-b border-[hsl(var(--surface-border)) / 0.5]">
      {icon && (
        <div className="flex-shrink-0 mt-0.5">
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">{title}</p>
        {description && (
          <p className="text-[10px] text-slate-400 mt-0.5 truncate">{description}</p>
        )}
        <p className="text-[10px] text-slate-400 mt-1">{time}</p>
      </div>
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
      <span className="text-xs font-semibold uppercase tracking-wide">
        {label}
      </span>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          "flex items-center gap-3 mx-2 px-4 py-2.5 rounded-xl transition-all duration-200",
          "hover:bg-slate-100 dark:hover:bg-slate-800/50",
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
        "flex items-center gap-3 mx-2 px-4 py-2.5 rounded-xl transition-all duration-200 w-[calc(100%-16px)]",
        "hover:bg-slate-100 dark:hover:bg-slate-800/50",
        extraClass,
      )}
    >
      {content}
    </button>
  );
}
