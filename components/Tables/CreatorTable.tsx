"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn, formatNumber, formatCurrency, formatRelativeTime, getInitials } from "@/utils";
import { Icons } from "@/components/ui/Icons";
import type { Creator } from "@/types";
import { CREATOR_STATUSES } from "@/constants";

interface CreatorTableProps {
  creators: Creator[];
  isLoading?: boolean;
  onViewProfile: (creator: Creator) => void;
  onToggleStatus: (creator: Creator) => void;
}

export function CreatorTable({
  creators,
  isLoading,
  onViewProfile,
  onToggleStatus,
}: CreatorTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredCreators = useMemo(() => {
    return creators.filter((creator) => {
      const fullName = `${creator.firstName} ${creator.lastName}`.toLowerCase();
      const matchesSearch =
        fullName.includes(searchTerm.toLowerCase()) ||
        creator.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        creator.channelName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter = statusFilter === "all" || creator.status === statusFilter;

      return matchesSearch && matchesFilter;
    });
  }, [creators, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredCreators.length / itemsPerPage);
  const paginatedCreators = filteredCreators.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const statusColors = {
    active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    suspended: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };

  const onlineStatusColors = {
    online: "bg-green-500",
    away: "bg-yellow-500",
    offline: "bg-slate-400",
  };

  return (
    <Card>
      <CardHeader>
        <div className="space-y-4">
          <div>
            <CardTitle>Creators</CardTitle>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search creators..."
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
                {CREATOR_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
              <Icons.ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
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
                      Creator
                    </th>
                    <th className="text-left py-4 px-4 font-bold text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50">
                      Channel
                    </th>
                    <th className="text-left py-4 px-4 font-bold text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50">
                      Status
                    </th>
                    <th className="text-left py-4 px-4 font-bold text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50">
                      Online
                    </th>
                    <th className="text-left py-4 px-4 font-bold text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50">
                      Videos
                    </th>
                    <th className="text-left py-4 px-4 font-bold text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50">
                      Earnings
                    </th>
                    <th className="text-left py-4 px-4 font-bold text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCreators.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-500 dark:text-slate-400">
                        No creators found
                      </td>
                    </tr>
                  ) : (
                    paginatedCreators.map((creator) => (
                      <tr
                        key={creator.id}
                        className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="avatar avatar-md font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                              {getInitials(`${creator.firstName} ${creator.lastName}`)}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                {creator.firstName} {creator.lastName}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {creator.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-600 dark:text-slate-300">
                          {creator.channelName}
                        </td>
                        <td className="py-4 px-4">
                          <Badge
                            variant={
                              creator.status === "active"
                                ? "success"
                                : creator.status === "pending"
                                  ? "warning"
                                  : "danger"
                            }
                          >
                            {creator.status}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "h-2 w-2 rounded-full",
                                onlineStatusColors[creator.onlineStatus]
                              )}
                            />
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {formatRelativeTime(creator.lastSeen)}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                          {formatNumber(creator.totalVideos)}
                        </td>
                        <td className="py-4 px-4 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(creator.totalEarnings)}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onViewProfile(creator)}
                              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition"
                              title="View profile"
                            >
                              <Icons.Eye size={16} />
                            </button>
                            <button
                              onClick={() => onToggleStatus(creator)}
                              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition"
                              title={creator.status === "active" ? "Deactivate" : "Activate"}
                            >
                              {creator.status === "active" ? (
                                <Icons.Lock size={16} />
                              ) : (
                                <Icons.Unlock size={16} />
                              )}
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
                    filteredCreators.length
                  )}{" "}
                  to{" "}
                  {Math.min(
                    currentPage * itemsPerPage,
                    filteredCreators.length
                  )}{" "}
                  of {filteredCreators.length} results
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
