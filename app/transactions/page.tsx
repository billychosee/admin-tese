"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { ConfirmModal } from "@/components/ui/Modal";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { Icons } from "@/components/ui/Icons";
import { useToast } from "@/components/ui/Toast";
import { useTheme } from "@/components/providers/ThemeProvider";
import { api } from "@/services/api";
import { cn, formatCurrency, formatDateTime } from "@/utils";
import { TRANSACTION_STATUSES } from "@/constants";
import type { Transaction } from "@/types";

export default function TransactionsPage() {
  const { addToast } = useToast();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchTransactions();
  }, [page, statusFilter, searchQuery]);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const result = await api.transactions.getAll(page, 10, statusFilter);
      setTransactions(result.data);
      setTotalPages(result.totalPages);
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to fetch transactions",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefund = async () => {
    if (!selectedTransaction) return;
    try {
      await api.transactions.refund(selectedTransaction.id);
      addToast({
        type: "success",
        title: "Success",
        message: "Transaction refunded",
      });
      setShowRefundModal(false);
      setSelectedTransaction(null);
      fetchTransactions();
    } catch {
      addToast({ type: "error", title: "Error", message: "Failed to refund" });
    }
  };

  const handleFlag = async () => {
    if (!selectedTransaction) return;
    try {
      await api.transactions.flag(selectedTransaction.id);
      addToast({
        type: "success",
        title: "Success",
        message: "Transaction flagged",
      });
      setShowFlagModal(false);
      setSelectedTransaction(null);
      fetchTransactions();
    } catch {
      addToast({ type: "error", title: "Error", message: "Failed to flag" });
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "failed":
        return "danger";
      case "refunded":
        return "info";
      case "flagged":
        return "danger";
      default:
        return "neutral";
    }
  };

  if (isLoading && page === 1) {
    return (
      <div
        className={cn(
          "space-y-6 min-h-screen font-sans",
          isDark ? "bg-[#020617]" : "bg-[#F1F5F9]",
        )}
      >
        <SkeletonTable rows={10} cols={7} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "space-y-8 min-h-screen font-sans transition-colors duration-300",
        isDark ? "bg-[#020617]" : "bg-white",
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={cn("relative", isDark ? "bg-slate-800" : "bg-white")}>
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "w-64 pl-10",
                isDark
                  ? "bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                  : "bg-slate-50 border-slate-200",
              )}
            />
            <Icons.Search
              size={18}
              className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2",
                isDark ? "text-slate-400" : "text-slate-400",
              )}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={cn(
              "input w-40",
              isDark
                ? "bg-slate-700 border-slate-600 text-white"
                : "bg-slate-50 border-slate-200",
            )}
          >
            {TRANSACTION_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
        <Button
          variant="outline"
          className={isDark ? "border-slate-600 hover:bg-slate-700" : ""}
        >
          <Icons.Download size={18} />
          Export
        </Button>
      </div>

      {transactions.length === 0 ? (
        <Card
          className={cn(
            "p-12 rounded-[3rem] border-none shadow-xl text-center transition-colors duration-300",
            isDark ? "bg-slate-800" : "bg-white",
          )}
        >
          <CardContent>
            <Icons.CreditCard
              className={cn(
                "mx-auto h-16 w-16 mb-4",
                isDark ? "text-slate-600" : "text-slate-300",
              )}
            />
            <p
              className={cn(
                "text-lg font-medium",
                isDark ? "text-slate-400" : "text-slate-500",
              )}
            >
              No transactions found
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card
          className={cn(
            "rounded-[3rem] border-none shadow-xl overflow-hidden transition-colors duration-300",
            isDark ? "bg-slate-800" : "bg-white",
          )}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  className={cn(
                    "border-b text-xs font-black uppercase tracking-widest",
                    isDark
                      ? "border-slate-700 text-slate-400"
                      : "border-slate-100 text-slate-400",
                  )}
                >
                  <th className="px-8 py-5 text-left">Transaction ID</th>
                  <th className="px-4 py-5 text-left">User</th>
                  <th className="px-4 py-5 text-left">Type</th>
                  <th className="px-4 py-5 text-left">Amount</th>
                  <th className="px-4 py-5 text-left">Status</th>
                  <th className="px-4 py-5 text-left">Date</th>
                  <th className="px-4 py-5 text-left">Actions</th>
                </tr>
              </thead>
              <tbody
                className={cn(
                  "divide-y",
                  isDark ? "divide-slate-700" : "divide-slate-50",
                )}
              >
                {transactions.map((txn) => (
                  <tr
                    key={txn.id}
                    className={cn(
                      "hover transition-all group",
                      isDark ? "hover:bg-slate-700/50" : "hover:bg-slate-50",
                    )}
                  >
                    <td className="px-8 py-5">
                      <code
                        className={cn(
                          "text-sm font-mono px-3 py-1 rounded-xl",
                          isDark
                            ? "bg-slate-700/50 text-emerald-400"
                            : "bg-slate-100 text-emerald-600",
                        )}
                      >
                        {txn.id}
                      </code>
                    </td>
                    <td
                      className={cn(
                        "px-4 py-5 font-medium",
                        isDark ? "text-slate-300" : "text-slate-600",
                      )}
                    >
                      {txn.userName}
                    </td>
                    <td className="px-4 py-5">
                      <Badge variant="neutral" className="capitalize">
                        {txn.type}
                      </Badge>
                    </td>
                    <td
                      className={cn(
                        "px-4 py-5 font-bold",
                        isDark ? "text-emerald-400" : "text-emerald-600",
                      )}
                    >
                      {formatCurrency(txn.amount, txn.currency)}
                    </td>
                    <td className="px-4 py-5">
                      <Badge
                        variant={
                          getStatusVariant(txn.status) as
                            | "success"
                            | "warning"
                            | "danger"
                            | "info"
                            | "neutral"
                        }
                      >
                        {txn.status}
                      </Badge>
                    </td>
                    <td
                      className={cn(
                        "px-4 py-5 text-sm",
                        isDark ? "text-slate-500" : "text-slate-400",
                      )}
                    >
                      {formatDateTime(txn.createdAt)}
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-1">
                        {txn.status === "completed" && (
                          <button
                            onClick={() => {
                              setSelectedTransaction(txn);
                              setShowRefundModal(true);
                            }}
                            className="p-2 rounded-xl hover:bg-blue-500/10 text-blue-400 transition-all"
                            title="Refund"
                          >
                            <Icons.Refresh size={16} />
                          </button>
                        )}
                        {txn.status !== "flagged" &&
                          txn.status !== "refunded" && (
                            <button
                              onClick={() => {
                                setSelectedTransaction(txn);
                                setShowFlagModal(true);
                              }}
                              className="p-2 rounded-xl hover:bg-red-500/10 text-red-400 transition-all"
                              title="Flag"
                            >
                              <Icons.AlertCircle size={16} />
                            </button>
                          )}
                        <button
                          className={cn(
                            "p-2 rounded-xl transition-all",
                            isDark
                              ? "hover:bg-slate-700 text-slate-400 hover:text-slate-200"
                              : "hover:bg-slate-100 text-slate-400 hover:text-slate-600",
                          )}
                          title="View details"
                        >
                          <Icons.Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {totalPages > 1 && (
        <div
          className={cn(
            "flex items-center justify-center gap-4 py-4",
            isDark
              ? "bg-slate-800 rounded-3xl"
              : "bg-white rounded-3xl shadow-xl",
          )}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className={isDark ? "border-slate-600 hover:bg-slate-700" : ""}
          >
            Previous
          </Button>
          <span
            className={cn(
              "text-sm font-black uppercase tracking-wider px-4",
              isDark ? "text-slate-400" : "text-slate-500",
            )}
          >
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            className={isDark ? "border-slate-600 hover:bg-slate-700" : ""}
          >
            Next
          </Button>
        </div>
      )}

      <ConfirmModal
        isOpen={showRefundModal}
        onClose={() => setShowRefundModal(false)}
        onConfirm={handleRefund}
        title="Process Refund"
        message={`Are you sure you want to refund this transaction for ${formatCurrency(selectedTransaction?.amount || 0)}?`}
        confirmText="Process Refund"
        variant="info"
      />

      <ConfirmModal
        isOpen={showFlagModal}
        onClose={() => setShowFlagModal(false)}
        onConfirm={handleFlag}
        title="Flag Transaction"
        message="Are you sure you want to flag this transaction for review?"
        confirmText="Flag"
        variant="danger"
      />
    </div>
  );
}
