"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { ConfirmModal } from "@/components/ui/Modal";
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

export default function VideosPage() {
  const { addToast } = useToast();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [filter, setFilter] = useState("all");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={cn("relative", isDark ? "bg-slate-800" : "bg-white")}>
            <Input
              placeholder="Search videos..."
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
            {VIDEO_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={cn(
              "input w-40",
              isDark
                ? "bg-slate-700 border-slate-600 text-white"
                : "bg-slate-50 border-slate-200",
            )}
          >
            {VIDEO_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
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
    </div>
  );
}
