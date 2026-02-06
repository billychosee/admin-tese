"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardTitle } from "@/components/ui/Card";
import { SkeletonStats, SkeletonChart } from "@/components/ui/Skeleton";
import { Icons } from "@/components/ui/Icons";
import { cn, formatCurrency, formatNumber } from "@/utils";
import { api } from "@/services/api";
import { useTheme } from "@/components/providers/ThemeProvider";
import TransactionRevenueChart from "@/components/ui/TransactionRevenueChart";

type Range = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

type WidgetType =
  | "stats"
  | "transactions"
  | "visitors"
  | "activity"
  | "geographic"
  | "realtime";

// Widget configuration type
type WidgetConfig = {
  id: WidgetType;
  title: string;
  visible: boolean;
  size: "small" | "medium" | "large";
};

type GraphPoint = {
  label: string;
  value: number;
};

/** * ULTRA-SMOOTH GLOWING GRAPH */
const AreaChart = ({
  data,
  color = "#10b981",
  id,
}: {
  data: GraphPoint[];
  color?: string;
  id: string;
}) => {
  if (!data.length) return null;
  const max = Math.max(...data.map((d) => d.value), 1);
  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * 100,
    y: 100 - (d.value / max) * 70,
  }));

  let d = `M ${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const midX = (points[i].x + points[i + 1].x) / 2;
    d += ` C ${midX},${points[i].y} ${midX},${points[i + 1].y} ${points[i + 1].x},${points[i + 1].y}`;
  }

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="h-full w-full overflow-visible"
    >
      <defs>
        <linearGradient id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d} L 100,100 L 0,100 Z`} fill={`url(#grad-${id})`} />
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        className="drop-shadow-lg"
      />
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="1.5"
          fill="white"
          stroke={color}
          strokeWidth="1"
        />
      ))}
    </svg>
  );
};

