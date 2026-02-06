"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { SkeletonList } from "@/components/ui/Skeleton";
import { VideoTable } from "@/components/Tables/VideoTable";
import { Icons } from "@/components/ui/Icons";
import { useToast } from "@/components/ui/Toast";
import { useTheme } from "@/components/providers/ThemeProvider";
import { api } from "@/services/api";
import { cn, formatNumber, formatDateTime } from "@/utils";
import type { Category, Video } from "@/types";

type ViewMode = "grid" | "list";

export default function CategoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [category, setCategory] = useState<Category | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");

  const categoryId = params?.id as string;

  useEffect(() => {
    if (categoryId) {
      fetchCategoryAndVideos();
    }
  }, [categoryId]);

  const fetchCategoryAndVideos = async () => {
    setIsLoading(true);
    try {
      const [categoriesResult, videosResult] = await Promise.all([
        api.categories.getAll(),
        api.videos.getAll(1, 1000), // Fetch all videos with large page size
      ]);

      const foundCategory = categoriesResult.find((c) => c.id === categoryId);
      if (foundCategory) {
        setCategory(foundCategory);
        // Filter videos by category
        const categoryVideos = videosResult.data.filter(
          (video: Video) => video.categoryId === categoryId || video.categoryId === foundCategory.name
        );
        setVideos(categoryVideos);
      } else {
        addToast({
          type: "error",
          title: "Error",
          message: "Category not found",
        });
        router.push("/categories");
      }
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to fetch category data",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredVideos = videos.filter((video) =>
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  if (isLoading) {
    return (
      <div className="p-8">
        <SkeletonList count={7} />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex flex-col items-center justify-center p-20">
        <Icons.FolderOpen className="w-16 h-16 mb-4 text-slate-400" />
        <p className="text-slate-500">Category not found</p>
        <Button onClick={() => router.push("/categories")} className="mt-4">
          Back to Categories
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 min-h-screen px-4 md:px-0">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/categories")}
            className="rounded-lg -ml-2"
          >
            <Icons.ArrowLeft size={18} className="mr-1 md:mr-2" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <div>
            <h1 className="text-xl md:text-3xl font-black uppercase tracking-tighter text-[hsl(var(--text-primary))] truncate max-w-[200px] sm:max-w-none">
              {category.name}
            </h1>
            <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest mt-0.5 md:mt-1 text-[hsl(var(--text-muted))]">
              {category.videoCount} Videos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative group flex-1 sm:flex-none">
            <Icons.Search
              className="absolute left-3 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: "hsl(var(--text-muted))" }}
              size={16}
            />
            <Input
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-48 md:w-64 pl-10 rounded-xl font-bold text-xs h-9"
            />
          </div>

          {/* View Toggle */}
          <div
            className="flex p-1 rounded-xl border"
            style={{
              backgroundColor: "hsl(var(--surface))",
              borderColor: "hsl(var(--surface-border))",
            }}
          >
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-2 rounded-lg transition-all",
                viewMode === "grid" ? "text-white shadow-lg" : ""
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
                viewMode === "list" ? "text-white shadow-lg" : ""
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

      {/* Category Banner */}
      {category.bannerUrl && (
        <div
          className="h-32 md:h-48 -mx-4 md:-mx-8 rounded-xl md:rounded-2xl overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${category.color}40 0%, ${category.color}10 100%)`,
          }}
        >
          <img
            src={category.bannerUrl}
            alt={category.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}

      {/* Videos Listing */}
      {filteredVideos.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center p-12 md:p-20 rounded-2xl md:rounded-[3rem] shadow-xl"
          style={{ backgroundColor: "hsl(var(--surface))" }}
        >
          <Icons.Video
            className="w-12 h-12 md:w-16 md:h-16 mb-3 md:mb-4"
            style={{ color: "hsl(var(--text-muted))" }}
          />
          <p
            className="font-black uppercase text-xs md:text-sm"
            style={{ color: "hsl(var(--text-muted))" }}
          >
            No Videos Found
          </p>
          {searchQuery && (
            <Button
              variant="ghost"
              onClick={() => setSearchQuery("")}
              className="mt-4"
            >
              Clear Search
            </Button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredVideos.map((video) => (
            <Card
              key={video.id}
              hover
              className={cn(
                "rounded-xl md:rounded-2xl border transition-all duration-300 overflow-hidden",
                colors.surfaceBorder,
                colors.surface
              )}
            >
              {/* Video Thumbnail */}
              <div className="relative aspect-video bg-slate-100 dark:bg-slate-800">
                {video.thumbnail ? (
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icons.Video
                      className="w-12 h-12 text-slate-400"
                      style={{ color: category.color }}
                    />
                  </div>
                )}
                <div className="absolute bottom-2 right-2">
                  <Badge className="bg-black/70 text-white text-xs font-bold">
                    {formatNumber(video.duration || 0)}s
                  </Badge>
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full bg-white/20 backdrop-blur-sm"
                  >
                    <Icons.Play size={24} className="text-white" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-3 md:p-4">
                <h3
                  className={cn(
                    "text-xs md:text-sm font-semibold line-clamp-2 mb-1.5 md:mb-2",
                    colors.textPrimary
                  )}
                >
                  {video.title}
                </h3>
                <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-slate-500 dark:text-slate-400 mb-2 md:mb-3">
                  <span>{formatNumber(video.views || 0)} views</span>
                  <span>•</span>
                  <span>{formatDateTime(video.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <Badge
                    className="rounded-lg text-[7px] md:text-[8px] uppercase truncate max-w-[80px] md:max-w-none"
                    style={{
                      backgroundColor: `${category.color}20`,
                      color: category.color,
                      border: `1px solid ${category.color}40`,
                    }}
                  >
                    {category.name}
                  </Badge>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 md:h-8 md:w-8 p-0"
                      onClick={() => router.push(`/videos/${video.id}`)}
                    >
                      <Icons.Eye className="w-3 h-3 md:w-[14px] md:h-[14px]" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* LIST VIEW */
        <VideoTable
          videos={filteredVideos}
          isLoading={isLoading}
          onView={(video) => router.push(`/videos/${video.id}`)}
        />
      )}
    </div>
  );
}
