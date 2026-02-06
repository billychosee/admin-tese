"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { VideoPlayer } from "@/components/ui/VideoPlayer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { VideoComments } from "@/components/Tables/VideoComments";
import { Skeleton } from "@/components/ui/Skeleton";
import { Icons } from "@/components/ui/Icons";
import { useToast } from "@/components/ui/Toast";
import { useTheme } from "@/components/providers/ThemeProvider";
import { api } from "@/services/api";
import { cn, formatNumber, formatDuration, formatDate } from "@/utils";
import type { Video } from "@/types";

export default function VideoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const videoId = params.id as string;
  const [video, setVideo] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewsTimePeriod, setViewsTimePeriod] = useState<"daily" | "weekly" | "monthly" | "yearly">("weekly");
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspendAction, setSuspendAction] = useState<"suspend" | "unsuspend">("suspend");
  const [showFeaturedModal, setShowFeaturedModal] = useState(false);
  const [featuredAction, setFeaturedAction] = useState<"add" | "remove">("add");
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [bannerAction, setBannerAction] = useState<"add" | "remove">("add");
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishAction, setPublishAction] = useState<"publish" | "unpublish">("publish");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (videoId) {
      fetchVideo();
    }
  }, [videoId]);

  const fetchVideo = async () => {
    setIsLoading(true);
    try {
      const data = await api.videos.getById(videoId);
      setVideo(data);
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to fetch video",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFeatured = async () => {
    if (!video) return;
    try {
      if (featuredAction === "remove") {
        await api.videos.removeFromFeatured(video.id);
        addToast({ type: "success", title: "Removed from featured" });
      } else {
        await api.videos.promoteToFeatured(video.id);
        addToast({ type: "success", title: "Added to featured" });
      }
      setShowFeaturedModal(false);
      fetchVideo();
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to update featured status",
      });
    }
  };

  const handleToggleBanner = async () => {
    if (!video) return;
    try {
      if (bannerAction === "remove") {
        await api.videos.removeFromBanner(video.id);
        addToast({ type: "success", title: "Removed from banner" });
      } else {
        await api.videos.promoteToBanner(video.id);
        addToast({ type: "success", title: "Added to banner" });
      }
      setShowBannerModal(false);
      fetchVideo();
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to update banner status",
      });
    }
  };

  const handleConfirmPublish = async () => {
    if (!video) return;
    try {
      if (publishAction === "unpublish") {
        await api.videos.updateStatus(video.id, "pending");
        addToast({ type: "success", title: "Video unpublished" });
      } else {
        await api.videos.updateStatus(video.id, "published");
        addToast({ type: "success", title: "Video published" });
      }
      setShowPublishModal(false);
      fetchVideo();
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to update publish status",
      });
    }
  };

  const handleToggleSuspend = async () => {
    if (!video) return;
    try {
      if (suspendAction === "unsuspend") {
        await api.videos.updateStatus(video.id, "published");
        addToast({ type: "success", title: "Video unsuspended" });
      } else {
        await api.videos.updateStatus(video.id, "suspended");
        addToast({ type: "success", title: "Video suspended" });
      }
      setShowSuspendModal(false);
      fetchVideo();
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to update suspension status",
      });
    }
  };

  const handleDelete = async () => {
    if (!video) return;
    try {
      await api.videos.delete(video.id);
      addToast({
        type: "success",
        title: "Success",
        message: "Video deleted successfully",
      });
      setShowDeleteModal(false);
      router.push("/videos");
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to delete video",
      });
    }
  };

  if (isLoading) {
    return (
      <div
        className={cn(
          "space-y-6 min-h-screen font-sans",
          isDark ? "bg-[#020617]" : "bg-[#F1F5F9]",
        )}
      >
        <div className="container mx-auto px-6 py-8">
          <Skeleton className="h-6 w-48 mb-4" />
          <Skeleton className="h-96 w-full rounded-2xl" />
          <div className="grid grid-cols-6 gap-4 mt-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div
        className={cn(
          "space-y-6 min-h-screen font-sans",
          isDark ? "bg-[#020617]" : "bg-[#F1F5F9]",
        )}
      >
        <div className="container mx-auto px-6 py-8 text-center">
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
            Video not found
          </p>
          <Button
            variant="primary"
            className="mt-4"
            onClick={() => router.push("/videos")}
          >
            <Icons.ArrowLeft size={16} className="mr-2" />
            Back to Videos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "space-y-6 min-h-screen font-sans transition-colors duration-300",
        isDark ? "bg-[#020617]" : "bg-white",
      )}
    >
      {/* Breadcrumbs */}
      <div
        className={cn(
          "border-b px-6 py-4",
          isDark ? "border-slate-800" : "border-slate-200",
        )}
      >
        <div className="container mx-auto flex items-center gap-2 text-sm">
          <button
            onClick={() => router.push("/videos")}
            className={cn(
              "hover:underline flex items-center gap-1",
              isDark ? "text-slate-400" : "text-slate-500",
            )}
          >
            <Icons.Video size={14} />
            Videos
          </button>
          <Icons.ChevronRight size={14} className="text-slate-400" />
          <span
            className={cn(
              "font-medium truncate",
              isDark ? "text-white" : "text-slate-900",
            )}
          >
            {video.title}
          </span>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Video Player (Hero) */}
        <VideoPlayer
          src={video.videoUrl || ""}
          poster={video.thumbnail}
          title={video.title}
        />

        {/* Description */}
        {video.description && (
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white mb-2">Description</p>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{video.description}</p>
          </div>
        )}

        {/* Title + Status Badges */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
            {video.title}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={video.isFeatured ? "warning" : "neutral"}
            >
              {video.isFeatured ? "⭐ Featured" : "Not Featured"}
            </Badge>
            <Badge variant={video.isBanner ? "info" : "neutral"}>
              {video.isBanner ? "🖼️ Banner" : "Not Banner"}
            </Badge>
            <Badge
              variant={
                video.status === "published"
                  ? "success"
                  : video.status === "pending"
                    ? "warning"
                    : video.status === "suspended"
                      ? "danger"
                      : "neutral"
              }
            >
              {video.status.charAt(0).toUpperCase() + video.status.slice(1)}
            </Badge>
            {video.isPaid && (
              <Badge variant="info">
                💰 {video.currency || "USD"} {video.price?.toFixed(2)}
              </Badge>
            )}
          </div>
        </div>

        {/* MEDIA ASSETS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Thumbnail Card */}
          <div className="border rounded-xl p-3 bg-slate-50 dark:bg-slate-800/50">
            <p className="text-xs font-medium mb-2">Thumbnail</p>
            <img
              src={video.thumbnail}
              alt="Video thumbnail"
              className="rounded-lg w-full aspect-video object-cover border"
            />
          </div>

          {/* Trailer Card */}
          <div className="border rounded-xl p-3 bg-slate-50 dark:bg-slate-800/50">
            <p className="text-xs font-medium mb-2">Trailer</p>
            {video.videoTrailer ? (
              <div className="relative aspect-video rounded-lg border bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                <Icons.Play className="text-emerald-500" size={40} />
                <span className="absolute bottom-2 text-xs bg-black/60 text-white px-2 py-1 rounded">
                  Trailer Uploaded
                </span>
              </div>
            ) : (
              <div className="aspect-video rounded-lg border flex items-center justify-center text-xs text-slate-400">
                No trailer
              </div>
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
              <p className="text-sm font-bold text-slate-900 dark:text-white">{formatNumber(video.views)}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-center">
              <Icons.Heart size={16} className="mx-auto mb-1 text-red-500" />
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Likes</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{formatNumber(video.likes)}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-center">
              <Icons.MessageCircle size={16} className="mx-auto mb-1 text-green-500" />
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Comments</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{formatNumber(video.comments)}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-center">
              <Icons.Clock size={16} className="mx-auto mb-1 text-amber-500" />
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Watch Time</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{formatDuration(video.watchTime || 0)}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-center">
              <Icons.DollarSign size={16} className="mx-auto mb-1 text-emerald-500" />
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Sales</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">${formatNumber(video.salesAmount || 0)}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-center">
              <Icons.TrendingUp size={16} className="mx-auto mb-1 text-purple-500" />
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Engagement</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{video.engagementRate || 0}%</p>
            </div>
          </div>
        </div>

        {/* Views Over Time */}
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <Icons.TrendingUp size={16} />
            Views Over Time
          </h4>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
            <div className="flex gap-2 mb-4">
              {(["daily", "weekly", "monthly", "yearly"] as const).map((period) => (
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
              ))}
            </div>
            <div className="space-y-2">
              {video.viewsByPeriod && video.viewsByPeriod[viewsTimePeriod]?.length > 0 ? (
                <div className="space-y-2">
                  {video.viewsByPeriod[viewsTimePeriod].map((item, index) => {
                    const maxViews = Math.max(...video.viewsByPeriod![viewsTimePeriod].map((d) => d.views));
                    const percentage = maxViews > 0 ? (("views" in item ? item.views : 0) / maxViews) * 100 : 0;
                    return (
                      <div key={index} className="flex items-center gap-3">
                        <span className="text-xs text-slate-500 dark:text-slate-400 w-20">
                          {"date" in item ? item.date : "week" in item ? item.week : "month" in item ? item.month : "year" in item ? item.year : ""}
                        </span>
                        <div className="flex-1 h-6 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${percentage}%` }} />
                        </div>
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 w-16 text-right">
                          {formatNumber("views" in item ? item.views : 0)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No views data available for this period</p>
              )}
            </div>
          </div>
        </div>

        {/* Video Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Creator</p>
            <p className="text-sm font-medium text-slate-900 dark:text-white">{video.creatorName}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Category</p>
            <p className="text-sm font-medium text-slate-900 dark:text-white">{video.categoryName}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Duration</p>
            <p className="text-sm font-medium text-slate-900 dark:text-white">{formatDuration(video.duration)}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Price</p>
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              {video.isPaid && video.price ? `${video.currency || "USD"} ${video.price.toFixed(2)}` : "Free"}
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Uploaded</p>
            <p className="text-sm font-medium text-slate-900 dark:text-white">{formatDate(video.createdAt)}</p>
          </div>
        </div>

        {/* Video Comments */}
        <VideoComments videoId={video.id} videoTitle={video.title} />

        {/* Prominent Action Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
          <Button
            variant="danger"
            size="lg"
            onClick={() => setShowDeleteModal(true)}
          >
            <Icons.Trash2 size={18} className="mr-2" />
            Delete
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => {
              setSuspendAction(video.status === "suspended" ? "unsuspend" : "suspend");
              setShowSuspendModal(true);
            }}
            className={cn(
              video.status === "suspended"
                ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800"
                : "",
            )}
          >
            <Icons.Ban size={18} className="mr-2" />
            {video.status === "suspended" ? "Unsuspend" : "Suspend"}
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => {
              setPublishAction(video.status === "published" ? "unpublish" : "publish");
              setShowPublishModal(true);
            }}
          >
            <Icons.Send size={18} className="mr-2" />
            {video.status === "published" ? "Unpublish" : "Publish"}
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => {
              setBannerAction(video.isBanner ? "remove" : "add");
              setShowBannerModal(true);
            }}
            className={cn(
              video.isBanner
                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                : "",
            )}
          >
            <Icons.Image size={18} className="mr-2" />
            {video.isBanner ? "Banner" : "Add to Banner"}
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={() => {
              setFeaturedAction(video.isFeatured ? "remove" : "add");
              setShowFeaturedModal(true);
            }}
            className={cn(
              video.isFeatured
                ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                : "",
            )}
          >
            <Icons.Star size={18} className="mr-2" />
            {video.isFeatured ? "Featured" : "Feature"}
          </Button>
        </div>
      </div>

      {/* Confirm Modals */}
      <ConfirmModal
        isOpen={showFeaturedModal}
        onClose={() => setShowFeaturedModal(false)}
        onConfirm={handleToggleFeatured}
        title={featuredAction === "add" ? "Add to Featured" : "Remove from Featured"}
        message={
          featuredAction === "add"
            ? `Are you sure you want to add "${video?.title}" to featured? This will highlight the video on the platform.`
            : `Are you sure you want to remove "${video?.title}" from featured?`
        }
        confirmText={featuredAction === "add" ? "Add to Featured" : "Remove"}
        variant="info"
      />

      <ConfirmModal
        isOpen={showBannerModal}
        onClose={() => setShowBannerModal(false)}
        onConfirm={handleToggleBanner}
        title={bannerAction === "add" ? "Add to Banner" : "Remove from Banner"}
        message={
          bannerAction === "add"
            ? `Are you sure you want to add "${video?.title}" to banner? This will display the video on the homepage banner.`
            : `Are you sure you want to remove "${video?.title}" from banner?`
        }
        confirmText={bannerAction === "add" ? "Add to Banner" : "Remove"}
        variant="info"
      />

      <ConfirmModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        onConfirm={handleConfirmPublish}
        title={publishAction === "publish" ? "Publish Video" : "Unpublish Video"}
        message={
          publishAction === "publish"
            ? `Are you sure you want to publish "${video?.title}"? This will make the video visible to users.`
            : `Are you sure you want to unpublish "${video?.title}"? This will hide the video from users.`
        }
        confirmText={publishAction === "publish" ? "Publish" : "Unpublish"}
        variant="info"
      />

      <ConfirmModal
        isOpen={showSuspendModal}
        onClose={() => setShowSuspendModal(false)}
        onConfirm={handleToggleSuspend}
        title={suspendAction === "suspend" ? "Suspend Video" : "Unsuspend Video"}
        message={
          suspendAction === "suspend"
            ? `Are you sure you want to suspend "${video?.title}"? This will make the video unavailable to users.`
            : `Are you sure you want to unsuspend "${video?.title}"? This will make the video visible to users again.`
        }
        confirmText={suspendAction === "suspend" ? "Suspend" : "Unsuspend"}
        variant="warning"
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Video"
        message={`Are you sure you want to delete "${video?.title}"? This action cannot be undone and the video will be permanently removed.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
