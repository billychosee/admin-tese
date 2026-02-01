"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardTitle } from "@/components/ui/Card";
import { SkeletonStats, SkeletonChart } from "@/components/ui/Skeleton";
import { Icons } from "@/components/ui/Icons";
import { cn, formatCurrency, formatNumber } from "@/utils";
import { api } from "@/services/api";
import { useTheme } from "@/components/providers/ThemeProvider";

type Range = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

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

  useEffect(() => {
    api.dashboard.getOverview(range).then((res) => {
      setData(res);
      setLoading(false);
    });
  }, [range]);

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
      {/* 1. TOP STATS CARDS - Key Metrics */}
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
              <h3 className={cn("text-2xl font-bold mt-3", colors.textPrimary)}>
                {card.value}
              </h3>
            </div>
          </Link>
        ))}
      </div>

      {/* 2. MAIN ANALYTICS ROW - Transactions & Daily Stats */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* TRANSACTIONS CHART */}
        <Card
          className={cn(
            "lg:col-span-2 rounded-2xl border transition-colors duration-300",
            colors.surfaceBorder,
            colors.surface,
          )}
        >
          <CardContent className="p-5">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className={cn("text-lg font-semibold", colors.textPrimary)}>
                  Transactions
                </h2>
                <p className={cn("text-xs font-medium uppercase tracking-wider", colors.textMuted)}>
                  Revenue tracking by period
                </p>
              </div>
              <div
                className={cn(
                  "flex p-1 rounded-xl transition-colors duration-300",
                  isDark ? "bg-[hsl(var(--surface-hover))]/50" : "bg-[hsl(var(--surface-hover))]",
                )}
              >
                {["DAILY", "WEEKLY", "MONTHLY", "YEARLY"].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRange(r as Range)}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium rounded-lg transition-all",
                      range === r
                        ? "bg-[hsl(var(--primary))] text-white shadow-md"
                        : isDark
                          ? `${colors.textMuted} hover:${colors.textPrimary}`
                          : `${colors.textMuted} hover:${colors.textPrimary}`,
                    )}
                  >
                    {r.charAt(0) + r.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-64 w-full relative">
              <div className="absolute inset-0 flex flex-col justify-between opacity-[0.05] pointer-events-none">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "border-t w-full",
                      colors.surfaceBorder,
                    )}
                  />
                ))}
              </div>
              <AreaChart
                data={data.transactions}
                color="#10b981"
                id="transactions"
              />
            </div>
          </CardContent>
        </Card>

        {/* DAILY VISITORS & VIEWS */}
        <Card
          className={cn(
            "rounded-2xl border flex flex-col transition-colors duration-300",
            colors.surfaceBorder,
            colors.surface,
          )}
        >
          <CardContent className="p-5">
            <h3 className={cn("text-sm font-semibold mb-4", colors.textPrimary)}>
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
                <span className={cn("text-3xl font-bold", colors.textPrimary)}>
                  {formatNumber(data.totals.visitors)}
                </span>
                <span className={cn("text-xs font-medium uppercase", colors.textMuted)}>
                  Visitors/Day
                </span>
              </div>
            </div>
            <div className="w-full space-y-3 mt-6">
              <div
                className={cn(
                  "flex justify-between items-center p-3 rounded-lg transition-colors duration-300",
                  isDark ? "bg-[hsl(var(--success))]/10" : "bg-[hsl(var(--success))]/10",
                )}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--success))]" />
                  <span className={cn("text-xs font-medium", colors.textMuted)}>
                    Views/Day
                  </span>
                </div>
                <span className={cn("text-xs font-semibold", colors.successText)}>
                  {formatNumber(Math.round(data.totals.views / 365))}
                </span>
              </div>
              <div
                className={cn(
                  "flex justify-between items-center p-3 rounded-lg transition-colors duration-300",
                  isDark ? "bg-[hsl(var(--danger))]/10" : "bg-[hsl(var(--danger))]/10",
                )}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--danger))]" />
                  <span className={cn("text-xs font-medium", colors.textMuted)}>
                    Visitors/Day
                  </span>
                </div>
                <span className={cn("text-xs font-semibold", colors.dangerText)}>
                  {formatNumber(data.totals.visitors)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. BOTTOM SECTION - Activity & Recent Transactions */}
      <div className="grid lg:grid-cols-5 gap-6">
        <Card
          className={cn(
            "lg:col-span-2 rounded-2xl border transition-colors duration-300",
            colors.surfaceBorder,
            colors.surface,
          )}
        >
          <CardContent className="p-5">
            <h3 className={cn("text-sm font-semibold mb-4", colors.textPrimary)}>
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
                    isDark ? "hover:bg-[hsl(var(--surface-hover))]/50" : "hover:bg-[hsl(var(--surface-hover))]",
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
                    <p className={cn("text-xs font-medium truncate", colors.textPrimary)}>
                      {log.action}
                    </p>
                    <p className={cn("text-[10px] font-medium uppercase truncate", colors.textMuted)}>
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
              isDark ? "bg-[hsl(var(--surface-hover))]/50" : "bg-[hsl(var(--surface-hover))]",
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
              <tbody
                className={cn(
                  "divide-y text-xs",
                  colors.surfaceBorder,
                )}
              >
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
                      isDark ? "hover:bg-[hsl(var(--surface-hover))]/50" : "hover:bg-[hsl(var(--surface-hover))]",
                    )}
                  >
                    <td className={cn("px-4 py-3 font-medium", colors.textPrimary)}>
                      {row.name}
                    </td>
                    <td className={cn("px-4 py-3 font-medium", colors.textMuted)}>
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
                        style={{ color: row.status === "Completed" ? "hsl(var(--success))" : "hsl(var(--warning))" }}
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
