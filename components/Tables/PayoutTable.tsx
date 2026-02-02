"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn, formatCurrency, formatDateTime } from "@/utils";
import { Icons } from "@/components/ui/Icons";
import { PAYOUT_STATUSES } from "@/constants";
import type { PayoutRequest } from "@/types";

interface PayoutTableProps {
  payouts: PayoutRequest[];
  isLoading?: boolean;
  onApprove: (payout: PayoutRequest) => void;
  onReject: (payout: PayoutRequest) => void;
  onComplete: (payout: PayoutRequest) => void;
  onViewDetails: (payout: PayoutRequest) => void;
}

export function PayoutTable({
  payouts,
  isLoading,
  onApprove,
  onReject,
  onComplete,
  onViewDetails,
}: PayoutTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredPayouts = useMemo(() => {
    return payouts.filter((payout) => {
      const matchesSearch =
        payout.creatorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payout.channelName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payout.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter = statusFilter === "all" || payout.status === statusFilter;

      return matchesSearch && matchesFilter;
    });
  }, [payouts, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredPayouts.length / itemsPerPage);
  const paginatedPayouts = filteredPayouts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "success";
      case "approved":
        return "info";
      case "pending":
        return "warning";
      case "rejected":
        return "danger";
      default:
        return "neutral";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="space-y-4">
          <div>
            <CardTitle>Payout Requests</CardTitle>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search payouts..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 h-10"
            >
              {PAYOUT_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            <Button variant="primary" size="sm">
              <Icons.Download size={16} />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-slate-300 dark:border-slate-600">
                    <th className="text-left py-4 px-4 font-bold text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50">
                      Payout ID
                    </th>
                    <th className="text-left py-4 px-4 font-bold text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50">
                      Creator
                    </th>
                    <th className="text-left py-4 px-4 font-bold text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50">
                      Channel
                    </th>
                    <th className="text-left py-4 px-4 font-bold text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50">
                      Amount
                    </th>
                    <th className="text-left py-4 px-4 font-bold text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50">
                      Status
                    </th>
                    <th className="text-left py-4 px-4 font-bold text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50">
                      Requested
                    </th>
                    <th className="text-left py-4 px-4 font-bold text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPayouts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-500 dark:text-slate-400">
                        No payout requests found
                      </td>
                    </tr>
                  ) : (
                    paginatedPayouts.map((payout) => (
                      <tr
                        key={payout.id}
                        className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition"
                      >
                        <td className="py-4 px-4">
                          <code className="text-sm font-mono px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-700/50 text-emerald-600 dark:text-emerald-400">
                            {payout.id}
                          </code>
                        </td>
                        <td className="py-4 px-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                          {payout.creatorName}
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-500 dark:text-slate-400">
                          {payout.channelName}
                        </td>
                        <td className="py-4 px-4 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(payout.amount, payout.currency)}
                        </td>
                        <td className="py-4 px-4">
                          <Badge
                            variant={
                              getStatusVariant(payout.status) as
                                | "success"
                                | "warning"
                                | "danger"
                                | "info"
                                | "neutral"
                            }
                            className="capitalize"
                          >
                            {payout.status}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-500 dark:text-slate-400">
                          {formatDateTime(payout.requestedAt)}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1">
                            {payout.status === "pending" && (
                              <>
                                <button
                                  onClick={() => onApprove(payout)}
                                  className="p-2 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 text-green-500 dark:text-green-400 transition"
                                  title="Approve"
                                >
                                  <Icons.Check size={16} />
                                </button>
                                <button
                                  onClick={() => onReject(payout)}
                                  className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400 transition"
                                  title="Reject"
                                >
                                  <Icons.X size={16} />
                                </button>
                              </>
                            )}
                            {payout.status === "approved" && (
                              <button
                                onClick={() => onComplete(payout)}
                                className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-500 dark:text-blue-400 transition"
                                title="Mark as Completed"
                              >
                                <Icons.CheckCircle size={16} />
                              </button>
                            )}
                            <button
                              onClick={() => onViewDetails(payout)}
                              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition"
                              title="View details"
                            >
                              <Icons.Eye size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Showing{" "}
                  {Math.min(
                    (currentPage - 1) * itemsPerPage + 1,
                    filteredPayouts.length
                  )}{" "}
                  to{" "}
                  {Math.min(
                    currentPage * itemsPerPage,
                    filteredPayouts.length
                  )}{" "}
                  of {filteredPayouts.length} results
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <Icons.ChevronLeft size={16} />
                  </Button>
                  <Button variant="primary" size="sm" disabled>
                    {currentPage} / {totalPages}
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    <Icons.ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
