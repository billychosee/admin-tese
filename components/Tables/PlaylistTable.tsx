"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { cn, formatNumber, formatCurrency, formatRelativeTime, getInitials, formatDate } from "@/utils";
import { Icons } from "@/components/ui/Icons";
import type { Playlist, Video } from "@/types";

interface PlaylistTableProps {
  playlists: Playlist[];
  isLoading?: boolean;
  onViewPlaylist: (playlist: Playlist) => void;
  onToggleStatus: (playlist: Playlist, action: "deactivate" | "activate") => void;
  onViewVideos: (playlist: Playlist) => void;
}

export function PlaylistTable({
  playlists,
  isLoading,
  onViewPlaylist,
  onToggleStatus,
  onViewVideos,
}: PlaylistTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [showVideosModal, setShowVideosModal] = useState(false);
  const itemsPerPage = 10;

  const filteredPlaylists = useMemo(() => {
    return playlists.filter((playlist) => {
      const matchesSearch =
        playlist.playlistName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        playlist.creatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        playlist.channelName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        statusFilter === "all" ||
        (statusFilter === "active" && playlist.isActive && !playlist.isDeactivated) ||
        (statusFilter === "deactivated" && playlist.isDeactivated) ||
        (statusFilter === "inactive" && !playlist.isActive);

      return matchesSearch && matchesFilter;
    });
  }, [playlists, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredPlaylists.length / itemsPerPage);
  const paginatedPlaylists = filteredPlaylists.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const statusColors = {
    active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    inactive: "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400",
    deactivated: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };

  const handleViewVideos = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setShowVideosModal(true);
    onViewVideos(playlist);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div>
              <CardTitle>Playlists</CardTitle>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Search playlists..."
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
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="deactivated">Deactivated</option>
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
                        Playlist
                      </th>
                      <th className="text-left py-4 px-4 font-bold text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50">
                        Channel
                      </th>
                      <th className="text-left py-4 px-4 font-bold text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50">
                        Videos
                      </th>
                      <th className="text-left py-4 px-4 font-bold text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50">
                        Price
                      </th>
                      <th className="text-left py-4 px-4 font-bold text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50">
                        Views
                      </th>
                      <th className="text-left py-4 px-4 font-bold text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50">
                        Status
                      </th>
                      <th className="text-left py-4 px-4 font-bold text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedPlaylists.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-slate-500 dark:text-slate-400">
                          No playlists found
                        </td>
                      </tr>
                    ) : (
                      paginatedPlaylists.map((playlist) => (
                        <tr
                          key={playlist.id}
                          className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="cursor-pointer"
                                onClick={() => onViewPlaylist(playlist)}
                              >
                                {playlist.thumbnail ? (
                                  <img
                                    src={playlist.thumbnail}
                                    alt={playlist.playlistName}
                                    className="w-10 h-10 rounded-lg object-cover"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                      {getInitials(playlist.playlistName)}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                  {playlist.playlistName}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  {playlist.creatorName}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm text-slate-600 dark:text-slate-300">
                            {playlist.channelName}
                          </td>
                          <td className="py-4 px-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                            {formatNumber(playlist.videoCount)}
                          </td>
                          <td className="py-4 px-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                            {playlist.paymentType === "free" ? (
                              <Badge variant="neutral">Free</Badge>
                            ) : (
                              <span className="text-emerald-600 dark:text-emerald-400">
                                {formatCurrency(playlist.price || 0)}
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                            {formatNumber(playlist.totalViews)}
                          </td>
                          <td className="py-4 px-4">
                            <Badge
                              variant={
                                playlist.isDeactivated
                                  ? "danger"
                                  : playlist.isActive
                                    ? "success"
                                    : "warning"
                              }
                            >
                              {playlist.isDeactivated ? "Deactivated" : playlist.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => onViewPlaylist(playlist)}
                                className="p-2 rounded-lg border border-transparent hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-200 dark:hover:border-slate-600 text-slate-500 dark:text-slate-400 transition"
                                title="View playlist"
                              >
                                <Icons.Eye size={16} />
                              </button>
                              <button
                                onClick={() => onToggleStatus(playlist, playlist.isActive && !playlist.isDeactivated ? "deactivate" : "activate")}
                                className="p-2 rounded-lg border border-transparent hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-200 dark:hover:border-slate-600 text-slate-500 dark:text-slate-400 transition"
                                title={playlist.isActive && !playlist.isDeactivated ? "Deactivate" : "Activate"}
                              >
                                {playlist.isActive && !playlist.isDeactivated ? (
                                  <Icons.Lock size={16} />
                                ) : (
                                  <Icons.Unlock size={16} />
                                )}
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
                      filteredPlaylists.length
                    )}{" "}
                    to{" "}
                    {Math.min(
                      currentPage * itemsPerPage,
                      filteredPlaylists.length
                    )}{" "}
                    of {filteredPlaylists.length} results
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

      {/* Videos Modal */}
      <Modal
        isOpen={showVideosModal}
        onClose={() => setShowVideosModal(false)}
        title="Videos in Playlist"
        size="xl"
      >
        {selectedPlaylist && (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-700">
              {selectedPlaylist.thumbnail && (
                <img
                  src={selectedPlaylist.thumbnail}
                  alt={selectedPlaylist.playlistName}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              )}
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {selectedPlaylist.playlistName}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {selectedPlaylist.videoCount} videos
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              {selectedPlaylist.videos.length === 0 ? (
                <p className="text-center py-8 text-slate-500 dark:text-slate-400">
                  No videos in this playlist
                </p>
              ) : (
                selectedPlaylist.videos.map((video: Video) => (
                  <div
                    key={video.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800"
                  >
                    <div className="relative flex-shrink-0">
                      {video.thumbnail ? (
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-20 h-12 rounded object-cover"
                        />
                      ) : (
                        <div className="w-20 h-12 rounded bg-slate-200 dark:bg-slate-700" />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <Icons.Play size={20} className="text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {video.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {formatNumber(video.views)} views • {formatRelativeTime(video.createdAt)}
                      </p>
                    </div>
                    <Badge
                      variant={
                        video.status === "published"
                          ? "success"
                          : video.status === "pending"
                            ? "warning"
                            : "danger"
                      }
                    >
                      {video.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
