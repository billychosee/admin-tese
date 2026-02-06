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

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  category: "in_app" | "email";
}

interface NotificationTemplate {
  id: string;
  type: string;
  label: string;
  subject: string;
  body: string;
}

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<"notifications" | "settings" | "templates">("notifications");
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

  const [settings, setSettings] = useState<NotificationSetting[]>([
    // In-App Notifications
    {
      id: "user_activity",
      title: "User Activity",
      description: "New followers, subscribers, and comments",
      enabled: true,
      category: "in_app",
    },
    {
      id: "payment_alerts",
      title: "Payment Alerts",
      description: "Revenue updates, withdrawals, and payouts",
      enabled: true,
      category: "in_app",
    },
    {
      id: "security_alerts",
      title: "Security Alerts",
      description: "Login attempts, password changes, and security events",
      enabled: true,
      category: "in_app",
    },
    {
      id: "feature_updates",
      title: "Feature Updates",
      description: "New features, tips, and platform announcements",
      enabled: false,
      category: "in_app",
    },
    {
      id: "system_notifications",
      title: "System Notifications",
      description: "Maintenance updates and system messages",
      enabled: true,
      category: "in_app",
    },
    // Email Notifications
    {
      id: "email_user_activity",
      title: "User Activity",
      description: "Daily digest of new followers and subscribers",
      enabled: true,
      category: "email",
    },
    {
      id: "email_payment_alerts",
      title: "Payment Alerts",
      description: "Email notifications for revenue and withdrawals",
      enabled: true,
      category: "email",
    },
    {
      id: "email_security_alerts",
      title: "Security Alerts",
      description: "Important security notifications via email",
      enabled: true,
      category: "email",
    },
    {
      id: "email_marketing",
      title: "Marketing Emails",
      description: "Promotions, tips, and product updates",
      enabled: false,
      category: "email",
    },
    {
      id: "email_newsletter",
      title: "Weekly Newsletter",
      description: "Platform news and creator highlights",
      enabled: false,
      category: "email",
    },
  ]);

  const [templates, setTemplates] = useState<NotificationTemplate[]>([
    {
      id: "new_subscriber",
      type: "user",
      label: "New Subscriber",
      subject: "🎉 New subscriber on your channel!",
      body: "Great news! {subscriber_name} just subscribed to your channel.\n\nKeep creating amazing content to grow your community!",
    },
    {
      id: "payment_received",
      type: "payment",
      label: "Payment Received",
      subject: "💰 Payment Received - ${amount}",
      body: "You've received a payment of ${amount} from your video revenue.\n\nThis will be reflected in your next payout.",
    },
    {
      id: "security_alert",
      type: "security",
      label: "Security Alert",
      subject: "⚠️ Security Alert: {event}",
      body: "We detected a new login to your account.\n\nDevice: {device}\nLocation: {location}\nTime: {time}\n\nIf this wasn't you, please secure your account immediately.",
    },
    {
      id: "featured_video",
      type: "feature",
      label: "Video Featured",
      subject: "🌟 Your video is trending!",
      body: "Congratulations! Your video \"{video_title}\" is now trending at position #{position} in {category}.\n\nKeep up the great work!",
    },
    {
      id: "withdrawal_complete",
      type: "payment",
      label: "Withdrawal Complete",
      subject: "✅ Withdrawal Complete - ${amount}",
      body: "Your withdrawal of ${amount} has been processed successfully.\n\nExpected arrival: {arrival_date}\nTransaction ID: {transaction_id}",
    },
  ]);

  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [templateForm, setTemplateForm] = useState({ subject: "", body: "" });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const toggleSetting = (id: string) => {
    setSettings((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)),
    );
  };

  const startEditingTemplate = (template: NotificationTemplate) => {
    setEditingTemplate(template.id);
    setTemplateForm({ subject: template.subject, body: template.body });
  };

  const saveTemplate = (id: string) => {
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, subject: templateForm.subject, body: templateForm.body } : t,
      ),
    );
    setEditingTemplate(null);
  };

  const cancelEditingTemplate = () => {
    setEditingTemplate(null);
    setTemplateForm({ subject: "", body: "" });
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
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header with Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Notifications</h1>
          <p className="text-sm text-slate-500 mt-1">
            {activeTab === "notifications" && `${unreadCount} unread notifications`}
            {activeTab === "settings" && "Configure your notification preferences"}
            {activeTab === "templates" && "Customize your notification messages"}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
            <button
              onClick={() => setActiveTab("notifications")}
              className={cn(
                "flex-1 sm:flex-none px-4 py-2 text-xs font-medium rounded-lg transition-colors",
                activeTab === "notifications"
                  ? "bg-white dark:bg-slate-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400",
              )}
            >
              <Icons.Bell size={14} className="inline mr-1.5" />
              Inbox
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={cn(
                "flex-1 sm:flex-none px-4 py-2 text-xs font-medium rounded-lg transition-colors",
                activeTab === "settings"
                  ? "bg-white dark:bg-slate-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400",
              )}
            >
              <Icons.Settings size={14} className="inline mr-1.5" />
              Settings
            </button>
            <button
              onClick={() => setActiveTab("templates")}
              className={cn(
                "flex-1 sm:flex-none px-4 py-2 text-xs font-medium rounded-lg transition-colors",
                activeTab === "templates"
                  ? "bg-white dark:bg-slate-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400",
              )}
            >
              <Icons.FileText size={14} className="inline mr-1.5" />
              Templates
            </button>
          </div>
        </div>
      </div>

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <>
          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
              <button
                onClick={() => setFilter("all")}
                className={cn(
                  "flex-1 sm:flex-none px-4 py-2 text-xs font-medium rounded-lg transition-colors",
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
                  "flex-1 sm:flex-none px-4 py-2 text-xs font-medium rounded-lg transition-colors",
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
                <Icons.CheckCircle size={14} className="inline mr-1.5" />
                Mark all read
              </button>
            )}
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
                      "flex items-start gap-3 p-4 sm:p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer",
                      !notification.read &&
                        "bg-emerald-50/30 dark:bg-emerald-900/5",
                    )}
                  >
                    <div
                      className={cn(
                        "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center",
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
                            "text-base font-medium",
                            notification.read
                              ? "text-slate-600 dark:text-slate-400"
                              : "text-slate-900 dark:text-white",
                          )}
                        >
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                        {notification.description}
                      </p>
                      <p className="text-xs text-slate-400 mt-2">
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
                        <Icons.Check size={16} className="text-slate-400" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Settings Tab */}
      {activeTab === "settings" && (
        <div className="space-y-8">
          {/* In-App Notifications */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <Icons.Bell size={20} className="text-blue-500" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">In-App Notifications</h2>
                  <p className="text-sm text-slate-500">
                    Manage which notifications you receive in the app
                  </p>
                </div>
              </div>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {settings
                .filter((s) => s.category === "in_app")
                .map((setting) => (
                  <div
                    key={setting.id}
                    className="flex items-center justify-between p-4 sm:p-6"
                  >
                    <div className="flex-1 pr-4">
                      <p className="text-sm font-medium">{setting.title}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {setting.description}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleSetting(setting.id)}
                      className={cn(
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                        setting.enabled
                          ? "bg-emerald-500"
                          : "bg-slate-200 dark:bg-slate-700",
                      )}
                    >
                      <span
                        className={cn(
                          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                          setting.enabled ? "translate-x-6" : "translate-x-1",
                        )}
                      />
                    </button>
                  </div>
                ))}
            </div>
          </div>

          {/* Email Notifications */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                  <Icons.Mail size={20} className="text-amber-500" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Email Notifications</h2>
                  <p className="text-sm text-slate-500">
                    Configure which notifications you receive via email
                  </p>
                </div>
              </div>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {settings
                .filter((s) => s.category === "email")
                .map((setting) => (
                  <div
                    key={setting.id}
                    className="flex items-center justify-between p-4 sm:p-6"
                  >
                    <div className="flex-1 pr-4">
                      <p className="text-sm font-medium">{setting.title}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {setting.description}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleSetting(setting.id)}
                      className={cn(
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                        setting.enabled
                          ? "bg-emerald-500"
                          : "bg-slate-200 dark:bg-slate-700",
                      )}
                    >
                      <span
                        className={cn(
                          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                          setting.enabled ? "translate-x-6" : "translate-x-1",
                        )}
                      />
                    </button>
                  </div>
                ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button className="px-6 py-2.5 bg-emerald-500 text-white text-sm font-medium rounded-xl hover:bg-emerald-600 transition-colors">
              <Icons.CheckCircle size={16} className="inline mr-2" />
              Save Preferences
            </button>
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === "templates" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                <Icons.FileText size={20} className="text-purple-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Notification Templates</h2>
                <p className="text-sm text-slate-500">
                  Customize the messages sent to your users
                </p>
              </div>
            </div>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {templates.map((template) => (
              <div key={template.id} className="p-4 sm:p-6">
                {editingTemplate === template.id ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">{template.label}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={cancelEditingTemplate}
                          className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => saveTemplate(template.id)}
                          className="px-3 py-1.5 text-xs font-medium bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        Subject
                      </label>
                      <input
                        type="text"
                        value={templateForm.subject}
                        onChange={(e) =>
                          setTemplateForm((prev) => ({
                            ...prev,
                            subject: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        Body
                      </label>
                      <textarea
                        value={templateForm.body}
                        onChange={(e) =>
                          setTemplateForm((prev) => ({
                            ...prev,
                            body: e.target.value,
                          }))
                        }
                        rows={4}
                        className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                      />
                    </div>
                    <p className="text-xs text-slate-400">
                      Available variables:{" "}
                      {template.type === "user" && "{subscriber_name}"}
                      {template.type === "payment" && "{amount}, {transaction_id}"}
                      {template.type === "security" && "{event}, {device}, {location}, {time}"}
                      {template.type === "feature" && "{video_title}, {position}, {category}"}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "w-2 h-2 rounded-full",
                            template.type === "user" && "bg-emerald-500",
                            template.type === "payment" && "bg-blue-500",
                            template.type === "security" && "bg-amber-500",
                            template.type === "feature" && "bg-purple-500",
                          )}
                        />
                        <h3 className="text-sm font-medium">{template.label}</h3>
                      </div>
                      <div className="mt-3 space-y-2">
                        <div className="text-xs">
                          <span className="font-medium text-slate-500">Subject: </span>
                          <span className="text-slate-700 dark:text-slate-300">
                            {template.subject}
                          </span>
                        </div>
                        <div className="text-xs">
                          <span className="font-medium text-slate-500">Body: </span>
                          <span className="text-slate-700 dark:text-slate-300 line-clamp-2">
                            {template.body}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => startEditingTemplate(template)}
                      className="flex-shrink-0 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Icons.Edit size={16} className="text-slate-400" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
