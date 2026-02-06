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
import type { Creator } from "@/types";

export default function CreatorsPage() {
  const { addToast } = useToast();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCreators();
  }, [page]);

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

  const openProfile = (creator: Creator) => {
    setSelectedCreator(creator);
    setShowProfileModal(true);
  };

  const openAvatarPreview = (creator: Creator, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCreator(creator);
    setShowAvatarModal(true);
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

  const isLoadingCreators = isLoading && page === 1;

  return (
    <div
      className={cn(
        "space-y-6 min-h-screen font-sans transition-colors duration-300 px-4 sm:px-6 lg:px-8",
        colors.background,
      )}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter text-[hsl(var(--text-primary))]">
            Creators
          </h1>
          <p className="text-xs sm:text-sm font-bold uppercase tracking-widest mt-1 text-[hsl(var(--text-muted))]">
            Manage your content creators
          </p>
        </div>

        {/* View Mode Toggle */}
        <div
          className="flex p-1 rounded-xl border self-start sm:self-auto"
          style={{
            backgroundColor: "hsl(var(--surface))",
            borderColor: "hsl(var(--surface-border))",
          }}
        >
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "p-2 sm:p-2.5 rounded-lg transition-all",
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
              "p-2 sm:p-2.5 rounded-lg transition-all",
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
      </div>

      {/* Content */}
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
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {creators.map((creator) => (
            <Card
              key={creator.id}
              hover
              className={cn(
                "rounded-xl sm:rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden",
                colors.surfaceBorder,
                colors.surface,
                "hover:shadow-lg hover:scale-[1.02]",
              )}
              onClick={() => openProfile(creator)}
            >
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    {creator.avatar ? (
                      <img
                        src={creator.avatar}
                        alt={creator.creatorFullName}
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover ring-2 ring-[hsl(var(--primary))]/20"
                      />
                    ) : (
                      <div
                        className={cn(
                          "w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-lg sm:text-xl font-bold",
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
                        "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full border-2 border-white dark:border-slate-800",
                        creator.onlineStatus === "online"
                          ? "bg-green-500"
                          : creator.onlineStatus === "away"
                            ? "bg-yellow-500"
                            : "bg-slate-400",
                      )}
                    />
                  </div>

                  {/* Name and Status */}
                  <div className="flex-1 min-w-0">
                    <h3
                      className={cn(
                        "text-sm sm:text-base font-semibold truncate",
                        colors.textPrimary,
                      )}
                    >
                      {creator.creatorFullName}
                    </h3>
                    <p
                      className={cn(
                        "text-xs font-medium uppercase tracking-wider truncate mt-0.5",
                        colors.textMuted,
                      )}
                    >
                      {creator.channelName}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge
                        variant={
                          creator.status === "active"
                            ? "success"
                            : creator.status === "pending"
                              ? "warning"
                              : "danger"
                        }
                        className="text-[10px] px-2 py-0.5"
                      >
                        {creator.status}
                      </Badge>
                      <Badge
                        variant={
                          creator.payoutType === "mobile_wallet"
                            ? "info"
                            : "neutral"
                        }
                        className="text-[10px] px-2 py-0.5"
                      >
                        {creator.payoutType === "mobile_wallet"
                          ? "Mobile"
                          : "Bank"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-3 grid grid-cols-2 gap-2 sm:gap-3">
                  <div
                    className={cn(
                      "rounded-lg sm:rounded-xl p-2 sm:p-3 transition-colors duration-300 text-center",
                      isDark
                        ? "bg-[hsl(var(--surface-hover))]/50"
                        : "bg-[hsl(var(--surface-hover))]",
                    )}
                  >
                    <p
                      className={cn(
                        "text-base sm:text-lg font-bold",
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
                      "rounded-lg sm:rounded-xl p-2 sm:p-3 transition-colors duration-300 text-center",
                      isDark
                        ? "bg-[hsl(var(--success))]/10"
                        : "bg-[hsl(var(--success))]/10",
                    )}
                  >
                    <p
                      className={cn(
                        "text-base sm:text-lg font-bold",
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          className={cn(
            "flex items-center justify-center gap-4 py-4 transition-colors duration-300 flex-wrap",
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

      {/* Profile Modal */}
      <Modal
        isOpen={showProfileModal}
        onClose={() => {
          setShowProfileModal(false);
          setSelectedCreator(null);
        }}
        title="Creator Profile"
        size="xl"
      >
        {selectedCreator && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative flex-shrink-0">
                {selectedCreator.avatar ? (
                  <img
                    src={selectedCreator.avatar}
                    alt={selectedCreator.creatorFullName}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-[hsl(var(--primary))]/20"
                  />
                ) : (
                  <div
                    className={cn(
                      "w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold",
                      isDark
                        ? "bg-[hsl(var(--primary))]/20 text-[hsl(var(--primary))]"
                        : "bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]",
                    )}
                  >
                    {getInitials(selectedCreator.creatorFullName)}
                  </div>
                )}
                <div
                  className={cn(
                    "absolute -bottom-1 -right-1 h-5 w-5 sm:h-6 sm:w-6 rounded-full border-4 border-white dark:border-slate-800",
                    selectedCreator.onlineStatus === "online"
                      ? "bg-green-500"
                      : selectedCreator.onlineStatus === "away"
                        ? "bg-yellow-500"
                        : "bg-slate-400",
                  )}
                />
              </div>
              <div className="text-center sm:text-left flex-1">
                <h2
                  className={cn(
                    "text-xl sm:text-2xl font-bold uppercase tracking-wide",
                    colors.textPrimary,
                  )}
                >
                  {selectedCreator.creatorFullName}
                </h2>
                <p
                  className={cn(
                    "text-sm font-bold uppercase tracking-wider mt-1",
                    colors.textMuted,
                  )}
                >
                  {selectedCreator.channelName}
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-3 mt-3">
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
                  <Badge variant="info">
                    {selectedCreator.channelStatus === "active" ? "Active Channel" : "Inactive Channel"}
                  </Badge>
                  {selectedCreator.isCompany && (
                    <Badge variant="neutral">
                      Company
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div
              className={cn(
                "rounded-xl p-4",
                isDark
                  ? "bg-[hsl(var(--surface-hover))]/50"
                  : "bg-[hsl(var(--surface-hover))]",
              )}
            >
              <h3 className={cn(
                "text-sm font-bold uppercase tracking-wider mb-2",
                colors.textMuted,
              )}>
                Description
              </h3>
              <p className={cn(
                "text-sm",
                colors.textPrimary,
              )}>
                {selectedCreator.description || "No description available"}
              </p>
            </div>

            {/* Contact & Personal Info */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div
                className={cn(
                  "rounded-xl p-4",
                  isDark
                    ? "bg-[hsl(var(--surface-hover))]/50"
                    : "bg-[hsl(var(--surface-hover))]",
                )}
              >
                <h3 className={cn(
                  "text-sm font-bold uppercase tracking-wider mb-3",
                  colors.textMuted,
                )}>
                  Contact Information
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Icons.Mail size={16} className={cn(colors.textMuted)} />
                    <a href={`mailto:${selectedCreator.email}`} className={cn("text-sm font-medium break-all hover:underline", colors.primaryText)}>
                      {selectedCreator.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icons.Phone size={16} className={cn(colors.textMuted)} />
                    <span className={cn("text-sm font-medium", colors.textPrimary)}>
                      {selectedCreator.phoneNumber || selectedCreator.mobileNumber || "N/A"}
                    </span>
                  </div>
                  {selectedCreator.address && (
                    <div className="flex items-start gap-2">
                      <Icons.MapPin size={16} className={cn("mt-0.5", colors.textMuted)} />
                      <span className={cn("text-sm font-medium", colors.textPrimary)}>
                        {[selectedCreator.address, selectedCreator.city, selectedCreator.province, selectedCreator.postalCode, selectedCreator.country].filter(Boolean).join(", ") || "N/A"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Fiscalisation Details */}
              <div
                className={cn(
                  "rounded-xl p-4",
                  isDark
                    ? "bg-[hsl(var(--surface-hover))]/50"
                    : "bg-[hsl(var(--surface-hover))]",
                )}
              >
                <h3 className={cn(
                  "text-sm font-bold uppercase tracking-wider mb-3",
                  colors.textMuted,
                )}>
                  Fiscalisation Details
                </h3>
                <div className="space-y-2">
                  {selectedCreator.isCompany && (
                    <div>
                      <p className={cn("text-xs font-medium uppercase tracking-wider", colors.textMuted)}>
                        Company Name
                      </p>
                      <p className={cn("text-sm font-medium", colors.textPrimary)}>
                        {selectedCreator.companyName || "N/A"}
                      </p>
                    </div>
                  )}
                  {selectedCreator.VAT && (
                    <div>
                      <p className={cn("text-xs font-medium uppercase tracking-wider", colors.textMuted)}>
                        VAT Number
                      </p>
                      <p className={cn("text-sm font-medium font-mono", colors.textPrimary)}>
                        {selectedCreator.VAT}
                      </p>
                    </div>
                  )}
                  {selectedCreator.tinNumber && (
                    <div>
                      <p className={cn("text-xs font-medium uppercase tracking-wider", colors.textMuted)}>
                        TIN Number
                      </p>
                      <p className={cn("text-sm font-medium font-mono", colors.textPrimary)}>
                        {selectedCreator.tinNumber}
                      </p>
                    </div>
                  )}
                  {!selectedCreator.VAT && !selectedCreator.tinNumber && (!selectedCreator.isCompany || !selectedCreator.companyName) && (
                    <p className={cn("text-sm", colors.textMuted)}>
                      No fiscalisation details available
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Verification Documents */}
            <div
              className={cn(
                "rounded-xl p-4",
                isDark
                  ? "bg-[hsl(var(--surface-hover))]/50"
                  : "bg-[hsl(var(--surface-hover))]",
              )}
            >
              <h3 className={cn(
                "text-sm font-bold uppercase tracking-wider mb-4",
                colors.textMuted,
              )}>
                Verification Documents
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Selfie */}
                {selectedCreator.selfie ? (
                  <a
                    href={selectedCreator.selfie}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative rounded-lg overflow-hidden border border-[hsl(var(--surface-border))] block"
                  >
                    <div className="aspect-square">
                      <img
                        src={selectedCreator.selfie}
                        alt="Selfie"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="flex flex-col items-center gap-1 text-white">
                        <Icons.Eye size={24} />
                        <span className="text-xs font-medium">Selfie</span>
                      </div>
                    </div>
                    <div className="absolute top-2 left-2">
                      <Badge variant="success" className="text-xs">Selfie</Badge>
                    </div>
                  </a>
                ) : (
                  <div className={cn(
                    "rounded-lg p-4 text-center border-2 border-dashed aspect-square flex flex-col items-center justify-center",
                    isDark
                      ? "border-slate-700"
                      : "border-slate-200",
                  )}>
                    <Icons.EyeOff size={24} className={cn(colors.textMuted)} />
                    <span className={cn("text-xs mt-2", colors.textMuted)}>No Selfie</span>
                  </div>
                )}

                {/* ID Image */}
                {selectedCreator.idImage ? (
                  <a
                    href={selectedCreator.idImage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative rounded-lg overflow-hidden border border-[hsl(var(--surface-border))] block"
                  >
                    <div className="aspect-square">
                      <img
                        src={selectedCreator.idImage}
                        alt="ID Document"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="flex flex-col items-center gap-1 text-white">
                        <Icons.Eye size={24} />
                        <span className="text-xs font-medium">ID Document</span>
                      </div>
                    </div>
                    <div className="absolute top-2 left-2">
                      <Badge variant="info" className="text-xs">ID Document</Badge>
                    </div>
                  </a>
                ) : (
                  <div className={cn(
                    "rounded-lg p-4 text-center border-2 border-dashed aspect-square flex flex-col items-center justify-center",
                    isDark
                      ? "border-slate-700"
                      : "border-slate-200",
                  )}>
                    <Icons.FileText size={24} className={cn(colors.textMuted)} />
                    <span className={cn("text-xs mt-2", colors.textMuted)}>No ID Document</span>
                  </div>
                )}

                {/* ID Copy */}
                {selectedCreator.idCopyUrl ? (
                  <a
                    href={selectedCreator.idCopyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative rounded-lg overflow-hidden border border-[hsl(var(--surface-border))] block"
                  >
                    <div className="aspect-square">
                      <img
                        src={selectedCreator.idCopyUrl}
                        alt="ID Copy"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="flex flex-col items-center gap-1 text-white">
                        <Icons.Eye size={24} />
                        <span className="text-xs font-medium">ID Copy</span>
                      </div>
                    </div>
                    <div className="absolute top-2 left-2">
                      <Badge variant="info" className="text-xs">ID Copy</Badge>
                    </div>
                  </a>
                ) : (
                  <div className={cn(
                    "rounded-lg p-4 text-center border-2 border-dashed aspect-square flex flex-col items-center justify-center",
                    isDark
                      ? "border-slate-700"
                      : "border-slate-200",
                  )}>
                    <Icons.Copy size={24} className={cn(colors.textMuted)} />
                    <span className={cn("text-xs mt-2", colors.textMuted)}>No ID Copy</span>
                  </div>
                )}

                {/* Proof of Residence */}
                {selectedCreator.proofOfResidenceUrl ? (
                  <a
                    href={selectedCreator.proofOfResidenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative rounded-lg overflow-hidden border border-[hsl(var(--surface-border))] block"
                  >
                    <div className="aspect-square">
                      <img
                        src={selectedCreator.proofOfResidenceUrl}
                        alt="Proof of Residence"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="flex flex-col items-center gap-1 text-white">
                        <Icons.Eye size={24} />
                        <span className="text-xs font-medium">Proof of Residence</span>
                      </div>
                    </div>
                    <div className="absolute top-2 left-2">
                      <Badge variant="success" className="text-xs">Proof of Residence</Badge>
                    </div>
                  </a>
                ) : (
                  <div className={cn(
                    "rounded-lg p-4 text-center border-2 border-dashed aspect-square flex flex-col items-center justify-center",
                    isDark
                      ? "border-slate-700"
                      : "border-slate-200",
                  )}>
                    <Icons.Home size={24} className={cn(colors.textMuted)} />
                    <span className={cn("text-xs mt-2", colors.textMuted)}>No Proof of Residence</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div
                className={cn(
                  "rounded-xl p-4 text-center",
                  isDark
                    ? "bg-[hsl(var(--surface-hover))]/50"
                    : "bg-[hsl(var(--surface-hover))]",
                )}
              >
                <p
                  className={cn(
                    "text-2xl font-black uppercase tracking-wide",
                    colors.primaryText,
                  )}
                >
                  {formatNumber(selectedCreator.totalVideos)}
                </p>
                <p
                  className={cn(
                    "text-xs font-bold uppercase tracking-wider mt-1",
                    colors.textMuted,
                  )}
                >
                  Total Videos
                </p>
              </div>
              <div
                className={cn(
                  "rounded-xl p-4 text-center",
                  isDark
                    ? "bg-[hsl(var(--success))]/10"
                    : "bg-[hsl(var(--success))]/10",
                )}
              >
                <p
                  className={cn(
                    "text-2xl font-black uppercase tracking-wide",
                    colors.successText,
                  )}
                >
                  {formatCurrency(selectedCreator.totalRevenue)}
                </p>
                <p
                  className={cn(
                    "text-xs font-bold uppercase tracking-wider mt-1",
                    colors.successText,
                  )}
                >
                  Total Revenue
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t" style={{ borderColor: "hsl(var(--surface-border))" }}>
              {selectedCreator.status !== "active" && (
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => {
                    setShowProfileModal(false);
                    setShowApproveModal(true);
                  }}
                >
                  <Icons.Check size={16} className="inline mr-2" />
                  Approve
                </Button>
              )}
              {selectedCreator.status === "active" && (
                <Button
                  variant="danger"
                  className="flex-1"
                  onClick={() => handleToggleStatus(selectedCreator)}
                >
                  <Icons.XCircle size={16} className="inline mr-2" />
                  Deactivate
                </Button>
              )}
              {selectedCreator.status === "pending" && (
                <Button
                  variant="danger"
                  className="flex-1"
                  onClick={() => {
                    setShowProfileModal(false);
                    setShowRejectModal(true);
                  }}
                >
                  <Icons.X size={16} className="inline mr-2" />
                  Reject
                </Button>
              )}
              {selectedCreator.status === "suspended" && (
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => handleToggleStatus(selectedCreator)}
                >
                  <Icons.Check size={16} className="inline mr-2" />
                  Reactivate
                </Button>
              )}
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handlePayout(selectedCreator)}
              >
                <Icons.Banknote size={16} className="inline mr-2" />
                Process Payout
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Avatar Modal */}
      <Modal
        isOpen={showAvatarModal}
        onClose={() => {
          setShowAvatarModal(false);
          setShowProfileModal(true);
        }}
        title="Avatar"
        size="sm"
      >
        {selectedCreator?.avatar && (
          <img
            src={selectedCreator.avatar}
            alt="Avatar"
            className="w-full rounded-lg"
          />
        )}
      </Modal>

      {/* Approve Confirmation */}
      <ConfirmModal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onConfirm={handleApprove}
        title="Approve Creator"
        message="Are you sure you want to approve this creator? They will be able to access the platform and start uploading content."
        confirmText="Approve"
        variant="info"
      />

      {/* Reject Confirmation */}
      <ConfirmModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleReject}
        title="Reject Creator"
        message="Are you sure you want to reject this creator? They will not be able to access the platform."
        confirmText="Reject"
        variant="danger"
      />
    </div>
  );
}
