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

  const handleDeactivateChannel = async (creator: Creator) => {
    try {
      if (creator.channelStatus === "active") {
        await api.creators.deactivateChannel(creator.id);
        addToast({
          type: "success",
          title: "Success",
          message: "Channel deactivated",
        });
      } else {
        await api.creators.activateChannel(creator.id);
        addToast({
          type: "success",
          title: "Success",
          message: "Channel activated",
        });
      }
      fetchCreators();
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to update channel status",
      });
    }
  };

  const handlePayout = async (creator: Creator) => {
    try {
      await api.creators.processPayout(creator.id);
      addToast({
        type: "success",
        title: "Success",
        message: "Payout processed successfully",
      });
      fetchCreators();
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to process payout",
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
              style={{ border: "1px solid hsl(var(--surface-border))" }}
            >
              {KYC_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            <Icons.ChevronDown
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
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
              onDeactivateChannel={handleDeactivateChannel}
              onPayout={handlePayout}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {creators.map((creator) => (
                <Card
                  key={creator.id}
                  hover
                  className={cn(
                    "rounded-2xl border transition-all duration-300 cursor-pointer",
                    colors.surfaceBorder,
                    colors.surface,
                  )}
                  onClick={() => openProfile(creator)}
                >
                  <CardContent className="p-5">
                    <div className="flex flex-col items-center text-center">
                      {/* Avatar */}
                      <div className="relative mb-3">
                        {creator.avatar ? (
                          <img
                            src={creator.avatar}
                            alt={creator.creatorFullName}
                            className="w-16 h-16 rounded-full object-cover ring-2 ring-[hsl(var(--primary))]/20"
                          />
                        ) : (
                          <div
                            className={cn(
                              "w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold",
                              isDark
                                ? "bg-[hsl(var(--primary))]/20 text-[hsl(var(--primary))]"
                                : "bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]",
                            )}
                          >
                            {getInitials(creator.creatorFullName)}
                          </div>
                        )}
                        <div
                          className={cn(
                            "absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white dark:border-slate-800",
                            creator.onlineStatus === "online"
                              ? "bg-green-500"
                              : creator.onlineStatus === "away"
                                ? "bg-yellow-500"
                                : "bg-slate-400",
                          )}
                        />
                      </div>

                      {/* Name and Channel */}
                      <h3
                        className={cn(
                          "text-base font-semibold",
                          colors.textPrimary,
                        )}
                      >
                        {creator.creatorFullName}
                      </h3>
                      <p
                        className={cn(
                          "text-xs font-medium uppercase tracking-wider mt-1",
                          colors.textMuted,
                        )}
                      >
                        {creator.channelName}
                      </p>

                      {/* Status Badge */}
                      <Badge
                        variant={
                          creator.status === "active"
                            ? "success"
                            : creator.status === "pending"
                              ? "warning"
                              : "danger"
                        }
                        className="mt-3"
                      >
                        {creator.status}
                      </Badge>

                      {/* Stats Grid */}
                      <div className="mt-4 w-full grid grid-cols-2 gap-3">
                        <div
                          className={cn(
                            "rounded-xl p-3 transition-colors duration-300 text-center",
                            isDark
                              ? "bg-[hsl(var(--surface-hover))]/50"
                              : "bg-[hsl(var(--surface-hover))]",
                          )}
                        >
                          <p
                            className={cn(
                              "text-lg font-bold",
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
                            "rounded-xl p-3 transition-colors duration-300 text-center",
                            isDark
                              ? "bg-[hsl(var(--success))]/10"
                              : "bg-[hsl(var(--success))]/10",
                          )}
                        >
                          <p
                            className={cn(
                              "text-lg font-bold",
                              colors.successText,
                            )}
                          >
                            {formatCurrency(creator.totalRevenue)}
                          </p>
                          <p
                            className={cn(
                              "text-[10px] font-medium uppercase tracking-wider",
                              colors.successText,
                            )}
                          >
                            Revenue
                          </p>
                        </div>
                      </div>

                      {/* Payout Type */}
                      <div className="mt-3">
                        <Badge
                          variant={
                            creator.payoutType === "mobile_wallet"
                              ? "info"
                              : "neutral"
                          }
                          className="text-[10px] px-2 py-0.5"
                        >
                          {creator.payoutType === "mobile_wallet"
                            ? "Mobile Wallet"
                            : "Bank"}
                        </Badge>
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
                    count: kycUsers.filter((k) => k.status === "pending")
                      .length,
                    color: "bg-slate-500",
                  },
                  {
                    label: "Pending Review",
                    count: kycUsers.filter(
                      (k) => k.status === "pending_approval",
                    ).length,
                    color: "bg-amber-500",
                  },
                  {
                    label: "Approved",
                    count: kycUsers.filter((k) => k.status === "approved")
                      .length,
                    color: "bg-emerald-500",
                  },
                  {
                    label: "Declined",
                    count: kycUsers.filter((k) => k.status === "declined")
                      .length,
                    color: "bg-red-500",
                  },
                ].map((stat, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn("w-3 h-3 rounded-full", stat.color)}
                        />
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
                      className={cn("mx-auto h-16 w-16 mb-4", colors.textMuted)}
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
                            className={cn("border-b-2", colors.surfaceBorder)}
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
                                        isDark
                                          ? "bg-slate-700"
                                          : "bg-slate-200",
                                      )}
                                    >
                                      <Icons.User
                                        size={20}
                                        className={
                                          isDark
                                            ? "text-slate-400"
                                            : "text-slate-500"
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
                                <Badge
                                  variant={getKycStatusVariant(kyc.status)}
                                >
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
          <div className="space-y-6 max-h-[85vh] overflow-y-auto">
            {/* Profile Header */}
            <div className="flex items-center gap-6 pb-6 border-b border-slate-200 dark:border-slate-700">
              <div className="relative flex-shrink-0">
                {selectedCreator.avatar ? (
                  <img
                    src={selectedCreator.avatar}
                    alt={selectedCreator.creatorFullName}
                    className="w-24 h-24 rounded-full object-cover shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shadow-lg">
                    <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                      {getInitials(selectedCreator.creatorFullName)}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {selectedCreator.creatorFullName}
                  </h3>
                  <Badge
                    variant={
                      selectedCreator.status === "active"
                        ? "success"
                        : selectedCreator.status === "pending"
                          ? "warning"
                          : "danger"
                    }
                  >
                    {selectedCreator.status}
                  </Badge>
                </div>
                <p className="text-lg text-slate-600 dark:text-slate-300 mb-2">
                  {selectedCreator.channelName}
                </p>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      selectedCreator.onlineStatus === "online"
                        ? "bg-green-500"
                        : selectedCreator.onlineStatus === "away"
                          ? "bg-yellow-500"
                          : "bg-slate-400",
                    )}
                  />
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {selectedCreator.onlineStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatNumber(selectedCreator.totalVideos)}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Videos
                </p>
              </div>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatNumber(selectedCreator.totalViews)}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Views
                </p>
              </div>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(selectedCreator.totalRevenue)}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Revenue
                </p>
              </div>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatNumber(selectedCreator.totalLikes)}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Likes
                </p>
              </div>
            </div>

            {/* Financial Overview */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 text-center">
                <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-1">
                  Total Revenue
                </p>
                <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                  {formatCurrency(selectedCreator.totalRevenue)}
                </p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-center">
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">
                  Current Balance
                </p>
                <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
                  {formatCurrency(selectedCreator.currentBalance)}
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4 text-center">
                <p className="text-sm text-purple-600 dark:text-purple-400 mb-1">
                  Paid Out
                </p>
                <p className="text-xl font-bold text-purple-700 dark:text-purple-300">
                  {formatCurrency(selectedCreator.totalPaidOut)}
                </p>
              </div>
            </div>

            {/* Company Information */}
            {selectedCreator.isCompany && (
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Icons.Briefcase size={18} className="text-emerald-500" />
                  Company Information
                </h4>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                        Company Name
                      </p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {selectedCreator.companyName || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                        VAT Number
                      </p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {selectedCreator.VAT || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                        TIN Number
                      </p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {selectedCreator.tinNumber || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Personal Information */}
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Icons.User size={18} className="text-emerald-500" />
                Personal Information
              </h4>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Full Name
                    </p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {selectedCreator.creatorFullName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Email
                    </p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {selectedCreator.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Mobile Number
                    </p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {selectedCreator.mobileNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Payout Type
                    </p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      <span
                        className={cn(
                          "px-2 py-1 rounded-full text-xs",
                          selectedCreator.payoutType === "mobile_wallet"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                            : "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
                        )}
                      >
                        {selectedCreator.payoutType === "mobile_wallet"
                          ? "Mobile Wallet"
                          : "Bank"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payout Details */}
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Icons.CreditCard size={18} className="text-emerald-500" />
                Payout Details
              </h4>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Bank Name
                    </p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {selectedCreator.bankName || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Account Number
                    </p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {selectedCreator.bankAccountNumber || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Channel Information */}
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Icons.Video size={18} className="text-emerald-500" />
                Channel Information
              </h4>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Channel Name
                    </p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {selectedCreator.channelName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Channel Status
                    </p>
                    <Badge
                      variant={
                        selectedCreator.channelStatus === "active"
                          ? "success"
                          : "danger"
                      }
                    >
                      {selectedCreator.channelStatus}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Actions */}
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Icons.Settings size={18} className="text-emerald-500" />
                Admin Actions
              </h4>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={
                      selectedCreator.channelStatus === "active"
                        ? "danger"
                        : "secondary"
                    }
                    size="sm"
                    onClick={() => handleDeactivateChannel(selectedCreator)}
                  >
                    <Icons.Lock size={14} className="mr-1" />
                    {selectedCreator.channelStatus === "active"
                      ? "Deactivate Channel"
                      : "Activate Channel"}
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handlePayout(selectedCreator)}
                    disabled={selectedCreator.currentBalance <= 0}
                  >
                    <Icons.DollarSign size={14} className="mr-1" />
                    Process Payout
                  </Button>
                </div>
              </div>
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

            {/* Actions */}
            <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button
                variant="secondary"
                onClick={() => setShowProfileModal(false)}
              >
                Close
              </Button>
            </div>
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
