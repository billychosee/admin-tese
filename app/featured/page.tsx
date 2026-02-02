"use client";

import React, { useEffect, useState } from "react";
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
import { cn, formatNumber, formatCurrency, getInitials } from "@/utils";
import type { FeaturedCreator } from "@/types";

export default function FeaturedPage() {
  const { addToast } = useToast();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [featured, setFeatured] = useState<FeaturedCreator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false);

  useEffect(() => {
    fetchFeatured();
  }, []);

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

  const fetchFeatured = async () => {
    setIsLoading(true);
    try {
      const data = await api.featured.getAll();
      setFeatured(data);
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to fetch featured creators",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
        message: "Creator removed from featured",
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
      await api.featured.reorder(updatedItems);
      setFeatured(updatedItems);
      addToast({ type: "success", title: "Success", message: "Order updated" });
    } catch {
      addToast({ type: "error", title: "Error", message: "Failed to reorder" });
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
        <SkeletonList count={5} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "space-y-8 min-h-screen font-sans transition-colors duration-300",
        isDark ? "bg-[#020617]" : "bg-white",
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2
            className={cn(
              "text-3xl font-black tracking-tighter",
              isDark ? "text-white" : "text-slate-800",
            )}
          >
            Featured Creators
          </h2>
          <p
            className={cn(
              "text-xs font-bold text-emerald-500 uppercase tracking-widest mt-1",
            )}
          >
            Manage creators displayed on the homepage
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "p-3 rounded-2xl transition-all",
              viewMode === "list"
                ? isDark
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-emerald-100 text-emerald-600"
                : isDark
                  ? "bg-slate-800 text-slate-400 hover:text-slate-200"
                  : "bg-white text-slate-400 hover:text-slate-600",
            )}
          >
            <Icons.List size={18} />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "p-3 rounded-2xl transition-all",
              viewMode === "grid"
                ? isDark
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-emerald-100 text-emerald-600"
                : isDark
                  ? "bg-slate-800 text-slate-400 hover:text-slate-200"
                  : "bg-white text-slate-400 hover:text-slate-600",
            )}
          >
            <Icons.Grid size={18} />
          </button>
        </div>
      </div>

      {featured.length === 0 ? (
        <Card
          className={cn(
            "p-12 rounded-[3rem] border-none shadow-xl text-center transition-colors duration-300",
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
              <Icons.Plus size={18} />
              Add Featured Creator
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === "list" ? (
        <FeaturedTable
          featured={featured}
          isLoading={isLoading}
          onToggleStatus={handleToggleStatus}
          onRemove={(id) => {
            setSelectedId(id);
            setShowRemoveModal(true);
          }}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {featured.map((item, index) => (
            <Card
              key={item.id}
              hover
              className={cn(
                "rounded-2xl border transition-all duration-300",
                colors.surfaceBorder,
                colors.surface,
              )}
            >
              <CardContent className="p-5">
                <div className="flex flex-col">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "text-2xl font-black",
                          isDark ? "text-amber-500/30" : "text-amber-200",
                        )}
                      >
                        #{index + 1}
                      </span>
                      <div
                        className={cn(
                          "avatar font-bold text-xs",
                          isDark
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-amber-100 text-amber-600",
                        )}
                      >
                        {getInitials(`${item.creator.firstName} ${item.creator.lastName}`)}
                      </div>
                      <div>
                        <p
                          className={cn(
                            "text-sm font-semibold",
                            colors.textPrimary,
                          )}
                        >
                          {item.creator.firstName} {item.creator.lastName}
                        </p>
                        <p
                          className={cn(
                            "text-xs font-medium uppercase tracking-wider",
                            colors.textMuted,
                          )}
                        >
                          {item.creator.channelName}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={item.isActive ? "success" : "danger"}
                    >
                      {item.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div
                    className={cn(
                      "mt-4 h-px w-full",
                      colors.surfaceBorder,
                    )}
                  />
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div
                      className={cn(
                        "rounded-lg p-3 transition-colors duration-300",
                        isDark
                          ? "bg-[hsl(var(--surface-hover))]/50"
                          : "bg-[hsl(var(--surface-hover))]",
                      )}
                    >
                      <p
                        className={cn(
                          "text-xs font-medium uppercase tracking-wider",
                          colors.textMuted,
                        )}
                      >
                        Videos
                      </p>
                      <p
                        className={cn(
                          "text-base font-bold",
                          colors.textPrimary,
                        )}
                      >
                        {formatNumber(item.creator.totalVideos)}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "rounded-lg p-3 transition-colors duration-300",
                        isDark
                          ? "bg-[hsl(var(--success))]/10"
                          : "bg-[hsl(var(--success))]/10",
                      )}
                    >
                      <p
                        className={cn(
                          "text-xs font-medium uppercase tracking-wider",
                          colors.successText,
                        )}
                      >
                        Earnings
                      </p>
                      <p
                        className={cn(
                          "text-base font-bold",
                          colors.successText,
                        )}
                      >
                        {formatCurrency(item.creator.totalEarnings)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-xs font-medium uppercase tracking-wider",
                          colors.textMuted,
                        )}
                      >
                        {item.creator.onlineStatus}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-8 w-8 p-0 transition-colors duration-300",
                          isDark
                            ? `${colors.textSecondary} hover:${colors.textPrimary} hover:${colors.surfaceHover}`
                            : "",
                        )}
                        onClick={() => window.location.href = `/creators?id=${item.creator.id}`}
                      >
                        <Icons.Eye size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-8 w-8 p-0 transition-colors duration-300",
                          isDark
                            ? `${colors.textSecondary} hover:${colors.textPrimary} hover:${colors.surfaceHover}`
                            : "",
                        )}
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
                          "h-8 w-8 p-0 transition-colors duration-300",
                          "hover:bg-[hsl(var(--danger)/0.1)]",
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
