"use client";

import React, { useState } from "react";
import { cn } from "@/utils";
import { Icons } from "@/components/ui/Icons";

interface Notification {
  id: string;
  type: "user" | "security" | "payment" | "feature" | "system";
  title: string;
  description: string;
  time: string;
  read: boolean;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "user",
      title: "New creator registered",
      description: "John Doe has joined as a new creator",
      time: "2 minutes ago",
      read: false,
    },
    {
      id: "2",
      type: "security",
      title: "Security Alert",
      description: "Unusual login detected from new device in London, UK",
      time: "1 hour ago",
      read: false,
    },
    {
      id: "3",
      type: "payment",
      title: "Payment received",
      description: "You received $250.00 from video revenue",
      time: "3 hours ago",
      read: false,
    },
    {
      id: "4",
      type: "feature",
      title: "Featured video",
      description: "Your video is now trending #5 in your category",
      time: "5 hours ago",
      read: true,
    },
    {
      id: "5",
      type: "system",
      title: "System update completed",
      description: "Your account has been successfully updated to the latest version",
      time: "1 day ago",
      read: true,
    },
    {
      id: "6",
      type: "user",
      title: "New subscriber",
      description: "Sarah Smith subscribed to your channel",
      time: "2 days ago",
      read: true,
    },
    {
      id: "7",
      type: "payment",
      title: "Withdrawal completed",
      description: "$1,000.00 has been sent to your bank account",
      time: "3 days ago",
      read: true,
    },
    {
      id: "8",
      type: "feature",
      title: "Creator badge earned",
      description: "You've earned the 'Top Creator' badge",
      time: "1 week ago",
      read: true,
    },
  ]);

  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications;

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "user":
        return <Icons.Users size={18} className="text-emerald-500" />;
      case "security":
        return <Icons.Shield size={18} className="text-amber-500" />;
      case "payment":
        return <Icons.DollarSign size={18} className="text-blue-500" />;
      case "feature":
        return <Icons.Star size={18} className="text-purple-500" />;
      case "system":
        return <Icons.Bell size={18} className="text-slate-500" />;
      default:
        return <Icons.Bell size={18} className="text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-sm text-slate-500 mt-1">
            {unreadCount} unread notifications
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
            <button
              onClick={() => setFilter("all")}
              className={cn(
                "px-4 py-2 text-xs font-medium rounded-lg transition-colors",
                filter === "all"
                  ? "bg-white dark:bg-slate-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400",
              )}
            >
              All
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={cn(
                "px-4 py-2 text-xs font-medium rounded-lg transition-colors",
                filter === "unread"
                  ? "bg-white dark:bg-slate-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400",
              )}
            >
              Unread ({unreadCount})
            </button>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 text-xs font-medium text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 rounded-lg transition-colors"
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <Icons.Bell size={32} className="text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-500">
              {filter === "unread"
                ? "No unread notifications"
                : "No notifications yet"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => markAsRead(notification.id)}
                className={cn(
                  "flex items-start gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer",
                  !notification.read &&
                    "bg-emerald-50/30 dark:bg-emerald-900/5",
                )}
              >
                <div
                  className={cn(
                    "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center",
                    notification.read
                      ? "bg-slate-100 dark:bg-slate-800"
                      : "bg-white dark:bg-slate-800 shadow-sm",
                  )}
                >
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        notification.read
                          ? "text-slate-600 dark:text-slate-400"
                          : "text-slate-900 dark:text-white",
                      )}
                    >
                      {notification.title}
                    </p>
                    {!notification.read && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {notification.description}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-2">
                    {notification.time}
                  </p>
                </div>
                {!notification.read && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(notification.id);
                    }}
                    className="flex-shrink-0 p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Icons.Check size={14} className="text-slate-400" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
