"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// Daily data
const dailyData = [
  { name: "Mon", revenue: 1200, previous: 1000 },
  { name: "Tue", revenue: 1500, previous: 1300 },
  { name: "Wed", revenue: 1100, previous: 950 },
  { name: "Thu", revenue: 1800, previous: 1500 },
  { name: "Fri", revenue: 2100, previous: 1800 },
  { name: "Sat", revenue: 2500, previous: 2200 },
  { name: "Sun", revenue: 1900, previous: 1600 },
];

// Weekly data
const weeklyData = [
  { name: "Week 1", revenue: 8500, previous: 7800 },
  { name: "Week 2", revenue: 9200, previous: 8500 },
  { name: "Week 3", revenue: 7800, previous: 7200 },
  { name: "Week 4", revenue: 10500, previous: 9200 },
];

// Monthly data
const monthlyData = [
  { name: "Jan", revenue: 45000, previous: 40000 },
  { name: "Feb", revenue: 52000, previous: 45000 },
  { name: "Mar", revenue: 48000, previous: 42000 },
  { name: "Apr", revenue: 61000, previous: 55000 },
  { name: "May", revenue: 55000, previous: 48000 },
  { name: "Jun", revenue: 67000, previous: 60000 },
  { name: "Jul", revenue: 72000, previous: 65000 },
  { name: "Aug", revenue: 69000, previous: 62000 },
  { name: "Sep", revenue: 75000, previous: 68000 },
  { name: "Oct", revenue: 82000, previous: 75000 },
  { name: "Nov", revenue: 78000, previous: 70000 },
  { name: "Dec", revenue: 91000, previous: 82000 },
];

// Yearly data
const yearlyData = [
  { name: "2020", revenue: 450000, previous: 380000 },
  { name: "2021", revenue: 520000, previous: 450000 },
  { name: "2022", revenue: 680000, previous: 520000 },
  { name: "2023", revenue: 820000, previous: 680000 },
  { name: "2024", revenue: 950000, previous: 820000 },
  { name: "2025", revenue: 1100000, previous: 950000 },
];

type Period = "daily" | "weekly" | "monthly" | "yearly";

const periodLabels: Record<Period, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
};

export default function TransactionRevenueChart() {
  const [period, setPeriod] = useState<Period>("monthly");

  const getData = () => {
    switch (period) {
      case "daily":
        return dailyData;
      case "weekly":
        return weeklyData;
      case "monthly":
        return monthlyData;
      case "yearly":
        return yearlyData;
      default:
        return monthlyData;
    }
  };

  const data = getData();

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
                background: "#fff",
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
      </div>
    </div>
  );
}
