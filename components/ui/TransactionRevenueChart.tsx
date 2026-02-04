"use client";

import { useState, useEffect, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { api } from "@/services/api";
import { useTheme } from "@/components/providers/ThemeProvider";
import type { Transaction } from "@/types";

type Period = "daily" | "weekly" | "monthly" | "yearly";

type PeriodLabel = Record<Period, string>;

const periodLabels: PeriodLabel = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
};

interface RevenueData {
  name: string;
  revenue: number;
  previous: number;
}

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function TransactionRevenueChart() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [period, setPeriod] = useState<Period>("monthly");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const result = await api.transactions.getAll(1, 1000, "all");
      setTransactions(result.data);
    } catch (error) {
      console.error("Failed to fetch transactions for chart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const data = useMemo((): RevenueData[] => {
    if (transactions.length === 0) return [];

    const completedTransactions = transactions.filter(
      (t) => t.status === "completed",
    );

    const now = new Date();
    const current: Date[] = [];
    const previous: Date[] = [];

    // Build date ranges based on period
    if (period === "daily") {
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        current.push(date);
      }
      for (let i = 13; i >= 7; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        previous.push(date);
      }
    } else if (period === "weekly") {
      for (let i = 3; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i * 7);
        current.push(date);
      }
      for (let i = 7; i >= 4; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i * 7);
        previous.push(date);
      }
    } else if (period === "monthly") {
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        current.push(date);
      }
    } else if (period === "yearly") {
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now);
        date.setFullYear(date.getFullYear() - i);
        current.push(date);
      }
    }

    // Calculate revenue for each period
    const currentGrouped: Record<string, number> = {};
    const previousGrouped: Record<string, number> = {};

    const getLabel = (date: Date, index?: number): string => {
      if (period === "daily") return days[date.getDay()];
      if (period === "weekly") return `Week ${(index || 0) + 1}`;
      if (period === "monthly") return months[date.getMonth()];
      return date.getFullYear().toString();
    };

    // Initialize groups
    current.forEach((date, index) => {
      currentGrouped[getLabel(date, index)] = 0;
    });
    previous.forEach((date, index) => {
      previousGrouped[getLabel(date, index)] = 0;
    });

    // Aggregate transaction amounts
    completedTransactions.forEach((t) => {
      const tDate = new Date(t.createdAt);

      current.forEach((date, index) => {
        const label = getLabel(date, index);
        if (
          tDate.getFullYear() === date.getFullYear() &&
          tDate.getMonth() === date.getMonth() &&
          tDate.getDate() === date.getDate()
        ) {
          currentGrouped[label] += t.amount;
        }
      });

      previous.forEach((date, index) => {
        const label = getLabel(date, index);
        if (
          tDate.getFullYear() === date.getFullYear() &&
          tDate.getMonth() === date.getMonth() &&
          tDate.getDate() === date.getDate()
        ) {
          previousGrouped[label] += t.amount;
        }
      });
    });

    // Build chart data
    return current.map((date, index) => ({
      name: getLabel(date, index),
      revenue: currentGrouped[getLabel(date, index)] || 0,
      previous: previousGrouped[getLabel(date, index)] || 0,
    }));
  }, [transactions, period]);

  return (
    <div className="w-full">
      {/* Period Toggle */}
      <div className="flex gap-2 mb-4">
        {(["daily", "weekly", "monthly", "yearly"] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
              period === p
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
            }`}
          >
            {periodLabels[p]}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="h-72 w-full">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
          </div>
        ) : data.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">
              No transaction data available
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={10}>
              {/* subtle horizontal lines */}
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                opacity={0.15}
              />

              <defs>
                {/* striped pattern for previous period */}
                <pattern
                  id="previousPattern"
                  width="6"
                  height="6"
                  patternUnits="userSpaceOnUse"
                  patternTransform="rotate(45)"
                >
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="6"
                    stroke="#6b7280"
                    strokeWidth="2"
                  />
                </pattern>
              </defs>

              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                fontSize={12}
              />

              <Tooltip
                cursor={{ fill: "transparent" }}
                contentStyle={{
                  borderRadius: 12,
                  border: "none",
                  background: isDark ? "#1e293b" : "#fff",
                  boxShadow: "0 10px 30px rgba(0,0,0,.12)",
                }}
                labelStyle={{ fontWeight: 600 }}
                formatter={(value: number | undefined) => [
                  `$${(value || 0).toLocaleString()}`,
                ]}
              />

              {/* Previous Period Bar (background - striped) */}
              <Bar
                dataKey="previous"
                fill="url(#previousPattern)"
                radius={[12, 12, 12, 12]}
                maxBarSize={40}
              />

              {/* Revenue Bar (foreground) */}
              <Bar
                dataKey="revenue"
                fill="#10b981"
                radius={[12, 12, 12, 12]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
