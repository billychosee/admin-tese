"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { Icons } from "@/components/ui/Icons";
import { api } from "@/services/api";
import { cn, formatDate } from "../../utils";
import type { Comment, UserProfile } from "@/types";

interface VideoCommentsProps {
  videoId: string;
  videoTitle: string;
  onCommentUpdate?: () => void;
}

export function VideoComments({
  videoId,
  videoTitle,
  onCommentUpdate,
}: VideoCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [showUnflagModal, setShowUnflagModal] = useState(false);
  const [showHideModal, setShowHideModal] = useState(false);
  const [showUnhideModal, setShowUnhideModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [showRepliesModal, setShowRepliesModal] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [videoId]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const result = await api.comments.getAll(1, 50, "all", videoId);
      setComments(result.data);
    } catch {
      console.error("Failed to fetch comments");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFlag = async (comment: Comment) => {
    try {
      await api.comments.flag(comment.id);
      fetchComments();
      onCommentUpdate?.();
    } catch {
      console.error("Failed to flag comment");
    }
  };

  const handleUnflag = async (comment: Comment) => {
    try {
      await api.comments.unflag(comment.id);
      fetchComments();
      onCommentUpdate?.();
    } catch {
      console.error("Failed to unflag comment");
    }
  };

  const handleHide = async (comment: Comment) => {
    try {
      await api.comments.hide(comment.id);
      fetchComments();
      onCommentUpdate?.();
    } catch {
      console.error("Failed to hide comment");
    }
  };

  const handleUnhide = async (comment: Comment) => {
    try {
      await api.comments.unhide(comment.id);
      fetchComments();
      onCommentUpdate?.();
    } catch {
      console.error("Failed to unhide comment");
    }
  };

  const handleDelete = async (comment: Comment) => {
    try {
      await api.comments.delete(comment.id);
      fetchComments();
      onCommentUpdate?.();
    } catch {
      console.error("Failed to delete comment");
    }
  };

  const handleViewProfile = async (comment: Comment) => {
    try {
      const profile = await api.userProfiles.getById(comment.userId);
      setSelectedProfile(profile);
      setShowProfileModal(true);
    } catch {
      console.error("Failed to fetch profile");
    }
  };

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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
            Comments ({videoTitle})
          </h4>
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
            Comments ({comments.length})
          </h4>
          <Button variant="secondary" size="sm" onClick={fetchComments}>
            <Icons.RefreshCw size={14} className="mr-1" />
            Refresh
          </Button>
        </div>

        {comments.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <Icons.MessageCircle size={48} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p className="text-slate-500 dark:text-slate-400">
              No comments for this video yet
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className={cn(
                  "p-4 rounded-lg border transition",
                  comment.isHidden
                    ? "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-60"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                )}
              >
                <div className="flex items-start gap-3">
                  {/* User Avatar */}
                  <button
                    onClick={() => handleViewProfile(comment)}
                    className="flex-shrink-0"
                  >
                    {comment.userAvatar ? (
                      <img
                        src={comment.userAvatar}
                        alt={comment.userName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                        <Icons.User size={20} className="text-emerald-600 dark:text-emerald-400" />
                      </div>
                    )}
                  </button>

                  {/* Comment Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <button
                        onClick={() => handleViewProfile(comment)}
                        className="text-sm font-semibold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400"
                      >
                        {comment.userName}
                      </button>
                      {comment.isFlagged && (
                        <Icons.Flag size={14} className="text-amber-500" />
                      )}
                      {comment.isHidden && (
                        <Icons.EyeOff size={14} className="text-red-500" />
                      )}
                      <Badge
                        variant={getStatusVariant(comment.status) as "success" | "warning" | "danger" | "info" | "neutral"}
                        className="capitalize text-xs"
                      >
                        {comment.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {comment.content}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                      <span>{formatDate(comment.createdAt)}</span>
                      <button
                        onClick={() => {
                          setSelectedComment(comment);
                          setShowLikesModal(true);
                        }}
                        className="flex items-center gap-1 hover:text-red-500 transition"
                      >
                        <Icons.Heart size={12} />
                        {comment.likes}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedComment(comment);
                          setShowRepliesModal(true);
                        }}
                        className="flex items-center gap-1 hover:text-green-500 transition"
                      >
                        <Icons.MessageCircle size={12} />
                        {comment.replies}
                      </button>
                      {comment.flags > 0 && (
                        <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                          <Icons.Flag size={12} />
                          {comment.flags}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleViewProfile(comment)}
                      className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      title="View profile"
                    >
                      <Icons.User size={14} />
                    </button>
                    {comment.isFlagged ? (
                      <button
                        onClick={() => {
                          setSelectedComment(comment);
                          setShowUnflagModal(true);
                        }}
                        className="p-1.5 rounded hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-500 hover:text-amber-600"
                        title="Unflag"
                      >
                        <Icons.FlagOff size={14} />
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedComment(comment);
                          setShowFlagModal(true);
                        }}
                        className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-amber-500"
                        title="Flag"
                      >
                        <Icons.Flag size={14} />
                      </button>
                    )}
                    {comment.isHidden ? (
                      <button
                        onClick={() => {
                          setSelectedComment(comment);
                          setShowUnhideModal(true);
                        }}
                        className="p-1.5 rounded hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-500 hover:text-emerald-600"
                        title="Show"
                      >
                        <Icons.Eye size={14} />
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedComment(comment);
                          setShowHideModal(true);
                        }}
                        className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-red-500"
                        title="Hide"
                      >
                        <Icons.EyeOff size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedComment(comment);
                        setShowDeleteModal(true);
                      }}
                      className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500"
                      title="Delete"
                    >
                      <Icons.Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
                  <div
                    key={liker.id}
                    className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-full px-3 py-1.5 border border-slate-200 dark:border-slate-700"
                  >
                    {liker.avatar ? (
                      <img
                        src={liker.avatar}
                        alt={liker.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                        <Icons.User size={14} className="text-emerald-600 dark:text-emerald-400" />
                      </div>
                    )}
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {liker.name}
                    </span>
                  </div>
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
            {selectedComment.repliedBy && selectedComment.repliedBy.length > 0 ? (
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
                          <Icons.User size={16} className="text-emerald-600 dark:text-emerald-400" />
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

      {/* Flag Confirmation Modal */}
      <ConfirmModal
        isOpen={showFlagModal}
        onClose={() => setShowFlagModal(false)}
        onConfirm={() => {
          if (selectedComment) {
            handleFlag(selectedComment);
            setShowFlagModal(false);
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
            handleUnflag(selectedComment);
            setShowUnflagModal(false);
          }
        }}
        title="Unflag Comment"
        message="Are you sure you want to unflag this comment? This will remove the flag from the comment."
        confirmText="Unflag"
        variant="info"
      />

      {/* Hide Confirmation Modal */}
      <ConfirmModal
        isOpen={showHideModal}
        onClose={() => setShowHideModal(false)}
        onConfirm={() => {
          if (selectedComment) {
            handleHide(selectedComment);
            setShowHideModal(false);
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
            handleUnhide(selectedComment);
            setShowUnhideModal(false);
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
            handleDelete(selectedComment);
            setShowDeleteModal(false);
          }
        }}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />

      {/* User Profile Modal */}
      <Modal
        isOpen={showProfileModal}
        onClose={() => {
          setShowProfileModal(false);
          setSelectedProfile(null);
        }}
        title="User Profile"
        size="md"
      >
        {selectedProfile && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {selectedProfile.avatar ? (
                <img
                  src={selectedProfile.avatar}
                  alt={selectedProfile.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Icons.User size={32} className="text-emerald-600 dark:text-emerald-400" />
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
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

            {selectedProfile.bio && (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {selectedProfile.bio}
              </p>
            )}

            {selectedProfile.location && (
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Icons.MapPin size={14} />
                {selectedProfile.location}
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="text-center bg-slate-50 dark:bg-slate-800 rounded-lg p-2">
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {selectedProfile.totalComments}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Comments</p>
              </div>
              <div className="text-center bg-slate-50 dark:bg-slate-800 rounded-lg p-2">
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {selectedProfile.totalLikes}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Likes</p>
              </div>
              <div className="text-center bg-slate-50 dark:bg-slate-800 rounded-lg p-2">
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {selectedProfile.totalVideos}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Videos</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
