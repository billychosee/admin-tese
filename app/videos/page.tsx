"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { VideoTable } from "@/components/Tables/VideoTable";
import { Icons } from "@/components/ui/Icons";
import { useToast } from "@/components/ui/Toast";
import { useTheme } from "@/components/providers/ThemeProvider";
import { api } from "@/services/api";
import {
  cn,
  formatNumber,
  formatDuration,
  formatDate,
  getStatusColor,
} from "@/utils";
import { VIDEO_STATUSES, VIDEO_FILTERS } from "@/constants";
import type { Video } from "@/types";

type ViewMode = "grid" | "list";

export default function VideosPage() {
  const { addToast } = useToast();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [filter, setFilter] = useState("all");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewVideo, setPreviewVideo] = useState<Video | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchVideos();
  }, [page, statusFilter, filter, searchQuery]);

  const fetchVideos = async () => {
    setIsLoading(true);
    try {
      const result = await api.videos.getAll(
        page,
        10,
        statusFilter,
        filter,
        searchQuery,
      );
      setVideos(result.data);
      setTotalPages(result.totalPages);
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to fetch videos",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedVideo) return;
    try {
      await api.videos.delete(selectedVideo.id);
      addToast({
        type: "success",
        title: "Success",
        message: "Video deleted successfully",
      });
      setShowDeleteModal(false);
      setSelectedVideo(null);
      fetchVideos();
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to delete video",
      });
    }
  };

  const handleUpdateStatus = async (video: Video, status: Video["status"]) => {
    try {
      await api.videos.updateStatus(video.id, status);
      addToast({
        type: "success",
        title: "Success",
        message: "Video status updated",
      });
      fetchVideos();
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to update status",
      });
    }
  };

  const handleToggleFeatured = async (video: Video) => {
    try {
      if (video.isFeatured) {
        await api.videos.removeFromFeatured(video.id);
        addToast({ type: "success", title: "Removed from featured" });
      } else {
        await api.videos.promoteToFeatured(video.id);
        addToast({ type: "success", title: "Added to featured" });
      }
      fetchVideos();
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to update featured status",
      });
    }
  };

  const handleToggleBanner = async (video: Video) => {
    try {
      if (video.isBanner) {
        await api.videos.removeFromBanner(video.id);
        addToast({ type: "success", title: "Removed from banner" });
      } else {
        await api.videos.promoteToBanner(video.id);
        addToast({ type: "success", title: "Added to banner" });
      }
      fetchVideos();
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to update banner status",
      });
    }
  };

  const handleToggleSuspend = async (video: Video) => {
    try {
      if (video.status === "suspended") {
        await api.videos.updateStatus(video.id, "published");
        addToast({ type: "success", title: "Video unsuspended" });
      } else {
        await api.videos.updateStatus(video.id, "suspended");
        addToast({ type: "success", title: "Video suspended" });
      }
      fetchVideos();
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to update suspension status",
      });
    }
  };

  if (isLoading && page === 1) {
    return (
      <div
        className={cn(
          "space-y-6 min-h-screen font-sans",
          isDark ? "bg-[#020617]" : "bg-[#F1F5F9]",
        )}
      >
        <SkeletonTable rows={10} cols={7} />
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
      {/* HEADER & CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-[hsl(var(--text-primary))]">
            Videos
          </h1>
          <p className="text-xs font-bold uppercase tracking-widest mt-1 text-[hsl(var(--text-muted))]">
            Manage your video content
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* VIEW TOGGLE */}
          <div
            className="flex p-1 rounded-xl border"
            style={{
              backgroundColor: isDark ? "hsl(var(--surface))" : "white",
              borderColor: isDark
                ? "hsl(var(--surface-border))"
                : "hsl(var(--surface-border))",
            }}
          >
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-2 rounded-lg transition-all",
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
              <Icons.Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-2 rounded-lg transition-all",
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
              <Icons.List size={16} />
            </button>
          </div>
        </div>
      </div>

      {videos.length === 0 ? (
        <Card
          className={cn(
            "p-12 rounded-[3rem] border-none shadow-xl text-center transition-colors duration-300",
            isDark ? "bg-slate-800" : "bg-white",
          )}
        >
          <CardContent>
            <Icons.Video
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
              No videos found
            </p>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {videos.map((video) => (
            <Card
              key={video.id}
              hover
              className={cn(
                "rounded-2xl border transition-all duration-300 overflow-hidden",
                isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200",
              )}
            >
              <div className="relative aspect-video bg-slate-900">
                {video.thumbnail ? (
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icons.Video size={48} className="text-slate-600" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge
                    variant={
                      video.status === "published"
                        ? "success"
                        : video.status === "pending"
                        ? "warning"
                        : "danger"
                    }
                    className="rounded-lg font-black text-[8px] uppercase"
                  >
                    {video.status}
                  </Badge>
                </div>
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                  {formatDuration(video.duration)}
                </div>
                {/* Play Button Overlay */}
                <button
                  onClick={() => {
                    setPreviewVideo(video);
                    setShowPreviewModal(true);
                  }}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-300 group"
                >
                  <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Icons.Play size={32} className="text-slate-900 ml-1" />
                  </div>
                </button>
              </div>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h3 className={cn(
                      "text-sm font-semibold line-clamp-2",
                      isDark ? "text-white" : "text-slate-900",
                    )}>
                      {video.title}
                    </h3>
                    <p className={cn(
                      "text-xs font-medium uppercase tracking-wider",
                      isDark ? "text-slate-400" : "text-slate-500",
                    )}>
                      {video.creatorName}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className={isDark ? "text-slate-400" : "text-slate-500"}>
                      {formatNumber(video.views)} views
                    </span>
                    <span className={isDark ? "text-slate-400" : "text-slate-500"}>
                      {formatDate(video.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-8 w-8 p-0 transition-colors duration-300",
                          isDark
                            ? "text-slate-400 hover:text-white hover:bg-slate-700"
                            : "text-slate-500 hover:text-slate-900 hover:bg-slate-100",
                        )}
                        onClick={() => handleToggleFeatured(video)}
                        title={video.isFeatured ? "Remove from featured" : "Promote to featured"}
                      >
                        <Icons.Star size={14} className={video.isFeatured ? "text-amber-500" : ""} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-8 w-8 p-0 transition-colors duration-300",
                          isDark
                            ? "text-slate-400 hover:text-white hover:bg-slate-700"
                            : "text-slate-500 hover:text-slate-900 hover:bg-slate-100",
                        )}
                        onClick={() => handleToggleBanner(video)}
                        title={video.isBanner ? "Remove from banner" : "Promote to banner"}
                      >
                        <Icons.Image size={14} />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-8 w-8 p-0 transition-colors duration-300",
                        isDark
                          ? "text-slate-400 hover:text-white hover:bg-slate-700"
                          : "text-slate-500 hover:text-slate-900 hover:bg-slate-100",
                      )}
                      onClick={() => {
                        setSelectedVideo(video);
                        setShowDeleteModal(true);
                      }}
                      title="Delete"
                    >
                      <Icons.Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <VideoTable
          videos={videos}
          isLoading={isLoading}
          onToggleFeatured={handleToggleFeatured}
          onToggleBanner={handleToggleBanner}
          onToggleSuspend={handleToggleSuspend}
          onUpdateStatus={handleUpdateStatus}
          onDelete={(video) => {
            setSelectedVideo(video);
            setShowDeleteModal(true);
          }}
        />
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

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Video"
        message={`Are you sure you want to delete "${selectedVideo?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />

      {/* Video Preview Modal */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => {
          setShowPreviewModal(false);
          setPreviewVideo(null);
        }}
        title="Video Preview & Metrics"
        size="xl"
      >
        {previewVideo && (
          <div className="space-y-6">
            {/* Video Player */}
            <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden shadow-lg">
              {previewVideo.videoUrl ? (
                <video
                  src={previewVideo.videoUrl}
                  poster={previewVideo.thumbnail}
                  controls
                  className="w-full h-full object-contain"
                  preload="metadata"
                />
              ) : previewVideo.thumbnail ? (
                <div className="relative w-full h-full flex items-center justify-center group">
                  <img
                    src={previewVideo.thumbnail}
                    alt={previewVideo.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors">
                        <Icons.Play size={24} className="text-white ml-1" />
                      </div>
                      <div className="text-white">
                        <p className="font-semibold text-lg">{formatDuration(previewVideo.duration)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Icons.Video size={48} className="text-slate-600" />
                </div>
              )}
            </div>
            
            {/* Video Title & Status Badges */}
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                {previewVideo.title}
              </h3>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant={previewVideo.isFeatured ? "warning" : "neutral"}>
                  {previewVideo.isFeatured ? "⭐ Featured" : "Not Featured"}
                </Badge>
                <Badge variant={previewVideo.isBanner ? "info" : "neutral"}>
                  {previewVideo.isBanner ? "🖼️ Banner" : "Not Banner"}
                </Badge>
                <Badge 
                  variant={
                    previewVideo.status === "published" ? "success" :
                    previewVideo.status === "pending" ? "warning" :
                    previewVideo.status === "suspended" ? "danger" : "neutral"
                  }
                >
                  {previewVideo.status.charAt(0).toUpperCase() + previewVideo.status.slice(1)}
                </Badge>
                {previewVideo.isPaid && (
                  <Badge variant="info">
                    💰 {previewVideo.currency || "USD"} {previewVideo.price?.toFixed(2)}
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Performance Metrics */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Icons.BarChart size={16} />
                Performance Metrics
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-center">
                  <Icons.Eye size={16} className="mx-auto mb-1 text-blue-500" />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Views</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{formatNumber(previewVideo.views)}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-center">
                  <Icons.Heart size={16} className="mx-auto mb-1 text-red-500" />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Likes</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{formatNumber(previewVideo.likes)}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-center">
                  <Icons.MessageCircle size={16} className="mx-auto mb-1 text-green-500" />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Comments</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{formatNumber(previewVideo.comments)}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-center">
                  <Icons.Share2 size={16} className="mx-auto mb-1 text-purple-500" />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Shares</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{formatNumber(previewVideo.shares || 0)}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-center">
                  <Icons.Clock size={16} className="mx-auto mb-1 text-amber-500" />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Watch Time</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{formatDuration(previewVideo.watchTime || 0)}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-center">
                  <Icons.TrendingUp size={16} className="mx-auto mb-1 text-emerald-500" />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Engagement</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{previewVideo.engagementRate || 0}%</p>
                </div>
              </div>
            </div>
            
            {/* Video Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div>
                <p className={cn("text-xs uppercase tracking-wider font-medium", isDark ? "text-slate-500" : "text-slate-400")}>
                  Creator
                </p>
                <p className={isDark ? "text-white" : "text-slate-900"}>
                  {previewVideo.creatorName}
                </p>
              </div>
              <div>
                <p className={cn("text-xs uppercase tracking-wider font-medium", isDark ? "text-slate-500" : "text-slate-400")}>
                  Category
                </p>
                <p className={isDark ? "text-white" : "text-slate-900"}>
                  {previewVideo.categoryName}
                </p>
              </div>
              <div>
                <p className={cn("text-xs uppercase tracking-wider font-medium", isDark ? "text-slate-500" : "text-slate-400")}>
                  Duration
                </p>
                <p className={isDark ? "text-white" : "text-slate-900"}>
                  {formatDuration(previewVideo.duration)}
                </p>
              </div>
              <div>
                <p className={cn("text-xs uppercase tracking-wider font-medium", isDark ? "text-slate-500" : "text-slate-400")}>
                  Published
                </p>
                <p className={isDark ? "text-white" : "text-slate-900"}>
                  {formatDate(previewVideo.createdAt)}
                </p>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowPreviewModal(false);
                  handleToggleFeatured(previewVideo);
                }}
                className="flex-1"
              >
                <Icons.Star size={14} className="mr-2" />
                {previewVideo.isFeatured ? "Remove Featured" : "Add to Featured"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowPreviewModal(false);
                  handleToggleBanner(previewVideo);
                }}
                className="flex-1"
              >
                <Icons.Image size={14} className="mr-2" />
                {previewVideo.isBanner ? "Remove Banner" : "Add to Banner"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowPreviewModal(false);
                  handleUpdateStatus(previewVideo, previewVideo.status === "published" ? "pending" : "published");
                }}
                className="flex-1"
              >
                <Icons.RefreshCw size={14} className="mr-2" />
                {previewVideo.status === "published" ? "Unpublish" : "Publish"}
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowPreviewModal(false);
                  handleToggleSuspend(previewVideo);
                }}
                className="flex-1"
              >
                <Icons.Ban size={14} className="mr-2" />
                {previewVideo.status === "suspended" ? "Unsuspend" : "Suspend"}
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  setSelectedVideo(previewVideo);
                  setShowDeleteModal(true);
                  setShowPreviewModal(false);
                }}
                className="flex-1"
              >
                <Icons.Trash2 size={14} className="mr-2" />
                Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
