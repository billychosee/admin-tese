"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { SkeletonList } from "@/components/ui/Skeleton";
import { CategoryTable } from "@/components/Tables/CategoryTable";
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
    bannerUrl: "",
  });

  useEffect(() => {
    fetchCategories();
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
        bannerUrl: formData.bannerUrl || undefined,
        videoCount: 0,
        isActive: true,
      });
      addToast({
        type: "success",
        title: "Success",
        message: "Category created successfully",
      });
      setShowAddModal(false);
      setFormData({
        name: "",
        description: "",
        color: "#3B82F6",
        bannerUrl: "",
      });
      fetchCategories();
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to create category",
      });
    }
  };

  const handleUpdateCategory = async () => {
    if (!selectedCategory) return;
    try {
      await api.categories.update(selectedCategory.id, {
        name: formData.name || selectedCategory.name,
        slug: (formData.name || selectedCategory.name)
          .toLowerCase()
          .replace(/\s+/g, "-"),
        description: formData.description || selectedCategory.description,
        icon: "Folder",
        color: formData.color || selectedCategory.color,
        bannerUrl: formData.bannerUrl || selectedCategory.bannerUrl,
        isActive: selectedCategory.isActive,
      });
      addToast({
        type: "success",
        title: "Success",
        message: "Category updated successfully",
      });
      setShowEditModal(false);
      setSelectedCategory(null);
      setFormData({
        name: "",
        description: "",
        color: "#3B82F6",
        bannerUrl: "",
      });
      fetchCategories();
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to update category",
      });
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;
    try {
      await api.categories.delete(selectedCategory.id);
      addToast({
        type: "success",
        title: "Success",
        message: "Category deleted successfully",
      });
      setShowDeleteModal(false);
      setSelectedCategory(null);
      fetchCategories();
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to delete category",
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
    <div className="space-y-8 min-h-screen">
      {/* HEADER & CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-[hsl(var(--text-primary))]">
            Categories
          </h1>
          <p className="text-xs font-bold uppercase tracking-widest mt-1 text-[hsl(var(--text-muted))]">
            Manage your content library
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* SEARCH BAR */}
          <div className="relative group">
            <Icons.Search
              className="absolute left-3 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: "hsl(var(--text-muted))" }}
              size={16}
            />
            <Input
              placeholder="Filter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 md:w-64 pl-10 rounded-xl font-bold text-xs"
            />
          </div>

          {/* VIEW TOGGLE */}
          <div
            className="flex p-1 rounded-xl border"
            style={{
              backgroundColor: "hsl(var(--surface))",
              borderColor: "hsl(var(--surface-border))",
            }}
          >
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-2 rounded-lg transition-all",
                viewMode === "grid" ? "text-white shadow-lg" : "",
              )}
              style={{
                backgroundColor:
                  viewMode === "grid" ? "hsl(var(--primary))" : "transparent",
                color:
                  viewMode === "grid"
                    ? "hsl(var(--primary-foreground))"
                    : "hsl(var(--text-secondary))",
              }}
            >
              <Icons.Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-2 rounded-lg transition-all",
                viewMode === "list" ? "text-white shadow-lg" : "",
              )}
              style={{
                backgroundColor:
                  viewMode === "list" ? "hsl(var(--primary))" : "transparent",
                color:
                  viewMode === "list"
                    ? "hsl(var(--primary-foreground))"
                    : "hsl(var(--text-secondary))",
              }}
            >
              <Icons.List size={16} />
            </button>
          </div>

          <Button
            onClick={() => setShowAddModal(true)}
            size="lg"
            className="rounded-xl font-black uppercase text-[10px]"
          >
            <Icons.Plus className="mr-2" size={16} /> Add New
          </Button>
        </div>
      </div>

      {/* LISTING VIEW */}
      {filteredCategories.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center p-20 rounded-[3rem] shadow-xl"
          style={{ backgroundColor: "hsl(var(--surface))" }}
        >
          <Icons.FolderOpen
            className="w-16 h-16 mb-4"
            style={{ color: "hsl(var(--text-muted))" }}
          />
          <p
            className="font-black uppercase text-xs"
            style={{ color: "hsl(var(--text-muted))" }}
          >
            No Categories Found
          </p>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredCategories.map((category) => (
            <Card
              key={category.id}
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
                      <div
                        className="p-3 rounded-xl"
                        style={{ backgroundColor: `${category.color}15` }}
                      >
                        <Icons.FolderOpen
                          size={20}
                          style={{ color: category.color }}
                        />
                      </div>
                      <div>
                        <h3
                          className={cn(
                            "text-sm font-semibold",
                            colors.textPrimary,
                          )}
                        >
                          {category.name}
                        </h3>
                        <p
                          className={cn(
                            "text-xs font-medium uppercase tracking-wider",
                            colors.textMuted,
                          )}
                        >
                          {category.videoCount} Videos
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={cn(
                        "rounded-lg font-black text-[8px] uppercase px-2 py-1",
                      )}
                      style={{
                        backgroundColor: `${category.color}20`,
                        color: category.color,
                        border: `1px solid ${category.color}40`,
                      }}
                    >
                      {category.videoCount} Videos
                    </Badge>
                  </div>
                  {/* Category Banner Image */}
                  <div
                    className={cn("mt-4 h-24 -mx-5 rounded-t-2xl overflow-hidden")}
                  >
                    {category.bannerUrl ? (
                      <img
                        src={category.bannerUrl}
                        alt={category.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                          (e.target as HTMLImageElement).parentElement!.style.background = `linear-gradient(135deg, ${category.color}40 0%, ${category.color}10 100%)`;
                        }}
                      />
                    ) : (
                      <div
                        className="w-full h-full"
                        style={{
                          background: `linear-gradient(135deg, ${category.color}40 0%, ${category.color}10 100%)`,
                        }}
                      />
                    )}
                  </div>
                  <div
                    className={cn("mt-0 h-px w-full", colors.surfaceBorder)}
                  />
                  <div className="mt-4 flex items-center justify-between">
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
                        onClick={() => {
                          setSelectedCategory(category);
                          setFormData({
                            name: category.name,
                            description: category.description,
                            color: category.color,
                            bannerUrl: category.bannerUrl || "",
                          });
                          setShowEditModal(true);
                        }}
                      >
                        <Icons.Edit size={14} />
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
                          setSelectedCategory(category);
                          setShowDeleteModal(true);
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
      ) : (
        <CategoryTable
          categories={filteredCategories}
          isLoading={isLoading}
          onEdit={(category) => {
            setSelectedCategory(category);
            setFormData({
              name: category.name,
              description: category.description,
              color: category.color,
              bannerUrl: category.bannerUrl || "",
            });
            setShowEditModal(true);
          }}
          onDelete={(category) => {
            setSelectedCategory(category);
            setShowDeleteModal(true);
          }}
        />
      )}

      {/* Add Category Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setFormData({
            name: "",
            description: "",
            color: "#3B82F6",
            bannerUrl: "",
          });
        }}
        title="Add New Category"
        size="md"
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <label
              className="text-[10px] font-black uppercase tracking-wider"
              style={{ color: "hsl(var(--text-secondary))" }}
            >
              Category Name
            </label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter category name"
              className="rounded-xl font-medium"
            />
          </div>
          <div className="space-y-2">
            <label
              className="text-[10px] font-black uppercase tracking-wider"
              style={{ color: "hsl(var(--text-secondary))" }}
            >
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Enter category description"
              className="w-full rounded-xl p-4 text-sm outline-none transition-all min-h-[100px]"
              style={{
                backgroundColor: "hsl(var(--surface))",
                border: "1px solid hsl(var(--surface-border))",
                color: "hsl(var(--text-primary))",
              }}
            />
          </div>
          <div className="space-y-2">
            <label
              className="text-[10px] font-black uppercase tracking-wider"
              style={{ color: "hsl(var(--text-secondary))" }}
            >
              Banner Image
            </label>
            <div
              className={cn(
                "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors",
                colors.surfaceBorder,
                colors.surfaceHover,
              )}
              onClick={() =>
                document.getElementById("banner-upload-add")?.click()
              }
            >
              {formData.bannerUrl ? (
                <div className="relative">
                  <img
                    src={formData.bannerUrl}
                    alt="Banner preview"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData({ ...formData, bannerUrl: "" });
                    }}
                  >
                    <Icons.X size={14} />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Icons.Image
                    size={32}
                    className={cn("mb-2", colors.textMuted)}
                  />
                  <p
                    className={cn("text-xs font-medium", colors.textSecondary)}
                  >
                    Click to upload banner image
                  </p>
                  <p className={cn("text-[10px] mt-1", colors.textMuted)}>
                    PNG, JPG up to 5MB
                  </p>
                </div>
              )}
            </div>
            <input
              id="banner-upload-add"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    setFormData({
                      ...formData,
                      bannerUrl: event.target?.result as string,
                    });
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setShowAddModal(false);
                setFormData({
                  name: "",
                  description: "",
                  color: "#3B82F6",
                  bannerUrl: "",
                });
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddCategory}>Create Category</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Category Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedCategory(null);
          setFormData({
            name: "",
            description: "",
            color: "#3B82F6",
            bannerUrl: "",
          });
        }}
        title="Edit Category"
        size="md"
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <label
              className="text-[10px] font-black uppercase tracking-wider"
              style={{ color: "hsl(var(--text-secondary))" }}
            >
              Category Name
            </label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter category name"
              className="rounded-xl font-medium"
            />
          </div>
          <div className="space-y-2">
            <label
              className="text-[10px] font-black uppercase tracking-wider"
              style={{ color: "hsl(var(--text-secondary))" }}
            >
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Enter category description"
              className="w-full rounded-xl p-4 text-sm outline-none transition-all min-h-[100px]"
              style={{
                backgroundColor: "hsl(var(--surface))",
                border: "1px solid hsl(var(--surface-border))",
                color: "hsl(var(--text-primary))",
              }}
            />
          </div>
          <div className="space-y-2">
            <label
              className="text-[10px] font-black uppercase tracking-wider"
              style={{ color: "hsl(var(--text-secondary))" }}
            >
              Banner Image
            </label>
            <div
              className={cn(
                "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors",
                colors.surfaceBorder,
                colors.surfaceHover,
              )}
              onClick={() =>
                document.getElementById("banner-upload-edit")?.click()
              }
            >
              {formData.bannerUrl ? (
                <div className="relative">
                  <img
                    src={formData.bannerUrl}
                    alt="Banner preview"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData({ ...formData, bannerUrl: "" });
                    }}
                  >
                    <Icons.X size={14} />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Icons.Image
                    size={32}
                    className={cn("mb-2", colors.textMuted)}
                  />
                  <p
                    className={cn("text-xs font-medium", colors.textSecondary)}
                  >
                    Click to upload banner image
                  </p>
                  <p className={cn("text-[10px] mt-1", colors.textMuted)}>
                    PNG, JPG up to 5MB
                  </p>
                </div>
              )}
            </div>
            <input
              id="banner-upload-edit"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    setFormData({
                      ...formData,
                      bannerUrl: event.target?.result as string,
                    });
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setShowEditModal(false);
                setSelectedCategory(null);
                setFormData({
                  name: "",
                  description: "",
                  color: "#3B82F6",
                  bannerUrl: "",
                });
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateCategory}>Save Changes</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedCategory(null);
        }}
        onConfirm={handleDeleteCategory}
        title="Delete Category"
        message={`Are you sure you want to delete "${selectedCategory?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
