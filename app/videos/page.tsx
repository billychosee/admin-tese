"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { ConfirmModal } from "@/components/ui/Modal";
import { SkeletonTable } from "@/components/ui/Skeleton";
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

  if (isLoading && page === 1) {
    return (
      <div className={cn("space-y-6 min-h-screen font-sans", isDark ? "bg-[#020617]" : "bg-[#F1F5F9]")}>
        <SkeletonTable rows={10} cols={7} />
      </div>
    );
  }

  return (
    <div className={cn("space-y-8 min-h-screen font-sans transition-colors duration-300", isDark ? "bg-[#020617]" : "bg-white")}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={cn("relative", isDark ? "bg-slate-800" : "bg-white")}>
            <Input
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn("w-64 pl-10", isDark ? "bg-slate-700 border-slate-600 text-white placeholder:text-slate-400" : "bg-slate-50 border-slate-200")}
            />
            <Icons.Search size={18} className={cn("absolute left-3 top-1/2 -translate-y-1/2", isDark ? "text-slate-400" : "text-slate-400")} />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={cn("input w-40", isDark ? "bg-slate-700 border-slate-600 text-white" : "bg-slate-50 border-slate-200")}
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
            className={cn("input w-40", isDark ? "bg-slate-700 border-slate-600 text-white" : "bg-slate-50 border-slate-200")}
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
        <Card className={cn("p-12 rounded-[3rem] border-none shadow-xl text-center transition-colors duration-300", isDark ? "bg-slate-800" : "bg-white")}>
          <CardContent>
            <Icons.Video className={cn("mx-auto h-16 w-16 mb-4", isDark ? "text-slate-600" : "text-slate-300")} />
            <p className={cn("text-lg font-medium", isDark ? "text-slate-400" : "text-slate-500")}>No videos found</p>
          </CardContent>
        </Card>
      ) : (
        <Card className={cn("rounded-[3rem] border-none shadow-xl overflow-hidden transition-colors duration-300", isDark ? "bg-slate-800" : "bg-white")}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={cn("border-b text-xs font-black uppercase tracking-widest", isDark ? "border-slate-700 text-slate-400" : "border-slate-100 text-slate-400")}>
                  <th className="px-8 py-5 text-left">Video</th>
                  <th className="px-4 py-5 text-left">Creator</th>
                  <th className="px-4 py-5 text-left">Category</th>
                  <th className="px-4 py-5 text-left">Status</th>
                  <th className="px-4 py-5 text-left">Views</th>
                  <th className="px-4 py-5 text-left">Duration</th>
                  <th className="px-4 py-5 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className={cn("divide-y", isDark ? "divide-slate-700" : "divide-slate-50")}>
                {videos.map((video) => (
                  <tr key={video.id} className={cn("hover transition-all group", isDark ? "hover:bg-slate-700/50" : "hover:bg-slate-50")}>
                    <td className="px-8 py-5">
                      <div className="max-w-xs">
                        <p className={cn("font-black truncate", isDark ? "text-white" : "text-slate-800")}>
                          {video.title}
                        </p>
                        <p className={cn("text-xs font-bold uppercase tracking-wider mt-1", isDark ? "text-slate-500" : "text-slate-400")}>
                          {formatDate(video.createdAt)}
                        </p>
                      </div>
                    </td>
                    <td className={cn("px-4 py-5 text-sm font-medium", isDark ? "text-slate-400" : "text-slate-500")}>{video.creatorName}</td>
                    <td className={cn("px-4 py-5 text-sm font-medium", isDark ? "text-slate-400" : "text-slate-500")}>{video.categoryName}</td>
                    <td className="px-4 py-5">
                      <Badge
                        variant={
                          getStatusColor(video.status) as
                            | "success"
                            | "warning"
                            | "danger"
                            | "neutral"
                        }
                      >
                        {video.status}
                      </Badge>
                    </td>
                    <td className={cn("px-4 py-5 text-sm font-medium", isDark ? "text-slate-400" : "text-slate-500")}>{formatNumber(video.views)}</td>
                    <td className={cn("px-4 py-5 text-sm font-medium", isDark ? "text-slate-400" : "text-slate-500")}>
                      {formatDuration(video.duration)}
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggleFeatured(video)}
                          className={cn(
                            "p-2 rounded-xl transition-all",
                            video.isFeatured
                              ? isDark ? "bg-amber-500/20 text-amber-400" : "bg-amber-100 text-amber-600"
                              : isDark ? "hover:bg-slate-700 text-slate-400 hover:text-slate-200" : "hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                          )}
                          title={
                            video.isFeatured
                              ? "Remove from featured"
                              : "Promote to featured"
                          }
                        >
                          <Icons.Star size={16} />
                        </button>
                        <button
                          onClick={() => handleToggleBanner(video)}
                          className={cn(
                            "p-2 rounded-xl transition-all",
                            video.isBanner
                              ? isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"
                              : isDark ? "hover:bg-slate-700 text-slate-400 hover:text-slate-200" : "hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                          )}
                          title={
                            video.isBanner
                              ? "Remove from banner"
                              : "Promote to banner"
                          }
                        >
                          <Icons.Image size={16} />
                        </button>
                        <button
                          onClick={() =>
                            handleUpdateStatus(
                              video,
                              video.status === "published"
                                ? "draft"
                                : "published",
                            )
                          }
                          className={cn("p-2 rounded-xl transition-all", isDark ? "hover:bg-slate-700 text-slate-400 hover:text-slate-200" : "hover:bg-slate-100 text-slate-400 hover:text-slate-600")}
                          title="Toggle publish status"
                        >
                          <Icons.Send size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedVideo(video);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 rounded-xl hover:bg-red-500/10 text-red-400 transition-all"
                          title="Delete"
                        >
                          <Icons.Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {totalPages > 1 && (
        <div className={cn("flex items-center justify-center gap-4 py-4", isDark ? "bg-slate-800 rounded-3xl" : "bg-white rounded-3xl shadow-xl")}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className={isDark ? "border-slate-600 hover:bg-slate-700" : ""}
          >
            Previous
          </Button>
          <span className={cn("text-sm font-black uppercase tracking-wider px-4", isDark ? "text-slate-400" : "text-slate-500")}>
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
