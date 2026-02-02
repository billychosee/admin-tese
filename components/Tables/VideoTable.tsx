"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
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
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 h-10"
            >
              {VIDEO_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 h-10"
            >
              {VIDEO_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
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
                          <div className="max-w-xs">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                              {video.title}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {formatDate(video.createdAt)}
                            </p>
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
  );
}
