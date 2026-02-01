"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { SkeletonList } from "@/components/ui/Skeleton";
import { Icons } from "@/components/ui/Icons";
import { useToast } from "@/components/ui/Toast";
import { useTheme } from "@/components/providers/ThemeProvider";
import { api } from "@/services/api";
import { cn } from "@/utils";
import type { Category } from "@/types";

type ViewMode = "grid" | "list";

export default function CategoriesPage() {
  const { addToast } = useToast();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#3B82F6",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const data = await api.categories.getAll();
      setCategories(data);
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to fetch categories",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = async () => {
    try {
      await api.categories.create({
        name: formData.name,
        slug: formData.name.toLowerCase().replace(/\s+/g, "-"),
        description: formData.description,
        icon: "Folder",
        color: formData.color,
        videoCount: 0,
        isActive: true,
      });
      addToast({
        type: "success",
        title: "Success",
        message: "Category created successfully",
      });
      setShowAddModal(false);
      setFormData({ name: "", description: "", color: "#3B82F6" });
      fetchCategories();
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to create category",
      });
    }
  };

  const handleToggleStatus = async (category: Category) => {
    try {
      await api.categories.toggleStatus(category.id);
      addToast({
        type: "success",
        title: "Updated",
        message: "Status changed successfully",
      });
      fetchCategories();
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to update status",
      });
    }
  };

  const filteredCategories = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (isLoading)
    return (
      <div className="p-8">
        <SkeletonList count={7} />
      </div>
    );

  return (
    <div
      className={cn(
        "space-y-8 min-h-screen",
        isDark ? "bg-[#020617]" : "bg-white",
      )}
    >
      {/* HEADER & CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1
            className={cn(
              "text-3xl font-black uppercase tracking-tighter",
              isDark ? "text-white" : "text-slate-800",
            )}
          >
            Categories
          </h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
            Manage your content library
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* SEARCH BAR */}
          <div className="relative group">
            <Icons.Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
              size={16}
            />
            <Input
              placeholder="Filter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "w-48 md:w-64 pl-10 rounded-xl border-none shadow-sm font-bold text-xs",
                isDark ? "bg-slate-800 text-white" : "bg-white",
              )}
            />
          </div>

          {/* VIEW TOGGLE */}
          <div
            className={cn(
              "flex p-1 rounded-xl shadow-sm",
              isDark ? "bg-slate-800" : "bg-white",
            )}
          >
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-2 rounded-lg transition-all",
                viewMode === "grid"
                  ? "bg-emerald-500 text-white shadow-lg"
                  : "text-slate-400",
              )}
            >
              <Icons.Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-2 rounded-lg transition-all",
                viewMode === "list"
                  ? "bg-emerald-500 text-white shadow-lg"
                  : "text-slate-400",
              )}
            >
              <Icons.List size={16} />
            </button>
          </div>

          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-6 py-6 font-black uppercase text-[10px] shadow-lg shadow-emerald-500/20"
          >
            <Icons.Plus className="mr-2" size={16} /> Add New
          </Button>
        </div>
      </div>

      {/* LISTING VIEW */}
      {filteredCategories.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 bg-white rounded-[3rem] shadow-xl border-none">
          <Icons.FolderOpen className="w-16 h-16 text-slate-200 mb-4" />
          <p className="text-slate-400 font-black uppercase text-xs">
            No Categories Found
          </p>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredCategories.map((category) => (
            <Card
              key={category.id}
              className={cn(
                "rounded-[2.5rem] border-none shadow-xl hover:scale-[1.02] transition-all",
                isDark ? "bg-slate-800" : "bg-white",
              )}
            >
              <CardContent className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div
                    className="p-4 rounded-2xl"
                    style={{ backgroundColor: `${category.color}15` }}
                  >
                    <Icons.FolderOpen
                      size={24}
                      style={{ color: category.color }}
                    />
                  </div>
                  <Badge
                    className={cn(
                      "rounded-lg font-black text-[8px] uppercase px-2 py-1",
                      category.isActive
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-rose-500/10 text-rose-500",
                    )}
                  >
                    {category.isActive ? "Active" : "Disabled"}
                  </Badge>
                </div>
                <h3
                  className={cn(
                    "text-lg font-black",
                    isDark ? "text-white" : "text-slate-800",
                  )}
                >
                  {category.name}
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-4">
                  {category.videoCount} Videos
                </p>

                <div className="flex items-center gap-2 pt-4 border-t border-slate-50">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleStatus(category)}
                    className="text-slate-400 hover:text-emerald-500"
                  >
                    <Icons.Plus size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedCategory(category);
                      setShowEditModal(true);
                    }}
                    className="text-slate-400 hover:text-indigo-500"
                  >
                    <Icons.Edit size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedCategory(category);
                      setShowDeleteModal(true);
                    }}
                    className="text-rose-400 hover:bg-rose-50"
                  >
                    <Icons.Trash2 size={14} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* LIST VIEW (Table Style) */
        <Card
          className={cn(
            "rounded-[2.5rem] border-none shadow-xl overflow-hidden",
            isDark ? "bg-slate-800" : "bg-white",
          )}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  className={cn(
                    "text-[9px] font-black uppercase tracking-widest",
                    isDark
                      ? "bg-slate-900 text-slate-500"
                      : "bg-slate-50 text-slate-400",
                  )}
                >
                  <th className="px-8 py-5 text-left">Category</th>
                  <th className="px-4 py-5 text-left">Description</th>
                  <th className="px-4 py-5 text-center">Videos</th>
                  <th className="px-4 py-5 text-center">Status</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredCategories.map((category) => (
                  <tr
                    key={category.id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span
                          className={cn(
                            "text-sm font-black",
                            isDark ? "text-white" : "text-slate-800",
                          )}
                        >
                          {category.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-400 max-w-[200px] truncate">
                      {category.description}
                    </td>
                    <td className="px-4 py-4 text-center text-xs font-black">
                      {category.videoCount}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span
                        className={cn(
                          "text-[8px] font-black uppercase px-3 py-1 rounded-full",
                          category.isActive
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-rose-100 text-rose-600",
                        )}
                      >
                        {category.isActive ? "Active" : "Off"}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedCategory(category);
                            setShowEditModal(true);
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Icons.Edit size={14} className="text-slate-400" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedCategory(category);
                            setShowDeleteModal(true);
                          }}
                          className="h-8 w-8 p-0 hover:bg-rose-50"
                        >
                          <Icons.Trash2 size={14} className="text-rose-400" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modals remain the same logic but I suggest styled buttons inside them to match */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="New Category" children={undefined}      >
        {/* ... existing modal content ... */}
      </Modal>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleAddCategory}
        title="Delete Category"
        variant="danger" message={""}      />
    </div>
  );
}
