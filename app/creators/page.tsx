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

  // Color tokens for consistent theming
  const colors = {
    background: "bg-[hsl(var(--background))]",
    surface: "bg-[hsl(var(--surface))]",
    surfaceMuted: "bg-[hsl(var(--surface-muted))]",
    surfaceHover: "bg-[hsl(var(--surface-hover))]",
    surfaceBorder: "border-[hsl(var(--surface-border))]",
    textPrimary: "text-[hsl(var(--text-primary))]",
    textSecondary: "text-[hsl(var(--text-secondary))]",
    textMuted: "text-[hsl(var(--text-muted))]",
    primary: "bg-[hsl(var(--primary))]",
    primaryText: "text-[hsl(var(--primary))]",
    primaryForeground: "text-[hsl(var(--primary-foreground))]",
    success: "bg-[hsl(var(--success))]",
    successText: "text-[hsl(var(--success))]",
    warning: "bg-[hsl(var(--warning))]",
    warningText: "text-[hsl(var(--warning))]",
    danger: "bg-[hsl(var(--danger))]",
    dangerText: "text-[hsl(var(--danger))]",
    info: "bg-[hsl(var(--info))]",
    focusRing: "focus:ring-[hsl(var(--focus-ring))]",
  };

  if (isLoading && page === 1) {
    return (
      <div
        className={cn(
          "space-y-6 min-h-screen font-sans transition-colors duration-300",
          colors.background,
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
        colors.background,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={cn("relative", colors.surfaceMuted)}>
            <Input
              placeholder="Search creators..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "w-64 pl-10 transition-colors duration-300",
                colors.surface,
                colors.surfaceBorder,
                colors.textPrimary,
                "placeholder:text-[hsl(var(--text-muted))]",
              )}
            />
            <Icons.Search
              size={18}
              className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2",
                colors.textMuted,
              )}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={cn(
              "input w-40 transition-colors duration-300",
              colors.surface,
              colors.surfaceBorder,
              colors.textPrimary,
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
                  ? "bg-[hsl(var(--primary))]/20 text-[hsl(var(--primary))]"
                  : "bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]"
                : isDark
                  ? `${colors.surfaceMuted} ${colors.textSecondary} hover:${colors.textPrimary}`
                  : `${colors.surface} ${colors.textSecondary} hover:${colors.textPrimary}`,
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
                  ? "bg-[hsl(var(--primary))]/20 text-[hsl(var(--primary))]"
                  : "bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]"
                : isDark
                  ? `${colors.surfaceMuted} ${colors.textSecondary} hover:${colors.textPrimary}`
                  : `${colors.surface} ${colors.textSecondary} hover:${colors.textPrimary}`,
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
            colors.surface,
          )}
        >
          <CardContent>
            <Icons.Users
              className={cn("mx-auto h-16 w-16 mb-4", colors.textMuted)}
            />
            <p className={cn("text-lg font-medium", colors.textSecondary)}>
              No creators found
            </p>
          </CardContent>
        </Card>
      ) : viewMode === "list" ? (
        <Card
          className={cn(
            "rounded-[3rem] border-none shadow-xl overflow-hidden transition-colors duration-300",
            colors.surface,
          )}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  className={cn(
                    "border-b text-xs font-black uppercase tracking-widest",
                    colors.surfaceBorder,
                    colors.textSecondary,
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
                  "divide-y transition-colors duration-300",
                  colors.surfaceBorder,
                )}
              >
                {filteredCreators.map((creator) => (
                  <tr
                    key={creator.id}
                    className={cn(
                      "hover transition-all group",
                      isDark
                        ? "hover:bg-[hsl(var(--surface-hover))]/50"
                        : "hover:bg-[hsl(var(--surface-hover))]",
                    )}
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            "avatar avatar-md font-bold",
                            isDark
                              ? "bg-[hsl(var(--primary))]/20 text-[hsl(var(--primary))]"
                              : "bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]",
                          )}
                        >
                          {getInitials(creator.name)}
                        </div>
                        <div>
                          <p
                            className={cn(
                              "text-sm font-black",
                              colors.textPrimary,
                            )}
                          >
                            {creator.name}
                          </p>
                          <p
                            className={cn(
                              "text-xs font-bold uppercase",
                              colors.textMuted,
                            )}
                          >
                            {creator.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td
                      className={cn("px-4 py-5 text-sm", colors.textSecondary)}
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
                              ? "bg-[hsl(var(--success))]"
                              : creator.onlineStatus === "away"
                                ? "bg-[hsl(var(--warning))]"
                                : colors.textMuted,
                          )}
                        />
                        <span
                          className={cn(
                            "text-xs font-bold uppercase",
                            colors.textMuted,
                          )}
                        >
                          {formatRelativeTime(creator.lastSeen)}
                        </span>
                      </div>
                    </td>
                    <td
                      className={cn(
                        "px-4 py-5 text-sm font-medium",
                        colors.textSecondary,
                      )}
                    >
                      {formatNumber(creator.totalVideos)}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-5 text-sm font-bold",
                        colors.successText,
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
                              ? `${colors.surfaceHover} ${colors.textSecondary} hover:${colors.textPrimary}`
                              : `${colors.surfaceHover} ${colors.textSecondary} hover:${colors.textPrimary}`,
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
                              className={cn(
                                "p-2 rounded-xl transition-all hover:bg-[hsl(var(--success))]/10",
                                colors.successText,
                              )}
                              title="Approve"
                            >
                              <Icons.Check size={16} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedCreator(creator);
                                setShowRejectModal(true);
                              }}
                              className={cn(
                                "p-2 rounded-xl transition-all hover:bg-[hsl(var(--danger))]/10",
                                colors.dangerText,
                              )}
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
                              ? `${colors.surfaceHover} ${colors.textSecondary} hover:${colors.textPrimary}`
                              : `${colors.surfaceHover} ${colors.textSecondary} hover:${colors.textPrimary}`,
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
                colors.surface,
              )}
            >
              <CardContent className="p-5">
                <div className="flex flex-col items-center text-center">
                  <div
                    className={cn(
                      "avatar font-bold text-sm",
                      isDark
                        ? "bg-[hsl(var(--primary))]/20 text-[hsl(var(--primary))]"
                        : "bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]",
                    )}
                  >
                    {getInitials(creator.name)}
                  </div>
                  <h3
                    className={cn("mt-3 text-sm font-bold", colors.textPrimary)}
                  >
                    {creator.name}
                  </h3>
                  <p
                    className={cn(
                      "text-[10px] font-medium uppercase tracking-wider mt-1",
                      colors.textMuted,
                    )}
                  >
                    {creator.channelName}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
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
                          ? "bg-[hsl(var(--success))]"
                          : creator.onlineStatus === "away"
                            ? "bg-[hsl(var(--warning))]"
                            : colors.textMuted,
                      )}
                    />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 w-full">
                    <div
                      className={cn(
                        "p-3 rounded-xl transition-colors duration-300",
                        isDark
                          ? "bg-[hsl(var(--surface-hover))]/50"
                          : "bg-[hsl(var(--surface-hover))]",
                      )}
                    >
                      <p
                        className={cn(
                          "text-base font-bold",
                          colors.textPrimary,
                        )}
                      >
                        {formatNumber(creator.totalVideos)}
                      </p>
                      <p
                        className={cn(
                          "text-[9px] font-medium uppercase tracking-wider",
                          colors.textMuted,
                        )}
                      >
                        Videos
                      </p>
                    </div>
                    <div
                      className={cn(
                        "p-3 rounded-xl transition-colors duration-300",
                        isDark
                          ? "bg-[hsl(var(--success))]/10"
                          : "bg-[hsl(var(--success))]/10",
                      )}
                    >
                      <p
                        className={cn(
                          "text-base font-bold",
                          colors.successText,
                        )}
                      >
                        {formatCurrency(creator.totalEarnings)}
                      </p>
                      <p
                        className={cn(
                          "text-[9px] font-medium uppercase tracking-wider",
                          colors.successText,
                        )}
                      >
                        Earnings
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2 w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "flex-1 transition-colors duration-300",
                        colors.surfaceBorder,
                        isDark ? `hover:${colors.surfaceHover}` : "",
                      )}
                      onClick={() => openProfile(creator)}
                    >
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "transition-colors duration-300",
                        isDark
                          ? `${colors.textSecondary} hover:${colors.textPrimary} hover:${colors.surfaceHover}`
                          : "",
                      )}
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
            "flex items-center justify-center gap-4 py-4 transition-colors duration-300",
            isDark ? "rounded-3xl" : "rounded-3xl shadow-xl",
            colors.surface,
          )}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className={cn(
              "transition-colors duration-300",
              colors.surfaceBorder,
              isDark ? `hover:${colors.surfaceHover}` : "",
            )}
          >
            Previous
          </Button>
          <span
            className={cn(
              "text-sm font-black uppercase tracking-wider px-4",
              colors.textSecondary,
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
              "transition-colors duration-300",
              colors.surfaceBorder,
              isDark ? `hover:${colors.surfaceHover}` : "",
            )}
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
          <div className="space-y-5">
            {/* Creator Header Card */}
            <div
              className={cn(
                "p-5 rounded-[2rem] bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary))] text-white relative overflow-hidden",
              )}
            >
              <div className="relative z-10 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-bold text-lg">
                  {getInitials(selectedCreator.name)}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold">{selectedCreator.name}</h3>
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
                    "text-[10px] font-bold uppercase tracking-wider",
                    selectedCreator.status === "active"
                      ? "bg-white/20 text-white border-white/30"
                      : "",
                  )}
                >
                  {selectedCreator.status}
                </Badge>
              </div>
              <div className="absolute -bottom-3 -right-3 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div
                className={cn(
                  "p-4 rounded-xl transition-colors duration-300",
                  isDark
                    ? "bg-[hsl(var(--surface-hover))]/50"
                    : "bg-[hsl(var(--surface-hover))]",
                )}
              >
                <p
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-wider mb-1.5",
                    colors.textSecondary,
                  )}
                >
                  Channel
                </p>
                <p className={cn("text-base font-bold", colors.textPrimary)}>
                  {selectedCreator.channelName}
                </p>
              </div>
              <div
                className={cn(
                  "p-4 rounded-xl transition-colors duration-300",
                  isDark
                    ? "bg-[hsl(var(--surface-hover))]/50"
                    : "bg-[hsl(var(--surface-hover))]",
                )}
              >
                <p
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-wider mb-1.5",
                    colors.textSecondary,
                  )}
                >
                  Videos
                </p>
                <p className={cn("text-base font-bold", colors.textPrimary)}>
                  {formatNumber(selectedCreator.totalVideos)}
                </p>
              </div>
              <div
                className={cn(
                  "p-4 rounded-xl transition-colors duration-300",
                  isDark
                    ? "bg-[hsl(var(--surface-hover))]/50"
                    : "bg-[hsl(var(--surface-hover))]",
                )}
              >
                <p
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-wider mb-1.5",
                    colors.textSecondary,
                  )}
                >
                  Total Views
                </p>
                <p className={cn("text-base font-bold", colors.textPrimary)}>
                  {formatNumber(selectedCreator.totalViews)}
                </p>
              </div>
              <div
                className={cn(
                  "p-4 rounded-xl bg-gradient-to-br from-[hsl(var(--warning))] to-[hsl(var(--warning))] text-white",
                )}
              >
                <p
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-wider mb-1.5 opacity-80",
                  )}
                >
                  Total Earnings
                </p>
                <p className="text-base font-bold">
                  {formatCurrency(selectedCreator.totalEarnings)}
                </p>
              </div>
            </div>

            {/* SmatPay Section */}
            {selectedCreator.smatPayMerchantId && (
              <div
                className={cn(
                  "p-4 rounded-xl transition-colors duration-300",
                  colors.surface,
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={cn(
                        "text-[10px] font-bold uppercase tracking-wider mb-1",
                        colors.textSecondary,
                      )}
                    >
                      SmatPay Merchant
                    </p>
                    <p
                      className={cn("text-sm font-medium", colors.textPrimary)}
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
                    className="text-[10px] font-bold uppercase tracking-wider"
                  >
                    {selectedCreator.smatPayStatus}
                  </Badge>
                </div>
              </div>
            )}

            {/* Online Status */}
            <div
              className={cn(
                "p-3 rounded-xl flex items-center gap-3 transition-colors duration-300",
                isDark
                  ? "bg-[hsl(var(--surface-hover))]/30"
                  : "bg-[hsl(var(--surface-hover))]",
              )}
            >
              <span
                className={cn(
                  "h-2.5 w-2.5 rounded-full",
                  selectedCreator.onlineStatus === "online"
                    ? "bg-[hsl(var(--success))]"
                    : selectedCreator.onlineStatus === "away"
                      ? "bg-[hsl(var(--warning))]"
                      : colors.textMuted,
                )}
              />
              <span
                className={cn(
                  "text-xs font-bold uppercase tracking-wider",
                  colors.textSecondary,
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
