"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { cn, formatNumber, formatDate } from "@/utils";
import { Icons } from "@/components/ui/Icons";
import type { Comment, UserProfile } from "@/types";

interface CommentTableProps {
  comments: Comment[];
  isLoading?: boolean;
  onFlag: (comment: Comment) => Promise<void>;
  onUnflag: (comment: Comment) => Promise<void>;
  onHide: (comment: Comment) => Promise<void>;
  onUnhide: (comment: Comment) => Promise<void>;
  onDelete: (comment: Comment) => void;
  onViewProfile: (userId: string) => Promise<UserProfile | null>;
}

export function CommentTable({
  comments,
  isLoading,
  onFlag,
  onUnflag,
  onHide,
  onUnhide,
  onDelete,
  onViewProfile,
}: CommentTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(
    null,
  );
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [showHideModal, setShowHideModal] = useState(false);
  const [showUnhideModal, setShowUnhideModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUnflagModal, setShowUnflagModal] = useState(false);
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [showRepliesModal, setShowRepliesModal] = useState(false);
  const itemsPerPage = 10;

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "flagged":
        return "warning";
      case "hidden":
        return "danger";
      default:
        return "neutral";
    }
  };

  const filteredComments = useMemo(() => {
    return comments.filter((comment) => {
      const matchesSearch =
        comment.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comment.videoTitle.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || comment.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [comments, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredComments.length / itemsPerPage);
  const paginatedComments = filteredComments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleViewProfile = async (
    commentOrUser: Comment | { id: string; userId: string },
  ) => {
    // Use type guard to safely extract userId
    const userId =
      "userId" in commentOrUser
        ? (commentOrUser as { userId: string }).userId
        : (commentOrUser as Comment).userId;
    try {
      const profile = await onViewProfile(userId);
      setSelectedProfile(profile);
      setShowProfileModal(true);
    } catch {
      console.error("Failed to fetch profile");
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Search comments, users, videos..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 pl-10"
              />
            </div>
            <div className="relative w-full sm:w-48">
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
                <option value="flagged">Flagged</option>
                <option value="hidden">Hidden</option>
              </select>
              <Icons.ChevronDown
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-16 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"
              />
            ))}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <th className="text-left py-4 px-4 font-bold text-sm text-slate-700 dark:text-slate-200">
                      User
                    </th>
                    <th className="text-left py-4 px-4 font-bold text-sm text-slate-700 dark:text-slate-200">
                      Comment
                    </th>
                    <th className="text-left py-4 px-4 font-bold text-sm text-slate-700 dark:text-slate-200">
                      Video
                    </th>
                    <th className="text-left py-4 px-4 font-bold text-sm text-slate-700 dark:text-slate-200">
                      Status
                    </th>
                    <th className="text-left py-4 px-4 font-bold text-sm text-slate-700 dark:text-slate-200">
                      Metrics
                    </th>
                    <th className="text-left py-4 px-4 font-bold text-sm text-slate-700 dark:text-slate-200">
                      Date
                    </th>
                    <th className="text-left py-4 px-4 font-bold text-sm text-slate-700 dark:text-slate-200">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedComments.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center py-12 text-slate-500 dark:text-slate-400"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Icons.MessageCircle
                            size={48}
                            className="text-slate-300 dark:text-slate-600"
                          />
                          <p>No comments found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedComments.map((comment) => (
                      <tr
                        key={comment.id}
                        className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              {comment.userAvatar ? (
                                <img
                                  src={comment.userAvatar}
                                  alt={comment.userName}
                                  className="w-10 h-10 rounded-full object-cover cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewProfile(comment);
                                  }}
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                  <Icons.User
                                    size={20}
                                    className="text-emerald-600 dark:text-emerald-400"
                                  />
                                </div>
                              )}
                              {comment.isFlagged && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
                                  <Icons.Flag
                                    size={10}
                                    className="text-white"
                                  />
                                </span>
                              )}
                            </div>
                            <div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewProfile(comment);
                                }}
                                className="text-sm font-semibold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                              >
                                {comment.userName}
                              </button>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {comment.userEmail}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 max-w-xs">
                          <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                            {comment.content}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Icons.Video
                              size={16}
                              className="text-slate-400 flex-shrink-0"
                            />
                            <span className="text-sm text-slate-600 dark:text-slate-300 line-clamp-1">
                              {comment.videoTitle}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge
                            variant={
                              getStatusVariant(comment.status) as
                                | "success"
                                | "warning"
                                | "danger"
                                | "info"
                                | "neutral"
                            }
                            className="capitalize"
                          >
                            {comment.status}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                              <Icons.Heart size={12} />
                              {formatNumber(comment.likes)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Icons.MessageCircle size={12} />
                              {formatNumber(comment.replies)}
                            </span>
                            {comment.flags > 0 && (
                              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                                <Icons.Flag size={12} />
                                {formatNumber(comment.flags)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-500 dark:text-slate-400">
                          {formatDate(comment.createdAt)}
                        </td>
                        <td className="py-4 px-4">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedComment(comment);
                              setShowDetailsModal(true);
                            }}
                          >
                            <Icons.Eye size={14} className="mr-1" />
                            View
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Showing{" "}
                  {Math.min(
                    (currentPage - 1) * itemsPerPage + 1,
                    filteredComments.length,
                  )}{" "}
                  to{" "}
                  {Math.min(
                    currentPage * itemsPerPage,
                    filteredComments.length,
                  )}{" "}
                  of {filteredComments.length} results
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
      </div>

      {/* Comment Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Comment Details"
        size="lg"
      >
        {selectedComment && (
          <div className="space-y-6">
            {/* Comment Content */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-3">
                {selectedComment.userAvatar ? (
                  <img
                    src={selectedComment.userAvatar}
                    alt={selectedComment.userName}
                    className="w-10 h-10 rounded-full object-cover cursor-pointer"
                    onClick={() => {
                      setShowDetailsModal(false);
                      handleViewProfile(selectedComment);
                    }}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <Icons.User
                      size={20}
                      className="text-emerald-600 dark:text-emerald-400"
                    />
                  </div>
                )}
                <div>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      handleViewProfile(selectedComment);
                    }}
                    className="text-sm font-semibold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                  >
                    {selectedComment.userName}
                  </button>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedComment.userEmail}
                  </p>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {selectedComment.content}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <Badge
                  variant={
                    getStatusVariant(selectedComment.status) as
                      | "success"
                      | "warning"
                      | "danger"
                      | "info"
                      | "neutral"
                  }
                  className="capitalize"
                >
                  {selectedComment.status}
                </Badge>
                {selectedComment.isFlagged && (
                  <Badge variant="warning">Flagged</Badge>
                )}
                {selectedComment.isHidden && (
                  <Badge variant="danger">Hidden</Badge>
                )}
              </div>
            </div>

            {/* Video Info */}
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Icons.Video size={16} />
              <span>{selectedComment.videoTitle}</span>
            </div>

            {/* Metrics */}
            <div className="space-y-3">
              <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                <button
                  onClick={() => setShowLikesModal(true)}
                  className="flex items-center gap-1 hover:text-red-500 transition"
                >
                  <Icons.Heart size={14} />
                  {formatNumber(selectedComment.likes)} likes
                </button>
                <button
                  onClick={() => setShowRepliesModal(true)}
                  className="flex items-center gap-1 hover:text-green-500 transition"
                >
                  <Icons.MessageCircle size={14} />
                  {formatNumber(selectedComment.replies)} replies
                </button>
                <span className="flex items-center gap-1">
                  <Icons.Flag size={14} />
                  {formatNumber(selectedComment.flags)} flags
                </span>
                <span>{formatDate(selectedComment.createdAt)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setShowDetailsModal(false);
                  handleViewProfile(selectedComment);
                }}
              >
                <Icons.User size={14} className="mr-1" />
                View Profile
              </Button>
              {selectedComment.isFlagged ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowUnflagModal(true)}
                >
                  <Icons.FlagOff size={14} className="mr-1" />
                  Unflag
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowFlagModal(true)}
                >
                  <Icons.Flag size={14} className="mr-1" />
                  Flag
                </Button>
              )}
              {selectedComment.isHidden ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowUnhideModal(true)}
                >
                  <Icons.Eye size={14} className="mr-1" />
                  Show
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowHideModal(true)}
                >
                  <Icons.EyeOff size={14} className="mr-1" />
                  Hide
                </Button>
              )}
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowDeleteModal(true)}
              >
                <Icons.Trash2 size={14} className="mr-1" />
                Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Flag Confirmation Modal */}
      <ConfirmModal
        isOpen={showFlagModal}
        onClose={() => setShowFlagModal(false)}
        onConfirm={() => {
          if (selectedComment) {
            onFlag(selectedComment);
            setShowFlagModal(false);
            setShowDetailsModal(false);
          }
        }}
        title="Flag Comment"
        message="Are you sure you want to flag this comment? Flagged comments will be reviewed by moderators."
        confirmText="Flag"
        variant="warning"
      />

      {/* Unflag Confirmation Modal */}
      <ConfirmModal
        isOpen={showUnflagModal}
        onClose={() => setShowUnflagModal(false)}
        onConfirm={() => {
          if (selectedComment) {
            onUnflag(selectedComment);
            setShowUnflagModal(false);
            setShowDetailsModal(false);
          }
        }}
        title="Unflag Comment"
        message="Are you sure you want to unflag this comment? This will remove the flag and restore the comment's normal status."
        confirmText="Unflag"
        variant="info"
      />

      {/* Hide Confirmation Modal */}
      <ConfirmModal
        isOpen={showHideModal}
        onClose={() => setShowHideModal(false)}
        onConfirm={() => {
          if (selectedComment) {
            onHide(selectedComment);
            setShowHideModal(false);
            setShowDetailsModal(false);
          }
        }}
        title="Hide Comment"
        message="Are you sure you want to hide this comment? Hidden comments will not be visible to users."
        confirmText="Hide"
        variant="warning"
      />

      {/* Unhide Confirmation Modal */}
      <ConfirmModal
        isOpen={showUnhideModal}
        onClose={() => setShowUnhideModal(false)}
        onConfirm={() => {
          if (selectedComment) {
            onUnhide(selectedComment);
            setShowUnhideModal(false);
            setShowDetailsModal(false);
          }
        }}
        title="Show Comment"
        message="Are you sure you want to show this comment? The comment will be visible to users."
        confirmText="Show"
        variant="info"
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          if (selectedComment) {
            onDelete(selectedComment);
            setShowDeleteModal(false);
            setShowDetailsModal(false);
          }
        }}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />

      {/* Likes Modal */}
      <Modal
        isOpen={showLikesModal}
        onClose={() => setShowLikesModal(false)}
        title="People Who Liked"
        size="md"
      >
        {selectedComment && (
          <div className="space-y-4">
            {selectedComment.likedBy && selectedComment.likedBy.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedComment.likedBy.map((liker) => (
                  <button
                    key={liker.id}
                    onClick={() =>
                      handleViewProfile({ id: liker.id, userId: liker.id })
                    }
                    className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 transition"
                  >
                    {liker.avatar ? (
                      <img
                        src={liker.avatar}
                        alt={liker.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                        <Icons.User
                          size={14}
                          className="text-emerald-600 dark:text-emerald-400"
                        />
                      </div>
                    )}
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {liker.name}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                No likes yet
              </p>
            )}
          </div>
        )}
      </Modal>

      {/* Replies Modal */}
      <Modal
        isOpen={showRepliesModal}
        onClose={() => setShowRepliesModal(false)}
        title="People Who Replied"
        size="lg"
      >
        {selectedComment && (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {selectedComment.repliedBy &&
            selectedComment.repliedBy.length > 0 ? (
              <div className="space-y-3">
                {selectedComment.repliedBy.map((reply) => (
                  <div
                    key={reply.id}
                    className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {reply.avatar ? (
                        <img
                          src={reply.avatar}
                          alt={reply.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                          <Icons.User
                            size={16}
                            className="text-emerald-600 dark:text-emerald-400"
                          />
                        </div>
                      )}
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {reply.name}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        {formatDate(reply.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {reply.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                No replies yet
              </p>
            )}
          </div>
        )}
      </Modal>

      {/* User Profile Modal */}
      <Modal
        isOpen={showProfileModal}
        onClose={() => {
          setShowProfileModal(false);
          setSelectedProfile(null);
          setSelectedComment(null);
        }}
        title="User Profile"
        size="lg"
      >
        {selectedProfile && (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-center gap-4">
              {selectedProfile.avatar ? (
                <img
                  src={selectedProfile.avatar}
                  alt={selectedProfile.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Icons.User
                    size={40}
                    className="text-emerald-600 dark:text-emerald-400"
                  />
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {selectedProfile.name}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {selectedProfile.email}
                </p>
                <Badge
                  variant={
                    selectedProfile.status === "active"
                      ? "success"
                      : selectedProfile.status === "suspended"
                        ? "warning"
                        : "danger"
                  }
                  className="mt-1 capitalize"
                >
                  {selectedProfile.status}
                </Badge>
              </div>
            </div>

            {/* Bio and Location */}
            {selectedProfile.bio && (
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Bio
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {selectedProfile.bio}
                </p>
              </div>
            )}

            {selectedProfile.location && (
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Icons.MapPin size={16} />
                {selectedProfile.location}
              </div>
            )}

            {selectedProfile.website && (
              <div className="flex items-center gap-2 text-sm">
                <Icons.Globe size={16} className="text-slate-400" />
                <a
                  href={selectedProfile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  {selectedProfile.website}
                </a>
              </div>
            )}

            {/* Social Links */}
            {selectedProfile.socialLinks && (
              <div className="flex gap-4">
                {selectedProfile.socialLinks.twitter && (
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Icons.Twitter size={16} />
                    {selectedProfile.socialLinks.twitter}
                  </div>
                )}
                {selectedProfile.socialLinks.instagram && (
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Icons.Instagram size={16} />
                    {selectedProfile.socialLinks.instagram}
                  </div>
                )}
                {selectedProfile.socialLinks.youtube && (
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Icons.Youtube size={16} />
                    {selectedProfile.socialLinks.youtube}
                  </div>
                )}
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatNumber(selectedProfile.totalComments)}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Comments
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatNumber(selectedProfile.totalLikes)}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Likes Received
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatNumber(selectedProfile.totalVideos)}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Videos
                </p>
              </div>
            </div>

            {/* Activity Info */}
            <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-200 dark:border-slate-700">
              <span>Joined: {formatDate(selectedProfile.joinedAt)}</span>
              {selectedProfile.lastActive && (
                <span>
                  Last active: {formatDate(selectedProfile.lastActive)}
                </span>
              )}
            </div>

            {/* Related Comments */}
            {selectedComment && (
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Comment by this user:
                </p>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                  <p className="text-sm text-slate-600 dark:text-slate-400 italic">
                    "{selectedComment.content}"
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    on {selectedComment.videoTitle}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
