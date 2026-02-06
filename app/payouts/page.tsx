"use client";

import { useState, useEffect } from "react";
import { PayoutTable } from "@/components/Tables/PayoutTable";
import { api } from "@/services/api";
import { useToast } from "@/components/ui/Toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Icons } from "@/components/ui/Icons";
import { cn, formatCurrency, formatDateTime } from "@/utils";
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
  const [selectedPayout, setSelectedPayout] = useState<PayoutRequest | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
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

  const handleApprove = (payout: PayoutRequest) => {
    setSelectedPayout(payout);
    setShowApproveModal(true);
  };

  const handleReject = (payout: PayoutRequest) => {
    setSelectedPayout(payout);
    setShowRejectModal(true);
  };

  const handleComplete = (payout: PayoutRequest) => {
    setSelectedPayout(payout);
    setShowCompleteModal(true);
  };

  const handleViewDetails = (payout: PayoutRequest) => {
    setSelectedPayout(payout);
    setShowDetailsModal(true);
  };

  const confirmApprove = async () => {
    if (!selectedPayout) return;
    try {
      await api.payouts.approve(selectedPayout.id);
      addToast({
        type: "success",
        title: "Payout Approved",
        message: `Payout ${selectedPayout.id} has been approved`,
      });
      setShowApproveModal(false);
      loadPayouts();
      loadStats();
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to approve payout",
      });
    }
  };

  const confirmReject = async () => {
    if (!selectedPayout) return;
    try {
      await api.payouts.reject(selectedPayout.id);
      addToast({
        type: "warning",
        title: "Payout Rejected",
        message: `Payout ${selectedPayout.id} has been rejected`,
      });
      setShowRejectModal(false);
      loadPayouts();
      loadStats();
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to reject payout",
      });
    }
  };

  const confirmComplete = async () => {
    if (!selectedPayout) return;
    try {
      await api.payouts.complete(selectedPayout.id);
      addToast({
        type: "success",
        title: "Payout Completed",
        message: `Payout ${selectedPayout.id} has been marked as completed`,
      });
      setShowCompleteModal(false);
      loadPayouts();
      loadStats();
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to complete payout",
      });
    }
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

      {/* Approve Confirmation Modal */}
      <ConfirmModal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onConfirm={confirmApprove}
        title="Approve Payout"
        message={`Are you sure you want to approve this payout of ${formatCurrency(selectedPayout?.amount || 0, selectedPayout?.currency || "USD")} for ${selectedPayout?.creatorName}?`}
        confirmText="Approve"
        variant="info"
      />

      {/* Reject Confirmation Modal */}
      <ConfirmModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={confirmReject}
        title="Reject Payout"
        message={`Are you sure you want to reject this payout of ${formatCurrency(selectedPayout?.amount || 0, selectedPayout?.currency || "USD")} for ${selectedPayout?.creatorName}?`}
        confirmText="Reject"
        variant="danger"
      />

      {/* Complete Confirmation Modal */}
      <ConfirmModal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        onConfirm={confirmComplete}
        title="Mark as Completed"
        message={`Are you sure you want to mark this payout of ${formatCurrency(selectedPayout?.amount || 0, selectedPayout?.currency || "USD")} as completed?`}
        confirmText="Mark Completed"
        variant="info"
      />

      {/* Payout Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Payout Details"
        size="md"
      >
        {selectedPayout && (
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
              <span className="text-sm text-slate-500 dark:text-slate-400">Payout ID</span>
              <code className="text-sm font-mono text-emerald-600 dark:text-emerald-400">
                {selectedPayout.id}
              </code>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
              <span className="text-sm text-slate-500 dark:text-slate-400">Creator</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {selectedPayout.creatorName}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
              <span className="text-sm text-slate-500 dark:text-slate-400">Channel</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white capitalize">
                {selectedPayout.channelName}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
              <span className="text-sm text-slate-500 dark:text-slate-400">Amount</span>
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(selectedPayout.amount, selectedPayout.currency)}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
              <span className="text-sm text-slate-500 dark:text-slate-400">Status</span>
              <Badge
                variant={
                  selectedPayout.status === "completed" ? "success" :
                  selectedPayout.status === "approved" ? "info" :
                  selectedPayout.status === "pending" ? "warning" :
                  selectedPayout.status === "rejected" ? "danger" : "neutral"
                }
                className="capitalize"
              >
                {selectedPayout.status}
              </Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
              <span className="text-sm text-slate-500 dark:text-slate-400">Requested</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {formatDateTime(selectedPayout.requestedAt)}
              </span>
            </div>
            {selectedPayout.notes && (
              <div className="py-2">
                <span className="text-sm text-slate-500 dark:text-slate-400 block mb-1">Notes</span>
                <p className="text-sm text-slate-900 dark:text-white">
                  {selectedPayout.notes}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
