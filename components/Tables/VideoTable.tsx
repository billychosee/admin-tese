"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfirmModal } from "@/components/ui/Modal";
import { cn, formatNumber, formatDuration, formatDate } from "@/utils";
import { Icons } from "@/components/ui/Icons";
import { VIDEO_STATUSES, VIDEO_FILTERS } from "@/constants";
import type { Video } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";

interface VideoTableProps {
  videos: Video[];
  isLoading?: boolean;
  onToggleFeatured?: (video: Video) => Promise<void>;
  onToggleBanner?: (video: Video) => Promise<void>;
  onToggleSuspend?: (video: Video) => Promise<void>;
  onUpdateStatus?: (
    video: Video,
    status: "pending" | "published" | "draft" | "suspended" | "deleted",
  ) => Promise<void>;
  onDelete?: (video: Video) => void;
  onView?: (video: Video) => void;
}

export function VideoTable({
  videos,
  isLoading,
  onToggleFeatured,
  onToggleBanner,
  onToggleSuspend,
  onUpdateStatus,
  onDelete,
  onView,
}: VideoTableProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFeaturedModal, setShowFeaturedModal] = useState(false);
  const [featuredAction, setFeaturedAction] = useState<"add" | "remove">("add");
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [bannerAction, setBannerAction] = useState<"add" | "remove">("add");
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishAction, setPublishAction] = useState<"publish" | "unpublish">(
    "publish",
  );
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspendAction, setSuspendAction] = useState<"suspend" | "unsuspend">(
    "suspend",
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const itemsPerPage = 10;

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "published":
        return "success";
      case "pending":
        return "warning";
      case "suspended":
        return "danger";
      case "draft":
        return "neutral";
      case "deleted":
        return "danger";
      default:
        return "neutral";
    }
  };

  const filteredVideos = useMemo(() => {
    return videos.filter((video) => {
      const matchesSearch =
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.creatorName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || video.status === statusFilter;

      let matchesFilter = true;
      if (filter === "featured") {
        matchesFilter = video.isFeatured;
      } else if (filter === "banner") {
        matchesFilter = video.isBanner;
      } else if (filter === "suspended") {
        matchesFilter = video.status === "suspended";
      } else if (filter === "paid") {
        matchesFilter = video.isPaid;
      } else if (filter === "free") {
        matchesFilter = !video.isPaid;
      }

      return matchesSearch && matchesStatus && matchesFilter;
    });
  }, [videos, searchTerm, statusFilter, filter]);

  const paginatedVideos = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredVideos.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredVideos, currentPage]);

  const totalPages = Math.ceil(filteredVideos.length / itemsPerPage);

  const handleViewVideo = (video: Video) => {
    onView?.(video);
    router.push(`/videos/${video.id}`);
  };

  const handleAction = (
    action: "featured" | "banner" | "publish" | "suspend" | "delete",
    video: Video,
  ) => {
    setSelectedVideo(video);
    switch (action) {
      case "featured":
        setFeaturedAction(video.isFeatured ? "remove" : "add");
        setShowFeaturedModal(true);
        break;
      case "banner":
        setBannerAction(video.isBanner ? "remove" : "add");
        setShowBannerModal(true);
        break;
      case "publish":
        setPublishAction(video.status === "published" ? "unpublish" : "publish");
        setShowPublishModal(true);
        break;
      case "suspend":
        setSuspendAction(
          video.status === "suspended" ? "unsuspend" : "suspend",
        );
        setShowSuspendModal(true);
        break;
      case "delete":
        setShowDeleteModal(true);
        break;
    }
  };

  const handleConfirmFeatured = async () => {
    if (!selectedVideo) return;
    await onToggleFeatured?.(selectedVideo);
    setShowFeaturedModal(false);
    setSelectedVideo(null);
  };

  const handleConfirmBanner = async () => {
    if (!selectedVideo) return;
    await onToggleBanner?.(selectedVideo);
    setShowBannerModal(false);
    setSelectedVideo(null);
  };

  const handleConfirmPublish = async () => {
    if (!selectedVideo) return;
    await onUpdateStatus?.(
      selectedVideo,
      publishAction === "unpublish" ? "draft" : "published",
    );
    setShowPublishModal(false);
    setSelectedVideo(null);
  };

  const handleConfirmSuspend = async () => {
    if (!selectedVideo) return;
    await onToggleSuspend?.(selectedVideo);
    setShowSuspendModal(false);
    setSelectedVideo(null);
  };

  const handleConfirmDelete = () => {
    if (selectedVideo) {
      onDelete?.(selectedVideo);
    }
    setShowDeleteModal(false);
    setSelectedVideo(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="h-10 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-slate-100 dark:bg-slate-700/50 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <div className="relative w-full sm:w-64">
            <Icons.Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <Input
              type="search"
              placeholder="Search videos or creators..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Status</option>
            {VIDEO_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {VIDEO_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
          {filteredVideos.length} video{filteredVideos.length !== 1 ? "s" : ""}{" "}
          found
        </div>
      </div>

      {/* Cards Grid for Mobile */}
      <div className="block lg:hidden">
        {paginatedVideos.length === 0 ? (
          <div className="text-center py-12">
            <Icons.Video
              size={48}
              className="mx-auto text-slate-300 dark:text-slate-600 mb-4"
            />
            <p className="text-slate-500 dark:text-slate-400">
              No videos found
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {paginatedVideos.map((video) => (
              <Card
                key={video.id}
                className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              >
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <div className="relative group flex-shrink-0">
                      {video.thumbnail ? (
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-20 h-14 object-cover rounded-lg"
                          onClick={() => handleViewVideo(video)}
                        />
                      ) : (
                        <div className="w-20 h-14 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                          <Icons.Video size={20} className="text-slate-400" />
                        </div>
                      )}
                      <button
                        onClick={() => handleViewVideo(video)}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center"
                      >
                        <Icons.Play size={20} className="text-white" />
                      </button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3
                          className="font-medium text-slate-900 dark:text-white truncate"
                          onClick={() => handleViewVideo(video)}
                        >
                          {video.title}
                        </h3>
                        <Badge variant={getStatusVariant(video.status)}>
                          {video.status.charAt(0).toUpperCase() +
                            video.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                        {video.creatorName}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Icons.Eye size={14} />
                          {formatNumber(video.views)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icons.Heart size={14} />
                          {formatNumber(video.likes)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icons.Clock size={14} />
                          {formatDuration(video.duration)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction("featured", video);
                      }}
                      className={cn(
                        "text-xs",
                        video.isFeatured
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-slate-500",
                      )}
                    >
                      <Icons.Star size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction("banner", video);
                      }}
                      className={cn(
                        "text-xs",
                        video.isBanner
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-slate-500",
                      )}
                    >
                      <Icons.Image size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction("publish", video);
                      }}
                      className="text-xs text-slate-500"
                    >
                      <Icons.Send size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction("suspend", video);
                      }}
                      className="text-xs text-slate-500"
                    >
                      <Icons.Ban size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction("delete", video);
                      }}
                      className="text-xs text-red-500 hover:text-red-600 ml-auto"
                    >
                      <Icons.Trash2 size={14} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Table for Desktop */}
      <div className="hidden lg:block bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Video
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Creator
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Metrics
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {paginatedVideos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <Icons.Video
                      size={48}
                      className="mx-auto text-slate-300 dark:text-slate-600 mb-4"
                    />
                    <p className="text-slate-500 dark:text-slate-400">
                      No videos found
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedVideos.map((video) => (
                  <tr
                    key={video.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative group flex-shrink-0">
                          {video.thumbnail ? (
                            <img
                              src={video.thumbnail}
                              alt={video.title}
                              className="w-24 h-16 object-cover rounded-lg cursor-pointer"
                              onClick={() => handleViewVideo(video)}
                            />
                          ) : (
                            <div className="w-24 h-16 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center cursor-pointer">
                              <Icons.Video
                                size={24}
                                className="text-slate-400"
                              />
                            </div>
                          )}
                          <button
                            onClick={() => handleViewVideo(video)}
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center"
                          >
                            <Icons.Play
                              size={24}
                              className="text-white md:hidden"
                            />
                            <Icons.Play
                              size={32}
                              className="text-white hidden md:block"
                            />
                          </button>
                        </div>
                        <div className="min-w-0">
                          <p
                            className="text-sm font-medium text-slate-900 dark:text-white truncate cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400"
                            onClick={() => handleViewVideo(video)}
                          >
                            {video.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {video.categoryName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-900 dark:text-white">
                        {video.creatorName}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusVariant(video.status)}>
                          {video.status.charAt(0).toUpperCase() +
                            video.status.slice(1)}
                        </Badge>
                        <span
                          className={cn(
                            "w-2 h-2 rounded-full",
                            video.isFeatured
                              ? "bg-amber-500"
                              : video.isBanner
                                ? "bg-blue-500"
                                : "bg-slate-300 dark:bg-slate-600",
                          )}
                          title={
                            video.isFeatured
                              ? "Featured"
                              : video.isBanner
                                ? "Banner"
                                : "Standard"
                          }
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span
                          className="flex items-center gap-1 cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400"
                          title="Views"
                        >
                          <Icons.Eye size={14} />
                          {formatNumber(video.views)}
                        </span>
                        <span
                          className="flex items-center gap-1 cursor-pointer hover:text-red-600 dark:hover:text-red-400"
                          title="Likes"
                        >
                          <Icons.Heart size={14} />
                          {formatNumber(video.likes)}
                        </span>
                        <span
                          className="flex items-center gap-1 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                          title="Comments"
                        >
                          <Icons.MessageCircle size={14} />
                          {formatNumber(video.comments)}
                        </span>
                        <span
                          className="flex items-center gap-1 cursor-pointer hover:text-amber-600 dark:hover:text-amber-400"
                          title="Duration"
                        >
                          <Icons.Clock size={14} />
                          {formatDuration(video.duration)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {formatDate(video.createdAt)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAction("featured", video)}
                          className={cn(
                            "p-2",
                            video.isFeatured
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300",
                          )}
                          title={video.isFeatured ? "Remove from Featured" : "Add to Featured"}
                        >
                          <Icons.Star size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAction("banner", video)}
                          className={cn(
                            "p-2",
                            video.isBanner
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300",
                          )}
                          title={video.isBanner ? "Remove from Banner" : "Add to Banner"}
                        >
                          <Icons.Image size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAction("publish", video)}
                          className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                          title={video.status === "published" ? "Unpublish" : "Publish"}
                        >
                          <Icons.Send size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAction("suspend", video)}
                          className={cn(
                            "p-2",
                            video.status === "suspended"
                              ? "text-orange-600 dark:text-orange-400"
                              : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300",
                          )}
                          title={video.status === "suspended" ? "Unsuspend" : "Suspend"}
                        >
                          <Icons.Ban size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAction("delete", video)}
                          className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                          title="Delete"
                        >
                          <Icons.Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Confirm Modals */}
      <ConfirmModal
        isOpen={showFeaturedModal}
        onClose={() => {
          setShowFeaturedModal(false);
          setSelectedVideo(null);
        }}
        onConfirm={handleConfirmFeatured}
        title={featuredAction === "add" ? "Add to Featured" : "Remove from Featured"}
        message={
          selectedVideo
            ? featuredAction === "add"
              ? `Are you sure you want to add "${selectedVideo.title}" to featured? This will highlight the video on the platform.`
              : `Are you sure you want to remove "${selectedVideo.title}" from featured?`
            : ""
        }
        confirmText={featuredAction === "add" ? "Add Featured" : "Remove"}
      />

      <ConfirmModal
        isOpen={showBannerModal}
        onClose={() => {
          setShowBannerModal(false);
          setSelectedVideo(null);
        }}
        onConfirm={handleConfirmBanner}
        title={bannerAction === "add" ? "Add to Banner" : "Remove from Banner"}
        message={
          selectedVideo
            ? bannerAction === "add"
              ? `Are you sure you want to add "${selectedVideo.title}" to banner? This will display the video on the homepage banner.`
              : `Are you sure you want to remove "${selectedVideo.title}" from banner?`
            : ""
        }
        confirmText={bannerAction === "add" ? "Add Banner" : "Remove"}
      />

      <ConfirmModal
        isOpen={showPublishModal}
        onClose={() => {
          setShowPublishModal(false);
          setSelectedVideo(null);
        }}
        onConfirm={handleConfirmPublish}
        title={publishAction === "publish" ? "Publish Video" : "Unpublish Video"}
        message={
          selectedVideo
            ? publishAction === "publish"
              ? `Are you sure you want to publish "${selectedVideo.title}"? This will make the video visible to users.`
              : `Are you sure you want to unpublish "${selectedVideo.title}"? This will hide the video from users.`
            : ""
        }
        confirmText={publishAction === "publish" ? "Publish" : "Unpublish"}
        variant="info"
      />

      <ConfirmModal
        isOpen={showSuspendModal}
        onClose={() => {
          setShowSuspendModal(false);
          setSelectedVideo(null);
        }}
        onConfirm={handleConfirmSuspend}
        title={suspendAction === "suspend" ? "Suspend Video" : "Unsuspend Video"}
        message={
          selectedVideo
            ? suspendAction === "suspend"
              ? `Are you sure you want to suspend "${selectedVideo.title}"? This will make the video unavailable to users.`
              : `Are you sure you want to unsuspend "${selectedVideo.title}"? This will make the video visible to users again.`
            : ""
        }
        confirmText={suspendAction === "suspend" ? "Suspend" : "Unsuspend"}
        variant="warning"
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedVideo(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Video"
        message={
          selectedVideo
            ? `Are you sure you want to delete "${selectedVideo.title}"? This action cannot be undone and the video will be permanently removed.`
            : ""
        }
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
