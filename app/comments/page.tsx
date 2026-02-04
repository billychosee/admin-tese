"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { CommentTable } from "@/components/Tables/CommentTable";
import { Icons } from "@/components/ui/Icons";
import { useToast } from "@/components/ui/Toast";
import { useTheme } from "@/components/providers/ThemeProvider";
import { api } from "@/services/api";
import { cn, formatNumber } from "@/utils";
import type { Comment, UserProfile } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default function CommentsPage() {
  const { addToast } = useToast();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    flagged: 0,
    hidden: 0,
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchComments();
    fetchStats();
  }, [page, statusFilter]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const result = await api.comments.getAll(page, 10, statusFilter);
      setComments(result.data);
      setTotalPages(result.totalPages);
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to fetch comments",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsResult = await api.comments.getStats();
      setStats(statsResult);
    } catch {
      console.error("Failed to fetch comment stats");
    }
  };

  const handleFlag = async (comment: Comment) => {
    try {
      await api.comments.flag(comment.id);
      addToast({
        type: "success",
        title: "Comment Flagged",
        message: "The comment has been flagged for review",
      });
      fetchComments();
      fetchStats();
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to flag comment",
      });
    }
  };

  const handleUnflag = async (comment: Comment) => {
    try {
      await api.comments.unflag(comment.id);
      addToast({
        type: "success",
        title: "Comment Unflagged",
        message: "The comment has been unflagged",
      });
      fetchComments();
      fetchStats();
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to unflag comment",
      });
    }
  };

  const handleHide = async (comment: Comment) => {
    try {
      await api.comments.hide(comment.id);
      addToast({
        type: "success",
        title: "Comment Hidden",
        message: "The comment has been hidden from public view",
      });
      fetchComments();
      fetchStats();
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to hide comment",
      });
    }
  };

  const handleUnhide = async (comment: Comment) => {
    try {
      await api.comments.unhide(comment.id);
      addToast({
        type: "success",
        title: "Comment Restored",
        message: "The comment is now visible again",
      });
      fetchComments();
      fetchStats();
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to unhide comment",
      });
    }
  };

  const handleDelete = async (comment: Comment) => {
    try {
      await api.comments.delete(comment.id);
      addToast({
        type: "success",
        title: "Comment Deleted",
        message: "The comment has been permanently deleted",
      });
      fetchComments();
      fetchStats();
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to delete comment",
      });
    }
  };

  const handleViewProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const profile = await api.userProfiles.getById(userId);
      return profile;
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to fetch user profile",
      });
      return null;
    }
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Comments Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            View, flag, hide, and manage all video comments
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fetchComments()}
          >
            <Icons.RefreshCw size={16} className="mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-slate-900">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Total Comments
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                  {formatNumber(stats.total)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Icons.MessageCircle size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Active Comments
                </p>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {formatNumber(stats.active)}
                </p>
              </div>
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                <Icons.CheckCircle size={24} className="text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Flagged Comments
                </p>
                <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                  {formatNumber(stats.flagged)}
                </p>
              </div>
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                <Icons.Flag size={24} className="text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Hidden Comments
                </p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-1">
                  {formatNumber(stats.hidden)}
                </p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                <Icons.EyeOff size={24} className="text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => {
            setStatusFilter("all");
            setPage(1);
          }}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition",
            statusFilter === "all"
              ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
              : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
          )}
        >
          All ({formatNumber(stats.total)})
        </button>
        <button
          onClick={() => {
            setStatusFilter("active");
            setPage(1);
          }}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition",
            statusFilter === "active"
              ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
              : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
          )}
        >
          <Icons.CheckCircle size={16} className="inline mr-2" />
          Active ({formatNumber(stats.active)})
        </button>
        <button
          onClick={() => {
            setStatusFilter("flagged");
            setPage(1);
          }}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition",
            statusFilter === "flagged"
              ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
              : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
          )}
        >
          <Icons.Flag size={16} className="inline mr-2" />
          Flagged ({formatNumber(stats.flagged)})
        </button>
        <button
          onClick={() => {
            setStatusFilter("hidden");
            setPage(1);
          }}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition",
            statusFilter === "hidden"
              ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
              : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
          )}
        >
          <Icons.EyeOff size={16} className="inline mr-2" />
          Hidden ({formatNumber(stats.hidden)})
        </button>
      </div>

      {/* Comments Table */}
      {isLoading ? (
        <SkeletonTable rows={5} cols={7} />
      ) : (
        <CommentTable
          comments={comments}
          isLoading={isLoading}
          onFlag={handleFlag}
          onUnflag={handleUnflag}
          onHide={handleHide}
          onUnhide={handleUnhide}
          onDelete={handleDelete}
          onViewProfile={handleViewProfile}
        />
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <Icons.ChevronLeft size={16} />
              Previous
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
              <Icons.ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
