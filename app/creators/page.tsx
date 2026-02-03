"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
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
  formatDate,
  getStatusColor,
  getInitials,
} from "@/utils";
import { KYC_STATUSES } from "@/constants";
import type { Creator, KYCUser, KYCStatus } from "@/types";

export default function CreatorsPage() {
  const { addToast } = useToast();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [activeTab, setActiveTab] = useState<"creators" | "kyc">("creators");

  // Creators state
  const [creators, setCreators] = useState<Creator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // KYC state
  const [kycUsers, setKycUsers] = useState<KYCUser[]>([]);
  const [kycIsLoading, setKycIsLoading] = useState(true);
  const [kycStatusFilter, setKycStatusFilter] = useState("all");
  const [kycPage, setKycPage] = useState(1);
  const [kycTotalPages, setKycTotalPages] = useState(1);
  const [selectedKyc, setSelectedKyc] = useState<KYCUser | null>(null);
  const [showKycReviewModal, setShowKycReviewModal] = useState(false);
  const [showKycSelfieModal, setShowKycSelfieModal] = useState(false);
  const [showKycIdModal, setShowKycIdModal] = useState(false);
  const [showKycApproveModal, setShowKycApproveModal] = useState(false);
  const [showKycDeclineModal, setShowKycDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState("");

  useEffect(() => {
    if (activeTab === "creators") {
      fetchCreators();
    } else {
      fetchKycUsers();
    }
  }, [page, kycPage, activeTab, kycStatusFilter]);

  // Fetch creators
  const fetchCreators = async () => {
    setIsLoading(true);
    try {
      const result = await api.creators.getAll(page, 10);
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

  // Fetch KYC users
  const fetchKycUsers = async () => {
    setKycIsLoading(true);
    try {
      const result = await api.kyc.getAll(kycPage, 10, kycStatusFilter);
      setKycUsers(result.data);
      setKycTotalPages(result.totalPages);
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to fetch KYC applications",
      });
    } finally {
      setKycIsLoading(false);
    }
  };

  // Creator handlers
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

  // KYC handlers
  const handleKycApprove = async () => {
    if (!selectedKyc) return;
    try {
      await api.kyc.approve(selectedKyc.id);
      addToast({
        type: "success",
        title: "Success",
        message: "KYC application approved",
      });
      setShowKycApproveModal(false);
      setSelectedKyc(null);
      fetchKycUsers();
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to approve KYC",
      });
    }
  };

  const handleKycDecline = async () => {
    if (!selectedKyc || !declineReason.trim()) return;
    try {
      await api.kyc.decline(selectedKyc.id, declineReason);
      addToast({
        type: "success",
        title: "Success",
        message: "KYC application declined",
      });
      setShowKycDeclineModal(false);
      setDeclineReason("");
      setSelectedKyc(null);
      fetchKycUsers();
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to decline KYC",
      });
    }
  };

  const openProfile = (creator: Creator) => {
    setSelectedCreator(creator);
    setShowProfileModal(true);
  };

  const openAvatarPreview = (creator: Creator, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCreator(creator);
    setShowAvatarModal(true);
  };

  const getKycStatusVariant = (status: KYCStatus) => {
    switch (status) {
      case "approved":
        return "success";
      case "pending_approval":
        return "warning";
      case "declined":
        return "danger";
      case "pending":
        return "neutral";
      default:
        return "neutral";
    }
  };

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

  // Loading states
  const isLoadingCreators = isLoading && page === 1;
  const isLoadingKyc = kycIsLoading && kycPage === 1;

  return (
    <div
      className={cn(
        "space-y-8 min-h-screen font-sans transition-colors duration-300",
        colors.background,
      )}
    >
      {/* Tab Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-[hsl(var(--text-primary))]">
              {activeTab === "creators" ? "Creators" : "KYC Verification"}
            </h1>
            <p className="text-xs font-bold uppercase tracking-widest mt-1 text-[hsl(var(--text-muted))]">
              {activeTab === "creators"
                ? "Manage your content creators"
                : "Verify user identity documents"}
            </p>
          </div>

          {/* Tab Buttons */}
          <div
            className="flex p-1 rounded-xl border"
            style={{
              backgroundColor: "hsl(var(--surface))",
              borderColor: "hsl(var(--surface-border))",
            }}
          >
            <button
              onClick={() => {
                setActiveTab("creators");
                setPage(1);
              }}
              className={cn(
                "px-4 py-2 rounded-lg transition-all text-sm font-medium",
                activeTab === "creators" ? "text-white shadow-lg" : "",
              )}
              style={{
                backgroundColor:
                  activeTab === "creators"
                    ? "hsl(var(--primary))"
                    : "transparent",
                color:
                  activeTab === "creators"
                    ? "hsl(var(--primary-foreground))"
                    : "hsl(var(--text-secondary))",
              }}
            >
              <Icons.Users size={16} className="inline mr-2" />
              Creators
            </button>
            <button
              onClick={() => {
                setActiveTab("kyc");
                setKycPage(1);
              }}
              className={cn(
                "px-4 py-2 rounded-lg transition-all text-sm font-medium",
                activeTab === "kyc" ? "text-white shadow-lg" : "",
              )}
              style={{
                backgroundColor:
                  activeTab === "kyc" ? "hsl(var(--primary))" : "transparent",
                color:
                  activeTab === "kyc"
                    ? "hsl(var(--primary-foreground))"
                    : "hsl(var(--text-secondary))",
              }}
            >
              <Icons.Shield size={16} className="inline mr-2" />
              KYC
            </button>
          </div>
        </div>

        {activeTab === "creators" ? (
          /* View Mode Toggle for Creators */
          <div
            className="flex p-1 rounded-xl border"
            style={{
              backgroundColor: "hsl(var(--surface))",
              borderColor: "hsl(var(--surface-border))",
            }}
          >
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-2.5 rounded-lg transition-all",
                viewMode === "list" ? "text-white shadow-lg" : "",
              )}
              style={{
                backgroundColor:
                  viewMode === "list" ? "hsl(var(--primary))" : "transparent",
                color:
                  viewMode === "list"
                    ? "hsl(var(--primary-foreground))"
                    : "hsl(var(--text-secondary))",
              }}
            >
              <Icons.List size={18} />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-2.5 rounded-lg transition-all",
                viewMode === "grid" ? "text-white shadow-lg" : "",
              )}
              style={{
                backgroundColor:
                  viewMode === "grid" ? "hsl(var(--primary))" : "transparent",
                color:
                  viewMode === "grid"
                    ? "hsl(var(--primary-foreground))"
                    : "hsl(var(--text-secondary))",
              }}
            >
              <Icons.Grid size={18} />
            </button>
          </div>
        ) : (
          /* Status Filter for KYC */
          <div className="relative">
            <select
              value={kycStatusFilter}
              onChange={(e) => {
                setKycStatusFilter(e.target.value);
                setKycPage(1);
              }}
              className="appearance-none w-full px-4 py-2 pr-10 rounded-lg text-sm h-10 cursor-pointer transition-all duration-200 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
              style={{ border: '1px solid hsl(var(--surface-border))' }}
            >
              {KYC_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            <Icons.ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        )}
      </div>

      {/* ==================== CREATORS TAB ==================== */}
      {activeTab === "creators" && (
        <>
          {isLoadingCreators ? (
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
          ) : creators.length === 0 ? (
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
              creators={creators}
              isLoading={isLoading}
              onViewProfile={openProfile}
              onToggleStatus={handleToggleStatus}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {creators.map((creator) => (
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
                          {creator.avatar ? (
                            <button
                              onClick={(e) => openAvatarPreview(creator, e)}
                              className="relative group"
                            >
                              <img
                                src={creator.avatar}
                                alt={`${creator.firstName} ${creator.lastName}`}
                                className="w-10 h-10 rounded-xl object-cover group-hover:ring-2 ring-[hsl(var(--primary))] transition-all"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity flex items-center justify-center">
                                <Icons.Search size={14} className="text-white" />
                              </div>
                            </button>
                          ) : (
                            <div
                              className={cn(
                                "avatar font-bold text-xs",
                                isDark
                                  ? "bg-[hsl(var(--primary))]/20 text-[hsl(var(--primary))]"
                                  : "bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]",
                              )}
                            >
                              {getInitials(
                                `${creator.firstName} ${creator.lastName}`,
                              )}
                            </div>
                          )}
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
                        className={cn("mt-4 h-px w-full", colors.surfaceBorder)}
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
                            title="View Profile"
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
                            title={
                              creator.status === "active"
                                ? "Deactivate"
                                : "Activate"
                            }
                          >
                            {creator.status === "active" ? (
                              <Icons.Lock size={14} />
                            ) : (
                              <Icons.Unlock size={14} />
                            )}
                          </Button>
                          {creator.status === "pending" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className={cn(
                                "h-8 w-8 p-0 transition-colors duration-300",
                                isDark
                                  ? "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                                  : "text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50",
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCreator(creator);
                                setShowApproveModal(true);
                              }}
                              title="Approve"
                            >
                              <Icons.Check size={14} />
                            </Button>
                          )}
                          {creator.status === "pending" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className={cn(
                                "h-8 w-8 p-0 transition-colors duration-300",
                                isDark
                                  ? "text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                  : "text-red-500 hover:text-red-600 hover:bg-red-50",
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCreator(creator);
                                setShowRejectModal(true);
                              }}
                              title="Reject"
                            >
                              <Icons.X size={14} />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Creators Pagination */}
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
        </>
      )}

      {/* ==================== KYC TAB ==================== */}
      {activeTab === "kyc" && (
        <>
          {isLoadingKyc ? (
            <div
              className={cn(
                "space-y-6 min-h-screen font-sans transition-colors duration-300",
                colors.background,
              )}
            >
              <SkeletonTable rows={10} cols={6} />
            </div>
          ) : (
            <>
              {/* KYC Stats Cards */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  {
                    label: "Pending Upload",
                    count: kycUsers.filter((k) => k.status === "pending").length,
                    color: "bg-slate-500",
                  },
                  {
                    label: "Pending Review",
                    count: kycUsers.filter((k) => k.status === "pending_approval")
                      .length,
                    color: "bg-amber-500",
                  },
                  {
                    label: "Approved",
                    count: kycUsers.filter((k) => k.status === "approved").length,
                    color: "bg-emerald-500",
                  },
                  {
                    label: "Declined",
                    count: kycUsers.filter((k) => k.status === "declined").length,
                    color: "bg-red-500",
                  },
                ].map((stat, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-3 h-3 rounded-full", stat.color)} />
                        <div>
                          <p className="text-2xl font-bold">{stat.count}</p>
                          <p className="text-xs text-slate-500">{stat.label}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* KYC Table */}
              {kycUsers.length === 0 ? (
                <Card
                  className={cn(
                    "p-12 rounded-[3rem] border-none shadow-xl text-center",
                    colors.surface,
                  )}
                >
                  <CardContent>
                    <Icons.Shield
                      className={cn(
                        "mx-auto h-16 w-16 mb-4",
                        colors.textMuted,
                      )}
                    />
                    <p
                      className={cn(
                        "text-lg font-medium",
                        colors.textSecondary,
                      )}
                    >
                      No KYC applications found
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr
                            className={cn(
                              "border-b-2",
                              colors.surfaceBorder,
                            )}
                          >
                            <th className="text-left py-4 px-4 font-bold text-sm">
                              User
                            </th>
                            <th className="text-left py-4 px-4 font-bold text-sm">
                              ID Type
                            </th>
                            <th className="text-left py-4 px-4 font-bold text-sm">
                              Submitted
                            </th>
                            <th className="text-left py-4 px-4 font-bold text-sm">
                              Status
                            </th>
                            <th className="text-left py-4 px-4 font-bold text-sm">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {kycUsers.map((kyc) => (
                            <tr
                              key={kyc.id}
                              className={cn(
                                "border-b transition-colors",
                                isDark
                                  ? "border-slate-700 hover:bg-slate-800/50"
                                  : "border-slate-100 hover:bg-slate-50",
                              )}
                            >
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-3">
                                  {kyc.selfieUrl ? (
                                    <img
                                      src={kyc.selfieUrl}
                                      alt="Selfie"
                                      className="w-10 h-10 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div
                                      className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center",
                                        isDark ? "bg-slate-700" : "bg-slate-200",
                                      )}
                                    >
                                      <Icons.User
                                        size={20}
                                        className={
                                          isDark ? "text-slate-400" : "text-slate-500"
                                        }
                                      />
                                    </div>
                                  )}
                                  <div>
                                    <p className="font-medium">
                                      {kyc.firstName} {kyc.lastName}
                                    </p>
                                    <p className="text-sm text-slate-500">
                                      {kyc.email}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <span className="capitalize">
                                  {kyc.idType.replace("_", " ")}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-sm">
                                {formatDate(kyc.submittedAt)}
                              </td>
                              <td className="py-4 px-4">
                                <Badge variant={getKycStatusVariant(kyc.status)}>
                                  {kyc.status.replace("_", " ")}
                                </Badge>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedKyc(kyc);
                                      setShowKycReviewModal(true);
                                    }}
                                  >
                                    <Icons.Eye size={16} />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* KYC Pagination */}
              {kycTotalPages > 1 && (
                <div
                  className={cn(
                    "flex items-center justify-center gap-4 py-4 rounded-3xl",
                    colors.surface,
                    isDark ? "" : "shadow-xl",
                  )}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setKycPage(kycPage - 1)}
                    disabled={kycPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm font-medium">
                    Page {kycPage} of {kycTotalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setKycPage(kycPage + 1)}
                    disabled={kycPage === kycTotalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ==================== CREATORS MODALS ==================== */}

      {/* Creator Profile Modal */}
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
                    getInitials(
                      `${selectedCreator.firstName} ${selectedCreator.lastName}`,
                    )
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold truncate">
                    {selectedCreator.firstName} {selectedCreator.lastName}
                  </h3>
                  <p className="text-xs opacity-80 truncate">
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
              <div
                className={cn(
                  "px-4 py-2 text-[10px] font-bold uppercase tracking-wider",
                  colors.textSecondary,
                )}
              >
                Personal Information
              </div>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  <tr
                    className={cn(
                      "hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors",
                      isDark ? "" : "bg-slate-50",
                    )}
                  >
                    <td
                      className={cn(
                        "px-4 py-2 font-medium w-32",
                        colors.textSecondary,
                      )}
                    >
                      Name
                    </td>
                    <td
                      className={cn(
                        "px-4 py-2 font-semibold",
                        colors.textPrimary,
                      )}
                    >
                      {selectedCreator.firstName} {selectedCreator.lastName}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td
                      className={cn(
                        "px-4 py-2 font-medium",
                        colors.textSecondary,
                      )}
                    >
                      Email
                    </td>
                    <td
                      className={cn(
                        "px-4 py-2 font-semibold truncate",
                        colors.textPrimary,
                      )}
                    >
                      {selectedCreator.email}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td
                      className={cn(
                        "px-4 py-2 font-medium",
                        colors.textSecondary,
                      )}
                    >
                      Phone
                    </td>
                    <td
                      className={cn(
                        "px-4 py-2 font-semibold font-mono",
                        colors.textPrimary,
                      )}
                    >
                      {selectedCreator.phone}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Address Table */}
            <div className={cn("rounded-lg overflow-hidden", colors.surface)}>
              <div
                className={cn(
                  "px-4 py-2 text-[10px] font-bold uppercase tracking-wider",
                  colors.textSecondary,
                )}
              >
                Address
              </div>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  <tr
                    className={cn(
                      "hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors",
                      isDark ? "" : "bg-slate-50",
                    )}
                  >
                    <td
                      className={cn(
                        "px-4 py-2 font-medium w-32",
                        colors.textSecondary,
                      )}
                    >
                      Full Address
                    </td>
                    <td
                      className={cn(
                        "px-4 py-2 font-semibold",
                        colors.textPrimary,
                      )}
                    >
                      {selectedCreator.address}
                      <br />
                      <span className={cn("text-xs", colors.textSecondary)}>
                        {selectedCreator.city}, {selectedCreator.province}{" "}
                        {selectedCreator.postalCode}
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
              <div
                className={cn(
                  "px-4 py-2 text-[10px] font-bold uppercase tracking-wider",
                  colors.textSecondary,
                )}
              >
                Identity Verification
              </div>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  <tr
                    className={cn(
                      "hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors",
                      isDark ? "" : "bg-slate-50",
                    )}
                  >
                    <td
                      className={cn(
                        "px-4 py-2 font-medium w-32",
                        colors.textSecondary,
                      )}
                    >
                      ID Type
                    </td>
                    <td
                      className={cn(
                        "px-4 py-2 font-semibold capitalize",
                        colors.textPrimary,
                      )}
                    >
                      {selectedCreator.idType?.replace("_", " ") || "N/A"}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td
                      className={cn(
                        "px-4 py-2 font-medium",
                        colors.textSecondary,
                      )}
                    >
                      ID Number
                    </td>
                    <td
                      className={cn(
                        "px-4 py-2 font-semibold font-mono",
                        colors.textPrimary,
                      )}
                    >
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
              <div
                className={cn(
                  "px-4 py-2 text-[10px] font-bold uppercase tracking-wider",
                  colors.textSecondary,
                )}
              >
                Banking Details
              </div>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  <tr
                    className={cn(
                      "hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors",
                      isDark ? "" : "bg-slate-50",
                    )}
                  >
                    <td
                      className={cn(
                        "px-4 py-2 font-medium w-32",
                        colors.textSecondary,
                      )}
                    >
                      Bank Name
                    </td>
                    <td
                      className={cn(
                        "px-4 py-2 font-semibold",
                        colors.textPrimary,
                      )}
                    >
                      {selectedCreator.bankName || "N/A"}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td
                      className={cn(
                        "px-4 py-2 font-medium",
                        colors.textSecondary,
                      )}
                    >
                      Account Holder
                    </td>
                    <td
                      className={cn(
                        "px-4 py-2 font-semibold",
                        colors.textPrimary,
                      )}
                    >
                      {selectedCreator.accountHolderName || "N/A"}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td
                      className={cn(
                        "px-4 py-2 font-medium",
                        colors.textSecondary,
                      )}
                    >
                      Account Number
                    </td>
                    <td
                      className={cn(
                        "px-4 py-2 font-semibold font-mono",
                        colors.textPrimary,
                      )}
                    >
                      {selectedCreator.bankAccountNumber || "N/A"}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td
                      className={cn(
                        "px-4 py-2 font-medium",
                        colors.textSecondary,
                      )}
                    >
                      Branch
                    </td>
                    <td
                      className={cn(
                        "px-4 py-2 font-semibold",
                        colors.textPrimary,
                      )}
                    >
                      {selectedCreator.bankBranch || "N/A"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Channel Information Table */}
            <div className={cn("rounded-lg overflow-hidden", colors.surface)}>
              <div
                className={cn(
                  "px-4 py-2 text-[10px] font-bold uppercase tracking-wider",
                  colors.textSecondary,
                )}
              >
                Channel Information
              </div>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  <tr
                    className={cn(
                      "hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors",
                      isDark ? "" : "bg-slate-50",
                    )}
                  >
                    <td
                      className={cn(
                        "px-4 py-2 font-medium w-32",
                        colors.textSecondary,
                      )}
                    >
                      Channel Name
                    </td>
                    <td
                      className={cn(
                        "px-4 py-2 font-semibold",
                        colors.textPrimary,
                      )}
                    >
                      {selectedCreator.channelName}
                    </td>
                  </tr>
                  {selectedCreator.channelUrl && (
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td
                        className={cn(
                          "px-4 py-2 font-medium",
                          colors.textSecondary,
                        )}
                      >
                        Channel URL
                      </td>
                      <td
                        className={cn(
                          "px-4 py-2 font-semibold truncate",
                          colors.primaryText,
                        )}
                      >
                        <a
                          href={selectedCreator.channelUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
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
                <div
                  className={cn(
                    "px-4 py-2 text-[10px] font-bold uppercase tracking-wider flex items-center justify-between",
                    colors.textSecondary,
                  )}
                >
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
                    <tr
                      className={cn(
                        "hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors",
                        isDark ? "" : "bg-slate-50",
                      )}
                    >
                      <td
                        className={cn(
                          "px-4 py-2 font-medium w-32",
                          colors.textSecondary,
                        )}
                      >
                        Merchant ID
                      </td>
                      <td
                        className={cn(
                          "px-4 py-2 font-semibold font-mono text-xs",
                          colors.textPrimary,
                        )}
                      >
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
              <span
                className={cn(
                  "text-xs font-bold uppercase tracking-wider flex-1",
                  colors.textSecondary,
                )}
              >
                {selectedCreator.onlineStatus} - Last seen{" "}
                {formatRelativeTime(selectedCreator.lastSeen)}
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

      {/* Creator Approve Confirmation */}
      <ConfirmModal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onConfirm={handleApprove}
        title="Approve Creator"
        message={`Are you sure you want to approve "${selectedCreator?.firstName} ${selectedCreator?.lastName}"?`}
        confirmText="Approve"
        variant="info"
      />

      {/* Creator Reject Confirmation */}
      <ConfirmModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleReject}
        title="Reject Creator"
        message={`Are you sure you want to reject "${selectedCreator?.firstName} ${selectedCreator?.lastName}"?`}
        confirmText="Reject"
        variant="danger"
      />

      {/* Avatar Preview Modal */}
      <Modal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        title="Profile Picture"
        size="sm"
      >
        {selectedCreator && (
          <div className="flex flex-col items-center space-y-4">
            <div className="relative w-48 h-48">
              {selectedCreator.avatar ? (
                <img
                  src={selectedCreator.avatar}
                  alt={`${selectedCreator.firstName} ${selectedCreator.lastName}`}
                  className="w-full h-full rounded-full object-cover ring-4 ring-[hsl(var(--primary))]"
                />
              ) : (
                <div
                  className={cn(
                    "w-full h-full rounded-full flex items-center justify-center text-4xl font-bold",
                    isDark
                      ? "bg-[hsl(var(--primary))]/20 text-[hsl(var(--primary))]"
                      : "bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]",
                  )}
                >
                  {getInitials(
                    `${selectedCreator.firstName} ${selectedCreator.lastName}`,
                  )}
                </div>
              )}
            </div>
            <div className="text-center">
              <h3 className={cn("text-lg font-semibold", colors.textPrimary)}>
                {selectedCreator.firstName} {selectedCreator.lastName}
              </h3>
              <p className={cn("text-sm", colors.textSecondary)}>
                {selectedCreator.channelName}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowAvatarModal(false);
                openProfile(selectedCreator);
              }}
            >
              <Icons.Eye size={14} className="mr-2" />
              View Full Profile
            </Button>
          </div>
        )}
      </Modal>

      {/* ==================== KYC MODALS ==================== */}

      {/* KYC Review Modal */}
      <Modal
        isOpen={showKycReviewModal}
        onClose={() => setShowKycReviewModal(false)}
        title="KYC Application Review"
        size="lg"
      >
        {selectedKyc && (
          <div className="space-y-6">
            {/* User Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500">Full Name</p>
                <p className="font-medium">
                  {selectedKyc.firstName} {selectedKyc.lastName}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Email</p>
                <p className="font-medium">{selectedKyc.email}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">ID Type</p>
                <p className="font-medium capitalize">
                  {selectedKyc.idType.replace("_", " ")}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">ID Number</p>
                <p className="font-medium">{selectedKyc.idNumber}</p>
              </div>
            </div>

            {/* Document Preview */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-2">Selfie Photo</p>
                <div
                  className={cn(
                    "rounded-xl p-4 text-center cursor-pointer transition-colors",
                    colors.surface,
                  )}
                  onClick={() => {
                    setShowKycReviewModal(false);
                    setShowKycSelfieModal(true);
                  }}
                >
                  {selectedKyc.selfieUrl ? (
                    <img
                      src={selectedKyc.selfieUrl}
                      alt="Selfie"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ) : (
                    <Icons.User className="w-12 h-12 mx-auto text-slate-400" />
                  )}
                  <p className="text-xs mt-2 text-slate-500">
                    Click to enlarge
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-2">ID Document</p>
                <div
                  className={cn(
                    "rounded-xl p-4 text-center cursor-pointer transition-colors",
                    colors.surface,
                  )}
                  onClick={() => {
                    setShowKycReviewModal(false);
                    setShowKycIdModal(true);
                  }}
                >
                  {selectedKyc.idImageUrl ? (
                    <img
                      src={selectedKyc.idImageUrl}
                      alt="ID Document"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ) : (
                    <Icons.FileText className="w-12 h-12 mx-auto text-slate-400" />
                  )}
                  <p className="text-xs mt-2 text-slate-500">
                    Click to enlarge
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowKycReviewModal(false)}
              >
                Close
              </Button>
              {selectedKyc.status === "pending_approval" && (
                <>
                  <Button
                    variant="danger"
                    onClick={() => {
                      setShowKycReviewModal(false);
                      setShowKycDeclineModal(true);
                    }}
                  >
                    Decline
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      setShowKycReviewModal(false);
                      setShowKycApproveModal(true);
                    }}
                  >
                    Approve
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* KYC Selfie Modal */}
      <Modal
        isOpen={showKycSelfieModal}
        onClose={() => {
          setShowKycSelfieModal(false);
          setShowKycReviewModal(true);
        }}
        title="Selfie Photo"
        size="md"
      >
        {selectedKyc?.selfieUrl && (
          <img
            src={selectedKyc.selfieUrl}
            alt="Selfie"
            className="w-full rounded-lg"
          />
        )}
      </Modal>

      {/* KYC ID Modal */}
      <Modal
        isOpen={showKycIdModal}
        onClose={() => {
          setShowKycIdModal(false);
          setShowKycReviewModal(true);
        }}
        title="ID Document"
        size="lg"
      >
        {selectedKyc?.idImageUrl && (
          <img
            src={selectedKyc.idImageUrl}
            alt="ID Document"
            className="w-full rounded-lg"
          />
        )}
      </Modal>

      {/* KYC Approve Confirmation */}
      <ConfirmModal
        isOpen={showKycApproveModal}
        onClose={() => setShowKycApproveModal(false)}
        onConfirm={handleKycApprove}
        title="Approve KYC"
        message="Are you sure you want to approve this KYC application? This will grant the user full access to the platform."
        confirmText="Approve"
        variant="info"
      />

      {/* KYC Decline Confirmation */}
      <ConfirmModal
        isOpen={showKycDeclineModal}
        onClose={() => {
          setShowKycDeclineModal(false);
          setDeclineReason("");
        }}
        onConfirm={handleKycDecline}
        title="Decline KYC"
        message={
          <div className="space-y-3">
            <p>Are you sure you want to decline this KYC application?</p>
            <div>
              <label className="text-xs font-medium">Reason for decline:</label>
              <textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="Enter the reason..."
                className={cn(
                  "w-full mt-1 p-3 rounded-xl text-sm border resize-none",
                  colors.surface,
                  colors.surfaceBorder,
                  colors.textPrimary,
                )}
                rows={3}
              />
            </div>
          </div>
        }
        confirmText="Decline"
        variant="danger"
      />
    </div>
  );
}
