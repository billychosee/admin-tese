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
import type { Creator, Playlist } from "@/types";

export default function ChannelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const creatorId = params.id as string;
  const [channel, setChannel] = useState<Creator | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);

  useEffect(() => {
    if (creatorId) {
      fetchChannel();
    }
  }, [creatorId]);

  const fetchChannel = async () => {
    setIsLoading(true);
    try {
      const data = await api.creators.getById(creatorId);
      setChannel(data);
      // Fetch playlists after channel is loaded
      if (data.channelId) {
        fetchPlaylists(data.channelId);
      }
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to fetch channel",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPlaylists = async (channelId?: string) => {
    try {
      const id = channelId || channel?.channelId;
      if (id) {
        const data = await api.playlists.getByChannelId(id);
        setPlaylists(data);
      }
    } catch {
      console.error("Failed to fetch playlists");
    }
  };

  const handleOpenPlaylist = (playlist: Playlist) => {
    router.push(`/playlists/${playlist.id}`);
  };

  const handleDeactivateChannel = async () => {
    if (!channel) return;
    try {
      if (channel.channelStatus === "active") {
        await api.creators.deactivateChannel(channel.id);
        addToast({
          type: "success",
          title: "Success",
          message: "Channel deactivated",
        });
      } else {
        await api.creators.activateChannel(channel.id);
        addToast({
          type: "success",
          title: "Success",
          message: "Channel activated",
        });
      }
      setShowDeactivateModal(false);
      fetchChannel();
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to update channel status",
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!channel) {
    return (
      <div
        className={cn(
          "space-y-6 min-h-screen font-sans",
          isDark ? "bg-[#020617]" : "bg-[#F1F5F9]",
        )}
      >
        <div className="container mx-auto px-6 py-8 text-center">
          <Icons.Radio
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
            Channel not found
          </p>
          <Button
            variant="primary"
            className="mt-4"
            onClick={() => router.push("/channels")}
          >
            <Icons.ArrowLeft size={16} className="mr-2" />
            Back to Channels
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
            onClick={() => router.push("/channels")}
            className={cn(
              "hover:underline flex items-center gap-1",
              isDark ? "text-slate-400" : "text-slate-500",
            )}
          >
            <Icons.Radio size={14} />
            Channels
          </button>
          <Icons.ChevronRight size={14} className="text-slate-400" />
          <span
            className={cn(
              "font-medium",
              isDark ? "text-white" : "text-slate-900",
            )}
          >
            {channel.channelName}
          </span>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Channel Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            {channel.avatar ? (
              <img
                src={channel.avatar}
                alt={channel.channelName}
                className="w-24 h-24 rounded-2xl object-cover"
              />
            ) : (
              <div
                className={cn(
                  "w-24 h-24 rounded-2xl flex items-center justify-center",
                  isDark ? "bg-slate-800" : "bg-slate-100",
                )}
              >
                <Icons.User size={48} className="text-slate-400" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter text-[hsl(var(--text-primary))]">
                {channel.channelName}
              </h1>
              <p
                className={cn(
                  "text-sm font-medium mt-1",
                  isDark ? "text-slate-400" : "text-slate-500",
                )}
              >
                {channel.creatorFullName}
              </p>
              <p
                className={cn(
                  "text-xs font-bold uppercase tracking-widest mt-2",
                  isDark ? "text-slate-500" : "text-slate-400",
                )}
              >
                {channel.email}
              </p>
              <div className="flex items-center gap-3 mt-3">
                <Badge
                  variant={
                    channel.channelStatus === "active" ? "success" : "danger"
                  }
                >
                  {channel.channelStatus === "active"
                    ? "Active"
                    : "Deactivated"}
                </Badge>
                <span
                  className={cn(
                    "text-sm",
                    isDark ? "text-slate-400" : "text-slate-500",
                  )}
                >
                  {formatNumber(channel.totalVideos)} videos
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant={
                channel.channelStatus === "active" ? "danger" : "primary"
              }
              onClick={() => setShowDeactivateModal(true)}
            >
              {channel.channelStatus === "active" ? (
                <>
                  <Icons.Lock size={16} className="mr-2" />
                  Deactivate Channel
                </>
              ) : (
                <>
                  <Icons.Unlock size={16} className="mr-2" />
                  Activate Channel
                </>
              )}
            </Button>
            <Button variant="outline" onClick={() => router.push("/channels")}>
              <Icons.ArrowLeft size={16} className="mr-2" />
              Back
            </Button>
          </div>
        </div>

        {/* Channel Stats */}
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
                {formatNumber(channel.totalViews)}
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
                {formatNumber(channel.totalLikes)}
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
                {formatNumber(channel.totalVideos)}
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
                {formatCurrency(channel.totalEarnings)}
              </p>
              <p
                className={cn(
                  "text-xs font-bold uppercase tracking-wider mt-1",
                  isDark ? "text-slate-400" : "text-slate-500",
                )}
              >
                Total Earnings
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Playlists Grid */}
        <div className="mt-8">
          <h2 className="text-xl font-black uppercase tracking-tighter text-[hsl(var(--text-primary))] mb-4">
            Playlists
          </h2>
          {playlists && playlists.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {playlists.map((playlist) => (
                <Card
                  key={playlist.id}
                  hover
                  className={cn(
                    "rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer",
                    isDark
                      ? "bg-slate-800 border-slate-700"
                      : "bg-white border-slate-200",
                  )}
                  onClick={() => handleOpenPlaylist(playlist)}
                >
                  <div className="relative aspect-video bg-slate-900">
                    {playlist.thumbnail ? (
                      <img
                        src={playlist.thumbnail}
                        alt={playlist.playlistName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icons.ListOrdered size={48} className="text-slate-600" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge
                        variant={
                          playlist.isDeactivated
                            ? "danger"
                            : playlist.isActive
                              ? "success"
                              : "warning"
                        }
                        className="rounded-lg font-black text-[8px] uppercase"
                      >
                        {playlist.isDeactivated
                          ? "Deactivated"
                          : playlist.isActive
                            ? "Active"
                            : "Inactive"}
                      </Badge>
                    </div>
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-300 group">
                      <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Icons.Play
                          size={32}
                          className="text-slate-900 ml-1"
                        />
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
                      {playlist.playlistName}
                    </h3>
                    <div className="flex items-center justify-between mt-2 text-xs">
                      <span
                        className={isDark ? "text-slate-400" : "text-slate-500"}
                      >
                        {playlist.videoCount} videos
                      </span>
                      <span
                        className={isDark ? "text-slate-400" : "text-slate-500"}
                      >
                        {formatNumber(playlist.totalViews)} views
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
                <Icons.ListOrdered
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
                  No playlists in this channel
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Deactivate/Activate Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeactivateModal}
        onClose={() => setShowDeactivateModal(false)}
        onConfirm={handleDeactivateChannel}
        title={
          channel.channelStatus === "active"
            ? "Deactivate Channel"
            : "Activate Channel"
        }
        message={
          channel.channelStatus === "active"
            ? `Are you sure you want to deactivate "${channel.channelName}"? This will make the channel and all its content unavailable to users.`
            : `Are you sure you want to activate "${channel.channelName}"? This will make the channel and all its content visible to users.`
        }
        confirmText={
          channel.channelStatus === "active" ? "Deactivate" : "Activate"
        }
        variant={channel.channelStatus === "active" ? "warning" : "info"}
      />
    </div>
  );
}
