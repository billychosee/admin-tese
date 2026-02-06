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
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none w-full px-4 py-2 pr-10 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 h-10 cursor-pointer"
              >
                {PAYOUT_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
              <Icons.ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            <Button variant="primary" size="sm">
              <Icons.Download size={16} />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            {/* Mobile skeleton */}
            <div className="sm:hidden space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 animate-pulse"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700" />
                    <div className="flex-1">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24 mb-2" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-32" />
                    </div>
                    <div className="h-6 w-16 rounded-full bg-slate-200 dark:bg-slate-700" />
                  </div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full mb-3" />
                  <div className="flex items-center justify-between">
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-20" />
                    <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-20" />
                  </div>
                </div>
              ))}
            </div>
            {/* Desktop skeleton */}
            <div className="hidden sm:block space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded animate-pulse" />
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="sm:hidden">
              {paginatedPayouts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-500 dark:text-slate-400">
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                    <Icons.DollarSign size={32} className="text-slate-300 dark:text-slate-600" />
                  </div>
                  <p className="text-sm font-medium">No payout requests found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {paginatedPayouts.map((payout) => (
                    <div
                      key={payout.id}
                      className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
                      onClick={() => onViewDetails(payout)}
                    >
                      {/* Top Row - Avatar, Creator, Payout ID, Amount */}
                      <div className="flex items-center gap-3 p-4">
                        {/* Creator Avatar */}
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-100 to-violet-200 dark:from-violet-900/40 dark:to-violet-800/20 flex items-center justify-center flex-shrink-0">
                          <Icons.User size={24} className="text-violet-600 dark:text-violet-400" />
                        </div>

                        {/* Creator Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-lg font-bold text-slate-900 dark:text-white truncate">
                            {payout.creatorName}
                          </p>
                          <code className="text-xs font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded inline-block mt-1">
                            #{payout.id.substring(0, 10)}
                          </code>
                        </div>

                        {/* Amount */}
                        <div className="text-right flex-shrink-0">
                          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(payout.amount, payout.currency)}
                          </p>
                        </div>
                      </div>

                      {/* Status Row */}
                      <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-3">
                        <Badge
                          variant={getStatusVariant(payout.status) as "success" | "warning" | "danger" | "info" | "neutral"}
                          className="capitalize text-xs"
                        >
                          {payout.status}
                        </Badge>
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          •
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                          {payout.channelName}
                        </span>
                      </div>

                      {/* Date Row */}
                      <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <Icons.Calendar size={16} />
                          <span>Requested: {formatDateTime(payout.requestedAt)}</span>
                        </div>
                      </div>

                      {/* Actions Row */}
                      <div className="p-3 flex items-center gap-2 border-t border-slate-100 dark:border-slate-700">
                        {payout.status === "pending" && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onApprove(payout);
                              }}
                              className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm font-semibold hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                            >
                              <Icons.Check size={14} />
                              Approve
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onReject(payout);
                              }}
                              className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-semibold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                            >
                              <Icons.X size={14} />
                              Reject
                            </button>
                          </>
                        )}
                        {payout.status === "approved" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onComplete(payout);
                            }}
                            className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                          >
                            <Icons.CheckCircle size={14} />
                            Complete
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewDetails(payout);
                          }}
                          className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                        >
                          <Icons.Eye size={14} />
                          Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
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

            {/* Mobile Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 sm:hidden">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {Math.min(
                    (currentPage - 1) * itemsPerPage + 1,
                    filteredPayouts.length
                  )}
                  -
                  {Math.min(
                    currentPage * itemsPerPage,
                    filteredPayouts.length
                  )}{" "}
                  of {filteredPayouts.length}
                </p>
                <div className="flex gap-1">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <Icons.ChevronLeft size={14} />
                  </Button>
                  <Button variant="primary" size="sm" disabled className="px-3">
                    {currentPage}/{totalPages}
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    <Icons.ChevronRight size={14} />
                  </Button>
                </div>
              </div>
            )}

            {/* Desktop Pagination */}
            {totalPages > 1 && (
              <div className="hidden sm:flex items-center justify-between mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
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
