"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { TransactionTable } from "@/components/Tables/TransactionTable";
import { Icons } from "@/components/ui/Icons";
import { useToast } from "@/components/ui/Toast";
import { useTheme } from "@/components/providers/ThemeProvider";
import { api } from "@/services/api";
import { cn, formatCurrency, formatDateTime } from "@/utils";
import { TRANSACTION_STATUSES } from "@/constants";
import type { Transaction } from "@/types";

type ExportFormat = "csv" | "excel";

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
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Date range filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchTransactions();
  }, [page, statusFilter, searchQuery, startDate, endDate]);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const result = await api.transactions.getAll(page, 10, statusFilter);
      
      // Filter by date range if set
      let filtered = result.data;
      if (startDate) {
        const start = new Date(startDate);
        filtered = filtered.filter((t) => new Date(t.createdAt) >= start);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // End of day
        filtered = filtered.filter((t) => new Date(t.createdAt) <= end);
      }
      
      setTransactions(filtered);
      setTotalPages(Math.ceil(filtered.length / 10));
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

  const handleExport = async (format: ExportFormat) => {
    try {
      // Fetch all transactions for export (without pagination)
      const result = await api.transactions.getAll(1, 1000, statusFilter);
      
      // Apply date filters
      let filtered = result.data;
      if (startDate) {
        const start = new Date(startDate);
        filtered = filtered.filter((t) => new Date(t.createdAt) >= start);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filtered = filtered.filter((t) => new Date(t.createdAt) <= end);
      }

      // Generate export data
      const exportData = filtered.map((t) => ({
        TransactionID: t.id,
        User: t.userName,
        Type: t.type,
        Amount: t.amount,
        Currency: t.currency,
        Status: t.status,
        Description: t.description || "",
        Date: formatDateTime(t.createdAt),
        PlatformFees: (t.amount * 0.05).toFixed(2),
        ServiceFees: "0.50",
        PayoutAmount: (t.amount - (t.amount * 0.05) - 0.50).toFixed(2),
      }));

      if (format === "csv") {
        exportToCSV(exportData);
      } else {
        exportToExcel(exportData);
      }

      addToast({
        type: "success",
        title: "Success",
        message: `Transactions exported to ${format.toUpperCase()}`,
      });
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to export transactions",
      });
    } finally {
      setShowExportMenu(false);
    }
  };

  const exportToCSV = (data: Record<string, any>[]) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers.map((header) => `"${row[header]}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `transactions_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const exportToExcel = (data: Record<string, any>[]) => {
    // Simple Excel XML format
    const headers = Object.keys(data[0]);
    const xmlContent = `<?xml version="1.0"?>
      <?mso-application progid="Excel.Sheet"?>
      <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet">
        <Worksheet ss:Name="Transactions">
          <Table>
            <Row>
              ${headers.map((h) => `<Cell><Data ss:Type="String">${h}</Data></Cell>`).join("")}
            </Row>
            ${data
              .map(
                (row) =>
                  `<Row>${headers
                    .map((h) => `<Cell><Data ss:Type="String">${row[h]}</Data></Cell>`)
                    .join("")}</Row>`
              )
              .join("")}
          </Table>
        </Worksheet>
      </Workbook>`;

    const blob = new Blob([xmlContent], {
      type: "application/vnd.ms-excel",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `transactions_${new Date().toISOString().split("T")[0]}.xls`;
    link.click();
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setSearchQuery("");
    setStatusFilter("all");
    setPage(1);
  };

  const hasFilters = startDate || endDate || searchQuery || statusFilter !== "all";

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
        "space-y-6 sm:space-y-8 min-h-screen font-sans transition-colors duration-300 p-4 sm:p-6 lg:p-8",
        isDark ? "bg-[#020617]" : "bg-white",
      )}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl sm:text-3xl font-black uppercase tracking-tighter text-[hsl(var(--text-primary))]">
            Transactions
          </h1>
          <p className="text-xs font-normal tracking-widest text-[hsl(var(--text-muted))]">
            View and manage all transactions
          </p>
        </div>

        {/* Date Range Filter - Side by side on mobile */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={cn(
                "flex-1 h-8 sm:h-10 text-xs sm:text-sm",
                isDark
                  ? "bg-slate-700 border-slate-600 text-white"
                  : "bg-slate-50 border-slate-200",
              )}
            />
            <span className={cn("text-xs font-medium whitespace-nowrap", isDark ? "text-slate-400" : "text-slate-500")}>
              to
            </span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={cn(
                "flex-1 h-8 sm:h-10 text-xs sm:text-sm",
                isDark
                  ? "bg-slate-700 border-slate-600 text-white"
                  : "bg-slate-50 border-slate-200",
              )}
            />
          </div>

          {/* Clear Filters */}
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <Icons.X size={14} className="mr-1" />
              Clear
            </Button>
          )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total", value: transactions.length, color: "primary" },
          { label: "Completed", value: transactions.filter((t) => t.status === "completed").length, color: "success" },
          { label: "Pending", value: transactions.filter((t) => t.status === "pending").length, color: "warning" },
          { label: "Refunded", value: transactions.filter((t) => t.status === "refunded").length, color: "info" },
          { label: "Flagged", value: transactions.filter((t) => t.status === "flagged").length, color: "danger" },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-3 sm:p-4">
              <p className="text-xl sm:text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-slate-500 uppercase tracking-wide truncate">
                {stat.label}
              </p>
            </CardContent>
          </Card>
        ))}
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
            {hasFilters && (
              <Button variant="ghost" onClick={clearFilters} className="mt-4">
                Clear filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <TransactionTable
          transactions={transactions}
          isLoading={isLoading}
          onRefund={(txn) => {
            setSelectedTransaction(txn);
            setShowRefundModal(true);
          }}
          onFlag={(txn) => {
            setSelectedTransaction(txn);
            setShowFlagModal(true);
          }}
          onViewDetails={(txn) => {
            setSelectedTransaction(txn);
            setShowDetailsModal(true);
          }}
        />
      )}

      {totalPages > 1 && (
        <div
          className={cn(
            "flex flex-col sm:flex-row items-center justify-center gap-3 py-4",
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
            className={cn(
              "w-full sm:w-auto",
              isDark ? "border-slate-600 hover:bg-slate-700" : "",
            )}
          >
            <Icons.ChevronLeft size={14} className="sm:mr-1" />
            <span className="sm:hidden">Prev</span>
            <span className="hidden sm:inline">Previous</span>
          </Button>
          <span
            className={cn(
              "text-xs sm:text-sm font-black uppercase tracking-wider px-2 sm:px-4",
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
            className={cn(
              "w-full sm:w-auto",
              isDark ? "border-slate-600 hover:bg-slate-700" : "",
            )}
          >
            <span className="hidden sm:inline">Next</span>
            <span className="sm:hidden">Next</span>
            <Icons.ChevronRight size={14} className="sm:ml-1" />
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

      {/* Transaction Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Transaction Details"
        size="md"
      >
        {selectedTransaction && (
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
              <span className="text-sm text-slate-500 dark:text-slate-400">Transaction ID</span>
              <code className="text-sm font-mono text-emerald-600 dark:text-emerald-400">
                {selectedTransaction.id}
              </code>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
              <span className="text-sm text-slate-500 dark:text-slate-400">User</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {selectedTransaction.userName}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
              <span className="text-sm text-slate-500 dark:text-slate-400">Type</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white capitalize">
                {selectedTransaction.type}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
              <span className="text-sm text-slate-500 dark:text-slate-400">Amount</span>
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(selectedTransaction.amount, selectedTransaction.currency)}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
              <span className="text-sm text-slate-500 dark:text-slate-400">Status</span>
              <Badge variant={getStatusVariant(selectedTransaction.status) as "success" | "warning" | "danger" | "info" | "neutral"} className="capitalize">
                {selectedTransaction.status}
              </Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
              <span className="text-sm text-slate-500 dark:text-slate-400">Date</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {formatDateTime(selectedTransaction.createdAt)}
              </span>
            </div>
            {selectedTransaction.description && (
              <div className="py-2">
                <span className="text-sm text-slate-500 dark:text-slate-400 block mb-1">Description</span>
                <p className="text-sm text-slate-900 dark:text-white">
                  {selectedTransaction.description}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
