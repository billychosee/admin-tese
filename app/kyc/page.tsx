"use client";

import React, { useEffect, useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/services/api";
import { cn } from "@/utils";
import { KYCTable } from "@/components/Tables/KYCTable";
import type { Creator } from "@/types";

export default function KYCCreatorsPage() {
  const { addToast } = useToast();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCreators();
  }, [page]);

  const fetchCreators = async () => {
    setIsLoading(true);
    try {
      const result = await api.creators.getAll(
        page,
        10,
        undefined,
        ["pending", "pending_approval"]
      );
      setCreators(result.data);
      setTotalPages(result.totalPages);
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to fetch creators",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (creator: Creator) => {
    try {
      await api.creators.approve(creator.id);
      addToast({
        type: "success",
        title: "Success",
        message: `${creator.creatorFullName} KYC approved successfully`,
      });
      fetchCreators();
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to approve KYC",
      });
    }
  };

  const handleReject = async (creator: Creator) => {
    try {
      await api.creators.reject(creator.id);
      addToast({
        type: "success",
        title: "Success",
        message: `${creator.creatorFullName} KYC rejected`,
      });
      fetchCreators();
    } catch {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to reject KYC",
      });
    }
  };

  return (
    <div
      className={cn(
        "space-y-6 min-h-screen font-sans transition-colors duration-300 px-4 sm:px-6 lg:px-8 bg-[hsl(var(--background))]"
      )}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter text-[hsl(var(--text-primary))]">
            KYC Verification
          </h1>
          <p className="text-xs sm:text-sm font-normal tracking-widest mt-1 text-[hsl(var(--text-muted))]">
            Review creator identity verification
          </p>
        </div>
      </div>

      {/* KYC Table */}
      <KYCTable
        creators={creators}
        isLoading={isLoading}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}
