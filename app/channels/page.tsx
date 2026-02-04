"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { SkeletonList, SkeletonTable } from "@/components/ui/Skeleton";
import { ChannelTable } from "@/components/Tables/ChannelTable";
import { Icons } from "@/components/ui/Icons";
import { useToast } from "@/components/ui/Toast";
import { useTheme } from "@/components/providers/ThemeProvider";
import { api } from "@/services/api";
import {
  cn,
  formatNumber,
  formatCurrency,
  formatRelativeTime,
  getInitials,
} from "@/utils";
import type { Creator } from "@/types";

export default function ChannelsPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [creators, setCreators] = useState<Creator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<
    "deactivate" | "activate" | null
  >(null);
  const [confirmTarget, setConfirmTarget] = useState<"channel" | "creator">(
    "channel",
  );
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCreators();
  }, [page]);

  const fetchCreators = async () => {
    setIsLoading(true);
    try {
      const result = await api.creators.getAll(page, 12);
      setCreators(result.data);
      setTotalPages(result.totalPages);
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to fetch channels",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivateChannel = async (creator: Creator) => {
    try {
      await api.creators.deactivateChannel(creator.id);
      addToast({
        type: "success",
        title: "Success",
        message: "Channel deactivated",
      });
      fetchCreators();
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to deactivate channel",
      });
    }
  };

  const handleActivateChannel = async (creator: Creator) => {
    try {
      await api.creators.activateChannel(creator.id);
      addToast({
        type: "success",
        title: "Success",
        message: "Channel activated",
      });
      fetchCreators();
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to activate channel",
      });
    }
  };

  const handleToggleCreatorStatus = async (creator: Creator) => {
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
        message: "Failed to update creator status",
      });
    }
  };

  const openChannel = (creator: Creator) => {
    router.push(`/channels/${creator.id}`);
  };

  const openConfirmModal = (
    creator: Creator,
    action: "deactivate" | "activate",
    target: "channel" | "creator",
  ) => {
    setSelectedCreator(creator);
    setConfirmAction(action);
    setConfirmTarget(target);
    setShowConfirmModal(true);
  };

  const handleConfirmedAction = () => {
    if (!selectedCreator || !confirmAction) return;

    if (confirmTarget === "channel") {
      if (confirmAction === "deactivate") {
        handleDeactivateChannel(selectedCreator);
      } else {
        handleActivateChannel(selectedCreator);
      }
    } else {
      handleToggleCreatorStatus(selectedCreator);
    }

    setShowConfirmModal(false);
    setSelectedCreator(null);
    setConfirmAction(null);
    setConfirmTarget("channel");
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

  return (
    <div
      className={cn(
        "space-y-8 min-h-screen font-sans transition-colors duration-300",
        colors.background,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-[hsl(var(--text-primary))]">
            Channels
          </h1>
          <p className="text-xs font-bold uppercase tracking-widest mt-1 text-[hsl(var(--text-muted))]">
            Manage your content channels
          </p>
        </div>

        {/* View Mode Toggle */}
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
      </div>

      {/* Content */}
      {isLoading && page === 1 ? (
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
            <Icons.Radio
              className={cn("mx-auto h-16 w-16 mb-4", colors.textMuted)}
            />
            <p className={cn("text-lg font-medium", colors.textSecondary)}>
              No channels found
            </p>
          </CardContent>
        </Card>
      ) : viewMode === "list" ? (
        <ChannelTable
          creators={creators}
          isLoading={isLoading}
          onViewChannel={openChannel}
          onDeactivateChannel={(creator) =>
            openConfirmModal(creator, "deactivate", "channel")
          }
          onActivateChannel={(creator) =>
            openConfirmModal(creator, "activate", "channel")
          }
          onToggleCreatorStatus={(creator) =>
            openConfirmModal(
              creator,
              creator.status === "active" ? "deactivate" : "activate",
              "creator",
            )
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {creators.map((creator) => (
            <Card
              key={creator.id}
              hover
              className={cn(
                "rounded-2xl border transition-all duration-300 cursor-pointer",
                isDark
                  ? "bg-[hsl(var(--surface))] border-[hsl(var(--surface-border))]"
                  : "bg-slate-50 border-slate-200",
              )}
              onClick={() => openChannel(creator)}
            >
              <CardContent className="p-5">
                <div className="flex flex-col items-center text-center">
                  {/* Avatar */}
                  <div className="relative mb-3">
                    {creator.avatar ? (
                      <img
                        src={creator.avatar}
                        alt={creator.channelName}
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
                        {getInitials(creator.channelName)}
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

                  {/* Channel Name */}
                  <h3
                    className={cn(
                      "text-base font-semibold",
                      colors.textPrimary,
                    )}
                  >
                    {creator.channelName}
                  </h3>
                  <p
                    className={cn(
                      "text-xs font-medium uppercase tracking-wider mt-1",
                      colors.textMuted,
                    )}
                  >
                    {creator.creatorFullName}
                  </p>

                  {/* Channel Status Badge */}
                  <Badge
                    variant={
                      creator.channelStatus === "active" ? "success" : "danger"
                    }
                    className="mt-3"
                  >
                    {creator.channelStatus === "active"
                      ? "Active"
                      : "Deactivated"}
                  </Badge>

                  {/* Stats */}
                  <div className="mt-4 w-full grid grid-cols-3 gap-3">
                    <div
                      className={cn(
                        "rounded-xl p-3 transition-colors duration-300 text-center",
                        isDark
                          ? "bg-[hsl(var(--surface-hover))]/50"
                          : "bg-[hsl(var(--surface-hover))]",
                      )}
                    >
                      <p
                        className={cn("text-lg font-bold", colors.textPrimary)}
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
                          ? "bg-[hsl(var(--primary))]/10"
                          : "bg-[hsl(var(--primary))]/10",
                      )}
                    >
                      <p
                        className={cn("text-lg font-bold", colors.primaryText)}
                      >
                        {formatNumber(creator.playlists?.length || 0)}
                      </p>
                      <p
                        className={cn(
                          "text-[10px] font-medium uppercase tracking-wider",
                          colors.primaryText,
                        )}
                      >
                        Playlists
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
                        className={cn("text-lg font-bold", colors.successText)}
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

      {/* Channel Detail Modal */}
      <Modal
        isOpen={showChannelModal}
        onClose={() => setShowChannelModal(false)}
        title="Channel Details"
        size="xl"
      >
        {selectedCreator && (
          <div className="space-y-6 max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center gap-6 pb-6 border-b border-slate-200 dark:border-slate-700">
              <div className="relative flex-shrink-0">
                {selectedCreator.avatar ? (
                  <img
                    src={selectedCreator.avatar}
                    alt={selectedCreator.channelName}
                    className="w-24 h-24 rounded-full object-cover shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shadow-lg">
                    <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                      {getInitials(selectedCreator.channelName)}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {selectedCreator.channelName}
                  </h3>
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
                <p className="text-lg text-slate-600 dark:text-slate-300 mb-2">
                  {selectedCreator.creatorFullName}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {selectedCreator.channelUrl}
                </p>
              </div>
            </div>

            {/* Stats */}
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

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button
                variant="outline"
                onClick={() => {
                  setShowChannelModal(false);
                  openConfirmModal(
                    selectedCreator,
                    selectedCreator.channelStatus === "active"
                      ? "deactivate"
                      : "activate",
                    "channel",
                  );
                }}
              >
                {selectedCreator.channelStatus === "active" ? (
                  <>
                    <Icons.Lock size={16} className="mr-2" />
                    Deactivate Channel
                  </>
                ) : (
                  <>
                    <Icons.Unlock size={16} className="mr-2" />
                    Activate Channel
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setSelectedCreator(null);
          setConfirmAction(null);
        }}
        onConfirm={handleConfirmedAction}
        title={
          confirmAction === "deactivate"
            ? `Deactivate ${confirmTarget === "channel" ? "Channel" : "Creator"}`
            : `Activate ${confirmTarget === "channel" ? "Channel" : "Creator"}`
        }
        message={
          selectedCreator
            ? `Are you sure you want to ${confirmAction === "deactivate" ? "deactivate" : "activate"} ${confirmTarget === "channel" ? `"${selectedCreator.channelName}"` : `"${selectedCreator.creatorFullName}"`}? This ${confirmTarget === "channel" ? "channel" : "creator"} will ${confirmAction === "deactivate" ? "no longer be" : "become"} visible to users.`
            : ""
        }
        confirmText={confirmAction === "deactivate" ? "Deactivate" : "Activate"}
        variant="danger"
      />
    </div>
  );
}
