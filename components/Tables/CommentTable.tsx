"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { Icons } from "@/components/ui/Icons";
import type { Comment } from "@/types";
import { formatDate } from "@/utils";

interface CommentTableProps {
  comments: Comment[];
  isLoading?: boolean;
  onFlag?: (comment: Comment) => void;
  onUnflag?: (comment: Comment) => void;
  onHide?: (comment: Comment) => void;
  onUnhide?: (comment: Comment) => void;
  onDelete?: (comment: Comment) => void;
}

export function CommentTable({
  comments,
  isLoading,
  onFlag,
  onUnflag,
  onHide,
  onUnhide,
  onDelete,
}: CommentTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [showUnflagModal, setShowUnflagModal] = useState(false);
  const [showHideModal, setShowHideModal] = useState(false);
  const [showUnhideModal, setShowUnhideModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const itemsPerPage = 10;

  const filteredComments = useMemo(() => {
    return comments.filter(
      (comment) =>
        comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comment.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comment.videoTitle.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [comments, searchTerm]);

  const totalPages = Math.ceil(filteredComments.length / itemsPerPage);
  const paginatedComments = filteredComments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleFlag = (comment: Comment) => {
    setSelectedComment(comment);
    setShowFlagModal(true);
  };

  const handleUnflag = (comment: Comment) => {
    setSelectedComment(comment);
    setShowUnflagModal(true);
  };

  const handleHide = (comment: Comment) => {
    setSelectedComment(comment);
    setShowHideModal(true);
  };

  const handleUnhide = (comment: Comment) => {
    setSelectedComment(comment);
    setShowUnhideModal(true);
  };

  const handleDelete = (comment: Comment) => {
    setSelectedComment(comment);
    setShowDeleteModal(true);
  };

  const confirmFlag = () => {
    if (selectedComment && onFlag) {
      onFlag(selectedComment);
    }
    setShowFlagModal(false);
    setSelectedComment(null);
  };

  const confirmUnflag = () => {
    if (selectedComment && onUnflag) {
      onUnflag(selectedComment);
    }
    setShowUnflagModal(false);
    setSelectedComment(null);
  };

  const confirmHide = () => {
    if (selectedComment && onHide) {
      onHide(selectedComment);
    }
    setShowHideModal(false);
    setSelectedComment(null);
  };

  const confirmUnhide = () => {
    if (selectedComment && onUnhide) {
      onUnhide(selectedComment);
    }
    setShowUnhideModal(false);
    setSelectedComment(null);
  };

  const confirmDelete = () => {
    if (selectedComment && onDelete) {
      onDelete(selectedComment);
    }
    setShowDeleteModal(false);
    setSelectedComment(null);
  };

  const getStatusBadge = (comment: Comment) => {
    if (comment.isHidden && comment.isFlagged) {
      return (
        <div className="flex justify-center gap-2">
          <Badge variant="warning">Hidden</Badge>
          <Badge variant="danger">Flagged</Badge>
        </div>
      );
    }
    if (comment.isHidden) {
      return <Badge variant="warning">Hidden</Badge>;
    }
    if (comment.isFlagged) {
      return <Badge variant="danger">Flagged</Badge>;
    }
    return <Badge variant="success">Active</Badge>;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="space-y-4">
            <CardTitle>Comments</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Search comments..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-10"
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
                        User
                      </th>
                      <th className="text-left py-4 px-4 font-bold text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50">
                        Comment
                      </th>
                      <th className="text-left py-4 px-4 font-bold text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50">
                        Video
                      </th>
                      <th className="text-center py-4 px-4 font-bold text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50">
                        Status
                      </th>
                      <th className="text-center py-4 px-4 font-bold text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50">
                        Likes
                      </th>
                      <th className="text-left py-4 px-4 font-bold text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50">
                        Date
                      </th>
                      <th className="text-right py-4 px-4 font-bold text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedComments.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-500 dark:text-slate-400">
                          No comments found
                        </td>
                      </tr>
                    ) : (
                      paginatedComments.map((comment) => (
                        <tr
                          key={comment.id}
                          className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                {comment.userAvatar ? (
                                  <img
                                    src={comment.userAvatar}
                                    alt={comment.userName}
                                    className="w-8 h-8 rounded-full"
                                  />
                                ) : (
                                  <Icons.User className="w-4 h-4" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-slate-900 dark:text-slate-100">
                                  {comment.userName}
                                </p>
                                <p className="text-xs text-slate-500">{comment.userEmail}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 max-w-xs">
                            <p className="truncate text-slate-700 dark:text-slate-300">
                              {comment.content}
                            </p>
                          </td>
                          <td className="py-4 px-4 max-w-xs">
                            <p className="truncate text-slate-600 dark:text-slate-400 text-sm">
                              {comment.videoTitle}
                            </p>
                          </td>
                          <td className="py-4 px-4 text-center">
                            {getStatusBadge(comment)}
                          </td>
                          <td className="py-4 px-4 text-center text-slate-600 dark:text-slate-400">
                            {comment.likes}
                          </td>
                          <td className="py-4 px-4 text-slate-600 dark:text-slate-400">
                            {formatDate(comment.createdAt)}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex justify-end gap-2">
                              {!comment.isHidden ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleHide(comment)}
                                  title="Hide comment"
                                >
                                  <Icons.EyeOff className="w-4 h-4" />
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUnhide(comment)}
                                  title="Unhide comment"
                                >
                                  <Icons.Eye className="w-4 h-4" />
                                </Button>
                              )}
                              {!comment.isFlagged ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleFlag(comment)}
                                  title="Flag comment"
                                >
                                  <Icons.Flag className="w-4 h-4" />
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUnflag(comment)}
                                  title="Unflag comment"
                                >
                                  <Icons.Check className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(comment)}
                                title="Delete comment"
                                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                              >
                                <Icons.Trash className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(currentPage * itemsPerPage, filteredComments.length)} of{" "}
                    {filteredComments.length} results
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Flag Confirmation Modal */}
      <ConfirmModal
        isOpen={showFlagModal}
        onClose={() => setShowFlagModal(false)}
        onConfirm={confirmFlag}
        title="Flag Comment"
        message="Are you sure you want to flag this comment?"
        confirmText="Flag"
        variant="warning"
      />

      {/* Unflag Confirmation Modal */}
      <ConfirmModal
        isOpen={showUnflagModal}
        onClose={() => setShowUnflagModal(false)}
        onConfirm={confirmUnflag}
        title="Unflag Comment"
        message="Are you sure you want to unflag this comment?"
        confirmText="Unflag"
        variant="info"
      />

      {/* Hide Confirmation Modal */}
      <ConfirmModal
        isOpen={showHideModal}
        onClose={() => setShowHideModal(false)}
        onConfirm={confirmHide}
        title="Hide Comment"
        message="Are you sure you want to hide this comment?"
        confirmText="Hide"
        variant="warning"
      />

      {/* Unhide Confirmation Modal */}
      <ConfirmModal
        isOpen={showUnhideModal}
        onClose={() => setShowUnhideModal(false)}
        onConfirm={confirmUnhide}
        title="Unhide Comment"
        message="Are you sure you want to unhide this comment?"
        confirmText="Unhide"
        variant="info"
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </>
  );
}
