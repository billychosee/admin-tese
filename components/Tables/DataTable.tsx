"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
}

interface DataTableProps<T> {
  title: string;
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
  filterComponent?: React.ReactNode;
  exportButton?: React.ReactNode;
  emptyMessage?: string;
  itemsPerPage?: number;
}

export function DataTable<T extends { id: string }>({
  title,
  data,
  columns,
  isLoading,
  searchPlaceholder = "Search...",
  searchKeys = [],
  filterComponent,
  exportButton,
  emptyMessage = "No data found",
  itemsPerPage = 10,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    if (searchKeys.length === 0) return data;

    return data.filter((item) => {
      return searchKeys.some((key) => {
        const value = item[key];
        if (typeof value === "string") {
          return value.toLowerCase().includes(searchTerm.toLowerCase());
        }
        return false;
      });
    });
  }, [data, searchTerm, searchKeys]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const alignClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  return (
    <Card>
      <CardHeader>
        <div className="space-y-4">
          <div>
            <CardTitle>{title}</CardTitle>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-10"
              />
            </div>
            {filterComponent}
            {exportButton && (
              <Button variant="primary" size="sm">
                <Search size={16} />
                Export CSV
              </Button>
            )}
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
                  <tr className="border-b border-border">
                    {columns.map((column) => (
                      <th
                        key={column.key}
                        className={cn(
                          "text-left py-3 px-4 font-semibold text-sm",
                          alignClasses[column.align || "left"],
                          column.className,
                        )}
                      >
                        {column.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={columns.length}
                        className="text-center py-8 text-muted-foreground"
                      >
                        {emptyMessage}
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-border hover:bg-secondary/30 transition"
                      >
                        {columns.map((column) => (
                          <td
                            key={column.key}
                            className={cn(
                              "py-4 px-4 text-sm",
                              alignClasses[column.align || "left"],
                              column.className,
                            )}
                          >
                            {column.render
                              ? column.render(item)
                              : (item as Record<string, unknown>)[
                                  column.key
                                ]?.toString() || "—"}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Showing{" "}
                  {Math.min(
                    (currentPage - 1) * itemsPerPage + 1,
                    filteredData.length,
                  )}{" "}
                  to {Math.min(currentPage * itemsPerPage, filteredData.length)}{" "}
                  of {filteredData.length} results
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft size={16} />
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
                    <ChevronRight size={16} />
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
