"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfirmModal } from "@/components/ui/Modal";
import { SkeletonList } from "@/components/ui/Skeleton";
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
        <Card
          className={cn(
            "rounded-[3rem] border-none shadow-xl overflow-hidden transition-colors duration-300",
            isDark ? "bg-slate-800" : "bg-white",
          )}
        >
          <div
            className={cn(
              "p-6 divide-y",
              isDark ? "divide-slate-700" : "divide-slate-100",
            )}
          >
            {featured.map((item, index) => (
              <div
                key={item.id}
                className={cn(
                  "flex items-center gap-4 py-4",
                  isDark ? "hover:bg-slate-700/50" : "hover:bg-slate-50",
                )}
              >
                <div
                  className={cn(
                    "flex items-center gap-2 px-2",
                    isDark ? "text-slate-500" : "text-slate-400",
                  )}
                >
                  <Icons.DragHandle size={18} className="cursor-grab" />
                  <span
                    className={cn(
                      "w-8 text-center font-black text-lg",
                      isDark ? "text-slate-600" : "text-slate-300",
                    )}
                  >
                    {index + 1}
                  </span>
                </div>
                <div
                  className={cn(
                    "avatar avatar-md font-bold",
                    isDark
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-amber-100 text-amber-600",
                  )}
                >
                  {getInitials(item.creator.name)}
                </div>
                <div className="flex-1">
                  <p
                    className={cn(
                      "font-black",
                      isDark ? "text-white" : "text-slate-800",
                    )}
                  >
                    {item.creator.name}
                  </p>
                  <p
                    className={cn(
                      "text-xs font-bold uppercase tracking-wider",
                      isDark ? "text-slate-500" : "text-slate-400",
                    )}
                  >
                    {item.creator.channelName}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      isDark ? "text-slate-300" : "text-slate-600",
                    )}
                  >
                    {formatNumber(item.creator.totalVideos)} videos
                  </p>
                  <p
                    className={cn(
                      "text-sm font-bold",
                      isDark ? "text-emerald-400" : "text-emerald-600",
                    )}
                  >
                    {formatCurrency(item.creator.totalEarnings)}
                  </p>
                </div>
                <Badge variant={item.isActive ? "success" : "danger"}>
                  {item.isActive ? "Active" : "Inactive"}
                </Badge>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleStatus(item.id)}
                    className={cn(
                      "p-2 rounded-xl transition-all",
                      isDark
                        ? "hover:bg-slate-700 text-slate-400 hover:text-slate-200"
                        : "hover:bg-slate-100 text-slate-400 hover:text-slate-600",
                    )}
                  >
                    {item.isActive ? (
                      <Icons.Lock size={16} />
                    ) : (
                      <Icons.Unlock size={16} />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedId(item.id);
                      setShowRemoveModal(true);
                    }}
                    className="p-2 rounded-xl hover:bg-red-500/10 text-red-400 transition-all"
                  >
                    <Icons.Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((item, index) => (
            <Card
              key={item.id}
              hover
              className={cn(
                "rounded-[3rem] border-none shadow-xl transition-all duration-300",
                isDark ? "bg-slate-800" : "bg-white",
              )}
            >
              <CardContent className="pt-8 pb-8">
                <div className="flex items-center gap-4 mb-6">
                  <span
                    className={cn(
                      "text-3xl font-black",
                      isDark ? "text-amber-500/30" : "text-amber-200",
                    )}
                  >
                    #{index + 1}
                  </span>
                  <div
                    className={cn(
                      "avatar avatar-lg font-bold",
                      isDark
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-amber-100 text-amber-600",
                    )}
                  >
                    {getInitials(item.creator.name)}
                  </div>
                  <div className="flex-1">
                    <p
                      className={cn(
                        "font-black",
                        isDark ? "text-white" : "text-slate-800",
                      )}
                    >
                      {item.creator.name}
                    </p>
                    <p
                      className={cn(
                        "text-xs font-bold uppercase tracking-wider",
                        isDark ? "text-slate-500" : "text-slate-400",
                      )}
                    >
                      {item.creator.channelName}
                    </p>
                  </div>
                </div>
                <div
                  className={cn(
                    "grid grid-cols-2 gap-4 mb-6 p-4 rounded-2xl",
                    isDark ? "bg-slate-700/50" : "bg-slate-50",
                  )}
                >
                  <div>
                    <p
                      className={cn(
                        "text-[10px] font-black uppercase tracking-widest mb-1",
                        isDark ? "text-slate-500" : "text-slate-400",
                      )}
                    >
                      Videos
                    </p>
                    <p
                      className={cn(
                        "text-xl font-black",
                        isDark ? "text-white" : "text-slate-800",
                      )}
                    >
                      {formatNumber(item.creator.totalVideos)}
                    </p>
                  </div>
                  <div>
                    <p
                      className={cn(
                        "text-[10px] font-black uppercase tracking-widest mb-1",
                        isDark ? "text-slate-500" : "text-slate-400",
                      )}
                    >
                      Earnings
                    </p>
                    <p
                      className={cn(
                        "text-xl font-black",
                        isDark ? "text-emerald-400" : "text-emerald-600",
                      )}
                    >
                      {formatCurrency(item.creator.totalEarnings)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={item.isActive ? "success" : "danger"}
                    className="flex-1 justify-center"
                  >
                    {item.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={
                      isDark
                        ? "text-slate-400 hover:text-slate-200 hover:bg-slate-700"
                        : ""
                    }
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
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    onClick={() => {
                      setSelectedId(item.id);
                      setShowRemoveModal(true);
                    }}
                  >
                    <Icons.Trash2 size={14} />
                  </Button>
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
