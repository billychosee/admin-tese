"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ConfirmModal } from "@/components/ui/Modal";
import { cn, formatNumber, formatCurrency, formatRelativeTime, getInitials, formatDate, exportToCSV } from "@/utils";
import { Icons } from "@/components/ui/Icons";
import type { Creator } from "@/types";
import { CREATOR_STATUSES } from "@/constants";

interface CreatorTableProps {
  creators: Creator[];
  isLoading?: boolean;
  onViewProfile: (creator: Creator) => void;
  onToggleStatus: (creator: Creator) => void;
  onDeactivateChannel?: (creator: Creator) => void;
  onPayout?: (creator: Creator) => void;
  onBan?: (creator: Creator, reason: string) => void;
  onUnban?: (creator: Creator) => void;
  onSendMessage?: (creator: Creator) => void;
  onViewEarnings?: (creator: Creator) => void;
  onViewAuditLog?: (creator: Creator) => void;
}

export function CreatorTable({
  creators,
  isLoading,
  onViewProfile,
  onToggleStatus,
  onDeactivateChannel,
  onPayout,
  onBan,
  onUnban,
  onSendMessage,
  onViewEarnings,
  onViewAuditLog,
}: CreatorTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [previewCreator, setPreviewCreator] = useState<Creator | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showEarningsModal, setShowEarningsModal] = useState(false);
  const [showAuditLogModal, setShowAuditLogModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [deactivationComment, setDeactivationComment] = useState("");
  const [banReason, setBanReason] = useState("");
  const [messageSubject, setMessageSubject] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [messageType, setMessageType] = useState<"general" | "warning" | "important" | "payout" | "kyc">("general");
  const [isExporting, setIsExporting] = useState(false);
  const itemsPerPage = 10;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const exportData = filteredCreators.map((creator) => ({
        id: creator.id,
        fullName: creator.creatorFullName,
        email: creator.email,
        channelName: creator.channelName,
        status: creator.status,
        onlineStatus: creator.onlineStatus,
        payoutType: creator.payoutType,
        totalVideos: creator.totalVideos,
        totalViews: creator.totalViews,
        totalLikes: creator.totalLikes,
        totalRevenue: creator.totalRevenue,
        currentBalance: creator.currentBalance,
        isCompany: creator.isCompany ? "Yes" : "No",
        companyName: creator.companyName || "",
        country: creator.country || "",
        createdAt: formatDate(creator.createdAt),
        kycStatus: creator.kycStatus,
      }));

      exportToCSV(exportData, `creators_export_${formatDate(new Date())}`, [
        { key: "id", header: "ID" },
        { key: "fullName", header: "Full Name" },
        { key: "email", header: "Email" },
        { key: "channelName", header: "Channel Name" },
        { key: "status", header: "Status" },
        { key: "onlineStatus", header: "Online Status" },
        { key: "payoutType", header: "Payout Type" },
        { key: "totalVideos", header: "Total Videos" },
        { key: "totalViews", header: "Total Views" },
        { key: "totalLikes", header: "Total Likes" },
        { key: "totalRevenue", header: "Total Revenue" },
        { key: "currentBalance", header: "Current Balance" },
        { key: "isCompany", header: "Is Company" },
        { key: "companyName", header: "Company Name" },
        { key: "country", header: "Country" },
        { key: "createdAt", header: "Created At" },
        { key: "kycStatus", header: "KYC Status" },
      ]);
    } finally {
      setIsExporting(false);
    }
  };

  const filteredCreators = useMemo(() => {
    return creators.filter((creator) => {
      const matchesSearch =
        creator.creatorFullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        creator.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        creator.channelName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter = statusFilter === "all" || creator.status === statusFilter;

      return matchesSearch && matchesFilter;
    });
  }, [creators, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredCreators.length / itemsPerPage);
  const paginatedCreators = filteredCreators.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const statusColors = {
    active: "bg-[hsl(var(--success)/0.2)] text-[hsl(var(--success))] dark:bg-[hsl(var(--success)/0.3)]",
    pending: "bg-[hsl(var(--warning)/0.2)] text-[hsl(var(--warning))] dark:bg-[hsl(var(--warning)/0.3)]",
    suspended: "bg-[hsl(var(--danger)/0.2)] text-[hsl(var(--danger))] dark:bg-[hsl(var(--danger)/0.3)]",
  };

  const onlineStatusColors = {
    online: "bg-[hsl(var(--success))]",
    away: "bg-[hsl(var(--warning))]",
    offline: "bg-[hsl(var(--text-muted))]",
  };

  const payoutTypeColors = {
    mobile_wallet: "bg-[hsl(var(--info)/0.2)] text-[hsl(var(--info))] dark:bg-[hsl(var(--info)/0.3)]",
    bank: "bg-[hsl(var(--primary)/0.2)] text-[hsl(var(--primary))] dark:bg-[hsl(var(--primary)/0.3)]",
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div>
              <CardTitle>Creators</CardTitle>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Search creators..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-10"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={isExporting || filteredCreators.length === 0}
                className="h-10"
              >
                <Icons.Download size={16} className="mr-2" />
                {isExporting ? "Exporting..." : "Export CSV"}
              </Button>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="appearance-none w-full px-4 py-2 pr-10 border border-[hsl(var(--surface-border))] rounded-lg text-sm bg-[hsl(var(--surface))] text-[hsl(var(--text-primary))] focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent transition-all duration-200 h-10 cursor-pointer"
                >
                  {CREATOR_STATUSES.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
                <Icons.ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--text-muted))] pointer-events-none" />
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
                    <tr className="border-b-2 border-[hsl(var(--surface-border))]">
                      <th className="text-left py-4 px-4 font-bold text-sm text-[hsl(var(--text-secondary))] bg-[hsl(var(--surface-muted))] dark:bg-[hsl(var(--surface-hover))]">
                        Creator
                      </th>
                      <th className="text-left py-4 px-4 font-bold text-sm text-[hsl(var(--text-secondary))] bg-[hsl(var(--surface-muted))] dark:bg-[hsl(var(--surface-hover))]">
                        Channel
                      </th>
                      <th className="text-left py-4 px-4 font-bold text-sm text-[hsl(var(--text-secondary))] bg-[hsl(var(--surface-muted))] dark:bg-[hsl(var(--surface-hover))]">
                        Status
                      </th>
                      <th className="text-left py-4 px-4 font-bold text-sm text-[hsl(var(--text-secondary))] bg-[hsl(var(--surface-muted))] dark:bg-[hsl(var(--surface-hover))]">
                        Online
                      </th>
                      <th className="text-left py-4 px-4 font-bold text-sm text-[hsl(var(--text-secondary))] bg-[hsl(var(--surface-muted))] dark:bg-[hsl(var(--surface-hover))]">
                        Payout Type
                      </th>
                      <th className="text-left py-4 px-4 font-bold text-sm text-[hsl(var(--text-secondary))] bg-[hsl(var(--surface-muted))] dark:bg-[hsl(var(--surface-hover))]">
                        Videos
                      </th>
                      <th className="text-left py-4 px-4 font-bold text-sm text-[hsl(var(--text-secondary))] bg-[hsl(var(--surface-muted))] dark:bg-[hsl(var(--surface-hover))]">
                        Revenue
                      </th>
                      <th className="text-left py-4 px-4 font-bold text-sm text-[hsl(var(--text-secondary))] bg-[hsl(var(--surface-muted))] dark:bg-[hsl(var(--surface-hover))]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCreators.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-8 text-[hsl(var(--text-muted))]">
                          No creators found
                        </td>
                      </tr>
                    ) : (
                      paginatedCreators.map((creator) => (
                        <tr
                          key={creator.id}
                          className="border-b border-[hsl(var(--surface-border))] hover:bg-[hsl(var(--surface-hover))] dark:hover:bg-[hsl(var(--surface-hover)/0.7)] transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="cursor-pointer"
                                onClick={() => setPreviewCreator(creator)}
                              >
                                {creator.avatar ? (
                                  <img
                                    src={creator.avatar}
                                    alt={creator.creatorFullName}
                                    className="w-10 h-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="avatar avatar-md font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                                    {getInitials(creator.creatorFullName)}
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                  {creator.creatorFullName}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  {creator.email}
                                </p>
                                {creator.isCompany && (
                                  <p className="text-xs text-blue-500 dark:text-blue-400">
                                    {creator.companyName}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm text-slate-600 dark:text-slate-300">
                            {creator.channelName}
                          </td>
                          <td className="py-4 px-4">
                            <Badge
                              variant={
                                creator.status === "active"
                                  ? "success"
                                  : creator.status === "pending"
                                    ? "warning"
                                    : "danger"
                              }
                            >
                              {creator.status}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "h-2.5 w-2.5 rounded-full",
                                  onlineStatusColors[creator.onlineStatus]
                                )}
                              />
                              <span className="text-sm capitalize text-slate-600 dark:text-slate-300">
                                {creator.onlineStatus}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge
                              variant={
                                creator.payoutType === "mobile_wallet"
                                  ? "info"
                                  : "neutral"
                              }
                            >
                              {creator.payoutType === "mobile_wallet" ? "Mobile Wallet" : "Bank"}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                            {formatNumber(creator.totalVideos)}
                          </td>
                          <td className="py-4 px-4 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(creator.totalRevenue)}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setPreviewCreator(creator)}
                                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition"
                                title="View profile"
                              >
                                <Icons.Eye size={16} />
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
                      filteredCreators.length
                    )}{" "}
                    to{" "}
                    {Math.min(
                      currentPage * itemsPerPage,
                      filteredCreators.length
                    )}{" "}
                    of {filteredCreators.length} results
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

      {/* Creator Profile Preview Modal */}
      <Modal
        isOpen={!!previewCreator}
        onClose={() => setPreviewCreator(null)}
        title="Creator Profile"
        size="xl"
      >
        {previewCreator && (
          <div className="space-y-6 max-h-[85vh] overflow-y-auto">
            {/* Profile Header */}
            <div className="flex items-center gap-6 pb-6 border-b border-slate-200 dark:border-slate-700">
              <div className="relative flex-shrink-0">
                {previewCreator.avatar ? (
                  <img
                    src={previewCreator.avatar}
                    alt={previewCreator.creatorFullName}
                    className="w-24 h-24 rounded-full object-cover shadow-lg cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => previewCreator.avatar && setImagePreview(previewCreator.avatar)}
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shadow-lg">
                    <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                      {getInitials(previewCreator.creatorFullName)}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {previewCreator.creatorFullName}
                  </h3>
                  <Badge
                    variant={
                      previewCreator.status === "active"
                        ? "success"
                        : previewCreator.status === "pending"
                          ? "warning"
                          : "danger"
                    }
                  >
                    {previewCreator.status}
                  </Badge>
                </div>
                <p className="text-lg text-slate-600 dark:text-slate-300 mb-2">
                  {previewCreator.channelName}
                </p>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "h-2 w-2 rounded-full",
                    onlineStatusColors[previewCreator.onlineStatus]
                  )} />
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {previewCreator.onlineStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatNumber(previewCreator.totalVideos)}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Videos</p>
              </div>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatNumber(previewCreator.totalViews)}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Views</p>
              </div>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(previewCreator.totalRevenue)}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Revenue</p>
              </div>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatNumber(previewCreator.totalLikes)}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Likes</p>
              </div>
            </div>

            {/* Financial Overview */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 text-center">
                <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-1">Total Revenue</p>
                <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                  {formatCurrency(previewCreator.totalRevenue)}
                </p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-center">
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Current Balance</p>
                <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
                  {formatCurrency(previewCreator.currentBalance)}
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4 text-center">
                <p className="text-sm text-purple-600 dark:text-purple-400 mb-1">Paid Out</p>
                <p className="text-xl font-bold text-purple-700 dark:text-purple-300">
                  {formatCurrency(previewCreator.totalPaidOut)}
                </p>
              </div>
            </div>

            {/* Company Information */}
            {previewCreator.isCompany && (
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Icons.Briefcase size={18} className="text-emerald-500" />
                  Company Information
                </h4>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Company Name</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {previewCreator.companyName || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">VAT Number</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {previewCreator.VAT || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">TIN Number</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {previewCreator.tinNumber || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Personal Information */}
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Icons.User size={18} className="text-emerald-500" />
                Personal Information
              </h4>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Full Name</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {previewCreator.creatorFullName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Email</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {previewCreator.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Mobile Number</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {previewCreator.mobileNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Payout Type</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs",
                        payoutTypeColors[previewCreator.payoutType]
                      )}>
                        {previewCreator.payoutType === "mobile_wallet" ? "Mobile Wallet" : "Bank"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Banking Details */}
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Icons.CreditCard size={18} className="text-emerald-500" />
                Payout Details
              </h4>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Bank Name</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {previewCreator.bankName || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Account Number</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {previewCreator.bankAccountNumber || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Images */}
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Icons.Shield size={18} className="text-emerald-500" />
                Verification Documents
              </h4>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                <div className="flex gap-4">
                  {/* Selfie */}
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 text-center">Selfie</p>
                    {previewCreator.selfie ? (
                      <button
                        onClick={() => previewCreator.selfie && setImagePreview(previewCreator.selfie)}
                        className="w-full group"
                      >
                        <div className="relative rounded-lg overflow-hidden aspect-[3/4] border-2 border-emerald-500">
                          <img
                            src={previewCreator.selfie}
                            alt="Selfie"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Icons.Eye size={20} className="text-white" />
                          </div>
                        </div>
                      </button>
                    ) : (
                      <div className="w-full aspect-[3/4] rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600">
                        <Icons.EyeOff size={24} className="text-slate-400" />
                      </div>
                    )}
                  </div>

                  {/* ID Image */}
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 text-center">ID</p>
                    {previewCreator.idImage ? (
                      <button
                        onClick={() => previewCreator.idImage && setImagePreview(previewCreator.idImage)}
                        className="w-full group"
                      >
                        <div className="relative rounded-lg overflow-hidden aspect-[3/4] border-2 border-blue-500">
                          <img
                            src={previewCreator.idImage}
                            alt="ID"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Icons.Eye size={20} className="text-white" />
                          </div>
                        </div>
                      </button>
                    ) : (
                      <div className="w-full aspect-[3/4] rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600">
                        <Icons.FileText size={24} className="text-slate-400" />
                      </div>
                    )}
                  </div>

                  {/* Proof of Residence */}
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 text-center">Proof</p>
                    {previewCreator.proofOfResidenceUrl ? (
                      <button
                        onClick={() => previewCreator.proofOfResidenceUrl && setImagePreview(previewCreator.proofOfResidenceUrl)}
                        className="w-full group"
                      >
                        <div className="relative rounded-lg overflow-hidden aspect-[3/4] border-2 border-emerald-500">
                          <img
                            src={previewCreator.proofOfResidenceUrl}
                            alt="Proof"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Icons.Eye size={20} className="text-white" />
                          </div>
                        </div>
                      </button>
                    ) : (
                      <div className="w-full aspect-[3/4] rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600">
                        <Icons.Home size={24} className="text-slate-400" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Channel Information */}
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Icons.Video size={18} className="text-emerald-500" />
                Channel Information
              </h4>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Channel Name</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {previewCreator.channelName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Channel Status</p>
                    <Badge
                      variant={previewCreator.channelStatus === "active" ? "success" : "danger"}
                    >
                      {previewCreator.channelStatus}
                    </Badge>
                  </div>
                </div>
                {previewCreator.channelStatus === "deactivated" && previewCreator.channelDeactivationComment && (
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Deactivation Reason</p>
                    <p className="text-sm text-slate-900 dark:text-white bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                      {previewCreator.channelDeactivationComment}
                    </p>
                  </div>
                )}
              </div>
            </div>


            {/* Admin Actions */}
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Icons.Settings size={18} className="text-emerald-500" />
                Admin Actions
              </h4>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={previewCreator.channelStatus === "deactivated" ? "primary" : "danger"}
                    size="sm"
                    className={previewCreator.channelStatus === "deactivated" ? "" : ""}
                    onClick={() => {
                      setDeactivationComment("");
                      setShowDeactivateModal(true);
                    }}
                  >
                    <Icons.Unlock size={14} className="mr-1" />
                    {previewCreator.channelStatus === "active" ? "Deactivate Channel" : "Activate Channel"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                    onClick={() => onPayout && onPayout(previewCreator)}
                    disabled={previewCreator.currentBalance <= 0}
                  >
                    <Icons.DollarSign size={14} className="mr-1" />
                    Process Payout
                  </Button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button variant="secondary" onClick={() => setPreviewCreator(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Image/Video Preview Modal */}
      <Modal
        isOpen={!!imagePreview}
        onClose={() => setImagePreview(null)}
        title={imagePreview?.endsWith('.mp4') || imagePreview?.includes('video') ? "Channel Trailer" : ""}
        size="md"
        showClose={false}
      >
        {imagePreview && (
          <div className="relative">
            <button
              onClick={() => setImagePreview(null)}
              className="absolute -top-2 -right-2 z-10 h-8 w-8 bg-white dark:bg-slate-800 rounded-full shadow-lg flex items-center justify-center text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              <Icons.X size={20} />
            </button>
            {imagePreview.endsWith('.mp4') || imagePreview.includes('video') ? (
              <video
                src={imagePreview}
                controls
                autoPlay
                className="w-full max-h-[60vh] rounded-lg"
              />
            ) : (
              <img
                src={imagePreview}
                alt="Profile Preview"
                className="w-full max-h-[60vh] object-contain rounded-lg"
              />
            )}
          </div>
        )}
      </Modal>

      {/* Deactivate Channel Modal */}
      <Modal
        isOpen={showDeactivateModal}
        onClose={() => setShowDeactivateModal(false)}
        title={previewCreator?.channelStatus === "active" ? "Deactivate Channel" : "Activate Channel"}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {previewCreator?.channelStatus === "active"
              ? `Are you sure you want to deactivate the channel "${previewCreator?.channelName}"?`
              : `Are you sure you want to activate the channel "${previewCreator?.channelName}"?`}
          </p>
          {previewCreator?.channelStatus === "active" && (
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                Comment (optional)
              </label>
              <textarea
                value={deactivationComment}
                onChange={(e) => setDeactivationComment(e.target.value)}
                placeholder="Add a reason for deactivation..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                rows={3}
              />
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowDeactivateModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant={previewCreator?.channelStatus === "active" ? "danger" : "primary"}
              size="sm"
              onClick={() => {
                if (previewCreator) {
                  onDeactivateChannel && onDeactivateChannel(previewCreator);
                  setShowDeactivateModal(false);
                  setPreviewCreator(null);
                }
              }}
            >
              {previewCreator?.channelStatus === "active" ? "Deactivate" : "Activate"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
