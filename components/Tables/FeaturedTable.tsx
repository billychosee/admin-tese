"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn, formatNumber, formatCurrency, getInitials } from "@/utils";
import { Icons } from "@/components/ui/Icons";
import type { FeaturedCreator } from "@/types";

interface FeaturedTableProps {
  featured: FeaturedCreator[];
  isLoading?: boolean;
  onToggleStatus: (id: string) => void;
  onReorder: (startIndex: number, endIndex: number) => void;
  onRemove: (id: string) => void;
}

export function FeaturedTable({
  featured,
  isLoading,
  onToggleStatus,
  onReorder,
  onRemove,
}: FeaturedTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const itemsPerPage = 10;

  const filteredFeatured = useMemo(() => {
    return featured.filter((item) => {
      const fullName = `${item.creator.firstName} ${item.creator.lastName}`.toLowerCase();
      return (
        fullName.includes(searchTerm.toLowerCase()) ||
        item.creator.channelName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [featured, searchTerm]);

  const totalPages = Math.ceil(filteredFeatured.length / itemsPerPage);
  const paginatedFeatured = filteredFeatured.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    // Make the drag image transparent except for the handle
    const img = new Image();
    img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    e.dataTransfer.setDragImage(img, 0, 0);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      onReorder(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <Card>
      <CardHeader>
        <div className="space-y-4">
          <div>
            <CardTitle>Featured Creators</CardTitle>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search featured creators..."
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
                      #
                    </th>
                    <th className="text-left py-4 px-4 font-bold text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50">
                      Creator
                    </th>
                    <th className="text-right py-4 px-4 font-bold text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50">
                      Videos
                    </th>
                    <th className="text-right py-4 px-4 font-bold text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50">
                      Earnings
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
                  {paginatedFeatured.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-500 dark:text-slate-400">
                        No featured creators found
                      </td>
                    </tr>
                  ) : (
                    paginatedFeatured.map((item, index) => (
                      <tr
                        key={item.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, index)}
                        onDragEnd={handleDragEnd}
                        className={cn(
                          "border-b border-slate-200 dark:border-slate-700 transition",
                          draggedIndex === index && "opacity-50",
                          dragOverIndex === index && "bg-emerald-50 dark:bg-emerald-900/20",
                          draggedIndex !== index && dragOverIndex !== index && "hover:bg-slate-100 dark:hover:bg-slate-800/70"
                        )}
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Icons.DragHandle
                              size={18}
                              className={cn(
                                "cursor-grab text-slate-400 hover:text-slate-600 dark:hover:text-slate-300",
                                draggedIndex === index && "text-emerald-500"
                              )}
                            />
                            <span className={cn(
                              "w-8 text-center font-black text-lg",
                              draggedIndex === index ? "text-emerald-500" : "text-slate-400"
                            )}>
                              {index + 1}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            {item.creator.avatar ? (
                              <img
                                src={item.creator.avatar}
                                alt={`${item.creator.firstName} ${item.creator.lastName}`}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="avatar avatar-md font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                                {getInitials(`${item.creator.firstName} ${item.creator.lastName}`)}
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                {item.creator.firstName} {item.creator.lastName}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                {item.creator.channelName}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right text-sm font-medium text-slate-600 dark:text-slate-300">
                          {formatNumber(item.creator.totalVideos)} videos
                        </td>
                        <td className="py-4 px-4 text-right text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(item.creator.totalEarnings)}
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant={item.isActive ? "success" : "danger"}>
                            {item.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onToggleStatus(item.id)}
                              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition"
                              title={item.isActive ? "Deactivate" : "Activate"}
                            >
                              {item.isActive ? (
                                <Icons.Lock size={16} />
                              ) : (
                                <Icons.Unlock size={16} />
                              )}
                            </button>
                            <button
                              onClick={() => onRemove(item.id)}
                              className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400 transition"
                              title="Remove"
                            >
                              <Icons.Trash2 size={16} />
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
                    filteredFeatured.length
                  )}{" "}
                  to{" "}
                  {Math.min(
                    currentPage * itemsPerPage,
                    filteredFeatured.length
                  )}{" "}
                  of {filteredFeatured.length} results
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
  );
}
