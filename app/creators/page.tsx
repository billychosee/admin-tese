"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ConfirmModal } from "@/components/ui/Modal";
import { SkeletonList, SkeletonTable } from "@/components/ui/Skeleton";
import { CreatorTable } from "@/components/Tables/CreatorTable";
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
        <CreatorTable
          creators={filteredCreators}
          isLoading={isLoading}
          onViewProfile={openProfile}
          onToggleStatus={handleToggleStatus}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredCreators.map((creator) => (
            <Card
              key={creator.id}
              hover
              className={cn(
                "rounded-2xl border transition-all duration-300",
                colors.surfaceBorder,
                colors.surface,
              )}
            >
              <CardContent className="p-5">
                <div className="flex flex-col">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "avatar font-bold text-xs",
                          isDark
                            ? "bg-[hsl(var(--primary))]/20 text-[hsl(var(--primary))]"
                            : "bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]",
                        )}
                      >
                        {getInitials(`${creator.firstName} ${creator.lastName}`)}
                      </div>
                      <div>
                        <h3
                          className={cn(
                            "text-sm font-semibold",
                            colors.textPrimary,
                          )}
                        >
                          {creator.firstName} {creator.lastName}
                        </h3>
                        <p
                          className={cn(
                            "text-xs font-medium uppercase tracking-wider",
                            colors.textMuted,
                          )}
                        >
                          {creator.channelName}
                        </p>
                      </div>
                    </div>
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
                  </div>
                  <div
                    className={cn(
                      "mt-4 h-px w-full",
                      colors.surfaceBorder,
                    )}
                  />
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div
                      className={cn(
                        "rounded-lg p-3 transition-colors duration-300",
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
                          "text-[10px] font-medium uppercase tracking-wider",
                          colors.textMuted,
                        )}
                      >
                        Videos
                      </p>
                    </div>
                    <div
                      className={cn(
                        "rounded-lg p-3 transition-colors duration-300",
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
                          "text-[10px] font-medium uppercase tracking-wider",
                          colors.successText,
                        )}
                      >
                        Earnings
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
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
                      <span
                        className={cn(
                          "text-xs font-medium uppercase tracking-wider",
                          colors.textMuted,
                        )}
                      >
                        {creator.onlineStatus}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-8 w-8 p-0 transition-colors duration-300",
                          isDark
                            ? `${colors.textSecondary} hover:${colors.textPrimary} hover:${colors.surfaceHover}`
                            : "",
                        )}
                        onClick={() => openProfile(creator)}
                      >
                        <Icons.Eye size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-8 w-8 p-0 transition-colors duration-300",
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
        size="xl"
      >
        {selectedCreator && (
          <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-4">
            {/* Creator Header Card */}
            <div
              className={cn(
                "p-4 rounded-xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary))] text-white relative overflow-hidden",
              )}
            >
              <div className="relative z-10 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-bold">
                  {selectedCreator.avatar ? (
                    <img
                      src={selectedCreator.avatar}
                      alt={selectedCreator.firstName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    getInitials(`${selectedCreator.firstName} ${selectedCreator.lastName}`)
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold truncate">{selectedCreator.firstName} {selectedCreator.lastName}</h3>
                  <p className="text-xs opacity-80 truncate">{selectedCreator.email}</p>
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
                    "text-[10px] font-bold uppercase tracking-wider flex-shrink-0",
                    selectedCreator.status === "active"
                      ? "bg-white/20 text-white border-white/30"
                      : "",
                  )}
                >
                  {selectedCreator.status}
                </Badge>
              </div>
            </div>

            {/* Personal Information Table */}
            <div className={cn("rounded-lg overflow-hidden", colors.surface)}>
              <div className={cn("px-4 py-2 text-[10px] font-bold uppercase tracking-wider", colors.textSecondary)}>
                Personal Information
              </div>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  <tr className={cn("hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors", isDark ? "" : "bg-slate-50")}>
                    <td className={cn("px-4 py-2 font-medium w-32", colors.textSecondary)}>Name</td>
                    <td className={cn("px-4 py-2 font-semibold", colors.textPrimary)}>
                      {selectedCreator.firstName} {selectedCreator.lastName}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className={cn("px-4 py-2 font-medium", colors.textSecondary)}>Email</td>
                    <td className={cn("px-4 py-2 font-semibold truncate", colors.textPrimary)}>
                      {selectedCreator.email}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className={cn("px-4 py-2 font-medium", colors.textSecondary)}>Phone</td>
                    <td className={cn("px-4 py-2 font-semibold font-mono", colors.textPrimary)}>
                      {selectedCreator.phone}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Address Table */}
            <div className={cn("rounded-lg overflow-hidden", colors.surface)}>
              <div className={cn("px-4 py-2 text-[10px] font-bold uppercase tracking-wider", colors.textSecondary)}>
                Address
              </div>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  <tr className={cn("hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors", isDark ? "" : "bg-slate-50")}>
                    <td className={cn("px-4 py-2 font-medium w-32", colors.textSecondary)}>Full Address</td>
                    <td className={cn("px-4 py-2 font-semibold", colors.textPrimary)}>
                      {selectedCreator.address}
                      <br />
                      <span className={cn("text-xs", colors.textSecondary)}>
                        {selectedCreator.city}, {selectedCreator.province} {selectedCreator.postalCode}
                      </span>
                      <br />
                      <span className={cn("text-xs", colors.textSecondary)}>
                        {selectedCreator.country}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Identity Verification Table */}
            <div className={cn("rounded-lg overflow-hidden", colors.surface)}>
              <div className={cn("px-4 py-2 text-[10px] font-bold uppercase tracking-wider", colors.textSecondary)}>
                Identity Verification
              </div>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  <tr className={cn("hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors", isDark ? "" : "bg-slate-50")}>
                    <td className={cn("px-4 py-2 font-medium w-32", colors.textSecondary)}>ID Type</td>
                    <td className={cn("px-4 py-2 font-semibold capitalize", colors.textPrimary)}>
                      {selectedCreator.idType?.replace("_", " ") || "N/A"}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className={cn("px-4 py-2 font-medium", colors.textSecondary)}>ID Number</td>
                    <td className={cn("px-4 py-2 font-semibold font-mono", colors.textPrimary)}>
                      {selectedCreator.idNumber || "N/A"}
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="px-4 py-2 flex gap-2">
                {selectedCreator.idCopyUrl && (
                  <a
                    href={selectedCreator.idCopyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                      isDark
                        ? "bg-[hsl(var(--primary))]/20 text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/30"
                        : "bg-emerald-100 text-emerald-600 hover:bg-emerald-200",
                    )}
                  >
                    <Icons.File size={14} />
                    ID Copy
                  </a>
                )}
                {selectedCreator.proofOfResidenceUrl && (
                  <a
                    href={selectedCreator.proofOfResidenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                      isDark
                        ? "bg-[hsl(var(--primary))]/20 text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/30"
                        : "bg-blue-100 text-blue-600 hover:bg-blue-200",
                    )}
                  >
                    <Icons.Home size={14} />
                    Proof of Residence
                  </a>
                )}
              </div>
            </div>

            {/* Banking Details Table */}
            <div className={cn("rounded-lg overflow-hidden", colors.surface)}>
              <div className={cn("px-4 py-2 text-[10px] font-bold uppercase tracking-wider", colors.textSecondary)}>
                Banking Details
              </div>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  <tr className={cn("hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors", isDark ? "" : "bg-slate-50")}>
                    <td className={cn("px-4 py-2 font-medium w-32", colors.textSecondary)}>Bank Name</td>
                    <td className={cn("px-4 py-2 font-semibold", colors.textPrimary)}>
                      {selectedCreator.bankName || "N/A"}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className={cn("px-4 py-2 font-medium", colors.textSecondary)}>Account Holder</td>
                    <td className={cn("px-4 py-2 font-semibold", colors.textPrimary)}>
                      {selectedCreator.accountHolderName || "N/A"}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className={cn("px-4 py-2 font-medium", colors.textSecondary)}>Account Number</td>
                    <td className={cn("px-4 py-2 font-semibold font-mono", colors.textPrimary)}>
                      {selectedCreator.bankAccountNumber || "N/A"}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className={cn("px-4 py-2 font-medium", colors.textSecondary)}>Branch</td>
                    <td className={cn("px-4 py-2 font-semibold", colors.textPrimary)}>
                      {selectedCreator.bankBranch || "N/A"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Channel Information Table */}
            <div className={cn("rounded-lg overflow-hidden", colors.surface)}>
              <div className={cn("px-4 py-2 text-[10px] font-bold uppercase tracking-wider", colors.textSecondary)}>
                Channel Information
              </div>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  <tr className={cn("hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors", isDark ? "" : "bg-slate-50")}>
                    <td className={cn("px-4 py-2 font-medium w-32", colors.textSecondary)}>Channel Name</td>
                    <td className={cn("px-4 py-2 font-semibold", colors.textPrimary)}>
                      {selectedCreator.channelName}
                    </td>
                  </tr>
                  {selectedCreator.channelUrl && (
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className={cn("px-4 py-2 font-medium", colors.textSecondary)}>Channel URL</td>
                      <td className={cn("px-4 py-2 font-semibold truncate", colors.primaryText)}>
                        <a href={selectedCreator.channelUrl} target="_blank" rel="noopener noreferrer">
                          {selectedCreator.channelUrl}
                        </a>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* SmatPay Section */}
            {selectedCreator.smatPayMerchantId && (
              <div className={cn("rounded-lg overflow-hidden", colors.surface)}>
                <div className={cn("px-4 py-2 text-[10px] font-bold uppercase tracking-wider flex items-center justify-between", colors.textSecondary)}>
                  <span>SmatPay Integration</span>
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
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    <tr className={cn("hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors", isDark ? "" : "bg-slate-50")}>
                      <td className={cn("px-4 py-2 font-medium w-32", colors.textSecondary)}>Merchant ID</td>
                      <td className={cn("px-4 py-2 font-semibold font-mono text-xs", colors.textPrimary)}>
                        {selectedCreator.smatPayMerchantId}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Online Status */}
            <div
              className={cn(
                "p-3 rounded-lg flex items-center gap-3 transition-colors duration-300",
                isDark
                  ? "bg-[hsl(var(--surface-hover))]/30"
                  : "bg-[hsl(var(--surface-hover))]",
              )}
            >
              <span
                className={cn(
                  "h-2 w-2 rounded-full flex-shrink-0",
                  selectedCreator.onlineStatus === "online"
                    ? "bg-[hsl(var(--success))]"
                    : selectedCreator.onlineStatus === "away"
                      ? "bg-[hsl(var(--warning))]"
                      : colors.textMuted,
                )}
              />
              <span className={cn("text-xs font-bold uppercase tracking-wider flex-1", colors.textSecondary)}>
                {selectedCreator.onlineStatus} - Last seen {formatRelativeTime(selectedCreator.lastSeen)}
              </span>
            </div>

            {/* Approval Actions for Pending Creators */}
            {selectedCreator.status === "pending" && (
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    setShowApproveModal(true);
                  }}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors",
                    isDark
                      ? "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400"
                      : "bg-emerald-100 hover:bg-emerald-200 text-emerald-600",
                  )}
                >
                  <Icons.Check size={16} />
                  <span className="font-semibold text-sm">Approve</span>
                </button>
                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    setShowRejectModal(true);
                  }}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors",
                    isDark
                      ? "bg-red-500/20 hover:bg-red-500/30 text-red-400"
                      : "bg-red-100 hover:bg-red-200 text-red-600",
                  )}
                >
                  <Icons.XCircle size={16} />
                  <span className="font-semibold text-sm">Reject</span>
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmModal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onConfirm={handleApprove}
        title="Approve Creator"
        message={`Are you sure you want to approve "${selectedCreator?.firstName} ${selectedCreator?.lastName}"?`}
        confirmText="Approve"
        variant="info"
      />

      <ConfirmModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleReject}
        title="Reject Creator"
        message={`Are you sure you want to reject "${selectedCreator?.firstName} ${selectedCreator?.lastName}"?`}
        confirmText="Reject"
        variant="danger"
      />
    </div>
  );
}
