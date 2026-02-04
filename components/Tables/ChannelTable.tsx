"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { cn, formatNumber, formatCurrency, getInitials, formatRelativeTime } from "@/utils";
import { Icons } from "@/components/ui/Icons";
import type { Creator } from "@/types";
import { CREATOR_STATUSES } from "@/constants";

interface ChannelTableProps {
  creators: Creator[];
  isLoading?: boolean;
  onViewChannel: (creator: Creator) => void;
  onDeactivateChannel: (creator: Creator) => void;
  onActivateChannel: (creator: Creator) => void;
  onToggleCreatorStatus: (creator: Creator) => void;
}

export function ChannelTable({
  creators,
  isLoading,
  onViewChannel,
  onDeactivateChannel,
  onActivateChannel,
  onToggleCreatorStatus,
}: ChannelTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [previewCreator, setPreviewCreator] = useState<Creator | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"deactivate" | "activate" | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<"channel" | "creator">("channel");
  const itemsPerPage = 10;

  const filteredCreators = useMemo(() => {
    return creators.filter((creator) => {
      const matchesSearch =
        creator.channelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        creator.creatorFullName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter = statusFilter === "all" || creator.channelStatus === statusFilter;

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
    deactivated: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };

  const onlineStatusColors = {
    online: "bg-green-500",
    away: "bg-yellow-500",
    offline: "bg-slate-400",
  };

  const handleConfirmAction = (creator: Creator, action: "deactivate" | "activate", target: "channel" | "creator") => {
    setPreviewCreator(creator);
    setConfirmAction(action);
    setConfirmTarget(target);
    setShowConfirmModal(true);
  };

  const handleConfirmedAction = () => {
    if (!previewCreator || !confirmAction) return;
    
    if (confirmTarget === "channel") {
      if (confirmAction === "deactivate") {
        onDeactivateChannel(previewCreator);
      } else {
        onActivateChannel(previewCreator);
      }
    } else {
      onToggleCreatorStatus(previewCreator);
    }
    
    setShowConfirmModal(false);
    setPreviewCreator(null);
    setConfirmAction(null);
    setConfirmTarget("channel");
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div>
              <CardTitle>Channels</CardTitle>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Search channels..."
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
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="deactivated">Deactivated</option>
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
                        Channel
                      </th>
                      <th className="text-left py-4 px-4 font-bold text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50">
                        Creator
                      </th>
                      <th className="text-left py-4 px-4 font-bold text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50">
                        Status
                      </th>
                      <th className="text-left py-4 px-4 font-bold text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50">
                        Videos
                      </th>
                      <th className="text-left py-4 px-4 font-bold text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50">
                        Revenue
                      </th>
                      <th className="text-left py-4 px-4 font-bold text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCreators.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-slate-500 dark:text-slate-400">
                          No channels found
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
                              <div
                                className="cursor-pointer"
                                onClick={() => onViewChannel(creator)}
                              >
                                {creator.avatar ? (
                                  <img
                                    src={creator.avatar}
                                    alt={creator.channelName}
                                    className="w-10 h-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="avatar avatar-md font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                                    {getInitials(creator.channelName)}
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                  {creator.channelName}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  {creator.channelUrl}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm text-slate-600 dark:text-slate-300">
                            {creator.creatorFullName}
                          </td>
                          <td className="py-4 px-4">
                            <Badge
                              variant={
                                creator.channelStatus === "active"
                                  ? "success"
                                  : "danger"
                              }
                            >
                              {creator.channelStatus}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                            {formatNumber(creator.totalVideos)}
                          </td>
                          <td className="py-4 px-4 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(creator.totalRevenue)}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => onViewChannel(creator)}
                                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition"
                                title="View channel"
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

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setPreviewCreator(null);
          setConfirmAction(null);
        }}
        onConfirm={handleConfirmedAction}
        title={confirmAction === "deactivate" ? `Deactivate ${confirmTarget === "channel" ? "Channel" : "Creator"}` : `Activate ${confirmTarget === "channel" ? "Channel" : "Creator"}`}
        message={
          previewCreator
            ? `Are you sure you want to ${confirmAction === "deactivate" ? "deactivate" : "activate"} ${confirmTarget === "channel" ? `"${previewCreator.channelName}"` : `"${previewCreator.creatorFullName}"`}? This ${confirmTarget === "channel" ? "channel" : "creator"} will ${confirmAction === "deactivate" ? "no longer be" : "become"} visible to users.`
            : ""
        }
        confirmText={confirmAction === "deactivate" ? "Deactivate" : "Activate"}
        variant="danger"
      />
    </>
  );
}
