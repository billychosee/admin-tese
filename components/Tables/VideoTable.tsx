"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import {
  cn,
  formatNumber,
  formatDuration,
  formatDate,
} from "@/utils";
import { Icons } from "@/components/ui/Icons";
import { VIDEO_STATUSES, VIDEO_FILTERS } from "@/constants";
import type { Video } from "@/types";

interface VideoTableProps {
  videos: Video[];
  isLoading?: boolean;
  onToggleFeatured: (video: Video) => void;
  onToggleBanner: (video: Video) => void;
  onToggleSuspend: (video: Video) => void;
  onUpdateStatus: (video: Video, status: Video["status"]) => void;
  onDelete: (video: Video) => void;
}

export function VideoTable({
  videos,
  isLoading,
  onToggleFeatured,
  onToggleBanner,
  onToggleSuspend,
  onUpdateStatus,
  onDelete,
}: VideoTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [previewVideo, setPreviewVideo] = useState<Video | null>(null);
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
                <Icons.ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
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
                <Icons.ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
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
                                    onClick={() => setPreviewVideo(video)}
                                  />
                                ) : (
                                  <div
                                    className="w-20 h-20 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center cursor-pointer flex-shrink-0"
                                    onClick={() => setPreviewVideo(video)}
                                  >
                                    <Icons.Video size={24} className="text-slate-400" />
                                  </div>
                                )}
                                <button
                                  onClick={() => setPreviewVideo(video)}
                                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center"
                                >
                                  <Icons.Play size={24} className="text-white" />
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
                                onClick={() => onToggleFeatured(video)}
                                className={cn(
                                  "p-2 rounded-lg transition",
                                  video.isFeatured
                                    ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                                    : "hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400",
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
                                onClick={() => onToggleBanner(video)}
                                className={cn(
                                  "p-2 rounded-lg transition",
                                  video.isBanner
                                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                    : "hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400",
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
                                  onUpdateStatus(
                                    video,
                                    video.status === "published"
                                      ? "draft"
                                      : "published",
                                  )
                                }
                                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition"
                                title="Toggle publish status"
                              >
                                <Icons.Send size={16} />
                              </button>
                              <button
                                onClick={() => onToggleSuspend(video)}
                                className={cn(
                                  "p-2 rounded-lg transition",
                                  video.status === "suspended"
                                    ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                                    : "hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400",
                                )}
                                title={
                                  video.status === "suspended"
                                    ? "Unsuspend video"
                                    : "Suspend video"
                                }
                              >
                                <Icons.Ban size={16} />
                              </button>
                              <button
                                onClick={() => onDelete(video)}
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
                    {Math.min(currentPage * itemsPerPage, filteredVideos.length)}{" "}
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
        title="Video Preview"
        size="lg"
      >
        {previewVideo && (
          <div className="space-y-6 max-h-[85vh] overflow-y-auto">
            {/* Thumbnail with Play Button */}
            <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden shadow-lg">
              {previewVideo.thumbnail ? (
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
            
            {/* Video Info */}
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {previewVideo.title}
                </h3>
                <div className="flex flex-wrap items-center gap-3">
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
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Creator</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{previewVideo.creatorName}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Category</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{previewVideo.categoryName}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Views</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{formatNumber(previewVideo.views)}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Uploaded</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{formatDate(previewVideo.createdAt)}</p>
                </div>
              </div>
              
              {previewVideo.description && (
                <div className="pt-2">
                  <p className="text-sm font-medium text-slate-900 dark:text-white mb-2">Description</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {previewVideo.description}
                  </p>
                </div>
              )}
            </div>
            
            {/* Actions */}
            <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button variant="secondary" onClick={() => setPreviewVideo(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
