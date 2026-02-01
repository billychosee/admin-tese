"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardTitle } from "@/components/ui/Card";
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
        "space-y-10 min-h-screen font-sans transition-colors duration-300",
        isDark ? "bg-[#020617]" : "bg-white",
      )}
    >
      {/* 1. TOP STATS CARDS - Key Metrics */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Total Creators",
            value: formatNumber(data.totals.creators),
            color: "from-emerald-400 to-emerald-600",
            icon: <Icons.Users />,
            href: "/creators",
          },
          {
            label: "Total Videos",
            value: formatNumber(data.totals.videos),
            color: "from-rose-400 to-rose-600",
            icon: <Icons.Video />,
            href: "/videos",
          },
          {
            label: "Total Channels",
            value: formatNumber(data.totals.channels),
            color: "from-slate-700 to-slate-900",
            icon: <Icons.Grid />,
            href: "/creators",
          },
          {
            label: "Total Views",
            value: formatNumber(data.totals.views),
            color: "from-amber-400 to-amber-600",
            icon: <Icons.Eye />,
            href: "/videos",
          },
        ].map((card, i) => (
          <Link
            key={i}
            href={card.href}
            className={cn(
              "p-6 rounded-[2.5rem] text-white bg-gradient-to-br shadow-2xl relative overflow-hidden group hover:scale-105 transition-all duration-500 cursor-pointer",
              card.color,
            )}
          >
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">
                  {card.label}
                </span>
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                  {card.icon}
                </div>
              </div>
              <h3 className="text-3xl font-black mt-4">{card.value}</h3>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all" />
          </Link>
        ))}
      </div>

      {/* 2. MAIN ANALYTICS ROW - Transactions & Daily Stats */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* TRANSACTIONS CHART */}
        <Card
          className={cn(
            "lg:col-span-2 p-8 rounded-[3rem] border-none shadow-xl transition-colors duration-300",
            isDark ? "bg-slate-800" : "bg-white",
          )}
        >
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2
                className={cn(
                  "text-3xl font-black tracking-tighter",
                  isDark ? "text-white" : "text-slate-800",
                )}
              >
                Transactions
              </h2>
              <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest">
                Revenue tracking by period
              </p>
            </div>
            <div
              className={cn(
                "flex p-1 rounded-2xl transition-colors duration-300",
                isDark ? "bg-slate-700" : "bg-slate-100",
              )}
            >
              {["DAILY", "WEEKLY", "MONTHLY", "YEARLY"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r as Range)}
                  className={cn(
                    "px-4 py-2 text-[10px] font-black rounded-xl transition-all",
                    range === r
                      ? "bg-white text-emerald-600 shadow-md"
                      : isDark
                        ? "text-slate-400 hover:text-slate-200"
                        : "text-slate-400 hover:text-slate-600",
                  )}
                >
                  {r.charAt(0) + r.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
          <div className="h-80 w-full relative">
            <div className="absolute inset-0 flex flex-col justify-between opacity-[0.05] pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "border-t-[2px] w-full",
                    isDark ? "border-white" : "border-slate-900",
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
        </Card>

        {/* DAILY VISITORS & VIEWS */}
        <Card
          className={cn(
            "p-8 rounded-[3rem] border-none shadow-xl flex flex-col items-center transition-colors duration-300",
            isDark ? "bg-slate-800" : "bg-white",
          )}
        >
          <CardTitle
            className={cn(
              "text-[10px] font-black uppercase tracking-widest mb-8 self-start transition-colors duration-300",
              isDark ? "text-slate-400" : "text-slate-400",
            )}
          >
            Daily Visitors & Views
          </CardTitle>
          <div className="relative h-60 w-60">
            <svg
              viewBox="0 0 36 36"
              className="w-full h-full transform -rotate-90 drop-shadow-2xl"
            >
              <circle
                cx="18"
                cy="18"
                r="15.9"
                fill="none"
                stroke={isDark ? "#334155" : "#f1f5f9"}
                strokeWidth="4"
              />
              <circle
                cx="18"
                cy="18"
                r="15.9"
                fill="none"
                stroke="#10b981"
                strokeWidth="4"
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
                strokeWidth="4"
                strokeDasharray="100"
                strokeDashoffset="85"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className={cn(
                  "text-4xl font-black",
                  isDark ? "text-white" : "text-slate-800",
                )}
              >
                {formatNumber(data.totals.visitors)}
              </span>
              <p
                className={cn(
                  "text-[10px] font-black uppercase",
                  isDark ? "text-slate-400" : "text-slate-400",
                )}
              >
                Visitors/Day
              </p>
            </div>
          </div>
          <div className="w-full space-y-4 mt-8">
            <div
              className={cn(
                "flex justify-between items-center p-3 rounded-2xl transition-colors duration-300",
                isDark ? "bg-emerald-900/30" : "bg-emerald-50",
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span
                  className={cn(
                    "text-xs font-black transition-colors duration-300",
                    isDark ? "text-slate-200" : "text-slate-700",
                  )}
                >
                  Views/Day
                </span>
              </div>
              <span className="text-xs font-black text-emerald-600">
                {formatNumber(Math.round(data.totals.views / 365))}
              </span>
            </div>
            <div
              className={cn(
                "flex justify-between items-center p-3 rounded-2xl transition-colors duration-300",
                isDark ? "bg-rose-900/30" : "bg-rose-50",
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <span
                  className={cn(
                    "text-xs font-black transition-colors duration-300",
                    isDark ? "text-slate-200" : "text-slate-700",
                  )}
                >
                  Visitors/Day
                </span>
              </div>
              <span className="text-xs font-black text-rose-600">
                {formatNumber(data.totals.visitors)}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* 3. BOTTOM SECTION - Activity & Recent Transactions */}
      <div className="grid lg:grid-cols-5 gap-8">
        <Card
          className={cn(
            "lg:col-span-2 p-8 rounded-[3rem] border-none shadow-xl transition-colors duration-300",
            isDark ? "bg-slate-800" : "bg-white",
          )}
        >
          <h3
            className={cn(
              "text-[10px] font-black uppercase tracking-widest mb-8 transition-colors duration-300",
              isDark ? "text-slate-400" : "text-slate-400",
            )}
          >
            Creator Activity
          </h3>
          <div className="space-y-6">
            {[
              {
                user: "Tech Master",
                action: "Published new video",
                time: "2m ago",
                color: "bg-emerald-500",
              },
              {
                user: "Gaming Hub",
                action: "Reached 8M views",
                time: "1h ago",
                color: "bg-rose-500",
              },
              {
                user: "Cooking Expert",
                action: "New subscriber milestone",
                time: "3h ago",
                color: "bg-emerald-500",
              },
              {
                user: "Music Channel",
                action: "Channel suspended",
                time: "5h ago",
                color: "bg-amber-500",
              },
            ].map((log, i) => (
              <Link
                key={i}
                href="/creators"
                className={cn(
                  "flex items-center gap-4 p-4 rounded-2xl transition-all cursor-pointer group",
                  isDark ? "hover:bg-slate-700/50" : "hover:bg-slate-50",
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg",
                    log.color,
                  )}
                >
                  <Icons.User size={16} />
                </div>
                <div className="flex-1">
                  <p
                    className={cn(
                      "text-xs font-black transition-colors duration-300",
                      isDark ? "text-white" : "text-slate-800",
                    )}
                  >
                    {log.action}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                    {log.user} • {log.time}
                  </p>
                </div>
                <Icons.ChevronRight
                  size={14}
                  className={cn(
                    "transition-colors duration-300",
                    isDark
                      ? "text-slate-500 group-hover:text-slate-300"
                      : "text-slate-300 group-hover:text-slate-600",
                  )}
                />
              </Link>
            ))}
          </div>
        </Card>

        <Card
          className={cn(
            "lg:col-span-3 rounded-[3rem] border-none shadow-xl overflow-hidden transition-colors duration-300",
            isDark ? "bg-slate-800" : "bg-white",
          )}
        >
          <div
            className={cn(
              "p-8 flex justify-between items-center transition-colors duration-300",
              isDark ? "bg-slate-900 text-white" : "bg-slate-900 text-white",
            )}
          >
            <h3 className="text-[10px] font-black uppercase tracking-widest opacity-60">
              Recent Transactions
            </h3>
            <Link
              href="/transactions"
              className="text-[10px] font-black bg-emerald-500 px-4 py-2 rounded-xl hover:bg-emerald-600 transition-all"
            >
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  className={cn(
                    "border-b text-[9px] font-black uppercase transition-colors duration-300",
                    isDark
                      ? "border-slate-700 text-slate-400"
                      : "border-slate-100 text-slate-400",
                  )}
                >
                  <th className="px-8 py-5 text-left">User</th>
                  <th className="px-4 py-5 text-left">Type</th>
                  <th className="px-8 py-5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody
                className={cn(
                  "divide-y transition-colors duration-300",
                  isDark ? "divide-slate-700" : "divide-slate-50",
                )}
              >
                {[
                  {
                    name: "John Doe",
                    type: "Payment",
                    amount: 29.99,
                    status: "Completed",
                    color: "text-emerald-500",
                    href: "/transactions",
                  },
                  {
                    name: "Jane Smith",
                    type: "Withdrawal",
                    amount: 75.0,
                    status: "Pending",
                    color: "text-amber-500",
                    href: "/transactions",
                  },
                  {
                    name: "Bob Wilson",
                    type: "Payout",
                    amount: 99.99,
                    status: "Completed",
                    color: "text-emerald-500",
                    href: "/transactions",
                  },
                ].map((row, i) => (
                  <tr
                    key={i}
                    onClick={() => (window.location.href = row.href)}
                    className={cn(
                      "hover transition-all group cursor-pointer",
                      isDark ? "hover:bg-slate-700/50" : "hover:bg-slate-50",
                    )}
                  >
                    <td
                      className={cn(
                        "px-8 py-5 text-xs font-black transition-colors duration-300",
                        isDark ? "text-white" : "text-slate-800",
                      )}
                    >
                      {row.name}
                    </td>
                    <td className="px-4 py-5 text-xs font-bold text-slate-500">
                      {row.type}
                    </td>
                    <td
                      className={cn(
                        "px-8 py-5 text-right text-[10px] font-black uppercase flex items-center justify-end gap-2",
                        row.color,
                      )}
                    >
                      {formatCurrency(row.amount)}
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[8px]",
                          row.status === "Completed"
                            ? isDark
                              ? "bg-emerald-900/50 text-emerald-400"
                              : "bg-emerald-100"
                            : "bg-amber-100",
                        )}
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
