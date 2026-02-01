"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ConfirmModal } from "@/components/ui/Modal";
import { SkeletonTable, SkeletonList } from "@/components/ui/Skeleton";
import { Icons } from "@/components/ui/Icons";
import { useToast } from "@/components/ui/Toast";
import { useTheme } from "@/components/providers/ThemeProvider";
import { api } from "@/services/api";
import {
  cn,
  formatNumber,
  formatCurrency,
  formatRelativeTime,
  getStatusColor,
  getInitials,
} from "@/utils";
import { CREATOR_STATUSES } from "@/constants";
import type { Creator } from "@/types";

export default function CreatorsPage() {
  const { addToast } = useToast();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [creators, setCreators] = useState<Creator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCreators();
  }, [page, statusFilter, searchQuery]);

  const fetchCreators = async () => {
    setIsLoading(true);
    try {
      const result = await api.creators.getAll(
        page,
        10,
        statusFilter,
        searchQuery,
      );
      setCreators(result.data);
      setTotalPages(result.totalPages);
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to fetch creators",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedCreator) return;
    try {
      await api.creators.approve(selectedCreator.id);
      addToast({
        type: "success",
        title: "Success",
        message: "Creator approved successfully",
      });
      setShowApproveModal(false);
      setSelectedCreator(null);
      fetchCreators();
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to approve creator",
      });
    }
  };

  const handleReject = async () => {
    if (!selectedCreator) return;
    try {
      await api.creators.reject(selectedCreator.id);
      addToast({
        type: "success",
        title: "Success",
        message: "Creator rejected",
      });
      setShowRejectModal(false);
      setSelectedCreator(null);
      fetchCreators();
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to reject creator",
      });
    }
  };

  const handleToggleStatus = async (creator: Creator) => {
    try {
      if (creator.status === "active") {
        await api.creators.deactivate(creator.id);
        addToast({
          type: "success",
          title: "Success",
          message: "Creator deactivated",
        });
      } else {
        await api.creators.activate(creator.id);
        addToast({
          type: "success",
          title: "Success",
          message: "Creator activated",
        });
      }
      fetchCreators();
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to update status",
      });
    }
  };

  const openProfile = (creator: Creator) => {
    setSelectedCreator(creator);
    setShowProfileModal(true);
  };

  const filteredCreators = creators;

  if (isLoading && page === 1) {
    return (
      <div
        className={cn(
          "space-y-6 min-h-screen font-sans",
          isDark ? "bg-[#020617]" : "bg-[#F1F5F9]",
        )}
      >
        {viewMode === "list" ? (
          <SkeletonTable rows={10} cols={6} />
        ) : (
          <SkeletonList count={8} />
        )}
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
              placeholder="Search creators..."
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
            {CREATOR_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "p-3 rounded-2xl transition-all",
              viewMode === "list"
                ? isDark
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-emerald-100 text-emerald-600"
                : isDark
                  ? "bg-slate-800 text-slate-400 hover:text-slate-200"
                  : "bg-white text-slate-400 hover:text-slate-600",
            )}
          >
            <Icons.List size={18} />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "p-3 rounded-2xl transition-all",
              viewMode === "grid"
                ? isDark
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-emerald-100 text-emerald-600"
                : isDark
                  ? "bg-slate-800 text-slate-400 hover:text-slate-200"
                  : "bg-white text-slate-400 hover:text-slate-600",
            )}
          >
            <Icons.Grid size={18} />
          </button>
        </div>
      </div>

      {filteredCreators.length === 0 ? (
        <Card
          className={cn(
            "p-12 rounded-[3rem] border-none shadow-xl text-center transition-colors duration-300",
            isDark ? "bg-slate-800" : "bg-white",
          )}
        >
          <CardContent>
            <Icons.Users
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
              No creators found
            </p>
          </CardContent>
        </Card>
      ) : viewMode === "list" ? (
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
                  <th className="px-8 py-5 text-left">Creator</th>
                  <th className="px-4 py-5 text-left">Channel</th>
                  <th className="px-4 py-5 text-left">Status</th>
                  <th className="px-4 py-5 text-left">Online</th>
                  <th className="px-4 py-5 text-left">Videos</th>
                  <th className="px-4 py-5 text-left">Earnings</th>
                  <th className="px-4 py-5 text-left">Actions</th>
                </tr>
              </thead>
              <tbody
                className={cn(
                  "divide-y",
                  isDark ? "divide-slate-700" : "divide-slate-50",
                )}
              >
                {filteredCreators.map((creator) => (
                  <tr
                    key={creator.id}
                    className={cn(
                      "hover transition-all group",
                      isDark ? "hover:bg-slate-700/50" : "hover:bg-slate-50",
                    )}
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            "avatar avatar-md font-bold",
                            isDark
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-emerald-100 text-emerald-600",
                          )}
                        >
                          {getInitials(creator.name)}
                        </div>
                        <div>
                          <p
                            className={cn(
                              "text-sm font-black",
                              isDark ? "text-white" : "text-slate-800",
                            )}
                          >
                            {creator.name}
                          </p>
                          <p
                            className={cn(
                              "text-xs font-bold uppercase",
                              isDark ? "text-slate-500" : "text-slate-400",
                            )}
                          >
                            {creator.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td
                      className={cn(
                        "px-4 py-5 text-sm",
                        isDark ? "text-slate-400" : "text-slate-500",
                      )}
                    >
                      {creator.channelName}
                    </td>
                    <td className="px-4 py-5">
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
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "h-2 w-2 rounded-full",
                            creator.onlineStatus === "online"
                              ? "bg-emerald-400"
                              : creator.onlineStatus === "away"
                                ? "bg-amber-400"
                                : isDark
                                  ? "bg-slate-600"
                                  : "bg-slate-300",
                          )}
                        />
                        <span
                          className={cn(
                            "text-xs font-bold uppercase",
                            isDark ? "text-slate-500" : "text-slate-400",
                          )}
                        >
                          {formatRelativeTime(creator.lastSeen)}
                        </span>
                      </div>
                    </td>
                    <td
                      className={cn(
                        "px-4 py-5 text-sm font-medium",
                        isDark ? "text-slate-400" : "text-slate-500",
                      )}
                    >
                      {formatNumber(creator.totalVideos)}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-5 text-sm font-bold",
                        isDark ? "text-emerald-400" : "text-emerald-600",
                      )}
                    >
                      {formatCurrency(creator.totalEarnings)}
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openProfile(creator)}
                          className={cn(
                            "p-2 rounded-xl transition-all",
                            isDark
                              ? "hover:bg-slate-700 text-slate-400 hover:text-slate-200"
                              : "hover:bg-slate-100 text-slate-400 hover:text-slate-600",
                          )}
                          title="View profile"
                        >
                          <Icons.Eye size={16} />
                        </button>
                        {creator.status === "pending" && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedCreator(creator);
                                setShowApproveModal(true);
                              }}
                              className="p-2 rounded-xl hover:bg-emerald-500/10 text-emerald-400 transition-all"
                              title="Approve"
                            >
                              <Icons.Check size={16} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedCreator(creator);
                                setShowRejectModal(true);
                              }}
                              className="p-2 rounded-xl hover:bg-red-500/10 text-red-400 transition-all"
                              title="Reject"
                            >
                              <Icons.XCircle size={16} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleToggleStatus(creator)}
                          className={cn(
                            "p-2 rounded-xl transition-all",
                            isDark
                              ? "hover:bg-slate-700 text-slate-400 hover:text-slate-200"
                              : "hover:bg-slate-100 text-slate-400 hover:text-slate-600",
                          )}
                          title={
                            creator.status === "active"
                              ? "Deactivate"
                              : "Activate"
                          }
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
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredCreators.map((creator) => (
            <Card
              key={creator.id}
              hover
              className={cn(
                "rounded-[3rem] border-none shadow-xl transition-all duration-300",
                isDark ? "bg-slate-800" : "bg-white",
              )}
            >
              <CardContent className="pt-8 pb-8">
                <div className="flex flex-col items-center text-center">
                  <div
                    className={cn(
                      "avatar avatar-lg font-bold text-lg",
                      isDark
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-emerald-100 text-emerald-600",
                    )}
                  >
                    {getInitials(creator.name)}
                  </div>
                  <h3
                    className={cn(
                      "mt-4 text-lg font-black",
                      isDark ? "text-white" : "text-slate-800",
                    )}
                  >
                    {creator.name}
                  </h3>
                  <p
                    className={cn(
                      "text-xs font-bold uppercase tracking-wider mt-1",
                      isDark ? "text-slate-500" : "text-slate-400",
                    )}
                  >
                    {creator.channelName}
                  </p>
                  <div className="mt-4 flex items-center gap-2">
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
                    <span
                      className={cn(
                        "h-2.5 w-2.5 rounded-full",
                        creator.onlineStatus === "online"
                          ? "bg-emerald-400"
                          : creator.onlineStatus === "away"
                            ? "bg-amber-400"
                            : isDark
                              ? "bg-slate-600"
                              : "bg-slate-300",
                      )}
                    />
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-4 w-full">
                    <div
                      className={cn(
                        "p-4 rounded-2xl",
                        isDark ? "bg-slate-700/50" : "bg-slate-50",
                      )}
                    >
                      <p
                        className={cn(
                          "text-xl font-black",
                          isDark ? "text-white" : "text-slate-800",
                        )}
                      >
                        {formatNumber(creator.totalVideos)}
                      </p>
                      <p
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-wider",
                          isDark ? "text-slate-500" : "text-slate-400",
                        )}
                      >
                        Videos
                      </p>
                    </div>
                    <div
                      className={cn(
                        "p-4 rounded-2xl",
                        isDark ? "bg-emerald-900/30" : "bg-emerald-50",
                      )}
                    >
                      <p
                        className={cn(
                          "text-xl font-black",
                          isDark ? "text-emerald-400" : "text-emerald-600",
                        )}
                      >
                        {formatCurrency(creator.totalEarnings)}
                      </p>
                      <p
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-wider",
                          isDark ? "text-emerald-500" : "text-emerald-500",
                        )}
                      >
                        Earnings
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 flex gap-2 w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "flex-1",
                        isDark ? "border-slate-600 hover:bg-slate-700" : "",
                      )}
                      onClick={() => openProfile(creator)}
                    >
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={
                        isDark
                          ? "text-slate-400 hover:text-slate-200 hover:bg-slate-700"
                          : ""
                      }
                      onClick={() => handleToggleStatus(creator)}
                    >
                      {creator.status === "active" ? (
                        <Icons.Lock size={14} />
                      ) : (
                        <Icons.Unlock size={14} />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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

      <Modal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        title="Creator Profile"
        size="lg"
      >
        {selectedCreator && (
          <div className="space-y-6">
            {/* Creator Header Card */}
            <div
              className={cn(
                "p-6 rounded-[2.5rem] bg-gradient-to-br from-emerald-400 to-emerald-600 text-white relative overflow-hidden",
              )}
            >
              <div className="relative z-10 flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-black text-xl">
                  {getInitials(selectedCreator.name)}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-black">{selectedCreator.name}</h3>
                  <p className="text-xs font-medium opacity-80">
                    {selectedCreator.email}
                  </p>
                </div>
                <Badge
                  variant={
                    selectedCreator.status === "active"
                      ? "success"
                      : selectedCreator.status === "pending"
                        ? "warning"
                        : "danger"
                  }
                  className={cn(
                    "text-[10px] font-black uppercase tracking-wider",
                    selectedCreator.status === "active"
                      ? "bg-white/20 text-white"
                      : "",
                  )}
                >
                  {selectedCreator.status}
                </Badge>
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-3xl" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div
                className={cn(
                  "p-6 rounded-[2rem] transition-colors duration-300",
                  isDark ? "bg-slate-700/50" : "bg-slate-50",
                )}
              >
                <p
                  className={cn(
                    "text-[10px] font-black uppercase tracking-wider mb-2",
                    isDark ? "text-slate-400" : "text-slate-400",
                  )}
                >
                  Channel
                </p>
                <p
                  className={cn(
                    "text-lg font-black",
                    isDark ? "text-white" : "text-slate-800",
                  )}
                >
                  {selectedCreator.channelName}
                </p>
              </div>
              <div
                className={cn(
                  "p-6 rounded-[2rem] transition-colors duration-300",
                  isDark ? "bg-slate-700/50" : "bg-slate-50",
                )}
              >
                <p
                  className={cn(
                    "text-[10px] font-black uppercase tracking-wider mb-2",
                    isDark ? "text-slate-400" : "text-slate-400",
                  )}
                >
                  Videos
                </p>
                <p
                  className={cn(
                    "text-lg font-black",
                    isDark ? "text-white" : "text-slate-800",
                  )}
                >
                  {formatNumber(selectedCreator.totalVideos)}
                </p>
              </div>
              <div
                className={cn(
                  "p-6 rounded-[2rem] transition-colors duration-300",
                  isDark ? "bg-slate-700/50" : "bg-slate-50",
                )}
              >
                <p
                  className={cn(
                    "text-[10px] font-black uppercase tracking-wider mb-2",
                    isDark ? "text-slate-400" : "text-slate-400",
                  )}
                >
                  Total Views
                </p>
                <p
                  className={cn(
                    "text-lg font-black",
                    isDark ? "text-white" : "text-slate-800",
                  )}
                >
                  {formatNumber(selectedCreator.totalViews)}
                </p>
              </div>
              <div
                className={cn(
                  "p-6 rounded-[2rem] bg-gradient-to-br from-amber-400 to-amber-600 text-white",
                )}
              >
                <p
                  className={cn(
                    "text-[10px] font-black uppercase tracking-wider mb-2 opacity-80",
                  )}
                >
                  Total Earnings
                </p>
                <p className="text-lg font-black">
                  {formatCurrency(selectedCreator.totalEarnings)}
                </p>
              </div>
            </div>

            {/* SmatPay Section */}
            {selectedCreator.smatPayMerchantId && (
              <div
                className={cn(
                  "p-6 rounded-[2rem] transition-colors duration-300",
                  isDark ? "bg-slate-800" : "bg-white",
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={cn(
                        "text-[10px] font-black uppercase tracking-wider mb-1",
                        isDark ? "text-slate-400" : "text-slate-400",
                      )}
                    >
                      SmatPay Merchant
                    </p>
                    <p
                      className={cn(
                        "text-sm font-bold",
                        isDark ? "text-white" : "text-slate-800",
                      )}
                    >
                      {selectedCreator.smatPayMerchantId}
                    </p>
                  </div>
                  <Badge
                    variant={
                      selectedCreator.smatPayStatus === "verified"
                        ? "success"
                        : selectedCreator.smatPayStatus === "pending"
                          ? "warning"
                          : "danger"
                    }
                    className="text-[10px] font-black uppercase tracking-wider"
                  >
                    {selectedCreator.smatPayStatus}
                  </Badge>
                </div>
              </div>
            )}

            {/* Online Status */}
            <div
              className={cn(
                "p-4 rounded-[2rem] flex items-center gap-4 transition-colors duration-300",
                isDark ? "bg-slate-700/30" : "bg-slate-50",
              )}
            >
              <span
                className={cn(
                  "h-3 w-3 rounded-full",
                  selectedCreator.onlineStatus === "online"
                    ? "bg-emerald-400"
                    : selectedCreator.onlineStatus === "away"
                      ? "bg-amber-400"
                      : isDark
                        ? "bg-slate-600"
                        : "bg-slate-300",
                )}
              />
              <span
                className={cn(
                  "text-xs font-black uppercase tracking-wider",
                  isDark ? "text-slate-400" : "text-slate-400",
                )}
              >
                Last seen {formatRelativeTime(selectedCreator.lastSeen)}
              </span>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmModal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onConfirm={handleApprove}
        title="Approve Creator"
        message={`Are you sure you want to approve "${selectedCreator?.name}"?`}
        confirmText="Approve"
        variant="info"
      />

      <ConfirmModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleReject}
        title="Reject Creator"
        message={`Are you sure you want to reject "${selectedCreator?.name}"?`}
        confirmText="Reject"
        variant="danger"
      />
    </div>
  );
}
