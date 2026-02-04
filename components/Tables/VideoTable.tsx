"use client";

import { useState, useMemo } from "react";
import { VideoPlayer } from "@/components/ui/VideoPlayer";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { VideoComments } from "./VideoComments";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [previewVideo, setPreviewVideo] = useState<Video | null>(null);
  const [viewsTimePeriod, setViewsTimePeriod] = useState<
    "daily" | "weekly" | "monthly" | "yearly"
  >("weekly");
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

  const totalPages = Math.ceil(filteredVideos.length / itemsPerPage);
  const paginatedVideos = filteredVideos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  function fetchVideos() {
    // Optional callback for refreshing video data
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div>
              <CardTitle>Videos</CardTitle>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Search videos..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-10"
                />
              </div>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="appearance-none w-full px-4 py-2 pr-10 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 h-10 cursor-pointer"
                >
                  {VIDEO_STATUSES.map((status) => (
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
              <div className="relative">
                <select
                  value={filter}
                  onChange={(e) => {
                    setFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="appearance-none w-full px-4 py-2 pr-10 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 h-10 cursor-pointer"
                >
                  {VIDEO_FILTERS.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
                <Icons.ChevronDown
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-slate-300 dark:border-slate-600">
                      <th className="text-left py-4 px-4 font-bold text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50">
                        Video
                      </th>
                      <th className="text-left py-4 px-4 font-bold text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50">
                        Creator
                      </th>
                      <th className="text-left py-4 px-4 font-bold text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50">
                        Category
                      </th>
                      <th className="text-left py-4 px-4 font-bold text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50">
                        Status
                      </th>
                      <th className="text-left py-4 px-4 font-bold text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50">
                        Views
                      </th>
                      <th className="text-left py-4 px-4 font-bold text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50">
                        Duration
                      </th>
                      <th className="text-left py-4 px-4 font-bold text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50">
                        Price
                      </th>
                      <th className="text-left py-4 px-4 font-bold text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedVideos.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="text-center py-8 text-slate-500 dark:text-slate-400"
                        >
                          No videos found
                        </td>
                      </tr>
                    ) : (
                      paginatedVideos.map((video) => (
                        <tr
                          key={video.id}
                          className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="relative group flex-shrink-0">
                                {video.thumbnail ? (
                                  <img
                                    src={video.thumbnail}
                                    alt={video.title}
                                    className="w-20 h-20 object-cover rounded-lg cursor-pointer"
                                    onClick={() => {
                                      setPreviewVideo(video);
                                      onView?.(video);
                                    }}
                                  />
                                ) : (
                                  <div
                                    className="w-20 h-20 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center cursor-pointer flex-shrink-0"
                                    onClick={() => {
                                      setPreviewVideo(video);
                                      onView?.(video);
                                    }}
                                  >
                                    <Icons.Video
                                      size={24}
                                      className="text-slate-400"
                                    />
                                  </div>
                                )}
                                <button
                                  onClick={() => {
                                    setPreviewVideo(video);
                                    onView?.(video);
                                  }}
                                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center"
                                >
                                  <Icons.Play
                                    size={24}
                                    className="text-white"
                                  />
                                </button>
                                <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                                  {formatDuration(video.duration)}
                                </span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-slate-900 dark:text-white break-words">
                                  {video.title}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 break-words">
                                  {formatDate(video.createdAt)}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm text-slate-600 dark:text-slate-300">
                            {video.creatorName}
                          </td>
                          <td className="py-4 px-4 text-sm text-slate-600 dark:text-slate-300">
                            {video.categoryName}
                          </td>
                          <td className="py-4 px-4">
                            <Badge
                              variant={
                                getStatusVariant(video.status) as
                                  | "success"
                                  | "warning"
                                  | "danger"
                                  | "info"
                                  | "neutral"
                              }
                              className="capitalize"
                            >
                              {video.status}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                            {formatNumber(video.views)}
                          </td>
                          <td className="py-4 px-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                            {formatDuration(video.duration)}
                          </td>
                          <td className="py-4 px-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                            {video.isPaid && video.price
                              ? `${video.currency || "USD"} ${video.price.toFixed(2)}`
                              : "-"}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  setPreviewVideo(video);
                                  onView?.(video);
                                }}
                                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition"
                                title="View video"
                              >
                                <Icons.Eye size={16} />
                              </button>
                              <button
                                onClick={() => onDelete?.(video)}
                                className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400 transition"
                                title="Delete"
                              >
                                <Icons.Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Showing{" "}
                    {Math.min(
                      (currentPage - 1) * itemsPerPage + 1,
                      filteredVideos.length,
                    )}{" "}
                    to{" "}
                    {Math.min(
                      currentPage * itemsPerPage,
                      filteredVideos.length,
                    )}{" "}
                    of {filteredVideos.length} results
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <Icons.ChevronLeft size={16} />
                    </Button>
                    <Button variant="primary" size="sm" disabled>
                      {currentPage} / {totalPages}
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      <Icons.ChevronRight size={16} />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Video Preview Modal */}
      <Modal
        isOpen={!!previewVideo}
        onClose={() => setPreviewVideo(null)}
        title="Video Preview & Metrics"
        size="xl"
      >
        {previewVideo && (
          <div className="space-y-6 max-h-[85vh] overflow-y-auto">
            {/* Video Player */}
            <VideoPlayer
              src={previewVideo.videoUrl || ""}
              poster={previewVideo.thumbnail}
              title={previewVideo.title}
            />

            {/* Video Info */}
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {previewVideo.title}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge
                    variant={previewVideo.isFeatured ? "warning" : "neutral"}
                  >
                    {previewVideo.isFeatured ? "⭐ Featured" : "Not Featured"}
                  </Badge>
                  <Badge variant={previewVideo.isBanner ? "info" : "neutral"}>
                    {previewVideo.isBanner ? "🖼️ Banner" : "Not Banner"}
                  </Badge>
                  <Badge
                    variant={
                      previewVideo.status === "published"
                        ? "success"
                        : previewVideo.status === "pending"
                          ? "warning"
                          : previewVideo.status === "suspended"
                            ? "danger"
                            : "neutral"
                    }
                  >
                    {previewVideo.status.charAt(0).toUpperCase() +
                      previewVideo.status.slice(1)}
                  </Badge>
                  {previewVideo.isPaid && (
                    <Badge variant="info">
                      💰 {previewVideo.currency || "USD"}{" "}
                      {previewVideo.price?.toFixed(2)}
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
                    <Icons.Eye
                      size={16}
                      className="mx-auto mb-1 text-blue-500"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Views
                    </p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {formatNumber(previewVideo.views)}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-center">
                    <Icons.Heart
                      size={16}
                      className="mx-auto mb-1 text-red-500"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Likes
                    </p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {formatNumber(previewVideo.likes)}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-center">
                    <Icons.MessageCircle
                      size={16}
                      className="mx-auto mb-1 text-green-500"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Comments
                    </p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {formatNumber(previewVideo.comments)}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-center">
                    <Icons.Clock
                      size={16}
                      className="mx-auto mb-1 text-amber-500"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Watch Time
                    </p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {formatDuration(previewVideo.watchTime || 0)}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-center">
                    <Icons.DollarSign
                      size={16}
                      className="mx-auto mb-1 text-emerald-500"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Sales
                    </p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      ${formatNumber(previewVideo.salesAmount || 0)}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-center">
                    <Icons.TrendingUp
                      size={16}
                      className="mx-auto mb-1 text-purple-500"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Engagement
                    </p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {previewVideo.engagementRate || 0}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Views by Time Period */}
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Icons.TrendingUp size={16} />
                  Views Over Time
                </h4>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                  {/* Time Period Selector */}
                  <div className="flex gap-2 mb-4">
                    {(["daily", "weekly", "monthly", "yearly"] as const).map(
                      (period) => (
                        <button
                          key={period}
                          onClick={() => setViewsTimePeriod(period)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                            viewsTimePeriod === period
                              ? "bg-emerald-500 text-white"
                              : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                          }`}
                        >
                          {period.charAt(0).toUpperCase() + period.slice(1)}
                        </button>
                      ),
                    )}
                  </div>
                  {/* Views Chart */}
                  <div className="space-y-2">
                    {previewVideo.viewsByPeriod &&
                    previewVideo.viewsByPeriod[viewsTimePeriod]?.length > 0 ? (
                      <div className="space-y-2">
                        {previewVideo.viewsByPeriod[viewsTimePeriod].map(
                          (item, index) => {
                            const maxViews = Math.max(
                              ...previewVideo.viewsByPeriod![
                                viewsTimePeriod
                              ].map((d) => d.views),
                            );
                            const percentage =
                              maxViews > 0
                                ? (("views" in item ? item.views : 0) /
                                    maxViews) *
                                  100
                                : 0;
                            return (
                              <div
                                key={index}
                                className="flex items-center gap-3"
                              >
                                <span className="text-xs text-slate-500 dark:text-slate-400 w-20">
                                  {"date" in item
                                    ? item.date
                                    : "week" in item
                                      ? item.week
                                      : "month" in item
                                        ? item.month
                                        : "year" in item
                                          ? item.year
                                          : ""}
                                </span>
                                <div className="flex-1 h-6 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 w-16 text-right">
                                  {formatNumber(
                                    "views" in item ? item.views : 0,
                                  )}
                                </span>
                              </div>
                            );
                          },
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                        No views data available for this period
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Video Details */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                    Creator
                  </p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {previewVideo.creatorName}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                    Category
                  </p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {previewVideo.categoryName}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                    Duration
                  </p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {formatDuration(previewVideo.duration)}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                    Price
                  </p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {previewVideo.isPaid && previewVideo.price
                      ? `${previewVideo.currency || "USD"} ${previewVideo.price.toFixed(2)}`
                      : "Free"}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                    Uploaded
                  </p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {formatDate(previewVideo.createdAt)}
                  </p>
                </div>
              </div>

              {/* Comments Section */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <VideoComments
                  videoId={previewVideo.id}
                  videoTitle={previewVideo.title}
                  onCommentUpdate={() => {
                    // Refresh video data to update comment count
                    fetchVideos();
                  }}
                />
              </div>

              {previewVideo.description && (
                <div className="pt-2">
                  <p className="text-sm font-medium text-slate-900 dark:text-white mb-2">
                    Description
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {previewVideo.description}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setFeaturedAction(previewVideo.isFeatured ? "remove" : "add");
                  setShowFeaturedModal(true);
                }}
                className={cn(
                  previewVideo.isFeatured
                    ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                    : "",
                )}
              >
                <Icons.Star size={16} className="mr-1" />
                {previewVideo.isFeatured ? "Featured" : "Feature"}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setBannerAction(previewVideo.isBanner ? "remove" : "add");
                  setShowBannerModal(true);
                }}
                className={cn(
                  previewVideo.isBanner
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                    : "",
                )}
              >
                <Icons.Image size={16} className="mr-1" />
                {previewVideo.isBanner ? "Banner" : "Add to Banner"}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setPublishAction(
                    previewVideo.status === "published"
                      ? "unpublish"
                      : "publish",
                  );
                  setShowPublishModal(true);
                }}
              >
                <Icons.Send size={16} className="mr-1" />
                {previewVideo.status === "published" ? "Unpublish" : "Publish"}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSuspendAction(
                    previewVideo.status === "suspended"
                      ? "unsuspend"
                      : "suspend",
                  );
                  setShowSuspendModal(true);
                }}
                className={cn(
                  previewVideo.status === "suspended"
                    ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800"
                    : "",
                )}
              >
                <Icons.Ban size={16} className="mr-1" />
                {previewVideo.status === "suspended" ? "Unsuspend" : "Suspend"}
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowDeleteModal(true)}
              >
                <Icons.Trash2 size={16} className="mr-1" />
                Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmModal
        isOpen={showFeaturedModal}
        onClose={() => setShowFeaturedModal(false)}
        onConfirm={() => {
          onToggleFeatured?.(previewVideo!);
          setShowFeaturedModal(false);
        }}
        title={
          featuredAction === "add" ? "Add to Featured" : "Remove from Featured"
        }
        message={
          featuredAction === "add"
            ? `Are you sure you want to add "${previewVideo?.title}" to featured? This will highlight the video on the platform.`
            : `Are you sure you want to remove "${previewVideo?.title}" from featured?`
        }
        confirmText={featuredAction === "add" ? "Add to Featured" : "Remove"}
        variant="info"
      />

      <ConfirmModal
        isOpen={showBannerModal}
        onClose={() => setShowBannerModal(false)}
        onConfirm={() => {
          onToggleBanner?.(previewVideo!);
          setShowBannerModal(false);
        }}
        title={bannerAction === "add" ? "Add to Banner" : "Remove from Banner"}
        message={
          bannerAction === "add"
            ? `Are you sure you want to add "${previewVideo?.title}" to banner? This will display the video on the homepage banner.`
            : `Are you sure you want to remove "${previewVideo?.title}" from banner?`
        }
        confirmText={bannerAction === "add" ? "Add to Banner" : "Remove"}
        variant="info"
      />

      <ConfirmModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        onConfirm={() => {
          onUpdateStatus?.(
            previewVideo!,
            publishAction === "unpublish" ? "draft" : "published",
          );
          setShowPublishModal(false);
        }}
        title={
          publishAction === "publish" ? "Publish Video" : "Unpublish Video"
        }
        message={
          publishAction === "publish"
            ? `Are you sure you want to publish "${previewVideo?.title}"? This will make the video visible to users.`
            : `Are you sure you want to unpublish "${previewVideo?.title}"? This will hide the video from users.`
        }
        confirmText={publishAction === "publish" ? "Publish" : "Unpublish"}
        variant={publishAction === "publish" ? "info" : "warning"}
      />

      <ConfirmModal
        isOpen={showSuspendModal}
        onClose={() => setShowSuspendModal(false)}
        onConfirm={() => {
          onToggleSuspend?.(previewVideo!);
          setShowSuspendModal(false);
        }}
        title={
          suspendAction === "suspend" ? "Suspend Video" : "Unsuspend Video"
        }
        message={
          suspendAction === "suspend"
            ? `Are you sure you want to suspend "${previewVideo?.title}"? This will make the video unavailable to users.`
            : `Are you sure you want to unsuspend "${previewVideo?.title}"? This will make the video visible to users again.`
        }
        confirmText={suspendAction === "suspend" ? "Suspend" : "Unsuspend"}
        variant={suspendAction === "suspend" ? "warning" : "info"}
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          if (onDelete) {
            onDelete(previewVideo!);
          }
          setShowDeleteModal(false);
          setPreviewVideo(null);
        }}
        title="Delete Video"
        message={`Are you sure you want to delete "${previewVideo?.title}"? This action cannot be undone and the video will be permanently removed.`}
        confirmText="Delete"
        variant="danger"
      />
    </>
  );
}
