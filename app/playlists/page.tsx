"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { SkeletonList, SkeletonTable } from "@/components/ui/Skeleton";
import { PlaylistTable } from "@/components/Tables/PlaylistTable";
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
import type { Playlist } from "@/types";

export default function PlaylistsPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [showVideosModal, setShowVideosModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewVideo, setPreviewVideo] = useState<Playlist | null>(null);
  const [confirmAction, setConfirmAction] = useState<"deactivate" | "activate" | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPlaylists();
  }, [page]);

  const fetchPlaylists = async () => {
    setIsLoading(true);
    try {
      const result = await api.playlists.getAll(page, 12);
      setPlaylists(result.data);
      setTotalPages(result.totalPages);
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to fetch playlists",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (playlist: Playlist) => {
    try {
      if (playlist.isActive && !playlist.isDeactivated) {
        await api.playlists.deactivate(playlist.id);
        addToast({
          type: "success",
          title: "Success",
          message: "Playlist deactivated",
        });
      } else {
        await api.playlists.activate(playlist.id);
        addToast({
          type: "success",
          title: "Success",
          message: "Playlist activated",
        });
      }
      fetchPlaylists();
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to update playlist status",
      });
    }
  };

  const handleConfirmedAction = async () => {
    if (!selectedPlaylist || !confirmAction) return;
    try {
      if (confirmAction === "deactivate") {
        await api.playlists.deactivate(selectedPlaylist.id);
        addToast({
          type: "success",
          title: "Success",
          message: "Playlist deactivated",
        });
      } else {
        await api.playlists.activate(selectedPlaylist.id);
        addToast({
          type: "success",
          title: "Success",
          message: "Playlist activated",
        });
      }
      setShowConfirmModal(false);
      setSelectedPlaylist(null);
      setConfirmAction(null);
      fetchPlaylists();
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to update playlist status",
      });
    }
  };

  const openConfirmModal = (playlist: Playlist, action: "deactivate" | "activate") => {
    setSelectedPlaylist(playlist);
    setConfirmAction(action);
    setShowConfirmModal(true);
  };

  const openPlaylist = (playlist: Playlist) => {
    router.push(`/playlists/${playlist.id}`);
  };

  const openVideos = (playlist: Playlist) => {
    router.push(`/playlists/${playlist.id}`);
  };

  const handlePreviewPlaylist = (playlist: Playlist) => {
    setPreviewVideo(playlist);
    setShowPreviewModal(true);
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
            Playlists
          </h1>
          <p className="text-xs font-bold uppercase tracking-widest mt-1 text-[hsl(var(--text-muted))]">
            Manage your content playlists
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
            <SkeletonTable rows={10} cols={7} />
          ) : (
            <SkeletonList count={8} />
          )}
        </div>
      ) : playlists.length === 0 ? (
        <Card
          className={cn(
            "p-12 rounded-[3rem] border-none shadow-xl text-center transition-colors duration-300",
            colors.surface,
          )}
        >
          <CardContent>
            <Icons.Play
              className={cn("mx-auto h-16 w-16 mb-4", colors.textMuted)}
            />
            <p className={cn("text-lg font-medium", colors.textSecondary)}>
              No playlists found
            </p>
          </CardContent>
        </Card>
      ) : viewMode === "list" ? (
        <PlaylistTable
          playlists={playlists}
          isLoading={isLoading}
          onViewPlaylist={openPlaylist}
          onToggleStatus={(playlist, action) => openConfirmModal(playlist, action)}
          onViewVideos={openVideos}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {playlists.map((playlist) => (
            <Card
              key={playlist.id}
              hover
              className={cn(
                "rounded-2xl border transition-all duration-300 cursor-pointer",
                isDark
                  ? "bg-[hsl(var(--surface))] border-[hsl(var(--surface-border))]"
                  : "bg-slate-50 border-slate-200",
              )}
              onClick={() => openPlaylist(playlist)}
            >
              <CardContent className="p-5">
                <div className="flex flex-col items-center text-center">
                  {/* Thumbnail */}
                  <div className="relative mb-3 group">
                    {playlist.thumbnail ? (
                      <>
                        <img
                          src={playlist.thumbnail}
                          alt={playlist.playlistName}
                          className="w-20 h-20 rounded-xl object-cover ring-2 ring-[hsl(var(--primary))]/20"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePreviewPlaylist(playlist);
                          }}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center"
                        >
                          <Icons.Play size={32} className="text-white ml-1" />
                        </button>
                      </>
                    ) : (
                      <div
                        className={cn(
                          "w-20 h-20 rounded-xl flex items-center justify-center text-2xl font-bold",
                          isDark
                            ? "bg-[hsl(var(--primary))]/20 text-[hsl(var(--primary))]"
                            : "bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]",
                        )}
                      >
                        {getInitials(playlist.playlistName)}
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <h3
                    className={cn(
                      "text-base font-semibold",
                      colors.textPrimary,
                    )}
                  >
                    {playlist.playlistName}
                  </h3>
                  <p
                    className={cn(
                      "text-xs font-medium uppercase tracking-wider mt-1",
                      colors.textMuted,
                    )}
                  >
                    {playlist.channelName}
                  </p>

                  {/* Creator */}
                  <p
                    className={cn(
                      "text-xs mt-1",
                      colors.textSecondary,
                    )}
                  >
                    {playlist.creatorName}
                  </p>

                  {/* Status Badge */}
                  <Badge
                    variant={
                      playlist.isDeactivated
                        ? "danger"
                        : playlist.isActive
                          ? "success"
                          : "warning"
                    }
                    className="mt-3"
                  >
                    {playlist.isDeactivated
                      ? "Deactivated"
                      : playlist.isActive
                        ? "Active"
                        : "Inactive"}
                  </Badge>

                  {/* Stats */}
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
                        {formatNumber(playlist.videoCount)}
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
                        {formatNumber(playlist.totalViews)}
                      </p>
                      <p
                        className={cn(
                          "text-[10px] font-medium uppercase tracking-wider",
                          colors.successText,
                        )}
                      >
                        Views
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mt-3">
                    {playlist.paymentType === "free" ? (
                      <Badge variant="neutral">Free</Badge>
                    ) : (
                      <span
                        className={cn(
                          "text-sm font-bold",
                          colors.successText,
                        )}
                      >
                        {formatCurrency(playlist.price || 0)}
                      </span>
                    )}
                  </div>

                  {/* Deactivate Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openConfirmModal(playlist, playlist.isActive && !playlist.isDeactivated ? "deactivate" : "activate");
                    }}
                    className={cn(
                      "mt-4 px-4 py-2 rounded-lg text-sm font-medium transition-colors border",
                      playlist.isActive && !playlist.isDeactivated
                        ? "border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                        : "border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                    )}
                  >
                    {playlist.isActive && !playlist.isDeactivated ? "Deactivate" : "Activate"}
                  </button>
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

      {/* Playlist Detail Modal */}
      <Modal
        isOpen={showPlaylistModal}
        onClose={() => setShowPlaylistModal(false)}
        title="Playlist Details"
        size="xl"
      >
        {selectedPlaylist && (
          <div className="space-y-6 max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center gap-6 pb-6 border-b border-slate-200 dark:border-slate-700">
              <div className="relative flex-shrink-0">
                {selectedPlaylist.thumbnail ? (
                  <img
                    src={selectedPlaylist.thumbnail}
                    alt={selectedPlaylist.playlistName}
                    className="w-24 h-24 rounded-xl object-cover shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shadow-lg">
                    <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                      {getInitials(selectedPlaylist.playlistName)}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {selectedPlaylist.playlistName}
                  </h3>
                  <Badge
                    variant={
                      selectedPlaylist.isDeactivated
                        ? "danger"
                        : selectedPlaylist.isActive
                          ? "success"
                          : "warning"
                    }
                  >
                    {selectedPlaylist.isDeactivated
                      ? "Deactivated"
                      : selectedPlaylist.isActive
                        ? "Active"
                        : "Inactive"}
                  </Badge>
                </div>
                <p className="text-lg text-slate-600 dark:text-slate-300 mb-2">
                  {selectedPlaylist.channelName}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {selectedPlaylist.creatorName}
                </p>
              </div>
            </div>

            {/* Description */}
            {selectedPlaylist.description && (
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                  Description
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {selectedPlaylist.description}
                </p>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatNumber(selectedPlaylist.videoCount)}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Videos</p>
              </div>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatNumber(selectedPlaylist.totalViews)}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Views</p>
              </div>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatNumber(selectedPlaylist.totalLikes)}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Likes</p>
              </div>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center">
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {selectedPlaylist.paymentType === "free" ? (
                    <Badge variant="neutral">Free</Badge>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(selectedPlaylist.price || 0)}
                    </span>
                  )}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Price</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPlaylistModal(false);
                  openVideos(selectedPlaylist);
                }}
              >
                <Icons.Play size={16} className="mr-2" />
                View Videos
              </Button>
              <Button
                variant={selectedPlaylist.isActive && !selectedPlaylist.isDeactivated ? "danger" : "primary"}
                onClick={() => {
                  openConfirmModal(
                    selectedPlaylist,
                    selectedPlaylist.isActive && !selectedPlaylist.isDeactivated ? "deactivate" : "activate"
                  );
                  setShowPlaylistModal(false);
                }}
              >
                {selectedPlaylist.isActive && !selectedPlaylist.isDeactivated ? (
                  <>
                    <Icons.Lock size={16} className="mr-2" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <Icons.Unlock size={16} className="mr-2" />
                    Activate
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Videos Modal */}
      <Modal
        isOpen={showVideosModal}
        onClose={() => setShowVideosModal(false)}
        title="Videos in Playlist"
        size="xl"
      >
        {selectedPlaylist && (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-700">
              {selectedPlaylist.thumbnail && (
                <img
                  src={selectedPlaylist.thumbnail}
                  alt={selectedPlaylist.playlistName}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              )}
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {selectedPlaylist.playlistName}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {selectedPlaylist.videoCount} videos
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {selectedPlaylist.videos.length === 0 ? (
                <p className="text-center py-8 text-slate-500 dark:text-slate-400">
                  No videos in this playlist
                </p>
              ) : (
                selectedPlaylist.videos.map((video) => (
                  <div
                    key={video.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800"
                  >
                    <div className="relative flex-shrink-0">
                      {video.thumbnail ? (
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-20 h-12 rounded object-cover"
                        />
                      ) : (
                        <div className="w-20 h-12 rounded bg-slate-200 dark:bg-slate-700" />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <Icons.Play size={20} className="text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {video.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {formatNumber(video.views)} views • {formatRelativeTime(video.createdAt)}
                      </p>
                    </div>
                    <Badge
                      variant={
                        video.status === "published"
                          ? "success"
                          : video.status === "pending"
                            ? "warning"
                            : "danger"
                      }
                    >
                      {video.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setSelectedPlaylist(null);
          setConfirmAction(null);
        }}
        onConfirm={handleConfirmedAction}
        title={confirmAction === "deactivate" ? "Deactivate Playlist" : "Activate Playlist"}
        message={
          selectedPlaylist
            ? `Are you sure you want to ${confirmAction === "deactivate" ? "deactivate" : "activate"} "${selectedPlaylist.playlistName}"? This playlist will ${confirmAction === "deactivate" ? "no longer be" : "become"} visible to users.`
            : ""
        }
        confirmText={confirmAction === "deactivate" ? "Deactivate" : "Activate"}
        variant="danger"
      />

      {/* Preview Modal */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => {
          setShowPreviewModal(false);
          setPreviewVideo(null);
        }}
        title={previewVideo?.playlistName || "Playlist Preview"}
        size="lg"
      >
        {previewVideo && (
          <div className="space-y-4">
            <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden">
              {previewVideo.thumbnail ? (
                <img
                  src={previewVideo.thumbnail}
                  alt={previewVideo.playlistName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Icons.Play size={64} className="text-slate-600" />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                  <Icons.Play size={40} className="text-slate-900 ml-2" />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {previewVideo.playlistName}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {previewVideo.channelName} • {formatNumber(previewVideo.videoCount)} videos
                </p>
              </div>
              <Button
                variant="primary"
                onClick={() => {
                  setShowPreviewModal(false);
                  openPlaylist(previewVideo);
                }}
              >
                View Playlist
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

