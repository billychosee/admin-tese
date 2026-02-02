"use client";

import { useState, useEffect } from "react";
import { PayoutTable } from "@/components/Tables/PayoutTable";
import { api } from "@/services/api";
import { useToast } from "@/components/ui/Toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Icons } from "@/components/ui/Icons";
import { cn, formatCurrency } from "@/utils";
import { useTheme } from "@/components/providers/ThemeProvider";
import type { PayoutRequest } from "@/types";

interface PayoutStats {
  pending: number;
  approved: number;
  completed: number;
  rejected: number;
  totalPendingAmount: number;
}

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<PayoutStats | null>(null);
  const { addToast } = useToast();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Dashboard-style colors
  const colors = {
    surface: "bg-[hsl(var(--surface))]",
    surfaceBorder: "border-[hsl(var(--surface-border))]",
    textPrimary: "text-[hsl(var(--text-primary))]",
    textMuted: "text-[hsl(var(--text-muted))]",
  };

  useEffect(() => {
    loadPayouts();
    loadStats();
  }, []);

  const loadPayouts = async () => {
    try {
      setIsLoading(true);
      const response = await api.payouts.getAll(1, 100);
      setPayouts(response.data);
    } catch (error) {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to load payout requests",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await api.payouts.getStats();
      setStats(statsData);
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const handleApprove = async (payout: PayoutRequest) => {
    try {
      await api.payouts.approve(payout.id);
      addToast({
        type: "success",
        title: "Payout Approved",
        message: `Payout ${payout.id} has been approved`,
      });
      loadPayouts();
      loadStats();
    } catch (error) {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to approve payout",
      });
    }
  };

  const handleReject = async (payout: PayoutRequest) => {
    try {
      await api.payouts.reject(payout.id);
      addToast({
        type: "warning",
        title: "Payout Rejected",
        message: `Payout ${payout.id} has been rejected`,
      });
      loadPayouts();
      loadStats();
    } catch (error) {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to reject payout",
      });
    }
  };

  const handleComplete = async (payout: PayoutRequest) => {
    try {
      await api.payouts.complete(payout.id);
      addToast({
        type: "success",
        title: "Payout Completed",
        message: `Payout ${payout.id} has been marked as completed`,
      });
      loadPayouts();
      loadStats();
    } catch (error) {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to complete payout",
      });
    }
  };

  const handleViewDetails = (payout: PayoutRequest) => {
    addToast({
      type: "info",
      title: "Payout Details",
      message: `Viewing details for ${payout.id}`,
    });
  };

  // Stats cards with dashboard styling
  const statsCards = [
    {
      label: "Pending Requests",
      value: stats?.pending || 0,
      icon: <Icons.Clock size={20} />,
      iconColor: "text-amber-500",
      iconBg: isDark ? "bg-amber-500/20" : "bg-amber-100",
    },
    {
      label: "Pending Amount",
      value: formatCurrency(stats?.totalPendingAmount || 0, "USD"),
      icon: <Icons.DollarSign size={20} />,
      iconColor: "text-green-500",
      iconBg: isDark ? "bg-green-500/20" : "bg-green-100",
    },
    {
      label: "Approved",
      value: stats?.approved || 0,
      icon: <Icons.CheckCircle size={20} />,
      iconColor: "text-blue-500",
      iconBg: isDark ? "bg-blue-500/20" : "bg-blue-100",
    },
    {
      label: "Completed",
      value: stats?.completed || 0,
      icon: <Icons.Banknote size={20} />,
      iconColor: "text-emerald-500",
      iconBg: isDark ? "bg-emerald-500/20" : "bg-emerald-100",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards - Dashboard Style */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((card, i) => (
          <div
            key={i}
            className={cn(
              "rounded-2xl border p-5 transition-all duration-300 hover:shadow-lg",
              colors.surfaceBorder,
              colors.surface,
            )}
          >
            <div className="flex flex-col">
              <div className="flex items-center justify-between">
                <span className={cn("text-xs font-medium uppercase tracking-wider", colors.textMuted)}>
                  {card.label}
                </span>
                <div className={cn("p-2 rounded-lg", card.iconBg)}>
                  <span className={card.iconColor}>{card.icon}</span>
                </div>
              </div>
              <h3 className={cn("text-2xl font-bold mt-3", colors.textPrimary)}>
                {card.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Payout Table */}
      <PayoutTable
        payouts={payouts}
        isLoading={isLoading}
        onApprove={handleApprove}
        onReject={handleReject}
        onComplete={handleComplete}
        onViewDetails={handleViewDetails}
      />
    </div>
  );
}
