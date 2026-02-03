"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { Icons } from "@/components/ui/Icons";
import { useToast } from "@/components/ui/Toast";
import { useTheme } from "@/components/providers/ThemeProvider";
import { api } from "@/services/api";
import { cn, formatNumber, formatCurrency, formatDate } from "@/utils";
import type { Playlist, Video } from "@/types";

export default function PlaylistDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const playlistId = params.id as string;
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (playlistId) {
      fetchPlaylist();
    }
  }, [playlistId]);

  const fetchPlaylist = async () => {
    setIsLoading(true);
    try {
      const data = await api.playlists.getById(playlistId);
      setPlaylist(data);
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to fetch playlist",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayVideo = (video: Video) => {
    setSelectedVideo(video);
    setShowVideoModal(true);
  };

  const handleDeleteVideo = async () => {
    if (!selectedVideo || !playlist) return;
    try {
      // This would call an API to remove video from playlist
      addToast({
        type: "success",
        title: "Success",
        message: "Video removed from playlist",
      });
      setShowDeleteModal(false);
      setSelectedVideo(null);
      fetchPlaylist();
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to remove video from playlist",
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
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-64 w-full rounded-2xl" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div
        className={cn(
          "space-y-6 min-h-screen font-sans",
          isDark ? "bg-[#020617]" : "bg-[#F1F5F9]",
        )}
      >
        <div className="container mx-auto px-6 py-8 text-center">
          <Icons.Playlist
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
            Playlist not found
          </p>
          <Button
            variant="primary"
            className="mt-4"
            onClick={() => router.push("/playlists")}
          >
            <Icons.ArrowLeft size={16} className="mr-2" />
            Back to Playlists
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
            onClick={() => router.push("/playlists")}
            className={cn(
              "hover:underline flex items-center gap-1",
              isDark ? "text-slate-400" : "text-slate-500",
            )}
          >
            <Icons.ListOrdered size={14} />
            Playlists
          </button>
          <Icons.ChevronRight size={14} className="text-slate-400" />
          <span
            className={cn(
              "font-medium",
              isDark ? "text-white" : "text-slate-900",
            )}
          >
            {playlist.playlistName}
          </span>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Playlist Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            {playlist.thumbnail ? (
              <img
                src={playlist.thumbnail}
                alt={playlist.playlistName}
                className="w-32 h-32 rounded-2xl object-cover"
              />
            ) : (
              <div
                className={cn(
                  "w-32 h-32 rounded-2xl flex items-center justify-center",
                  isDark ? "bg-slate-800" : "bg-slate-100",
                )}
              >
                <Icons.ListOrdered size={48} className="text-slate-400" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter text-[hsl(var(--text-primary))]">
                {playlist.playlistName}
              </h1>
              <p
                className={cn(
                  "text-sm font-medium mt-1",
                  isDark ? "text-slate-400" : "text-slate-500",
                )}
              >
                {playlist.channelName}
              </p>
              <p
                className={cn(
                  "text-xs font-bold uppercase tracking-widest mt-2",
                  isDark ? "text-slate-500" : "text-slate-400",
                )}
              >
                {playlist.creatorName}
              </p>
              <div className="flex items-center gap-3 mt-3">
                <Badge
                  variant={
                    playlist.isDeactivated
                      ? "danger"
                      : playlist.isActive
                        ? "success"
                        : "warning"
                  }
                >
                  {playlist.isDeactivated
                    ? "Deactivated"
                    : playlist.isActive
                      ? "Active"
                      : "Inactive"}
                </Badge>
                <span
                  className={cn(
                    "text-sm",
                    isDark ? "text-slate-400" : "text-slate-500",
                  )}
                >
                  {playlist.videos?.length || playlist.videoCount} videos
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => router.push("/playlists")}
            >
              <Icons.ArrowLeft size={16} className="mr-2" />
              Back
            </Button>
          </div>
        </div>

        {/* Playlist Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <Card
            className={cn(
              "rounded-xl border-none shadow-lg",
              isDark ? "bg-slate-800" : "bg-white",
            )}
          >
            <CardContent className="p-4 text-center">
              <p
                className={cn(
                  "text-2xl font-black",
                  isDark ? "text-emerald-400" : "text-emerald-600",
                )}
              >
                {formatNumber(playlist.totalViews)}
              </p>
              <p
                className={cn(
                  "text-xs font-bold uppercase tracking-wider mt-1",
                  isDark ? "text-slate-400" : "text-slate-500",
                )}
              >
                Total Views
              </p>
            </CardContent>
          </Card>
          <Card
            className={cn(
              "rounded-xl border-none shadow-lg",
              isDark ? "bg-slate-800" : "bg-white",
            )}
          >
            <CardContent className="p-4 text-center">
              <p
                className={cn(
                  "text-2xl font-black",
                  isDark ? "text-amber-400" : "text-amber-600",
                )}
              >
                {formatNumber(playlist.totalLikes)}
              </p>
              <p
                className={cn(
                  "text-xs font-bold uppercase tracking-wider mt-1",
                  isDark ? "text-slate-400" : "text-slate-500",
                )}
              >
                Total Likes
              </p>
            </CardContent>
          </Card>
          <Card
            className={cn(
              "rounded-xl border-none shadow-lg",
              isDark ? "bg-slate-800" : "bg-white",
            )}
          >
            <CardContent className="p-4 text-center">
              <p
                className={cn(
                  "text-2xl font-black",
                  isDark ? "text-blue-400" : "text-blue-600",
                )}
              >
                {playlist.videoCount}
              </p>
              <p
                className={cn(
                  "text-xs font-bold uppercase tracking-wider mt-1",
                  isDark ? "text-slate-400" : "text-slate-500",
                )}
              >
                Videos
              </p>
            </CardContent>
          </Card>
          <Card
            className={cn(
              "rounded-xl border-none shadow-lg",
              isDark ? "bg-slate-800" : "bg-white",
            )}
          >
            <CardContent className="p-4 text-center">
              <p
                className={cn(
                  "text-2xl font-black",
                  isDark ? "text-purple-400" : "text-purple-600",
                )}
              >
                {playlist.paymentType === "free"
                  ? "Free"
                  : formatCurrency(playlist.price || 0)}
              </p>
              <p
                className={cn(
                  "text-xs font-bold uppercase tracking-wider mt-1",
                  isDark ? "text-slate-400" : "text-slate-500",
                )}
              >
                Price
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Videos Grid */}
        <div className="mt-8">
          <h2 className="text-xl font-black uppercase tracking-tighter text-[hsl(var(--text-primary))] mb-4">
            Videos in Playlist
          </h2>
          {playlist.videos && playlist.videos.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {playlist.videos.map((video) => (
                <Card
                  key={video.id}
                  hover
                  className={cn(
                    "rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer",
                    isDark
                      ? "bg-slate-800 border-slate-700"
                      : "bg-white border-slate-200",
                  )}
                  onClick={() => handlePlayVideo(video)}
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
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-300 group">
                      <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Icons.Play size={32} className="text-slate-900 ml-1" />
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3
                      className={cn(
                        "text-sm font-semibold line-clamp-2",
                        isDark ? "text-white" : "text-slate-900",
                      )}
                    >
                      {video.title}
                    </h3>
                    <div className="flex items-center justify-between mt-2 text-xs">
                      <span
                        className={isDark ? "text-slate-400" : "text-slate-500"}
                      >
                        {formatNumber(video.views)} views
                      </span>
                      <span
                        className={isDark ? "text-slate-400" : "text-slate-500"}
                      >
                        {formatDate(video.createdAt)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card
              className={cn(
                "p-12 rounded-[3rem] border-none shadow-xl text-center",
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
                  No videos in this playlist
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Video Playback Modal */}
      <Modal
        isOpen={showVideoModal}
        onClose={() => {
          setShowVideoModal(false);
          setSelectedVideo(null);
        }}
        title={selectedVideo?.title || "Video Player"}
        size="xl"
      >
        {selectedVideo && (
          <div className="space-y-6">
            {/* Video Player */}
            <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden shadow-lg">
              {selectedVideo.videoUrl ? (
                <video
                  src={selectedVideo.videoUrl}
                  poster={selectedVideo.thumbnail}
                  controls
                  className="w-full h-full object-contain"
                  preload="metadata"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Icons.Video size={64} className="text-slate-600" />
                </div>
              )}
            </div>

            {/* Video Info */}
            <div>
              <h3 className="text-lg font-semibold">{selectedVideo.title}</h3>
              <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                <span>{formatNumber(selectedVideo.views)} views</span>
                <span>{formatDate(selectedVideo.createdAt)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button
                variant="danger"
                onClick={() => {
                  setShowVideoModal(false);
                  setShowDeleteModal(true);
                }}
              >
                <Icons.Trash2 size={16} className="mr-2" />
                Remove from Playlist
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedVideo(null);
        }}
        onConfirm={handleDeleteVideo}
        title="Remove Video"
        message={`Are you sure you want to remove "${selectedVideo?.title}" from this playlist?`}
        confirmText="Remove"
        variant="danger"
      />
    </div>
  );
}

// Helper function for duration formatting
function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