export default function DashboardPage() {
  const { theme } = useTheme();
  const [range, setRange] = useState<Range>("MONTHLY");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [realtimeVisitors, setRealtimeVisitors] = useState(0);
  const [widgets, setWidgets] = useState<WidgetConfig[]>([
    { id: "stats", title: "Key Metrics", visible: true, size: "large" },
    {
      id: "transactions",
      title: "Transaction Revenue",
      visible: true,
      size: "medium",
    },
    {
      id: "visitors",
      title: "Daily Visitors & Views",
      visible: true,
      size: "medium",
    },
    { id: "activity", title: "Creator Activity", visible: true, size: "small" },
    {
      id: "geographic",
      title: "Geographic Analytics",
      visible: true,
      size: "medium",
    },
    { id: "realtime", title: "Real-time Stats", visible: true, size: "small" },
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealtimeVisitors((prev) => prev + Math.floor(Math.random() * 5) - 2);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    api.dashboard.getOverview(range).then((res) => {
      setData(res);
      setRealtimeVisitors(Math.floor(res.totals.visitors / 24));
      setLoading(false);
    });
  }, [range]);

  // Export report as CSV
  const exportCSVReport = () => {
    if (!data) return;
    const headers = ["Metric", "Value"];
    const rows = [
      ["Total Creators", data.totals.creators],
      ["Total Videos", data.totals.videos],
      ["Total Channels", data.totals.channels],
      ["Total Views", data.totals.views],
      ["Total Visitors", data.totals.visitors],
      ["Report Range", range],
      ["Generated At", new Date().toISOString()],
    ];

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `dashboard-report-${range.toLowerCase()}-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  // Export report as JSON
  const exportJSONReport = () => {
    if (!data) return;
    const report = {
      metadata: {
        range,
        generatedAt: new Date().toISOString(),
        version: "1.0",
      },
      totals: data.totals,
      transactions: data.transactions,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `dashboard-report-${range.toLowerCase()}-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
  };

  // Toggle widget visibility
  const toggleWidget = (widgetId: WidgetType) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === widgetId ? { ...w, visible: !w.visible } : w)),
    );
  };

  // Widget visibility helper
  const isWidgetVisible = (widgetId: WidgetType) =>
    widgets.find((w) => w.id === widgetId)?.visible ?? true;

  const isDark = theme === "dark";

  // Color tokens for consistent theming
  const colors = {
    background: "bg-[hsl(var(--background))]",
    surface: "bg-[hsl(var(--surface))]",
    surfaceMuted: "bg-[hsl(var(--surface-muted))]",
    surfaceHover: "bg-[hsl(var(--surface-hover))]",
    surfaceBorder: "border-[hsl(var(--surface-border))]",
    textPrimary: "text-[hsl(var(--text-primary))]",
    textSecondary: "text-[hsl(var(--text-secondary))]",
    textMuted: "text-[hsl(var(--text-muted))]",
    primary: "bg-[hsl(var(--primary))]",
    primaryText: "text-[hsl(var(--primary))]",
    primaryForeground: "text-[hsl(var(--primary-foreground))]",
    success: "bg-[hsl(var(--success))]",
    successText: "text-[hsl(var(--success))]",
    warning: "bg-[hsl(var(--warning))]",
    warningText: "text-[hsl(var(--warning))]",
    danger: "bg-[hsl(var(--danger))]",
    dangerText: "text-[hsl(var(--danger))]",
    info: "bg-[hsl(var(--info))]",
    focusRing: "focus:ring-[hsl(var(--focus-ring))]",
  };

  if (loading)
    return (
      <div
        className={cn(
          "space-y-8 min-h-screen font-sans",
          isDark ? "bg-[#020617]" : "bg-[#F1F5F9]",
        )}
      >
        <SkeletonStats count={4} />
        <SkeletonChart />
      </div>
    );

  return (
    <div
      className={cn(
        "space-y-8 min-h-screen font-sans transition-colors duration-300",
        colors.background,
      )}
    >
      {/* HEADER WITH RANGE SELECTOR AND REPORT BUTTONS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className={cn("text-2xl font-bold", colors.textPrimary)}>Dashboard</h1>
          <p className={cn("text-sm", colors.textMuted)}>
            Welcome back! Here's what's happening with your platform.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Range Selector */}
          <div className="relative">
            <select
              value={range}
              onChange={(e) => setRange(e.target.value as Range)}
              className={cn(
                "h-10 pl-3 pr-8 rounded-lg border text-sm font-medium appearance-none cursor-pointer transition-colors",
                colors.surfaceBorder,
                colors.surface,
                colors.textPrimary,
                "hover:shadow-md",
              )}
              style={{ backgroundImage: "none" }}
            >
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
              <option value="YEARLY">Yearly</option>
            </select>
            <div
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none",
                colors.textMuted,
              )}
            >
              <Icons.ChevronDown size={16} />
            </div>
          </div>

          {/* Customize Dashboard Button */}
          <button
            onClick={() => setShowCustomizeModal(true)}
            className={cn(
              "h-10 px-4 rounded-lg border text-sm font-medium transition-colors flex items-center gap-2",
              colors.surfaceBorder,
              colors.surface,
              colors.textPrimary,
              "hover:shadow-md",
            )}
          >
            <Icons.Settings size={16} />
            Customize
          </button>

          {/* Export Report Button */}
          <button
            onClick={() => setShowReportModal(true)}
            className={cn(
              "h-10 px-4 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
              isDark
                ? "bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/80"
                : "bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/80",
            )}
            style={{ color: "hsl(var(--primary-foreground))" }}
          >
            <Icons.Download size={16} />
            Export Report
          </button>
        </div>
      </div>

      {/* REPORT GENERATION MODAL */}
      {showReportModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "hsl(0 0% 0% / 0.6)" }}
          onClick={() => setShowReportModal(false)}
        >
          <div
            className={cn(
              "rounded-2xl p-6 w-full max-w-md shadow-strong animate-scale-in",
              colors.surface,
              colors.surfaceBorder,
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className={cn("text-lg font-semibold", colors.textPrimary)}>
                Generate Report
              </h2>
              <button
                onClick={() => setShowReportModal(false)}
                className={cn(
                  "p-1 rounded-lg hover:bg-opacity-10 hover:bg-gray-500",
                  colors.textMuted,
                )}
              >
                <Icons.X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label
                  className={cn("block text-sm font-medium mb-2", colors.textPrimary)}
                >
                  Select Date Range
                </label>
                <div className="relative">
                  <select
                    value={range}
                    onChange={(e) => setRange(e.target.value as Range)}
                    className={cn(
                      "w-full h-10 pl-3 pr-8 rounded-lg border text-sm font-medium appearance-none cursor-pointer transition-colors",
                      colors.surfaceBorder,
                      colors.surface,
                      colors.textPrimary,
                    )}
                    style={{ backgroundImage: "none" }}
                  >
                    <option value="DAILY">Last 24 Hours</option>
                    <option value="WEEKLY">Last 7 Days</option>
                    <option value="MONTHLY">Last 30 Days</option>
                    <option value="YEARLY">Last 12 Months</option>
                  </select>
                  <div
                    className={cn(
                      "absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none",
                      colors.textMuted,
                    )}
                  >
                    <Icons.ChevronDown size={16} />
                  </div>
                </div>
              </div>
              <div>
                <label
                  className={cn("block text-sm font-medium mb-2", colors.textPrimary)}
                >
                  Report Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={exportCSVReport}
                    className={cn(
                      "p-4 rounded-xl border transition-all hover:shadow-md flex flex-col items-center gap-2",
                      colors.surfaceBorder,
                      colors.surface,
                      colors.textPrimary,
                    )}
                  >
                    <Icons.FileText size={24} />
                    <span className="text-sm font-medium">CSV Report</span>
                  </button>
                  <button
                    onClick={exportJSONReport}
                    className={cn(
                      "p-4 rounded-xl border transition-all hover:shadow-md flex flex-col items-center gap-2",
                      colors.surfaceBorder,
                      colors.surface,
                      colors.textPrimary,
                    )}
                  >
                    <Icons.Database size={24} />
                    <span className="text-sm font-medium">JSON Report</span>
                  </button>
                </div>
              </div>
              <p className={cn("text-xs", colors.textMuted)}>
                Reports include platform metrics, transaction data, and user
                statistics.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOMIZE DASHBOARD MODAL */}
      {showCustomizeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "hsl(0 0% 0% / 0.6)" }}
          onClick={() => setShowCustomizeModal(false)}
        >
          <div
            className={cn(
              "rounded-2xl p-6 w-full max-w-md shadow-strong animate-scale-in",
              colors.surface,
              colors.surfaceBorder,
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className={cn("text-lg font-semibold", colors.textPrimary)}>
                Customize Dashboard
              </h2>
              <button
                onClick={() => setShowCustomizeModal(false)}
                className={cn(
                  "p-1 rounded-lg hover:bg-opacity-10 hover:bg-gray-500",
                  colors.textMuted,
                )}
              >
                <Icons.X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              {widgets.map((widget) => (
                <div
                  key={widget.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border",
                    colors.surfaceBorder,
                    colors.surface,
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full",
                        widget.visible
                          ? "bg-[hsl(var(--success))]"
                          : "bg-[hsl(var(--text-muted))]",
                      )}
                    />
                    <span
                      className={cn("text-sm font-medium", colors.textPrimary)}
                    >
                      {widget.title}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleWidget(widget.id)}
                    className={cn(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                      widget.visible
                        ? "bg-[hsl(var(--primary))]"
                        : "bg-[hsl(var(--surface-border))]",
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                        widget.visible ? "translate-x-6" : "translate-x-1",
                      )}
                    />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t flex justify-end gap-2">
              <button
                onClick={() => setShowCustomizeModal(false)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  colors.textMuted,
                  "hover:bg-opacity-10 hover:bg-gray-500",
                )}
              >
                Cancel
              </button>
              <button
                onClick={() => setShowCustomizeModal(false)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  isDark
                    ? "bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/80"
                    : "bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/80",
                )}
                style={{ color: "hsl(var(--primary-foreground))" }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REAL-TIME STATS WIDGET */}
      {isWidgetVisible("realtime") && (
        <div
          className={cn(
            "rounded-2xl border p-4 flex items-center justify-between",
            colors.surfaceBorder,
            colors.surface,
          )}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className={cn(
                  "w-3 h-3 rounded-full animate-pulse",
                  isDark
                    ? "bg-[hsl(var(--success))]"
                    : "bg-[hsl(var(--success))]",
                )}
                style={{ boxShadow: "0 0 0 4px hsl(var(--success) / 0.2)" }}
              />
            </div>
            <div>
              <span
                className={cn(
                  "text-xs font-medium uppercase tracking-wider",
                  colors.textMuted,
                )}
              >
                Real-time Visitors
              </span>
              <div
                className={cn(
                  "text-2xl font-bold flex items-center gap-2",
                  colors.textPrimary,
                )}
              >
                {formatNumber(realtimeVisitors)}
                <span className={cn("text-xs font-normal", colors.successText)}>
                  +{Math.floor(realtimeVisitors * 0.15)}%
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn("text-xs", colors.textMuted)}>
              Live updates every 3s
            </span>
            <Icons.Activity size={16} className={colors.textMuted} />
          </div>
        </div>
      )}

      {/* 1. TOP STATS CARDS - Key Metrics */}
      {isWidgetVisible("stats") && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Total Creators",
              value: formatNumber(data.totals.creators),
              icon: <Icons.Users size={20} />,
              href: "/creators",
            },
            {
              label: "Total Videos",
              value: formatNumber(data.totals.videos),
              icon: <Icons.Video size={20} />,
              href: "/videos",
            },
            {
              label: "Total Channels",
              value: formatNumber(data.totals.channels),
              icon: <Icons.Grid size={20} />,
              href: "/creators",
            },
            {
              label: "Total Views",
              value: formatNumber(data.totals.views),
              icon: <Icons.Eye size={20} />,
              href: "/videos",
            },
          ].map((card, i) => (
            <Link
              key={i}
              href={card.href}
              className={cn(
                "rounded-2xl border p-5 transition-all duration-300 hover:shadow-lg",
                colors.surfaceBorder,
                colors.surface,
              )}
            >
              <div className="flex flex-col">
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "text-xs font-medium uppercase tracking-wider",
                      colors.textMuted,
                    )}
                  >
                    {card.label}
                  </span>
                  <div
                    className={cn(
                      "p-2 rounded-lg",
                      isDark
                        ? "bg-[hsl(var(--primary))]/20"
                        : "bg-[hsl(var(--primary))]/10",
                    )}
                  >
                    <span className={cn("text-[hsl(var(--primary))]")}>
                      {card.icon}
                    </span>
                  </div>
                </div>
                <h3
                  className={cn("text-2xl font-bold mt-3", colors.textPrimary)}
                >
                  {card.value}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* 2. MAIN ANALYTICS ROW - Transactions & Daily Stats */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* TRANSACTIONS CHART */}
        {isWidgetVisible("transactions") && (
          <Card
            className={cn(
              "lg:col-span-2 rounded-2xl border transition-colors duration-300",
              colors.surfaceBorder,
              colors.surface,
            )}
          >
            <CardContent className="p-6">
              <h3
                className={cn("text-lg font-semibold mb-4", colors.textPrimary)}
              >
                Transaction Revenue
              </h3>
              <TransactionRevenueChart />
            </CardContent>
          </Card>
        )}

        {/* DAILY VISITORS & VIEWS */}
        {isWidgetVisible("visitors") && (
          <Card
            className={cn(
              "rounded-2xl border flex flex-col transition-colors duration-300",
              colors.surfaceBorder,
              colors.surface,
            )}
          >
            <CardContent className="p-5">
              <h3
                className={cn("text-sm font-semibold mb-4", colors.textPrimary)}
              >
                Daily Visitors & Views
              </h3>
              <div className="relative h-48 w-48 mx-auto">
                <svg
                  viewBox="0 0 36 36"
                  className="w-full h-full transform -rotate-90"
                >
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9"
                    fill="none"
                    stroke={isDark ? "#334155" : "#e2e8f0"}
                    strokeWidth="3"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeDasharray="100"
                    strokeDashoffset="35"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9"
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="3"
                    strokeDasharray="100"
                    strokeDashoffset="85"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span
                    className={cn("text-3xl font-bold", colors.textPrimary)}
                  >
                    {formatNumber(data.totals.visitors)}
                  </span>
                  <span
                    className={cn(
                      "text-xs font-medium uppercase",
                      colors.textMuted,
                    )}
                  >
                    Visitors/Day
                  </span>
                </div>
              </div>
              <div className="w-full space-y-3 mt-6">
                <div
                  className={cn(
                    "flex justify-between items-center p-3 rounded-lg transition-colors duration-300",
                    isDark
                      ? "bg-[hsl(var(--success))]/10"
                      : "bg-[hsl(var(--success))]/10",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--success))]" />
                    <span
                      className={cn("text-xs font-medium", colors.textMuted)}
                    >
                      Views/Day
                    </span>
                  </div>
                  <span
                    className={cn("text-xs font-semibold", colors.successText)}
                  >
                    {formatNumber(Math.round(data.totals.views / 365))}
                  </span>
                </div>
                <div
                  className={cn(
                    "flex justify-between items-center p-3 rounded-lg transition-colors duration-300",
                    isDark
                      ? "bg-[hsl(var(--danger))]/10"
                      : "bg-[hsl(var(--danger))]/10",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--danger))]" />
                    <span
                      className={cn("text-xs font-medium", colors.textMuted)}
                    >
                      Visitors/Day
                    </span>
                  </div>
                  <span
                    className={cn("text-xs font-semibold", colors.dangerText)}
                  >
                    {formatNumber(data.totals.visitors)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 3. GEOGRAPHIC ANALYTICS */}
      {isWidgetVisible("geographic") && (
        <Card
          className={cn(
            "rounded-2xl border transition-colors duration-300",
            colors.surfaceBorder,
            colors.surface,
          )}
        >
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className={cn("text-lg font-semibold", colors.textPrimary)}>
                Geographic Analytics
              </h3>
              <span
                className={cn("text-xs font-medium px-2 py-1 rounded-lg", colors.textMuted)}
              >
                Viewer Locations
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { country: "United States", views: 45230, percentage: 35, flag: "🇺🇸" },
                { country: "United Kingdom", views: 28450, percentage: 22, flag: "🇬🇧" },
                { country: "Germany", views: 18920, percentage: 15, flag: "🇩🇪" },
                { country: "Canada", views: 15430, percentage: 12, flag: "🇨🇦" },
                { country: "France", views: 12890, percentage: 10, flag: "🇫🇷" },
                { country: "Australia", views: 8760, percentage: 6, flag: "🇦🇺" },
              ].map((location, i) => (
                <div
                  key={i}
                  className={cn(
                    "p-4 rounded-xl border transition-all hover:shadow-md",
                    colors.surfaceBorder,
                    isDark
                      ? "hover:bg-[hsl(var(--surface-hover))]/30"
                      : "hover:bg-[hsl(var(--surface-hover))]",
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{location.flag}</span>
                    <span className={cn("text-sm font-medium", colors.textPrimary)}>
                      {location.country}
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className={cn("text-lg font-bold", colors.textPrimary)}>
                      {formatNumber(location.views)}
                    </span>
                    <div className="flex items-center gap-1">
                      <div
                        className={cn("h-1.5 rounded-full bg-[hsl(var(--primary))]",)}
                        style={{ width: `${location.percentage * 2}px` }}
                      />
                      <span className={cn("text-xs", colors.textMuted)}>
                        {location.percentage}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 4. BOTTOM SECTION - Activity & Recent Transactions */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* CREATOR ACTIVITY */}
        {isWidgetVisible("activity") && (
          <Card
            className={cn(
              "lg:col-span-2 rounded-2xl border transition-colors duration-300",
              colors.surfaceBorder,
              colors.surface,
            )}
          >
            <CardContent className="p-5">
              <h3
                className={cn("text-sm font-semibold mb-4", colors.textPrimary)}
              >
                Creator Activity
              </h3>
              <div className="space-y-3">
                {[
                  {
                    user: "Tech Master",
                    action: "Published new video",
                    time: "2m ago",
                    color: colors.success,
                  },
                  {
                    user: "Gaming Hub",
                    action: "Reached 8M views",
                    time: "1h ago",
                    color: colors.danger,
                  },
                  {
                    user: "Cooking Expert",
                    action: "New subscriber milestone",
                    time: "3h ago",
                    color: colors.success,
                  },
                  {
                    user: "Music Channel",
                    action: "Channel suspended",
                    time: "5h ago",
                    color: colors.warning,
                  },
                ].map((log, i) => (
                  <Link
                    key={i}
                    href="/creators"
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer group",
                      isDark
                        ? "hover:bg-[hsl(var(--surface-hover))]/50"
                        : "hover:bg-[hsl(var(--surface-hover))]",
                    )}
                  >
                    <div
                      className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center text-white",
                        log.color,
                      )}
                    >
                      <Icons.User size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-xs font-medium truncate",
                          colors.textPrimary,
                        )}
                      >
                        {log.action}
                      </p>
                      <p
                        className={cn(
                          "text-[10px] font-medium uppercase truncate",
                          colors.textMuted,
                        )}
                      >
                        {log.user} • {log.time}
                      </p>
                    </div>
                    <Icons.ChevronRight
                      size={12}
                      className={cn(
                        "transition-colors duration-300 flex-shrink-0",
                        isDark
                          ? `${colors.textMuted} group-hover:${colors.textPrimary}`
                          : `${colors.textMuted} group-hover:${colors.textPrimary}`,
                      )}
                    />
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* RECENT TRANSACTIONS */}
        <Card
          className={cn(
            "lg:col-span-3 rounded-2xl border overflow-hidden transition-colors duration-300",
            colors.surfaceBorder,
            colors.surface,
          )}
        >
          <div
            className={cn(
              "p-4 flex justify-between items-center",
              isDark
                ? "bg-[hsl(var(--surface-hover))]/50"
                : "bg-[hsl(var(--surface-hover))]",
            )}
          >
            <h3 className={cn("text-sm font-semibold", colors.textPrimary)}>
              Recent Transactions
            </h3>
            <Link
              href="/transactions"
              className={cn(
                "text-xs font-medium px-3 py-1.5 rounded-lg transition-colors",
                isDark
                  ? "bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/80"
                  : "bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/80",
              )}
              style={{ color: "hsl(var(--primary-foreground))" }}
            >
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  className={cn(
                    "border-b text-xs font-semibold uppercase tracking-wider",
                    colors.textMuted,
                    colors.surfaceBorder,
                  )}
                >
                  <th className="px-4 py-3 text-left">User</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className={cn("divide-y text-xs", colors.surfaceBorder)}>
                {[
                  {
                    name: "John Doe",
                    type: "Payment",
                    amount: 29.99,
                    status: "Completed",
                    color: colors.successText,
                    href: "/transactions",
                  },
                  {
                    name: "Jane Smith",
                    type: "Withdrawal",
                    amount: 75.0,
                    status: "Pending",
                    color: colors.warningText,
                    href: "/transactions",
                  },
                  {
                    name: "Bob Wilson",
                    type: "Payout",
                    amount: 99.99,
                    status: "Completed",
                    color: colors.successText,
                    href: "/transactions",
                  },
                ].map((row, i) => (
                  <tr
                    key={i}
                    onClick={() => (window.location.href = row.href)}
                    className={cn(
                      "hover transition-colors cursor-pointer",
                      isDark
                        ? "hover:bg-[hsl(var(--surface-hover))]/50"
                        : "hover:bg-[hsl(var(--surface-hover))]",
                    )}
                  >
                    <td
                      className={cn(
                        "px-4 py-3 font-medium",
                        colors.textPrimary,
                      )}
                    >
                      {row.name}
                    </td>
                    <td
                      className={cn("px-4 py-3 font-medium", colors.textMuted)}
                    >
                      {row.type}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-3 text-right font-semibold flex items-center justify-end gap-2",
                        row.color,
                      )}
                    >
                      {formatCurrency(row.amount)}
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[10px]",
                          row.status === "Completed"
                            ? isDark
                              ? "bg-[hsl(var(--success))]/20"
                              : "bg-[hsl(var(--success))]/10"
                            : "bg-[hsl(var(--warning))]/10",
                        )}
                        style={{
                          color:
                            row.status === "Completed"
                              ? "hsl(var(--success))"
                              : "hsl(var(--warning))",
                        }}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
