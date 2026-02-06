"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { SkeletonList, SkeletonTable } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { useTheme } from "@/components/providers/ThemeProvider";
import { api } from "@/services/api";
import { cn, formatNumber, formatDate, getStatusColor, getInitials } from "@/utils";
import type { Creator } from "@/types";

export default function KYCCreatorsPage() {
  const { addToast } = useToast();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCreators();
  }, [page]);

  const fetchCreators = async () => {
    setIsLoading(true);
    try {
      const result = await api.creators.getAll(page, 10, "pending");
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
        message: "Creator KYC approved successfully",
      });
      setShowProfileModal(false);
      setSelectedCreator(null);
      fetchCreators();
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to approve KYC",
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
        message: "Creator KYC rejected",
      });
      setShowProfileModal(false);
      setSelectedCreator(null);
      fetchCreators();
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to reject KYC",
      });
    }
  };

  const openProfile = (creator: Creator) => {
    setSelectedCreator(creator);
    setShowProfileModal(true);
  };

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
            KYC Verification
          </h1>
          <p className="text-xs sm:text-sm font-normal tracking-widest mt-1 text-[hsl(var(--text-muted))]">
            Review creator identity verification
          </p>
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
          <SkeletonTable rows={10} cols={6} />
        </div>
      ) : creators.length === 0 ? (
        <Card
          className={cn(
            "p-12 rounded-[3rem] border-none shadow-xl text-center transition-colors duration-300",
            colors.surface,
          )}
        >
          <CardContent>
            <p className={cn("text-lg font-medium", colors.textSecondary)}>
              No pending KYC verifications
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                  </div>

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
                    <Badge
                      variant="warning"
                      className="text-[10px] px-2 py-0.5 mt-2"
                    >
                      Pending Verification
                    </Badge>
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
        title="KYC Verification"
        size="lg"
      >
        {selectedCreator && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              {selectedCreator.avatar ? (
                <img
                  src={selectedCreator.avatar}
                  alt={selectedCreator.creatorFullName}
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
                  {getInitials(selectedCreator.creatorFullName)}
                </div>
              )}
              <div>
                <h3 className={cn("text-lg font-semibold", colors.textPrimary)}>
                  {selectedCreator.creatorFullName}
                </h3>
                <p className={cn("text-sm", colors.textMuted)}>
                  {selectedCreator.channelName}
                </p>
              </div>
            </div>

            <div className={cn("p-4 rounded-lg", colors.surfaceMuted)}>
              <p className={cn("text-sm font-medium mb-2", colors.textSecondary)}>
                Email
              </p>
              <p className={cn("", colors.textPrimary)}>{selectedCreator.email}</p>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowProfileModal(false);
                  setSelectedCreator(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  handleApprove();
                  handleReject();
                }}
              >
                Reject
              </Button>
              <Button
                variant="primary"
                onClick={handleApprove}
              >
                Approve
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
