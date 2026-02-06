"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfirmModal } from "@/components/ui/Modal";
import { SkeletonList } from "@/components/ui/Skeleton";
import { FeaturedTable } from "@/components/Tables/FeaturedTable";
import { Icons } from "@/components/ui/Icons";
import { useToast } from "@/components/ui/Toast";
import { useTheme } from "@/components/providers/ThemeProvider";
import { api } from "@/services/api";
import { cn, formatNumber, formatCurrency } from "@/utils";
import type { FeaturedCreator } from "@/types";

export default function FeaturedPage() {
  const { addToast } = useToast();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [featured, setFeatured] = useState<FeaturedCreator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [isMobile, setIsMobile] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false);

  // Color tokens for consistent theming
  const colors = {
    background: isDark ? "bg-[#020617]" : "bg-white",
    surface: "bg-[hsl(var(--surface))]",
    surfaceMuted: "bg-[hsl(var(--surface-muted))]",
    surfaceHover: "bg-[hsl(var(--surface-hover))]",
    surfaceBorder: "border-[hsl(var(--surface-border))]",
    textPrimary: "text-[hsl(var(--text-primary))]",
    textSecondary: "text-[hsl(var(--text-secondary))]",
    textMuted: "text-[hsl(var(--text-muted))]",
    primary: "bg-[hsl(var(--primary))]",
    success: "bg-[hsl(var(--success))]",
    successForeground: "text-[hsl(var(--success-foreground))]",
    successText: "text-[hsl(var(--success))]",
    dangerText: "text-[hsl(var(--danger))]",
  };

  const fetchFeatured = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.featured.getAll();
      setFeatured(data);
    } catch (error) {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to fetch featured creators",
      });
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchFeatured();
    
    // Detect if mobile (screen width < 640px)
    const checkIsMobile = () => {
      const mobile = window.innerWidth < 640;
      setIsMobile(mobile);
      setViewMode(mobile ? "grid" : "list");
    };
    
    // Initial check
    checkIsMobile();
    
    // Listen for window resize
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, [fetchFeatured]);

  const handleToggleStatus = async (id: string) => {
    try {
      await api.featured.toggleStatus(id);
      addToast({
        type: "success",
        title: "Success",
        message: "Status updated",
      });
      fetchFeatured();
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to update status",
      });
    }
  };

  const handleRemove = async () => {
    if (!selectedId) return;
    try {
      await api.featured.remove(selectedId);
      addToast({
        type: "success",
        title: "Success",
        message: "Creator removed",
      });
      setShowRemoveModal(false);
      setSelectedId(null);
      fetchFeatured();
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to remove creator",
      });
    }
  };

  const handleReorder = async (startIndex: number, endIndex: number) => {
    const items = Array.from(featured);
    const [removed] = items.splice(startIndex, 1);
    items.splice(endIndex, 0, removed);

    const updatedItems = items.map((item, index) => ({
      ...item,
      position: index + 1,
    }));

    try {
      setFeatured(updatedItems); // Optimistic update
      await api.featured.reorder(updatedItems);
      addToast({ type: "success", title: "Success", message: "Order updated" });
    } catch {
      addToast({ type: "error", title: "Error", message: "Failed to reorder" });
      fetchFeatured(); // Rollback
    }
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-6 min-h-screen p-8", colors.background)}>
        <SkeletonList count={5} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "space-y-8 min-h-screen font-sans transition-colors duration-300 p-4 sm:p-8",
        colors.background,
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2
            className={cn(
              "text-2xl sm:text-3xl font-black tracking-tighter",
              isDark ? "text-white" : "text-slate-800",
            )}
          >
            Featured Creators
          </h2>
          <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mt-1">
            Manage creators displayed on the homepage
          </p>
        </div>

        {/* View Mode Toggle - Hidden on mobile */}
        <div
          className={cn(
            "hidden sm:flex p-1 rounded-xl border",
            colors.surface,
            colors.surfaceBorder,
          )}
        >
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "p-2.5 rounded-lg transition-all",
              viewMode === "list"
                ? cn(colors.success, colors.successForeground, "shadow-lg")
                : colors.textSecondary,
            )}
          >
            <Icons.List size={18} />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "p-2.5 rounded-lg transition-all",
              viewMode === "grid"
                ? cn(colors.success, colors.successForeground, "shadow-lg")
                : colors.textSecondary,
            )}
          >
            <Icons.Grid size={18} />
          </button>
        </div>
      </div>

      {featured.length === 0 ? (
        <Card
          className={cn(
            "p-12 rounded-[3rem] border-none shadow-xl text-center",
            isDark ? "bg-slate-800" : "bg-white",
          )}
        >
          <CardContent>
            <Icons.Star
              className={cn(
                "mx-auto h-16 w-16 mb-4",
                isDark ? "text-slate-600" : "text-slate-300",
              )}
            />
            <p
              className={cn(
                "text-lg font-medium mb-4",
                isDark ? "text-slate-400" : "text-slate-500",
              )}
            >
              No featured creators
            </p>
            <Button className="bg-emerald-500 hover:bg-emerald-600">
              <Icons.Plus size={18} className="mr-2" />
              Add Featured Creator
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === "list" ? (
        <FeaturedTable
          featured={featured}
          isLoading={isLoading}
          onReorder={handleReorder}
          onRemove={(id) => {
            setSelectedId(id);
            setShowRemoveModal(true);
          }}
        />
      ) : (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {featured.map((item, index) => (
            <Card
              key={item.id}
              className={cn(
                "rounded-2xl border transition-all duration-300 hover:shadow-lg",
                colors.surfaceBorder,
                colors.surface,
              )}
            >
              <CardContent className="p-3 sm:p-5">
                <div className="flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <span
                        className={cn(
                          "text-lg sm:text-2xl font-black flex-shrink-0",
                          isDark ? "text-amber-500/30" : "text-amber-200",
                        )}
                      >
                        #{index + 1}
                      </span>
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        {item.creator.avatar ? (
                          <img
                            src={item.creator.avatar}
                            alt="Avatar"
                            className="w-10 h-10 rounded-xl object-cover"
                          />
                        ) : (
                          <div
                            className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center",
                              colors.surfaceMuted,
                            )}
                          >
                            <Icons.User
                              className={
                                isDark ? "text-amber-400" : "text-amber-500"
                              }
                            />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p
                            className={cn(
                              "text-sm font-semibold truncate",
                              colors.textPrimary,
                            )}
                          >
                            {item.creator.firstName} {item.creator.lastName}
                          </p>
                          <p
                            className={cn(
                              "text-xs font-medium uppercase tracking-wider truncate",
                              colors.textMuted,
                            )}
                          >
                            {item.creator.channelName}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Badge variant={item.isActive ? "success" : "danger"} className="flex-shrink-0">
                      {item.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  <div
                    className={cn("mt-3 h-px w-full", colors.surfaceBorder)}
                  />

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div
                      className={cn(
                        "rounded-lg p-2 sm:p-3",
                        isDark ? "bg-white/5" : "bg-slate-50",
                      )}
                    >
                      <p
                        className={cn(
                          "text-[10px] sm:text-xs font-medium uppercase tracking-wider",
                          colors.textMuted,
                        )}
                      >
                        Videos
                      </p>
                      <p
                        className={cn(
                          "text-sm sm:text-base font-bold",
                          colors.textPrimary,
                        )}
                      >
                        {formatNumber(item.creator.totalVideos)}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "rounded-lg p-2 sm:p-3",
                        colors.success,
                        "bg-opacity-10",
                      )}
                    >
                      <p
                        className={cn(
                          "text-[10px] sm:text-xs font-medium uppercase tracking-wider",
                          isDark ? "text-white" : "text-white sm:" + colors.successText.replace("text-", ""),
                        )}
                      >
                        Earnings
                      </p>
                      <p
                        className={cn(
                          "text-sm sm:text-base font-bold",
                          isDark ? "text-white" : "text-white sm:text-emerald-600 dark:text-emerald-400",
                        )}
                      >
                        {formatCurrency(item.creator.totalEarnings)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span
                      className={cn(
                        "text-xs font-medium uppercase",
                        colors.textMuted,
                      )}
                    >
                      {item.creator.onlineStatus}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() =>
                          (window.location.href = `/creators?id=${item.creator.id}`)
                        }
                      >
                        <Icons.Eye size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleToggleStatus(item.id)}
                      >
                        {item.isActive ? (
                          <Icons.Lock size={14} />
                        ) : (
                          <Icons.Unlock size={14} />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-8 w-8 p-0 hover:bg-red-500/10",
                          colors.dangerText,
                        )}
                        onClick={() => {
                          setSelectedId(item.id);
                          setShowRemoveModal(true);
                        }}
                      >
                        <Icons.Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={showRemoveModal}
        onClose={() => setShowRemoveModal(false)}
        onConfirm={handleRemove}
        title="Remove from Featured"
        message="Are you sure you want to remove this creator from featured?"
        confirmText="Remove"
        variant="danger"
      />
    </div>
  );
}
