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
  onRemove: (id: string) => void;
}

export function FeaturedTable({
  featured,
  isLoading,
  onToggleStatus,
  onRemove,
}: FeaturedTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredFeatured = useMemo(() => {
    return featured.filter((item) =>
      item.creator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.creator.channelName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [featured, searchTerm]);

  const totalPages = Math.ceil(filteredFeatured.length / itemsPerPage);
  const paginatedFeatured = filteredFeatured.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 font-semibold text-sm text-slate-500 dark:text-slate-400">
                      #
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-slate-500 dark:text-slate-400">
                      Creator
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-sm text-slate-500 dark:text-slate-400">
                      Videos
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-sm text-slate-500 dark:text-slate-400">
                      Earnings
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-slate-500 dark:text-slate-400">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-slate-500 dark:text-slate-400">
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
                        className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Icons.DragHandle size={18} className="cursor-grab text-slate-400" />
                            <span className="w-8 text-center font-black text-lg text-slate-400">
                              {index + 1}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="avatar avatar-md font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                              {getInitials(item.creator.name)}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                {item.creator.name}
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
                          <Badge
                            variant={item.isActive ? "success" : "danger"}
                            className="flex items-center gap-1.5"
                          >
                            <span
                              className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                item.isActive
                                  ? "bg-current"
                                  : "bg-current",
                              )}
                            />
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
